import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { FiltroAgentesPublicos } from "@/components/agentes-publicos/FiltroAgentesPublicos";
import { TabelaAgentesPublicos } from "@/components/agentes-publicos/TabelaAgentesPublicos";
import { ModalAgentePublico } from "@/components/agentes-publicos/ModalAgentePublico";
import { ModalConviteUsuario } from "@/components/agentes-publicos/ModalConviteUsuario";
import { ModalConfirmacaoInativar } from "@/components/agentes-publicos/ModalConfirmacaoInativar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

export type AgenteComStatus = Database['public']['Functions']['get_agentes_publicos_com_status']['Returns'][number];

export default function AgentesPublicos() {
  const { toast } = useToast();
  const [agentes, setAgentes] = useState<AgenteComStatus[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('Todos');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalConviteAberto, setModalConviteAberto] = useState(false);
  const [agenteEditando, setAgenteEditando] = useState<AgenteComStatus | null>(null);
  const [agenteConvidando, setAgenteConvidando] = useState<AgenteComStatus | null>(null);
  const [agenteParaInativar, setAgenteParaInativar] = useState<AgenteComStatus | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const carregarAgentes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_agentes_publicos_com_status');
      if (error) throw error;
      setAgentes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar agentes:', error);
      toast({ title: "Erro", description: error.message || "Erro ao carregar lista de agentes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    carregarAgentes();
  }, [carregarAgentes]);

  const agentesFiltrados = agentes.filter(agente => {
    const buscaMatch = agente.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
                      (agente.cpf || '').includes(busca.replace(/\D/g, ''));
    const tipoMatch = tipoFiltro === 'Todos' || agente.tipo === tipoFiltro;
    const statusMatch = statusFiltro === 'Todos' || agente.status_usuario === statusFiltro;
    
    return buscaMatch && tipoMatch && statusMatch;
  });

  const handleNovoAgente = () => {
    setAgenteEditando(null);
    setIsEditing(false);
    setModalAberto(true);
  };

  const handleEditarAgente = (agente: AgenteComStatus) => {
    setAgenteEditando(agente);
    setIsEditing(true);
    setModalAberto(true);
  };

  const handleConvidarAgente = (agente: AgenteComStatus) => {
    setAgenteConvidando(agente);
    setModalConviteAberto(true);
  };
  
  const handleDesativarAgente = (agente: AgenteComStatus) => {
    setAgenteParaInativar(agente);
  };

  const handleConfirmarInativacao = async () => {
    if (!agenteParaInativar) return;

    try {
      const { error } = await supabase
        .from('agentes_publicos')
        .update({ status_agente: 'Inativo' })
        .eq('id', agenteParaInativar.id);

      if (error) throw error;

      toast({ title: "Sucesso", description: `O agente ${agenteParaInativar.nome_completo} foi inativado.` });
      setAgenteParaInativar(null);
      await carregarAgentes();
    } catch (error: any) {
      console.error('Erro ao inativar agente:', error);
      toast({ title: "Erro", description: error.message || "Falha ao inativar o agente.", variant: "destructive" });
    }
  };
  
  const handleAcaoConcluida = useCallback(async () => {
      await carregarAgentes();
  }, [carregarAgentes]);
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gov-blue-800"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
       <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">
            Gerenciamento de Agentes Públicos
          </h1>
          <p className="text-gray-600">
            Cadastre e gerencie todos os vereadores e funcionários da Câmara.
          </p>
        </div>
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button onClick={handleNovoAgente} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Cadastrar Novo Agente Público
          </Button>
          <div className="text-sm text-gray-500">
            {agentesFiltrados.length} de {agentes.length} agentes
          </div>
        </div>
         <FiltroAgentesPublicos
          busca={busca}
          setBusca={setBusca}
          tipoFiltro={tipoFiltro}
          setTipoFiltro={setTipoFiltro}
          statusFiltro={statusFiltro}
          setStatusFiltro={setStatusFiltro}
        />
         <TabelaAgentesPublicos
          agentes={agentesFiltrados}
          onEditar={handleEditarAgente}
          onDesativar={handleDesativarAgente}
          onConvidar={handleConvidarAgente}
        />
         <ModalAgentePublico
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          onSave={handleAcaoConcluida}
          agente={agenteEditando}
          isEditing={isEditing}
        />
         <ModalConviteUsuario
          isOpen={modalConviteAberto}
          onClose={() => setModalConviteAberto(false)}
          onConviteEnviado={handleAcaoConcluida}
          agente={agenteConvidando}
        />
        <ModalConfirmacaoInativar
          isOpen={!!agenteParaInativar}
          onClose={() => setAgenteParaInativar(null)}
          onConfirm={handleConfirmarInativacao}
          agente={agenteParaInativar}
        />
      </div>
    </AppLayout>
  );
}