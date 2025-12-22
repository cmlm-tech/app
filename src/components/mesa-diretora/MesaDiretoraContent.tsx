
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import ModalEditarMesa from "./ModalEditarMesa";
import MesaDiretoraHeader from "./MesaDiretoraHeader";
import PresidenteCard from "./PresidenteCard";
import VicePresidenteCard from "./VicePresidenteCard";
import OutrosMembrosGrid from "./OutrosMembrosGrid";
import { getMesaByPeriodo, createMesa, updateMembrosMesa, MesaDiretora, MembroMesa } from "@/services/mesaDiretoraService";
import { getVereadores, Vereador } from "@/services/vereadoresService";
import { ComposicaoMesa } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Helper to map DB members to UI Composition object
const mapMembrosToComposicao = (membros: MembroMesa[]): ComposicaoMesa => {
  const comp: any = {
    presidente: "",
    vicePresidente: "",
    primeiroSecretario: "",
    segundoSecretario: "",
    primeiroTesoureiro: "",
    segundoTesoureiro: "",
  };

  membros.forEach((m) => {
    switch (m.cargo) {
      case "Presidente": comp.presidente = String(m.agente_publico_id); break;
      case "Vice-Presidente": comp.vicePresidente = String(m.agente_publico_id); break;
      case "1º Secretário": comp.primeiroSecretario = String(m.agente_publico_id); break;
      case "2º Secretário": comp.segundoSecretario = String(m.agente_publico_id); break;
      case "1º Tesoureiro": comp.primeiroTesoureiro = String(m.agente_publico_id); break;
      case "2º Tesoureiro": comp.segundoTesoureiro = String(m.agente_publico_id); break;
    }
  });

  return comp as ComposicaoMesa;
};

// Helper to map UI Composition object back to DB members array
const mapComposicaoToMembros = (comp: ComposicaoMesa, mesaId: number): { cargo: MembroMesa["cargo"], agente_publico_id: number }[] => {
  const mapKeyToCargo: Record<string, string> = {
    presidente: "Presidente",
    vicePresidente: "Vice-Presidente",
    primeiroSecretario: "1º Secretário",
    segundoSecretario: "2º Secretário",
    primeiroTesoureiro: "1º Tesoureiro",
    segundoTesoureiro: "2º Tesoureiro",
  };

  const membros = [];
  for (const [key, idStr] of Object.entries(comp)) {
    if (idStr && idStr !== "0" && idStr !== "") {
      membros.push({
        agente_publico_id: Number(idStr),
        cargo: mapKeyToCargo[key] as MembroMesa["cargo"],
        mesa_diretora_id: mesaId // redundant but good for clarity
      });
    }
  }
  return membros;
};

interface Props {
  periodoId: number;
}

