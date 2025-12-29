import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { VereadorComCondicao } from "./types";
import { X } from "lucide-react";

interface CardVereadorCompactoProps {
  vereador: VereadorComCondicao;
  lideranca?: 'governo' | 'oposicao' | null;
  isAdmin?: boolean;
  onRemove?: () => void;
}

const getInitials = (name: string) => {
  if (!name) return '??';
  const names = name.trim().split(' ');
  if (names.length > 1) {
    const firstInitial = names[0]?.[0] || '';
    const lastInitial = names[names.length - 1]?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }
  return (names[0] || '').substring(0, 2).toUpperCase();
};

export function CardVereadorCompacto({ vereador, lideranca, isAdmin, onRemove }: CardVereadorCompactoProps) {
  const nomeDisplay = vereador.nome_parlamentar || vereador.nome_completo;

  const liderancaConfig = lideranca === 'governo'
    ? { bg: 'bg-indigo-600', label: 'Líder do Governo' }
    : lideranca === 'oposicao'
      ? { bg: 'bg-red-600', label: 'Líder da Oposição' }
      : null;

  return (
    <div className="relative inline-block group">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Avatar className="h-12 w-12 cursor-pointer transition-transform hover:scale-105">
                <AvatarImage src={vereador.foto_url || undefined} alt={`Foto de ${vereador.nome_completo}`} />
                <AvatarFallback>{getInitials(vereador.nome_completo)}</AvatarFallback>
              </Avatar>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">{nomeDisplay}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">{vereador.condicao}</p>
              {liderancaConfig && (
                <Badge variant="outline" className={`text-xs ${liderancaConfig.bg} text-white border-none`}>
                  {liderancaConfig.label}
                </Badge>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isAdmin && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
          title="Remover vereador"
        >
          <X size={12} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
