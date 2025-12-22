import { AppLayout } from "@/components/AppLayout";
import MesaDiretoraContent from "@/components/mesa-diretora/MesaDiretoraContent";
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function MesaDiretoraLegislatura() {
  const { legislaturaNumero, periodoId } = useParams();

  return (
    <AppLayout>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/atividade-legislativa/legislaturas">Legislaturas</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/atividade-legislativa/legislaturas/${legislaturaNumero}`}>
                {periodoId}ª Legislatura
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Mesa Diretora</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
        {/* A linha abaixo foi corrigida */}
      </Breadcrumb>

      <MesaDiretoraContent periodoId={Number(periodoId)} />
    </AppLayout>
  );
}