
import { supabase } from "@/lib/supabaseClient";

export interface Legislatura {
    id: number;
    numero: number;
    data_inicio: string;
    data_fim: string;
    numero_vagas_vereadores: number;
    slug?: string;
}

export interface PeriodoSessao {
    id: number;
    legislatura_id: number;
    numero: number;
    data_inicio: string;
    data_fim: string;
    descricao?: string;
    legislatura?: Legislatura;
}

export async function getLegislaturas() {
    const { data, error } = await supabase
        .from("legislaturas")
        .select("*")
        .order("numero", { ascending: false });

    if (error) throw error;
    return data;
}

export async function getPeriodosByLegislatura(legislaturaId: number) {
    const { data, error } = await supabase
        .from("periodossessao")
        .select("*")
        .eq("legislatura_id", legislaturaId)
        .order("numero", { ascending: false });

    if (error) throw error;
    return data;
}

export async function getCurrentPeriodo() {
    // Logic to find current period: today's date between start and end
    // Or simply the latest one if none matches today
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from("periodossessao")
        .select("*, legislatura:legislaturas(*)")
        .lte("data_inicio", today)
        .gte("data_fim", today)
        .maybeSingle();

    if (error) throw error;

    if (data) return data;

    // Fallback: get the absolute latest one
    const { data: latest, error: latestError } = await supabase
        .from("periodossessao")
        .select("*, legislatura:legislaturas(*)")
        .order("data_fim", { ascending: false })
        .limit(1)
        .single();

    if (latestError && latestError.code !== "PGRST116") throw latestError;
    return latest;
}
