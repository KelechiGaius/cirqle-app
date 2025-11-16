import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'DEINE_PROJECT_URL_HIER'
const supabaseAnonKey = 'DEIN_ANON_KEY_HIER'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
