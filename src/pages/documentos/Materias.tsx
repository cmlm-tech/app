
import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import FiltroMaterias from "@/components/materias/FiltroMaterias";
import TabelaMaterias from "@/components/materias/TabelaMaterias";
import { TabelaPareceres, Parecer } from "@/components/materias/TabelaPareceres";
import ModalNovaMateria from "@/components/materias/ModalNovaMateria";
import { Materia, StatusMateria, TipoMateria } from "@/components/materias/types";
import { supabase } from "@/lib/supabaseClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Materias() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalAberto, setModalAberto] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "materias");

  // Sync tab state with URL
  useEffect(() => {
    const tabUrl = searchParams.get("tab");
    if (tabUrl && tabUrl !== activeTab) {
      setActiveTab(tabUrl);
    }
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSearchParams({ tab: val });
  };

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [pareceres, setPareceres] = useState<Parecer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [periodo, setPeriodo] = useState<{ inicio: Date | null; fim: Date | null }>({ inicio: null, fim: null });

  // Paginação State
  const [pagina, setPagina] = useState(1);
  const [paginaParecer, setPaginaParecer] = useState(1);
  const itensPorPagina = 10;

  useEffect(() => {
    fetchMaterias();
  }, []);

  // Recarregar dados quando a página se torna visível (volta da aba de edição)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchMaterias();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Resetar página ao filtrar
  useEffect(() => {
    setPagina(1);
  }, [busca, tipo, status, periodo]);

  async function fetchMaterias() {
    setIsLoading(true);
    try {
      // 1. Buscar Agentes, Vereadores, Comissões e Mesas Diretoras
      const { data: agentes } = await supabase.from('agentespublicos').select('id, nome_completo');
      const { data: vereadores } = await supabase.from('vereadores').select('agente_publico_id, nome_parlamentar');
      const { data: comissoes } = await supabase.from('comissoes').select('id, nome');
      const { data: mesas } = await (supabase as any).from('mesasdiretoras').select('id, nome');

      const agentesMap = new Map((agentes || []).map((a: any) => [a.id, a.nome_completo]));
      const vereadoresMap = new Map((vereadores || []).map((v: any) => [v.agente_publico_id, v.nome_parlamentar]));
      const comissoesMap = new Map((comissoes || []).map((c: any) => [c.id, c.nome]));
      const mesasMap = new Map((mesas || []).map((m: any) => [m.id, m.nome]));

      // 2. Buscar Documentos
      const { data, error } = await supabase
        .from('documentos')
        .select(`
          id,
          ano,
          data_protocolo,
          status,
          protocolo_id,
          arquivo_pdf_url,
          tiposdedocumento ( nome ),
          protocolos!documentos_protocolo_id_fkey ( numero ),
          documentoautores ( autor_id, autor_type, papel ),
          oficios ( assunto ),
          projetosdelei ( ementa ),
          requerimentos ( justificativa ),
          mocoes ( ementa ),
          indicacoes ( ementa ),
          projetosdedecretolegislativo ( ementa ),
          pareceres!pareceres_documento_id_fkey ( 
            status, 
            comissao:comissoes(nome),
            materia:documentos!pareceres_materia_documento_id_fkey (
                ano,
                arquivo_pdf_url,
                tiposdedocumento ( nome ),
                protocolos!documentos_protocolo_id_fkey ( numero ),
                oficios ( numero_oficio ),
                projetosdelei ( numero_lei ),
                requerimentos ( numero_requerimento ),
                mocoes ( numero_mocao ),
                indicacoes ( numero_indicacao ),
                projetosdedecretolegislativo ( numero_decreto )
            )
          )
        `)
        .order('data_protocolo', { ascending: false });

      if (error) throw error;

      if (data) {
        // Mapear dados do banco para o formato da interface
        const mappedMaterias: Materia[] = data.map((doc: any) => {
          // Determinar ementa/resumo baseado no tipo
          let resumo = "";
          if (doc.oficios?.[0]) resumo = doc.oficios[0].assunto;
          else if (doc.projetosdelei?.[0]) resumo = doc.projetosdelei[0].ementa;
          else if (doc.requerimentos?.[0]) resumo = doc.requerimentos[0].justificativa;
          else if (doc.mocoes?.[0]) resumo = doc.mocoes[0].ementa;
          else if (doc.indicacoes?.[0]) resumo = doc.indicacoes[0].ementa;
          else if (doc.projetosdedecretolegislativo?.[0]) resumo = doc.projetosdedecretolegislativo[0].ementa;
          else if (doc.pareceres?.[0]) {
            const p = doc.pareceres[0];
            const mat = p.materia;
            const protocoloMateria = mat?.protocolos?.numero || 'Rascunho';
            resumo = `Parecer sobre ${mat?.tiposdedocumento?.nome || 'Matéria'} ${protocoloMateria}`;
          }

          // Nome do Autor (Combinando Agentes e Comissões)
          const autorRel = doc.documentoautores?.[0];
          let nomeAutor = "Sem Autor";
          let autorId: number | undefined;
          let autorTipo: string | undefined;

          // Para Pareceres, o autor é a Comissão
          if (doc.tiposdedocumento?.nome === 'Parecer' && doc.pareceres?.[0]?.comissao) {
            nomeAutor = doc.pareceres[0].comissao.nome;
            autorTipo = 'Comissao';
          } else if (autorRel) {
            const { autor_id, autor_type } = autorRel;
            autorId = autor_id;

            // Usar autor_type para determinar a fonte correta do nome
            if (autor_type === 'MesaDiretora') {
              nomeAutor = (mesasMap.get(autor_id) as string) || "Mesa Diretora";
              autorTipo = 'MesaDiretora';
            } else if (autor_type === 'Comissao') {
              nomeAutor = comissoesMap.get(autor_id) || "Comissão";
              autorTipo = 'Comissao';
            } else if (autor_type === 'AgentePublico') {
              // Para agentes, tentar vereador primeiro, depois agente
              if (vereadoresMap.has(autor_id)) {
                nomeAutor = vereadoresMap.get(autor_id)!;
              } else if (agentesMap.has(autor_id)) {
                nomeAutor = agentesMap.get(autor_id)!;
              } else {
                nomeAutor = "Desconhecido";
              }
              autorTipo = 'AgentePublico';
            } else {
              // Fallback para autor_type desconhecido ou NULL - tentar todos os maps
              if (mesasMap.has(autor_id)) {
                nomeAutor = (mesasMap.get(autor_id) as string) || "Mesa Diretora";
                autorTipo = 'MesaDiretora';
              } else if (comissoesMap.has(autor_id)) {
                nomeAutor = comissoesMap.get(autor_id)!;
                autorTipo = 'Comissao';
              } else if (vereadoresMap.has(autor_id)) {
                nomeAutor = vereadoresMap.get(autor_id)!;
                autorTipo = 'AgentePublico';
              } else if (agentesMap.has(autor_id)) {
                nomeAutor = agentesMap.get(autor_id)!;
                autorTipo = 'AgentePublico';
              } else {
                nomeAutor = "Desconhecido";
              }
            }
          }

          // Nome do Tipo (com fallback)
          const nomeTipo = doc.tiposdedocumento?.nome || "Documento";

          // Para Projeto de Resolução: verificar se há múltiplos vereadores (autoria coletiva 1/3)
          if (nomeTipo === 'Projeto de Resolução' && doc.documentoautores) {
            const autoresVereadores = doc.documentoautores.filter(
              (da: any) => da.autor_type === 'AgentePublico'
            );

            if (autoresVereadores.length > 1) {
              // É autoria coletiva (1/3 dos vereadores)
              nomeAutor = `1/3 dos Vereadores (${autoresVereadores.length})`;
              autorTipo = 'AgentePublico';
            }
          }

          // Formatar Protocolo usando protocolos.numero ou mostrar Rascunho
          const protocoloStr = doc.protocolos?.numero || `${doc.ano}.Rascunho`;

          return {
            id: doc.id.toString(),
            protocolo: protocoloStr,
            tipo: nomeTipo as TipoMateria,
            ementa: resumo || "",
            autor: nomeAutor,
            autorId: autorId,
            autorTipo: autorTipo,
            dataProtocolo: new Date(doc.data_protocolo),
            status: doc.status as StatusMateria,
            arquivo_url: doc.arquivo_pdf_url || undefined,
          };
        });
        setMaterias(mappedMaterias);

        // Log para debug: quantas matérias têm PDF armazenado
        const comPDF = mappedMaterias.filter(m => m.arquivo_url).length;
        console.log(`[Materias] ${comPDF} de ${mappedMaterias.length} matérias têm PDF no Storage`);

        // Mapear pareceres separadamente (documentos que possuem pareceres associados)
        const mappedPareceres: Parecer[] = data
          .filter((doc: any) => doc.pareceres && doc.pareceres.length > 0)
          .map((doc: any) => {
            const p = doc.pareceres?.[0];
            const mat = p?.materia;
            const tipoMateria = mat?.tiposdedocumento?.nome || 'Matéria';

            // Extrair o número oficial do tipo específico
            let numeroOficial = 'S/N';
            if (mat?.oficios?.[0]?.numero_oficio) {
              const numStr = String(mat.oficios[0].numero_oficio);
              const numOnly = numStr.split('/')[0];
              const numPadded = numOnly.padStart(3, '0');
              numeroOficial = `${numPadded}/${mat.ano}`;
            } else if (mat?.projetosdelei?.[0]?.numero_lei) {
              const numStr = String(mat.projetosdelei[0].numero_lei);
              const numOnly = numStr.split('/')[0];
              const numPadded = numOnly.padStart(3, '0');
              numeroOficial = `${numPadded}/${mat.ano}`;
            } else if (mat?.requerimentos?.[0]?.numero_requerimento) {
              const numStr = String(mat.requerimentos[0].numero_requerimento);
              const numOnly = numStr.split('/')[0];
              const numPadded = numOnly.padStart(3, '0');
              numeroOficial = `${numPadded}/${mat.ano}`;
            } else if (mat?.mocoes?.[0]?.numero_mocao) {
              const numStr = String(mat.mocoes[0].numero_mocao);
              const numOnly = numStr.split('/')[0];
              const numPadded = numOnly.padStart(3, '0');
              numeroOficial = `${numPadded}/${mat.ano}`;
            } else if (mat?.indicacoes?.[0]?.numero_indicacao) {
              const numStr = String(mat.indicacoes[0].numero_indicacao);
              const numOnly = numStr.split('/')[0];
              const numPadded = numOnly.padStart(3, '0');
              numeroOficial = `${numPadded}/${mat.ano}`;
            } else if (mat?.projetosdedecretolegislativo?.[0]?.numero_decreto) {
              const numStr = String(mat.projetosdedecretolegislativo[0].numero_decreto);
              const numOnly = numStr.split('/')[0];
              const numPadded = numOnly.padStart(3, '0');
              numeroOficial = `${numPadded}/${mat.ano}`;
            }

            return {
              id: doc.id.toString(),
              materiaRelacionada: `${tipoMateria} ${numeroOficial}`,
              comissao: p?.comissao?.nome || 'Sem comissão',
              status: doc.status,
              data: new Date(doc.data_protocolo),
              url: doc.arquivo_pdf_url,
            };
          });
        setPareceres(mappedPareceres);
      }
    } catch (err: any) {
      console.error("Erro ao buscar matérias:", err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Filtrar matérias (excluindo Atas - aparecem em TabelaAtas)
  const materiasFiltradas = materias.filter((m) => {
    // Atas são listadas em sua própria página/componente
    const tipoStr = m.tipo as string;
    if (tipoStr === "Ata" || tipoStr.includes("Ata")) return false;
    // Documentos com pareceres são listados em aba separada
    // Verificamos se há algum parecer associado a este documento
    const temParecer = pareceres.some(p => p.id === m.id);
    if (temParecer) return false;

    const buscaOk =
      busca === "" ||
      m.protocolo.toLowerCase().includes(busca.toLowerCase()) ||
      m.ementa.toLowerCase().includes(busca.toLowerCase()) ||
      m.autor.toLowerCase().includes(busca.toLowerCase());
    const tipoOk = tipo === "Todos" || m.tipo === tipo;
    const statusOk = status === "Todos" || m.status === status;
    const periodoOk =
      (!periodo.inicio || m.dataProtocolo >= periodo.inicio) &&
      (!periodo.fim || m.dataProtocolo <= periodo.fim);

    return buscaOk && tipoOk && statusOk && periodoOk;
  });

  // Lógica de Paginação para Matérias
  const totalPaginas = Math.ceil(materiasFiltradas.length / itensPorPagina);
  const inicio = (pagina - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const materiasPaginadas = materiasFiltradas.slice(inicio, fim);

  // Lógica de Paginação para Pareceres
  const totalPaginasParecer = Math.ceil(pareceres.length / itensPorPagina);
  const inicioParecer = (paginaParecer - 1) * itensPorPagina;
  const fimParecer = inicioParecer + itensPorPagina;
  const pareceresPaginados = pareceres.slice(inicioParecer, fimParecer);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800 mb-1">Matérias Legislativas</h1>
          <p className="text-gray-600 text-lg">Gerencie, protocole e acompanhe todos os documentos legislativos.</p>
        </div>
        {/* Barra de ações e filtros */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
          {/* Botão protocolar */}
          <div>
            <Button
              className="bg-gov-blue-700 hover:bg-gov-blue-800"
              onClick={() => setModalAberto(true)}
            >
              <Plus className="mr-2 w-4 h-4" />
              Protocolar Nova Matéria
            </Button>
          </div>
          <FiltroMaterias
            busca={busca}
            setBusca={setBusca}
            tipo={tipo}
            setTipo={setTipo}
            status={status}
            setStatus={setStatus}
            periodo={periodo}
            setPeriodo={setPeriodo}
          />
        </div>

        {/* Tabela e Paginação */}
        <div className="rounded-lg bg-white shadow p-4 flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gov-blue-600" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="materias">Matérias ({materiasFiltradas.length})</TabsTrigger>
                <TabsTrigger value="pareceres">Pareceres ({pareceres.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="materias">
                <TabelaMaterias materias={materiasPaginadas} />

                {/* Controles de Paginação */}
                {materiasFiltradas.length > 0 && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-500">
                      Mostrando {inicio + 1} até {Math.min(fim, materiasFiltradas.length)} de {materiasFiltradas.length} resultados
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagina(p => Math.max(1, p - 1))}
                        disabled={pagina === 1}
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center px-4 font-medium text-sm">
                        Página {pagina} de {totalPaginas}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                        disabled={pagina === totalPaginas}
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pareceres">
                <TabelaPareceres pareceres={pareceresPaginados} />

                {/* Controles de Paginação para Pareceres */}
                {pareceres.length > 0 && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-500">
                      Mostrando {inicioParecer + 1} até {Math.min(fimParecer, pareceres.length)} de {pareceres.length} resultados
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaParecer(p => Math.max(1, p - 1))}
                        disabled={paginaParecer === 1}
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center px-4 font-medium text-sm">
                        Página {paginaParecer} de {totalPaginasParecer}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaParecer(p => Math.min(totalPaginasParecer, p + 1))}
                        disabled={paginaParecer === totalPaginasParecer}
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      {/* Modal - ao protocolar com sucesso, recarrega a lista */}
      <ModalNovaMateria
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        onSucesso={fetchMaterias} // Recarrega a lista ao voltar
      />
    </AppLayout>
  );
}
