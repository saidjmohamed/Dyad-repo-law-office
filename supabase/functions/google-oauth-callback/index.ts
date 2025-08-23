import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
      // Redirect to a client-side error page or display error
      return new Response(`Error: ${error}`, { status: 400 });
    }

    if (!code) {
      return new Response('Authorization code not found.', { status: 400 });
    }

    // Exchange authorization code for tokens
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

    // Get user info to link with Supabase auth.uid()
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const userInfo = await userInfoResponse.json();
    const userEmail = userInfo.email;

    // Initialize Supabase client with service role key to bypass RLS for this operation
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    // Get the user from Supabase auth.users table using their email
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers({ email: userEmail });

    if (userError || !users || users.length === 0) {
      console.error('Error fetching Supabase user by email:', userError?.message || 'User not found');
      return new Response('Supabase user not found for the authenticated Google account.', { status: 404 });
    }

    const supabaseUser = users[0];

    // Store tokens in user_integrations table
    const { error: dbError } = await supabaseAdmin
      .from('user_integrations')
      .upsert(
        {
          user_id: supabaseUser.id,
          google_access_token: access_token,
          google_refresh_token: refresh_token,
          // Optionally fetch and store primary calendar ID here if needed
        },
        { onConflict: 'user_id' }
      );

    if (dbError) {
      console.error('Error storing tokens in database:', dbError);
      return new Response(`Error storing tokens: ${dbError.message}`, { status: 500 });
    }

    // Redirect back to the application's calendar page
    // You might want to pass a success message or status
    const redirectUrl = new URL(req.url);
    const appBaseUrl = `${redirectUrl.protocol}//${redirectUrl.host}`;
    return new Response(null, {
      status: 303, // See Other
      headers: {
        'Location': `${appBaseUrl}/calendar?google_auth_success=true`, // Redirect to your app's calendar page
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});