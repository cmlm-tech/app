import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { prejudicarMateria } from "@/services/materiasService";

interface ModalPrejudicarMateriaProps {
    materiaId: number;
    protocolo: string;
    aberto: boolean;
    onClose: () => void;
    onSucesso: () => void;
}

export function ModalPrejudicarMateria({
    materiaId,
    protocolo,
    aberto,
    onClose,
    onSucesso,
}: ModalPrejudicarMateriaProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [justificativa, setJustificativa] = useState("");
    const [materiaSimilarId, setMateriaSimilarId] = useState("");

    async function handleConfirmar() {
        // Validar justificativa
        if (!justificativa.trim()) {
            toast({
                title: "Justificativa obrigatória",
                description: "Por favor, informe o motivo da declaração de prejudicada.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);

            // Buscar ID do usuário atual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            // Converter ID da matéria similar (se fornecido)
            const similarId = materiaSimilarId ? parseInt(materiaSimilarId) : null;

            await prejudicarMateria(
                materiaId,
                justificativa,
                similarId,
                user.id
            );

            toast({
                title: "Matéria declarada prejudicada",
                description: "A matéria foi arquivada como prejudicada.",
            });

            onSucesso();
            handleClose();
        } catch (error: any) {
            console.error('Erro ao declarar matéria prejudicada:', error);
            toast({
                title: "Erro ao declarar prejudicada",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        if (!loading) {
            setJustificativa("");
            setMateriaSimilarId("");
            onClose();
        }
    }

    return (
        <Dialog open={aberto} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Declarar Matéria Prejudicada</DialogTitle>
                    <DialogDescription>
                        A matéria será arquivada como prejudicada. Esta ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Use quando houver matéria idêntica ou similar já em tramitação.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="justificativa">
                            Justificativa <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="justificativa"
                            placeholder="Ex: Matéria idêntica PL 005/2025 já em tramitação..."
                            value={justificativa}
                            onChange={(e) => setJustificativa(e.target.value)}
                            rows={4}
                            disabled={loading}
                            required
                        />
                        <p className="text-xs text-gray-500">
                            Descreva o motivo da declaração de prejudicada
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="similar">Matéria similar (opcional)</Label>
                        <Input
                            id="similar"
                            type="number"
                            placeholder="ID da matéria similar"
                            value={materiaSimilarId}
                            onChange={(e) => setMateriaSimilarId(e.target.value)}
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500">
                            ID da matéria que causou a prejudicialidade (para referência)
                        </p>
                    </div>

                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <p><strong>Matéria:</strong> {protocolo}</p>
                        <p className="text-xs mt-1 text-amber-700">
                            ⚠️ Apenas membros da Mesa Diretora podem declarar matérias como prejudicadas
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirmar}
                        disabled={loading || !justificativa.trim()}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            'Confirmar'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
