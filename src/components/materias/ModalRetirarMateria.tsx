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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { retirarMateria } from "@/services/materiasService";

interface ModalRetirarMateriaProps {
    materiaId: number;
    protocolo: string;
    autor: string;
    ehAdmin: boolean;
    aberto: boolean;
    onClose: () => void;
    onSucesso: () => void;
}

export function ModalRetirarMateria({
    materiaId,
    protocolo,
    autor,
    ehAdmin,
    aberto,
    onClose,
    onSucesso,
}: ModalRetirarMateriaProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [motivo, setMotivo] = useState("");
    const [emNomeDe, setEmNomeDe] = useState<'autor' | 'lider_governo'>('autor');

    async function handleConfirmar() {
        try {
            setLoading(true);

            // Buscar ID do usuário atual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            await retirarMateria(
                materiaId,
                motivo || null,
                user.id,
                ehAdmin ? emNomeDe : undefined
            );

            toast({
                title: "Matéria retirada com sucesso",
                description: "A matéria foi arquivada como retirada.",
            });

            onSucesso();
            onClose();
        } catch (error: any) {
            console.error('Erro ao retirar matéria:', error);
            toast({
                title: "Erro ao retirar matéria",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        if (!loading) {
            setMotivo("");
            setEmNomeDe('autor');
            onClose();
        }
    }

    return (
        <Dialog open={aberto} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Retirar Matéria {protocolo}</DialogTitle>
                    <DialogDescription>
                        Esta ação não pode ser desfeita. A matéria será arquivada.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {ehAdmin && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                ⚠️ Você está retirando como ADMIN
                            </AlertDescription>
                        </Alert>
                    )}

                    {ehAdmin && (
                        <div className="space-y-3">
                            <Label>Retirar em nome de:</Label>
                            <RadioGroup value={emNomeDe} onValueChange={(v) => setEmNomeDe(v as 'autor' | 'lider_governo')}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="autor" id="autor" />
                                    <Label htmlFor="autor" className="font-normal cursor-pointer">
                                        Autor da matéria
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="lider_governo" id="lider" />
                                    <Label htmlFor="lider" className="font-normal cursor-pointer">
                                        Líder do Governo
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="motivo">Motivo da retirada (opcional)</Label>
                        <Textarea
                            id="motivo"
                            placeholder="Descreva o motivo da retirada..."
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            rows={4}
                            disabled={loading}
                        />
                    </div>

                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <p><strong>Autor:</strong> {autor}</p>
                        <p><strong>Protocolo:</strong> {protocolo}</p>
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
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Retirando...
                            </>
                        ) : (
                            'Confirmar Retirada'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
