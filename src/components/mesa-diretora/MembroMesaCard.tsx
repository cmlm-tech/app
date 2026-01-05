import { Vereador } from "../vereadores/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

type Cargo =
    | "Presidente"
    | "Vice-Presidente"
    | "1º Secretário"
    | "2º Secretário"
    | "1º Tesoureiro"
    | "2º Tesoureiro";

type Props = {
    vereador: Vereador | null;
    cargo: Cargo;
    licencaInfo?: {
        data_afastamento: string | null;
        condicao: string;
    } | null;
};

const cargoColors: Record<Cargo, string> = {
    "Presidente": "bg-gov-gold-600 text-white hover:bg-gov-gold-700",
    "Vice-Presidente": "bg-gray-500 text-white hover:bg-gray-600",
    "1º Secretário": "bg-gov-blue-600 text-white hover:bg-gov-blue-700",
    "2º Secretário": "bg-gov-blue-500 text-white hover:bg-gov-blue-600",
    "1º Tesoureiro": "bg-green-600 text-white hover:bg-green-700",
    "2º Tesoureiro": "bg-green-500 text-white hover:bg-green-600",
};

export default function MembroMesaCard({ vereador, cargo, licencaInfo }: Props) {
    const navigate = useNavigate();

    // Verificar se está de licença
    const estaEmLicenca = licencaInfo?.data_afastamento &&
        new Date(licencaInfo.data_afastamento) <= new Date();

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow flex flex-col items-center p-6 h-full">
            <Badge className={`mb-3 ${cargoColors[cargo]}`}>
                {cargo}
            </Badge>

            {vereador ? (
                <>
                    <div className="relative">
                        <img
                            src={vereador.foto || 'https://via.placeholder.com/150'}
                            alt={vereador.nome}
                            className={`w-24 h-24 rounded-full object-cover border-4 border-gov-blue-100 mb-3 shadow-md ${estaEmLicenca ? 'opacity-40' : ''}`}
                        />
                        {estaEmLicenca && (
                            <div className="absolute bottom-2 right-0 bg-orange-500 text-white rounded-full px-2 py-0.5 text-[10px] font-medium">
                                Licença
                            </div>
                        )}
                    </div>
                    <h3 className={`text-lg font-bold text-gov-blue-900 text-center mb-1 ${estaEmLicenca ? 'text-gray-400' : ''}`}>
                        {vereador.nome}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                        {vereador.partidoLogo && (
                            <img
                                src={vereador.partidoLogo}
                                alt={vereador.partido}
                                className={`h-5 w-5 object-contain ${estaEmLicenca ? 'opacity-40' : ''}`}
                            />
                        )}
                        <span className={`text-gray-600 text-sm font-medium ${estaEmLicenca ? 'text-gray-400' : ''}`}>
                            {vereador.partido}
                        </span>
                    </div>

                    {estaEmLicenca && (
                        <p className="text-xs text-orange-600 mb-2">
                            (Cargo Vago)
                        </p>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-auto"
                        onClick={() => navigate(`/plenario/vereadores/${vereador.id}`)}
                    >
                        Ver Perfil
                    </Button>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-gray-200 mb-3 flex items-center justify-center opacity-30">
                        <span className="text-4xl text-gray-300">?</span>
                    </div>
                    <p className="text-sm">Cargo vago</p>
                </div>
            )}
        </div>
    );
}
