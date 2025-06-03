
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
    // Get short code from query parameter instead of pathname
    const shortCode = url.searchParams.get('code');

    console.log('Received request for short code:', shortCode);

    if (!shortCode) {
      console.log('No short code provided in request');
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
      console.log('Searching for short code:', shortCode);
      
      // Let's also check if the code exists but is inactive
      const { data: inactiveCode } = await supabase
        .from('dynamic_qr_codes')
        .select('*')
        .eq('short_code', shortCode)
        .single();
        
      if (inactiveCode && !inactiveCode.active) {
        console.log('QR code found but is inactive:', inactiveCode.id);
        return new Response(
          JSON.stringify({ error: 'QR code is paused' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'QR code not found or inactive' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Found QR code:', qrCode.id, 'redirecting to:', qrCode.target_url);

    // Prepare scan data
    const scanData: any = {
      dynamic_qr_code_id: qrCode.id,
      user_agent: req.headers.get('user-agent') || null,
      referrer: req.headers.get('referer') || null,
      scanned_at: new Date().toISOString(),
    };

    // Try to get IP and location info
    try {
      // Get IP from various headers
      const forwardedFor = req.headers.get('x-forwarded-for');
      const realIp = req.headers.get('x-real-ip');
      const cfConnectingIp = req.headers.get('cf-connecting-ip');
      
      const ip = forwardedFor?.split(',')[0] || realIp || cfConnectingIp || null;
      
      console.log('Detected IP:', ip);
      
      if (ip && ip !== '127.0.0.1' && ip !== 'localhost') {
        scanData.ip_address = ip;
        
        // Try to get geolocation using a free service
        try {
          const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,lat,lon`, {
            timeout: 9000, // 9 second timeout
          });
          
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            console.log('Geo data received:', geoData);
            
            if (geoData.status === 'success') {
              scanData.country = geoData.country || null;
              scanData.city = geoData.city || null;
              scanData.latitude = geoData.lat || null;
              scanData.longitude = geoData.lon || null;
            }
          } else {
            console.log('Geo API response not ok:', geoResponse.status);
          }
        } catch (geoError) {
          console.log('Error getting geolocation (non-blocking):', geoError);
        }
      } else {
        console.log('IP not suitable for geolocation:', ip);
      }
    } catch (ipError) {
      console.log('Error processing IP data (non-blocking):', ipError);
    }

    console.log('Preparing to insert scan data:', scanData);

    // Insert scan record
    const { data: insertedScan, error: scanError } = await supabase
      .from('dynamic_qr_scans')
      .insert([scanData])
      .select()
      .single();

    if (scanError) {
      console.error('Error recording scan:', scanError);
      console.error('Scan data that failed:', scanData);
    } else {
      console.log('Scan recorded successfully:', insertedScan?.id);
    }

    // Redirect to the target URL regardless of scan recording success
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
