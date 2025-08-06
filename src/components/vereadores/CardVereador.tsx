import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Vereador = Database['public']['Tables']['agentespublicos']['Row'];

interface CardVereadorProps {
  vereador: Vereador;
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

  return (
    <Card className="w-full group relative">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={vereador.foto_url || undefined} alt={`Foto de ${vereador.nome_completo}`} />
          <AvatarFallback>{getInitials(vereador.nome_completo)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-base font-semibold">{vereador.nome_completo}</CardTitle>
          {vereador.tipo === 'Vereador' && <Badge variant="secondary" className="mt-1">{vereador.tipo}</Badge>}
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