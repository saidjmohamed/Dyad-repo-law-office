/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => { // تحديد نوع 'req' كـ 'Request'
  console.log("Edge Function 'get-google-calendar-events' received request."); // سجل تصحيح الأخطاء
  const authHeader = req.headers.get('authorization');
  console.log("Authorization Header in get-google-calendar-events:", authHeader); // سجل تصحيح الأخطاء لرأس Authorization

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = Deno.env.toObject();
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'User ID is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get user's Google integration tokens
    const { data: integration, error: integrationError } = await supabaseAdmin
      .from('user_integrations')
      .select('google_access_token, google_refresh_token')
      .eq('user_id', user_id)
      .single();

    if (integrationError || !integration) {
      console.error('Error fetching user integration:', integrationError?.message || 'No Google integration found for user.');
      return new Response(JSON.stringify({ error: 'No Google Calendar integration found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    let accessToken = integration.google_access_token;
    const refreshToken = integration.google_refresh_token; // Keep refresh token constant for now

    // Check if access token is expired and refresh if necessary
    // A more robust solution would store token expiry time.
    if (refreshToken) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }).toString(),
      });

      const refreshData = await refreshResponse.json();

      if (refreshData.error) {
        console.error('Error refreshing Google access token:', refreshData.error_description || refreshData.error);
        // If refresh fails, clear tokens and ask user to re-authenticate
        await supabaseAdmin
          .from('user_integrations')
          .update({ google_access_token: null, google_refresh_token: null })
          .eq('user_id', user_id);
        return new Response(JSON.stringify({ error: 'Failed to refresh Google access token. Please re-authenticate.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }

      accessToken = refreshData.access_token;
      // Update tokens in DB if new access token is received
      await supabaseAdmin
        .from('user_integrations')
        .update({ google_access_token: accessToken })
        .eq('user_id', user_id);
    }

    // Fetch Google Calendar events
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${new Date().toISOString()}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const calendarData = await calendarResponse.json();

    if (calendarData.error) {
      console.error('Error fetching Google Calendar events:', calendarData.error.message);
      return new Response(JSON.stringify({ error: `Failed to fetch Google Calendar events: ${calendarData.error.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const events = calendarData.items.map((event: any) => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      url: event.htmlLink,
      backgroundColor: '#4285F4', // Google blue
      borderColor: '#4285F4',
      extendedProps: {
        type: 'google-calendar',
        status: event.status,
        location: event.location,
      },
    }));

    return new Response(JSON.stringify({ events }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-google-calendar-events function:', (error as Error).message); // تأكيد نوع الخطأ
    return new Response(JSON.stringify({ error: (error as Error).message }), { // تأكيد نوع الخطأ
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});