
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type Webhook = Database['public']['Tables']['webhooks']['Row'];
export type WebhookDelivery = Database['public']['Tables']['webhook_deliveries']['Row'];

export const createWebhook = async (
  name: string, 
  url: string, 
  events: string[] = ['qr_scan'],
  teamId?: string
): Promise<Webhook | null> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Generate a random secret for webhook verification
  const secret = crypto.getRandomValues(new Uint8Array(32))
    .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');

  try {
    const { data, error } = await supabase
      .from('webhooks')
      .insert([{
        name,
        url,
        events,
        secret,
        user_id: user.id,
        team_id: teamId || null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating webhook:', error);
    return null;
  }
};

export const fetchUserWebhooks = async (): Promise<Webhook[]> => {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return [];
  }
};

export const updateWebhook = async (id: string, updates: Partial<Webhook>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating webhook:', error);
    return false;
  }
};

export const deleteWebhook = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return false;
  }
};

export const fetchWebhookDeliveries = async (webhookId: string): Promise<WebhookDelivery[]> => {
  try {
    const { data, error } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching webhook deliveries:', error);
    return [];
  }
};

// Trigger webhook for QR scan events
export const triggerWebhookEvent = async (eventType: string, payload: any): Promise<void> => {
  try {
    await supabase.functions.invoke('trigger-webhooks', {
      body: { eventType, payload }
    });
  } catch (error) {
    console.error('Error triggering webhook event:', error);
  }
};
