
import { Vereador } from "../vereadores/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type Props = {
  vereador: Vereador | null;
  ano: string;
};

export default function VicePresidenteCard({ vereador, ano }: Props) {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center mb-7">
      <span className="uppercase text-gov-gold-700 font-bold mb-1 text-xs tracking-wider">Vice-presidente</span>
      <div className="bg-white rounded-xl shadow-md border w-full max-w-sm flex flex-col items-center p-6 relative">
        {vereador ? (
          <>
            <img
              src={vereador.foto}
              alt={vereador.nome}
              className="w-20 h-20 rounded-full object-cover border-4 border-gov-blue-100 mb-2 shadow"
            />
            <div className="text-lg font-semibold text-gov-blue-900 mb-0.5">
              {vereador.nome}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <img src={vereador.partidoLogo} alt="" className="h-5 w-5" />
              <span className="text-gray-600 text-sm">{vereador.partido}</span>
            </div>
            <Button
              variant="secondary"
              className="mt-1"
              size="sm"
              onClick={() => navigate(`/plenario/vereadores/${vereador!.id}`)}
            >
              Ver Perfil
            </Button>
          </>
        ) : <div className="text-gray-500 p-6">Não definido para {ano}</div>}
      </div>
    </section>
  );
}
