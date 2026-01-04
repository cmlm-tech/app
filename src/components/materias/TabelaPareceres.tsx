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

                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <button
                                        onClick={() => parecer.url && window.open(parecer.url, "_blank")}
                                        disabled={!parecer.url}
                                        title={!parecer.url ? "PDF ainda não gerado" : "Visualizar PDF"}
                                        className="hover:text-blue-700 text-gray-600 p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/documentos/pareceres/${parecer.id}/editar`)}
                                        title="Editar"
                                        className="hover:text-yellow-700 text-gray-600 p-2"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
