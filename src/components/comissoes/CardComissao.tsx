
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

type Comissao = {
  id: string;
  nome: string;
  competencias: string;
};

interface CardComissaoProps {
  comissao: Comissao;
}

export const CardComissao = ({ comissao }: CardComissaoProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg text-gov-blue-800">{comissao.nome}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">{comissao.competencias}</p>
        <Link to={`/plenario/comissoes/${comissao.id}`} className="mt-auto">
          <Button variant="outline" className="w-full">
            Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
