import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string;
  team_name: string;
  invited_by_name: string;
  invitation_url: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { to, team_name, invited_by_name, invitation_url }: EmailRequest = await req.json();

    if (!to || !team_name || !invited_by_name || !invitation_url) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // In a real implementation, you would integrate with an email service
    // like SendGrid, Mailgun, or AWS SES. For now, we'll just log the email
    // and return success.

    const emailContent = {
      to,
      subject: `You've been invited to join ${team_name} on QRLabs`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Team Invitation</h2>
          <p>Hello!</p>
          <p><strong>${invited_by_name}</strong> has invited you to join the team <strong>${team_name}</strong> on QRLabs.</p>
          <p>QRLabs is a powerful QR code management platform that allows teams to collaborate on creating, managing, and tracking QR codes.</p>
          <div style="margin: 30px 0;">
            <a href="${invitation_url}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This invitation will expire in 7 days. If you don't want to join this team, you can ignore this email.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            This email was sent by QRLabs. If you have any questions, please contact our support team.
          </p>
        </div>
      `
    };

    // Log the email for development purposes
    console.log('Team invitation email:', emailContent);

    // TODO: Integrate with actual email service
    // Example for SendGrid:
    /*
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    if (sendgridApiKey) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }]
          }],
          from: { email: 'noreply@qrlabs.com', name: 'QRLabs' },
          subject: emailContent.subject,
          content: [{
            type: 'text/html',
            value: emailContent.html
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.status}`);
      }
    }
    */

    return new Response(JSON.stringify({ 
      message: 'Team invitation email sent successfully',
      email_preview: emailContent // Remove this in production
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error sending team invitation:', error);
    return new Response(JSON.stringify({ error: 'Failed to send invitation email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});