import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FormEvent, useState, useEffect, useMemo } from "react";
import { Wand2, Paperclip, Loader2, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { TipoMateria, RetornoProtocolo } from "./types";

const tiposCriacao: TipoMateria[] = ["Projeto de Lei", "Ofício", "Requerimento", "Moção", "Projeto de Decreto Legislativo", "Indicação"];

// Tipos de Moção conforme ENUM do banco
const tiposMocao = ["Aplausos", "Pesar", "Repúdio", "Solidariedade", "Protesto"] as const;

// Tipos de Decreto Legislativo conforme ENUM do banco
const tiposDecreto = ["Honraria", "Julgamento de Contas"] as const;
const tiposHonraria = ["Título de Cidadania", "Medalha João Ludgero Sobreira", "Comenda Maria Sonia Sampaio Pinheiro"] as const;

// Mapeamento de nomes de exibição para valores do enum no banco
const honrariaParaBanco: Record<string, string> = {
  "Título de Cidadania": "Título de Cidadania",
  "Medalha João Ludgero Sobreira": "Medalha",
  "Comenda Maria Sonia Sampaio Pinheiro": "Comenda"
};

type TipoDecreto = typeof tiposDecreto[number];
type TipoHonraria = typeof tiposHonraria[number];
type TipoMocao = typeof tiposMocao[number];

// Função para converter número em extenso (português)
function numeroPorExtenso(num: number): string {
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
    'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  if (num === 0) return 'zero';
  if (num === 100) return 'cem';
  if (num < 0 || num > 999) return num.toString();

  let extenso = '';
  const c = Math.floor(num / 100);
  const d = Math.floor((num % 100) / 10);
  const u = num % 10;

  if (c > 0) extenso += centenas[c];

  if (num % 100 < 20 && num % 100 > 0) {
    if (c > 0) extenso += ' e ';
    extenso += unidades[num % 100];
  } else {
    if (d > 0) {
      if (c > 0) extenso += ' e ';
      extenso += dezenas[d];
    }
    if (u > 0) {
      if (c > 0 || d > 0) extenso += ' e ';
      extenso += unidades[u];
    }
  }

  return extenso;
}

interface Autor {
  id: number;
  nome: string;
  cargo?: string;
  tipoObjeto: 'AgentePublico' | 'Comissao';
}

interface Props {
  aberto: boolean;
  onClose: () => void;
  onSucesso?: () => void;
}

export default function ModalNovaMateria({ aberto, onClose, onSucesso }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // Estados específicos para Decreto Legislativo
  const [tipoDecreto, setTipoDecreto] = useState<TipoDecreto>("Honraria");
  const [tipoHonraria, setTipoHonraria] = useState<TipoHonraria>("Título de Cidadania");
  const [homenageadoDecreto, setHomenageadoDecreto] = useState("");
  const [nomeMedalhaComenda, setNomeMedalhaComenda] = useState("");
  const [anosMatrimonio, setAnosMatrimonio] = useState<number | "">("");  // Anos de matrimônio para Comenda
  const [anoContas, setAnoContas] = useState("");
  const [nomeGestor, setNomeGestor] = useState("");
  const [honrariasCount, setHonrariasCount] = useState<number | null>(null);  // Contador de honrarias do autor

  const dataProtocolo = new Date();
  const precisaDestinatario = tipo === "Ofício" || tipo === "Requerimento" || tipo === "Indicação";
  const isIndicacao = tipo === "Indicação";
  const isMocao = tipo === "Moção";
  const isDecretoLegislativo = tipo === "Projeto de Decreto Legislativo";

  // Buscar autores ao abrir o modal
  useEffect(() => {
    if (aberto) {
      buscarAutores();
    }
  }, [aberto]);

  async function buscarAutores() {
    try {
      // 1. Buscar Vereadores (com join para pegar o nome)
      const { data: vereadores, error: errVereadores } = await supabase
        .from('vereadores')
        .select(`
          agente_publico_id,
          nome_parlamentar,
          agente:agentespublicos (nome_completo)
        `);

      if (errVereadores) throw errVereadores;

      // 2. Buscar Comissões
      const { data: comissoes, error: errComissoes } = await supabase
        .from('comissoes')
        .select('id, nome');

      if (errComissoes) throw errComissoes;

      // 3. Unificar Listas
      const listaVereadores: Autor[] = (vereadores || []).map((v: any) => ({
        id: v.agente_publico_id,
        nome: v.nome_parlamentar || v.agente?.nome_completo || 'Sem Nome',
        cargo: 'Vereador(a)',
        tipoObjeto: 'AgentePublico'
      }));

      const listaComissoes: Autor[] = (comissoes || []).map((c: any) => ({
        id: c.id,
        nome: c.nome,
        cargo: 'Comissão',
        tipoObjeto: 'Comissao'
      }));

      const listaCompleta = [...listaVereadores, ...listaComissoes].sort((a, b) => a.nome.localeCompare(b.nome));

      setAutores(listaCompleta);
    } catch (err) {
      console.error("Erro ao buscar autores:", err);
    }
  }

  // Filtragem dinâmica de autores baseada no tipo de decreto
  const autoresFiltrados = useMemo(() => {
    if (tipoDecreto === 'Julgamento de Contas') {
      return autores.filter(a => a.tipoObjeto === 'Comissao');
    }
    if (tipoDecreto === 'Honraria') {
      return autores.filter(a => a.tipoObjeto === 'AgentePublico');
    }
    // Padrão para outros tipos (apenas Vereadores/Agentes)
    return autores.filter(a => a.tipoObjeto === 'AgentePublico');
  }, [autores, tipoDecreto]);

  // Calcula o período de honrarias: 21/ago do ano X até 20/ago do ano X+1
  // Evento de entrega: 20 de agosto
  function getPeriodoHonrarias() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth(); // 0-indexed (7 = agosto)
    const dia = hoje.getDate();

    // Se estamos após 20 de agosto, o período é deste ano até o próximo
    // Se estamos antes ou no dia 20 de agosto, o período é do ano anterior até este ano
    if (mes > 7 || (mes === 7 && dia > 20)) {
      // Após 20/ago: período atual = ano/08/21 até (ano+1)/08/20
      return {
        inicio: `${ano}-08-21`,
        fim: `${ano + 1}-08-20`,
        anoEvento: ano + 1
      };
    } else {
      // Até 20/ago: período atual = (ano-1)/08/21 até ano/08/20
      return {
        inicio: `${ano - 1}-08-21`,
        fim: `${ano}-08-20`,
        anoEvento: ano
      };
    }
  }

  // Buscar quantidade de honrarias do autor selecionado
  async function buscarHonrariasDoAutor(autorIdComposto: string) {
    if (!autorIdComposto || !isDecretoLegislativo || tipoDecreto !== 'Honraria') {
      setHonrariasCount(null);
      return;
    }

    const [tipoObj, idStr] = autorIdComposto.split(':');
    if (tipoObj !== 'AgentePublico') {
      setHonrariasCount(0); // Comissões não tem limite de honraria pessoal
      return;
    }

    try {
      const periodo = getPeriodoHonrarias();
      // ... restante da função usa idStr numerico
      const autorIdNumerico = Number(idStr);

      const { data: honrarias } = await supabase
        .from('projetosdedecretolegislativo')
        .select('documento_id')
        .eq('tipo_decreto', 'Honraria' as any);

      const idsHonrarias = honrarias?.map(h => h.documento_id) || [];
      console.log('Honrarias encontradas:', idsHonrarias);

      if (idsHonrarias.length > 0) {
        // Buscar documentos do autor via documentoautores
        const { data: docsAutor } = await supabase
          .from('documentoautores')
          .select('documento_id')
          .eq('autor_id', autorIdNumerico);

        const idsDocsAutor = docsAutor?.map(d => d.documento_id) || [];
        console.log('Docs do autor:', idsDocsAutor);

        // Intersecc̃ao: documentos que s̃ao honrarias E do autor
        const idsIntersecao = idsHonrarias.filter(id => idsDocsAutor.includes(id));

        if (idsIntersecao.length > 0) {
          // Contar quantos estão no período atual (21/ago - 20/ago)
          const { count } = await supabase
            .from('documentos')
            .select('id', { count: 'exact', head: true })
            .gte('data_protocolo', periodo.inicio)
            .lte('data_protocolo', periodo.fim)
            .in('id', idsIntersecao as any);

          console.log('Honrarias do autor no período:', count);
          setHonrariasCount(count || 0);
        } else {
          setHonrariasCount(0);
        }
      } else {
        setHonrariasCount(0);
      }
    } catch (err) {
      console.warn("Erro ao buscar honrarias:", err);
      setHonrariasCount(null);
    }
  }

  // Atualizar contador quando autor ou tipo mudar
  useEffect(() => {
    let idParaVerificar = autorId;
    // Se não tiver autorId, tenta pegar do array (caso de auto-seleção ou Moção)
    if (!idParaVerificar && autoresSelecionados.length > 0) {
      idParaVerificar = autoresSelecionados[0].id.toString();
    }

    if (isDecretoLegislativo && tipoDecreto === 'Honraria' && idParaVerificar) {
      buscarHonrariasDoAutor(idParaVerificar);
    } else {
      setHonrariasCount(null);
    }
  }, [autorId, autoresSelecionados, tipoDecreto, isDecretoLegislativo]);

  const getTipoId = (t: string) => {
    switch (t) {
      case "Projeto de Lei": return 1;
      case "Ofício": return 2;
      case "Requerimento": return 3;
      case "Moção": return 4;
      case "Indicação": return 5;
      case "Projeto de Decreto Legislativo": return 6;
      default: return 1;
    }
  };

  const getPlaceholderIA = () => {
    switch (tipo) {
      case "Projeto de Lei": return "Ex: Institui a Semana Municipal de Tecnologia nas escolas...";
      case "Ofício": return "Ex: Solicita visita técnica para avaliar a reforma...";
      case "Moção": return "Ex: Pelo nascimento de seu filho, ocorrido em 01/12/2025...";
      case "Projeto de Decreto Legislativo": return "Preencha os campos acima (texto será gerado automaticamente)";
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
    // Decreto Legislativo
    setTipoDecreto("Honraria");
    setTipoHonraria("Título de Cidadania");
    setHomenageadoDecreto("");
    setNomeMedalhaComenda("");
    setAnosMatrimonio("");
    setAnoContas("");
    setNomeGestor("");
  }

  // Effect para auto-selecionar Comissão de Finanças em Julgamento de Contas
  useEffect(() => {
    if (tipoDecreto === 'Julgamento de Contas' && autores.length > 0) {
      // Normalize search to ignore accents and case
      const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      const comissao = autores.find(a => {
        const nomeNorm = normalize(a.nome);
        return (nomeNorm.includes('comissao') && nomeNorm.includes('financas')) || nomeNorm.includes('financas');
      });

      if (comissao) {
        setAutoresSelecionados([comissao]);
        setAutorId(`${comissao.tipoObjeto}:${comissao.id}`);
        toast({ title: "Autor Definido", description: `Autor definido para: ${comissao.nome}`, className: "bg-blue-600 text-white" });
      } else {
        console.warn("Comissão de Finanças não encontrada. Autores disponíveis:", autores.map(a => a.nome));
        toast({ title: "Atenção", description: "Comissão de Finanças não encontrada. Verifique se a comissão está cadastrada com o nome correto.", variant: "destructive" });
      }
    } else if (tipoDecreto === 'Honraria') {
      // Se mudar de volta para honraria, limpar se for comissão (opcional, ou deixar o usuário mudar)
    }
  }, [tipoDecreto, autores]);

  // Gerar texto automático para Decreto Legislativo (templates fixos)
  function gerarTextoDecretoLegislativo(): { ementa: string; artigos: string } {
    let ementa = '';
    let artigos = '';

    console.log('=== GERANDO TEXTO DECRETO ===');
    console.log('tipoDecreto:', tipoDecreto);
    console.log('tipoHonraria:', tipoHonraria);
    console.log('homenageadoDecreto:', homenageadoDecreto);
    console.log('anosMatrimonio:', anosMatrimonio);
    console.log('anosMatrimonio:', anosMatrimonio);

    // Regra: Julgamento de Contas deve ser autoria da Comissão
    if (tipoDecreto === 'Julgamento de Contas' && autoresSelecionados.length > 0) {
      const isComissao = autoresSelecionados[0].nome.toLowerCase().includes('comissão');
      if (!isComissao) {
        console.warn("Aviso: Julgamento de Contas deveria ser da Comissão.");
      }
    }
    if (tipoDecreto === 'Honraria') {
      switch (tipoHonraria) {
        case 'Título de Cidadania':
          ementa = `CONCEDE O TÍTULO DE CIDADANIA LAVRENSE A ${homenageadoDecreto.toUpperCase()}, E DÁ OUTRAS PROVIDÊNCIAS.`;
          artigos = `Art. 1º - Fica concedido o Título de Cidadania Lavrense a ${homenageadoDecreto}, em reconhecimento aos relevantes serviços prestados ao município de Lavras da Mangabeira.\n\nArt. 2º - O diploma correspondente será entregue em sessão solene da Câmara Municipal, em data a ser designada pela Mesa Diretora.\n\nArt. 3º - O presente Decreto Legislativo entra em vigor na data de sua publicação, revogadas as disposições em contrário.`;
          break;

        case 'Medalha João Ludgero Sobreira':
          ementa = `CONCEDE MEDALHA JOÃO LUDGERO SOBREIRA A ${homenageadoDecreto.toUpperCase()}, E DÁ OUTRAS PROVIDÊNCIAS`;
          artigos = `Art. 1º - Fica concedida a Medalha João Ludgero Sobreira, a ${homenageadoDecreto}, em reconhecimento aos relevantes serviços prestado ao Município de Lavras da Mangabeira.\n\nArt. 2º - O diploma correspondente será entregue em sessão solene da Câmara Municipal, em data a ser designada pela Mesa Diretora.\n\nArt. 3º - O presente Decreto Legislativo entra em vigor na data de sua publicação, revogadas as disposições em contrário.`;
          break;

        case 'Comenda Maria Sonia Sampaio Pinheiro':
          const anos = typeof anosMatrimonio === 'number' ? anosMatrimonio : 50;
          const anosExtenso = numeroPorExtenso(anos);
          ementa = `CONCEDE A COMENDA MARIA SONIA SAMPAIO PINHEIRO A ${homenageadoDecreto.toUpperCase()}, E DÁ OUTRAS PROVIDÊNCIAS.`;
          artigos = `Art. 1º - Fica concedida a Comenda Maria Sonia Sampaio Pinheiro a ${homenageadoDecreto}, pelo transcurso de ${anos} (${anosExtenso}) anos de matrimônio.\n\nArt. 2º - Este Decreto Legislativo entra em vigor na data de sua publicação.`;
          break;

        default:
          console.warn('TIPO DE HONRARIA NÃO RECONHECIDO:', tipoHonraria);
      }
    } else if (tipoDecreto === 'Julgamento de Contas') {
      ementa = `APROVA AS CONTAS DE GOVERNO DO EXERCÍCIO FINANCEIRO DE ${anoContas} E DÁ OUTRAS PROVIDÊNCIAS.`;
      artigos = `Art. 1º - Ficam aprovadas as Contas da Prefeitura Municipal de Lavras da Mangabeira referentes ao Exercício Financeiro de ${anoContas}, de responsabilidade do ex-gestor ${nomeGestor}, conforme Parecer da Comissão de Finanças e Orçamento da Câmara Municipal, que não acolheu o Parecer Prévio emitido pelo egrégio do Tribunal de Contas do Estado.\n\nArt. 2º - O presente Decreto Legislativo entra em vigor na data de sua publicação, revogadas as disposições em contrário.`;
    }

    console.log('Ementa gerada:', ementa);
    console.log('Artigos gerados:', artigos ? artigos.substring(0, 100) + '...' : 'VAZIO');

    return { ementa, artigos };
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
      } else if (isDecretoLegislativo) {
        if (!autorId) throw new Error("Selecione o Autor.");
        if (tipoDecreto === 'Honraria') {
          if (!homenageadoDecreto.trim()) throw new Error("Informe o homenageado.");
          if (tipoHonraria === 'Comenda Maria Sonia Sampaio Pinheiro' && (anosMatrimonio === '' || anosMatrimonio < 50)) throw new Error("Informe os anos de matrimônio (mínimo 50).");
        } else if (tipoDecreto === 'Julgamento de Contas') {
          if (!anoContas.trim()) throw new Error("Informe o ano do exercício.");
          if (!nomeGestor.trim()) throw new Error("Informe o nome do gestor.");
        }
      } else {
        if (!autorId) throw new Error("Selecione o Autor.");
      }
      if (!isDecretoLegislativo && !instrucaoIA.trim()) throw new Error("Descreva o conteúdo.");

      console.log("2. Validação OK. Buscando usuário...");

      // Validação Extra para Julgamento de Contas
      if (tipoDecreto === 'Julgamento de Contas') {
        const comissaoFinancas = autores.find(a => a.nome.toLowerCase().includes('comissão de finanças'));
        if (comissaoFinancas && autoresSelecionados[0]?.id !== comissaoFinancas.id) {
          throw new Error("O autor para Julgamento de Contas deve ser a 'Comissão de Finanças e Orçamento'.");
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      // Definir autor principal e objeto completo
      let autorPrincipal: Autor | undefined;

      // Prioridade para autoresSelecionados (usado em Moção e Julgamento de Contas via auto-select)
      if (autoresSelecionados.length > 0) {
        autorPrincipal = autoresSelecionados[0];
      } else if (autorId) {
        // Usado nos selects simples - autorId tem formato "tipoObjeto:id"
        const [tipoObj, idStr] = autorId.split(':');
        autorPrincipal = autores.find(a => a.tipoObjeto === tipoObj && a.id.toString() === idStr);
      }

      if (!autorPrincipal) throw new Error("Selecione um autor.");

      const autorPrincipalId = autorPrincipal.id;
      const nomeAutor = isMocao
        ? autoresSelecionados.map(a => a.nome).join(", ")
        : autorPrincipal.nome;

      // Regra de negócio: máximo 3 honrarias por vereador por ano
      if (isDecretoLegislativo && tipoDecreto === 'Honraria') {
        const isVereador = autorPrincipal.tipoObjeto === 'AgentePublico';

        if (isVereador) {
          console.log(`Verificando limite para: ${nomeAutor} (ID: ${autorPrincipalId})`);

          if (honrariasCount !== null && honrariasCount >= 3) {
            const limiteError = new Error(`O autor ${nomeAutor} já atingiu o limite de 3 honrarias para o período atual.`);
            if (honrariasCount >= 3) {
              toast({ title: "Limite de Honrarias", description: limiteError.message, variant: "destructive" });
              throw limiteError;
            }
            // Outros erros apenas logamos (não bloqueia criação)
            console.warn("Aviso: Validação de limite de honrarias falhou:", limiteError);
          }
        }
      }

      console.log("3. Chamando RPC no Banco...");
      setStatusMsg("Criando rascunho...");

      const { data, error: erroDB } = await supabase.rpc('criar_rascunho_documento', {
        p_tipo_documento_id: getTipoId(tipo),
        p_ano: new Date().getFullYear(),
        p_autor_id: autorPrincipal.id,
        p_autor_type: autorPrincipal.tipoObjeto,
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

      const dadosRascunho = data as unknown as { documento_id: number; status: string };
      console.log("4. Sucesso Banco:", dadosRascunho);

      // Para Moção: inserir autores adicionais (coautores)
      if (isMocao && autoresSelecionados.length > 1) {
        console.log("4.1 Inserindo coautores...");
        const coautores = autoresSelecionados.slice(1); // Pula o primeiro (já é principal)
        for (const coautor of coautores) {
          await supabase.from('documentoautores').insert({
            documento_id: dadosRascunho.documento_id,
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
        }).eq('documento_id', dadosRascunho.documento_id);
      }

      // Se for Decreto Legislativo, inserir dados específicos E gerar texto automaticamente
      if (isDecretoLegislativo) {
        console.log("4.3 Gerando texto automático e salvando Decreto Legislativo...");
        const { ementa, artigos } = gerarTextoDecretoLegislativo();

        // Converter nome de exibição para valor do enum no banco
        const tipoHonrariaDb = tipoDecreto === 'Honraria' ? honrariaParaBanco[tipoHonraria] : null;
        console.log('Tipo honraria para banco:', tipoHonrariaDb);

        await supabase.from('projetosdedecretolegislativo').update({
          tipo_decreto: tipoDecreto as any,
          tipo_honraria: tipoHonrariaDb as any,
          ementa: ementa,
          justificativa: artigos
        }).eq('documento_id', dadosRascunho.documento_id);
      }

      // Se for Indicação, atualizar dados específicos
      if (isIndicacao) {
        console.log("4.4 Salvando dados específicos de Indicação...");
        await supabase.from('indicacoes').update({
          destinatario_texto: destinatario || "Sr. Prefeito Municipal"
        }).eq('documento_id', dadosRascunho.documento_id);
      }

      setStatusMsg("IA redigindo minuta...");
      console.log("5. Chamando Edge Function (IA)...");

      // Decreto Legislativo não precisa de IA (texto já foi gerado)
      if (!isDecretoLegislativo) {
        const { data: dataIA, error: erroEdge } = await supabase.functions.invoke('gerar-minuta', {
          body: {
            documento_id: dadosRascunho.documento_id,
            protocolo_geral: null,
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
      } else {
        console.log("5. Decreto Legislativo: Pulando IA (texto já gerado automaticamente)");
      }

      setStatusMsg("Pronto!");
      if (onSucesso) onSucesso();

      limparForm();  // Limpar apenas quando houver sucesso
      onClose();

      console.log("7. Navegando...");
      navigate(`/documentos/materias/${dadosRascunho.documento_id}/editar`);

    } catch (error: any) {
      console.error("ERRO GERAL:", error);
      const errorMsg = error?.message || error?.error_description || error?.details || (typeof error === 'string' ? error : 'Erro ao processar solicitação');
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setStatusMsg("");
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
            {isDecretoLegislativo
              ? "Preencha os dados e o texto será gerado automaticamente com base em templates oficiais."
              : "Preencha os dados e a IA escreverá a minuta inicial."
            }
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
                    {autoresFiltrados.map(a => (
                      <SelectItem key={`${a.tipoObjeto}:${a.id}`} value={`${a.tipoObjeto}:${a.id}`} className="text-xs">
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

          {/* DECRETO LEGISLATIVO: Campos condicionais */}
          {isDecretoLegislativo && (
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 space-y-3">
              {/* Select principal: Honraria ou Julgamento de Contas */}
              <div>
                <label className="block text-xs font-semibold text-emerald-800 mb-0.5">Tipo de Decreto</label>
                <Select value={tipoDecreto} onValueChange={val => setTipoDecreto(val as TipoDecreto)}>
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDecreto.map(t => (
                      <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sub-select: Apenas se for Honraria */}
              {tipoDecreto === "Honraria" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-800 mb-0.5">Tipo de Honraria</label>
                    <Select value={tipoHonraria} onValueChange={val => setTipoHonraria(val as TipoHonraria)}>
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposHonraria.map(t => (
                          <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Indicador de honrarias utilizadas */}
                    {honrariasCount !== null && (
                      <div className={`mt-2 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 ${honrariasCount >= 3
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : honrariasCount >= 2
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        }`}>
                        <span className="font-bold">{honrariasCount}/3</span>
                        <span>para evento de 20/08/{getPeriodoHonrarias().anoEvento}</span>
                        {honrariasCount >= 3 && <span className="text-red-600">⚠️ Limite atingido!</span>}
                      </div>
                    )}
                  </div>

                  {/* Campos condicionais por tipo de honraria */}
                  {tipoHonraria === "Título de Cidadania" && (
                    <div>
                      <label className="block text-xs font-semibold text-emerald-800 mb-0.5">Homenageado(a)</label>
                      <Input
                        value={homenageadoDecreto}
                        onChange={e => setHomenageadoDecreto(e.target.value)}
                        placeholder="Nome completo do homenageado"
                        className="bg-white h-8 text-xs"
                      />
                    </div>
                  )}

                  {tipoHonraria === 'Medalha João Ludgero Sobreira' && (
                    <div>
                      <label className="block text-xs font-semibold text-emerald-800 mb-0.5">Homenageado(a)</label>
                      <Input
                        value={homenageadoDecreto}
                        onChange={e => setHomenageadoDecreto(e.target.value)}
                        placeholder="Nome completo do homenageado"
                        className="bg-white h-8 text-xs"
                      />
                    </div>
                  )}

                  {tipoHonraria === 'Comenda Maria Sonia Sampaio Pinheiro' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-800 mb-0.5">Homenageado(a)(s)</label>
                        <Input
                          value={homenageadoDecreto}
                          onChange={e => setHomenageadoDecreto(e.target.value)}
                          placeholder="Nome(s) do(s) homenageado(s)"
                          className="bg-white h-8 text-xs"
                        />
                        <p className="text-xs text-emerald-600 mt-1 italic">Comenda: Maria Sonia Sampaio Pinheiro (nome oficial fixo)</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-800 mb-0.5">Anos de Matrimônio</label>
                        <Input
                          type="number"
                          min={50}
                          value={anosMatrimonio}
                          onChange={e => setAnosMatrimonio(e.target.value ? Number(e.target.value) : "")}
                          placeholder="Ex: 50, 55, 60..."
                          className="bg-white h-8 text-xs"
                        />
                        {typeof anosMatrimonio === 'number' && anosMatrimonio >= 50 && (
                          <p className="text-xs text-emerald-600 mt-1 italic">
                            {anosMatrimonio} ({numeroPorExtenso(anosMatrimonio)}) anos
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Campos para Julgamento de Contas */}
              {tipoDecreto === "Julgamento de Contas" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-800 mb-0.5">Ano do Exercício</label>
                    <Input
                      type="number"
                      value={anoContas}
                      onChange={e => setAnoContas(e.target.value)}
                      placeholder="Ex: 2023"
                      className="bg-white h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-800 mb-0.5">Nome do Gestor</label>
                    <Input
                      value={nomeGestor}
                      onChange={e => setNomeGestor(e.target.value)}
                      placeholder="Nome completo do gestor responsável"
                      className="bg-white h-8 text-xs"
                    />
                  </div>
                </>
              )}
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

          {/* Campo de Instruções IA: oculto para Decreto Legislativo (usa templates fixos) */}
          {!isDecretoLegislativo && (
            <>
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
            </>
          )}

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