
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

const tipos = [
  { id: 1, nome: "Projeto de Lei" },
  { id: 2, nome: "Ofício" },
  { id: 3, nome: "Requerimento" },
  { id: 4, nome: "Moção" },
];

export const AbaTiposMateria = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gov-blue-800">Gerenciar Tipos de Matéria</h2>
          <Button>
            + Adicionar Novo Tipo
          </Button>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipos.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell className="font-medium">{tipo.nome}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm">Editar Nome</Button>
                    <Button variant="destructive" size="sm">Excluir</Button>
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
