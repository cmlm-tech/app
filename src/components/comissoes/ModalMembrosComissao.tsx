
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Comissao, MembroComissao } from "@/services/comissoesService";
import { Vereador } from "@/services/vereadoresService";
import { Trash2, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    comissao: Comissao;
    vereadores: Vereador[];
    onSave: (membros: { cargo: string; agente_publico_id: number }[]) => void;
    vereadoresExcluidos?: number[];
};

const CARGOS = ["Presidente", "Relator", "Membro"];

export default function ModalMembrosComissao({ open, onOpenChange, comissao, vereadores, onSave, vereadoresExcluidos = [] }: Props) {
    const [membros, setMembros] = useState<{ cargo: string; agente_publico_id: number }[]>([]);

    React.useEffect(() => {
        if (!open) return;

        const currentMembros = comissao?.membros || [];
        const presidente = currentMembros.find(m => m.cargo === 'Presidente');
        const relator = currentMembros.find(m => m.cargo === 'Relator');
        const membrosComuns = currentMembros.filter(m => m.cargo === 'Membro');

        // Strictly 3 slots
        const fixedMembros = [
            { cargo: "Presidente", agente_publico_id: presidente?.agente_publico_id || 0 },
            { cargo: "Relator", agente_publico_id: relator?.agente_publico_id || 0 },
            { cargo: "Membro", agente_publico_id: membrosComuns[0]?.agente_publico_id || 0 }
        ];

        setMembros(fixedMembros);
    }, [comissao, open]);

    const handleRemoveMembro = (index: number) => {
        const newMembros = [...membros];
        // Always just clear the selection, never remove the row
        newMembros[index] = { ...newMembros[index], agente_publico_id: 0 };
        setMembros(newMembros);
    };

    const updateMembro = (index: number, field: "cargo" | "agente_publico_id", value: any) => {
        const newMembros = [...membros];
        newMembros[index] = { ...newMembros[index], [field]: value };
        setMembros(newMembros);
    };

    const handleSave = () => {
        // Filter out invalid entries
        const validMembros = membros.filter(m => m.agente_publico_id > 0);
        onSave(validMembros);
        onOpenChange(false);
    };

    const vereadoresDisponiveis = vereadores.filter(v => !vereadoresExcluidos.includes(v.id));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Membros da {comissao?.nome}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    {membros.map((membro, index) => {
                        // Calculate IDs selected in OTHER rows
                        const otherSelectedIds = membros
                            .filter((_, i) => i !== index)
                            .map(m => m.agente_publico_id)
                            .filter(id => id > 0);

                        // Filter available vereadores:
                        // 1. Not in global exclusion list (vereadoresExcluidos)
                        // 2. Not selected in other rows
                        const availableOptions = vereadores.filter(v =>
                            !vereadoresExcluidos.includes(v.id) &&
                            !otherSelectedIds.includes(v.id)
                        );

                        return (
                            <div key={index} className="flex gap-2 items-center">
                                <div className="w-[120px]">
                                    <Badge variant="secondary" className="w-full justify-center py-1">
                                        {membro.cargo}
                                    </Badge>
                                </div>

                                <Select
                                    value={membro.agente_publico_id ? String(membro.agente_publico_id) : ""}
                                    onValueChange={(val) => updateMembro(index, "agente_publico_id", Number(val))}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Selecione o Vereador" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableOptions.map(v => (
                                            <SelectItem key={v.id} value={String(v.id)}>
                                                <div className="flex items-center gap-2">
                                                    {v.nome}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleRemoveMembro(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        );
                    })}


                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Membros</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
