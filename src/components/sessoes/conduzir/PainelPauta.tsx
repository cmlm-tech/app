import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CheckCircle2,
    Clock,
    Vote,
    AlertCircle,
    FileText,
    ChevronRight
} from "lucide-react";
import { ItemPauta } from "@/services/sessaoConduzirService";

interface PainelPautaProps {
    itens: ItemPauta[];
    onIniciarVotacao: (item: ItemPauta) => Promise<void>;
    votacaoEmAndamento: boolean;
    temQuorum: boolean;
}

export default function PainelPauta({
    itens,
    onIniciarVotacao,
    votacaoEmAndamento,
    temQuorum
}: PainelPautaProps) {

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "Votado":
                return {
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    color: "bg-green-100 text-green-700",
                    label: "Votado"
                };
            case "Em Votação":
                return {
                    icon: <Vote className="w-4 h-4" />,
                    color: "bg-amber-100 text-amber-700 animate-pulse",
                    label: "Em Votação"
                };
            case "Adiado":
                return {
                    icon: <Clock className="w-4 h-4" />,
                    color: "bg-orange-100 text-orange-700",
                    label: "Adiado"
                };
            case "Retirado":
                return {
                    icon: <AlertCircle className="w-4 h-4" />,
                    color: "bg-gray-100 text-gray-700",
                    label: "Retirado"
                };
            default:
                return {
                    icon: <Clock className="w-4 h-4" />,
                    color: "bg-blue-100 text-blue-700",
                    label: "Pendente"
                };
        }
    };

    const formatProtocolo = (item: ItemPauta) => {
        if (!item.documento) return "Documento não encontrado";
        const tipo = item.documento.tipo?.nome || "DOC";
        const numero = item.documento.numero_protocolo_geral;
        const ano = item.documento.ano;
        return `${tipo} ${numero}/${ano}`;
    };

    // Encontrar o próximo item pendente
    const proximoPendente = itens.find(item => item.status_item === "Pendente");

    // Agrupar por tipo de item
    const expediente = itens.filter(i => i.tipo_item === "Expediente");
    const ordemDoDia = itens.filter(i => i.tipo_item === "Ordem do Dia");
    const explicacoes = itens.filter(i => i.tipo_item === "Explicações Pessoais");

    const renderItem = (item: ItemPauta) => {
        const statusConfig = getStatusConfig(item.status_item);
        const isPrimeiroPendente = item.id === proximoPendente?.id;
        const podeIniciarVotacao = isPrimeiroPendente && !votacaoEmAndamento && temQuorum;

        return (
            <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${isPrimeiroPendente && !votacaoEmAndamento
                        ? "border-gov-blue-300 bg-gov-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                        {item.ordem}
                    </div>
                    <div>
                        <p className="font-medium text-gov-blue-700">{formatProtocolo(item)}</p>
                        <p className="text-sm text-gray-500">{item.tipo_item}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge className={statusConfig.color}>
                        {statusConfig.icon}
                        <span className="ml-1">{statusConfig.label}</span>
                    </Badge>

                    {podeIniciarVotacao && (
                        <Button
                            size="sm"
                            className="bg-gov-blue-700 hover:bg-gov-blue-800"
                            onClick={() => onIniciarVotacao(item)}
                        >
                            <Vote className="w-4 h-4 mr-1" /> Iniciar Votação
                        </Button>
                    )}

                    {item.status_item === "Em Votação" && (
                        <Button size="sm" variant="secondary">
                            <ChevronRight className="w-4 h-4 mr-1" /> Ir para Votação
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    if (itens.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum item na pauta</p>
                <p className="text-sm">Monte a pauta antes de iniciar a sessão</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Mensagem se não tem quorum */}
            {!temQuorum && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-yellow-800">
                        Não há quorum suficiente para iniciar votações. Aguarde a chegada de mais vereadores.
                    </p>
                </div>
            )}

            {/* Resumo */}
            <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{itens.length} itens</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>{itens.filter(i => i.status_item === "Votado").length} votados</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{itens.filter(i => i.status_item === "Pendente").length} pendentes</span>
                </div>
            </div>

            {/* Expediente */}
            {expediente.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Expediente</h3>
                    <div className="space-y-2">
                        {expediente.map(renderItem)}
                    </div>
                </div>
            )}

            {/* Ordem do Dia */}
            {ordemDoDia.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Ordem do Dia</h3>
                    <div className="space-y-2">
                        {ordemDoDia.map(renderItem)}
                    </div>
                </div>
            )}

            {/* Explicações Pessoais */}
            {explicacoes.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Explicações Pessoais</h3>
                    <div className="space-y-2">
                        {explicacoes.map(renderItem)}
                    </div>
                </div>
            )}
        </div>
    );
}
