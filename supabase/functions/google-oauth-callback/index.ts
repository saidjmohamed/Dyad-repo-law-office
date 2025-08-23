import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('Google OAuth callback error:', error);
      return new Response(`Error: ${error}`, { status: 400 });
    }

    if (!code) {
      return new Response('Authorization code not found.', { status: 400 });
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URL,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Error exchanging code for tokens:', tokenData.error_description || tokenData.error);
      return new Response(`Error exchanging code: ${tokenData.error_description || tokenData.error}`, { status: 400 });
    }

    const { access_token, refresh_token } = tokenData;

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const userInfo = await userInfoResponse.json();
    const userEmail = userInfo.email;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers({ email: userEmail });

    if (userError || !users || users.length === 0) {
      console.error('Error fetching Supabase user by email:', userError?.message || 'User not found');
      return new Response('Supabase user not found for the authenticated Google account.', { status: 404 });
    }

    const supabaseUser = users[0];

    const { error: dbError } = await supabaseAdmin
      .from('user_integrations')
      .upsert(
        {
          user_id: supabaseUser.id,
          google_access_token: access_token,
          google_refresh_token: refresh_token,
        },
        { onConflict: 'user_id' }
      );

    if (dbError) {
      console.error('Error storing tokens in database:', dbError);
      return new Response(`Error storing tokens: ${dbError.message}`, { status: 500 });
    }

    const redirectUrl = new URL(req.url);
    const appBaseUrl = `${redirectUrl.protocol}//${redirectUrl.host}`;
    return new Response(null, {
      status: 303,
      headers: {
        'Location': `${appBaseUrl}/calendar?google_auth_success=true`,
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}, {
  onError: (error: unknown) => {
    console.error("Unhandled error in google-oauth-callback:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  },
});