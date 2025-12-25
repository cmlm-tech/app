import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CheckCircle2,
    Clock,
    Vote,
    AlertCircle,
    FileText,
    ChevronRight,
    FileDown,
    BookOpen,
    AlertTriangle
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { ItemPauta } from "@/services/sessaoConduzirService";

// Tipos de documento que exigem votação nominal
const TIPOS_COM_VOTACAO = ["Projeto de Lei", "Requerimento", "Moção", "Projeto de Decreto Legislativo"];

// Tipos de documento que são apenas lidos (sem votação)
const TIPOS_APENAS_LEITURA = ["Ofício", "Indicação"];

interface PainelPautaProps {
    itens: ItemPauta[];
    onIniciarVotacao: (item: ItemPauta) => Promise<void>;
    onMarcarLido?: (item: ItemPauta) => Promise<void>;
    onGerarRelatorioVotacao?: (item: ItemPauta) => void;
    votacaoEmAndamento: boolean;
    temQuorum: boolean;
}

export default function PainelPauta({
    itens,
    onIniciarVotacao,
    onMarcarLido,
    onGerarRelatorioVotacao,
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
            case "Lido":
                return {
                    icon: <BookOpen className="w-4 h-4" />,
                    color: "bg-blue-100 text-blue-700",
                    label: "Lido"
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

    // Verifica se o tipo de documento exige votação
    const exigeVotacao = (item: ItemPauta): boolean => {
        const tipoNome = (item.documento as any)?.tipo?.nome || "";
        return TIPOS_COM_VOTACAO.includes(tipoNome);
    };

    const formatProtocolo = (item: ItemPauta) => {
        if (!item.documento) return "Documento não encontrado";
        const doc = item.documento as any;
        const tipo = doc.tipo?.nome || "DOC";

        // Buscar número específico do tipo de documento
        const numeroEspecifico =
            doc.projetosdelei?.[0]?.numero_lei ||
            doc.requerimentos?.[0]?.numero_requerimento ||
            doc.mocoes?.[0]?.numero_mocao ||
            doc.indicacoes?.[0]?.numero_indicacao ||
            doc.oficios?.[0]?.numero_oficio ||
            doc.projetosdedecretolegislativo?.[0]?.numero_decreto ||
            doc.numero_protocolo_geral;

        const numeroFormatado = String(numeroEspecifico).padStart(3, '0');
        return `${tipo} ${numeroFormatado}/${doc.ano}`;
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
        const itemExigeVotacao = exigeVotacao(item);
        const podeIniciarVotacao = isPrimeiroPendente && !votacaoEmAndamento && temQuorum && itemExigeVotacao;
        const podeMarcarLido = isPrimeiroPendente && !votacaoEmAndamento && !itemExigeVotacao;
        const isVotado = item.status_item === "Votado";
        const isLido = item.status_item === "Lido";

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

                    {/* Botão PDF para itens votados */}
                    {isVotado && onGerarRelatorioVotacao && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onGerarRelatorioVotacao(item)}
                            title="Gerar Certidão de Votação"
                        >
                            <FileDown className="w-4 h-4" />
                        </Button>
                    )}

                    {podeIniciarVotacao && (
                        (() => {
                            const exigeParecer = item.documento?.tipo?.exige_parecer !== false; // Default true (backwards compat)
                            const pareceresPendentes = item.documento?.pareceres?.filter(p => !['Finalizado', 'Emitido', 'Lido'].includes(p.status)) || [];

                            const statusDoc = (item.documento as any)?.status;

                            // Só considera pendência se o tipo exigir parecer
                            // Bloqueia se tiver pareceres não finalizados OU se o status for explicitamente "Em Comissão"
                            const temPendencias = (exigeParecer && pareceresPendentes.length > 0) || statusDoc === 'Em Comissão';

                            if (temPendencias) {
                                return (
                                    <div
                                        className="flex items-center text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-md border border-amber-200 select-none"
                                        title={statusDoc === 'Em Comissão' ? "Matéria em comissão" : `Aguardando: ${pareceresPendentes.map(p => p.comissao?.nome).join(', ')}`}
                                    >
                                        <AlertTriangle className="w-3 h-3 mr-1.5" />
                                        <span>{statusDoc === 'Em Comissão' ? "Em Comissão" : "Aguardando Parecer"}</span>
                                    </div>
                                );
                            }

                            return (
                                <Button
                                    size="sm"
                                    className="bg-gov-blue-700 hover:bg-gov-blue-800"
                                    onClick={() => onIniciarVotacao(item)}
                                >
                                    <Vote className="w-4 h-4 mr-1" /> Iniciar Votação
                                </Button>
                            );
                        })()
                    )}

                    {/* Botão para marcar como lido (Ofícios, Indicações) */}
                    {podeMarcarLido && onMarcarLido && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => onMarcarLido(item)}
                        >
                            <BookOpen className="w-4 h-4 mr-1" /> Marcar como Lido
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
