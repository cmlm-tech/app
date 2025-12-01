import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { FormEvent, useState } from "react";
import { Wand2, Paperclip } from "lucide-react";
import { TipoMateria, Materia } from "./types";

const tipos: TipoMateria[] = ["Projeto de Lei", "Ofício", "Requerimento", "Moção"];

// Dados simulados (viriam da tabela AgentesPublicos)
const autoresExemplo = [
  "Vereador João Silva",
  "Vereadora Ivete Moreira",
  "Comissão de Justiça",
  "Mesa Diretora"
];

interface Props {
  aberto: boolean;
  onClose: () => void;
  onProtocolar: (m: Omit<Materia, "id">) => void;
}

export default function ModalNovaMateria({ aberto, onClose, onProtocolar }: Props) {
  const [tipo, setTipo] = useState<TipoMateria>("Ofício");
  const [autor, setAutor] = useState("");
  const [instrucaoIA, setInstrucaoIA] = useState(""); // Antiga Ementa
  const [anexos, setAnexos] = useState<File[]>([]);

  // Estados específicos (Ofício/Requerimento costumam ter destinatário)
  const [destinatario, setDestinatario] = useState("");
  const [cargo, setCargo] = useState("");
  const [orgao, setOrgao] = useState("");

  const dataProtocolo = new Date();

  // Define quais tipos precisam de dados de destinatário explícito no form
  const precisaDestinatario = tipo === "Ofício" || tipo === "Requerimento";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Validação Universal
    if (!autor) {
      alert("O Autor é obrigatório para gerar a numeração correta.");
      return;
    }
    if (!instrucaoIA.trim()) {
      alert("Descreva o conteúdo para a IA poder gerar o texto.");
      return;
    }
    // Validação Condicional
    if (precisaDestinatario && (!destinatario || !cargo)) {
      alert("Para este tipo de documento, informe o destinatário.");
      return;
    }

    // Payload de envio
    onProtocolar({
      protocolo: "", // Será gerado no backend
      tipo,
      autor,
      ementa: instrucaoIA, // Isso será o prompt inicial da IA
      dataProtocolo,
      status: "Rascunho", // REGRA MESTRA: Tudo nasce como rascunho para a IA escrever
      destinatario: precisaDestinatario ? destinatario : undefined,
      cargo: precisaDestinatario ? cargo : undefined,
      orgao: precisaDestinatario ? orgao : undefined,
      // O arquivo aqui é apenas apoio, não o final
    });

    limparForm();
  }

  function limparForm() {
    setTipo("Ofício");
    setAutor("");
    setInstrucaoIA("");
    setAnexos([]);
    setDestinatario("");
    setCargo("");
    setOrgao("");
  }

  // Helper para mudar o placeholder baseado no tipo
  const getPlaceholderIA = () => {
    switch (tipo) {
      case "Projeto de Lei": return "Ex: Institui a Semana Municipal de Tecnologia nas escolas. Art 1º cria a semana, Art 2º define objetivos...";
      case "Moção": return "Ex: Moção de Aplausos ao Grupo de Dança X pela apresentação no festival de inverno...";
      case "Ofício": return "Ex: Solicita visita técnica para avaliar a reforma do mercado público...";
      default: return "Descreva o objetivo da matéria...";
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-700">
            <Wand2 className="w-6 h-6" />
            Nova Matéria (Redação Assistida)
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Preencha os dados básicos. Nossa IA irá redigir a estrutura técnica e legal para você revisar.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">

          {/* LINHA 1: Classificação Básica e Autor */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4">
              <label className="block text-xs font-semibold text-gray-700 mb-0.5">Tipo de Matéria</label>
              <Select value={tipo} onValueChange={val => setTipo(val as TipoMateria)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tipos.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-0.5">Data</label>
              <Input value={dataProtocolo.toLocaleDateString()} readOnly className="bg-gray-50 text-gray-500 h-8 text-xs" />
            </div>
            <div className="col-span-5">
              <label className="block text-xs font-semibold text-gray-700 mb-0.5">Autor / Gabinete</label>
              <Select value={autor} onValueChange={setAutor}>
                <SelectTrigger className={`h-8 text-xs ${!autor ? "border-indigo-200 bg-indigo-50" : ""}`}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {autoresExemplo.map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* BLOCO CONDICIONAL: Destinatário */}
          {precisaDestinatario && (
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Destinatário</span>
                <span className="text-[10px] text-gray-400">(Quem receberá o documento)</span>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12">
                  <Input value={destinatario} onChange={e => setDestinatario(e.target.value)} placeholder="Nome Completo" className="bg-white h-8 text-xs" />
                </div>
                <div className="col-span-6">
                  <Input value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Cargo" className="bg-white h-8 text-xs" />
                </div>
                <div className="col-span-6">
                  <Input value={orgao} onChange={e => setOrgao(e.target.value)} placeholder="Órgão" className="bg-white h-8 text-xs" />
                </div>
              </div>
            </div>
          )}

          {/* LINHA 3: Instrução para a IA */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-0.5 flex justify-between">
              <span>Instruções para Redação (IA)</span>
              <span className="text-[10px] font-normal text-gray-500">Seja claro no objetivo</span>
            </label>
            <Textarea
              className="min-h-[80px] text-sm resize-none"
              required
              value={instrucaoIA}
              onChange={e => setInstrucaoIA(e.target.value)}
              placeholder={getPlaceholderIA()}
            />
          </div>

          {/* LINHA 4: Material de Apoio (Opcional) */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-0.5 flex items-center gap-1">
              <Paperclip className="w-3 h-3" /> Material de Apoio (Opcional)
            </label>
            <Input type="file" className="h-8 text-xs file:mr-2 file:py-0.5 file:px-2 file:text-[10px]" multiple onChange={e => setAnexos([...e.target.files ? Array.from(e.target.files) : []])} />
          </div>

          {/* RODAPÉ */}
          <DialogFooter className="pt-2 border-t mt-1">
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 text-xs">Cancelar</Button>
            </DialogClose>

            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:scale-[1.02] h-8 text-xs"
            >
              <Wand2 className="mr-2 h-3 w-3 animate-pulse" />
              Criar e Gerar Minuta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}