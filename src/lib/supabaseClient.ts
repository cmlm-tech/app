import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types' // Verifique se o caminho para 'types' está correto a partir de src/lib/

// Lê as variáveis de ambiente da forma correta para o front-end (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

// Adaptador customizado para sessionStorage, caso você precise dele.
// Se o comportamento padrão (usando localStorage) for suficiente, você pode remover este bloco e a opção 'auth'.
const sessionStorageAdapter = {
  getItem: (key: string) => {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  },
};

// Aplica os tipos do banco de dados e a configuração customizada de auth ao criar o cliente
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: sessionStorageAdapter, // Usa sessionStorage em vez do padrão (localStorage)
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})