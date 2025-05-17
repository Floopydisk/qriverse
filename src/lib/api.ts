
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface QRCode {
  id: string;
  name: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
  options: Json;
  folder_id: string | null;
  user_id: string;
  scan_count?: number;
}

export interface Folder {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// QR Code functions
export const fetchUserQRCodes = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Fetch scan counts for each QR code
  const qrCodesWithScans = await Promise.all(data.map(async (qrCode) => {
    const scanCount = await fetchQRCodeScanCount(qrCode.id);
    return {
      ...qrCode,
      scan_count: scanCount
    };
  }));
  
  return qrCodesWithScans;
};

export const fetchQRCode = async (id: string) => {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createQRCode = async (qrCode: Omit<QRCode, 'id' | 'created_at' | 'updated_at'>) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('qr_codes')
    .insert([qrCode])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateQRCode = async (id: string, updates: Partial<QRCode>) => {
  const { data, error } = await supabase
    .from('qr_codes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteQRCode = async (id: string) => {
  const { error } = await supabase
    .from('qr_codes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Folder functions
export const fetchUserFolders = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.user.id)
    .order('name');
  
  if (error) throw error;
  return data;
};

export const createFolder = async (name: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('folders')
    .insert([{ 
      name, 
      user_id: user.user.id 
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateFolder = async (id: string, name: string) => {
  const { data, error } = await supabase
    .from('folders')
    .update({ name })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteFolder = async (id: string) => {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const fetchQRCodesInFolder = async (folderId: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('folder_id', folderId)
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Fetch scan counts for each QR code
  const qrCodesWithScans = await Promise.all(data.map(async (qrCode) => {
    const scanCount = await fetchQRCodeScanCount(qrCode.id);
    return {
      ...qrCode,
      scan_count: scanCount
    };
  }));
  
  return qrCodesWithScans;
};

// User profile
export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: { username?: string, full_name?: string, avatar_url?: string }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Create storage bucket for QR code images if it doesn't exist
export const ensureQRCodeStorageBucket = async () => {
  try {
    const { error: getBucketError } = await supabase.storage.getBucket('qrcodes');
    
    if (getBucketError && getBucketError.message.includes('does not exist')) {
      const { error: createBucketError } = await supabase.storage.createBucket('qrcodes', {
        public: true
      });
      
      if (createBucketError) throw createBucketError;
    }
    
    return true;
  } catch (error) {
    console.error("Error ensuring QR code storage bucket:", error);
    return false;
  }
};

// Scan tracking functions
export const recordQRCodeScan = async (qrCodeId: string) => {
  try {
    const { error } = await supabase
      .from('qr_scans')
      .insert([{
        qr_code_id: qrCodeId,
      }]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error recording QR code scan:", error);
    return false;
  }
};

export const fetchQRCodeScanCount = async (qrCodeId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('qr_scans')
      .select('*', { count: 'exact', head: true })
      .eq('qr_code_id', qrCodeId);
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error fetching QR code scan count:", error);
    return 0;
  }
};

// Function to get scan history data
export const fetchQRCodeScanStats = async (qrCodeId: string) => {
  try {
    const { data, error } = await supabase
      .from('qr_scans')
      .select('created_at, country, user_agent')
      .eq('qr_code_id', qrCodeId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching QR code scan stats:", error);
    return [];
  }
};
