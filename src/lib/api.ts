
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  updated_at?: string;
  username?: string;
}

export interface QRCode {
  id: string;
  created_at: string;
  name: string;
  type: string;
  content: string;
  user_id: string;
  options: object | null;
  folder_id: string | null;
  scan_count: number;
  active: boolean;
  updated_at?: string;
}

export interface Folder {
  id: string;
  created_at: string;
  name: string;
  user_id: string;
}

export interface ScanStat {
  id: string;
  created_at: string;
  qr_code_id: string;
  country?: string;
  user_agent?: string;
  location?: object | null;
  device?: object | null;
}

export interface DynamicQRCode {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  target_url: string;
  short_code: string;
  active: boolean;
  scan_count?: number;
  qr_image_path?: string;
}

export interface DynamicQRScan {
  id: string;
  dynamic_qr_code_id: string;
  scanned_at: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  ip_address?: string;
  referrer?: string;
  user_agent?: string;
}

// Function to fetch the current user's profile
export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return null;
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error.message);
      return null;
    }

    return {
      id: profile.id,
      email: user.email || '',
      full_name: profile.full_name || '',
      avatar_url: profile.avatar_url || '',
      updated_at: profile.updated_at || null,
      username: profile.username || '',
    };
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return null;
  }
};

// Function to update the current user's profile
export const updateUserProfile = async (updates: { full_name?: string; avatar_url?: string }): Promise<UserProfile | null> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return null;
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('*')
      .single();

    if (error) {
      console.error("Error updating user profile:", error.message);
      return null;
    }

    return {
      id: profile.id,
      email: user.email || '',
      full_name: profile.full_name || '',
      avatar_url: profile.avatar_url || '',
      updated_at: profile.updated_at || null,
      username: profile.username || '',
    };
  } catch (error) {
    console.error("Unexpected error updating user profile:", error);
    return null;
  }
};

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

    return data.map(item => ({
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      name: item.name,
      type: item.type,
      content: item.content,
      user_id: item.user_id,
      options: item.options || null,
      folder_id: item.folder_id || null,
      scan_count: item.scan_count || 0,
      active: item.active === null ? true : item.active
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

    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      name: data.name,
      type: data.type,
      content: data.content,
      user_id: data.user_id,
      options: data.options || null,
      folder_id: data.folder_id || null,
      scan_count: data.scan_count || 0,
      active: data.active === null ? true : data.active
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
        options: qrCodeData.options || null,
        folder_id: qrCodeData.folder_id || null,
        scan_count: qrCodeData.scan_count || 0,
        active: qrCodeData.active === undefined ? true : qrCodeData.active,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating QR code:", error.message);
      return null;
    }

    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      name: data.name,
      type: data.type,
      content: data.content,
      user_id: data.user_id,
      options: data.options || null,
      folder_id: data.folder_id || null,
      scan_count: data.scan_count || 0,
      active: data.active === null ? true : data.active
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
    if (updates.scan_count !== undefined) updateData.scan_count = updates.scan_count;
    if (updates.active !== undefined) updateData.active = updates.active;
    
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

    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      name: data.name,
      type: data.type,
      content: data.content,
      user_id: data.user_id,
      options: data.options || null,
      folder_id: data.folder_id || null,
      scan_count: data.scan_count || 0,
      active: data.active === null ? true : data.active
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

// Function to fetch all folders for the current user
export const fetchUserFolders = async (): Promise<Folder[]> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching folders:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching folders:", error);
    return [];
  }
};

// Function to create a new folder
export const createFolder = async (name: string): Promise<Folder | null> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('folders')
      .insert([{ name: name, user_id: user.id }])
      .select('*')
      .single();

    if (error) {
      console.error("Error creating folder:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error creating folder:", error);
    return null;
  }
};

// Function to update an existing folder
export const updateFolder = async (id: string, name: string): Promise<Folder | null> => {
  try {
    const { data, error } = await supabase
      .from('folders')
      .update({ name: name })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error("Error updating folder:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error updating folder:", error);
    return null;
  }
};

// Function to delete a folder
export const deleteFolder = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting folder:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting folder:", error);
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
    
    return data.map(item => ({
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      name: item.name,
      type: item.type,
      content: item.content,
      user_id: item.user_id,
      options: item.options || null,
      folder_id: item.folder_id || null,
      scan_count: item.scan_count || 0,
      active: item.active === null ? true : item.active
    }));
  } catch (error) {
    console.error('Error fetching QR codes in folder:', error);
    throw error;
  }
};

// Dynamic QR Code Functions

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
      .select('*, dynamic_qr_scans(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching dynamic QR codes:", error.message);
      return [];
    }

    return data.map((item: any) => ({
      ...item,
      scan_count: item.dynamic_qr_scans?.[0]?.count || 0
    })) || [];
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
    const { data, error } = await supabase
      .from('dynamic_qr_codes')
      .select('*, dynamic_qr_scans(count)')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching dynamic QR code:", error.message);
      return null;
    }

    return {
      ...data,
      scan_count: data.dynamic_qr_scans?.[0]?.count || 0
    };
  } catch (error) {
    console.error("Unexpected error fetching dynamic QR code:", error);
    return null;
  }
};

// Function to fetch scan stats for a dynamic QR code
export const fetchDynamicQRCodeScanStats = async (qrCodeId: string) => {
  try {
    const { data: rawScans, error: scansError } = await supabase
      .from('dynamic_qr_scans')
      .select('*')
      .eq('dynamic_qr_code_id', qrCodeId)
      .order('scanned_at', { ascending: false });

    if (scansError) throw new Error(scansError.message);

    // Process the raw scan data to extract statistics
    const scansByDate: Record<string, number> = {};
    const scansByCountry: Record<string, number> = {};
    let totalScans = 0;

    if (rawScans && rawScans.length > 0) {
      totalScans = rawScans.length;

      // Process scans by date
      rawScans.forEach((scan) => {
        const date = new Date(scan.scanned_at).toISOString().split('T')[0];
        scansByDate[date] = (scansByDate[date] || 0) + 1;

        // Process scans by country
        if (scan.country) {
          const country = scan.country;
          scansByCountry[country] = (scansByCountry[country] || 0) + 1;
        }
      });
    }

    return {
      totalScans,
      scansByDate,
      scansByCountry,
      rawScans: rawScans || []
    };
  } catch (error) {
    console.error('Error fetching scan stats for dynamic QR code:', error);
    throw error;
  }
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

// Function to get the redirect URL for a dynamic QR code
export const getDynamicQRRedirectUrl = (shortCode: string): string => {
  // This should be replaced with the actual URL of your deployed edge function
  return `https://kienjbeckgfsajjxjqhs.supabase.co/functions/v1/dynamic-qr?code=${shortCode}`;
};
