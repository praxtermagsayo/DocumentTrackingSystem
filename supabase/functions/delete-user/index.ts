import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

const BUCKET = 'documents';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Recursively list all file paths under a prefix (storage.objects FK blocks auth user delete) */
async function listAllPaths(
  admin: ReturnType<typeof createClient>,
  prefix: string,
  paths: string[] = []
): Promise<string[]> {
  const { data: items, error } = await admin.storage.from(BUCKET).list(prefix, { limit: 1000 });
  if (error) {
    if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
      return paths;
    }
    console.warn('Storage list error for', prefix, error);
    return paths;
  }
  for (const item of items || []) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    const isFile = 'id' in item && item.id != null;
    if (isFile) {
      paths.push(fullPath);
    } else {
      await listAllPaths(admin, fullPath, paths);
    }
  }
  return paths;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401, headers: corsHeaders }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error('Missing Supabase env vars');
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500, headers: corsHeaders }
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
    const { data: { user }, error: userError } = await authClient.auth.getUser(token);
    if (userError || !user) {
      return Response.json(
        { error: 'Invalid or expired token' },
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = user.id;
    if (!userId || !UUID_REGEX.test(userId)) {
      return Response.json(
        { error: 'Invalid user id' },
        { status: 400, headers: corsHeaders }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const filePaths = await listAllPaths(adminClient, userId);
    for (let i = 0; i < filePaths.length; i += 100) {
      const chunk = filePaths.slice(i, i + 100);
      const { error: removeError } = await adminClient.storage.from(BUCKET).remove(chunk);
      if (removeError) {
        console.warn('Storage remove error for chunk:', removeError);
      }
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Delete user error:', deleteError);
      return Response.json(
        { error: deleteError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    return Response.json(
      { message: 'User deleted successfully' },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error('Delete user function error:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
});
