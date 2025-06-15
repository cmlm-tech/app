
import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import FiltroMaterias from "@/components/materias/FiltroMaterias";
import TabelaMaterias from "@/components/materias/TabelaMaterias";
import ModalNovaMateria from "@/components/materias/ModalNovaMateria";
import { Materia } from "@/components/materias/types";

// Matérias mock (seria trocado por API/backend)
const MOCK_MATERIAS: Materia[] = [
  {
    id: "1",
    protocolo: "PL 15/2025",
    tipo: "Projeto de Lei",
    ementa: "Dispõe sobre a criação do programa municipal de educação tecnológica.",
    autor: "Vereador João Silva",
    dataProtocolo: new Date("2025-06-10"),
    status: "Aprovado"
  },
  {
    id: "2",
    protocolo: "REQ 22/2025",
    tipo: "Requerimento",
    ementa: "Solicita informações sobre obras em andamento.",
    autor: "Vereadora Maria Souza",
    dataProtocolo: new Date("2025-06-14"),
    status: "Em análise"
  },
  {
    id: "3",
    protocolo: "MO 04/2024",
    tipo: "Moção",
    ementa: "Moção de aplausos ao grupo musical local.",
    autor: "Comissão de Cultura",
    dataProtocolo: new Date("2024-12-08"),
    status: "Aguardando votação"
  }
];

export default function Materias() {
  const [modalAberto, setModalAberto] = useState(false);
  const [materias, setMaterias] = useState<Materia[]>(MOCK_MATERIAS);
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [periodo, setPeriodo] = useState<{inicio: Date|null; fim: Date|null}>({inicio: null, fim: null});

  // Filtrar matérias
  const materiasFiltradas = materias.filter((m) => {
    const buscaOk =
      busca === "" ||
      m.protocolo.toLowerCase().includes(busca.toLowerCase()) ||
      m.ementa.toLowerCase().includes(busca.toLowerCase()) ||
      m.autor.toLowerCase().includes(busca.toLowerCase());
    const tipoOk = tipo === "Todos" || m.tipo === tipo;
    const statusOk = status === "Todos" || m.status === status;
    const periodoOk =
      (!periodo.inicio || m.dataProtocolo >= periodo.inicio) &&
      (!periodo.fim || m.dataProtocolo <= periodo.fim);

    return buscaOk && tipoOk && statusOk && periodoOk;
  }).sort((a, b) => b.dataProtocolo.getTime() - a.dataProtocolo.getTime());

  // Simula cadastro
  function handleProtocolar(nova: Omit<Materia, "id">) {
    setMaterias((mats) => [
      {
        ...nova,
        id: String(Math.random() * 100000)
      },
      ...mats
    ]);
    setModalAberto(false);
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800 mb-1">Matérias Legislativas</h1>
          <p className="text-gray-600 text-lg">Gerencie, protocole e acompanhe todos os documentos legislativos.</p>
        </div>
        {/* Barra de ações e filtros */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
          {/* Botão protocolar */}
          <div>
            <Button
              className="bg-gov-blue-700 hover:bg-gov-blue-800"
              onClick={() => setModalAberto(true)}
            >
              <Plus className="mr-2 w-4 h-4" />
              Protocolar Nova Matéria
            </Button>
          </div>
          <FiltroMaterias
            busca={busca}
            setBusca={setBusca}
            tipo={tipo}
            setTipo={setTipo}
            status={status}
            setStatus={setStatus}
            periodo={periodo}
            setPeriodo={setPeriodo}
          />
        </div>
        {/* Tabela */}
        <div className="rounded-lg bg-white shadow p-4">
          <TabelaMaterias materias={materiasFiltradas} />
        </div>
      </div>
      {/* Modal */}
      <ModalNovaMateria
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        onProtocolar={handleProtocolar}
      />
    </AppLayout>
  );
}
