
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AgentePublico } from "./types";

type StatusUsuarioBadgeProps = {
  status: string;
  agente: AgentePublico;
  onConvidar: (agente: AgentePublico) => void;
};

export const StatusUsuarioBadge = ({
  status,
  agente,
  onConvidar
}: StatusUsuarioBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Ativo':
        return {
          className: 'bg-green-100 text-green-800 hover:bg-green-200',
          text: 'Ativo',
          clickable: false,
          tooltip: 'Usuário ativo no sistema'
        };
      case 'Sem Acesso':
        return {
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer',
          text: 'Sem Acesso',
          clickable: true,
          tooltip: 'Clique para convidar este agente'
        };
      case 'Convite Pendente':
        return {
          className: 'bg-blue-100 text-blue-800',
          text: 'Convite Pendente',
          clickable: false,
          tooltip: 'Aguardando o usuário aceitar o convite'
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-800',
          text: status,
          clickable: false,
          tooltip: status
        };
    }
  };

  const config = getStatusConfig(status);

  const handleClick = () => {
    if (config.clickable) {
      onConvidar(agente);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={config.className}
            onClick={handleClick}
            role={config.clickable ? "button" : undefined}
            tabIndex={config.clickable ? 0 : undefined}
          >
            {config.text}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
