import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";
import { DateRange } from "react-day-picker";

// Importando os componentes filhos
import FiltroAtas from "@/components/atas/FiltroAtas";
import TabelaAtas from "@/components/atas/TabelaAtas";
import ModalNovaAta, { SessaoParaAta } from "@/components/atas/ModalNovaAta"; // Importando o tipo também
import { Ata } from "@/components/atas/types";

// --- 1. DADOS MOCK PARA AS ATAS EXISTENTES ---
const MOCK_ATAS: Ata[] = [
  {
    id: "1",
    numeroSessao: 13,
    tipoSessao: 'Ordinária',
    dataRealizacao: new Date("2025-04-22T14:00:00"),
    status: 'Realizada',
    resumoPauta: "Aprovação de parecer, apresentação de Decretos Legislativos, Moções e ofícios.",
    materiasDeliberadas: 3,
    presentes: 12,
    linkPDF: "/atas/Ata_13_2025_0000001.pdf"
  },
];

// --- 2. DADOS MOCK PARA AS SESSÕES REALIZADAS ---
// No futuro, isso viria da sua API. Note que a sessão 13 não está aqui,
// pois estamos simulando que ela já teve sua ata gerada (MOCK_ATAS acima).
const MOCK_SESSOES: SessaoParaAta[] = [
    { id: "s1", numero: 12, tipoSessao: 'Ordinária', dataAbertura: new Date("2025-04-15T14:00:00"), totalPresentes: 13, totalDeliberacoes: 1 },
    { id: "s2", numero: 5, tipoSessao: 'Solene', dataAbertura: new Date("2025-03-20T19:00:00"), totalPresentes: 13, totalDeliberacoes: 0 },
    { id: "s3", numero: 6, tipoSessao: 'Extraordinária', dataAbertura: new Date("2025-05-10T10:00:00"), totalPresentes: 11, totalDeliberacoes: 1 },
    { id: "s4", numero: 14, tipoSessao: 'Ordinária', dataAbertura: new Date("2025-04-29T14:00:00"), totalPresentes: 13, totalDeliberacoes: 5 },
];


export default function Atas() {
  const [modalAberto, setModalAberto] = useState(false);
  const [atas, setAtas] = useState<Ata[]>(MOCK_ATAS);
  const [sessoesDisponiveis, setSessoesDisponiveis] = useState<SessaoParaAta[]>(MOCK_SESSOES);

  // Estados dos filtros
  const [busca, setBusca] = useState("");
  const [tipoSessao, setTipoSessao] = useState("Todas");
  const [periodo, setPeriodo] = useState<DateRange | undefined>();

  const atasFiltradas = atas.filter((a) => {
    const buscaOk = busca === "" || a.resumoPauta.toLowerCase().includes(busca.toLowerCase()) || String(a.numeroSessao).includes(busca);
    const tipoOk = tipoSessao === "Todas" || a.tipoSessao === tipoSessao;
    const periodoOk = !periodo?.from || (a.dataRealizacao >= periodo.from && a.dataRealizacao <= (periodo.to || periodo.from));
    return buscaOk && tipoOk && periodoOk;
  }).sort((a, b) => b.dataRealizacao.getTime() - a.dataRealizacao.getTime());
  
  // --- 3. LÓGICA PARA FILTRAR SESSÕES QUE JÁ TÊM ATA ---
  // Isso garante que o modal só mostrará opções válidas.
  const sessoesSemAta = sessoesDisponiveis.filter(sessao => 
    !atas.some(ata => 
        ata.numeroSessao === sessao.numero && 
        ata.tipoSessao === sessao.tipoSessao
    )
  );

  function handleRegistrar(novaAta: Omit<Ata, "id">) {
    setAtas((atuais) => [
        { ...novaAta, id: String(Math.random()) },
        ...atuais
    ]);
    setModalAberto(false);
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800 mb-1">Atas das Sessões</h1>
          <p className="text-gray-600 text-lg">Consulte, pesquise e faça o download das atas de todas as sessões legislativas.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <Button
              className="bg-gov-blue-700 hover:bg-gov-blue-800 w-full md:w-auto"
              onClick={() => setModalAberto(true)}
            >
              <FilePlus className="mr-2 w-4 h-4" />
              Registrar Nova Ata
            </Button>
          </div>
          <FiltroAtas
            busca={busca}
            setBusca={setBusca}
            tipoSessao={tipoSessao}
            setTipoSessao={setTipoSessao}
            periodo={periodo}
            setPeriodo={setPeriodo}
          />
        </div>

        <div className="rounded-lg bg-white shadow">
          <TabelaAtas atas={atasFiltradas} />
        </div>
      </div>

      {/* --- 4. PASSANDO A LISTA DE SESSÕES FILTRADAS PARA O MODAL --- */}
      <ModalNovaAta
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        onRegistrar={handleRegistrar}
        sessoes={sessoesSemAta}
      />
    </AppLayout>
  );
}