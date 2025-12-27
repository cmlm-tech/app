
import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import FiltroMaterias from "@/components/materias/FiltroMaterias";
import TabelaMaterias from "@/components/materias/TabelaMaterias";
import ModalNovaMateria from "@/components/materias/ModalNovaMateria";
import { Materia, StatusMateria, TipoMateria } from "@/components/materias/types";
import { supabase } from "@/lib/supabaseClient";

export default function Materias() {
  const [modalAberto, setModalAberto] = useState(false);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [periodo, setPeriodo] = useState<{ inicio: Date | null; fim: Date | null }>({ inicio: null, fim: null });

  // Paginação State
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 10;

  useEffect(() => {
    fetchMaterias();
  }, []);

  // Resetar página ao filtrar
  useEffect(() => {
    setPagina(1);
  }, [busca, tipo, status, periodo]);

  async function fetchMaterias() {
    setIsLoading(true);
    try {
      // 1. Buscar Agentes e Comissões
      const { data: agentes } = await supabase.from('agentespublicos').select('id, nome_completo');
      const { data: comissoes } = await supabase.from('comissoes').select('id, nome');

      const agentesMap = new Map((agentes || []).map((a: any) => [a.id, a.nome_completo]));
      const comissoesMap = new Map((comissoes || []).map((c: any) => [c.id, c.nome]));

      // 2. Buscar Documentos
      const { data, error } = await supabase
        .from('documentos')
        .select(`
          id,
          ano,
          numero_protocolo_geral,
          data_protocolo,
          status,
          tiposdedocumento ( nome ),
          documentoautores ( autor_id, papel ),
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
                numero_protocolo_geral,
                tiposdedocumento ( nome )
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
            resumo = `Parecer sobre ${mat?.tiposdedocumento?.nome || 'Matéria'} ${mat?.numero_protocolo_geral || ''}/${mat?.ano || ''}`;
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
            const { autor_id } = autorRel;
            autorId = autor_id;

            // Tentar em comissões primeiro, depois em agentes
            if (comissoesMap.has(autor_id)) {
              nomeAutor = comissoesMap.get(autor_id)!;
              autorTipo = 'Comissao';
            } else if (agentesMap.has(autor_id)) {
              nomeAutor = agentesMap.get(autor_id)!;
              autorTipo = 'AgentePublico';
            } else {
              nomeAutor = "Desconhecido";
            }
          }

          // Nome do Tipo (com fallback)
          const nomeTipo = doc.tiposdedocumento?.nome || "Documento";

          // Formatar Protocolo (Ex: 2025.0000001) requested format
          const protocoloStr = doc.numero_protocolo_geral
            ? `${doc.ano}.${doc.numero_protocolo_geral.toString().padStart(7, '0')}`
            : `${doc.ano}.SEM_PROTOCOLO`;

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
          };
        });
        setMaterias(mappedMaterias);
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

  // Lógica de Paginação
  const totalPaginas = Math.ceil(materiasFiltradas.length / itensPorPagina);
  const inicio = (pagina - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const materiasPaginadas = materiasFiltradas.slice(inicio, fim);

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
            <>
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
            </>
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
