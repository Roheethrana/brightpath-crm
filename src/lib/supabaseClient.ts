import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Strict client-side configuration validation
export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasValidUrl: boolean;
  hasValidKey: boolean;
  urlPreview?: string;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const hasValidUrl = Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id')
  );

  const hasValidKey = Boolean(
    supabaseAnonKey &&
    supabaseAnonKey.length > 20 &&
    !supabaseAnonKey.includes('your-anon-public-client-key')
  );

  return {
    isConfigured: hasValidUrl && hasValidKey,
    hasValidUrl,
    hasValidKey,
    urlPreview: supabaseUrl ? supabaseUrl.replace(/https:\/\//, '') : undefined,
  };
}

// Singleton client initialization
let clientInstance: SupabaseClient | null = null;

if (getSupabaseConfigStatus().isConfigured && supabaseUrl && supabaseAnonKey) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    clientInstance = null;
  }
}

export const supabase = clientInstance;

/**
 * Diagnostic tool: Performs an active network ping to the Supabase endpoint
 * to verify connectivity, measure latency, and validate credentials.
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  latencyMs?: number;
  message: string;
  statusCode?: number;
}> {
  const status = getSupabaseConfigStatus();

  if (!status.isConfigured || !clientInstance) {
    return {
      success: false,
      message: 'Supabase is not configured. Missing valid VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.',
    };
  }

  const startTime = performance.now();

  try {
    // Lightweight head query on profiles or auth check to verify credentials and connectivity
    const { error, status: httpStatus } = await clientInstance
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      // If table doesn't exist yet (Phase 2, prior to Phase 3 migrations), 
      // getting a PostgreSQL 42P01 or Supabase REST response means the connection to Supabase SUCCEEDED!
      if (error.code === '42P01' || error.message.includes('relation "public.profiles" does not exist')) {
        return {
          success: true,
          latencyMs,
          message: `Connected to Supabase endpoint (${latencyMs}ms). Database tables will be created in Phase 3.`,
          statusCode: httpStatus,
        };
      }

      return {
        success: false,
        latencyMs,
        message: error.message || 'Database query error returned from Supabase.',
        statusCode: httpStatus,
      };
    }

    return {
      success: true,
      latencyMs,
      message: `Successfully connected to Supabase (${latencyMs}ms).`,
      statusCode: httpStatus,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - startTime);
    const errorMessage = err instanceof Error ? err.message : 'Unknown network failure';
    return {
      success: false,
      latencyMs,
      message: `Network failure connecting to Supabase: ${errorMessage}`,
    };
  }
}
