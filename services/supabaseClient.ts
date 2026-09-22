
import { createClient } from '@supabase/supabase-js';

// Configuración directa para asegurar la conexión inmediata
export const supabaseUrl = 'https://mbtnvfybehccuhwjatnw.supabase.co';
export const supabaseAnonKey = 'sb_publishable_9XGUjMOuffmDvfJsIgAlPw_jhqi68Ga';

// Siempre devolvemos true porque las llaves ya están aquí arriba
export const isSupabaseReady = () => true;

// Creamos el cliente directamente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
