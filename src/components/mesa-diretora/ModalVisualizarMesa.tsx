import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Membro = {
    cargo: string;
    agente_publico_id: number;
    agente?: {
        nome_completo: string;
        foto_url?: string;
    };
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    membros?: Membro[];
    isLoading?: boolean;
    onEditClick: () => void;
    isAdmin?: boolean;
};

const ORDEM_CARGOS = [
    "Presidente",
    "Vice-Presidente",
    "1º Secretário",
    "2º Secretário",
    "1º Tesoureiro",
    "2º Tesoureiro"
];

export default function ModalVisualizarMesa({
    open,
    onOpenChange,
    membros = [],
    isLoading = false,
    onEditClick,
    isAdmin = true
}: Props) {
    // Ordenar membros pela ordem dos cargos
    const membrosOrdenados = [...membros].sort((a, b) => {
        const indexA = ORDEM_CARGOS.indexOf(a.cargo);
        const indexB = ORDEM_CARGOS.indexOf(b.cargo);
        return indexA - indexB;
    });

    const getBadgeVariant = (cargo: string) => {
        if (cargo === "Presidente") return "default";
        if (cargo === "Vice-Presidente") return "secondary";
        return "outline";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Mesa Diretora</DialogTitle>
                        {isAdmin && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    onEditClick();
                                    onOpenChange(false);
                                }}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar Membros
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="py-4">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Skeleton className="h-40" />
                            <Skeleton className="h-40" />
                            <Skeleton className="h-40" />
                        </div>
                    ) : membrosOrdenados.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Nenhum membro definido para a Mesa Diretora.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {membrosOrdenados.map((membro) => (
                                <div
                                    key={membro.agente_publico_id}
                                    className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
                                >
                                    <Badge
                                        variant={getBadgeVariant(membro.cargo)}
                                        className="mb-3 text-xs"
                                    >
                                        {membro.cargo}
                                    </Badge>

                                    <Avatar className="h-20 w-20 mb-3">
                                        <AvatarImage
                                            src={membro.agente?.foto_url || undefined}
                                            alt={membro.agente?.nome_completo || "Membro"}
                                        />
                                        <AvatarFallback className="bg-gov-blue-100 text-gov-blue-800 text-lg">
                                            {membro.agente?.nome_completo?.charAt(0) || "?"}
                                        </AvatarFallback>
                                    </Avatar>

                                    <p className="text-sm font-medium text-center text-gray-800">
                                        {membro.agente?.nome_completo || "Não definido"}
                                    </p>
                                </div>
                            ))}

                            {/* Mostrar cargos vazios */}
                            {ORDEM_CARGOS.map((cargo) => {
                                const temMembro = membrosOrdenados.some(m => m.cargo === cargo);
                                if (temMembro) return null;

                                return (
                                    <div
                                        key={cargo}
                                        className="flex flex-col items-center p-4 border rounded-lg bg-gray-50"
                                    >
                                        <Badge variant="outline" className="mb-3 text-xs">
                                            {cargo}
                                        </Badge>

                                        <Avatar className="h-20 w-20 mb-3">
                                            <AvatarFallback className="bg-gray-200 text-gray-400">
                                                ?
                                            </AvatarFallback>
                                        </Avatar>

                                        <p className="text-sm text-gray-400 text-center">
                                            Não definido
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
