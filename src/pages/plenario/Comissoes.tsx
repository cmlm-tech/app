
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CardComissao } from "@/components/comissoes/CardComissao";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCurrentPeriodo } from "@/services/legislaturaService";
import { getComissoesByPeriodo, Comissao } from "@/services/comissoesService";
import { Skeleton } from "@/components/ui/skeleton";

export default function ComissoesPlenario() {
  const { data: periodoAtual, isLoading: isLoadingPeriodo } = useQuery({
    queryKey: ["currentPeriodo"],
    queryFn: getCurrentPeriodo
  });

  const { data: comissoes = [], isLoading: isLoadingComissoes } = useQuery({
    queryKey: ["comissoes", periodoAtual?.id],
    queryFn: () => getComissoesByPeriodo(periodoAtual!.id),
    enabled: !!periodoAtual
  });

  const isLoading = isLoadingPeriodo || isLoadingComissoes;

  return (
    <AppLayout>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/plenario/vereadores">Plenário</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Comissões</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">
            Comissões Permanentes
          </h1>
          {periodoAtual && (
            <p className="text-gray-600">
              Vigência: {new Date(periodoAtual.data_inicio).getFullYear()} - {new Date(periodoAtual.data_fim).getFullYear()}
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : comissoes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comissoes.map((comissao: Comissao) => (
            // Adapter for CardComissao which expects specific props. 
            // In the future, CardComissao should imply accept Comissao interface directly.
            <CardComissao key={comissao.id} comissao={{
              id: String(comissao.id),
              nome: comissao.nome,
              competencias: comissao.descricao || "Sem descrição definida."
            }} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 col-span-full">
          Nenhuma comissão encontrada para o período atual.
        </div>
      )}
    </AppLayout>
  );
}
