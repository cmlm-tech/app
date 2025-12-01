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

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">

          {/* LINHA 1: Classificação Básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Matéria</label>
              <Select value={tipo} onValueChange={val => setTipo(val as TipoMateria)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Data de Entrada</label>
              <Input value={dataProtocolo.toLocaleDateString()} readOnly className="bg-gray-50 text-gray-500" />
            </div>
          </div>

          {/* LINHA 2: Autoria (Fundamental) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Autor / Gabinete</label>
            <Select value={autor} onValueChange={setAutor}>
              <SelectTrigger className={!autor ? "border-indigo-200 bg-indigo-50" : ""}>
                <SelectValue placeholder="Selecione o responsável..." />
              </SelectTrigger>
              <SelectContent>
                {autoresExemplo.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* BLOCO CONDICIONAL: Destinatário */}
          {precisaDestinatario && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded font-bold uppercase">Destinatário</span>
                <span className="text-xs text-gray-400">(Quem receberá o documento)</span>
              </div>
              <div>
                <Input value={destinatario} onChange={e => setDestinatario(e.target.value)} placeholder="Nome Completo (Ex: Sr. Prefeito...)" className="bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Cargo (Ex: Secretário)" className="bg-white" />
                <Input value={orgao} onChange={e => setOrgao(e.target.value)} placeholder="Órgão (Ex: Secretaria de Saúde)" className="bg-white" />
              </div>
            </div>
          )}

          {/* LINHA 3: Instrução para a IA */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex justify-between">
              <span>Instruções para Redação (IA)</span>
              <span className="text-xs font-normal text-gray-500">Seja claro no objetivo</span>
            </label>
            <Textarea
              className="min-h-[120px] text-base resize-y"
              required
              value={instrucaoIA}
              onChange={e => setInstrucaoIA(e.target.value)}
              placeholder={getPlaceholderIA()}
            />
          </div>

          {/* LINHA 4: Material de Apoio (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
              <Paperclip className="w-3 h-3" /> Material de Apoio (Opcional)
            </label>
            <Input type="file" className="text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" multiple onChange={e => setAnexos([...e.target.files ? Array.from(e.target.files) : []])} />
            <p className="text-[10px] text-gray-400 mt-1">Anexe fotos ou rascunhos que ajudem a IA (ainda não implementado leitura de img, apenas guarda referência).</p>
          </div>

          {/* RODAPÉ */}
          <DialogFooter className="pt-4 border-t mt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>

            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:scale-[1.02]"
            >
              <Wand2 className="mr-2 h-4 w-4 animate-pulse" />
              Criar e Gerar Minuta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}