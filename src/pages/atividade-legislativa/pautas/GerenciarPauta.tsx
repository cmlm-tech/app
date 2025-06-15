
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft, Plus, Printer, Save, FileUp, Search } from 'lucide-react';
import { SortableMateriaItem } from '@/components/pautas/gerenciar/SortableMateriaItem';
import { Materia, TipoMateria, StatusMateria } from '@/components/materias/types';
import { PAUTAS_MOCK } from '@/pages/atividade-legislativa/Pautas'; // Importando mock

const MOCK_MATERIAS_DISPONIVEIS: Materia[] = [
    { id: "mat-4", protocolo: "PL 18/2025", tipo: "Projeto de Lei", ementa: "Institui a política municipal de combate às fake news.", autor: "Vereadora Ana Lima", dataProtocolo: new Date("2025-06-12"), status: "Em análise" },
    { id: "mat-5", protocolo: "REQ 25/2025", tipo: "Requerimento", ementa: "Solicita ao executivo o cronograma de vacinação atualizado.", autor: "Vereador Carlos Mendes", dataProtocolo: new Date("2025-06-11"), status: "Protocolado" },
    { id: "mat-6", protocolo: "PL 20/2025", tipo: "Projeto de Lei", ementa: "Dispõe sobre a instalação de painéis solares em prédios públicos.", autor: "Comissão de Meio Ambiente", dataProtocolo: new Date("2025-05-28"), status: "Em análise" },
    { id: "mat-7", protocolo: "MO 05/2025", tipo: "Moção", ementa: "Moção de apoio aos profissionais de saúde.", autor: "Vereadora Sofia Costa", dataProtocolo: new Date("2025-06-15"), status: "Protocolado" },
];

const MateriaDisponivelCard = ({ materia, onAdd }: { materia: Materia, onAdd: (id: string) => void }) => (
  <Card className="mb-2 bg-white hover:bg-gray-50 transition-colors">
    <CardContent className="p-3 flex items-center justify-between gap-2">
      <div className="flex-grow">
        <p className="font-semibold text-sm text-gov-blue-700">{materia.protocolo}</p>
        <p className="text-xs text-gray-600">{materia.ementa}</p>
      </div>
      <Button size="sm" variant="outline" onClick={() => onAdd(materia.id)}>
        Adicionar <ArrowLeft className="mr-2 h-4 w-4" style={{ transform: 'rotate(180deg)' }} />
      </Button>
    </CardContent>
  </Card>
);

export default function GerenciarPauta() {
  const { pautaId } = useParams();
  const pautaAtual = PAUTAS_MOCK.find(p => p.id === pautaId) || null;

  const [itensPauta, setItensPauta] = useState<Materia[]>([]);
  const [materiasDisponiveis, setMateriasDisponiveis] = useState<Materia[]>(MOCK_MATERIAS_DISPONIVEIS);
  const [busca, setBusca] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItensPauta((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function addMateria(materiaId: string) {
    const materia = materiasDisponiveis.find(m => m.id === materiaId);
    if (materia) {
      setItensPauta(prev => [...prev, materia]);
      setMateriasDisponiveis(prev => prev.filter(m => m.id !== materiaId));
    }
  }

  function removeMateria(materiaId: string) {
    const materia = itensPauta.find(m => m.id === materiaId);
    if (materia) {
      setMateriasDisponiveis(prev => [...prev, materia]);
      setItensPauta(prev => prev.filter(m => m.id !== materiaId));
    }
  }
  
  const materiasFiltradas = materiasDisponiveis.filter(m => 
    m.protocolo.toLowerCase().includes(busca.toLowerCase()) || 
    m.ementa.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <AppLayout>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/atividade-legislativa/pautas">Atividade Legislativa</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/atividade-legislativa/pautas">Pautas</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Montagem da Pauta</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gov-blue-800">Montagem da Pauta</h1>
          <p className="text-gray-600 text-lg">
            Sessão de Referência: <span className="font-semibold">{pautaAtual?.sessao.titulo || 'Não encontrada'}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Save className="mr-2 h-4 w-4" /> Salvar Rascunho</Button>
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Gerar PDF Prévio</Button>
          <Button className="bg-gov-blue-700 hover:bg-gov-blue-800"><FileUp className="mr-2 h-4 w-4" /> Publicar Pauta</Button>
        </div>
      </div>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <ResizablePanelGroup direction="horizontal" className="min-h-[600px] w-full rounded-lg border bg-gray-50 p-4">
          <ResizablePanel defaultSize={50}>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Matérias Disponíveis para Pauta</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por número ou ementa..." className="pl-8" value={busca} onChange={(e) => setBusca(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto">
                {materiasFiltradas.length > 0 ? materiasFiltradas.map(m => (
                  <MateriaDisponivelCard key={m.id} materia={m} onAdd={addMateria} />
                )) : <p className="text-sm text-center text-gray-500 py-4">Nenhuma matéria disponível.</p>}
              </CardContent>
            </Card>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Itens da Pauta (Ordem do Dia)</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto">
                <div className="border-b-2 border-dashed pb-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Expediente</h3>
                  <p className="text-sm text-gray-500">Matérias para leitura e informes (arraste aqui).</p>
                </div>
                <div className="border-b-2 border-dashed pb-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Ordem do Dia</h3>
                  <p className="text-sm text-gray-500">Matérias para discussão e votação.</p>
                </div>
                <SortableContext items={itensPauta.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  {itensPauta.length > 0 ? itensPauta.map((m, index) => (
                    <SortableMateriaItem key={m.id} materia={m} onRemove={removeMateria} ordem={index + 1} />
                  )) : <p className="text-sm text-center text-gray-500 py-4">Arraste uma matéria aqui para começar.</p>}
                </SortableContext>
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </DndContext>
    </AppLayout>
  );
}
