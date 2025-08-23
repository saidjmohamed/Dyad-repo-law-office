// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TABLES_TO_BACKUP = [
  'clients',
  'cases',
  'hearings',
  'tasks',
  'financial_transactions',
  'adjournments',
  'notes',
  'case_files',
  'profiles',
  'user_integrations',
];

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("create-backup: Received request.");
    console.log("create-backup: Request method:", req.method);
    console.log("create-backup: Content-Type header:", req.headers.get('Content-Type'));
    console.log("create-backup: Authorization header:", req.headers.get('Authorization'));

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.error("create-backup: No authorization token provided.");
      return new Response(JSON.stringify({ error: 'No authorization token provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { data: { user }, error: userError } = await createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL'),
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    ).auth.getUser(token);

    if (userError || !user) {
      console.error('create-backup: Error getting user from token:', userError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    console.log("create-backup: User authenticated:", user.id);

    let requestBody;
    try {
      requestBody = await req.json();
      console.log("create-backup: Successfully parsed request body:", JSON.stringify(requestBody));
    } catch (jsonError) {
      console.error("create-backup: Error parsing request JSON:", (jsonError as Error).message);
      // Attempt to read raw body for more context if JSON parsing failed
      try {
        const rawBody = await req.text();
        console.error("create-backup: Raw request body (if available):", rawBody);
      } catch (readError) {
        console.error("create-backup: Could not read raw body:", (readError as Error).message);
      }
      return new Response(JSON.stringify({ error: `Failed to parse request body: ${(jsonError as Error).message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { format, tables: selectedTables } = requestBody;

    const tablesToProcess = selectedTables && selectedTables.length > 0
      ? TABLES_TO_BACKUP.filter(table => selectedTables.includes(table))
      : TABLES_TO_BACKUP;

    if (tablesToProcess.length === 0) {
      console.error("create-backup: No tables selected for backup or invalid tables provided.");
      return new Response(JSON.stringify({ error: 'No tables selected for backup or invalid tables provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const backupData: { [key: string]: any[] } = {};

    for (const table of tablesToProcess) {
      const { data, error } = await createClient(
        // @ts-ignore
        Deno.env.get('SUPABASE_URL'),
        // @ts-ignore
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      ).from(table).select('*');
      if (error) {
        console.error(`create-backup: Error fetching data from table ${table}:`, error);
        // Continue to next table, but log the error
      } else {
        backupData[table] = data;
      }
    }

    let backupContent: string;
    let contentType: string;
    let fileExtension: string;

    if (format === 'json') {
      backupContent = JSON.stringify(backupData, null, 2);
      contentType = 'application/json';
      fileExtension = 'json';
    } else if (format === 'csv') {
      return new Response(JSON.stringify({ error: 'CSV format is only supported for single table backups, or requires a more complex multi-file archive. Please select JSON for multi-table backup.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported backup format.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.${fileExtension}`;
    const filePath = `${user.id}/${filename}`;

    const { error: uploadError } = await createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL'),
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    ).storage
      .from('backups')
      .upload(filePath, backupContent, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('create-backup: Error uploading backup to storage:', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to upload backup file.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const { data: { publicUrl } } = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL'),
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    ).storage.from('backups').getPublicUrl(filePath);

    const { error: insertError } = await createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL'),
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    ).from('backups')
      .insert({
        user_id: user.id,
        filename,
        format,
        size: backupContent.length,
        storage_path: filePath,
      });

    if (insertError) {
      console.error('create-backup: Error inserting backup metadata:', insertError);
      // Attempt to delete the uploaded file to prevent orphans
      await createClient(
        // @ts-ignore
        Deno.env.get('SUPABASE_URL'),
        // @ts-ignore
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      ).storage.from('backups').remove([filePath]);
      return new Response(JSON.stringify({ error: 'Failed to record backup metadata.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'Backup created successfully.', filename, publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('create-backup: Unhandled error in create-backup function:', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});