import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { FormEvent, useState } from "react";
import { Wand2, Paperclip, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { TipoMateria, RetornoProtocolo } from "./types";

const tiposCriacao: TipoMateria[] = ["Projeto de Lei", "Ofício", "Requerimento", "Moção"];

const autoresExemplo = [
  { id: 1, nome: "Vereador João Silva" },
  { id: 2, nome: "Vereadora Ivete Moreira" },
  { id: 3, nome: "Comissão de Justiça" },
  { id: 4, nome: "Mesa Diretora" }
];

interface Props {
  aberto: boolean;
  onClose: () => void;
  onSucesso?: () => void;
}

export default function ModalNovaMateria({ aberto, onClose, onSucesso }: Props) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [tipo, setTipo] = useState<TipoMateria>("Ofício");
  const [autorId, setAutorId] = useState("");
  const [instrucaoIA, setInstrucaoIA] = useState("");
  const [anexos, setAnexos] = useState<File[]>([]);
  const [destinatario, setDestinatario] = useState("");
  const [cargo, setCargo] = useState("");
  const [orgao, setOrgao] = useState("");

  const dataProtocolo = new Date();
  const precisaDestinatario = tipo === "Ofício" || tipo === "Requerimento";

  const getTipoId = (t: string) => {
    switch (t) {
      case "Projeto de Lei": return 1;
      case "Ofício": return 2;
      case "Requerimento": return 3;
      case "Moção": return 4;
      default: return 1;
    }
  };

  const getPlaceholderIA = () => {
    switch (tipo) {
      case "Projeto de Lei": return "Ex: Institui a Semana Municipal de Tecnologia nas escolas...";
      case "Ofício": return "Ex: Solicita visita técnica para avaliar a reforma...";
      default: return "Descreva o objetivo da matéria...";
    }
  }

  function limparForm() {
    setTipo("Ofício");
    setAutorId("");
    setInstrucaoIA("");
    setAnexos([]);
    setDestinatario("");
    setCargo("");
    setOrgao("");
  }

  // Mudamos para aceitar "any" ou FormEvent para funcionar no onClick do botão também
  async function handleSubmit(e?: any) {
    if (e && e.preventDefault) e.preventDefault();

    console.log("1. CLIQUE DETECTADO! Iniciando...");
    setIsLoading(true);
    setStatusMsg("Validando...");

    try {
      if (!autorId) throw new Error("Selecione o Autor.");
      if (!instrucaoIA.trim()) throw new Error("Descreva o conteúdo.");

      console.log("2. Validação OK. Buscando usuário...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const nomeAutor = autoresExemplo.find(a => a.id.toString() === autorId)?.nome;

      console.log("3. Chamando RPC no Banco...");
      setStatusMsg("Reservando numeração...");

      const { data, error: erroDB } = await supabase.rpc('protocolar_materia', {
        p_tipo_documento_id: getTipoId(tipo),
        p_ano: new Date().getFullYear(),
        p_data_protocolo: new Date().toISOString(),
        p_autor_id: Number(autorId),
        p_autor_type: 'AgentePublico',
        p_texto_resumo: instrucaoIA,
        p_usuario_id: user.id,
        p_destinatario_nome: destinatario || null,
        p_destinatario_cargo: cargo || null,
        p_destinatario_orgao: orgao || null
      });

      if (erroDB) {
        console.error("ERRO SQL:", erroDB);
        throw erroDB;
      }

      const dadosProtocolo = data as unknown as RetornoProtocolo;
      console.log("4. Sucesso Banco:", dadosProtocolo);

      setStatusMsg("IA redigindo minuta...");
      console.log("5. Chamando Edge Function (IA)...");

      const { data: dataIA, error: erroEdge } = await supabase.functions.invoke('gerar-minuta', {
        body: {
          documento_id: dadosProtocolo.documento_id,
          protocolo_geral: dadosProtocolo.protocolo_geral,
          tipo: tipo,
          contexto: instrucaoIA,
          autor_nome: nomeAutor,
          destinatario: { nome: destinatario, cargo: cargo, orgao: orgao }
        }
      });

      if (erroEdge) console.warn("IA Falhou:", erroEdge);
      else console.log("6. Sucesso IA:", dataIA);

      setStatusMsg("Pronto!");
      if (onSucesso) onSucesso();
      onClose();

      console.log("7. Navegando...");
      navigate(`/painel/materias/${dadosProtocolo.documento_id}/editar`);

    } catch (error: any) {
      console.error("ERRO GERAL:", error);
      alert("Erro: " + error.message);
    } finally {
      setIsLoading(false);
      setStatusMsg("");
      limparForm();
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={v => !v && !isLoading && onClose()}>
      {/* CORREÇÃO 1: aria-describedby remove o aviso amarelo */}
      <DialogContent className="sm:max-w-[650px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-700">
            <Wand2 className="w-6 h-6" />
            Nova Matéria (Redação Assistida)
          </DialogTitle>
          <div className="text-sm text-gray-500 mt-1">
            Preencha os dados e a IA escreverá a minuta inicial.
          </div>
        </DialogHeader>

        <form className="space-y-3 pt-2">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4">
              <label className="block text-xs font-semibold text-gray-700 mb-0.5">Tipo</label>
              <Select value={tipo} onValueChange={val => setTipo(val as TipoMateria)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tiposCriacao.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-0.5">Data</label>
              <Input value={dataProtocolo.toLocaleDateString()} readOnly className="bg-gray-50 text-gray-500 h-8 text-xs" />
            </div>
            <div className="col-span-5">
              <label className="block text-xs font-semibold text-gray-700 mb-0.5">Autor</label>
              <Select value={autorId} onValueChange={setAutorId}>
                <SelectTrigger className={`h-8 text-xs ${!autorId ? "border-indigo-200 bg-indigo-50" : ""}`}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {autoresExemplo.map(a => <SelectItem key={a.id} value={a.id.toString()} className="text-xs">{a.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {precisaDestinatario && (
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-2">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12">
                  <Input value={destinatario} onChange={e => setDestinatario(e.target.value)} placeholder="Nome do Destinatário" className="bg-white h-8 text-xs" />
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

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-0.5">Instruções (IA)</label>
            <Textarea className="min-h-[80px] text-sm resize-none" required value={instrucaoIA} onChange={e => setInstrucaoIA(e.target.value)} placeholder={getPlaceholderIA()} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-0.5 flex items-center gap-1">
              <Paperclip className="w-3 h-3" /> Material de Apoio (Opcional)
            </label>
            <Input type="file" className="h-8 text-xs file:mr-2 file:py-0.5 file:px-2 file:text-[10px]" multiple onChange={e => setAnexos([...e.target.files ? Array.from(e.target.files) : []])} />
          </div>

          <DialogFooter className="pt-2 border-t mt-1">
            {!isLoading && <DialogClose asChild><Button type="button" variant="ghost" size="sm" className="h-8 text-xs">Cancelar</Button></DialogClose>}

            {/* CORREÇÃO 2: onClick direto no botão para garantir a chamada */}
            <Button
              type="button"
              onClick={handleSubmit}
              size="sm"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs min-w-[150px]"
            >
              {isLoading ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" />{statusMsg}</> : <><Wand2 className="mr-2 h-3 w-3" />Criar e Gerar Minuta</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}