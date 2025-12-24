import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Printer, Save, FileUp, Search, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  getMateriasDisponiveis,
  getItensPauta,
  adicionarItemPauta,
  removerItemPauta,
  reordenarPauta,
  salvarPautaCompleta,
  podeEditarPauta,
  MateriaDisponivel,
  ItemPauta,
  TipoItemPauta,
} from '@/services/pautaService';
import { getSessaoById, Sessao } from '@/services/sessoesService';

// Componente para item arrastável na pauta
function SortableItemPauta({
  item,
  onRemove
}: {
  item: ItemPauta;
  onRemove: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 mb-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:text-gov-blue-600"
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="shrink-0">{item.ordem}</Badge>
          <p className="font-semibold text-sm text-gov-blue-700 truncate">
            {item.documento?.protocolo || `Doc #${item.documento_id}`}
          </p>
        </div>
        <p className="text-xs text-gray-600 truncate mt-1">
          {item.documento?.ementa || "Sem ementa"}
        </p>
        <p className="text-xs text-gray-500 truncate">
          Autor: {item.documento?.autor || "Desconhecido"}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.id)}
        className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Card de matéria disponível
function MateriaDisponivelCard({
  materia,
  onAdd,
  loading
}: {
  materia: MateriaDisponivel;
  onAdd: (id: number) => void;
  loading: boolean;
}) {
  return (
    <Card className="mb-2 bg-white hover:bg-gray-50 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gov-blue-700">{materia.protocolo}</p>
            <p className="text-xs text-gray-600 line-clamp-2 mt-1">{materia.ementa || "Sem ementa"}</p>
            <p className="text-xs text-gray-500 mt-1">Autor: {materia.autor}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAdd(materia.id)}
            disabled={loading}
            className="shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GerenciarPauta() {
  const { sessaoId } = useParams<{ sessaoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [materiasDisponiveis, setMateriasDisponiveis] = useState<MateriaDisponivel[]>([]);
  const [itensPauta, setItensPauta] = useState<ItemPauta[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [podeEditar, setPodeEditar] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Carregar dados
  const fetchDados = useCallback(async () => {
    if (!sessaoId) return;

    try {
      setLoading(true);
      const id = parseInt(sessaoId);

      // Carregar sessão
      const sessaoData = await getSessaoById(id);
      if (!sessaoData) {
        toast({ title: "Sessão não encontrada", variant: "destructive" });
        navigate("/atividade-legislativa/sessoes");
        return;
      }
      setSessao(sessaoData);

      // Verificar se pode editar
      const canEdit = await podeEditarPauta(id);
      setPodeEditar(canEdit);

      // Carregar matérias disponíveis e itens da pauta
      const [materias, itens] = await Promise.all([
        getMateriasDisponiveis(id),
        getItensPauta(id),
      ]);

      setMateriasDisponiveis(materias);
      setItensPauta(itens);
    } catch (error: any) {
      toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [sessaoId, navigate, toast]);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  // Filtrar matérias pela busca
  const materiasFiltradas = materiasDisponiveis.filter(m =>
    m.protocolo.toLowerCase().includes(busca.toLowerCase()) ||
    m.ementa.toLowerCase().includes(busca.toLowerCase()) ||
    m.autor.toLowerCase().includes(busca.toLowerCase())
  );

  // Separar itens por seção
  const itensExpediente = itensPauta.filter(i => i.tipo_item === "Expediente");
  const itensOrdemDoDia = itensPauta.filter(i => i.tipo_item === "Ordem do Dia");
  const itensExplicacoes = itensPauta.filter(i => i.tipo_item === "Explicações Pessoais");

  // Handlers
  async function handleAddMateria(materiaId: number, tipoItem: TipoItemPauta = "Ordem do Dia") {
    if (!sessaoId || !podeEditar) return;

    try {
      setAddingId(materiaId);

      // Calcular próxima ordem
      const proximaOrdem = itensPauta.length + 1;

      await adicionarItemPauta(parseInt(sessaoId), {
        documento_id: materiaId,
        ordem: proximaOrdem,
        tipo_item: tipoItem,
      });

      // Recarregar dados
      await fetchDados();
      setHasChanges(true);
      toast({ title: "Matéria adicionada à pauta" });
    } catch (error: any) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
    } finally {
      setAddingId(null);
    }
  }

  async function handleRemoveItem(itemId: number) {
    if (!podeEditar) return;

    try {
      await removerItemPauta(itemId);
      await fetchDados();
      setHasChanges(true);
      toast({ title: "Item removido da pauta" });
    } catch (error: any) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !sessaoId || !podeEditar) return;

    const oldIndex = itensPauta.findIndex((item) => item.id === active.id);
    const newIndex = itensPauta.findIndex((item) => item.id === over.id);

    const novosItens = arrayMove(itensPauta, oldIndex, newIndex).map((item, index) => ({
      ...item,
      ordem: index + 1,
    }));

    setItensPauta(novosItens);
    setHasChanges(true);

    try {
      await reordenarPauta(
        parseInt(sessaoId),
        novosItens.map((item) => ({ id: item.id, ordem: item.ordem }))
      );
    } catch (error: any) {
      toast({ title: "Erro ao reordenar", description: error.message, variant: "destructive" });
      await fetchDados(); // Reverte em caso de erro
    }
  }

  async function handleSalvarRascunho() {
    setSaving(true);
    try {
      // Dados já estão salvos incrementalmente
      setHasChanges(false);
      toast({ title: "Pauta salva com sucesso!" });
    } finally {
      setSaving(false);
    }
  }

  async function handlePublicarPauta() {
    // TODO: Implementar lógica de publicação (mudar status, gerar PDF, etc.)
    toast({ title: "Funcionalidade em desenvolvimento" });
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-gov-blue-700" />
          <span className="ml-3">Carregando pauta...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/atividade-legislativa/sessoes">Sessões</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Montagem da Pauta</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gov-blue-800">Montagem da Pauta</h1>
          <p className="text-gray-600">
            Sessão: <span className="font-semibold">{sessao?.titulo || `Sessão #${sessaoId}`}</span>
          </p>
          {!podeEditar && (
            <Badge variant="destructive" className="mt-2">
              Pauta não pode ser editada (sessão não está agendada)
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/atividade-legislativa/sessoes")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button
            variant="outline"
            onClick={handleSalvarRascunho}
            disabled={!hasChanges || saving}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar
          </Button>
          <Button variant="outline" disabled>
            <Printer className="mr-2 h-4 w-4" /> Gerar PDF
          </Button>
          <Button
            className="bg-gov-blue-700 hover:bg-gov-blue-800"
            onClick={handlePublicarPauta}
            disabled={!podeEditar || itensPauta.length === 0}
          >
            <FileUp className="mr-2 h-4 w-4" /> Publicar Pauta
          </Button>
        </div>
      </div>

      {/* Painel Principal */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <ResizablePanelGroup direction="horizontal" className="min-h-[600px] w-full rounded-lg border bg-gray-50 p-4">
          {/* Matérias Disponíveis */}
          <ResizablePanel defaultSize={50}>
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Matérias Disponíveis</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número, ementa ou autor..."
                    className="pl-8"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {materiasFiltradas.length} matéria(s) disponível(is)
                </p>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {materiasFiltradas.length > 0 ? (
                  materiasFiltradas.map(m => (
                    <MateriaDisponivelCard
                      key={m.id}
                      materia={m}
                      onAdd={(id) => handleAddMateria(id)}
                      loading={addingId === m.id}
                    />
                  ))
                ) : (
                  <p className="text-sm text-center text-gray-500 py-8">
                    Nenhuma matéria disponível.
                  </p>
                )}
              </CardContent>
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Pauta da Sessão */}
          <ResizablePanel defaultSize={50}>
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pauta da Sessão</CardTitle>
                <p className="text-xs text-gray-500">
                  {itensPauta.length} item(ns) na pauta
                </p>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {/* Expediente */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Expediente
                  </h3>
                  {itensExpediente.length > 0 ? (
                    <SortableContext items={itensExpediente.map(i => i.id)} strategy={verticalListSortingStrategy}>
                      {itensExpediente.map((item) => (
                        <SortableItemPauta key={item.id} item={item} onRemove={handleRemoveItem} />
                      ))}
                    </SortableContext>
                  ) : (
                    <p className="text-xs text-gray-400 py-2 border border-dashed rounded px-2">
                      Nenhuma matéria no expediente
                    </p>
                  )}
                </div>

                {/* Ordem do Dia */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Ordem do Dia
                  </h3>
                  {itensOrdemDoDia.length > 0 ? (
                    <SortableContext items={itensOrdemDoDia.map(i => i.id)} strategy={verticalListSortingStrategy}>
                      {itensOrdemDoDia.map((item) => (
                        <SortableItemPauta key={item.id} item={item} onRemove={handleRemoveItem} />
                      ))}
                    </SortableContext>
                  ) : (
                    <p className="text-xs text-gray-400 py-2 border border-dashed rounded px-2">
                      Nenhuma matéria na ordem do dia
                    </p>
                  )}
                </div>

                {/* Explicações Pessoais */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Explicações Pessoais
                  </h3>
                  {itensExplicacoes.length > 0 ? (
                    <SortableContext items={itensExplicacoes.map(i => i.id)} strategy={verticalListSortingStrategy}>
                      {itensExplicacoes.map((item) => (
                        <SortableItemPauta key={item.id} item={item} onRemove={handleRemoveItem} />
                      ))}
                    </SortableContext>
                  ) : (
                    <p className="text-xs text-gray-400 py-2 border border-dashed rounded px-2">
                      Nenhuma explicação pessoal
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </DndContext>
    </AppLayout>
  );
}
