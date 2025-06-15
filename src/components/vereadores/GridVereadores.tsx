
import { Vereador } from "./types";
import { useNavigate } from "react-router-dom";

type Props = { vereadores: Vereador[] };

export default function GridVereadores({ vereadores }: Props) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
      {vereadores.map((v) => (
        <div
          key={v.id}
          className="bg-white rounded-xl border shadow-sm flex flex-col items-center px-6 py-7 relative min-h-[390px] h-full"
        >
          <img
            src={v.foto}
            alt={v.nome}
            className="w-24 h-24 rounded-full object-cover border-4 border-gov-blue-100 mb-3 shadow"
          />
          <div className="text-xl font-semibold text-gov-blue-900 mb-1 text-center">
            {v.nome}
          </div>
          <div className="text-sm text-gov-blue-800 mb-1">
            {(v.cargoMesa && v.cargoMesa !== "Nenhum" && v.cargoMesa !== "") ? (
              <span className="bg-gov-gold-100 text-gov-blue-900 px-2 py-0.5 rounded font-medium">{v.cargoMesa}</span>
            ) : (
              <span className="text-gray-500">Vereador</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1">
            {v.partidoLogo && (
              <img src={v.partidoLogo} alt={v.partido} className="h-5 w-5" />
            )}
            <span className="text-gray-600">{v.partido}</span>
          </div>
          <div className="flex-1" />
          <button
            className="mt-3 w-full bg-gov-blue-700 hover:bg-gov-blue-900 text-white font-semibold py-2 rounded transition-colors"
            onClick={() => navigate(`/plenario/vereadores/${v.id}`)}
          >
            Ver Perfil Completo
          </button>
        </div>
      ))}
      {vereadores.length === 0 && (
        <div className="col-span-full text-gray-400 text-center">Nenhum vereador encontrado.</div>
      )}
    </div>
  );
}
