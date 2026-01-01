/**
 * Serviço de Sessões Legislativas
 * 
 * Gerencia o ciclo de vida das sessões:
 * - Agendada → Em Andamento → Realizada
 * - Agendada → Adiada → Agendada
 * - Agendada → Cancelada
 * - Em Andamento → Suspensa → Em Andamento
 */

import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/database.types";

// Types from database
export type SessaoRow = Database["public"]["Tables"]["sessoes"]["Row"];
export type SessaoInsert = Database["public"]["Tables"]["sessoes"]["Insert"];
export type SessaoUpdate = Database["public"]["Tables"]["sessoes"]["Update"];

export type StatusSessao = Database["public"]["Enums"]["status_sessao"] | "Adiada" | "Suspensa";
export type TipoSessao = Database["public"]["Enums"]["tipo_sessao"];

// Extended type with computed fields
// Use Omit to exclude fields we need to redefine as optional
export interface Sessao extends Omit<SessaoRow, 'hora_agendada' | 'local' | 'motivo_cancelamento' | 'data_original' | 'observacoes'> {
    titulo: string; // Computed title
    // Fields added by migration (until types are regenerated)
    hora_agendada?: string;
    local?: string;
    motivo_cancelamento?: string;
    data_original?: string;
    observacoes?: string;
    periodo_sessao?: {
        id: number;
        numero: number;
        data_inicio: string;
        data_fim: string;
        legislatura?: {
            id: number;
            numero: number;
            data_inicio: string;
            data_fim: string;
        };
    };
}

// Utility: Get all Tuesdays of a month (excluding July and December - recess)
function getTuesdaysOfMonth(year: number, month: number): Date[] {
    // Month is 0-indexed (0 = January, 11 = December)
    // Skip July (6) and December (11) - recess months
    if (month === 6 || month === 11) {
        return [];
    }

    const tuesdays: Date[] = [];
    const date = new Date(year, month, 1);

    // Find the first Tuesday
    while (date.getDay() !== 2) {
        date.setDate(date.getDate() + 1);
    }

    // Collect all Tuesdays of the month
    while (date.getMonth() === month) {
        tuesdays.push(new Date(date));
        date.setDate(date.getDate() + 7);
    }

    return tuesdays;
}

// Utility: Format date in Portuguese
function formatDatePtBR(date: Date): string {
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

// Utility: Number to ordinal in Portuguese (extenso)
function numeroParaOrdinalExtenso(num: number): string {
    const unidades = ["", "PRIMEIRA", "SEGUNDA", "TERCEIRA", "QUARTA", "QUINTA", "SEXTA", "SÉTIMA", "OITAVA", "NONA"];
    const dezenas = ["", "DÉCIMA", "VIGÉSIMA", "TRIGÉSIMA", "QUADRAGÉSIMA", "QUINQUAGÉSIMA", "SEXAGÉSIMA", "SEPTUAGÉSIMA", "OCTAGÉSIMA", "NONAGÉSIMA"];
    const centenas = ["", "CENTÉSIMA", "DUCENTÉSIMA", "TRICENTÉSIMA", "QUADRINGENTÉSIMA"];

    if (num <= 0) return "";
    if (num < 10) return unidades[num];
    if (num < 20) {
        const especiais = ["DÉCIMA", "DÉCIMA PRIMEIRA", "DÉCIMA SEGUNDA", "DÉCIMA TERCEIRA", "DÉCIMA QUARTA", "DÉCIMA QUINTA", "DÉCIMA SEXTA", "DÉCIMA SÉTIMA", "DÉCIMA OITAVA", "DÉCIMA NONA"];
        return especiais[num - 10];
    }
    if (num < 100) {
        const dezena = Math.floor(num / 10);
        const unidade = num % 10;
        return unidade === 0 ? dezenas[dezena] : `${dezenas[dezena]} ${unidades[unidade]}`;
    }
    if (num < 200) {
        const resto = num - 100;
        return resto === 0 ? "CENTÉSIMA" : `CENTÉSIMA ${numeroParaOrdinalExtenso(resto)}`;
    }
    if (num < 1000) {
        const centena = Math.floor(num / 100);
        const resto = num % 100;
        return resto === 0 ? centenas[centena] : `${centenas[centena]} ${numeroParaOrdinalExtenso(resto)}`;
    }

    return num.toString() + "ª";
}

// Generate session title following the format:
// "109ª (CENTÉSIMA NONA) SESSÃO ORDINÁRIA DA LEGISLATURA (2021-2024) - 4º PERÍODO (...)"
export function gerarTituloSessao(
    numero: number,
    tipo: TipoSessao,
    legislaturaInicio: string,
    legislaturaFim: string,
    periodoNumero: number,
    periodoInicio: string,
    periodoFim: string,
    dataSessao: string
): string {
    const ordinalExtenso = numeroParaOrdinalExtenso(numero);
    const anoInicio = new Date(legislaturaInicio).getFullYear();
    const anoFim = new Date(legislaturaFim).getFullYear();
    const periodoInicioFormatado = new Date(periodoInicio).toLocaleDateString("pt-BR");
    const periodoFimFormatado = new Date(periodoFim).toLocaleDateString("pt-BR");
    const dataSessaoFormatada = new Date(dataSessao).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).toUpperCase();

    return `${numero}ª (${ordinalExtenso}) SESSÃO ${tipo.toUpperCase()} DA LEGISLATURA (${anoInicio} - ${anoFim}) - ${periodoNumero}º PERÍODO (${periodoInicioFormatado} À ${periodoFimFormatado}) DE ${dataSessaoFormatada}`;
}

