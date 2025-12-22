
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AppLayout } from "@/components/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComissoesByPeriodo, createComissao, updateComissao, deleteComissao, updateMembrosComissao, Comissao } from "@/services/comissoesService";
import { getMesaByPeriodo } from "@/services/mesaDiretoraService";
import { getVereadores } from "@/services/vereadoresService";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ModalEditarComissao from "@/components/comissoes/ModalEditarComissao";
import ModalMembrosComissao from "@/components/comissoes/ModalMembrosComissao";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ComissoesLegislatura() {
  const { legislaturaNumero, periodoId } = useParams();
  const queryClient = useQueryClient();
  const pId = Number(periodoId);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [editingComissao, setEditingComissao] = useState<Comissao | undefined>(undefined);
  const [comissaoToDelete, setComissaoToDelete] = useState<number | null>(null);

  // Queries
  const { data: comissoes = [], isLoading } = useQuery({
    queryKey: ["comissoes", pId],
    queryFn: () => getComissoesByPeriodo(pId),
    enabled: !!pId
  });

  const { data: vereadores = [] } = useQuery({
    queryKey: ["vereadores"],
    queryFn: getVereadores
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: { nome: string, descricao: string }) => createComissao(pId, data.nome, data.descricao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comissoes", pId] });
      toast.success("Comissão criada com sucesso!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, nome: string, descricao: string }) => updateComissao(data.id, data.nome, data.descricao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comissoes", pId] });
      toast.success("Comissão atualizada!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteComissao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comissoes", pId] });
      toast.success("Comissão excluída!");
      setComissaoToDelete(null);
    }
  });

  const updateMembersMutation = useMutation({
    mutationFn: (data: { comissaoId: number, membros: { cargo: any, agente_publico_id: number }[] }) =>
      updateMembrosComissao(data.comissaoId, data.membros),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comissoes", pId] });
      toast.success("Membros atualizados!");
    }
  });

  // Fetch Mesa for this Period to check for President
  const { data: mesa } = useQuery({
    queryKey: ["mesa", pId],
    queryFn: () => getMesaByPeriodo(pId),
    enabled: !!pId,
    retry: false
  });

  // Identify President ID to exclude
  const presidentId = mesa?.membros?.find(m => m.cargo === 'Presidente')?.agente_publico_id;

  // ... (Queries section) ...

  // Handlers
  const handleEditClick = (c: Comissao) => {
    setEditingComissao(c);
    setIsEditModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingComissao(undefined);
    setIsEditModalOpen(true);
  };

  const handleMembersClick = (c: Comissao) => {
    setEditingComissao(c);
    setIsMembersModalOpen(true);
  };

  const handleSaveComissao = (data: { nome: string, descricao: string }) => {
    if (editingComissao) {
      updateMutation.mutate({ id: editingComissao.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleSaveMembros = (membros: { cargo: string, agente_publico_id: number }[]) => {
    if (editingComissao) {
      updateMembersMutation.mutate({ comissaoId: editingComissao.id, membros: membros as any });
    }
  };

  return (
    <AppLayout>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/atividade-legislativa/legislaturas/${legislaturaNumero}`}>Legislatura {legislaturaNumero}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Comissões</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">
          Comissões Permanentes
        </h1>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" /> Nova Comissão
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comissoes.map((comissao: Comissao) => (
            <Card key={comissao.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gov-blue-800">{comissao.nome}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {comissao.descricao || "Sem descrição."}
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  {comissao.membros?.length || 0} membro(s)
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="ghost" size="sm" onClick={() => handleMembersClick(comissao)}>
                  <Users className="h-4 w-4 mr-2" /> Membros
                </Button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(comissao)}>
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setComissaoToDelete(comissao.id)}>
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <ModalEditarComissao
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        comissao={editingComissao}
        onSave={handleSaveComissao}
      />

      <ModalMembrosComissao
        open={isMembersModalOpen}
        onOpenChange={setIsMembersModalOpen}
        comissao={editingComissao!}
        vereadores={vereadores}
        onSave={handleSaveMembros}
        vereadoresExcluidos={presidentId ? [presidentId] : []}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!comissaoToDelete} onOpenChange={(open) => !open && setComissaoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá a comissão permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => comissaoToDelete && deleteMutation.mutate(comissaoToDelete)} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AppLayout>
  );
}
