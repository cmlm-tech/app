import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ModalGerenciarMembros } from "@/components/comissoes/ModalGerenciarMembros";
import { CardMembroComissao } from "@/components/comissoes/CardMembroComissao";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMISSOES_MOCK, vereadoresMock } from "../data";

// Mock de permissão do admin
const IS_ADMIN = true;

export default function DetalheComissao() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Busca da comissão pelo id
  const comissao = COMISSOES_MOCK.find(c => c.id === id) || COMISSOES_MOCK[0];

  // Estado da composição atual para edição
  const [composicao, setComposicao] = React.useState(comissao.membros);
  const [anoSelecionado, setAnoSelecionado] = React.useState("2025");

  // Modal
  const [modalMembrosOpen, setModalMembrosOpen] = React.useState(false);

  // Função para buscar os dados do vereador pelo id
  const getVereador = (id: string) => vereadoresMock.find(v => v.id === id);

  // Função para salvar nova composição
  function handleSalvarComposicao(data: { presidente: string; relator: string; membros: string[] }) {
    const novaComposicao = [
      { papel: "presidente", id: data.presidente },
      { papel: "relator", id: data.relator },
      ...data.membros.filter(
        mId => mId !== data.presidente && mId !== data.relator
      ).map(id => ({ papel: "membro", id })),
    ];
    setComposicao(novaComposicao);
    setModalMembrosOpen(false);
  }

  // Extrair membros por papel
  const presidente = composicao.find((m) => m.papel === "presidente")?.id;
  const relator = composicao.find((m) => m.papel === "relator")?.id;
  const outrosMembros = composicao.filter((m) => m.papel === "membro").map((m) => m.id);

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              {/* O link de "Plenário" agora aponta para "vereadores" como página principal do módulo */}
              <a onClick={() => navigate("/plenario/vereadores")}>Plenário</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <a onClick={() => navigate("/plenario/comissoes")}>Comissões</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{comissao.nome}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Título da Comissão */}
      <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800 mb-1">
        Comissão de {comissao.nome.replace(/^Comissão de\s+/i, "")}
      </h1>
      {/* Competências */}
      <section className="my-6">
        <h2 className="text-xl font-semibold text-gov-blue-700 mb-2">Competências da Comissão</h2>
        <div className="bg-white p-4 rounded shadow-sm border text-gray-800 whitespace-pre-line">
          {comissao.competencias}
        </div>
      </section>
      {/* Composição Atual */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gov-blue-700">Composição</h2>
            {IS_ADMIN && (
              <Button onClick={() => setModalMembrosOpen(true)} variant="secondary">
                Gerenciar Membros para {anoSelecionado}
              </Button>
            )}
        </div>
        <div className="mb-4">
            <Label htmlFor="ano-select" className="text-sm text-gray-600">Exibindo composição para o período de:</Label>
            <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
            <SelectTrigger id="ano-select" className="w-[180px] mt-1">
                <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
                {["2025", "2026", "2027", "2028"].map(ano => (
                <SelectItem key={ano} value={ano}>{ano}</SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Presidente */}
          <CardMembroComissao
            papel="Presidente"
            vereador={presidente ? getVereador(presidente) : undefined}
          />
          {/* Relator */}
          <CardMembroComissao
            papel="Relator"
            vereador={relator ? getVereador(relator) : undefined}
          />
          {/* Membros */}
          {outrosMembros.length === 0 ? <div className="sm:col-span-2 text-gray-500 flex items-center">Nenhum membro titular definido.</div> : outrosMembros.map((id) =>
            <CardMembroComissao key={id} papel="Membro" vereador={getVereador(id)} />
          )}
        </div>
      </section>
      {/* Modal Gerenciar Membros */}
      {IS_ADMIN && (
        <ModalGerenciarMembros
          open={modalMembrosOpen}
          onOpenChange={setModalMembrosOpen}
          membros={composicao}
          todosVereadores={vereadoresMock}
          onSubmit={handleSalvarComposicao}
          nomeComissao={comissao.nome}
          ano={anoSelecionado}
        />
      )}
    </AppLayout>
  );
}
