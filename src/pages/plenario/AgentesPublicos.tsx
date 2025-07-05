import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { FiltroAgentesPublicos } from "@/components/agentes-publicos/FiltroAgentesPublicos";
import { TabelaAgentesPublicos } from "@/components/agentes-publicos/TabelaAgentesPublicos";
import { ModalAgentePublico } from "@/components/agentes-publicos/ModalAgentePublico";
import { ModalConviteUsuario } from "@/components/agentes-publicos/ModalConviteUsuario";
import { ModalConfirmacaoInativar } from "@/components/agentes-publicos/ModalConfirmacaoInativar";
import { ModalReativarUsuario } from "@/components/agentes-publicos/ModalReativarUsuario";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Database, Enums } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type AgenteComStatus = Database['public']['Functions']['get_agentes_publicos_com_status']['Returns'][number];

export default function AgentesPublicos() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [agentes, setAgentes] = useState<AgenteComStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [idAgenteLogado, setIdAgenteLogado] = useState<number | null>(null);

  // Estado para armazenar a permissão real do usuário, vinda do banco.
  const [permissaoLogado, setPermissaoLogado] = useState<string | null>(null);
  
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('Todos');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalConviteAberto, setModalConviteAberto] = useState(false);
  const [agenteEditando, setAgenteEditando] = useState<AgenteComStatus | null>(null);
  const [agenteConvidando, setAgenteConvidando] = useState<AgenteComStatus | null>(null);
  const [agenteParaInativar, setAgenteParaInativar] = useState<AgenteComStatus | null>(null);
  const [agenteComConvitePendente, setAgenteComConvitePendente] = useState<AgenteComStatus | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [agenteParaReativar, setAgenteParaReativar] = useState<AgenteComStatus | null>(null);

  const isAdmin = permissaoLogado?.toLowerCase() === 'admin';

  const carregarAgentes = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_agentes_publicos_com_status');
      if (error) throw error;
      setAgentes(data || []);
    } catch (error: unknown) {
      console.error('Erro ao carregar agentes:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar lista de agentes.";
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setLoading(true);
      if (user) {
        const { data: perfilData, error: perfilError } = await supabase
          .from('usuarios')
          .select('agente_publico_id, permissao')
          .eq('id', user.id)
          .single();

        if (perfilData) {
          setIdAgenteLogado(perfilData.agente_publico_id);
          setPermissaoLogado(perfilData.permissao); 
        } else {
          console.error("Erro ao buscar perfil do usuário logado:", perfilError);
          setPermissaoLogado('consultor');
        }
      } else {
        setPermissaoLogado(null); 
      }
      await carregarAgentes();
      setLoading(false);
    };

    carregarDadosIniciais();
  }, [carregarAgentes, user]);

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
    if (!isAdmin) return; // Segurança adicional
    setAgenteParaInativar(agente);
  };

  const handleReativarAgente = (agente: AgenteComStatus) => {
    if (!isAdmin) return; // Segurança adicional
    setAgenteParaReativar(agente);
  };

  const handleGerenciarConvitePendente = (agente: AgenteComStatus) => {
    if (!isAdmin) return;
    setAgenteComConvitePendente(agente);
  };

  const handleConfirmarReenvio = async () => {
    if (!agenteComConvitePendente || !isAdmin) return;
    try {
      const { error } = await supabase.functions.invoke('reenviar-convite-usuario', { body: { agente_publico_id: agenteComConvitePendente.id } });
      if (error) throw error;
      toast({ title: "Sucesso", description: `Convite reenviado para ${agenteComConvitePendente.nome_completo}.` });
      setAgenteComConvitePendente(null);
    } catch (error: unknown) {
      console.error('Erro ao reenviar convite:', error);
      const errorMessage = error instanceof Error ? error.message : "Falha ao reenviar o convite.";
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    }
  };

  const handleConfirmarCancelamento = async () => {
    if (!agenteComConvitePendente || !isAdmin) return;
    try {
      const { error } = await supabase.functions.invoke('cancelar-convite-usuario', { body: { agente_publico_id: agenteComConvitePendente.id } });
      if (error) throw error;
      toast({ title: "Sucesso", description: `Convite para ${agenteComConvitePendente.nome_completo} foi cancelado.` });
      setAgenteComConvitePendente(null);
      await carregarAgentes();
    } catch (error: unknown) {
      console.error('Erro ao cancelar convite:', error);
      const errorMessage = error instanceof Error ? error.message : "Falha ao cancelar o convite.";
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    }
  };

  const handleConfirmarInativacao = async () => {
    if (!agenteParaInativar || !isAdmin) return;
    try {
      const { data: usuarioData, error: fetchUserError } = await supabase.from('usuarios').select('id').eq('agente_publico_id', agenteParaInativar.id).single();
      if (fetchUserError || !usuarioData) throw new Error("Usuário não encontrado para inativação.");
      const { error: updatePermissionError } = await supabase.from('usuarios').update({ permissao: 'Inativo' }).eq('id', usuarioData.id);
      if (updatePermissionError) throw updatePermissionError;
      toast({ title: "Sucesso", description: `O agente ${agenteParaInativar.nome_completo} foi inativado.` });
      setAgenteParaInativar(null);
      await carregarAgentes();
    } catch (error: unknown) {
      console.error('Erro ao inativar agente:', error);
      const errorMessage = error instanceof Error ? error.message : "Falha ao inativar o agente.";
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    }
  };

  const handleConfirmarReativacao = async (novaPermissao: Enums<"permissao_usuario">) => {
    if (!agenteParaReativar || !isAdmin) return;
    try {
      const { data: usuarioData, error: fetchUserError } = await supabase.from('usuarios').select('id').eq('agente_publico_id', agenteParaReativar.id).single();
      if (fetchUserError || !usuarioData) throw new Error("Usuário não encontrado para reativação.");
      const { error: updatePermissionError } = await supabase.from('usuarios').update({ permissao: novaPermissao }).eq('id', usuarioData.id);
      if (updatePermissionError) throw updatePermissionError;
      toast({ title: "Sucesso", description: `O agente ${agenteParaReativar.nome_completo} foi reativado com sucesso.` });
      setAgenteParaReativar(null);
      await carregarAgentes();
    } catch (error: unknown) {
      console.error('Erro ao reativar agente:', error);
      const errorMessage = error instanceof Error ? error.message : "Falha ao reativar o agente.";
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
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
            {isAdmin ? "Gerenciamento de Agentes Públicos" : "Consulta de Agentes Públicos"}
          </h1>
          <p className="text-gray-600">
            {isAdmin
              ? "Cadastre, gerencie e controle o status de todos os vereadores e funcionários da Câmara."
              : "Visualize as informações e o status dos vereadores e funcionários da Câmara."}
          </p>
        </div>
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {isAdmin && (
            <Button onClick={handleNovoAgente} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Cadastrar Novo Agente Público
            </Button>
          )}
          <div className="text-sm text-gray-500 ml-auto">
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
          onEditar={isAdmin ? handleEditarAgente : undefined}
          onDesativar={isAdmin ? handleDesativarAgente : undefined}
          onConvidar={isAdmin ? handleConvidarAgente : undefined}
          onGerenciarConvitePendente={isAdmin ? handleGerenciarConvitePendente : undefined}
          onReativar={isAdmin ? handleReativarAgente : undefined}
          idAgenteLogado={idAgenteLogado}
          permissaoUsuarioLogado={permissaoLogado}
        />
        {isAdmin && (
            <>
                <ModalAgentePublico isOpen={modalAberto} onClose={() => setModalAberto(false)} onSave={handleAcaoConcluida} agente={agenteEditando} isEditing={isEditing} />
                <ModalConviteUsuario isOpen={modalConviteAberto} onClose={() => setModalConviteAberto(false)} onConviteEnviado={handleAcaoConcluida} agente={agenteConvidando} />
                <ModalConfirmacaoInativar isOpen={!!agenteParaInativar} onClose={() => setAgenteParaInativar(null)} onConfirm={handleConfirmarInativacao} agente={agenteParaInativar} />
                <ModalReativarUsuario isOpen={!!agenteParaReativar} onClose={() => setAgenteParaReativar(null)} agente={agenteParaReativar} onConfirm={handleConfirmarReativacao} />
                <AlertDialog open={!!agenteComConvitePendente} onOpenChange={(open) => !open && setAgenteComConvitePendente(null)}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Gerenciar Convite Pendente</AlertDialogTitle>
                      <AlertDialogDescription>
                        O convite para {agenteComConvitePendente?.nome_completo} está pendente. O que deseja fazer?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <Button variant="destructive" onClick={handleConfirmarCancelamento}>Cancelar Convite</Button>
                        <Button onClick={handleConfirmarReenvio}>Reenviar Convite</Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </>
        )}
      </div>
    </AppLayout>
  );
}