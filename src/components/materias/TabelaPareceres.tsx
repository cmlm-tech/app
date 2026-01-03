import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export interface Parecer {
    id: string;
    materiaRelacionada: string; // Ex: "Projeto de Lei 2025.000131"
    comissao: string;
    status: string;
    data: Date;
    url?: string;
}

interface TabelaPareceresProps {
    pareceres: Parecer[];
}

const statusColors: Record<string, string> = {
    "Elaboração": "bg-yellow-100 text-yellow-800",
    "Concluído": "bg-green-100 text-green-800",
    "Rascunho": "bg-gray-100 text-gray-800",
};

export function TabelaPareceres({ pareceres }: TabelaPareceresProps) {
    const navigate = useNavigate();

    if (pareceres.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>Nenhum parecer encontrado.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Matéria Relacionada</TableHead>
                        <TableHead>Comissão</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pareceres.map((parecer) => (
                        <TableRow key={parecer.id}>
                            <TableCell className="font-medium">{parecer.materiaRelacionada}</TableCell>

                            <TableCell>{parecer.comissao}</TableCell>

                            <TableCell>
                                <Badge className={statusColors[parecer.status] || "bg-gray-100 text-gray-800"}>
                                    {parecer.status}
                                </Badge>
                            </TableCell>

                            <TableCell>{format(parecer.data, "dd/MM/yyyy", { locale: ptBR })}</TableCell>

                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/documentos/pareceres/${parecer.id}/editar`)}
                                >
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Editar
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={!parecer.url}
                                    onClick={() => parecer.url && window.open(parecer.url, "_blank")}
                                    title={!parecer.url ? "PDF ainda não gerado" : "Visualizar PDF"}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Visualizar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
