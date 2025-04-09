
import { supabase } from '@/integrations/supabase/client';

export interface QRCode {
  id: string;
  name: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
  options: any;
  folder_id: string | null;
}

export interface Folder {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// QR Code functions
export const fetchUserQRCodes = async () => {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
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
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};

export const createFolder = async (name: string) => {
  const { data, error } = await supabase
    .from('folders')
    .insert([{ name }])
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
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('folder_id', folderId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
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
