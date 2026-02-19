
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, UserX, Mail, UserCheck, MoreVertical } from "lucide-react";
import { StatusUsuarioBadge } from "./StatusUsuarioBadge";
import { AgenteComStatus } from "@/pages/plenario/AgentesPublicos";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CardAgentePublicoProps = {
  agente: AgenteComStatus;
  onEditar: (agente: AgenteComStatus) => void;
  onDesativar: (agente: AgenteComStatus) => void;
  onConvidar: (agente: AgenteComStatus) => void;
  onGerenciarConvitePendente: (agente: AgenteComStatus) => void;
  onReativar: (agente: AgenteComStatus) => void;
  idAgenteLogado: number | null;
  permissaoUsuarioLogado: string | null;
};

export const CardAgentePublico = ({ 
    agente, 
    onEditar, 
    onDesativar, 
    onConvidar, 
    onGerenciarConvitePendente, 
    onReativar, 
    idAgenteLogado, 
    permissaoUsuarioLogado 
}: CardAgentePublicoProps) => {

  const getTipoColor = (tipo: string) => {
    return tipo === 'Vereador' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const isAdmin = permissaoUsuarioLogado?.toLowerCase() === 'admin';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{agente.nome_completo}</CardTitle>
        <img
          src={agente.foto_url || "/assets/default-agent.svg"}
          alt={agente.nome_completo}
          className="w-10 h-10 rounded-full object-cover"
        />
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">
          {agente.tipo === 'Vereador' ? agente.nome_parlamentar : agente.cargo}
        </div>
        <div className="flex items-center pt-4">
            <StatusUsuarioBadge
                status={agente.status_usuario}
                agente={agente}
                onConvidar={onConvidar}
                onGerenciarConvitePendente={onGerenciarConvitePendente}
            />
        </div>
        <div className="flex justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> Visualizar</DropdownMenuItem>
                    {isAdmin && (
                        <>
                        {agente.status_usuario !== 'Inativo' && (
                            <DropdownMenuItem onClick={() => onEditar(agente)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                        )}
                        {agente.status_usuario === 'Sem Acesso' && (
                            <DropdownMenuItem onClick={() => onConvidar(agente)}><Mail className="mr-2 h-4 w-4" /> Convidar</DropdownMenuItem>
                        )}
                        {agente.status_usuario === 'Inativo' ? (
                            <DropdownMenuItem onClick={() => onReativar(agente)}><UserCheck className="mr-2 h-4 w-4" /> Reativar</DropdownMenuItem>
                        ) : (
                            (agente.status_usuario === 'Ativo' || agente.status_usuario === 'Convite Pendente') && (agente.id !== idAgenteLogado) && (
                            <DropdownMenuItem onClick={() => onDesativar(agente)}><UserX className="mr-2 h-4 w-4" /> Desativar</DropdownMenuItem>
                            )
                        )}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
