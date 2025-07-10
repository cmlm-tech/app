import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { PeriodoCard } from "@/components/legislaturas/PeriodoCard";
import { ModalGerenciarPeriodo } from "@/components/legislaturas/ModalGerenciarPeriodo";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
// Importando os novos tipos seguros
import { LegislaturaComPeriodos, PeriodoRow, AgentePublicoRow } from "@/components/legislaturas/types";

export default function DetalheLegislatura() {
    const { legislaturaNumero } = useParams<{ legislaturaNumero: string }>();
    const { toast } = useToast();

    const [legislatura, setLegislatura] = useState<LegislaturaComPeriodos | null>(null);
    const [vereadores, setVereadores] = useState<AgentePublicoRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoRow | null>(null);

    const fetchData = useCallback(async (numero: number) => {
        setLoading(true);
        try {
            const { data: legData, error: legError } = await supabase.from('legislaturas').select('*').eq('numero', numero).single();
            if (legError) throw new Error(`Legislatura não encontrada: ${legError.message}`);

            const legislaturaId = legData.id;
            const [periodosResult, verResult] = await Promise.all([
                supabase.from('periodossessao').select('*').eq('legislatura_id', legislaturaId),
                supabase.from('legislatura_vereadores').select('agente_publico_id').eq('legislatura_id', legislaturaId)
            ]);

            if (periodosResult.error) throw periodosResult.error;
            if (verResult.error) throw verResult.error;

            const vereadorIds = verResult.data.map(v => v.agente_publico_id);
            let vereadoresData: AgentePublicoRow[] = [];
            if (vereadorIds.length > 0) {
              const { data, error } = await supabase.from('agentespublicos').select('*').in('id', vereadorIds);
              if (error) throw error;
              vereadoresData = data || [];
            }
            
            setLegislatura({ ...legData, periodos: periodosResult.data || [] });
            setVereadores(vereadoresData);
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
            setLegislatura(null);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        const numeroAsNumber = legislaturaNumero ? parseInt(legislaturaNumero, 10) : null;
        if (numeroAsNumber && !isNaN(numeroAsNumber)) {
            fetchData(numeroAsNumber);
        } else {
            setLoading(false);
        }
    }, [legislaturaNumero, fetchData]);
    
    const handleGerenciarClick = (periodo: PeriodoRow) => {
        setPeriodoSelecionado(periodo);
        setModalOpen(true);
    };

    const handleSavePeriodo = async (data: { presidenteId: string }) => {
        if (!periodoSelecionado || !legislatura) return;
        try {
            // Nota: Esta parte só funcionará se você adicionar uma coluna 'presidente_id' na tabela 'periodossessao'
            const { error } = await supabase
                .from('periodossessao')
                .update({ presidente_id: parseInt(data.presidenteId) })
                .eq('id', periodoSelecionado.id);
            if (error) throw error;
            
            toast({ title: "Sucesso", description: `Presidente atualizado com sucesso.` });
            fetchData(legislatura.numero);
        } catch(error: any) {
             toast({ title: "Erro", description: `Não foi possível atualizar o presidente. Verifique se a coluna 'presidente_id' existe na tabela 'periodossessao'. Erro: ${error.message}`, variant: "destructive" });
        }
        setModalOpen(false);
    };

    if (loading) return <AppLayout><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;
    if (!legislatura) return <AppLayout><div className="text-center py-10"><h1>Legislatura não encontrada</h1></div></AppLayout>;
    
    const anoInicio = new Date(legislatura.data_inicio).getFullYear();
    const anoFim = new Date(legislatura.data_fim).getFullYear();

    return (
        <AppLayout>
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem><Link to="/atividade-legislativa/legislaturas">Legislaturas</Link></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>Legislatura {anoInicio} - {anoFim}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Legislatura {anoInicio} - {anoFim}</h1>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {legislatura.periodos.map(periodo => {
                    // O código vai procurar por 'presidente_id', mas como não existe na tabela, 'presidente' será undefined.
                    // Isso é o comportamento esperado até que a coluna seja adicionada no banco de dados.
                    const presidente = vereadores.find(v => v.id === (periodo as any).presidente_id);
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
                vereadores={vereadores}
                onSave={handleSavePeriodo}
            />
        </AppLayout>
    );
}