import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VereadorComCondicao } from "@/components/legislaturas/types";
import { X, Pencil } from "lucide-react";

interface CardVereadorProps {
  vereador: VereadorComCondicao;
  isAdmin: boolean;
  onRemove: () => void;
  onEdit?: () => void;
  lideranca?: 'governo' | 'oposicao' | null;
}

export function CardVereador({ vereador, isAdmin, onRemove, onEdit, lideranca }: CardVereadorProps) {
  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0].substring(0, 2);
  };

  const nomeDisplay = vereador.nome_parlamentar || vereador.nome_completo;

  const liderancaConfig = lideranca === 'governo'
    ? { bg: 'bg-indigo-600', label: 'Líder do Governo' }
    : lideranca === 'oposicao'
      ? { bg: 'bg-red-600', label: 'Líder da Oposição' }
      : null;

  return (
    <Card className="w-full group relative">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={vereador.foto_url || undefined} alt={`Foto de ${vereador.nome_completo}`} />
            <AvatarFallback>{getInitials(vereador.nome_completo)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">{nomeDisplay}</CardTitle>
              {liderancaConfig && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`h-6 w-6 rounded-full ${liderancaConfig.bg} flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-help`}>
                        L
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{liderancaConfig.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={`${vereador.condicao === 'Titular' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {vereador.condicao}
              </Badge>
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}