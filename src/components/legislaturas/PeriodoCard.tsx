import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PeriodoRow, AgentePublicoRow } from "./types";

type Props = {
    periodo: PeriodoRow;
    presidente: AgentePublicoRow | undefined;
    // ALTERAÇÃO 1: Tornar a propriedade 'onGerenciar' opcional adicionando '?'
    onGerenciar?: () => void;
};

const statusStyles: Record<string, string> = {
    "Em andamento": "bg-green-100 text-green-800",
    "Concluído": "bg-gray-100 text-gray-800",
    "Futuro": "bg-blue-100 text-blue-800",
};

export function PeriodoCard({ periodo, presidente, onGerenciar }: Props) {
    const getStatus = (dataInicio: string, dataFim: string): string => {
        const hoje = new Date();
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        hoje.setHours(0, 0, 0, 0);
        inicio.setHours(0, 0, 0, 0);
        fim.setHours(0, 0, 0, 0);

        if (hoje > fim) return "Concluído";
        if (hoje >= inicio && hoje <= fim) return "Em andamento";
        return "Futuro";
    };

    const status = getStatus(periodo.data_inicio, periodo.data_fim);
    const ano = new Date(periodo.data_inicio).getFullYear();

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{periodo.descricao || `Período de ${ano}`}</CardTitle>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
                        {status}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="font-semibold">Presidente:</div>
                {presidente ? (
                     <div className="flex items-center gap-3">
                        <img src={presidente.foto_url || '/placeholder.svg'} alt={presidente.nome_completo} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
                        <span className="text-gray-800">{presidente.nome_completo}</span>
                    </div>
                ) : (
                    <div className="text-gray-500 text-sm">Não definido</div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button variant="outline" className="w-full" asChild>
                    <Link to={`/plenario/mesa-diretora?periodoId=${periodo.id}`}>Mesa Diretora</Link>
                </Button>
                 <Button variant="outline" className="w-full" asChild>
                    <Link to={`/plenario/comissoes?periodoId=${periodo.id}`}>Comissões</Link>
                </Button>
                
                {/* ALTERAÇÃO 2: Renderizar o botão somente se 'onGerenciar' for uma função válida */}
                {onGerenciar && (
                    <Button onClick={onGerenciar} className="w-full">Gerenciar</Button>
                )}
            </CardFooter>
        </Card>
    )
}