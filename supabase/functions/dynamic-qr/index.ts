
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
    const shortCode = url.searchParams.get('code');

    console.log('=== DYNAMIC QR SCAN START ===');
    console.log('Received request for short code:', shortCode);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    if (!shortCode) {
      console.log('ERROR: No short code provided in request');
      return new Response(
        JSON.stringify({ error: 'No short code provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Retrieve the dynamic QR code by short code
    console.log('Searching for QR code with short_code:', shortCode);
    const { data: qrCode, error: qrCodeError } = await supabase
      .from('dynamic_qr_codes')
      .select('*')
      .eq('short_code', shortCode)
      .eq('active', true)
      .single();

    if (qrCodeError || !qrCode) {
      console.error('Error retrieving QR code:', qrCodeError);
      
      // Check if the code exists but is inactive
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

    console.log('SUCCESS: Found QR code:', {
      id: qrCode.id,
      name: qrCode.name,
      target_url: qrCode.target_url,
      active: qrCode.active
    });

    // Prepare basic scan data first
    const scanData: any = {
      dynamic_qr_code_id: qrCode.id,
      scanned_at: new Date().toISOString(),
    };

    // Add optional fields if available
    const userAgent = req.headers.get('user-agent');
    const referrer = req.headers.get('referer') || req.headers.get('referrer');
    
    if (userAgent) {
      scanData.user_agent = userAgent;
      console.log('Added user_agent:', userAgent.substring(0, 50) + '...');
    }
    
    if (referrer) {
      scanData.referrer = referrer;
      console.log('Added referrer:', referrer);
    }

    // Try to get IP and location info
    try {
      // Get IP from various headers (common proxy headers)
      const forwardedFor = req.headers.get('x-forwarded-for');
      const realIp = req.headers.get('x-real-ip');
      const cfConnectingIp = req.headers.get('cf-connecting-ip');
      const clientIp = req.headers.get('x-client-ip');
      
      // Try multiple IP sources
      let ip = null;
      if (forwardedFor) {
        ip = forwardedFor.split(',')[0].trim();
      } else if (realIp) {
        ip = realIp;
      } else if (cfConnectingIp) {
        ip = cfConnectingIp;
      } else if (clientIp) {
        ip = clientIp;
      }
      
      console.log('IP detection:', {
        'x-forwarded-for': forwardedFor,
        'x-real-ip': realIp,
        'cf-connecting-ip': cfConnectingIp,
        'x-client-ip': clientIp,
        'selected-ip': ip
      });
      
      if (ip && ip !== '127.0.0.1' && ip !== 'localhost' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
        scanData.ip_address = ip;
        console.log('Using IP for geolocation:', ip);
        
        // Try to get geolocation using ip-api.com (free tier, no key needed)
        try {
          const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,lat,lon`, {
            signal: AbortSignal.timeout(5000), // 5 second timeout
          });
          
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            console.log('Geolocation API response:', geoData);
            
            if (geoData.status === 'success') {
              if (geoData.country) scanData.country = geoData.country;
              if (geoData.city) scanData.city = geoData.city;
              if (geoData.lat) scanData.latitude = parseFloat(geoData.lat);
              if (geoData.lon) scanData.longitude = parseFloat(geoData.lon);
              
              console.log('Successfully added geolocation data:', {
                country: geoData.country,
                city: geoData.city,
                lat: geoData.lat,
                lon: geoData.lon
              });
            } else {
              console.log('Geolocation API returned unsuccessful status:', geoData.status);
            }
          } else {
            console.log('Geolocation API response not ok:', geoResponse.status, geoResponse.statusText);
          }
        } catch (geoError) {
          console.log('Error getting geolocation (non-blocking):', geoError.message);
        }
      } else {
        console.log('IP not suitable for geolocation:', ip);
      }
    } catch (ipError) {
      console.log('Error processing IP data (non-blocking):', ipError.message);
    }

    console.log('Final scan data to insert:', scanData);

    // Insert scan record with better error handling
    const { data: insertedScan, error: scanError } = await supabase
      .from('dynamic_qr_scans')
      .insert([scanData])
      .select()
      .single();

    if (scanError) {
      console.error('ERROR: Failed to record scan:', {
        error: scanError,
        scanData: scanData,
        errorCode: scanError.code,
        errorMessage: scanError.message,
        errorDetails: scanError.details,
        errorHint: scanError.hint
      });
      
      // Still continue with redirect even if scan recording fails
    } else {
      console.log('SUCCESS: Scan recorded with ID:', insertedScan?.id);
      console.log('Inserted scan data:', insertedScan);
    }

    console.log('=== REDIRECTING TO TARGET URL ===');
    console.log('Target URL:', qrCode.target_url);

    // Redirect to the target URL regardless of scan recording success
    return new Response(null, {
      status: 302,
      headers: {
        'Location': qrCode.target_url,
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('FATAL ERROR in dynamic QR function:', {
      error: error,
      message: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
