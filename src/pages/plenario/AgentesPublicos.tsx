import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiltroAgentesPublicos } from "@/components/agentes-publicos/FiltroAgentesPublicos";
import { TabelaAgentesPublicos } from "@/components/agentes-publicos/TabelaAgentesPublicos";
import { ModalAgentePublico } from "@/components/agentes-publicos/ModalAgentePublico";
import { AgentePublico } from "@/components/agentes-publicos/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AgentesPublicos() {
  const { toast } = useToast();
  const [agentes, setAgentes] = useState<AgentePublico[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('Todos');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [agenteEditando, setAgenteEditando] = useState<AgentePublico | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Carregar agentes do Supabase
  const carregarAgentes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agentespublicos')
        .select(`
          *,
          vereadores (
            nome_parlamentar,
            perfil
          ),
          funcionarios (
            cargo,
            tipo_vinculo,
            data_admissao,
            data_exoneracao
          )
        `);

      if (error) throw error;

      const agentesFormatados: AgentePublico[] = data.map(agente => ({
        id: agente.id.toString(),
        nomeCompleto: agente.nome_completo,
        cpf: formatarCpf(agente.cpf || ''),
        foto: agente.foto_url || '/placeholder.svg',
        tipo: agente.tipo,
        statusUsuario: 'Sem Acesso' as const, // Default por enquanto
        // Campos de vereador
        nomeParlamantar: agente.vereadores?.[0]?.nome_parlamentar,
        perfil: agente.vereadores?.[0]?.perfil,
        // Campos de funcionário  
        cargo: agente.funcionarios?.[0]?.cargo,
        tipoVinculo: agente.funcionarios?.[0]?.tipo_vinculo,
        dataAdmissao: agente.funcionarios?.[0]?.data_admissao,
        dataExoneracao: agente.funcionarios?.[0]?.data_exoneracao
      }));

      setAgentes(agentesFormatados);
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de agentes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAgentes();
  }, []);

  // Função para formatar CPF
  const formatarCpf = (cpf: string): string => {
    if (!cpf) return '';
    const numbers = cpf.replace(/\D/g, '');
    return numbers
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace /(\d{3})(\d{1,2})/, '$1-$2');
  };

  // Filtrar agentes
  const agentesFiltrados = agentes.filter(agente => {
    const buscaMatch = agente.nomeCompleto.toLowerCase().includes(busca.toLowerCase()) ||
                      agente.cpf.includes(busca.replace(/\D/g, ''));
    const tipoMatch = tipoFiltro === 'Todos' || agente.tipo === tipoFiltro;
    const statusMatch = statusFiltro === 'Todos' || agente.statusUsuario === statusFiltro;
    
    return buscaMatch && tipoMatch && statusMatch;
  });

  const handleNovoAgente = () => {
    setAgenteEditando(null);
    setIsEditing(false);
    setModalAberto(true);
  };

  const handleEditarAgente = (agente: AgentePublico) => {
    setAgenteEditando(agente);
    setIsEditing(true);
    setModalAberto(true);
  };

  const handleSalvarAgente = async () => {
    // Recarregar a lista após salvar
    await carregarAgentes();
  };

  const handleDesativarAgente = (agente: AgentePublico) => {
    setAgentes(prev => prev.map(a => 
      a.id === agente.id ? { ...a, statusUsuario: 'Inativo' as const } : a
    ));
  };

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
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/plenario/agentes-publicos">Plenário</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Agentes Públicos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">
            Gerenciamento de Agentes Públicos
          </h1>
          <p className="text-gray-600">
            Cadastre gerencie todos os vereadores e funcionários da Câmara.
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
        />

        <ModalAgentePublico
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          onSave={handleSalvarAgente}
          agente={agenteEditando}
          isEditing={isEditing}
        />
      </div>
    </AppLayout>
  );
}
