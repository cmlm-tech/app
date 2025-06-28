
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, UserX, Mail } from "lucide-react";
import { AgentePublico } from "./types";
import { StatusUsuarioBadge } from "./StatusUsuarioBadge";

type TabelaAgentesPublicosProps = {
  agentes: AgentePublico[];
  onEditar: (agente: AgentePublico) => void;
  onDesativar: (agente: AgentePublico) => void;
  onConvidar: (agente: AgentePublico) => void;
};

export const TabelaAgentesPublicos = ({
  agentes,
  onEditar,
  onDesativar,
  onConvidar
}: TabelaAgentesPublicosProps) => {
  const formatarCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.$3-**");
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'Vereador' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

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
                  src={agente.foto || "/placeholder.svg"}
                  alt={agente.nomeCompleto}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{agente.nomeCompleto}</TableCell>
              <TableCell>
                <Badge className={getTipoColor(agente.tipo)}>
                  {agente.tipo}
                </Badge>
              </TableCell>
              <TableCell>
                {agente.tipo === 'Vereador' ? agente.nomeParlamantar : agente.cargo}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {formatarCPF(agente.cpf)}
              </TableCell>
              <TableCell>
                <StatusUsuarioBadge
                  status={agente.statusUsuario}
                  agente={agente}
                  onConvidar={onConvidar}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditar(agente)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {agente.statusUsuario === 'Sem Acesso' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onConvidar(agente)}
                      title="Convidar usuário"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDesativar(agente)}
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
