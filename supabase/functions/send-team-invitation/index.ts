
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TeamInvitationRequest {
  email: string;
  teamName: string;
  inviterName: string;
  invitationToken: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, teamName, inviterName, invitationToken, role }: TeamInvitationRequest = await req.json();

    const acceptUrl = `${Deno.env.get('SUPABASE_URL')}/accept-invitation?token=${invitationToken}`;

    const emailResponse = await resend.emails.send({
      from: "QR Code Manager <onboarding@resend.dev>",
      to: [email],
      subject: `You've been invited to join ${teamName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2d3748; margin-bottom: 24px;">Team Invitation</h1>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
            Hi there!
          </p>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
            <strong>${inviterName}</strong> has invited you to join the team <strong>${teamName}</strong> as a <strong>${role}</strong>.
          </p>
          <div style="margin: 32px 0;">
            <a href="${acceptUrl}" 
               style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #718096; font-size: 14px; line-height: 1.5;">
            If you don't want to join this team, you can safely ignore this email.
          </p>
          <p style="color: #718096; font-size: 14px; line-height: 1.5;">
            This invitation will expire in 7 days.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
          <p style="color: #a0aec0; font-size: 12px;">
            QR Code Manager - Team Collaboration Made Easy
          </p>
        </div>
      `,
    });

    console.log("Team invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-team-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
