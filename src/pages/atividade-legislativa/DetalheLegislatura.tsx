
import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Legislatura, PeriodoLegislativo } from "@/components/legislaturas/types";
import { Vereador } from "@/components/vereadores/types";
import { PeriodoCard } from "@/components/legislaturas/PeriodoCard";
import { ModalGerenciarPeriodo } from "@/components/legislaturas/ModalGerenciarPeriodo";

// MOCKS
const VEREADORES_MOCK: Vereador[] = [
  { id: "1", nome: "Ana Paula Silva", partido: "Democratas", partidoLogo: "", foto: "https://static.wikia.nocookie.net/simpsons/images/0/0b/Marge_Simpson.png", email: "", telefone: "", biografia: "", legislatura: "", comissoes: [] },
  { id: "2", nome: "Carlos Moura", partido: "Republicanos", partidoLogo: "", foto: "/vereadores/bart.png", email: "", telefone: "", biografia: "", legislatura: "", comissoes: [] },
  { id: "3", nome: "Lívia Rocha", partido: "Progressistas", partidoLogo: "", foto: "https://static.wikia.nocookie.net/simpsons/images/e/ec/Lisa_Simpson.png", email: "", telefone: "", biografia: "", legislatura: "", comissoes: [] },
  { id: "4", nome: "Roberto Lima", partido: "Democratas", partidoLogo: "", foto: "https://static.wikia.nocookie.net/simpsons/images/0/02/Homer_Simpson_2006.png", email: "", telefone: "", biografia: "", legislatura: "", comissoes: [] },
];

const LEGISLATURAS_MOCK: Legislatura[] = [
    {
        id: '2025-2028', anoInicio: 2025, anoFim: 2028, 
        periodos: [
            { id: 'p-2025', ano: 2025, status: 'Em andamento', presidenteId: '1' },
            { id: 'p-2026', ano: 2026, status: 'Futuro' },
            { id: 'p-2027', ano: 2027, status: 'Futuro' },
            { id: 'p-2028', ano: 2028, status: 'Futuro' },
        ]
    },
    { id: '2021-2024', anoInicio: 2021, anoFim: 2024, periodos: [] },
];

export default function DetalheLegislatura() {
    const { legislaturaId } = useParams<{ legislaturaId: string }>();
    
    // Simula a busca dos dados da legislatura e a atualização do estado
    const [legislatura, setLegislatura] = useState<Legislatura | undefined>(
        LEGISLATURAS_MOCK.find(l => l.id === legislaturaId)
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoLegislativo | null>(null);

    const handleGerenciarClick = (periodo: PeriodoLegislativo) => {
        setPeriodoSelecionado(periodo);
        setModalOpen(true);
    };

    const handleSavePeriodo = (data: { presidenteId: string }) => {
        if (!periodoSelecionado || !legislatura) return;

        const updatedPeriodos = legislatura.periodos.map(p => 
            p.id === periodoSelecionado.id ? { ...p, presidenteId: data.presidenteId } : p
        );
        
        setLegislatura({ ...legislatura, periodos: updatedPeriodos });
        setModalOpen(false);
        setPeriodoSelecionado(null);
    };

    if (!legislatura) {
        return (
            <AppLayout>
                <div className="text-center py-10">
                    <h1 className="text-2xl font-bold">Legislatura não encontrada</h1>
                    <Link to="/atividade-legislativa/legislaturas" className="text-gov-blue-700 hover:underline">Voltar para a lista</Link>
                </div>
            </AppLayout>
        );
    }
    
    return (
        <AppLayout>
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink asChild><Link to="/atividade-legislativa/sessoes">Atividade Legislativa</Link></BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink asChild><Link to="/atividade-legislativa/legislaturas">Legislaturas</Link></BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>Legislatura {legislatura.anoInicio} - {legislatura.anoFim}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gov-blue-800">Legislatura {legislatura.anoInicio} - {legislatura.anoFim}</h1>
                    <p className="text-gray-600 text-lg">Gerencie os períodos anuais e suas respectivas composições.</p>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {legislatura.periodos.map(periodo => {
                    const presidente = VEREADORES_MOCK.find(v => v.id === periodo.presidenteId);
                    return (
                        <PeriodoCard 
                            key={periodo.id} 
                            periodo={periodo} 
                            presidente={presidente}
                            onGerenciar={() => handleGerenciarClick(periodo)}
                        />
                    );
                })}
            </div>

            <ModalGerenciarPeriodo 
                open={modalOpen}
                onOpenChange={setModalOpen}
                periodo={periodoSelecionado}
                vereadores={VEREADORES_MOCK}
                onSave={handleSavePeriodo}
            />

        </AppLayout>
    );
}
