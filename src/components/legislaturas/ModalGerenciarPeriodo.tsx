
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormItem, FormLabel, FormControl, FormField } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import React from "react";
import { PeriodoLegislativo } from "./types";
import { Vereador } from "../vereadores/types";
import { Link } from "react-router-dom";

type FormValues = {
  presidenteId: string;
};

type Props = {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  periodo: PeriodoLegislativo | null;
  vereadores: Vereador[];
  onSave: (data: FormValues) => void;
};

export function ModalGerenciarPeriodo({ open, onOpenChange, periodo, vereadores, onSave }: Props) {
  const form = useForm<FormValues>({
    defaultValues: { presidenteId: periodo?.presidenteId || "" },
  });

  React.useEffect(() => {
    if (periodo) {
      form.reset({ presidenteId: periodo.presidenteId || "" });
    }
  }, [periodo, form]);

  if (!periodo) return null;

  function handleSubmit(data: FormValues) {
    onSave(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Período de {periodo.ano}</DialogTitle>
          <DialogDescription>Defina o presidente e acesse as composições deste período.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-6 pt-3"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="presidenteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Presidente do Período</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um vereador" />
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

            <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                    <Link to={`/plenario/mesa-diretora?periodo=${periodo.ano}`}>Definir Mesa Diretora de {periodo.ano}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                    <Link to={`/plenario/comissoes?periodo=${periodo.ano}`}>Definir Comissões de {periodo.ano}</Link>
                </Button>
            </div>
            
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

