import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Lê as variáveis de ambiente da forma correta para o front-end (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

// Aplica os tipos do banco de dados ao criar o cliente
export const supabase = createClient<Database>(supabaseUrl, supabaseKey)