// Simplified title for list view
export function gerarTituloSimplificado(tipo: TipoSessao, data: string): string {
    const dataFormatada = formatDatePtBR(new Date(data));
    return `Sessão ${tipo} de ${dataFormatada}`;
}

// ====================== CRUD OPERATIONS ======================

// Get all sessions with optional filters
export async function getSessoes(filters?: {
    periodoId?: number;
    status?: StatusSessao;
    tipoSessao?: TipoSessao;
    dataInicio?: string;
    dataFim?: string;
}): Promise<Sessao[]> {
    let query = supabase
        .from("sessoes")
        .select(`
      *,
      periodo_sessao:periodossessao (
        id,
        numero,
        data_inicio,
        data_fim,
        legislatura:legislaturas (
          id,
          numero,
          data_inicio,
          data_fim
        )
      )
    `)
        .order("data_abertura", { ascending: false });

    if (filters?.periodoId) {
        query = query.eq("periodo_sessao_id", filters.periodoId);
    }
    if (filters?.status) {
        query = query.eq("status", filters.status);
    }
    if (filters?.tipoSessao) {
        query = query.eq("tipo_sessao", filters.tipoSessao);
    }
    if (filters?.dataInicio) {
        query = query.gte("data_abertura", filters.dataInicio);
    }
    if (filters?.dataFim) {
        query = query.lte("data_abertura", filters.dataFim);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Add computed title to each session
    return (data || []).map((sessao) => ({
        ...sessao,
        titulo: gerarTituloSimplificado(
            sessao.tipo_sessao || "Ordinária",
            sessao.data_abertura || new Date().toISOString()
        ),
    }));
}

// Get single session by ID
export async function getSessaoById(id: number): Promise<Sessao | null> {
    const { data, error } = await supabase
        .from("sessoes")
        .select(`
      *,
      periodo_sessao:periodossessao (
        id,
        numero,
        data_inicio,
        data_fim,
        legislatura:legislaturas (
          id,
          numero,
          data_inicio,
          data_fim
        )
      )
    `)
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }

    return {
        ...data,
        titulo: gerarTituloSimplificado(
            data.tipo_sessao || "Ordinária",
            data.data_abertura || new Date().toISOString()
        ),
    };
}

// Get next session number for the current legislature
export async function getProximoNumeroSessao(periodoId: number): Promise<number> {
    // First, get the legislatura_id from the period
    const { data: periodo, error: periodoError } = await supabase
        .from("periodossessao")
        .select("legislatura_id")
        .eq("id", periodoId)
        .single();

    if (periodoError) throw periodoError;

    // Get all periods in this legislature
    const { data: periodos, error: periodosError } = await supabase
        .from("periodossessao")
        .select("id")
        .eq("legislatura_id", periodo.legislatura_id);

    if (periodosError) throw periodosError;

    const periodoIds = periodos.map((p) => p.id);

    // Count all sessions in this legislature (across all periods)
    const { data: sessoes, error } = await supabase
        .from("sessoes")
        .select("numero")
        .in("periodo_sessao_id", periodoIds)
        .order("numero", { ascending: false })
        .limit(1);

    if (error) throw error;

    return (sessoes?.[0]?.numero || 0) + 1;
}

