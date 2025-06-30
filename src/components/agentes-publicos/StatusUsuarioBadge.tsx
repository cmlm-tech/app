import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AgenteComStatus } from "@/pages/plenario/AgentesPublicos"; // CORREÇÃO: Importa o tipo correto

type StatusUsuarioBadgeProps = {
  status: string | null; // Pode ser nulo se o agente ainda não tiver status
  agente: AgenteComStatus;
  onConvidar: (agente: AgenteComStatus) => void;
};

// O resto do seu componente continua exatamente igual.
export const StatusUsuarioBadge = ({ status, agente, onConvidar }: StatusUsuarioBadgeProps) => {
    const getStatusConfig = (status: string | null) => {
        switch (status) {
          case 'Ativo':
            return { className: 'bg-green-100 text-green-800 hover:bg-green-200', text: 'Ativo', clickable: false, tooltip: 'Usuário ativo no sistema' };
          case 'Sem Acesso':
            return { className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer', text: 'Sem Acesso', clickable: true, tooltip: 'Clique para convidar este agente' };
          case 'Convite Pendente':
            return { className: 'bg-blue-100 text-blue-800', text: 'Convite Pendente', clickable: false, tooltip: 'Aguardando o usuário aceitar o convite' };
          case 'Inativo':
            return { className: 'bg-red-100 text-red-800', text: 'Inativo', clickable: false, tooltip: 'Este agente não possui mais vínculo ativo' };
          default:
            return { className: 'bg-gray-100 text-gray-800', text: 'Indefinido', clickable: false, tooltip: 'Status não definido' };
        }
    };
    const config = getStatusConfig(status);
    const handleClick = () => { if (config.clickable) { onConvidar(agente); } };
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
