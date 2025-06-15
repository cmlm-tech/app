
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";

type Vereador = { id: string; nome: string; partido: string; foto: string };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  membros: { papel: string; id: string }[];
  todosVereadores: Vereador[];
  onSubmit: (data: { presidente: string; relator: string; membros: string[] }) => void;
  nomeComissao: string;
};

export function ModalGerenciarMembros({
  open,
  onOpenChange,
  membros,
  todosVereadores,
  onSubmit,
  nomeComissao,
}: Props) {
  // Estado local dos campos
  const presidenteAtual = membros.find(m => m.papel === "presidente")?.id || "";
  const relatorAtual = membros.find(m => m.papel === "relator")?.id || "";
  const membrosAtuais = membros.filter(m => m.papel === "membro").map(m => m.id);

  const [presidente, setPresidente] = React.useState(presidenteAtual);
  const [relator, setRelator] = React.useState(relatorAtual);
  const [membrosSelecionados, setMembrosSelecionados] = React.useState<string[]>(membrosAtuais);

  // Reset ao abrir o modal
  React.useEffect(() => {
    if (open) {
      setPresidente(presidenteAtual);
      setRelator(relatorAtual);
      setMembrosSelecionados(membrosAtuais);
    }
    // eslint-disable-next-line
  }, [open, presidenteAtual, relatorAtual, membrosAtuais]);

  function handleChangeMembro(id: string, checked: boolean) {
    setMembrosSelecionados((prev) =>
      checked
        ? [...prev, id]
        : prev.filter((m) => m !== id)
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!presidente || !relator) return;
    // Garante que presidente/relator não estão como membros duplicados
    const membrosUnicos = Array.from(
      new Set(membrosSelecionados.filter((id) => id !== presidente && id !== relator))
    );
    onSubmit({ presidente, relator, membros: membrosUnicos });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Membros da: <span className="text-gov-blue-800">{nomeComissao}</span></DialogTitle>
        </DialogHeader>
        <form className="space-y-5 pt-2" onSubmit={handleSubmit}>
          <div>
            <Label className="block mb-1">Presidente</Label>
            <Select value={presidente} onValueChange={setPresidente}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o Presidente" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {todosVereadores.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <span className="flex items-center gap-2">
                        <img src={v.foto} alt={v.nome} className="w-5 h-5 rounded-full" />
                        <span>{v.nome} <span className="ml-1 text-xs text-gray-400">({v.partido})</span></span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="block mb-1">Relator</Label>
            <Select value={relator} onValueChange={setRelator}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o Relator" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {todosVereadores.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <span className="flex items-center gap-2">
                        <img src={v.foto} alt={v.nome} className="w-5 h-5 rounded-full" />
                        <span>{v.nome} <span className="ml-1 text-xs text-gray-400">({v.partido})</span></span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="block mb-1">Membros Titulares</Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-auto pr-2">
              {todosVereadores.map((v) => (
                <label key={v.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={membrosSelecionados.includes(v.id)}
                    onCheckedChange={(checked: boolean) =>
                      handleChangeMembro(v.id, !!checked)
                    }
                    disabled={v.id === presidente || v.id === relator}
                  />
                  <img src={v.foto} alt={v.nome} className="w-6 h-6 rounded-full" />
                  <span>{v.nome} <span className="ml-1 text-xs text-gray-400">({v.partido})</span></span>
                  {(v.id === presidente || v.id === relator) && (
                    <span className="ml-2 text-xs text-gray-400 italic">
                      {v.id === presidente ? "Presidente" : "Relator"}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="default">Salvar Composição</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
