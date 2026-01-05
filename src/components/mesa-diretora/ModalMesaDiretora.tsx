import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Membro = {
    cargo: string;
    agente_publico_id: number;
};

type Vereador = {
    id: number;
    nome: string;
    foto?: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    membrosAtuais?: Membro[];
    vereadores: Vereador[];
    onSave: (membros: Membro[]) => void;
};

const CARGOS_FIXOS = [
    "Presidente",
    "Vice-Presidente",
    "1º Secretário",
    "2º Secretário",
    "1º Tesoureiro",
    "2º Tesoureiro"
];

export default function ModalMesaDiretora({
    open,
    onOpenChange,
    membrosAtuais = [],
    vereadores,
    onSave
}: Props) {
    const [membros, setMembros] = useState<Membro[]>([]);

    React.useEffect(() => {
        if (!open) return;

        // Inicializar com os cargos fixos
        const fixedMembros = CARGOS_FIXOS.map(cargo => {
            const membroExistente = membrosAtuais.find(m => m.cargo === cargo);
            return {
                cargo,
                agente_publico_id: membroExistente?.agente_publico_id || 0
            };
        });

        setMembros(fixedMembros);
    }, [membrosAtuais, open]);

    const handleRemoveMembro = (index: number) => {
        const newMembros = [...membros];
        newMembros[index] = { ...newMembros[index], agente_publico_id: 0 };
        setMembros(newMembros);
    };

    const updateMembro = (index: number, agente_publico_id: number) => {
        const newMembros = [...membros];
        newMembros[index] = { ...newMembros[index], agente_publico_id };
        setMembros(newMembros);
    };

    const handleSave = () => {
        // Filtrar apenas membros preenchidos
        const validMembros = membros.filter(m => m.agente_publico_id > 0);
        onSave(validMembros);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Gerenciar Mesa Diretora</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    {membros.map((membro, index) => {
                        // IDs já selecionados em outros cargos
                        const otherSelectedIds = membros
                            .filter((_, i) => i !== index)
                            .map(m => m.agente_publico_id)
                            .filter(id => id > 0);

                        // Vereadores disponíveis (não selecionados em outros cargos)
                        const availableOptions = vereadores.filter(v =>
                            !otherSelectedIds.includes(v.id)
                        );

                        // Cores das badges por tipo de cargo
                        const getBadgeVariant = (cargo: string) => {
                            if (cargo === "Presidente") return "default";
                            if (cargo === "Vice-Presidente") return "secondary";
                            if (cargo.includes("Secretário")) return "outline";
                            return "outline";
                        };

                        return (
                            <div key={index} className="flex gap-2 items-center">
                                <div className="w-[150px]">
                                    <Badge
                                        variant={getBadgeVariant(membro.cargo)}
                                        className="w-full justify-center py-1 text-xs"
                                    >
                                        {membro.cargo}
                                    </Badge>
                                </div>

                                <Select
                                    value={membro.agente_publico_id ? String(membro.agente_publico_id) : ""}
                                    onValueChange={(val) => updateMembro(index, Number(val))}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Selecione o Vereador" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableOptions.map(v => (
                                            <SelectItem key={v.id} value={String(v.id)}>
                                                {v.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-red-500"
                                    onClick={() => handleRemoveMembro(index)}
                                    title="Limpar seleção"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Mesa Diretora</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
