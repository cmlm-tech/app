import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PARTIDOS, CARGOS_MESA, COMISSOES } from "./types";
import { useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export default function ModalNovoVereador({ open, onOpenChange }: Props) {
  const [nome, setNome] = useState("");
  const [partido, setPartido] = useState("");
  const [legislatura, setLegislatura] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [biografia, setBiografia] = useState("");
  const [cargoMesa, setCargoMesa] = useState("Nenhum");
  const [comissoes, setComissoes] = useState<string[]>([]);

  function handleComissaoToggle(comissao: string) {
    setComissoes((prev) =>
      prev.includes(comissao)
        ? prev.filter((c) => c !== comissao)
        : [...prev, comissao]
    );
  }
  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) setFoto(e.target.files[0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Envio do formulário (a implementar)
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Vereador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              placeholder="Nome do vereador"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="partido">Partido Político</Label>
            <Select value={partido} onValueChange={setPartido}>
              <SelectTrigger id="partido"><SelectValue placeholder="Partido Político" /></SelectTrigger>
              <SelectContent>
                {PARTIDOS.filter(p => p.nome !== "Todos").map(p => (
                  <SelectItem key={p.nome} value={p.nome}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="legislatura">Legislatura</Label>
            <Input
              id="legislatura"
              placeholder="Ex: 2025-2028"
              value={legislatura}
              onChange={e => setLegislatura(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="foto">Foto de Perfil</Label>
            <Input id="foto" type="file" accept="image/*" onChange={handleFotoChange} />
          </div>
          <div>
            <Label htmlFor="email">E-mail Institucional</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@cmlm.tech"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="telefone">Telefone do Gabinete</Label>
            <Input
              id="telefone"
              placeholder="(xx) xxxx-xxxx"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="biografia">Biografia</Label>
            <Textarea
              id="biografia"
              placeholder="Biografia"
              value={biografia}
              onChange={e => setBiografia(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="cargoMesa">Atribuição na Mesa Diretora</Label>
            <Select value={cargoMesa} onValueChange={setCargoMesa}>
              <SelectTrigger id="cargoMesa"><SelectValue placeholder="Atribuição na Mesa Diretora" /></SelectTrigger>
              <SelectContent>
                {CARGOS_MESA.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Participação em Comissões</Label>
            <div className="flex flex-wrap gap-3 mt-1">
              {COMISSOES.filter(c => c !== "Todos").map(c => (
                <label key={c} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={comissoes.includes(c)}
                    onChange={() => handleComissaoToggle(c)}
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancelar
              </button>
            </DialogClose>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-gov-blue-700 hover:bg-gov-blue-900 text-white font-semibold"
            >
              Salvar Vereador
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
