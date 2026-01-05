
import React from "react";
import { AppLayout } from "@/components/AppLayout";
import MesaDiretoraContent from "@/components/mesa-diretora/MesaDiretoraContent";
import { useQuery } from "@tanstack/react-query";
import { getCurrentPeriodo } from "@/services/legislaturaService";
import { Skeleton } from "@/components/ui/skeleton";

export default function MesaDiretoraPlenario() {
  const { data: periodoAtual, isLoading } = useQuery({
    queryKey: ["currentPeriodo"],
    queryFn: getCurrentPeriodo
  });

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">Mesa Diretora</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : periodoAtual ? (
        <MesaDiretoraContent periodoId={periodoAtual.id} />
      ) : (
        <div className="text-center py-10 text-gray-500">
          Nenhuma mesa diretora ativa encontrada.
        </div>
      )}
    </AppLayout>
  );
}
