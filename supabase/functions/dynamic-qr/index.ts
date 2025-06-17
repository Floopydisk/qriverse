
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Create Supabase client with service role
const supabaseUrl = "https://kienjbeckgfsajjxjqhs.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to get location data from IP
async function getLocationFromIP(ip: string) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,lat,lon`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon
      };
    }
  } catch (error) {
    console.log("Location lookup failed:", error);
  }
  return null;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const shortCode = url.searchParams.get("code");

    console.log("=== DYNAMIC QR SCAN START ===");
    console.log("Short code:", shortCode);

    if (!shortCode) {
      return new Response(JSON.stringify({ error: "No short code provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Find the dynamic QR code
    const { data: qrCode, error: qrCodeError } = await supabase
      .from("dynamic_qr_codes")
      .select("*")
      .eq("short_code", shortCode)
      .eq("active", true)
      .single();

    if (qrCodeError || !qrCode) {
      console.log("QR code not found or inactive:", shortCode);
      return new Response(JSON.stringify({ error: "QR code not found or inactive" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Found QR code:", qrCode.name);

    // Prepare scan data
    const scanData: any = {
      dynamic_qr_code_id: qrCode.id,
      scanned_at: new Date().toISOString(),
    };

    // Get user agent
    const userAgent = req.headers.get("user-agent");
    if (userAgent) {
      scanData.user_agent = userAgent;
    }

    // Get referrer
    const referrer = req.headers.get("referer") || req.headers.get("referrer");
    if (referrer) {
      scanData.referrer = referrer;
    }

    // Get IP address and location
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get("x-real-ip");
    
    if (ip) {
      scanData.ip_address = ip;
      
      // Get location data from IP
      const locationData = await getLocationFromIP(ip);
      if (locationData) {
        scanData.country = locationData.country;
        scanData.city = locationData.city;
        scanData.latitude = locationData.latitude;
        scanData.longitude = locationData.longitude;
      }
    }

    console.log("Scan data:", scanData);

    // Insert scan record
    const { data: insertedScan, error: scanError } = await supabase
      .from("dynamic_qr_scans")
      .insert([scanData])
      .select()
      .single();

    if (scanError) {
      console.error("Failed to record scan:", scanError);
    } else {
      console.log("Scan recorded successfully:", insertedScan?.id);
    }

    console.log("Redirecting to:", qrCode.target_url);

    // Redirect to target URL
    return new Response(null, {
      status: 302,
      headers: {
        Location: qrCode.target_url,
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error("Error in dynamic QR function:", error);
    
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
