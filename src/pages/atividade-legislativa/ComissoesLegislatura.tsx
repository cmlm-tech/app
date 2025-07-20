import { Link, useParams } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { COMISSOES_MOCK } from "../plenario/data";
import { CardComissao } from "@/components/comissoes/CardComissao";
import { AppLayout } from "@/components/AppLayout";

export default function ComissoesLegislatura() {
  const { legislaturaNumero, periodoId } = useParams();

  return (
    <AppLayout>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="../plenario/vereadores">Plenário</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Comissões</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">
          Comissões Permanentes
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMISSOES_MOCK.map((comissao) => (
          <CardComissao key={comissao.id} comissao={comissao} />
        ))}
      </div>
    </AppLayout>
  );
}

