import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VereadorComCondicao } from './types';

interface ModalEditarLiderancaProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    legislaturaId: number;
    vereador: VereadorComCondicao;
    liderancaAtual: 'governo' | 'oposicao' | null;
    onSuccess: () => void;
}

const formSchema = z.object({
    tipo_lideranca: z.enum(['governo', 'oposicao', 'nenhuma']),
});

export function ModalEditarLideranca({
    open,
    onOpenChange,
    legislaturaId,
    vereador,
    liderancaAtual,
    onSuccess,
}: ModalEditarLiderancaProps) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationData, setConfirmationData] = useState<{
        message: string;
        pendingValue: 'governo' | 'oposicao';
    } | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo_lideranca: liderancaAtual || 'nenhuma',
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                tipo_lideranca: liderancaAtual || 'nenhuma',
            });
        }
    }, [open, liderancaAtual, form]);

    const confirmSave = async (tipoLideranca: 'governo' | 'oposicao' | 'nenhuma') => {
        setSaving(true);
        try {
            const wasLider = !!liderancaAtual;
            const isLiderNow = tipoLideranca !== 'nenhuma';
            const skipUpdate = isLiderNow && wasLider && tipoLideranca === liderancaAtual;

            if (!skipUpdate) {
                if (isLiderNow) {
                    // Close current leadership if exists
                    if (wasLider) {
                        await supabase.from('liderancaslegislativas' as any)
                            .update({ data_fim: new Date().toISOString() })
                            .eq('legislatura_id', legislaturaId)
                            .eq('agente_publico_id', vereador.agente_publico_id)
                            .is('data_fim', null);
                    }

                    // Close any existing leader of the same type
                    await supabase.from('liderancaslegislativas' as any)
                        .update({ data_fim: new Date().toISOString() })
                        .eq('legislatura_id', legislaturaId)
                        .eq('tipo', tipoLideranca)
                        .is('data_fim', null);

                    // Insert new leadership
                    await supabase.from('liderancaslegislativas' as any).insert({
                        legislatura_id: legislaturaId,
                        agente_publico_id: vereador.agente_publico_id,
                        tipo: tipoLideranca,
                        data_inicio: new Date().toISOString(),
                    });
                } else if (wasLider && !isLiderNow) {
                    // Remove leadership
                    await supabase.from('liderancaslegislativas' as any)
                        .update({ data_fim: new Date().toISOString() })
                        .eq('legislatura_id', legislaturaId)
                        .eq('agente_publico_id', vereador.agente_publico_id)
                        .is('data_fim', null);
                }
            }

            toast({ title: 'Sucesso!', description: 'Liderança atualizada.' });
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: 'Erro ao salvar',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
            setConfirmationOpen(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const tipoLideranca = values.tipo_lideranca;

        if (tipoLideranca !== 'nenhuma') {
            const { data: existingLeaderResult } = await supabase
                .from('liderancaslegislativas' as any)
                .select('agente_publico_id, agentespublicos(nome_completo)')
                .eq('legislatura_id', legislaturaId)
                .eq('tipo', tipoLideranca)
                .is('data_fim', null)
                .single();

            const existingLeader = existingLeaderResult as any;

            if (existingLeader && existingLeader.agente_publico_id !== vereador.agente_publico_id) {
                const currentLeaderName = existingLeader.agentespublicos?.nome_completo || 'Outro vereador';
                const tipoLabel = tipoLideranca === 'governo' ? 'Governo' : 'Oposição';

                setConfirmationData({
                    message: `${currentLeaderName} já é o líder do ${tipoLabel}. Deseja substituí-lo?`,
                    pendingValue: tipoLideranca,
                });
                setConfirmationOpen(true);
                return;
            }
        }

        await confirmSave(tipoLideranca);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Liderança</DialogTitle>
                        <DialogDescription>
                            Defina a liderança deste vereador.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="mb-4">
                                <span className="text-sm font-medium text-muted-foreground block mb-1">Vereador</span>
                                <div className="text-lg font-bold border rounded-md p-3 bg-muted/50">
                                    {vereador.nome_parlamentar || vereador.nome_completo}
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="tipo_lideranca"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Tipo de Liderança</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-col space-y-2"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="governo" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Governo</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="oposicao" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Oposição</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="nenhuma" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-muted-foreground">Remover liderança</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmação de Liderança</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmationData?.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirmationOpen(false)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            if (confirmationData?.pendingValue) {
                                confirmSave(confirmationData.pendingValue);
                            }
                        }}>Confirmar substituição</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
