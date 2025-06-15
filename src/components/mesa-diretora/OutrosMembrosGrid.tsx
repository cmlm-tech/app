
import { Vereador } from "../vereadores/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type MembroCargo = {
  vereador: Vereador | null;
  cargoLabel: string;
  cargoKey: string;
};

type Props = {
  membros: MembroCargo[];
};

export default function OutrosMembrosGrid({ membros }: Props) {
  const navigate = useNavigate();

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-3">
      {membros.map((membroInfo) => {
        const { vereador, cargoLabel, cargoKey } = membroInfo;
        return (
          <div key={cargoKey} className="bg-white rounded-lg shadow border flex flex-col items-center p-5 min-h-[230px] justify-center">
            <span className="uppercase text-gov-gold-700 font-bold mb-1 text-xs tracking-wide">{cargoLabel}</span>
            {vereador ? (
              <>
                <img
                  src={vereador.foto}
                  alt={vereador.nome}
                  className="w-16 h-16 rounded-full object-cover border-4 border-gov-blue-100 mb-2 shadow"
                />
                <div className="text-base font-semibold text-gov-blue-900 mb-0.5 text-center">
                  {vereador.nome}
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <img src={vereador.partidoLogo} alt="" className="h-4 w-4" />
                  <span className="text-gray-600 text-sm">{vereador.partido}</span>
                </div>
                <Button
                  variant="ghost"
                  className="mt-1 text-xs"
                  size="sm"
                  onClick={() => navigate(`/plenario/vereadores/${vereador.id}`)}
                >
                  Ver Perfil
                </Button>
              </>
            ) : <div className="text-gray-500 text-sm">Não definido</div>}
          </div>
        );
      })}
    </section>
  );
}
