import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
// O arquivo types.ts correspondente deve ser criado ou já existir no mesmo diretório
import { PeriodoRow, AgentePublicoRow } from "./types";

// ALTERAÇÃO 1: Adicionar 'legislaturaNumero' à definição de Props
type Props = {
    periodo: PeriodoRow;
    presidente: AgentePublicoRow | undefined;
    onGerenciar?: () => void;
    legislaturaNumero: number;
};

const statusStyles: Record<string, string> = {
    "Em andamento": "bg-green-100 text-green-800",
    "Concluído": "bg-gray-100 text-gray-800",
    "Futuro": "bg-blue-100 text-blue-800",
};

// ALTERAÇÃO 2: Receber a nova prop 'legislaturaNumero' na função
export function PeriodoCard({ periodo, presidente, onGerenciar, legislaturaNumero }: Props) {
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
            {/* ALTERAÇÃO 3: Atualizar os links para a nova estrutura de rotas aninhadas */}
            <CardFooter className="flex flex-col gap-2">
                <Button variant="outline" className="w-full" asChild>
                    <Link to={`/atividade-legislativa/legislaturas/${legislaturaNumero}/periodos/${periodo.id}/mesa-diretora`}>Mesa Diretora</Link>
                </Button>
                 <Button variant="outline" className="w-full" asChild>
                    <Link to={`/atividade-legislativa/legislaturas/${legislaturaNumero}/periodos/${periodo.id}/comissoes`}>Comissões</Link>
                </Button>
                {onGerenciar && <Button onClick={onGerenciar} className="w-full">Gerenciar</Button>}
            </CardFooter>
        </Card>
    )
}