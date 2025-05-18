
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Create Supabase client
const supabaseUrl = 'https://kienjbeckgfsajjxjqhs.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Set up CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const shortCode = url.pathname.split('/').pop();

    if (!shortCode) {
      return new Response(
        JSON.stringify({ error: 'No short code provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Retrieve the dynamic QR code by short code
    const { data: qrCode, error: qrCodeError } = await supabase
      .from('dynamic_qr_codes')
      .select('*')
      .eq('short_code', shortCode)
      .eq('active', true)
      .single();

    if (qrCodeError || !qrCode) {
      console.error('Error retrieving QR code:', qrCodeError);
      return new Response(
        JSON.stringify({ error: 'QR code not found or inactive' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Record scan statistics (non-blocking)
    const scanData = {
      dynamic_qr_code_id: qrCode.id,
      user_agent: req.headers.get('user-agent') || null,
      referrer: req.headers.get('referer') || null,
    };

    // Try to get IP and location info
    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || null;
      scanData.ip_address = ip;
      
      if (ip) {
        // Only try to get geolocation if we have an IP
        const geoResponse = await fetch(`https://ipinfo.io/${ip}/json`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          scanData.country = geoData.country || null;
          scanData.city = geoData.city || null;
          
          // Parse loc string (lat,lng) if available
          if (geoData.loc) {
            const [lat, lng] = geoData.loc.split(',');
            scanData.latitude = parseFloat(lat);
            scanData.longitude = parseFloat(lng);
          }
        }
      }
    } catch (geoError) {
      // Log but don't fail if geolocation fails
      console.error('Error getting geolocation:', geoError);
    }

    // Insert scan record
    const { error: scanError } = await supabase
      .from('dynamic_qr_scans')
      .insert([scanData]);

    if (scanError) {
      console.error('Error recording scan:', scanError);
      // Continue with redirect even if scan recording fails
    }

    // Redirect to the target URL
    return new Response(null, {
      status: 302,
      headers: {
        'Location': qrCode.target_url,
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
