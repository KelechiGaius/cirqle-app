import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pwjbjzvpvjghgcgubdjl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3amJqenZwdmpnaGdjZ3ViZGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzcyNTQsImV4cCI6MjA3ODgxMzI1NH0._zgacmdxC1mR64g8fbinCgR2iOaLNc1zQVW6s1nUxOA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
