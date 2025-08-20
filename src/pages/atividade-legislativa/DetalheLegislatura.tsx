import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PeriodoCard } from "@/components/legislaturas/PeriodoCard";
import { ModalGerenciarPeriodo } from "@/components/legislaturas/ModalGerenciarPeriodo";
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Database } from "@/lib/database.types";
import { useAuth } from '@/contexts/AuthContext';
import { CorpoLegislativo } from "@/components/legislaturas/CorpoLegislativo";
import { ModalAdicionarVereador } from "@/components/legislaturas/ModalAdicionarVereador";
import { ModalConfirmarRemocaoVereador } from '@/components/legislaturas/ModalConfirmarRemocaoVereador';
import { ComposicaoAtual } from "@/components/legislaturas/ComposicaoAtual";
import { VereadorComCondicao, LegislaturaComPeriodos, PeriodoRow, AgentePublicoRow } from "@/components/legislaturas/types";

export default function DetalheLegislatura() {
    const { legislaturaNumero } = useParams<{ legislaturaNumero: string }>();
    const { toast } = useToast();
    const { user } = useAuth();

    const [legislatura, setLegislatura] = useState<LegislaturaComPeriodos | null>(null);
    const [vereadores, setVereadores] = useState<VereadorComCondicao[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalPeriodoOpen, setModalPeriodoOpen] = useState(false);
    const [modalVereadorOpen, setModalVereadorOpen] = useState(false);
    const [modalRemocaoOpen, setModalRemocaoOpen] = useState(false);
    const [vereadorSelecionado, setVereadorSelecionado] = useState<VereadorComCondicao | null>(null);
    const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoRow | null>(null);
    const [permissaoLogado, setPermissaoLogado] = useState<string | null>(null);

    const isAdmin = permissaoLogado?.toLowerCase() === 'admin';

    const fetchData = useCallback(async (numero: number) => {
        try {
            const { data: legData, error: legError } = await supabase.from('legislaturas').select('*').eq('numero', numero).single();
            if (legError) throw new Error(`Legislatura de ${numero} não encontrada.`);

            const legislaturaId = legData.id;
            
            const [periodosResult, verResult] = await Promise.all([
                supabase.from('periodossessao').select('*').eq('legislatura_id', legislaturaId),
                supabase.from('legislaturavereadores').select('id, condicao, data_posse, data_afastamento, agentespublicos:agente_publico_id (*, vereadores:vereadores!inner(nome_parlamentar))').eq('legislatura_id', legislaturaId).order('nome_completo', { referencedTable: 'agentespublicos', ascending: true })
            ]);

            if (periodosResult.error) throw periodosResult.error;
            if (verResult.error) throw verResult.error;

            const dadosVereadores = verResult.data.map(item => ({
              ...(item.agentespublicos as AgentePublicoRow),
              id: item.id,
              condicao: item.condicao,
              data_posse: item.data_posse,
              data_afastamento: item.data_afastamento,
              nome_parlamentar: item.agentespublicos?.vereadores?.nome_parlamentar || null,
              vereadores: item.agentespublicos as AgentePublicoRow
            }));
            
            setLegislatura({ ...legData, periodos: periodosResult.data || [] });
            
            
            // Garante a ordenação no front-end após receber os dados.
            const vereadoresOrdenados = dadosVereadores.sort((a, b) => {
                const nomeA = a.nome_parlamentar || a.nome_completo;
                const nomeB = b.nome_parlamentar || b.nome_completo;
                return nomeA.localeCompare(nomeB);
            });
            setVereadores(vereadoresOrdenados);            

        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
            setLegislatura(null);
        }
    }, [toast]);

    useEffect(() => {
        const carregarDados = async () => {
            setLoading(true);

            if (user) {
                const { data: perfil } = await supabase
                    .from('usuarios')
                    .select('permissao')
                    .eq('id', user.id)
                    .single();
                setPermissaoLogado(perfil?.permissao || null);
            } else {
                setPermissaoLogado(null);
            }

            const numeroAsNumber = legislaturaNumero ? parseInt(legislaturaNumero, 10) : null;
            if (numeroAsNumber && !isNaN(numeroAsNumber)) {
                await fetchData(numeroAsNumber);
            }
            setLoading(false);
        };

        carregarDados();
    }, [legislaturaNumero, fetchData, user]);
    
    const handleGerenciarClick = (periodo: PeriodoRow) => {
        setPeriodoSelecionado(periodo);
        setModalPeriodoOpen(true);
    };

    const handleSavePeriodo = async (data: { presidenteId: string }) => {
        if (!periodoSelecionado || !legislatura) return;
        try {
            toast({ 
                title: "Funcionalidade não disponível", 
                description: "A atribuição de presidente ao período requer atualização do banco de dados.",
                variant: "destructive" 
            });
        } catch(error: any) {
             toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
        setModalPeriodoOpen(false);
    };
    
    const handleOpenModalRemocao = (vereador: AgentePublicoRow) => {
        setVereadorSelecionado(vereador as VereadorComCondicao);
        setModalRemocaoOpen(true);
    };

    const handleConfirmarRemocao = async () => {
        if (!vereadorSelecionado || !legislatura) return;

        try {
            const { error } = await supabase
                .from('legislaturavereadores')
                .delete()
                .match({ legislatura_id: legislatura.id, agente_publico_id: vereadorSelecionado.id });

            if (error) throw error;

            setVereadores(prev => prev.filter(v => v.id !== vereadorSelecionado.id));
            toast({ title: "Sucesso", description: `Vínculo de ${vereadorSelecionado.nome_completo} removido com sucesso.` });
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }

        setModalRemocaoOpen(false);
        setVereadorSelecionado(null);
    };

    if (loading) return <AppLayout><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;
    if (!legislatura) return <AppLayout><div className="text-center py-10"><h1>Legislatura não encontrada</h1></div></AppLayout>;
    
    const anoInicio = new Date(legislatura.data_inicio).getFullYear();
    const anoFim = new Date(legislatura.data_fim).getFullYear();

    const now = new Date();

    const emExercicio = vereadores.filter(v => {
        const dataAfastamento = v.data_afastamento ? new Date(v.data_afastamento) : null;
        const dataPosse = v.data_posse ? new Date(v.data_posse) : null;

        if (v.condicao === 'Titular' && (!dataAfastamento || dataAfastamento > now)) {
            return true;
        }
        if (v.condicao === 'Suplente' && dataPosse && dataPosse <= now && (!dataAfastamento || dataAfastamento > now)) {
            return true;
        }
        return false;
    });

    const licenciados = vereadores.filter(v => {
        const dataAfastamento = v.data_afastamento ? new Date(v.data_afastamento) : null;
        return v.condicao === 'Titular' && dataAfastamento && dataAfastamento <= now;
    });

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
                <p className="text-gray-600">
                    {isAdmin
                        ? "Gerencie os períodos anuais e suas respectivas composições."
                        : "Consulte os detalhes de cada período legislativo anual."
                    }
                </p>
            </div>

            <CorpoLegislativo 
                vereadores={vereadores} 
                isAdmin={isAdmin}
                onAdicionarClick={() => setModalVereadorOpen(true)}
                onRemove={handleOpenModalRemocao}
            />

            <ComposicaoAtual emExercicio={emExercicio} licenciados={licenciados} />

            <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-semibold justify-start gap-2">Período Legislativo por Ano</AccordionTrigger>
                    <AccordionContent>
                        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-8">
                            {legislatura.periodos.map(periodo => {
                                const presidente = undefined;
                                return (
                                    <PeriodoCard 
                                        key={periodo.id} 
                                        periodo={periodo} 
                                        presidente={presidente}
                                        onGerenciar={isAdmin ? () => handleGerenciarClick(periodo) : undefined}
                                        legislaturaNumero={legislatura.numero}
                                    />
                                );
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {isAdmin && (
                <>
                    <ModalGerenciarPeriodo 
                        open={modalPeriodoOpen}
                        onOpenChange={setModalPeriodoOpen}
                        periodo={periodoSelecionado}
                        vereadores={vereadores}
                        onSave={handleSavePeriodo}
                    />
                    <ModalAdicionarVereador
                        open={modalVereadorOpen}
                        onOpenChange={setModalVereadorOpen}
                        legislaturaId={legislatura.id}
                        vereadoresAtuais={vereadores}
                        onSuccess={() => fetchData(parseInt(legislaturaNumero!, 10))}
                    />
                    <ModalConfirmarRemocaoVereador
                        isOpen={modalRemocaoOpen}
                        onOpenChange={setModalRemocaoOpen}
                        onConfirm={handleConfirmarRemocao}
                        vereadorNome={vereadorSelecionado?.nome_completo || ''}
                    />
                </>
            )}
        </AppLayout>
    );
}