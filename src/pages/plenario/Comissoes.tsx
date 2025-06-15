
import React from "react";
import { AppLayout } from "@/components/AppLayout";
import { CardComissao } from "@/components/comissoes/CardComissao";
import { ModalComissao } from "@/components/comissoes/ModalComissao";
import { ModalExcluirComissao } from "@/components/comissoes/ModalExcluirComissao";
import { Button } from "@/components/ui/button";

// MOCK de usuário admin. Troque para false p/ visualizar como usuário comum.
const IS_ADMIN = true;

// mocks de vereadores só para simular membros das comissões
const vereadoresMock = [
  {
    id: "1",
    nome: "Ana Souza",
    foto: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    id: "2",
    nome: "Carlos Lima",
    foto: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    id: "3",
    nome: "Beatriz Pereira",
    foto: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: "4",
    nome: "Paulo Silva",
    foto: "https://randomuser.me/api/portraits/men/44.jpg",
  },
  {
    id: "5",
    nome: "Lucas Gama",
    foto: "https://randomuser.me/api/portraits/men/92.jpg",
  },
];

type Comissao = {
  id: string;
  nome: string;
  competencias: string;
  membros: typeof vereadoresMock;
};

const INITIAL_COMISSOES: Comissao[] = [
  {
    id: "c1",
    nome: "Comissão de Constituição, Justiça e Redação",
    competencias: "Analisa projetos, emendas e matérias quanto à constitucionalidade, legalidade, jurídico, gramatical e lógica.",
    membros: [vereadoresMock[0], vereadoresMock[1], vereadoresMock[2]],
  },
  {
    id: "c2",
    nome: "Comissão de Finanças",
    competencias: "Examina leis orçamentárias, receitas, despesas municipais e assuntos financeiros, tributários e orçamentários.",
    membros: [vereadoresMock[3], vereadoresMock[0], vereadoresMock[4]],
  },
];

export default function ComissoesPlenario() {
  const [comissoes, setComissoes] = React.useState<Comissao[]>(INITIAL_COMISSOES);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalExcluirOpen, setModalExcluirOpen] = React.useState(false);
  const [editComissaoId, setEditComissaoId] = React.useState<string | null>(null);
  const [excluirComissaoId, setExcluirComissaoId] = React.useState<string | null>(null);

  // Pegando a comissão a editar pelo id
  const comissaoToEdit = comissoes.find((c) => c.id === editComissaoId) || null;
  const comissaoToDelete = comissoes.find((c) => c.id === excluirComissaoId) || null;

  // Handlers para adicionar/editar
  function handleSaveComissao(data: { nome: string; competencias: string }) {
    if (editComissaoId) {
      setComissoes((prev) =>
        prev.map((c) =>
          c.id === editComissaoId
            ? { ...c, nome: data.nome, competencias: data.competencias }
            : c
        )
      );
    } else {
      setComissoes((prev) => [
        ...prev,
        {
          id: `c${prev.length + 1}`,
          nome: data.nome,
          competencias: data.competencias,
          membros: [vereadoresMock[prev.length % vereadoresMock.length]], // Aleatório só para exemplo
        },
      ]);
    }
    setEditComissaoId(null);
    setModalOpen(false);
  }

  function handleExcluirComissao() {
    setComissoes((prev) => prev.filter((c) => c.id !== excluirComissaoId));
    setExcluirComissaoId(null);
    setModalExcluirOpen(false);
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">Gerenciamento de Comissões Permanentes</h1>
          <p className="text-gray-600 text-lg">Adicione, edite e organize os órgãos técnicos da Casa.</p>
        </div>
        {IS_ADMIN && (
          <Button
            onClick={() => {
              setEditComissaoId(null);
              setModalOpen(true);
            }}
            className="font-semibold text-lg"
          >
            + Adicionar Nova Comissão
          </Button>
        )}
      </div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 py-4 w-full">
        {comissoes.map((comissao) => (
          <CardComissao
            key={comissao.id}
            comissao={comissao}
            admin={IS_ADMIN}
            onVer={() => window.alert("Detalhe da comissão (página futura)")}
            onEditar={() => {
              setEditComissaoId(comissao.id);
              setModalOpen(true);
            }}
            onExcluir={() => {
              setExcluirComissaoId(comissao.id);
              setModalExcluirOpen(true);
            }}
          />
        ))}
      </div>
      <ModalComissao
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditComissaoId(null);
        }}
        onSubmit={handleSaveComissao}
        initial={
          comissaoToEdit
            ? { nome: comissaoToEdit.nome, competencias: comissaoToEdit.competencias }
            : undefined
        }
        editMode={!!editComissaoId}
      />
      <ModalExcluirComissao
        open={modalExcluirOpen}
        onOpenChange={setModalExcluirOpen}
        nome={comissaoToDelete?.nome ?? ""}
        onConfirm={handleExcluirComissao}
      />
    </AppLayout>
  );
}
