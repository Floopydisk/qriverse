
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QRCodeRequest {
  name: string;
  type: string;
  content: string;
  options?: Record<string, any>;
  folder_id?: string;
  team_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/qr-api', '');
    const method = req.method;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract and validate API key
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid API key" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const apiKey = authHeader.replace("Bearer ", "");
    
    // Validate API key and get user
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id, active, rate_limit, permissions')
      .eq('key_hash', btoa(apiKey))
      .single();

    if (keyError || !keyData || !keyData.active) {
      return new Response(
        JSON.stringify({ error: "Invalid or inactive API key" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log API usage
    await supabase
      .from('api_usage')
      .insert([{
        api_key_id: keyData.user_id,
        endpoint: path,
        method: method,
        status_code: 200
      }]);

    // Route handling
    if (path === '/qr-codes' && method === 'GET') {
      // List QR codes
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', keyData.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (path === '/qr-codes' && method === 'POST') {
      // Create QR code
      if (!keyData.permissions.includes('write')) {
        return new Response(
          JSON.stringify({ error: "Insufficient permissions" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const body: QRCodeRequest = await req.json();
      
      const { data, error } = await supabase
        .from('qr_codes')
        .insert([{
          ...body,
          user_id: keyData.user_id
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (path.startsWith('/qr-codes/') && method === 'GET') {
      // Get specific QR code
      const qrId = path.split('/')[2];
      
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', qrId)
        .eq('user_id', keyData.user_id)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: "QR code not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (path.startsWith('/qr-codes/') && method === 'PUT') {
      // Update QR code
      if (!keyData.permissions.includes('write')) {
        return new Response(
          JSON.stringify({ error: "Insufficient permissions" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const qrId = path.split('/')[2];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('qr_codes')
        .update(body)
        .eq('id', qrId)
        .eq('user_id', keyData.user_id)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: "QR code not found or update failed" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (path.startsWith('/qr-codes/') && method === 'DELETE') {
      // Delete QR code
      if (!keyData.permissions.includes('delete')) {
        return new Response(
          JSON.stringify({ error: "Insufficient permissions" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const qrId = path.split('/')[2];
      
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', qrId)
        .eq('user_id', keyData.user_id);

      if (error) {
        return new Response(
          JSON.stringify({ error: "QR code not found or deletion failed" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ message: "QR code deleted successfully" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Endpoint not found" }),
      { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in qr-api function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
