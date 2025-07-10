import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormItem, FormLabel, FormControl, FormField } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import React from "react";
import { Link } from "react-router-dom";
// 1. IMPORTAÇÃO CORRIGIDA: Usa os novos nomes dos tipos
import { PeriodoRow, AgentePublicoRow } from "./types";

type FormValues = {
  presidenteId: string;
};

// 2. PROPS CORRIGIDAS: Usa os novos nomes dos tipos
type Props = {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  periodo: PeriodoRow | null;
  vereadores: AgentePublicoRow[];
  onSave: (data: FormValues) => void;
};

export function ModalGerenciarPeriodo({ open, onOpenChange, periodo, vereadores, onSave }: Props) {
  const form = useForm<FormValues>({
    defaultValues: { presidenteId: String((periodo as any)?.presidente_id || "") },
  });

  React.useEffect(() => {
    if (periodo) {
      form.reset({ presidenteId: String((periodo as any).presidente_id || "") });
    }
  }, [periodo, form]);

  if (!periodo) return null;

  function handleSubmit(data: FormValues) {
    onSave(data);
    onOpenChange(false);
  }
  
  const ano = new Date(periodo.data_inicio).getFullYear();

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar {periodo.descricao || `Período de ${ano}`}</DialogTitle>
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
                        <SelectItem key={v.id} value={String(v.id)}>
                          {v.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                    <Link to={`/plenario/mesa-diretora?periodoId=${periodo.id}`}>Definir Mesa Diretora de {ano}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                    <Link to={`/plenario/comissoes?periodoId=${periodo.id}`}>Definir Comissões de {ano}</Link>
                </Button>
            </div>
            
            <DialogFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}