
import React from "react";

type Vereador = { id: string; nome: string; partido: string; foto: string };

type Props = {
  papel: "Presidente" | "Relator" | "Membro";
  vereador?: Vereador;
};

export function CardMembroComissao({ papel, vereador }: Props) {
  if (!vereador) {
    return (
      <div className="rounded-lg border bg-white p-4 flex flex-col items-center shadow-sm min-h-[160px]">
        <div className="bg-gray-200 rounded-full w-14 h-14 mb-2" />
        <span className="font-medium text-gray-700">{papel}</span>
        <span className="text-gray-400 text-sm mt-2">Não definido</span>
      </div>
    );
  }
  return (
    <div className="rounded-lg border bg-white p-4 flex flex-col items-center shadow-sm min-h-[160px]">
      <img
        src={vereador.foto}
        alt={vereador.nome}
        className="w-14 h-14 rounded-full object-cover mb-2 border shadow"
      />
      <span className="font-semibold text-gov-blue-900">{vereador.nome}</span>
      <span className="text-xs text-gray-500">{papel}</span>
      <span className="text-sm text-zinc-600 mt-1">{vereador.partido}</span>
    </div>
  );
}
