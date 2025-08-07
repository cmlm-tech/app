import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VereadorComCondicao } from "@/pages/atividade-legislativa/DetalheLegislatura";
import { X } from "lucide-react";

interface CardVereadorProps {
  vereador: VereadorComCondicao;
  isAdmin: boolean;
  onRemove: () => void;
}

export function CardVereador({ vereador, isAdmin, onRemove }: CardVereadorProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0].substring(0, 2);
  };

  const nomeDisplay = vereador.nome_parlamentar || vereador.nome_completo;

  return (
    <Card className="w-full group relative">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={vereador.foto_url || undefined} alt={`Foto de ${vereador.nome_completo}`} />
          <AvatarFallback>{getInitials(vereador.nome_completo)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-base font-semibold">{nomeDisplay}</CardTitle>
          <Badge 
            className={`mt-1 ${vereador.condicao === 'Titular' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
          >
            {vereador.condicao}
          </Badge>
        </div>
        {isAdmin && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}