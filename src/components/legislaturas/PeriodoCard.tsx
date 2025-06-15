
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PeriodoLegislativo } from "./types";
import { Vereador } from "../vereadores/types";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Props = {
    periodo: PeriodoLegislativo;
    presidente: Vereador | undefined;
    onGerenciar: () => void;
};

const statusColors: Record<string, string> = {
    "Em andamento": "bg-green-100 text-green-800",
    "Concluído": "bg-gray-100 text-gray-800",
    "Futuro": "bg-blue-100 text-blue-800",
};

export function PeriodoCard({ periodo, presidente, onGerenciar }: Props) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Período de {periodo.ano}</CardTitle>
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", statusColors[periodo.status])}>
                        {periodo.status}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="font-semibold">Presidente:</div>
                {presidente ? (
                     <div className="flex items-center gap-3">
                        <img src={presidente.foto} alt={presidente.nome} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
                        <span className="text-gray-800">{presidente.nome}</span>
                    </div>
                ) : (
                    <div className="text-gray-500 text-sm">Não definido</div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="w-full" asChild>
                    <Link to={`/plenario/mesa-diretora?periodo=${periodo.ano}`}>Mesa Diretora</Link>
                </Button>
                 <Button variant="outline" className="w-full" asChild>
                    <Link to={`/plenario/comissoes?periodo=${periodo.ano}`}>Comissões</Link>
                </Button>
                <Button onClick={onGerenciar} className="w-full">Gerenciar</Button>
            </CardFooter>
        </Card>
    )
}

