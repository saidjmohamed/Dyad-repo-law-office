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
    // @ts-ignore
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return new Response(JSON.stringify({ error: 'No authorization token provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('Error getting user from token:', userError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { format, tables: selectedTables } = await req.json();

    const tablesToProcess = selectedTables && selectedTables.length > 0
      ? TABLES_TO_BACKUP.filter(table => selectedTables.includes(table))
      : TABLES_TO_BACKUP;

    if (tablesToProcess.length === 0) {
      return new Response(JSON.stringify({ error: 'No tables selected for backup or invalid tables provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const backupData: { [key: string]: any[] } = {};

    for (const table of tablesToProcess) {
      const { data, error } = await supabaseAdmin.from(table).select('*');
      if (error) {
        console.error(`Error fetching data from table ${table}:`, error);
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

    const { error: uploadError } = await supabaseAdmin.storage
      .from('backups')
      .upload(filePath, backupContent, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading backup to storage:', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to upload backup file.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage.from('backups').getPublicUrl(filePath);

    const { error: insertError } = await supabaseAdmin
      .from('backups')
      .insert({
        user_id: user.id,
        filename,
        format,
        size: backupContent.length,
        storage_path: filePath,
      });

    if (insertError) {
      console.error('Error inserting backup metadata:', insertError);
      await supabaseAdmin.storage.from('backups').remove([filePath]);
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
    console.error('Error in create-backup function:', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});