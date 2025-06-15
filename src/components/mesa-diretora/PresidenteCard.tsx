
import { Vereador } from "../vereadores/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type Props = {
  vereador: Vereador | null;
  ano: string;
};

export default function PresidenteCard({ vereador, ano }: Props) {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center mb-6">
      <span className="uppercase text-gov-gold-700 font-bold mb-1 text-sm tracking-wider">Presidente</span>
      <div className="bg-white rounded-xl shadow-lg border w-full max-w-md flex flex-col items-center p-7 mb-4 relative">
        {vereador ? (
          <>
            <img
              src={vereador.foto}
              alt={vereador.nome}
              className="w-28 h-28 rounded-full object-cover border-4 border-gov-blue-100 mb-3 shadow"
            />
            <div className="text-2xl font-bold text-gov-blue-900 mb-0.5">
              {vereador.nome}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <img src={vereador.partidoLogo} alt="" className="h-6 w-6" />
              <span className="text-gray-600 text-base font-medium">
                {vereador.partido}
              </span>
            </div>
            <Button
              variant="secondary"
              className="mt-2"
              onClick={() => navigate(`/plenario/vereadores/${vereador!.id}`)}
            >
              Ver Perfil
            </Button>
          </>
        ) : <div className="text-gray-500 p-8">Não definido para {ano}</div>}
      </div>
    </section>
  );
}
