/* eslint-disable @typescript-eslint/no-explicit-any */
// If running in Deno, ensure your editor supports Deno and has Deno types enabled.
// If running in Node.js, replace with a Node.js HTTP server, e.g.:
// import { createServer } from "http";
// Otherwise, for Deno:
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookEvent {
  eventType: string;
  payload: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventType, payload }: WebhookEvent = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active webhooks that listen to this event type
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('active', true)
      .contains('events', [eventType]);

    if (error) {
      console.error("Error fetching webhooks:", error);
      throw error;
    }

    // Trigger each webhook
    const deliveryPromises = webhooks?.map(async (webhook) => {
      try {
        const webhookPayload = {
          event: eventType,
          timestamp: new Date().toISOString(),
          data: payload,
        };

        // Create signature for webhook verification
        const signature = await createSignature(JSON.stringify(webhookPayload), webhook.secret);

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-QR-Labs-Signature': signature,
            'X-QR-Labs-Event': eventType,
          },
          body: JSON.stringify(webhookPayload),
        });

        // Log the delivery
        await supabase
          .from('webhook_deliveries')
          .insert([{
            webhook_id: webhook.id,
            event_type: eventType,
            payload: webhookPayload,
            status_code: response.status,
            response_body: await response.text(),
            delivered_at: new Date().toISOString(),
            retry_count: 0,
          }]);

        return { webhookId: webhook.id, success: true, status: response.status };
      } catch (error) {
        console.error(`Error delivering webhook ${webhook.id}:`, error);
        
        // Log failed delivery
        await supabase
          .from('webhook_deliveries')
          .insert([{
            webhook_id: webhook.id,
            event_type: eventType,
            payload: { event: eventType, data: payload },
            status_code: null,
            response_body: error.message,
            delivered_at: null,
            retry_count: 0,
          }]);

        return { webhookId: webhook.id, success: false, error: error.message };
      }
    }) || [];

    const results = await Promise.all(deliveryPromises);

    return new Response(JSON.stringify({
      message: "Webhooks triggered",
      results,
      total: webhooks?.length || 0,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in trigger-webhooks function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

async function createSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const payloadData = encoder.encode(payload);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, payloadData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `sha256=${hashHex}`;
}

serve(handler);
