import { AppLayout } from "@/components/AppLayout";
import MesaDiretoraContent from "@/components/mesa-diretora/MesaDiretoraContent";
import { useParams } from 'react-router-dom';
import ModalMesaDiretora from "@/components/mesa-diretora/ModalMesaDiretora";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMesaByPeriodo, updateMesaMembros } from "@/services/mesaDiretoraService";
import { getVereadores } from "@/services/vereadoresService";
import { toast } from "sonner";

export default function MesaDiretoraLegislatura() {
  const { legislaturaNumero, periodoId } = useParams();
  const queryClient = useQueryClient();
  const pId = Number(periodoId);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Buscar mesa e vereadores
  const { data: mesa } = useQuery({
    queryKey: ["mesa", pId],
    queryFn: () => getMesaByPeriodo(pId),
    enabled: !!pId,
    retry: false
  });

  const { data: vereadores = [] } = useQuery({
    queryKey: ["vereadores"],
    queryFn: getVereadores
  });

  // Mutation para atualizar membros
  const updateMutation = useMutation({
    mutationFn: (membros: { cargo: string; agente_publico_id: number }[]) =>
      updateMesaMembros(pId, membros),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mesa", pId] });
      toast.success("Mesa Diretora atualizada!");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar Mesa Diretora");
    }
  });

  const handleSave = (membros: { cargo: string; agente_publico_id: number }[]) => {
    updateMutation.mutate(membros);
  };

  // Transformar vereadores para formato esperado pelo modal
  const vereadoresFormatados = vereadores.map(v => ({
    id: v.id,
    nome: v.nome_parlamentar || v.nome_completo,
    foto: v.foto_url
  }));

  return (
    <AppLayout>
      {/* Header com botão Gerenciar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">
          Mesa Diretora
        </h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Users className="mr-2 h-4 w-4" />
          Gerenciar Membros
        </Button>
      </div>

      <MesaDiretoraContent periodoId={pId} />

      {/* Modal de Edição */}
      <ModalMesaDiretora
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        membrosAtuais={mesa?.membros || []}
        vereadores={vereadoresFormatados}
        onSave={handleSave}
      />
    </AppLayout>
  );
}