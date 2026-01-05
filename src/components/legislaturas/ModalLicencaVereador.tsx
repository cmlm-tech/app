import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";

type Vereador = {
    agente_publico_id: number;
    agente?: {
        nome_completo: string;
        nome_parlamentar?: string;
        foto_url?: string;
    };
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    titulares: Vereador[];
    suplentes: Vereador[];
    onSave: (titular_id: number, suplente_id: number, data_inicio: string) => void;
};

export default function ModalLicencaVereador({
    open,
    onOpenChange,
    titulares,
    suplentes,
    onSave
}: Props) {
    const [titularId, setTitularId] = useState<string>("");
    const [suplenteId, setSuplenteId] = useState<string>("");
    const [dataInicio, setDataInicio] = useState<string>("");

    // Reset ao abrir
    useEffect(() => {
        if (open) {
            setTitularId("");
            setSuplenteId("");
            setDataInicio(new Date().toISOString().split('T')[0]); // Hoje
        }
    }, [open]);

    const handleSave = () => {
        if (!titularId || !suplenteId || !dataInicio) {
            return;
        }

        onSave(parseInt(titularId), parseInt(suplenteId), dataInicio);
        onOpenChange(false);
    };

    const isValid = titularId && suplenteId && dataInicio;

    const getNome = (v: Vereador) => v.agente?.nome_parlamentar || v.agente?.nome_completo || "Sem nome";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Licença de Vereador</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Titular */}
                    <div className="space-y-2">
                        <Label htmlFor="titular">Vereador Titular</Label>
                        <Select value={titularId} onValueChange={setTitularId}>
                            <SelectTrigger id="titular">
                                <SelectValue placeholder="Selecione o titular que vai se afastar" />
                            </SelectTrigger>
                            <SelectContent>
                                {titulares.length === 0 ? (
                                    <div className="p-2 text-sm text-gray-500">Nenhum titular disponível</div>
                                ) : (
                                    titulares.map((v) => (
                                        <SelectItem key={v.agente_publico_id} value={String(v.agente_publico_id)}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={v.agente?.foto_url || undefined} />
                                                    <AvatarFallback className="text-xs">
                                                        {getNome(v).charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{getNome(v)}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Suplente */}
                    <div className="space-y-2">
                        <Label htmlFor="suplente">Suplente Substituto</Label>
                        <Select value={suplenteId} onValueChange={setSuplenteId}>
                            <SelectTrigger id="suplente">
                                <SelectValue placeholder="Selecione o suplente que vai assumir" />
                            </SelectTrigger>
                            <SelectContent>
                                {suplentes.length === 0 ? (
                                    <div className="p-2 text-sm text-gray-500">Nenhum suplente disponível</div>
                                ) : (
                                    suplentes.map((v) => (
                                        <SelectItem key={v.agente_publico_id} value={String(v.agente_publico_id)}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={v.agente?.foto_url || undefined} />
                                                    <AvatarFallback className="text-xs">
                                                        {getNome(v).charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{getNome(v)}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Data Início */}
                    <div className="space-y-2">
                        <Label htmlFor="data-inicio">Data de Início da Licença</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="data-inicio"
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            A data de retorno será definida quando a licença for encerrada.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={!isValid}>
                        Registrar Licença
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
