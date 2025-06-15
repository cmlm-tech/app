
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormItem, FormLabel, FormControl, FormField } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Vereador } from "../vereadores/types";
import React from "react";
import { ComposicaoMesa } from "./types";

const CARGOS = [
  { key: "presidente", label: "Presidente" },
  { key: "vicePresidente", label: "Vice-Presidente" },
  { key: "primeiroSecretario", label: "1º Secretário" },
  { key: "segundoSecretario", label: "2º Secretário" },
  { key: "primeiroTesoureiro", label: "1º Tesoureiro" },
  { key: "segundoTesoureiro", label: "2º Tesoureiro" },
];

type Props = {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  vereadores: Vereador[];
  composicaoMesa: ComposicaoMesa;
  onSave: (comp: ComposicaoMesa) => void;
  ano: string;
};

export default function ModalEditarMesa({ open, onOpenChange, vereadores, composicaoMesa, onSave, ano }: Props) {
  const form = useForm<ComposicaoMesa>({
    defaultValues: composicaoMesa,
  });

  React.useEffect(() => {
    // Atualizar valores iniciais ao abrir o modal ou mudar a composição
    form.reset(composicaoMesa);
  }, [open, composicaoMesa, form]);

  function handleSubmit(data: ComposicaoMesa) {
    onSave(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Definir Composição da Mesa Diretora para {ano}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4 pt-3"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {CARGOS.map((cargo) => (
              <FormField
                key={cargo.key}
                control={form.control}
                name={cargo.key as keyof ComposicaoMesa}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{cargo.label}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Escolha o ${cargo.label}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vereadores.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            ))}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="default">
                Salvar Alterações para {ano}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
