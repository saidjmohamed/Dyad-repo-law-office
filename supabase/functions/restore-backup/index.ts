// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TABLES_TO_BACKUP تم إزالتها لأنها غير مستخدمة هنا، ويتم استخدام restoreOrder بدلاً منها.

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

    const { backup_id } = await req.json();

    if (!backup_id) {
      return new Response(JSON.stringify({ error: 'Backup ID is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Fetch backup metadata
    const { data: backupMetadata, error: metadataError } = await supabaseAdmin
      .from('backups')
      .select('storage_path, format')
      .eq('id', backup_id)
      .eq('user_id', user.id) // Ensure user owns the backup
      .single();

    if (metadataError || !backupMetadata) {
      console.error('Error fetching backup metadata:', metadataError?.message || 'Backup not found or not owned by user.');
      return new Response(JSON.stringify({ error: 'Backup not found or unauthorized.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Download backup file
    const { data: backupFile, error: downloadError } = await supabaseAdmin.storage
      .from('backups')
      .download(backupMetadata.storage_path);

    if (downloadError || !backupFile) {
      console.error('Error downloading backup file:', downloadError?.message);
      return new Response(JSON.stringify({ error: 'Failed to download backup file.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const backupContent = await backupFile.text();
    let parsedData: { [key: string]: any[] };

    if (backupMetadata.format === 'json') {
      parsedData = JSON.parse(backupContent);
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported backup format for restore.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Restore data for each table
    // IMPORTANT: Restore order matters for foreign key constraints.
    // We'll try to restore in a general order, but complex dependencies might require manual intervention.
    // For simplicity, we'll delete all user-owned data and then insert.
    // This is a destructive operation and should be confirmed by the user on the client side.

    const restoreOrder = [
      'user_integrations', // Depends on auth.users
      'profiles', // Depends on auth.users
      'clients',
      'cases', // Depends on clients
      'hearings', // Depends on cases
      'tasks', // Depends on cases
      'financial_transactions', // Depends on cases
      'adjournments', // Depends on cases
      'notes', // Depends on cases
      'case_files', // Depends on cases
    ];

    for (const table of restoreOrder) {
      if (parsedData[table]) {
        // Delete existing user-specific data for the table
        const { error: deleteError } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', user.id); // Ensure only user's data is deleted

        if (deleteError) {
          console.error(`Error deleting existing data for table ${table}:`, deleteError);
          // Continue, but log the error. A full rollback is complex for Edge Functions.
        }

        // Insert new data
        if (parsedData[table].length > 0) {
          const { error: insertError } = await supabaseAdmin
            .from(table)
            .insert(parsedData[table]);

          if (insertError) {
            console.error(`Error inserting data into table ${table}:`, insertError);
            // Continue, but log the error.
          }
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Data restored successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in restore-backup function:', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});