// Create a new session
export async function criarSessao(sessao: {
    periodoId: number;
    tipoSessao: TipoSessao;
    dataAbertura: string;
    horaAgendada?: string;
    local?: string;
    observacoes?: string;
}): Promise<Sessao> {
    // MUDANÇA: Não atribuir número ao criar
    // Número será atribuído apenas quando iniciarSessao() for chamado

    const { data, error } = await supabase
        .from("sessoes")
        .insert({
            periodo_sessao_id: sessao.periodoId,
            tipo_sessao: sessao.tipoSessao,
            data_abertura: sessao.dataAbertura,
            numero: null, // ← NULL até sessão ser iniciada
            status: "Agendada",
            // Campos adicionais (cast necessário até regenerar types)
            ...({
                hora_agendada: sessao.horaAgendada || "16:00:00",
                local: sessao.local || "Plenário da Câmara Municipal",
                observacoes: sessao.observacoes,
            } as any),
        })
        .select()
        .single();

    if (error) throw error;

    // Registrar atividade no log
    const { registrarAgendamentoSessao } = await import("@/services/atividadeLogService");
    await registrarAgendamentoSessao(data.id, sessao.tipoSessao, sessao.dataAbertura);

    return {
        ...data,
        titulo: gerarTituloSimplificado(data.tipo_sessao || "Ordinária", data.data_abertura || ""),
    } as Sessao;
}

// Update session
export async function atualizarSessao(
    id: number,
    updates: Partial<{
        tipoSessao: TipoSessao;
        dataAbertura: string;
        horaAgendada: string;
        local: string;
        observacoes: string;
    }>
): Promise<Sessao> {
    // Usar objeto separado para campos que ainda não estão nos types
    const baseUpdate: SessaoUpdate = {};
    if (updates.tipoSessao) baseUpdate.tipo_sessao = updates.tipoSessao;
    if (updates.dataAbertura) baseUpdate.data_abertura = updates.dataAbertura;

    const extraFields: Record<string, any> = {};
    if (updates.horaAgendada) extraFields.hora_agendada = updates.horaAgendada;
    if (updates.local) extraFields.local = updates.local;
    if (updates.observacoes !== undefined) extraFields.observacoes = updates.observacoes;

    const { data, error } = await supabase
        .from("sessoes")
        .update({ ...baseUpdate, ...extraFields } as any)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        titulo: gerarTituloSimplificado(data.tipo_sessao || "Ordinária", data.data_abertura || ""),
    } as Sessao;
}

// ====================== STATUS TRANSITIONS ======================

// Start session (Agendada → Em Andamento)
export async function iniciarSessao(id: number): Promise<Sessao> {
    // 1. Buscar sessão atual
    const { data: sessaoAtual, error: fetchError } = await supabase
        .from("sessoes")
        .select("numero, periodo_sessao_id, status")
        .eq("id", id)
        .single();

    if (fetchError) throw fetchError;
    if (sessaoAtual.status !== "Agendada") {
        throw new Error("Apenas sessões agendadas podem ser iniciadas");
    }

    let numeroAtribuido = sessaoAtual.numero;

    // 2. Se ainda não tem número, atribuir agora
    if (!numeroAtribuido) {
        // Buscar último número usado no período
        const { data: ultimaSessao } = await supabase
            .from("sessoes")
            .select("numero")
            .eq("periodo_sessao_id", sessaoAtual.periodo_sessao_id)
            .not("numero", "is", null)
            .order("numero", { ascending: false })
            .limit(1)
            .maybeSingle();

        numeroAtribuido = (ultimaSessao?.numero || 0) + 1;
    }

    // 3. Atualizar com número + status
    const { data, error } = await supabase
        .from("sessoes")
        .update({
            numero: numeroAtribuido,
            status: "Em Andamento",
            data_abertura: new Date().toISOString(),
        } as any)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        titulo: gerarTituloSimplificado(data.tipo_sessao || "Ordinária", data.data_abertura || ""),
    };
}

// End session (Em Andamento → Realizada)
export async function encerrarSessao(id: number): Promise<Sessao> {
    const { data, error } = await supabase
        .from("sessoes")
        .update({
            status: "Realizada",
            data_fechamento: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("status", "Em Andamento")
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        titulo: gerarTituloSimplificado(data.tipo_sessao || "Ordinária", data.data_abertura || ""),
    };
}

// Suspend session (Em Andamento → Suspensa)
export async function suspenderSessao(id: number, motivo?: string): Promise<Sessao> {
    const { data, error } = await supabase
        .from("sessoes")
        .update({
            status: "Suspensa" as any, // Cast needed until types are regenerated
            observacoes: motivo,
        })
        .eq("id", id)
        .eq("status", "Em Andamento")
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        titulo: gerarTituloSimplificado(data.tipo_sessao || "Ordinária", data.data_abertura || ""),
    };
}

// Resume session (Suspensa → Em Andamento)
export async function retomarSessao(id: number): Promise<Sessao> {
    const { data, error } = await supabase
        .from("sessoes")
        .update({
            status: "Em Andamento",
        })
        .eq("id", id)
        .eq("status", "Suspensa" as any)
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        titulo: gerarTituloSimplificado(data.tipo_sessao || "Ordinária", data.data_abertura || ""),
    };
}

