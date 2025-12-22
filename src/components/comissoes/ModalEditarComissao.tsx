
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Comissao } from "@/services/comissoesService";

type FormValues = {
    nome: string;
    descricao: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    comissao?: Comissao; // If present, edit mode
    onSave: (data: FormValues) => void;
};

export default function ModalEditarComissao({ open, onOpenChange, comissao, onSave }: Props) {
    const form = useForm<FormValues>({
        defaultValues: {
            nome: "",
            descricao: "",
        },
    });

    React.useEffect(() => {
        if (comissao) {
            form.reset({ nome: comissao.nome, descricao: comissao.descricao || "" });
        } else {
            form.reset({ nome: "", descricao: "" });
        }
    }, [comissao, open, form]);

    const handleSubmit = (data: FormValues) => {
        onSave(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{comissao ? "Editar Comissão" : "Nova Comissão"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Comissão</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Comissão de Justiça" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="descricao"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Descreva o propósito da comissão" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">Salvar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
