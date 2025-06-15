
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { FormEvent, useState } from "react";
import { TipoMateria, StatusMateria, Materia } from "./types";

const tipos: TipoMateria[] = ["Projeto de Lei", "Ofício", "Requerimento", "Moção"];
const statusDefault: StatusMateria = "Protocolado";

const autoresExemplo = [
  "Vereador João Silva",
  "Vereadora Maria Souza",
  "Comissão de Cultura",
  "Mesa Diretora"
];

interface Props {
  aberto: boolean;
  onClose: () => void;
  onProtocolar: (m: Omit<Materia, "id">) => void;
}

export default function ModalNovaMateria({ aberto, onClose, onProtocolar }: Props) {
  const [tipo, setTipo] = useState<TipoMateria>("Projeto de Lei");
  const [autor, setAutor] = useState("");
  const [ementa, setEmenta] = useState("");
  const [anexos, setAnexos] = useState<File[]>([]);
  const [obs, setObs] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const dataProtocolo = new Date();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ementa.trim() || !tipo || !autor) return;
    onProtocolar({
      protocolo: protocolo || tipo?.slice(0,2).toUpperCase() + " " + Math.floor(Math.random()*100) + "/" + dataProtocolo.getFullYear(),
      tipo,
      autor,
      ementa,
      dataProtocolo,
      status: statusDefault
    });
    setTipo("Projeto de Lei"); setAutor(""); setEmenta(""); setObs(""); setAnexos([]);
  }

  return (
    <Dialog open={aberto} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Protocolar Nova Matéria Legislativa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Tipo */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Tipo de Matéria</label>
            <Select value={tipo} onValueChange={val => setTipo(val as TipoMateria)}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo"/></SelectTrigger>
              <SelectContent>
                {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* Número */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Número</label>
            <Input value={protocolo} onChange={e => setProtocolo(e.target.value)} placeholder="Ex: PL 15/2025 (gerado automaticamente)" />
          </div>
          {/* Data do Protocolo */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Data do Protocolo</label>
            <Input value={dataProtocolo.toLocaleDateString()} readOnly />
          </div>
          {/* Autor */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Autor</label>
            <Select value={autor} onValueChange={setAutor}>
              <SelectTrigger><SelectValue placeholder="Selecione o autor"/></SelectTrigger>
              <SelectContent>
                {autoresExemplo.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* Ementa */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Ementa/Assunto</label>
            <textarea className="w-full border rounded p-2 min-h-[70px]" required value={ementa} onChange={e=>setEmenta(e.target.value)} placeholder="Descreva brevemente o assunto da matéria..." />
          </div>
          {/* Anexos */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Anexar Arquivos</label>
            <Input type="file" multiple onChange={e => setAnexos([...e.target.files?Array.from(e.target.files):[]])} />
          </div>
          {/* Observações / Tramitação inicial */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Observações/Tramitação Inicial</label>
            <textarea className="w-full border rounded p-2 min-h-[50px]" value={obs} onChange={e=>setObs(e.target.value)} placeholder="Ex: Encaminhado à análise da Comissão de Justiça" />
          </div>
          {/* Rodapé */}
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="bg-gov-blue-700 hover:bg-gov-blue-800 text-white">
              Salvar e Protocolar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
