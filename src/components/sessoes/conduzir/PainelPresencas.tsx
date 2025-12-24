import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Presenca } from "@/services/sessaoConduzirService";

interface PainelPresencasProps {
    presencas: Presenca[];
    onAtualizarPresenca: (
        agentePublicoId: number,
        status: "Presente" | "Ausente" | "Ausente com Justificativa",
        justificativa?: string
    ) => Promise<void>;
}

export default function PainelPresencas({ presencas, onAtualizarPresenca }: PainelPresencasProps) {
    const [dialogJustificativa, setDialogJustificativa] = useState<{
        open: boolean;
        agentePublicoId: number;
        nome: string;
        justificativa: string;
    }>({ open: false, agentePublicoId: 0, nome: "", justificativa: "" });

    const [saving, setSaving] = useState<number | null>(null);

    const handleTogglePresenca = async (presenca: Presenca) => {
        setSaving(presenca.agente_publico_id);
        try {
            const novoStatus = presenca.status === "Presente" ? "Ausente" : "Presente";
            await onAtualizarPresenca(presenca.agente_publico_id, novoStatus);
        } finally {
            setSaving(null);
        }
    };

    const handleAbrirJustificativa = (presenca: Presenca) => {
        setDialogJustificativa({
            open: true,
            agentePublicoId: presenca.agente_publico_id,
            nome: presenca.vereador?.nome_parlamentar || presenca.vereador?.nome_completo || "Vereador",
            justificativa: presenca.justificativa || "",
        });
    };

    const handleSalvarJustificativa = async () => {
        setSaving(dialogJustificativa.agentePublicoId);
        try {
            await onAtualizarPresenca(
                dialogJustificativa.agentePublicoId,
                "Ausente com Justificativa",
                dialogJustificativa.justificativa
            );
            setDialogJustificativa((prev) => ({ ...prev, open: false }));
        } finally {
            setSaving(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Presente":
                return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case "Ausente com Justificativa":
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            default:
                return <XCircle className="w-5 h-5 text-red-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Presente":
                return <Badge className="bg-green-100 text-green-700">Presente</Badge>;
            case "Ausente com Justificativa":
                return <Badge className="bg-yellow-100 text-yellow-700">Justificado</Badge>;
            default:
                return <Badge className="bg-red-100 text-red-700">Ausente</Badge>;
        }
    };

    const getInitials = (nome: string) => {
        return nome
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Lista de Chamada</h3>
                <div className="text-sm text-gray-600">
                    {presencas.filter((p) => p.status === "Presente").length} de {presencas.length} presentes
                </div>
            </div>

            <div className="grid gap-3">
                {presencas.map((presenca) => {
                    const nome = presenca.vereador?.nome_parlamentar || presenca.vereador?.nome_completo || "Vereador";
                    const isLoading = saving === presenca.agente_publico_id;

                    return (
                        <div
                            key={presenca.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                                    {presenca.justificativa && (
                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                            {presenca.justificativa}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {getStatusBadge(presenca.status)}

                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`presenca-${presenca.id}`} className="sr-only">
                                        Marcar como presente
                                    </Label>
                                    <Switch
                                        id={`presenca-${presenca.id}`}
                                        checked={presenca.status === "Presente"}
                                        onCheckedChange={() => handleTogglePresenca(presenca)}
                                        disabled={isLoading}
                                    />
                                </div>

                                {presenca.status !== "Presente" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAbrirJustificativa(presenca)}
                                        disabled={isLoading}
                                    >
                                        {presenca.status === "Ausente com Justificativa" ? "Editar" : "Justificar"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {presencas.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p>Nenhum vereador encontrado</p>
                    <p className="text-sm">Verifique se há vereadores cadastrados na legislatura atual</p>
                </div>
            )}

            {/* Dialog de Justificativa */}
            <Dialog
                open={dialogJustificativa.open}
                onOpenChange={(open) => setDialogJustificativa((prev) => ({ ...prev, open }))}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Justificar Ausência</DialogTitle>
                        <DialogDescription>
                            Informe o motivo da ausência de {dialogJustificativa.nome}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="justificativa">Justificativa</Label>
                        <Textarea
                            id="justificativa"
                            value={dialogJustificativa.justificativa}
                            onChange={(e) =>
                                setDialogJustificativa((prev) => ({ ...prev, justificativa: e.target.value }))
                            }
                            placeholder="Ex: Viagem oficial, licença médica..."
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDialogJustificativa((prev) => ({ ...prev, open: false }))}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleSalvarJustificativa} disabled={saving !== null}>
                            Salvar Justificativa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
