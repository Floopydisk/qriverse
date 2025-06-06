
import { supabase } from "@/integrations/supabase/client";
import { DynamicQRCode, DynamicQRScan } from "./types";

// Function to fetch all dynamic QR codes for the current user
export const fetchUserDynamicQRCodes = async (): Promise<DynamicQRCode[]> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('dynamic_qr_codes')
      .select(`
        *,
        dynamic_qr_scans(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching dynamic QR codes:", error.message);
      return [];
    }

    // Transform the data to include scan_count
    const transformedData = await Promise.all(
      (data || []).map(async (item: any) => {
        // Get the actual scan count
        const { count, error: countError } = await supabase
          .from('dynamic_qr_scans')
          .select('*', { count: 'exact', head: true })
          .eq('dynamic_qr_code_id', item.id);

        if (countError) {
          console.error('Error getting scan count:', countError);
        }

        return {
          ...item,
          scan_count: count || 0
        };
      })
    );

    return transformedData;
  } catch (error) {
    console.error("Unexpected error fetching dynamic QR codes:", error);
    return [];
  }
};

// Function to create a new dynamic QR code
export const createDynamicQRCode = async (name: string, targetUrl: string): Promise<DynamicQRCode | null> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return null;
  }

  try {
    // Generate a short code
    const shortCode = generateShortCode();

    const { data, error } = await supabase
      .from('dynamic_qr_codes')
      .insert([{
        name,
        target_url: targetUrl,
        short_code: shortCode,
        user_id: user.id,
        active: true
      }])
      .select('*')
      .single();

    if (error) {
      console.error("Error creating dynamic QR code:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error creating dynamic QR code:", error);
    return null;
  }
};

// Function to update an existing dynamic QR code
export const updateDynamicQRCode = async (id: string, updates: { name?: string; target_url?: string; active?: boolean }): Promise<DynamicQRCode | null> => {
  try {
    const { data, error } = await supabase
      .from('dynamic_qr_codes')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error("Error updating dynamic QR code:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error updating dynamic QR code:", error);
    return null;
  }
};

// Function to delete a dynamic QR code
export const deleteDynamicQRCode = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('dynamic_qr_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting dynamic QR code:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting dynamic QR code:", error);
    return false;
  }
};

// Function to fetch a specific dynamic QR code
export const fetchDynamicQRCode = async (id: string): Promise<DynamicQRCode | null> => {
  try {
    console.log('=== FETCHING DYNAMIC QR CODE ===');
    console.log('QR Code ID:', id);
    
    const { data, error } = await supabase
      .from('dynamic_qr_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching dynamic QR code:", error.message);
      return null;
    }

    console.log('QR Code found:', data);

    // Get the scan count separately
    const { count, error: countError } = await supabase
      .from('dynamic_qr_scans')
      .select('*', { count: 'exact', head: true })
      .eq('dynamic_qr_code_id', id);

    if (countError) {
      console.error('Error getting scan count:', countError);
    }

    console.log('Scan count:', count);

    return {
      ...data,
      scan_count: count || 0
    };
  } catch (error) {
    console.error("Unexpected error fetching dynamic QR code:", error);
    return null;
  }
};

// Function to fetch scan stats for a dynamic QR code
export const fetchDynamicQRCodeScanStats = async (qrCodeId: string) => {
  try {
    console.log('=== FETCHING SCAN STATS ===');
    console.log('QR Code ID:', qrCodeId);
    
    // First, verify the QR code exists
    const { data: qrCodeCheck, error: qrCodeError } = await supabase
      .from('dynamic_qr_codes')
      .select('id, name, short_code')
      .eq('id', qrCodeId)
      .single();

    if (qrCodeError) {
      console.error('QR Code verification error:', qrCodeError);
      throw new Error(`QR Code not found: ${qrCodeError.message}`);
    }

    console.log('QR Code verified:', qrCodeCheck);
    
    // Fetch all scans for this QR code
    const { data: rawScans, error: scansError } = await supabase
      .from('dynamic_qr_scans')
      .select('*')
      .eq('dynamic_qr_code_id', qrCodeId)
      .order('scanned_at', { ascending: false });

    if (scansError) {
      console.error('Error fetching scans:', scansError);
      throw new Error(`Failed to fetch scans: ${scansError.message}`);
    }

    console.log('Raw scans query result:', {
      count: rawScans?.length || 0,
      firstScan: rawScans?.[0] || null,
      scans: rawScans
    });

    // Initialize the result structure
    let totalScans = 0;
    const scansByDate: Record<string, number> = {};
    const scansByCountry: Record<string, number> = {};

    if (rawScans && rawScans.length > 0) {
      totalScans = rawScans.length;
      console.log('Processing', totalScans, 'scans...');

      // Process each scan
      rawScans.forEach((scan, index) => {
        console.log(`Processing scan ${index + 1}:`, {
          id: scan.id,
          scanned_at: scan.scanned_at,
          country: scan.country,
          city: scan.city,
          ip_address: scan.ip_address,
          dynamic_qr_code_id: scan.dynamic_qr_code_id
        });

        // Process scans by date
        const date = new Date(scan.scanned_at).toISOString().split('T')[0];
        scansByDate[date] = (scansByDate[date] || 0) + 1;
        console.log(`Date ${date}: ${scansByDate[date]} scans`);

        // Process scans by country
        if (scan.country) {
          const country = scan.country;
          scansByCountry[country] = (scansByCountry[country] || 0) + 1;
          console.log(`Country ${country}: ${scansByCountry[country]} scans`);
        } else {
          console.log('Scan has no country data');
        }
      });
    } else {
      console.log('No scans found for this QR code');
    }

    const result = {
      totalScans,
      scansByDate,
      scansByCountry,
      rawScans: rawScans || []
    };

    console.log('Final scan stats result:', {
      totalScans: result.totalScans,
      scansByDateEntries: Object.entries(result.scansByDate),
      scansByCountryEntries: Object.entries(result.scansByCountry),
      rawScansLength: result.rawScans.length
    });

    return result;
  } catch (error) {
    console.error('Error fetching scan stats for dynamic QR code:', error);
    throw error;
  }
};

// Function to get the redirect URL for a dynamic QR code
export const getDynamicQRRedirectUrl = (shortCode: string): string => {
  // This should be replaced with the actual URL of your deployed edge function
  return `https://kienjbeckgfsajjxjqhs.supabase.co/functions/v1/dynamic-qr?code=${shortCode}`;
};

// Helper function to generate a random short code
const generateShortCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 8;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};
