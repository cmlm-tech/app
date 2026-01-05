import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vereadorNome: string;
    onConfirm: (dataRetorno: string) => void;
};

export default function ModalEncerrarLicenca({
    open,
    onOpenChange,
    vereadorNome,
    onConfirm
}: Props) {
    const [dataRetorno, setDataRetorno] = useState<string>("");

    // Reset ao abrir
    useEffect(() => {
        if (open) {
            setDataRetorno(new Date().toISOString().split('T')[0]); // Hoje
        }
    }, [open]);

    const handleConfirm = () => {
        if (!dataRetorno) return;
        onConfirm(dataRetorno);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Encerrar Licença</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                        Você está encerrando a licença de <strong>{vereadorNome}</strong>.
                    </p>

                    <div className="space-y-2">
                        <Label htmlFor="data-retorno">Data de Retorno</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="data-retorno"
                                type="date"
                                value={dataRetorno}
                                onChange={(e) => setDataRetorno(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            O titular retornará ao exercício e o suplente será afastado.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={!dataRetorno}>
                        Confirmar Retorno
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
