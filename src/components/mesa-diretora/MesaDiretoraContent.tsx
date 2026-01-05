
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import MesaDiretoraHeader from "./MesaDiretoraHeader";
import MembroMesaCard from "./MembroMesaCard";
import { getMesaByPeriodo, getVereadoresAptosParaMesa, getAllVereadoresLegislatura } from "@/services/mesaDiretoraService";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  periodoId: number;
}

export default function MesaDiretoraContent({ periodoId: initialPeriodoId }: Props) {
  const [legislaturaSelecionada, setLegislaturaSelecionada] = useState<number | undefined>();
  const [periodoSelecionado, setPeriodoSelecionado] = useState<number>(initialPeriodoId);

  // 1. Buscar todas as legislaturas
  const { data: legislaturas = [] } = useQuery({
    queryKey: ["legislaturas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legislaturas")
        .select("*")
        .order("numero", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // 2. Buscar períodos da legislatura selecionada
  const { data: periodos = [] } = useQuery({
    queryKey: ["periodos", legislaturaSelecionada],
    queryFn: async () => {
      if (!legislaturaSelecionada) return [];
      const { data, error } = await supabase
        .from("periodossessao")
        .select("*")
        .eq("legislatura_id", legislaturaSelecionada)
        .order("numero", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!legislaturaSelecionada,
  });

  // 3. Buscar dados do período selecionado
  const { data: periodo } = useQuery({
    queryKey: ["periodo", periodoSelecionado],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("periodossessao")
        .select("*, legislatura:legislaturas(*)")
        .eq("id", periodoSelecionado)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!periodoSelecionado,
  });

  // 4. Buscar TODOS os vereadores da legislatura (incluindo licenciados) para EXIBIÇÃO
  const { data: vereadores = [] } = useQuery({
    queryKey: ["vereadores-todos", legislaturaSelecionada],
    queryFn: () => getAllVereadoresLegislatura(legislaturaSelecionada!),
    enabled: !!legislaturaSelecionada,
  });

  // 5. Buscar mesa do período selecionado
  const { data: mesa, isLoading } = useQuery({
    queryKey: ["mesa", periodoSelecionado],
    queryFn: () => getMesaByPeriodo(periodoSelecionado),
    retry: false,
    enabled: !!periodoSelecionado,
  });

  // DEBUG: Verificar dados de licença
  useEffect(() => {
    if (mesa) {
      console.log('[DEBUG] Mesa carregada:', mesa);
      console.log('[DEBUG] Membros:', mesa.membros);
      mesa.membros?.forEach(m => {
        console.log(`[DEBUG] Membro ${m.agente_publico_id}:`, (m as any).licenca_info);
      });
    }
  }, [mesa]);

  // Inicializar legislatura quando dados carregarem
  useEffect(() => {
    if (periodo?.legislatura_id && !legislaturaSelecionada) {
      setLegislaturaSelecionada(periodo.legislatura_id);
    }
  }, [periodo, legislaturaSelecionada]);

  // Quando mudar legislatura, selecionar primeiro período
  useEffect(() => {
    if (periodos.length > 0 && legislaturaSelecionada) {
      // Se o período atual não pertence à legislatura selecionada, mudar para o primeiro
      const periodoAtualNaLegislatura = periodos.find(p => p.id === periodoSelecionado);
      if (!periodoAtualNaLegislatura) {
        setPeriodoSelecionado(periodos[0].id);
      }
    }
  }, [periodos, legislaturaSelecionada, periodoSelecionado]);

  // Handlers
  const handleLegislaturaChange = (legislaturaId: number) => {
    setLegislaturaSelecionada(legislaturaId);
  };

  const handlePeriodoChange = (periodoId: number) => {
    setPeriodoSelecionado(periodoId);
  };

  // Helper: Access members directly from mesa.membros
  const getMembro = (cargo: string) => {
    return mesa?.membros?.find(m => m.cargo === cargo) || null;
  };

  // Helper: Find full Vereador object by agente_publico_id
  const getVereadorByAgenteId = (agenteId: number | undefined) => {
    if (!agenteId) return null;
    return vereadores.find(v => v.id === agenteId) || null;
  };

  // Transform vereador data for UI
  const getUI_Vereador = (agenteId: number | undefined) => {
    const v = getVereadorByAgenteId(agenteId);
    if (!v) return null;
    return {
      ...v,
      id: String(v.id),
      nome: v.nome_parlamentar || v.nome_completo,
      partido: v.partido,
      partidoLogo: v.partido_completo?.logo_url || "",
      foto: v.foto,
      email: v.email_gabinete || "",
      telefone: v.telefone_gabinete || "",
      biografia: v.perfil || "",
      legislatura: "",
      comissoes: [],
      cargoMesa: "",
    };
  };

  // Definir ordem dos cargos
  const cargosOrdenados = [
    { cargo: "Presidente" as const, membro: getMembro("Presidente") },
    { cargo: "Vice-Presidente" as const, membro: getMembro("Vice-Presidente") },
    { cargo: "1º Secretário" as const, membro: getMembro("1º Secretário") },
    { cargo: "2º Secretário" as const, membro: getMembro("2º Secretário") },
    { cargo: "1º Tesoureiro" as const, membro: getMembro("1º Tesoureiro") },
    { cargo: "2º Tesoureiro" as const, membro: getMembro("2º Tesoureiro") },
  ];

  if (isLoading || !legislaturaSelecionada) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!mesa && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <MesaDiretoraHeader
          legislaturas={legislaturas}
          periodos={periodos}
          legislaturaSelecionada={legislaturaSelecionada}
          periodoSelecionado={periodoSelecionado}
          onLegislaturaChange={handleLegislaturaChange}
          onPeriodoChange={handlePeriodoChange}
        />

        <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <h3 className="text-lg font-medium text-gray-900">Nenhuma Mesa Diretora Encontrada</h3>
          <p className="text-gray-500 mb-2">Não há mesa diretora cadastrada para este período.</p>
          <p className="text-sm text-gray-400">Para criar uma mesa, acesse Legislaturas → Períodos → "Mesa Diretora".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <MesaDiretoraHeader
        legislaturas={legislaturas}
        periodos={periodos}
        legislaturaSelecionada={legislaturaSelecionada}
        periodoSelecionado={periodoSelecionado}
        onLegislaturaChange={handleLegislaturaChange}
        onPeriodoChange={handlePeriodoChange}
      />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cargosOrdenados.map(({ cargo, membro }) => {
          // Criar objeto vereador a partir dos dados do membro
          const vereadorData = membro?.agente ? {
            id: String(membro.agente_publico_id),
            nome: membro.agente.nome_completo,
            partido: "Sem Partido",
            partidoLogo: "",
            foto: membro.agente.foto_url,
            email: "",
            telefone: "",
            biografia: "",
            legislatura: "",
            comissoes: [],
            cargoMesa: cargo,
          } : null;

          return (
            <MembroMesaCard
              key={cargo}
              cargo={cargo}
              vereador={vereadorData}
              licencaInfo={(membro as any)?.licenca_info}
            />
          );
        })}
      </section>
    </div>
  );
}
