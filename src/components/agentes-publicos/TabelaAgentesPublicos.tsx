import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, UserX, Mail } from "lucide-react";
import { StatusUsuarioBadge } from "./StatusUsuarioBadge";
import { AgenteComStatus } from "@/pages/plenario/AgentesPublicos"; // Importa o tipo unificado

import { UserCheck } from "lucide-react";

type TabelaAgentesPublicosProps = {
  agentes: AgenteComStatus[];
  onEditar: (agente: AgenteComStatus) => void;
  onDesativar: (agente: AgenteComStatus) => void;
  onConvidar: (agente: AgenteComStatus) => void;
  onGerenciarConvitePendente: (agente: AgenteComStatus) => void;
  onReativar: (agente: AgenteComStatus) => void;
  idAgenteLogado: number | null;
  permissaoUsuarioLogado: string | undefined;
};

export const TabelaAgentesPublicos = ({ agentes, onEditar, onDesativar, onConvidar, onGerenciarConvitePendente, onReativar, idAgenteLogado, permissaoUsuarioLogado }: TabelaAgentesPublicosProps) => {
  const formatarCPF = (cpf: string | null) => {
    if (!cpf) return 'N/A';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.$3-**");
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'Vereador' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const isAdmin = permissaoUsuarioLogado === 'Admin';

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Foto</TableHead>
            <TableHead>Nome Completo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Cargo/Nome Parlamentar</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Status do Usuário</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agentes.map((agente) => (
            <TableRow key={agente.id}>
              <TableCell>
                <img
                  src={agente.foto_url || "/placeholder.svg"}
                  alt={agente.nome_completo}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{agente.nome_completo}</TableCell>
              <TableCell>
                <Badge className={getTipoColor(agente.tipo)}>
                  {agente.tipo}
                </Badge>
              </TableCell>
              <TableCell>
                {agente.tipo === 'Vereador' ? agente.nome_parlamentar : agente.cargo}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {formatarCPF(agente.cpf)}
              </TableCell>
              <TableCell>
                <StatusUsuarioBadge
                  status={agente.status_usuario}
                  agente={agente}
                  onConvidar={onConvidar}
                  onGerenciarConvitePendente={onGerenciarConvitePendente}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                  {isAdmin && (
                    <>
                      {agente.status_usuario !== 'Inativo' && (
                        <Button variant="ghost" size="sm" onClick={() => onEditar(agente)}><Edit className="w-4 h-4" /></Button>
                      )}
                      {agente.status_usuario === 'Sem Acesso' && (
                        <Button variant="ghost" size="sm" onClick={() => onConvidar(agente)} title="Convidar usuário">
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}
                      {agente.status_usuario === 'Inativo' ? (
                        <Button variant="ghost" size="sm" onClick={() => onReativar(agente)} title="Reativar usuário">
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      ) : (
                        (agente.status_usuario === 'Ativo' || agente.status_usuario === 'Convite Pendente') && (agente.id !== idAgenteLogado) && (
                          <Button variant="ghost" size="sm" onClick={() => onDesativar(agente)} title="Desativar usuário">
                            <UserX className="w-4 h-4" />
                          </Button>
                        )
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
