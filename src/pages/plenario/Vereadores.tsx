import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import FiltroVereadores from "@/components/vereadores/FiltroVereadores";
import GridVereadores from "@/components/vereadores/GridVereadores";
import ModalNovoVereador from "@/components/vereadores/ModalNovoVereador";
import { Vereador } from "@/components/vereadores/types";

const VEREADORES_MOCK: Vereador[] = [
  {
    id: "1",
    nome: "Ana Paula Silva",
    partido: "Democratas",
    partidoLogo: "/partidos/democratas.png",
    cargoMesa: "Presidente",
    foto: "https://static.wikia.nocookie.net/simpsons/images/0/0b/Marge_Simpson.png", // Marge
    email: "anapaula@cmlm.tech",
    telefone: "(61) 1234-5678",
    biografia: "Advogada, atuante na defesa dos direitos humanos.",
    legislatura: "2025-2028",
    comissoes: ["Educação", "Saúde"],
  },
  {
    id: "2",
    nome: "Carlos Moura",
    partido: "Republicanos",
    partidoLogo: "/partidos/republicanos.png",
    cargoMesa: "",
    foto: "/vereadores/bart.png", // Usando imagem local
    email: "carlos@cmlm.tech",
    telefone: "(61) 8765-4321",
    biografia: "Empresário e líder comunitário.",
    legislatura: "2025-2028",
    comissoes: ["Finanças"],
  },
  {
    id: "3",
    nome: "Lívia Rocha",
    partido: "Progressistas",
    partidoLogo: "/partidos/progressistas.png",
    cargoMesa: "Vice-presidente",
    foto: "https://static.wikia.nocookie.net/simpsons/images/e/ec/Lisa_Simpson.png", // Lisa
    email: "livia@cmlm.tech",
    telefone: "(61) 2233-4455",
    biografia: "Professora e defensora do ensino público.",
    legislatura: "2025-2028",
    comissoes: ["Educação"],
  },
  {
    id: "4",
    nome: "Roberto Lima",
    partido: "Democratas",
    partidoLogo: "/partidos/democratas.png",
    cargoMesa: "",
    foto: "https://static.wikia.nocookie.net/simpsons/images/0/02/Homer_Simpson_2006.png", // Homer
    email: "roberto@cmlm.tech",
    telefone: "(61) 9988-7766",
    biografia: "Servidor público e líder sindical.",
    legislatura: "2025-2028",
    comissoes: ["Transportes", "Segurança Pública"],
  },
];

export default function VereadoresPlenario() {
  const [modalOpen, setModalOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [partido, setPartido] = useState("Todos");
  const [comissao, setComissao] = useState("Todos");

  // Filtro simples no mock
  const filteredVereadores = VEREADORES_MOCK.filter((v) => {
    const nomeOk = v.nome.toLowerCase().includes(busca.toLowerCase());
    const partidoOk = partido === "Todos" || v.partido === partido;
    const comissaoOk =
      comissao === "Todos" || v.comissoes.includes(comissao);
    return nomeOk && partidoOk && comissaoOk;
  });

  return (
    <AppLayout>
      <section className="mb-8">
        <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800 mb-1">Corpo Legislativo</h1>
        <p className="text-gray-600 text-lg">
          Conheça os vereadores da legislatura atual.
        </p>
      </section>
      <section className="flex items-end justify-between mb-6 flex-wrap gap-2">
        <div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gov-blue-700 hover:bg-gov-blue-900 text-white font-semibold px-5 py-2 rounded-md shadow transition-colors"
          >
            <span><svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14m7-7H5"/></svg></span>
            Adicionar Novo Vereador
          </button>
        </div>
        <FiltroVereadores
          busca={busca}
          setBusca={setBusca}
          partido={partido}
          setPartido={setPartido}
          comissao={comissao}
          setComissao={setComissao}
        />
      </section>
      <GridVereadores vereadores={filteredVereadores} />
      <ModalNovoVereador open={modalOpen} onOpenChange={setModalOpen} />
    </AppLayout>
  );
}
