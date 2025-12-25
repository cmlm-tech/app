
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PainelComissoesProps {
    docId: number;
    ano: number; // Para criar o documento de parecer com mesmo ano
    disabled?: boolean;
}

interface Comissao {
    id: number;
    nome: string;
}

interface ParecerExistente {
    id: number;
    comissao_id: number;
    documento_id: number; // ID do documento "Parecer"
}

export function PainelComissoes({ docId, ano, disabled = false }: PainelComissoesProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [comissoes, setComissoes] = useState<Comissao[]>([]);
    const [participantes, setParticipantes] = useState<Set<number>>(new Set());
    const [pareceresMap, setPareceresMap] = useState<Map<number, ParecerExistente>>(new Map());

    const [exigeParecer, setExigeParecer] = useState<boolean>(true); // Default true para não piscar
    const [tipoDocNome, setTipoDocNome] = useState<string>("");

    useEffect(() => {
        carregarDados();
    }, [docId]);

    async function carregarDados() {
        try {
            setLoading(true);

            // 0. Verificar Tipo do Documento e Configuração
            const { data: docData } = await supabase
                .from("documentos")
                .select(`
                    tipo:tiposdedocumento (
                        nome,
                        exige_parecer
                    )
                `)
                .eq("id", docId)
                .single();

            if (docData?.tipo) {
                // @ts-ignore
                const configExige = docData.tipo.exige_parecer;
                // @ts-ignore
                setTipoDocNome(docData.tipo.nome);

                // Se for explicitamente false, setar false. Se null/undefined, assumir true (backwards compat)
                setExigeParecer(configExige !== false);
            }

            // 1. Carregar Comissões Permanentes
            // @ts-ignore - Tipos complexos do Supabase causam erro de profundidade
            const { data: comissoesData } = await supabase
                .from("comissoes")
                .select("id, nome")
                .eq("tipo", "Permanente")
                .order("nome");

            if (comissoesData) {
                setComissoes(comissoesData);
            }

            // 2. Carregar Pareceres já vinculados a esta matéria
            const { data: pareceresData } = await supabase
                .from("pareceres")
                .select("id, comissao_id, documento_id")
                .eq("materia_documento_id", docId);

            const novosParticipantes = new Set<number>();
            const mapa = new Map<number, ParecerExistente>();

            if (pareceresData) {
                pareceresData.forEach(p => {
                    if (p.comissao_id) {
                        novosParticipantes.add(p.comissao_id);
                        mapa.set(p.comissao_id, p);
                    }
                });
            }

            setParticipantes(novosParticipantes);
            setPareceresMap(mapa);

        } catch (error) {
            console.error("Erro ao carregar comissões:", error);
            toast({ title: "Erro", description: "Falha ao carregar comissões.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    const toggleComissao = (comissaoId: number) => {
        const novoSet = new Set(participantes);
        if (novoSet.has(comissaoId)) {
            novoSet.delete(comissaoId);
        } else {
            novoSet.add(comissaoId);
        }
        setParticipantes(novoSet);
    };

    async function handleSalvarComissoes() {
        setSaving(true);
        try {
            // 1. Identificar adições e remoções
            const aAdicionar: number[] = [];
            const aRemover: number[] = [];

            // Adições: Está no set mas não no mapa original
            participantes.forEach(id => {
                if (!pareceresMap.has(id)) aAdicionar.push(id);
            });

            // Remoções: Está no mapa mas não no set atual
            pareceresMap.forEach((v, k) => {
                if (!participantes.has(k)) aRemover.push(k);
            });

            if (aAdicionar.length === 0 && aRemover.length === 0) {
                toast({ title: "Sem alterações", description: "Nenhuma mudança nas comissões." });
                setSaving(false);
                return;
            }

            // 2. Buscar ID do tipo "Parecer"
            const { data: tipoParecer } = await supabase
                .from("tiposdedocumento")
                .select("id")
                .eq("nome", "Parecer")
                .single();

            if (!tipoParecer) throw new Error("Tipo de documento 'Parecer' não encontrado no sistema.");

            // 3. Buscar usuário logado
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            // 4. Processar Adições (Criar Documento + Parecer)
            for (const comissaoId of aAdicionar) {
                // A. Criar Documento (Parecer é um documento)
                const { data: novoDoc, error: docErr } = await supabase
                    .from("documentos")
                    .insert({
                        ano: ano,
                        tipo_documento_id: tipoParecer.id,
                        status: "Rascunho",
                        criado_por_usuario_id: user.id,
                        data_protocolo: new Date().toISOString()
                    } as any)
                    .select("id")
                    .single();

                if (docErr) throw docErr;

                // B. Criar Parecer vinculado
                const { error: parErr } = await supabase
                    .from("pareceres")
                    .insert({
                        documento_id: novoDoc.id,
                        materia_documento_id: docId,
                        comissao_id: comissaoId,
                        status: "Pendente"
                    } as any);

                if (parErr) throw parErr;
            }

            // 4. Processar Remoções (Deletar Parecer e Documento)
            // Nota: Idealmente verificar se já tem texto antes de deletar, mas para simplificar agora deletamos.
            for (const comissaoId of aRemover) {
                const parecer = pareceresMap.get(comissaoId);
                if (parecer) {
                    // Delete from pareceres first (FK dependency)
                    await supabase.from("pareceres").delete().eq("id", parecer.id);
                    // Then delete document
                    await supabase.from("documentos").delete().eq("id", parecer.documento_id);
                }
            }

            toast({ title: "Atualizado!", description: "Comissões vinculadas com sucesso.", className: "bg-green-600 text-white" });

            // Recarregar para atualizar mapa
            await carregarDados();

        } catch (error: any) {
            console.error(error);
            toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-4"><Loader2 className="w-4 h-4 animate-spin" /></div>;

    if (!exigeParecer) {
        return (
            <Card className="border-slate-200 shadow-sm bg-gray-50 border-dashed">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-500">
                        Comissões (Pareceres)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-gray-500">
                        O tipo de documento <strong>"{tipoDocNome}"</strong> está configurado para não exigir pareceres.
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2">
                        Configure regras de fluxo no menu Configurações.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">
                    Comissões (Pareceres)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {comissoes.map((comissao) => {
                        const isChecked = participantes.has(comissao.id);
                        return (
                            <div key={comissao.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`comissao-${comissao.id}`}
                                    checked={isChecked}
                                    onCheckedChange={() => toggleComissao(comissao.id)}
                                    disabled={disabled || saving}
                                />
                                <Label
                                    htmlFor={`comissao-${comissao.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {comissao.nome}
                                </Label>
                            </div>
                        );
                    })}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={handleSalvarComissoes}
                    disabled={disabled || saving}
                >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />}
                    Atualizar Comissões
                </Button>
            </CardContent>
        </Card>
    );
}
