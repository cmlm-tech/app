
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { FiltroAgentesPublicos } from "@/components/agentes-publicos/FiltroAgentesPublicos";
import { TabelaAgentesPublicos } from "@/components/agentes-publicos/TabelaAgentesPublicos";
import { ModalAgentePublico } from "@/components/agentes-publicos/ModalAgentePublico";
import { AGENTES_MOCK } from "@/components/agentes-publicos/data";
import { AgentePublico } from "@/components/agentes-publicos/types";

export default function AgentesPublicos() {
  const [agentes, setAgentes] = useState<AgentePublico[]>(AGENTES_MOCK);
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('Todos');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [agenteEditando, setAgenteEditando] = useState<AgentePublico | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSalvarAgente = (dadosAgente: Partial<AgentePublico>) => {
    if (isEditing && agenteEditando) {
      // Editar agente existente
      setAgentes(prev => prev.map(a => 
        a.id === agenteEditando.id ? { ...a, ...dadosAgente } : a
      ));
    } else {
      // Criar novo agente
      const novoAgente: AgentePublico = {
        id: Date.now().toString(),
        nomeCompleto: dadosAgente.nomeCompleto || '',
        cpf: dadosAgente.cpf || '',
        foto: dadosAgente.foto || '/placeholder.svg',
        tipo: dadosAgente.tipo || 'Funcionário',
        statusUsuario: dadosAgente.statusUsuario || 'Sem Acesso',
        nomeParlamantar: dadosAgente.nomeParlamantar,
        perfil: dadosAgente.perfil,
        cargo: dadosAgente.cargo,
        tipoVinculo: dadosAgente.tipoVinculo,
        dataAdmissao: dadosAgente.dataAdmissao,
        dataExoneracao: dadosAgente.dataExoneracao
      };
      setAgentes(prev => [...prev, novoAgente]);
    }
  };

  const handleDesativarAgente = (agente: AgentePublico) => {
    setAgentes(prev => prev.map(a => 
      a.id === agente.id ? { ...a, statusUsuario: 'Inativo' as const } : a
    ));
  };

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
        {/* Cabeçalho da Página */}
        <div className="space-y-2">
          <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">
            Gerenciamento de Agentes Públicos
          </h1>
          <p className="text-gray-600">
            Cadastre e gerencie todos os vereadores e funcionários da Câmara.
          </p>
        </div>

        {/* Barra de Ações */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button onClick={handleNovoAgente} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Cadastrar Novo Agente Público
          </Button>
          
          <div className="text-sm text-gray-500">
            {agentesFiltrados.length} de {agentes.length} agentes
          </div>
        </div>

        {/* Filtros */}
        <FiltroAgentesPublicos
          busca={busca}
          setBusca={setBusca}
          tipoFiltro={tipoFiltro}
          setTipoFiltro={setTipoFiltro}
          statusFiltro={statusFiltro}
          setStatusFiltro={setStatusFiltro}
        />

        {/* Tabela */}
        <TabelaAgentesPublicos
          agentes={agentesFiltrados}
          onEditar={handleEditarAgente}
          onDesativar={handleDesativarAgente}
        />

        {/* Modal */}
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
