
import React from "react";
import { Eye, Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Membro = { id: string; nome: string; foto: string };
type Comissao = {
  id: string;
  nome: string;
  competencias: string;
  membros: Membro[];
};

type Props = {
  comissao: Comissao;
  admin: boolean;
  onVer?: () => void;
  onEditar: () => void;
  onExcluir: () => void;
};

export function CardComissao({ comissao, admin, onVer, onEditar, onExcluir }: Props) {
  const navigate = useNavigate();
  // Aciona onVer ou navega para detalhes
  function handleVer() {
    if (onVer) return onVer();
    navigate(`/plenario/comissoes/${comissao.id}`);
  }

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border w-full max-w-[330px] min-h-[235px]">
      <div>
        <h3 className="text-lg font-bold text-gov-blue-900 mb-1">{comissao.nome}</h3>
        <p className="text-gray-600 text-sm line-clamp-2" title={comissao.competencias}>
          {comissao.competencias.length > 95
            ? comissao.competencias.substring(0, 95) + "..."
            : comissao.competencias}
        </p>
      </div>
      <div className="flex items-center -space-x-2 mt-2 pt-2">
        {comissao.membros.slice(0, 4).map((m) => (
          <img
            key={m.id}
            src={m.foto}
            alt={m.nome}
            title={m.nome}
            className="w-9 h-9 object-cover rounded-full border-2 border-white shadow"
          />
        ))}
      </div>
      <div className="flex-1" />
      {admin && (
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 mt-4">
          <button
            onClick={handleVer}
            className="p-2 rounded hover:bg-gray-100 transition text-gov-blue-800"
            title="Ver Detalhes"
          >
            <Eye />
          </button>
          <button
            onClick={onEditar}
            className="p-2 rounded hover:bg-yellow-100 transition text-yellow-700"
            title="Editar Comissão"
          >
            <Pencil />
          </button>
          <button
            onClick={onExcluir}
            className="p-2 rounded hover:bg-red-100 transition text-red-600"
            title="Excluir Comissão"
          >
            <Trash />
          </button>
        </div>
      )}
      {!admin && (
        <div className="flex justify-end pt-2 mt-4">
          <button
            onClick={handleVer}
            className="p-2 rounded hover:bg-gray-100 transition text-gov-blue-800"
            title="Ver Detalhes"
          >
            <Eye />
          </button>
        </div>
      )}
    </div>
  );
}