export default function MesaDiretoraContent({ periodoId }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // 1. Fetch Vereadores (for looking up details and filling select options)
  const { data: vereadores = [] } = useQuery({
    queryKey: ["vereadores"],
    queryFn: getVereadores,
  });

  // 2. Fetch Mesa for this Period
  const { data: mesa, isLoading, error } = useQuery({
    queryKey: ["mesa", periodoId],
    queryFn: () => getMesaByPeriodo(periodoId),
    retry: false
  });

  // 3. Mutation to create Mesa if it doesn't exist
  const createMesaMutation = useMutation({
    mutationFn: () => createMesa(periodoId, `Mesa Diretora`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mesa", periodoId] });
      toast.success("Mesa diretora inicializada com sucesso!");
    }
  });

  // 4. Mutation to update Members
  const updateMembersMutation = useMutation({
    mutationFn: (membros: { cargo: MembroMesa["cargo"]; agente_publico_id: number }[]) => {
      if (!mesa?.id) throw new Error("Mesa não existe");
      return updateMembrosMesa(mesa.id, membros);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mesa", periodoId] });
      setModalOpen(false);
      toast.success("Composição atualizada com sucesso!");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Erro ao salvar composição.");
    }
  });

  // Determine current composition for Modal and UI
  const composicaoAtual = React.useMemo(() => {
    if (!mesa?.membros) return {
      presidente: "", vicePresidente: "", primeiroSecretario: "",
      segundoSecretario: "", primeiroTesoureiro: "", segundoTesoureiro: ""
    };
    return mapMembrosToComposicao(mesa.membros);
  }, [mesa]);

  const handleSaveComposition = (novaComposicao: ComposicaoMesa) => {
    if (!mesa?.id) return;
    const membrosParaSalvar = mapComposicaoToMembros(novaComposicao, mesa.id);
    updateMembersMutation.mutate(membrosParaSalvar);
  };

  // Helper to find full Vereador object by string ID (from Composition)
  const getVereadorHelper = (idStr: string) => {
    return vereadores.find(v => String(v.id) === idStr) || null;
  };

  // Transform 'Vereador' service type to 'Vereador' UI type expected by cards
  // The service returns minimal data, UI might expect more.
  // We need to match types. 
  // Let's adapt on the fly or ensure service returns compatible data.
  // The existing cards expect: { id, nome, partido, foto, cargoMesa, ... }
  // Our service returns: { id, nome, foto, partido } (roughly)

  const getUI_Vereador = (idStr: string) => {
    const v = getVereadorHelper(idStr);
    if (!v) return null;
    return {
      ...v,
      id: String(v.id), // UI components use string IDs
      cargoMesa: "", // Not needed for the card display itself usually, or we can look it up
      biografia: "",
      email: "",
      telefone: "",
      legislatura: "",
      partidoLogo: "",
      comissoes: []
    };
  };

  const membrosUI = {
    presidente: getUI_Vereador(composicaoAtual.presidente),
    vicePresidente: getUI_Vereador(composicaoAtual.vicePresidente),
    primeiroSecretario: getUI_Vereador(composicaoAtual.primeiroSecretario),
    segundoSecretario: getUI_Vereador(composicaoAtual.segundoSecretario),
    primeiroTesoureiro: getUI_Vereador(composicaoAtual.primeiroTesoureiro),
    segundoTesoureiro: getUI_Vereador(composicaoAtual.segundoTesoureiro),
  };

  const CARGOS_OUTROS_MEMBROS = [
    { key: "primeiroSecretario", label: "1º Secretário" },
    { key: "segundoSecretario", label: "2º Secretário" },
    { key: "primeiroTesoureiro", label: "1º Tesoureiro" },
    { key: "segundoTesoureiro", label: "2º Tesoureiro" },
  ];

  const outrosMembrosUI = CARGOS_OUTROS_MEMBROS.map((cargo) => ({
    vereador: membrosUI[cargo.key as keyof typeof membrosUI],
    cargoLabel: cargo.label,
    cargoKey: cargo.key,
  }));

  // Adapt vereadores list for Modal
  const vereadoresForModal = vereadores.map(v => ({
    ...v,
    id: String(v.id),
    partidoLogo: "",
    cargoMesa: "",
    biografia: "",
    email: "",
    telefone: "",
    legislatura: "",
    comissoes: []
  }));

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>;
  }

  if (!mesa && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <h3 className="text-lg font-medium text-gray-900">Nenhuma Mesa Diretora Encontrada</h3>
        <p className="text-gray-500 mb-4">Não há mesa diretora cadastrada para este período.</p>
        <Button onClick={() => createMesaMutation.mutate()} disabled={createMesaMutation.isPending}>
          {createMesaMutation.isPending ? "Criando..." : "Criar Mesa Diretora"}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <MesaDiretoraHeader
        selectedYear={String(periodoId)} // TODO: Use real year/label
        onYearChange={() => { }} // Disabled for now as we use URL routing
        anosDisponiveis={[String(periodoId)]}
        isAdmin={true}
        onEditClick={() => setModalOpen(true)}
      />

      <PresidenteCard vereador={membrosUI.presidente} ano={"Atual"} />
      <VicePresidenteCard vereador={membrosUI.vicePresidente} ano={"Atual"} />
      <OutrosMembrosGrid membros={outrosMembrosUI} />

      <ModalEditarMesa
        open={modalOpen}
        onOpenChange={setModalOpen}
        vereadores={vereadoresForModal}
        composicaoMesa={composicaoAtual}
        onSave={handleSaveComposition}
        ano={"do Período"}
      />
    </div>
  );
}
