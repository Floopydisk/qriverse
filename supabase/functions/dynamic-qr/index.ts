import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

interface DynamicQRScan {
  dynamic_qr_code_id: string;
  ip_address?: string;
  user_agent?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  referrer?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const shortCode = url.searchParams.get('code');

    if (!shortCode) {
      return new Response('QR code not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the dynamic QR code
    const { data: qrCode, error: qrError } = await supabase
      .from('dynamic_qr_codes')
      .select('*')
      .eq('short_code', shortCode)
      .eq('active', true)
      .single();

    if (qrError || !qrCode) {
      console.error('QR code not found or inactive:', qrError);
      return new Response('QR code not found or inactive', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Extract scan information
    const userAgent = req.headers.get('user-agent') || '';
    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const realIp = req.headers.get('x-real-ip') || '';
    const ip = forwardedFor.split(',')[0] || realIp || 'unknown';
    const referrer = req.headers.get('referer') || '';

    // Get geo-location data (basic implementation)
    let country = null;
    let city = null;
    let latitude = null;
    let longitude = null;

    try {
      // Try to get geo data from IP (you could use a service like ipapi.co)
      if (ip !== 'unknown' && ip !== '127.0.0.1' && !ip.startsWith('192.168.')) {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.status === 'success') {
            country = geoData.country;
            city = geoData.city;
            latitude = geoData.lat;
            longitude = geoData.lon;
          }
        }
      }
    } catch (geoError) {
      console.warn('Failed to get geo data:', geoError);
    }

    // Record the scan in background
    const scanData: DynamicQRScan = {
      dynamic_qr_code_id: qrCode.id,
      ip_address: ip,
      user_agent: userAgent,
      country,
      city,
      latitude,
      longitude,
      referrer: referrer || null,
    };

    // Insert scan record (don't await to avoid blocking the redirect)
    supabase
      .from('dynamic_qr_scans')
      .insert(scanData)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to record scan:', error);
        }
      });

    // Trigger webhooks in background
    supabase.functions
      .invoke('trigger-webhooks', {
        body: {
          event_type: 'qr_scan',
          data: {
            qr_code_id: qrCode.id,
            qr_code_name: qrCode.name,
            target_url: qrCode.target_url,
            scan_data: scanData,
          },
        },
      })
      .then(({ error }) => {
        if (error) {
          console.error('Failed to trigger webhooks:', error);
        }
      });

    // Redirect to the target URL
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': qrCode.target_url,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Error processing dynamic QR request:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});