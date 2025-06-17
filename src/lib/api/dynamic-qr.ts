
import { supabase } from "@/integrations/supabase/client";
import { DynamicQRCode, DynamicQRScan } from "./types";

// Function to fetch all dynamic QR codes for the current user
export const fetchUserDynamicQRCodes = async (): Promise<DynamicQRCode[]> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    throw new Error("No user session found");
  }

  try {
    // Fetch all QR codes for the user
    const { data: qrCodes, error: qrCodesError } = await supabase
      .from("dynamic_qr_codes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (qrCodesError) {
      throw qrCodesError;
    }

    if (!qrCodes) {
      return [];
    }

    // Get scan counts for each QR code
    const qrCodesWithScans = await Promise.all(
      qrCodes.map(async (qrCode) => {
        const { count, error: countError } = await supabase
          .from("dynamic_qr_scans")
          .select("*", { count: "exact", head: true })
          .eq("dynamic_qr_code_id", qrCode.id);

        if (countError) {
          console.error("Error fetching scan count:", countError);
        }

        return {
          ...qrCode,
          scan_count: count || 0,
        };
      })
    );

    return qrCodesWithScans;
  } catch (error) {
    console.error("Error fetching dynamic QR codes:", error);
    throw error;
  }
};

// Function to create a new dynamic QR code
export const createDynamicQRCode = async (
  name: string,
  targetUrl: string
): Promise<DynamicQRCode | null> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    throw new Error("No user session found");
  }

  try {
    const shortCode = generateShortCode();

    const { data, error } = await supabase
      .from("dynamic_qr_codes")
      .insert([
        {
          name,
          target_url: targetUrl,
          short_code: shortCode,
          user_id: user.id,
          active: true,
        },
      ])
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    // Add scan_count property
    return {
      ...data,
      scan_count: 0,
    };
  } catch (error) {
    console.error("Error creating dynamic QR code:", error);
    throw error;
  }
};

// Function to update an existing dynamic QR code
export const updateDynamicQRCode = async (
  id: string,
  updates: { name?: string; target_url?: string; active?: boolean }
): Promise<DynamicQRCode | null> => {
  try {
    const { data, error } = await supabase
      .from("dynamic_qr_codes")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    // Get scan count
    const { count } = await supabase
      .from("dynamic_qr_scans")
      .select("*", { count: "exact", head: true })
      .eq("dynamic_qr_code_id", id);

    return {
      ...data,
      scan_count: count || 0,
    };
  } catch (error) {
    console.error("Error updating dynamic QR code:", error);
    throw error;
  }
};

// Function to delete a dynamic QR code
export const deleteDynamicQRCode = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("dynamic_qr_codes")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting dynamic QR code:", error);
    return false;
  }
};

// Function to fetch a specific dynamic QR code
export const fetchDynamicQRCode = async (
  id: string
): Promise<DynamicQRCode | null> => {
  try {
    const { data, error } = await supabase
      .from("dynamic_qr_codes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    // Get the scan count
    const { count } = await supabase
      .from("dynamic_qr_scans")
      .select("*", { count: "exact", head: true })
      .eq("dynamic_qr_code_id", id);

    return {
      ...data,
      scan_count: count || 0,
    };
  } catch (error) {
    console.error("Error fetching dynamic QR code:", error);
    throw error;
  }
};

// Function to fetch scan stats for a dynamic QR code
export const fetchDynamicQRCodeScanStats = async (qrCodeId: string) => {
  try {
    // Verify the QR code exists and belongs to the user
    const { data: qrCode, error: qrCodeError } = await supabase
      .from("dynamic_qr_codes")
      .select("id, name, short_code")
      .eq("id", qrCodeId)
      .single();

    if (qrCodeError || !qrCode) {
      throw new Error("QR Code not found or access denied");
    }

    // Fetch all scans for this QR code
    const { data: scans, error: scansError } = await supabase
      .from("dynamic_qr_scans")
      .select("*")
      .eq("dynamic_qr_code_id", qrCodeId)
      .order("scanned_at", { ascending: false });

    if (scansError) {
      throw scansError;
    }

    const rawScans = scans || [];
    const totalScans = rawScans.length;

    // Process scans by date
    const scansByDate: Record<string, number> = {};
    rawScans.forEach((scan) => {
      const date = new Date(scan.scanned_at).toISOString().split("T")[0];
      scansByDate[date] = (scansByDate[date] || 0) + 1;
    });

    // Process scans by country
    const scansByCountry: Record<string, number> = {};
    rawScans.forEach((scan) => {
      if (scan.country) {
        scansByCountry[scan.country] = (scansByCountry[scan.country] || 0) + 1;
      }
    });

    return {
      totalScans,
      scansByDate,
      scansByCountry,
      rawScans,
    };
  } catch (error) {
    console.error("Error fetching scan stats:", error);
    throw error;
  }
};

// Function to get the redirect URL for a dynamic QR code
export const getDynamicQRRedirectUrl = (shortCode: string): string => {
  // Use the actual Supabase URL
  const supabaseUrl = "https://kienjbeckgfsajjxjqhs.supabase.co";
  return `${supabaseUrl}/functions/v1/dynamic-qr?code=${shortCode}`;
};

// Helper function to generate a random short code
const generateShortCode = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const length = 8;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};
