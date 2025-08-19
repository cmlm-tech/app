
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VereadorComCondicao } from "./types";

interface CardVereadorCompactoProps {
  vereador: VereadorComCondicao;
}

const getInitials = (name: string) => {
  if (!name) return '';
  const names = name.trim().split(' ');
  if (names.length > 1) {
    const firstInitial = names[0]?.[0] || '';
    const lastInitial = names[names.length - 1]?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }
  return (names[0] || '').substring(0, 2).toUpperCase();
};

export function CardVereadorCompacto({ vereador }: CardVereadorCompactoProps) {
  const nomeDisplay = vereador.nome_parlamentar || vereador.nome_completo;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="h-12 w-12 cursor-pointer">
            <AvatarImage src={vereador.foto_url || undefined} alt={`Foto de ${vereador.nome_completo}`} />
            <AvatarFallback>{getInitials(vereador.nome_completo)}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{nomeDisplay}</p>
          <p className="text-sm text-muted-foreground">{vereador.condicao}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
