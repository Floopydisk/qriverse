
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface QRCode {
  id: string;
  created_at: string;
  name: string;
  content: string;
  type: string;
  options: Json | null;
  user_id: string;
  folder_id: string | null;
  scan_count?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchUserQRCodes(): Promise<QRCode[]> {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    throw new Error('Failed to fetch QR codes');
  }
}

export async function fetchQRCode(id: string): Promise<QRCode | null> {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching QR code:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching QR code:', error);
    return null;
  }
}

export async function createQRCode(qrCode: Omit<QRCode, 'id' | 'created_at'>): Promise<QRCode> {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .insert([qrCode])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating QR code:', error);
    throw new Error('Failed to create QR code');
  }
}

export async function updateQRCode(id: string, updates: Partial<QRCode>): Promise<QRCode> {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating QR code:', error);
    throw new Error('Failed to update QR code');
  }
}

export async function deleteQRCode(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting QR code:', error);
    throw new Error('Failed to delete QR code');
  }
}

export async function ensureQRCodeStorageBucket() {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;

    const bucketExists = buckets.some(bucket => bucket.name === 'qrcodes');

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket('qrcodes', {
        public: true,
      });

      if (createError) {
        console.error('Error creating storage bucket:', createError);
        throw createError;
      } else {
        console.log('Storage bucket created successfully.');
      }
    } else {
      console.log('Storage bucket already exists.');
    }
  } catch (error) {
    console.error('Error ensuring storage bucket:', error);
    throw new Error('Failed to ensure storage bucket exists');
  }
}

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export async function fetchUserFolders(): Promise<Folder[]> {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching folders:', error);
    throw new Error('Failed to fetch folders');
  }
}

export async function fetchFolder(folderId: string): Promise<Folder> {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Folder not found');
    return data;
  } catch (error) {
    console.error('Error fetching folder:', error);
    throw new Error('Failed to fetch folder');
  }
}

export async function createFolder(name: string): Promise<Folder> {
  try {
    const { error: userError, data: userData } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data, error } = await supabase
      .from('folders')
      .insert({
        name,
        user_id: userData.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create folder');
    return data;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw new Error('Failed to create folder');
  }
}

export async function updateFolder(id: string, name: string): Promise<Folder> {
  try {
    const { data, error } = await supabase
      .from('folders')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Folder not found');
    return data;
  } catch (error) {
    console.error('Error updating folder:', error);
    throw new Error('Failed to update folder');
  }
}

export async function deleteFolder(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw new Error('Failed to delete folder');
  }
}

export async function fetchQRCodesInFolder(folderId: string): Promise<QRCode[]> {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching QR codes in folder:', error);
    throw new Error('Failed to fetch QR codes');
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

export interface QRScanCount {
  qr_code_id: string;
  total_scans: number;
}

export async function logQRCodeScan(qrCodeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('qr_scans')
      .insert({
        qr_code_id: qrCodeId,
        scanned_at: new Date().toISOString(),
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging QR code scan:', error);
    return false;
  }
}

export async function fetchQRCodeScans(qrCodeId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('qr_scans')
      .select('*', { count: 'exact', head: true })
      .eq('qr_code_id', qrCodeId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching QR code scans:', error);
    return 0;
  }
}

export async function fetchAllQRCodeScans(userId: string): Promise<QRScanCount[]> {
  try {
    // First get all QR codes belonging to this user
    const { data: userQRCodes, error: qrError } = await supabase
      .from('qr_codes')
      .select('id')
      .eq('user_id', userId);

    if (qrError) throw qrError;
    
    if (!userQRCodes || userQRCodes.length === 0) {
      return [];
    }

    // Get scan counts for each QR code
    const qrCodeIds = userQRCodes.map(qr => qr.id);
    
    const { data, error } = await supabase
      .rpc('get_qr_scan_counts', { qr_ids: qrCodeIds });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching all QR code scans:', error);
    return [];
  }
}
