import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { createHmac } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookEvent {
  event_type: string;
  data: any;
  user_id?: string;
  team_id?: string;
}

interface Webhook {
  id: string;
  user_id: string;
  team_id?: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  retry_count: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body: WebhookEvent = await req.json();
    const { event_type, data, user_id, team_id } = body;

    if (!event_type || !data) {
      return new Response(JSON.stringify({ error: 'Missing event_type or data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Find relevant webhooks
    let webhooksQuery = supabase
      .from('webhooks')
      .select('*')
      .eq('active', true)
      .contains('events', [event_type]);

    if (user_id) {
      webhooksQuery = webhooksQuery.eq('user_id', user_id);
    }

    if (team_id) {
      webhooksQuery = webhooksQuery.or(`team_id.eq.${team_id},user_id.eq.${user_id}`);
    }

    const { data: webhooks, error: webhooksError } = await webhooksQuery;

    if (webhooksError) {
      console.error('Error fetching webhooks:', webhooksError);
      return new Response(JSON.stringify({ error: 'Failed to fetch webhooks' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!webhooks || webhooks.length === 0) {
      return new Response(JSON.stringify({ message: 'No webhooks found for this event' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Trigger webhooks in parallel
    const webhookPromises = webhooks.map(webhook => triggerWebhook(supabase, webhook, event_type, data));
    const results = await Promise.allSettled(webhookPromises);

    const deliveryResults = results.map((result, index) => ({
      webhook_id: webhooks[index].id,
      webhook_url: webhooks[index].url,
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason : null
    }));

    return new Response(JSON.stringify({ 
      message: 'Webhooks triggered',
      results: deliveryResults
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in webhook trigger:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function triggerWebhook(
  supabase: any,
  webhook: Webhook,
  eventType: string,
  eventData: any
): Promise<void> {
  const payload = {
    event_type: eventType,
    data: eventData,
    timestamp: new Date().toISOString(),
    webhook_id: webhook.id
  };

  const payloadString = JSON.stringify(payload);
  
  // Generate signature
  const signature = await generateSignature(payloadString, webhook.secret);

  let statusCode = 0;
  let responseBody = '';
  let deliveredAt: string | null = null;

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': eventType,
        'User-Agent': 'QRLabs-Webhooks/1.0'
      },
      body: payloadString
    });

    statusCode = response.status;
    responseBody = await response.text();
    
    if (response.ok) {
      deliveredAt = new Date().toISOString();
    }

  } catch (error) {
    console.error(`Webhook delivery failed for ${webhook.url}:`, error);
    statusCode = 0;
    responseBody = error.message;
  }

  // Log the delivery attempt
  try {
    await supabase
      .from('webhook_deliveries')
      .insert({
        webhook_id: webhook.id,
        event_type: eventType,
        payload: payload,
        status_code: statusCode,
        response_body: responseBody,
        delivered_at: deliveredAt,
        retry_count: 0
      });
  } catch (logError) {
    console.error('Failed to log webhook delivery:', logError);
  }

  // If delivery failed and we have retries left, schedule retry
  if (!deliveredAt && webhook.retry_count > 0) {
    // In a production environment, you might want to use a queue system
    // For now, we'll just log that a retry would be scheduled
    console.log(`Webhook delivery failed, would schedule retry for ${webhook.url}`);
  }
}

async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secret);
  const payloadBytes = encoder.encode(payload);
  
  const hmac = await createHmac('sha256', secretBytes).update(payloadBytes).digest();
  const signature = Array.from(new Uint8Array(hmac))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  return `sha256=${signature}`;
}