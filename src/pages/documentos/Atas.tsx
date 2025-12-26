import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";

// Componentes
import FiltroAtas from "@/components/atas/FiltroAtas";
import TabelaAtas from "@/components/atas/TabelaAtas";
import { Ata } from "@/components/atas/types";
import { getAtasParaListagem } from "@/services/atasListService";
import { useToast } from "@/components/ui/use-toast";

export default function Atas() {
  const { toast } = useToast();
  const [atas, setAtas] = useState<Ata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos filtros
  const [busca, setBusca] = useState("");
  const [tipoSessao, setTipoSessao] = useState("Todas");
  const [periodo, setPeriodo] = useState<DateRange | undefined>();

  // Carregar atas ao montar o componente
  useEffect(() => {
    fetchAtas();
  }, []);

  async function fetchAtas() {
    setIsLoading(true);
    try {
      const atasData = await getAtasParaListagem();
      setAtas(atasData);
    } catch (error: any) {
      console.error("Erro ao carregar atas:", error);
      toast({
        title: "Erro ao carregar atas",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Filtrar atas
  const atasFiltradas = atas.filter((a) => {
    const buscaOk = busca === "" ||
      a.resumoPauta.toLowerCase().includes(busca.toLowerCase()) ||
      String(a.numeroSessao).includes(busca);
    const tipoOk = tipoSessao === "Todas" || a.tipoSessao === tipoSessao;
    const periodoOk = !periodo?.from ||
      (a.dataRealizacao >= periodo.from && a.dataRealizacao <= (periodo.to || periodo.from));
    return buscaOk && tipoOk && periodoOk;
  }).sort((a, b) => b.dataRealizacao.getTime() - a.dataRealizacao.getTime());

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800 mb-1">
            Atas das Sessões
          </h1>
          <p className="text-gray-600 text-lg">
            Consulte, pesquise e faça o download das atas de todas as sessões legislativas.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <FiltroAtas
            busca={busca}
            setBusca={setBusca}
            tipoSessao={tipoSessao}
            setTipoSessao={setTipoSessao}
            periodo={periodo}
            setPeriodo={setPeriodo}
          />
        </div>

        {/* Tabela */}
        <div className="rounded-lg bg-white shadow">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-gov-blue-600" />
              <span className="ml-3 text-gray-600">Carregando atas...</span>
            </div>
          ) : (
            <TabelaAtas atas={atasFiltradas} />
          )}
        </div>

        {/* Informação sobre como gerar atas */}
        {!isLoading && atas.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-600">
              Nenhuma ata registrada ainda.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              As atas são geradas automaticamente ao encerrar uma sessão em{" "}
              <span className="font-medium">Atividade Legislativa → Sessões → Conduzir</span>.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}