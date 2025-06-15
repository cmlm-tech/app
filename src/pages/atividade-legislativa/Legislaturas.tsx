
import { AppLayout } from "@/components/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Legislatura } from "@/components/legislaturas/types";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// MOCK DATA
const LEGISLATURAS_MOCK: Legislatura[] = [
  { id: '2025-2028', anoInicio: 2025, anoFim: 2028, periodos: [] },
  { id: '2021-2024', anoInicio: 2021, anoFim: 2024, periodos: [] },
  { id: '2017-2020', anoInicio: 2017, anoFim: 2020, periodos: [] },
];


const Legislaturas = () => (
  <AppLayout>
    <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">Legislaturas</h1>
            <p className="text-gray-600 text-lg">Selecione uma legislatura para gerenciar seus períodos legislativos.</p>
        </div>
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {LEGISLATURAS_MOCK.map((leg) => (
            <Link to={`/atividade-legislativa/legislaturas/${leg.id}`} key={leg.id} className="block">
                <Card className="hover:shadow-lg hover:border-gov-blue-500 transition-all duration-200 cursor-pointer h-full flex flex-col">
                    <CardHeader className="flex-grow">
                        <CardTitle className="text-gov-blue-800">Legislatura {leg.anoInicio} - {leg.anoFim}</CardTitle>
                        <CardDescription>Clique para ver os detalhes e gerenciar os períodos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end items-center text-sm font-semibold text-gov-blue-700">
                            Ver detalhes
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                    </CardContent>
                </Card>
            </Link>
        ))}
    </div>
  </AppLayout>
);

export default Legislaturas;