// Postpone session (Agendada → Adiada)
export async function adiarSessao(id: number, novaData: string, motivo?: string): Promise<Sessao> {
    // First get current session to save original date
    const { data: current, error: fetchError } = await supabase
        .from("sessoes")
        .select("data_abertura")
        .eq("id", id)
        .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
        .from("sessoes")
        .update({
            status: "Adiada" as any,
            data_original: current.data_abertura?.split("T")[0],
            data_abertura: novaData,
            motivo_cancelamento: motivo,
        })
        .eq("id", id)
        .eq("status", "Agendada")
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        titulo: gerarTituloSimplificado(data.tipo_sessao || "Ordinária", data.data_abertura || ""),
    };
}

// Reschedule session (Adiada → Agendada)
export async function reagendarSessao(id: number, novaData: string): Promise<Sessao> {
    const { data, error } = await supabase
        .from("sessoes")
        .update({
            status: "Agendada",
            data_abertura: novaData,
            motivo_cancelamento: null,
        })
        .eq("id", id)
        .eq("status", "Adiada" as any)
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        titulo: gerarTituloSimplificado(data.tipo_sessao || "Ordinária", data.data_abertura || ""),
    };
}

// Mark session as Não Realizada (Agendada/Suspensa/Adiada → Não Realizada)
export async function marcarNaoRealizada(id: number, motivo: string): Promise<Sessao> {
    const { data, error } = await supabase
        .from("sessoes")
        .update({
            status: "Não Realizada",
            motivo: motivo,
        } as any)
        .eq("id", id)
        .in("status", ["Agendada", "Suspensa", "Adiada"] as any)
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        titulo: gerarTituloSimplificado(data.tipo_sessao || "Ordinária", data.data_abertura || ""),
    };
}

// ====================== AUTO-GENERATION ======================

// Generate ordinary sessions for a month (all Tuesdays at 16:00)
export async function gerarSessoesDoMes(
    periodoId: number,
    year: number,
    month: number // 0-indexed (0 = January)
): Promise<Sessao[]> {
    const tuesdays = getTuesdaysOfMonth(year, month);

    if (tuesdays.length === 0) {
        return []; // Recess month (July or December)
    }

    // Check which dates already have sessions
    const startOfMonth = new Date(year, month, 1).toISOString();
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data: existingSessions, error: fetchError } = await supabase
        .from("sessoes")
        .select("data_abertura")
        .eq("periodo_sessao_id", periodoId)
        .gte("data_abertura", startOfMonth)
        .lte("data_abertura", endOfMonth);

    if (fetchError) throw fetchError;

    const existingDates = new Set(
        (existingSessions || []).map((s) => s.data_abertura?.split("T")[0])
    );

    // Filter out Tuesdays that already have sessions
    const newTuesdays = tuesdays.filter(
        (t) => !existingDates.has(t.toISOString().split("T")[0])
    );

    if (newTuesdays.length === 0) {
        return []; // All sessions already exist
    }

    // Create new sessions
    const createdSessions: Sessao[] = [];
    for (const tuesday of newTuesdays) {
        // Set the session time to 16:00 Brazil time (UTC-3)
        // 16:00 BRT = 19:00 UTC
        const sessionDateTime = new Date(tuesday);
        sessionDateTime.setHours(19, 0, 0, 0); // 19:00 UTC = 16:00 BRT

        const sessao = await criarSessao({
            periodoId,
            tipoSessao: "Ordinária",
            dataAbertura: sessionDateTime.toISOString(),
            horaAgendada: "16:00:00",
        });
        createdSessions.push(sessao);
    }

    return createdSessions;
}

// Check and auto-generate sessions for current month
export async function autoGerarSessoesAtual(periodoId: number): Promise<Sessao[]> {
    const today = new Date();
    return gerarSessoesDoMes(periodoId, today.getFullYear(), today.getMonth());
}

// Remove generated sessions (Ordinária + Agendada) for a specific month
// Useful for fixing timezone issues
export async function limparSessoesGeradas(
    periodoId: number,
    year: number,
    month: number
): Promise<void> {
    const startOfMonth = new Date(year, month, 1).toISOString();
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { error } = await supabase
        .from("sessoes")
        .delete()
        .eq("periodo_sessao_id", periodoId)
        .eq("tipo_sessao", "Ordinária")
        .eq("status", "Agendada")
        .gte("data_abertura", startOfMonth)
        .lte("data_abertura", endOfMonth);

    if (error) throw error;
}
