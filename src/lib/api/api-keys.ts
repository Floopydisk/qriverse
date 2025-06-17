
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type ApiKey = Database['public']['Tables']['api_keys']['Row'];
export type ApiUsage = Database['public']['Tables']['api_usage']['Row'];

// Generate a secure API key
export const generateApiKey = (): { key: string; prefix: string; hash: string } => {
  const prefix = 'qr_';
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const key = prefix + Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  
  // Create hash for storage (in real implementation, use proper hashing)
  const hash = btoa(key);
  
  return { key, prefix, hash };
};

export const createApiKey = async (name: string, permissions: string[] = ['read']): Promise<{ apiKey: ApiKey; key: string } | null> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { key, prefix, hash } = generateApiKey();

  try {
    const { data, error } = await supabase
      .from('api_keys')
      .insert([{
        name,
        key_hash: hash,
        key_prefix: prefix,
        permissions,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;

    return { apiKey: data, key };
  } catch (error) {
    console.error('Error creating API key:', error);
    return null;
  }
};

export const fetchUserApiKeys = async (): Promise<ApiKey[]> => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return [];
  }
};

export const deleteApiKey = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting API key:', error);
    return false;
  }
};

export const updateApiKey = async (id: string, updates: Partial<ApiKey>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('api_keys')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating API key:', error);
    return false;
  }
};

export const fetchApiUsage = async (apiKeyId?: string): Promise<ApiUsage[]> => {
  try {
    let query = supabase
      .from('api_usage')
      .select(`
        *,
        api_keys:api_key_id (name)
      `)
      .order('created_at', { ascending: false });

    if (apiKeyId) {
      query = query.eq('api_key_id', apiKeyId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching API usage:', error);
    return [];
  }
};
