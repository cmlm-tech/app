import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Comissao, MembroComissao } from "@/services/comissoesService";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    comissoes: Comissao[];
    isLoading?: boolean;
    onEditClick: (comissao: Comissao) => void;
    isAdmin?: boolean;
};

export default function ModalVisualizarComissoes({
    open,
    onOpenChange,
    comissoes = [],
    isLoading = false,
    onEditClick,
    isAdmin = true
}: Props) {
    const getMembros = (comissao: Comissao) => {
        const membros = comissao.membros || [];
        const presidente = membros.find(m => m.cargo === "Presidente");
        const relator = membros.find(m => m.cargo === "Relator");
        const membrosComuns = membros.filter(m => m.cargo === "Membro");

        return { presidente, relator, membros: membrosComuns };
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Comissões Permanentes</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-60" />
                            <Skeleton className="h-60" />
                            <Skeleton className="h-60" />
                        </div>
                    ) : comissoes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Nenhuma comissão cadastrada para este período.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {comissoes.map((comissao) => {
                                const { presidente, relator, membros } = getMembros(comissao);
                                const totalMembros = comissao.membros?.length || 0;

                                return (
                                    <Card key={comissao.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <CardTitle className="text-base font-semibold text-gov-blue-800 mb-1">
                                                        {comissao.nome}
                                                    </CardTitle>
                                                    {comissao.descricao && (
                                                        <p className="text-xs text-gray-500 line-clamp-2">
                                                            {comissao.descricao}
                                                        </p>
                                                    )}
                                                </div>
                                                {isAdmin && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            onEditClick(comissao);
                                                            onOpenChange(false);
                                                        }}
                                                        className="h-8 w-8 p-0 flex-shrink-0"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-3 pt-0">
                                            {/* Contador de membros */}
                                            <div className="flex items-center gap-2 text-xs text-gray-500 pb-2 border-b">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>{totalMembros} {totalMembros === 1 ? 'membro' : 'membros'}</span>
                                            </div>

                                            {/* Membros Principais - Layout horizontal compacto */}
                                            <div className="space-y-2">
                                                {/* Presidente */}
                                                {presidente && (
                                                    <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                                                        <Avatar className="h-10 w-10 flex-shrink-0">
                                                            <AvatarImage
                                                                src={presidente.agente?.foto_url || undefined}
                                                                alt={presidente.agente?.nome_completo}
                                                            />
                                                            <AvatarFallback className="bg-blue-600 text-white text-sm">
                                                                {presidente.agente?.nome_completo?.charAt(0) || "?"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <Badge variant="default" className="text-xs mb-1">
                                                                Presidente
                                                            </Badge>
                                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                                {presidente.agente?.nome_completo || "Não definido"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Relator */}
                                                {relator && (
                                                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                                        <Avatar className="h-10 w-10 flex-shrink-0">
                                                            <AvatarImage
                                                                src={relator.agente?.foto_url || undefined}
                                                                alt={relator.agente?.nome_completo}
                                                            />
                                                            <AvatarFallback className="bg-gray-600 text-white text-sm">
                                                                {relator.agente?.nome_completo?.charAt(0) || "?"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <Badge variant="secondary" className="text-xs mb-1">
                                                                Relator
                                                            </Badge>
                                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                                {relator.agente?.nome_completo || "Não definido"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Outros Membros - Pills compactas */}
                                                {membros.length > 0 && (
                                                    <div className="pt-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                Membros ({membros.length})
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {membros.map((membro) => (
                                                                <div
                                                                    key={membro.agente_publico_id}
                                                                    className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded"
                                                                    title={membro.agente?.nome_completo}
                                                                >
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarImage
                                                                            src={membro.agente?.foto_url || undefined}
                                                                            alt={membro.agente?.nome_completo}
                                                                        />
                                                                        <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                                                                            {membro.agente?.nome_completo?.charAt(0) || "?"}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-xs text-gray-700 max-w-[120px] truncate">
                                                                        {membro.agente?.nome_completo?.split(' ')[0]}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Sem membros */}
                                                {totalMembros === 0 && (
                                                    <p className="text-sm text-gray-400 italic text-center py-2">
                                                        Nenhum membro definido
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
