import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ThumbsUp,
    ThumbsDown,
    Minus,
    CheckCircle2,
    XCircle,
    Loader2
} from "lucide-react";
import { ItemPauta, VotoIndividual, Presenca, calcularResultadoParcial } from "@/services/sessaoConduzirService";

interface PainelVotacaoProps {
    item: ItemPauta;
    votos: VotoIndividual[];
    presencas: Presenca[];
    onRegistrarVoto: (agentePublicoId: number, voto: "Sim" | "Não" | "Abstenção") => Promise<void>;
    onEncerrarVotacao: () => Promise<void>;
}

export default function PainelVotacao({
    item,
    votos,
    presencas,
    onRegistrarVoto,
    onEncerrarVotacao
}: PainelVotacaoProps) {
    const [saving, setSaving] = useState<number | null>(null);
    const [confirmEncerrar, setConfirmEncerrar] = useState(false);
    const [encerrando, setEncerrando] = useState(false);

    // Filtrar apenas vereadores presentes
    const vereadoresPresentes = presencas.filter(p => p.status === "Presente");

    // Calcular resultado parcial
    const resultado = calcularResultadoParcial(votos);
    const totalVotosValidos = resultado.sim + resultado.nao;
    const percentualSim = totalVotosValidos > 0 ? (resultado.sim / totalVotosValidos) * 100 : 0;
    const percentualNao = totalVotosValidos > 0 ? (resultado.nao / totalVotosValidos) * 100 : 0;

    // Verificar se todos votaram
    const votosRegistrados = votos.filter(v => v.voto && v.voto !== "Ausente").length;
    const todosVotaram = votosRegistrados >= vereadoresPresentes.length;

    const handleVoto = async (agentePublicoId: number, voto: "Sim" | "Não" | "Abstenção") => {
        setSaving(agentePublicoId);
        try {
            await onRegistrarVoto(agentePublicoId, voto);
        } finally {
            setSaving(null);
        }
    };

    const handleEncerrar = async () => {
        setEncerrando(true);
        try {
            await onEncerrarVotacao();
        } finally {
            setEncerrando(false);
            setConfirmEncerrar(false);
        }
    };

    const getVotoAtual = (agentePublicoId: number): string | null => {
        const voto = votos.find(v => v.agente_publico_id === agentePublicoId);
        return voto?.voto || null;
    };

    const getInitials = (nome: string) => {
        return nome
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    const formatProtocolo = () => {
        if (!item.documento) return "Documento";
        const tipo = item.documento.tipo?.nome || "DOC";
        const numero = item.documento.numero_protocolo_geral;
        const ano = item.documento.ano;
        return `${tipo} ${numero}/${ano}`;
    };

    return (
        <div className="space-y-6">
            {/* Header da Votação */}
            <Card className="border-amber-300 bg-amber-50">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl">Votação em Andamento</CardTitle>
                            <p className="text-lg font-semibold text-gov-blue-700 mt-1">
                                {formatProtocolo()}
                            </p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 animate-pulse">
                            Item {item.ordem} da Pauta
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Progresso */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Votos registrados: {votosRegistrados}/{vereadoresPresentes.length}</span>
                            <span>{todosVotaram ? "✅ Todos votaram" : "Aguardando votos..."}</span>
                        </div>
                        <Progress value={(votosRegistrados / vereadoresPresentes.length) * 100} />
                    </div>
                </CardContent>
            </Card>

            {/* Resultado Parcial */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Resultado Parcial</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <ThumbsUp className="w-8 h-8 mx-auto text-green-600 mb-2" />
                            <p className="text-3xl font-bold text-green-700">{resultado.sim}</p>
                            <p className="text-sm text-green-600">SIM</p>
                            {totalVotosValidos > 0 && (
                                <p className="text-xs text-gray-500">{percentualSim.toFixed(0)}%</p>
                            )}
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                            <ThumbsDown className="w-8 h-8 mx-auto text-red-600 mb-2" />
                            <p className="text-3xl font-bold text-red-700">{resultado.nao}</p>
                            <p className="text-sm text-red-600">NÃO</p>
                            {totalVotosValidos > 0 && (
                                <p className="text-xs text-gray-500">{percentualNao.toFixed(0)}%</p>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <Minus className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                            <p className="text-3xl font-bold text-gray-700">{resultado.abstencao}</p>
                            <p className="text-sm text-gray-600">ABSTENÇÃO</p>
                        </div>
                    </div>

                    {/* Indicador de tendência */}
                    {totalVotosValidos > 0 && (
                        <div className="mt-4 p-3 rounded-lg text-center border">
                            {resultado.sim > resultado.nao ? (
                                <div className="flex items-center justify-center gap-2 text-green-700">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="font-medium">Tendência: APROVAÇÃO</span>
                                </div>
                            ) : resultado.nao > resultado.sim ? (
                                <div className="flex items-center justify-center gap-2 text-red-700">
                                    <XCircle className="w-5 h-5" />
                                    <span className="font-medium">Tendência: REJEIÇÃO</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-amber-700">
                                    <Minus className="w-5 h-5" />
                                    <span className="font-medium">EMPATE (voto de minerva decide)</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lista de Votos */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Votos Nominais</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {vereadoresPresentes.map((presenca) => {
                            const nome = presenca.vereador?.nome_parlamentar || presenca.vereador?.nome_completo || "Vereador";
                            const votoAtual = getVotoAtual(presenca.agente_publico_id);
                            const isLoading = saving === presenca.agente_publico_id;

                            return (
                                <div
                                    key={presenca.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={presenca.vereador?.foto_url || undefined} alt={nome} />
                                            <AvatarFallback className="bg-gov-blue-100 text-gov-blue-700">
                                                {getInitials(nome)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{nome}</p>
                                            {votoAtual && (
                                                <Badge
                                                    className={
                                                        votoAtual === "Sim"
                                                            ? "bg-green-100 text-green-700"
                                                            : votoAtual === "Não"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-gray-100 text-gray-700"
                                                    }
                                                >
                                                    {votoAtual}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <RadioGroup
                                                value={votoAtual || ""}
                                                onValueChange={(value) =>
                                                    handleVoto(presenca.agente_publico_id, value as "Sim" | "Não" | "Abstenção")
                                                }
                                                className="flex gap-2"
                                            >
                                                <div className="flex items-center">
                                                    <RadioGroupItem value="Sim" id={`sim-${presenca.id}`} className="peer sr-only" />
                                                    <Label
                                                        htmlFor={`sim-${presenca.id}`}
                                                        className={`px-3 py-2 rounded cursor-pointer transition-colors ${votoAtual === "Sim"
                                                                ? "bg-green-600 text-white"
                                                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                                            }`}
                                                    >
                                                        <ThumbsUp className="w-4 h-4" />
                                                    </Label>
                                                </div>
                                                <div className="flex items-center">
                                                    <RadioGroupItem value="Não" id={`nao-${presenca.id}`} className="peer sr-only" />
                                                    <Label
                                                        htmlFor={`nao-${presenca.id}`}
                                                        className={`px-3 py-2 rounded cursor-pointer transition-colors ${votoAtual === "Não"
                                                                ? "bg-red-600 text-white"
                                                                : "bg-red-100 text-red-700 hover:bg-red-200"
                                                            }`}
                                                    >
                                                        <ThumbsDown className="w-4 h-4" />
                                                    </Label>
                                                </div>
                                                <div className="flex items-center">
                                                    <RadioGroupItem value="Abstenção" id={`abst-${presenca.id}`} className="peer sr-only" />
                                                    <Label
                                                        htmlFor={`abst-${presenca.id}`}
                                                        className={`px-3 py-2 rounded cursor-pointer transition-colors ${votoAtual === "Abstenção"
                                                                ? "bg-gray-600 text-white"
                                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                            }`}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Botão Encerrar */}
            <div className="flex justify-end">
                <Button
                    size="lg"
                    onClick={() => setConfirmEncerrar(true)}
                    disabled={votosRegistrados === 0}
                    className="bg-gov-blue-700 hover:bg-gov-blue-800"
                >
                    Encerrar Votação
                </Button>
            </div>

            {/* Dialog Confirmar Encerrar */}
            <AlertDialog open={confirmEncerrar} onOpenChange={setConfirmEncerrar}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Encerrar Votação</AlertDialogTitle>
                        <AlertDialogDescription>
                            {!todosVotaram && (
                                <p className="text-amber-600 mb-2">
                                    ⚠️ Atenção: Nem todos os vereadores votaram ({votosRegistrados}/{vereadoresPresentes.length})
                                </p>
                            )}
                            <p>
                                Deseja encerrar a votação de {formatProtocolo()}?
                            </p>
                            <p className="mt-2">
                                <strong>Resultado atual:</strong> {resultado.sim} SIM, {resultado.nao} NÃO, {resultado.abstencao} ABSTENÇÕES
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={encerrando}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleEncerrar} disabled={encerrando}>
                            {encerrando ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Encerrando...
                                </>
                            ) : (
                                "Confirmar"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
