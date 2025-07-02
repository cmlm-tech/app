import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AgenteComStatus } from "@/pages/plenario/AgentesPublicos";

type StatusUsuarioBadgeProps = {
  status: string | null;
  agente: AgenteComStatus;
  onConvidar: (agente: AgenteComStatus) => void;
  onGerenciarConvitePendente: (agente: AgenteComStatus) => void;
};

export const StatusUsuarioBadge = ({ status, agente, onConvidar, onGerenciarConvitePendente }: StatusUsuarioBadgeProps) => {
    const getStatusConfig = (status: string | null) => {
        switch (status) {
          case 'Ativo':
            return { className: 'bg-green-100 text-green-800 hover:bg-green-200', text: 'Ativo', clickable: false, tooltip: 'Usuário ativo no sistema' };
          case 'Sem Acesso':
            return { className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer', text: 'Sem Acesso', clickable: true, action: 'convidar', tooltip: 'Clique para convidar este agente' };
          case 'Convite Pendente':
            return { className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer', text: 'Convite Pendente', clickable: true, action: 'gerenciar', tooltip: 'O convite está pendente. Clique para gerenciar.' };
          case 'Inativo':
            return { className: 'bg-red-100 text-red-800', text: 'Inativo', clickable: false, tooltip: 'Este agente não possui mais vínculo ativo' };
          default:
            return { className: 'bg-gray-100 text-gray-800', text: 'Indefinido', clickable: false, tooltip: 'Status não definido' };
        }
    };

    const config = getStatusConfig(status);

    const handleClick = () => {
        if (!config.clickable) return;
        if (config.action === 'convidar') {
            onConvidar(agente);
        } else if (config.action === 'gerenciar') {
            onGerenciarConvitePendente(agente);
        }
    };
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge className={config.className} onClick={handleClick} role={config.clickable ? "button" : undefined}>
                        {config.text}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent><p>{config.tooltip}</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
