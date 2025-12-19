import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { FormEvent, useState, useEffect } from "react";
import { Wand2, Paperclip, Loader2, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { TipoMateria, RetornoProtocolo } from "./types";

const tiposCriacao: TipoMateria[] = ["Projeto de Lei", "Ofício", "Requerimento", "Moção"];

// Tipos de Moção conforme ENUM do banco
const tiposMocao = ["Aplausos", "Pesar", "Repúdio", "Solidariedade", "Protesto"] as const;
type TipoMocao = typeof tiposMocao[number];

interface Autor {
  id: number;
  nome: string;
  cargo?: string;
}

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

  // Estados para armazenar os autores vindos do banco
  const [autores, setAutores] = useState<Autor[]>([]);

  // Estados específicos para Moção
  const [tipoMocao, setTipoMocao] = useState<TipoMocao>("Aplausos");
  const [homenageado, setHomenageado] = useState("");
  const [autoresSelecionados, setAutoresSelecionados] = useState<Autor[]>([]);
  const [dropdownAberto, setDropdownAberto] = useState(false);

  const dataProtocolo = new Date();
  const precisaDestinatario = tipo === "Ofício" || tipo === "Requerimento";
  const isMocao = tipo === "Moção";

  // Buscar autores ao abrir o modal
  useEffect(() => {
    if (aberto) {
      buscarAutores();
    }
  }, [aberto]);

  async function buscarAutores() {
    try {
      const { data, error } = await supabase
        .from('agentespublicos')
        .select('id, nome:nome_completo, cargo:tipo')
        .eq('tipo', 'Vereador')
        .order('nome_completo');

      if (error) throw error;
      if (data) setAutores(data);
    } catch (err) {
      console.error("Erro ao buscar autores:", err);
    }
  }

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
      case "Moção": return "Ex: Pelo nascimento de seu filho, ocorrido em 01/12/2025...";
      default: return "Descreva o objetivo da matéria...";
    }
  }

  // Funções auxiliares para multi-select de autores (Moção)
  const adicionarAutor = (autor: Autor) => {
    if (!autoresSelecionados.find(a => a.id === autor.id)) {
      setAutoresSelecionados([...autoresSelecionados, autor]);
    }
    setDropdownAberto(false);
  };

  const removerAutor = (autorId: number) => {
    setAutoresSelecionados(autoresSelecionados.filter(a => a.id !== autorId));
  };

  const autoresDisponiveis = autores.filter(
    a => !autoresSelecionados.find(sel => sel.id === a.id)
  );

  function limparForm() {
    setTipo("Ofício");
    setAutorId("");
    setInstrucaoIA("");
    setAnexos([]);
    setDestinatario("");
    setCargo("");
    setOrgao("");
    // Moção
    setTipoMocao("Aplausos");
    setHomenageado("");
    setAutoresSelecionados([]);
  }

  // Mudamos para aceitar "any" ou FormEvent para funcionar no onClick do botão também
  async function handleSubmit(e?: any) {
    if (e && e.preventDefault) e.preventDefault();

    console.log("1. CLIQUE DETECTADO! Iniciando...");
    setIsLoading(true);
    setStatusMsg("Validando...");

    try {
      // Validações específicas por tipo
      if (isMocao) {
        if (autoresSelecionados.length === 0) throw new Error("Selecione pelo menos um Autor.");
        if (!homenageado.trim()) throw new Error("Informe o homenageado/destinatário da moção.");
      } else {
        if (!autorId) throw new Error("Selecione o Autor.");
      }
      if (!instrucaoIA.trim()) throw new Error("Descreva o conteúdo.");

      console.log("2. Validação OK. Buscando usuário...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      // Para Moção, usamos o primeiro autor selecionado como principal
      const autorPrincipalId = isMocao ? autoresSelecionados[0].id : Number(autorId);
      const nomeAutor = isMocao
        ? autoresSelecionados.map(a => a.nome).join(", ")
        : autores.find(a => a.id.toString() === autorId)?.nome;

      console.log("3. Chamando RPC no Banco...");
      setStatusMsg("Reservando numeração...");

      const { data, error: erroDB } = await supabase.rpc('protocolar_materia', {
        p_tipo_documento_id: getTipoId(tipo),
        p_ano: new Date().getFullYear(),
        p_data_protocolo: new Date().toISOString(),
        p_autor_id: autorPrincipalId,
        p_autor_type: 'AgentePublico',
        p_texto_resumo: isMocao ? `Moção de ${tipoMocao} - ${homenageado}` : instrucaoIA,
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

      // Para Moção: inserir autores adicionais (coautores)
      if (isMocao && autoresSelecionados.length > 1) {
        console.log("4.1 Inserindo coautores...");
        const coautores = autoresSelecionados.slice(1); // Pula o primeiro (já é principal)
        for (const coautor of coautores) {
          await supabase.from('documentoautores').insert({
            documento_id: dadosProtocolo.documento_id,
            autor_id: coautor.id,
            autor_type: 'AgentePublico',
            papel: 'Subscritor' // Coautor = Subscritor no ENUM do banco
          });
        }
      }

      // Para Moção: atualizar campos específicos na tabela mocoes
      if (isMocao) {
        console.log("4.2 Atualizando campos da moção...");
        await supabase.from('mocoes').update({
          tipo_mocao: tipoMocao,
          homenageado_texto: homenageado
        }).eq('documento_id', dadosProtocolo.documento_id);
      }

      setStatusMsg("IA redigindo minuta...");
      console.log("5. Chamando Edge Function (IA)...");

      const { data: dataIA, error: erroEdge } = await supabase.functions.invoke('gerar-minuta', {
        body: {
          documento_id: dadosProtocolo.documento_id,
          protocolo_geral: dadosProtocolo.protocolo_geral,
          tipo: tipo,
          contexto: instrucaoIA,
          autor_nome: nomeAutor,
          destinatario: { nome: destinatario, cargo: cargo, orgao: orgao },
          // Campos específicos de Moção para o prompt da IA
          tipo_mocao: isMocao ? tipoMocao : null,
          homenageado: isMocao ? homenageado : null
        }
      });

      if (erroEdge) console.warn("IA Falhou:", erroEdge);
      else console.log("6. Sucesso IA:", dataIA);

      setStatusMsg("Pronto!");
      if (onSucesso) onSucesso();
      onClose();

      console.log("7. Navegando...");
      navigate(`/documentos/materias/${dadosProtocolo.documento_id}/editar`);

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

            {/* AUTOR: Single Select para outros tipos */}
            {!isMocao && (
              <div className="col-span-5">
                <label className="block text-xs font-semibold text-gray-700 mb-0.5">Autor</label>
                <Select value={autorId} onValueChange={setAutorId}>
                  <SelectTrigger className={`h-8 text-xs ${!autorId ? "border-indigo-200 bg-indigo-50" : ""}`}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {autores.map(a => (
                      <SelectItem key={a.id} value={a.id.toString()} className="text-xs">
                        {a.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* MOÇÃO: Tipo de Moção */}
            {isMocao && (
              <div className="col-span-5">
                <label className="block text-xs font-semibold text-gray-700 mb-0.5">Tipo de Moção</label>
                <Select value={tipoMocao} onValueChange={val => setTipoMocao(val as TipoMocao)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposMocao.map(t => (
                      <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* MOÇÃO: Multi-select de Autores com Chips */}
          {isMocao && (
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 space-y-2">
              <label className="block text-xs font-semibold text-indigo-800 mb-1">Autores da Moção</label>

              {/* Chips dos autores selecionados */}
              <div className="flex flex-wrap gap-1 min-h-[28px]">
                {autoresSelecionados.map(autor => (
                  <span
                    key={autor.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-600 text-white rounded-full text-xs"
                  >
                    {autor.nome.split(' ')[0]}
                    <button type="button" onClick={() => removerAutor(autor.id)} className="hover:bg-indigo-700 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {autoresSelecionados.length === 0 && (
                  <span className="text-xs text-indigo-400 italic">Nenhum autor selecionado</span>
                )}
              </div>

              {/* Dropdown para adicionar autores */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownAberto(!dropdownAberto)}
                  className="w-full flex items-center justify-between h-8 px-3 text-xs bg-white border border-indigo-200 rounded-md hover:bg-indigo-50"
                >
                  <span className="text-gray-500">+ Adicionar autor...</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {dropdownAberto && autoresDisponiveis.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {autoresDisponiveis.map(autor => (
                      <button
                        key={autor.id}
                        type="button"
                        onClick={() => adicionarAutor(autor)}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-indigo-50"
                      >
                        {autor.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Homenageado/Destinatário */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-indigo-800 mb-0.5">Homenageado / Destinatário</label>
                <Input
                  value={homenageado}
                  onChange={e => setHomenageado(e.target.value)}
                  placeholder="Ex: Sr. João da Silva e família"
                  className="bg-white h-8 text-xs"
                />
              </div>
            </div>
          )}

          {/* DESTINATÁRIO: Para Ofício e Requerimento */}
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