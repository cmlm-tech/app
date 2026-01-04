import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect } from "react";
import FiltroVereadores from "@/components/vereadores/FiltroVereadores";
import GridVereadores from "@/components/vereadores/GridVereadores";
import ModalNovoVereador from "@/components/vereadores/ModalNovoVereador";
import { getVereadoresAcervo, VereadorAcervo } from "@/services/vereadoresService";
import { Loader2 } from "lucide-react";

export default function VereadoresPlenario() {
  const [modalOpen, setModalOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [partido, setPartido] = useState("Todos");
  const [legislaturaId, setLegislaturaId] = useState<number | null>(null);

  const [vereadores, setVereadores] = useState<VereadorAcervo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarVereadores() {
      setLoading(true);
      setError(null);

      try {
        const data = await getVereadoresAcervo({
          legislaturaId: legislaturaId || undefined,
          partido: partido !== "Todos" ? partido : undefined,
          busca: busca || undefined,
        });

        setVereadores(data);
      } catch (err) {
        console.error('Erro ao carregar vereadores:', err);
        setError('Erro ao carregar vereadores. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    carregarVereadores();
  }, [legislaturaId, partido, busca]);

  // Transformar dados para o formato esperado pelo GridVereadores
  // (mantém compatibilidade com componente existente)
  const vereadoresParaGrid = vereadores.map(v => {
    // Pegar primeira legislatura (mais recente ou única)
    const primeiraLeg = v.legislaturas[0];

    return {
      id: v.id.toString(),
      nome: v.nome_parlamentar || v.nome_completo,
      partido: primeiraLeg?.partido || 'Sem Partido',
      partidoLogo: '/placeholder.svg', // TODO: implementar com dados reais
      cargoMesa: '', // TODO: buscar da mesa_diretora
      foto: v.foto_url || 'https://via.placeholder.com/150',
      email: v.email_gabinete || '',
      telefone: v.telefone_gabinete || '',
      biografia: v.perfil || v.biografia_completa || '',
      legislatura: v.legislaturas.map(l => l.legislatura_periodo).join(', '),
      comissoes: v.areas_atuacao || [], // Temporário - comissões devem vir de outra tabela
    };
  });

  return (
    <AppLayout>
      <section className="mb-8">
        <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800 mb-1">
          Acervo de Vereadores
        </h1>
        <p className="text-gray-600 text-lg">
          Conheça todos os vereadores que já passaram pela Câmara Municipal.
        </p>
      </section>

      <section className="flex items-end justify-between mb-6 flex-wrap gap-2">
        <div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gov-blue-700 hover:bg-gov-blue-900 text-white font-semibold px-5 py-2 rounded-md shadow transition-colors"
          >
            <span>
              <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 5v14m7-7H5" />
              </svg>
            </span>
            Adicionar Vereador ao Acervo
          </button>
        </div>

        <FiltroVereadores
          busca={busca}
          setBusca={setBusca}
          partido={partido}
          setPartido={setPartido}
          legislaturaId={legislaturaId}
          setLegislaturaId={setLegislaturaId}
        />
      </section>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-gov-blue-800" />
            <p className="text-gray-600">Carregando vereadores...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-gov-blue-700 hover:bg-gov-blue-900 text-white font-semibold px-5 py-2 rounded-md"
          >
            Tentar Novamente
          </button>
        </div>
      ) : vereadoresParaGrid.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {busca || partido !== "Todos" || legislaturaId
              ? "Nenhum vereador encontrado com os filtros aplicados."
              : "Nenhum vereador cadastrado no acervo."}
          </p>
        </div>
      ) : (
        <GridVereadores vereadores={vereadoresParaGrid} />
      )}

      <ModalNovoVereador open={modalOpen} onOpenChange={setModalOpen} />
    </AppLayout>
  );
}
