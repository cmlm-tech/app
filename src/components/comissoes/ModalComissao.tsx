
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormItem, FormLabel, FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";

type ModalComissaoProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: { nome: string; competencias: string }) => void;
  initial?: { nome: string; competencias: string };
  editMode?: boolean;
};

export function ModalComissao({
  open,
  onOpenChange,
  onSubmit,
  initial,
  editMode = false,
}: ModalComissaoProps) {
  const form = useForm<{ nome: string; competencias: string }>({
    defaultValues: initial || { nome: "", competencias: "" },
  });

  React.useEffect(() => {
    if (open) {
      form.reset(initial || { nome: "", competencias: "" });
    }
  }, [open, initial, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editMode ? "Editar Comissão" : "Adicionar Nova Comissão"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4 pt-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Comissão</FormLabel>
                  <FormControl>
                    <Input placeholder="Comissão de Meio Ambiente" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="competencias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competências</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva as competências da comissão..." rows={5} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="default">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
