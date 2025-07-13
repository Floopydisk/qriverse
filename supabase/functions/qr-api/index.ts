import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { createHash } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface ApiKey {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  permissions: string[];
  rate_limit: number;
  active: boolean;
  expires_at?: string;
  last_used_at?: string;
}

interface QRCode {
  id: string;
  name: string;
  type: string;
  content: string;
  options?: any;
  user_id: string;
  folder_id?: string;
  team_id?: string;
  created_at: string;
  updated_at: string;
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

    // Extract API key from headers
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate API key
    const keyPrefix = apiKey.substring(0, 8);
    const keyHash = await hashApiKey(apiKey);

    const { data: apiKeyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_prefix', keyPrefix)
      .eq('key_hash', keyHash)
      .eq('active', true)
      .single();

    if (keyError || !apiKeyData) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if key is expired
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'API key expired' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part);
    
    // Log API usage
    await logApiUsage(supabase, apiKeyData.id, req.method, url.pathname, 200);

    // Route handling
    if (req.method === 'GET' && pathParts.length === 0) {
      // GET /qr-api - List QR codes
      if (!apiKeyData.permissions.includes('read')) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: qrCodes, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', apiKeyData.user_id)
        .order('created_at', { ascending: false });

      if (error) {
        await logApiUsage(supabase, apiKeyData.id, req.method, url.pathname, 500);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ data: qrCodes }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST' && pathParts.length === 0) {
      // POST /qr-api - Create QR code
      if (!apiKeyData.permissions.includes('write')) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const body = await req.json();
      const { name, type, content, options, folder_id, team_id } = body;

      if (!name || !type || !content) {
        await logApiUsage(supabase, apiKeyData.id, req.method, url.pathname, 400);
        return new Response(JSON.stringify({ error: 'Missing required fields: name, type, content' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .insert({
          name,
          type,
          content,
          options: options || {},
          folder_id: folder_id || null,
          team_id: team_id || null,
          user_id: apiKeyData.user_id
        })
        .select()
        .single();

      if (error) {
        await logApiUsage(supabase, apiKeyData.id, req.method, url.pathname, 500);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ data: qrCode }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'GET' && pathParts.length === 1) {
      // GET /qr-api/{id} - Get specific QR code
      if (!apiKeyData.permissions.includes('read')) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const qrCodeId = pathParts[0];
      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', qrCodeId)
        .eq('user_id', apiKeyData.user_id)
        .single();

      if (error || !qrCode) {
        await logApiUsage(supabase, apiKeyData.id, req.method, url.pathname, 404);
        return new Response(JSON.stringify({ error: 'QR code not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ data: qrCode }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'PUT' && pathParts.length === 1) {
      // PUT /qr-api/{id} - Update QR code
      if (!apiKeyData.permissions.includes('write')) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const qrCodeId = pathParts[0];
      const body = await req.json();
      
      // Remove fields that shouldn't be updated via API
      const { id, user_id, created_at, ...updateData } = body;

      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', qrCodeId)
        .eq('user_id', apiKeyData.user_id)
        .select()
        .single();

      if (error) {
        await logApiUsage(supabase, apiKeyData.id, req.method, url.pathname, 500);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!qrCode) {
        await logApiUsage(supabase, apiKeyData.id, req.method, url.pathname, 404);
        return new Response(JSON.stringify({ error: 'QR code not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ data: qrCode }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'DELETE' && pathParts.length === 1) {
      // DELETE /qr-api/{id} - Delete QR code
      if (!apiKeyData.permissions.includes('delete')) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const qrCodeId = pathParts[0];
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', qrCodeId)
        .eq('user_id', apiKeyData.user_id);

      if (error) {
        await logApiUsage(supabase, apiKeyData.id, req.method, url.pathname, 500);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ message: 'QR code deleted successfully' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Route not found
    await logApiUsage(supabase, apiKeyData.id, req.method, url.pathname, 404);
    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in QR API:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await createHash('sha256').update(data).digest();
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function logApiUsage(
  supabase: any,
  apiKeyId: string,
  method: string,
  endpoint: string,
  statusCode: number
) {
  try {
    await supabase
      .from('api_usage')
      .insert({
        api_key_id: apiKeyId,
        method,
        endpoint,
        status_code: statusCode
      });
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}