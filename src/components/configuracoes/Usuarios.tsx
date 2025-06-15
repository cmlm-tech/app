
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const users = [
  { id: 1, nome: "Ana Silva", email: "ana.silva@email.com", nivel: "Administrador", status: "Ativo" },
  { id: 2, nome: "Carlos Souza", email: "carlos.souza@email.com", nivel: "Gabinete", status: "Ativo" },
  { id: 3, nome: "Mariana Costa", email: "mariana.costa@email.com", nivel: "Protocolo", status: "Inativo" },
];

export const AbaUsuarios = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gov-blue-800">Gerenciamento de Usuários</h2>
          <Button>
            + Convidar Novo Usuário
          </Button>
        </div>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nome}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.nivel}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm">Editar Permissões</Button>
                    <Button variant="outline" size="sm">
                      {user.status === 'Ativo' ? 'Desativar Usuário' : 'Ativar Usuário'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
