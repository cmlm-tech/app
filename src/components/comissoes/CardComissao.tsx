
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Membro = {
  agente_publico_id: number;
  cargo: string;
  foto_url?: string;
  nome_completo?: string;
};

type Comissao = {
  id: string;
  nome: string;
  competencias: string;
  membros?: Membro[];
};

interface CardComissaoProps {
  comissao: Comissao;
}

export const CardComissao = ({ comissao }: CardComissaoProps) => {
  const membros = comissao.membros || [];

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg text-gov-blue-800">{comissao.nome}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">{comissao.competencias}</p>

        {/* Membros */}
        {membros.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500 font-medium">
                {membros.length} {membros.length === 1 ? 'membro' : 'membros'}
              </span>
            </div>
            <div className="flex -space-x-2">
              {membros.slice(0, 5).map((membro, idx) => (
                <Avatar
                  key={membro.agente_publico_id}
                  className="border-2 border-white h-8 w-8"
                  title={membro.nome_completo || 'Membro'}
                >
                  <AvatarImage src={membro.foto_url || undefined} alt={membro.nome_completo} />
                  <AvatarFallback className="text-xs bg-gov-blue-100 text-gov-blue-800">
                    {membro.nome_completo?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {membros.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-medium">+{membros.length - 5}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Link to={`/plenario/comissoes/${comissao.id}`} className="mt-auto">
          <Button variant="outline" className="w-full">
            Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
