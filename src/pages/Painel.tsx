import { AppLayout } from "@/components/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Gavel, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Remove static constants
// const nextSessionDate = "Segunda-feira, 16 de Junho de 2025, às 19:00";
// const countdown = "Faltam 1 dia e 5 horas";
// const pautaId = "123";

const pendencias = [
  { id: "PL15", titulo: "Projeto de Lei nº 15/2025", status: "Aguardando parecer da Comissão de Justiça", link: "/documentos/materias/15" },
  { id: "PL13", titulo: "Projeto de Lei nº 13/2025", status: "Aguardando votação em plenário", link: "/documentos/materias/13" },
  { id: "PL12", titulo: "Projeto de Lei nº 12/2025", status: "Aguardando parecer da Comissão de Finanças", link: "/documentos/materias/12" },
];

// Atividades agora são buscadas do banco de dados

export default function Painel() {
  const { user } = useAuth();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  const todayText = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const [metrics, setMetrics] = useState({
    protocoladasMes: 0,
    emVotacao: 0,
    sessoesRealizadas: 0,
    proximaSessao: null as { id: number; data: string; hora: string; itensPauta: number } | null,
    loading: true
  });

  // State para atividades recentes
  interface AtividadeLog {
    id: number;
    tipo: string;
    descricao: string;
    entidade_tipo: string | null;
    entidade_id: number | null;
    agente_publico_id: number | null;
    created_at: string;
    agentespublicos: { nome_completo: string; nome_parlamentar?: string } | null;
  }
  const [atividades, setAtividades] = useState<AtividadeLog[]>([]);
  const [atividadesLoading, setAtividadesLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    fetchAtividades();
  }, []);

  async function fetchMetrics() {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      // Fim do mês: Dia 0 do próximo mês
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      // 1. Matérias Protocoladas no Mês
      const { count: countProt } = await supabase
        .from('documentos')
        .select('*', { count: 'exact', head: true })
        .gte('data_protocolo', firstDay)
        .lte('data_protocolo', lastDay);

      // 2. Matérias em Votação (Considerando status "Aguardando votação")
      const { count: countVot } = await supabase
        .from('documentos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Aguardando votação' as any);

      // 3. Sessões Realizadas no Mês
      const { count: countSess } = await supabase
        .from('sessoes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Realizada')
        .gte('data_abertura', firstDay)
        .lte('data_abertura', lastDay);

      setMetrics({
        protocoladasMes: countProt || 0,
        emVotacao: countVot || 0,
        sessoesRealizadas: countSess || 0,
        proximaSessao: null,
        loading: false
      });

      // 4. Buscar Próxima Sessão
      const { data: nextSessao } = await supabase
        .from('sessoes')
        .select('id, data_abertura, hora_agendada')
        .eq('status', 'Agendada')
        .gte('data_abertura', now.toISOString())
        .order('data_abertura', { ascending: true })
        .limit(1)
        .maybeSingle(); // Usar maybeSingle para não estourar erro se não houver

      if (nextSessao) {
        // Contar itens de pauta
        const { count: countPauta } = await supabase
          .from('sessaopauta')
          .select('*', { count: 'exact', head: true })
          .eq('sessao_id', nextSessao.id);

        setMetrics(prev => ({
          ...prev,
          proximaSessao: {
            id: nextSessao.id,
            data: nextSessao.data_abertura,
            hora: nextSessao.hora_agendada?.slice(0, 5) || "16:00",
            itensPauta: countPauta || 0
          }
        }));
      }

    } catch (error) {
      console.error("Erro ao buscar métricas:", error);
      setMetrics(prev => ({ ...prev, loading: false }));
    }
  }

  async function fetchAtividades() {
    try {
      // Buscar atividades sem join
      const { data: atividadesData, error } = await supabase
        .from('atividade_log' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!atividadesData || atividadesData.length === 0) {
        setAtividades([]);
        return;
      }

      // Buscar detalhes dos documentos para corrigir o número
      // E TAMBÉM coletar documentos que precisam de autor (caso agente_publico_id seja null)
      // Normalizar verificação de tipo (case insensitive)
      const atividadesDocs = atividadesData.filter((a: any) =>
        a.entidade_tipo && a.entidade_tipo.toLowerCase() === 'documento' && a.entidade_id
      );

      const documentoIds = [...new Set(atividadesDocs.map((a: any) => a.entidade_id))];

      // IDs de documentos que precisam buscar o autor (log sem agente)
      const docsSemAgenteIds = [...new Set(atividadesDocs
        .filter((a: any) => !a.agente_publico_id)
        .map((a: any) => a.entidade_id))];

      let documentosMap = new Map<number, { numero: number, ano: number }>();
      let autoresMap = new Map<number, number>(); // Map documento_id -> agente_id

      if (documentoIds.length > 0) {
        // Buscar dados do documento
        const { data: documentosData } = await supabase
          .from('documentos')
          .select('id, numero, ano')
          .in('id', documentoIds);

        documentosMap = new Map((documentosData || []).map((d: any) => [d.id, { numero: d.numero, ano: d.ano }]));

        // Se houver logs sem agente, buscar autores desses documentos
        if (docsSemAgenteIds.length > 0) {
          const { data: autoresData } = await supabase
            .from('documentoautores')
            .select('documento_id, autor_id')
            .in('documento_id', docsSemAgenteIds);

          // Mapear documento -> autor
          (autoresData || []).forEach((d: any) => {
            // Priorizar o primeiro encontrado se houver colisão
            if (!autoresMap.has(d.documento_id)) {
              autoresMap.set(d.documento_id, d.autor_id);
            }
          });
        }
      }

      // IDs de agentes já existentes nos logs
      let combinedAgentIds = new Set(atividadesData.filter((a: any) => a.agente_publico_id).map((a: any) => a.agente_publico_id));

      // Adicionar IDs de autores descobertos
      autoresMap.forEach((autorId) => combinedAgentIds.add(autorId));

      const distinctAgentIds = [...combinedAgentIds];

      let agentesMap = new Map<number, { nome_completo: string, nome_parlamentar: string }>();
      if (distinctAgentIds.length > 0) {
        // Selecionar nome_parlamentar também
        const { data: agentesData } = await supabase
          .from('agentespublicos')
          .select('id, nome_completo, nome_parlamentar')
          .in('id', distinctAgentIds);

        agentesMap = new Map((agentesData || []).map((a: any) => [a.id, {
          nome_completo: a.nome_completo,
          nome_parlamentar: a.nome_parlamentar
        }]));
      }

      // Combinar dados
      const atividadesComNomes = atividadesData.map((a: any) => {
        let agenteId = a.agente_publico_id;

        // Verificação case-insensitive seg
        const isDocumento = a.entidade_tipo && a.entidade_tipo.toLowerCase() === 'documento';

        // Se falta agente e é documento, tentar usar o autor descoberto
        if (!agenteId && isDocumento && a.entidade_id) {
          agenteId = autoresMap.get(a.entidade_id);
        }

        const agente = agenteId ? agentesMap.get(agenteId) : null;
        let descricao = a.descricao;

        // Tentar corrigir a descrição se for atividade de documento
        if (isDocumento && a.entidade_id) {
          const doc = documentosMap.get(a.entidade_id);
          if (doc && doc.numero) {
            // Sanitizar número de forma robusta: extrair apenas dígitos do início ou remover '/'
            // ParseInt é mais seguro para garantir que pegamos apenas o número
            // Ex: "2/2026" -> 2. "002" -> 2. "2a" -> 2.
            const rawString = String(doc.numero);
            // Dividir por delimitadores comuns para evitar leitura errada
            const cleanString = rawString.split(/[\/\- ]/)[0];
            const rawNumero = parseInt(cleanString, 10);

            if (!isNaN(rawNumero)) {
              const numFormatado = String(rawNumero).padStart(3, '0');
              const anoDoc = doc.ano;

              if (descricao.includes(' nº ')) {
                const parts = descricao.split(' nº ');
                // Garantir que não estamos duplicando: reconstruir apenas se parts[0] existir
                if (parts.length > 0) {
                  const prefix = parts[0];
                  // Recriar string
                  descricao = `${prefix} nº ${numFormatado}/${anoDoc}.`;
                }
              }
            }
          }
        }
        return {
          ...a,
          descricao,
          agentespublicos: agente
        };
      });

      setAtividades(atividadesComNomes);
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
    } finally {
      setAtividadesLoading(false);
    }
  }

  return (
    <AppLayout>
      {/* Cabeçalho */}
      <div className="mb-8">
        {/* ALTERAÇÃO: Fonte responsiva para melhor visualização em telas pequenas */}
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gov-blue-800 mb-2 animate-fade-in">
          Painel de Controle
        </h1>
        <p className="text-muted-foreground text-lg">
          Bem-vindo(a) de volta, <span className="font-semibold">{userName}</span>! Hoje é {todayText}.
        </p>
      </div>

      {/* Linha de cards de KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* ALTERAÇÃO: Layout interno dos cards responsivo (flex-col sm:flex-row) */}
        <Card className="flex flex-col text-center sm:flex-row sm:text-left items-center gap-4 px-6 py-4 shadow-sm hover-scale animate-fade-in">
          <div className="rounded-full bg-gov-blue-100 text-gov-blue-800 p-3 flex-shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {metrics.loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : metrics.protocoladasMes}
            </div>
            <div className="text-sm text-gray-500">Matérias Protocoladas no Mês</div>
          </div>
        </Card>
        <Card className="flex flex-col text-center sm:flex-row sm:text-left items-center gap-4 px-6 py-4 shadow-sm hover-scale animate-fade-in">
          <div className="rounded-full bg-gov-gold-100 text-gov-gold-600 p-3 flex-shrink-0">
            <Gavel className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {metrics.loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : metrics.emVotacao}
            </div>
            <div className="text-sm text-gray-500">Matérias em Votação</div>
          </div>
        </Card>
        <Card className="flex flex-col text-center sm:flex-row sm:text-left items-center gap-4 px-6 py-4 shadow-sm hover-scale animate-fade-in">
          <div className="rounded-full bg-green-100 text-green-700 p-3 flex-shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {metrics.loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : metrics.sessoesRealizadas}
            </div>
            <div className="text-sm text-gray-500">Sessões Realizadas no Mês</div>
          </div>
        </Card>
      </div>

      {/* Bloco central: cards principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próxima Sessão Plenária */}
        <Card className="lg:col-span-2 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gov-blue-700" />
              Próxima Sessão
            </CardTitle>
            <CardDescription>Reunião ordinária do Plenário</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gov-blue-600 mb-2" />
                <span className="text-gray-500">Buscando agenda...</span>
              </div>
            ) : metrics.proximaSessao ? (
              <>
                <div className="mb-2 text-xl md:text-2xl font-bold text-gov-blue-800">
                  {new Intl.DateTimeFormat('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }).format(new Date(metrics.proximaSessao.data))} às {metrics.proximaSessao.hora}
                </div>
                <div className="mb-1 text-base md:text-lg text-gray-700">
                  {formatDistanceToNow(new Date(metrics.proximaSessao.data), { locale: ptBR, addSuffix: true })}
                </div>
                <div className="text-gray-600 mb-4">
                  {metrics.proximaSessao.itensPauta} matérias na pauta
                </div>
                <Button asChild size="lg" className="w-full mt-4 bg-gov-blue-700 hover:bg-gov-blue-900 text-white text-base font-bold py-3 rounded animate-scale-in">
                  <Link to={`/atividade-legislativa/sessoes/${metrics.proximaSessao.id}`}>
                    Ver Detalhes da Sessão
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600">Nenhuma sessão agendada para os próximos dias.</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/atividade-legislativa/sessoes">Ver Todas as Sessões</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pendências */}
        {/* ALTERAÇÃO: Altura do card agora é flexível (h-full) para se alinhar com o vizinho no desktop */}
        <Card className="shadow-lg animate-fade-in h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Aguardando Parecer ou Votação</CardTitle>
            <CardDescription>
              Itens que exigem atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-48 pr-1">
              <ul className="space-y-3">
                {pendencias.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.link}
                      className="block rounded px-3 py-2 bg-gray-50 hover:bg-gov-blue-50 border-l-4 border-gov-gold-500 transition-colors cursor-pointer"
                    >
                      <span className="font-semibold">{item.titulo}</span>
                      <br />
                      <span className="text-sm text-gray-600">{item.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
          <CardFooter className="mt-auto justify-end pt-4">
            <Link
              to="/documentos/materias?filtro=pendentes"
              className="text-sm text-gov-blue-700 font-semibold hover:underline"
            >
              Ver todas as pendências
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Linha inferior: Atalhos Rápidos + Atividade Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Atividade Recente */}
        <Card className="lg:col-span-3 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente no Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            {atividadesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gov-blue-600 mr-2" />
                <span className="text-gray-500">Carregando atividades...</span>
              </div>
            ) : atividades.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma atividade recente registrada.</p>
            ) : (
              <ul className="space-y-4">
                {atividades.map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-gov-gold-500 mt-2 mr-2 flex-shrink-0" />
                    <span>
                      {item.agentespublicos && (
                        <strong>{item.agentespublicos.nome_parlamentar || item.agentespublicos.nome_completo} </strong>
                      )}
                      {item.descricao}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}