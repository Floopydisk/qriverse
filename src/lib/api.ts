import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  updated_at?: string;
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
  scan_count: number | null;
  active: boolean | null;
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
  location: object | null;
  device: object | null;
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

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching QR codes:", error);
    return [];
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
      .insert([{ ...qrCodeData, user_id: user.id }])
      .select('*')
      .single();

    if (error) {
      console.error("Error creating QR code:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error creating QR code:", error);
    return null;
  }
};

// Function to update an existing QR code
export const updateQRCode = async (id: string, updates: Partial<QRCode>): Promise<QRCode | null> => {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error("Error updating QR code:", error.message);
      return null;
    }

    return data;
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
      .from('scan_stats')
      .select('*')
      .eq('qr_code_id', qrCodeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching QR code scan stats:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching QR code scan stats:", error);
    return [];
  }
};

// Function to fetch QR codes in a specific folder
export const fetchQRCodesInFolder = async (folderId: string) => {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  } catch (error) {
    console.error('Error fetching QR codes in folder:', error);
    throw error;
  }
};
