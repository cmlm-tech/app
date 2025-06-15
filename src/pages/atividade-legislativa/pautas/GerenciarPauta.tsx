
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function GerenciarPauta() {
  const { pautaId } = useParams();
  const isNew = pautaId === "nova";

  return (
    <AppLayout>
      <Link to="/atividade-legislativa/pautas">
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Pautas
        </Button>
      </Link>
      
      <h1 className="text-3xl font-bold text-gov-blue-800 mb-2">
        {isNew ? "Criar Nova Pauta" : "Editar Pauta"}
      </h1>
      <p className="text-gray-600 text-lg mb-6">
        {isNew 
          ? "Selecione uma sessão e adicione as matérias para compor a ordem do dia."
          : "Edite as informações e a ordem das matérias da pauta."
        }
      </p>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Página em Construção</h2>
        <p>Esta área permitirá a construção e edição da pauta, selecionando uma sessão e adicionando matérias legislativas.</p>
        <p className="mt-2 text-sm text-gray-500">
          <strong>Fluxo Previsto:</strong>
          <ol className="list-decimal list-inside ml-4 mt-1">
            <li>Selecionar uma Sessão agendada que ainda não possua pauta.</li>
            <li>Visualizar uma lista de Matérias disponíveis para inclusão.</li>
            <li>Adicionar, remover e reordenar as matérias na pauta.</li>
            <li>Salvar a pauta como "Em Elaboração" ou "Publicar".</li>
          </ol>
        </p>
      </div>
    </AppLayout>
  );
}
