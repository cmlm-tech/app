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
import { cn } from "@/lib/utils"; // Import cn para melhor concatenação de classes

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
        {/* ALTERAÇÃO 1: Adicionada a classe 'overflow-x-auto' para a tabela rolar no mobile */}
        <div className="border rounded-lg overflow-x-auto">
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
                  {/* ALTERAÇÃO 2: Lógica de espaçamento dos botões */}
                  <TableCell className="text-right">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button variant="outline" size="sm">Editar Nome</Button>
                      <Button variant="destructive" size="sm">Excluir</Button>
                    </div>
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