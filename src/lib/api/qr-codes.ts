
import { supabase } from "@/integrations/supabase/client";
import { QRCode, ScanStat } from "./types";

// Function to fetch all QR codes for the current user
export const fetchUserQRCodes = async (): Promise<QRCode[]> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching QR codes:", error.message);
      return [];
    }

    if (!data) return [];

    return data.map(item => ({
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      name: item.name,
      type: item.type,
      content: item.content,
      user_id: item.user_id,
      options: typeof item.options === 'object' ? item.options : {},
      folder_id: item.folder_id || null,
      scan_count: 0, // Default value as this isn't in the database
      active: true   // Default value as this isn't in the database
    }));
  } catch (error) {
    console.error("Unexpected error fetching QR codes:", error);
    return [];
  }
};

// Function to fetch a single QR code
export const fetchQRCode = async (id: string): Promise<QRCode | null> => {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching QR code:", error.message);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      name: data.name,
      type: data.type,
      content: data.content,
      user_id: data.user_id,
      options: typeof data.options === 'object' ? data.options : {},
      folder_id: data.folder_id || null,
      scan_count: 0, // Default value as this isn't in the database
      active: true   // Default value as this isn't in the database
    };
  } catch (error) {
    console.error("Unexpected error fetching QR code:", error);
    return null;
  }
};

// Function to create a new QR code
export const createQRCode = async (qrCodeData: Omit<QRCode, 'id' | 'created_at' | 'user_id'>): Promise<QRCode | null> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .insert([{
        name: qrCodeData.name,
        type: qrCodeData.type,
        content: qrCodeData.content,
        options: qrCodeData.options || {},
        folder_id: qrCodeData.folder_id || null,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating QR code:", error.message);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      name: data.name,
      type: data.type,
      content: data.content,
      user_id: data.user_id,
      options: typeof data.options === 'object' ? data.options : {},
      folder_id: data.folder_id || null,
      scan_count: 0, // Default value as this isn't in the database
      active: true   // Default value as this isn't in the database
    };
  } catch (error) {
    console.error("Unexpected error creating QR code:", error);
    return null;
  }
};

// Function to update an existing QR code
export const updateQRCode = async (id: string, updates: Partial<Omit<QRCode, 'id' | 'created_at' | 'user_id'>>): Promise<QRCode | null> => {
  try {
    const updateData: any = {};
    
    // Only include fields that are provided in updates
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.options !== undefined) updateData.options = updates.options;
    if (updates.folder_id !== undefined) updateData.folder_id = updates.folder_id;
    
    const { data, error } = await supabase
      .from('qr_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating QR code:", error.message);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      name: data.name,
      type: data.type,
      content: data.content,
      user_id: data.user_id,
      options: typeof data.options === 'object' ? data.options : {},
      folder_id: data.folder_id || null,
      scan_count: 0, // Default value as this isn't in the database
      active: true   // Default value as this isn't in the database
    };
  } catch (error) {
    console.error("Unexpected error updating QR code:", error);
    return null;
  }
};

// Function to delete a QR code
export const deleteQRCode = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting QR code:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting QR code:", error);
    return false;
  }
};

// Function to move a QR code to a folder
export const moveQRCodeToFolder = async (qrCodeId: string, folderId: string | null): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('qr_codes')
      .update({ folder_id: folderId })
      .eq('id', qrCodeId);

    if (error) {
      console.error("Error moving QR code to folder:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error moving QR code to folder:", error);
    return false;
  }
};

// Function to fetch scan stats for a QR code
export const fetchQRCodeScanStats = async (qrCodeId: string): Promise<ScanStat[]> => {
  try {
    const { data, error } = await supabase
      .from('qr_scans')
      .select('*')
      .eq('qr_code_id', qrCodeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching QR code scan stats:", error.message);
      return [];
    }

    if (!data) return [];

    return data.map(scan => ({
      id: scan.id,
      created_at: scan.created_at,
      qr_code_id: scan.qr_code_id,
      country: scan.country,
      user_agent: scan.user_agent,
      location: null,
      device: null
    }));
  } catch (error) {
    console.error("Unexpected error fetching QR code scan stats:", error);
    return [];
  }
};

// Function to fetch QR codes in a specific folder
export const fetchQRCodesInFolder = async (folderId: string): Promise<QRCode[]> => {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    if (!data) return [];
    
    return data.map(item => ({
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      name: item.name,
      type: item.type,
      content: item.content,
      user_id: item.user_id,
      options: typeof item.options === 'object' ? item.options : {},
      folder_id: item.folder_id || null,
      scan_count: 0, // Default value as this isn't in the database
      active: true   // Default value as this isn't in the database
    }));
  } catch (error) {
    console.error('Error fetching QR codes in folder:', error);
    throw error;
  }
};
