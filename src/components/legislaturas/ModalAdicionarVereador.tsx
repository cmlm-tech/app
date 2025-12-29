import { useState, useEffect, useMemo } from 'react';
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
  FormDescription,
} from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentePublicoRow } from './types';
import { Database } from '@/lib/database.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VereadorComCondicao } from './types';

type LegislaturaVereadorInsert = Database['public']['Tables']['legislaturavereadores']['Insert'];
type CondicaoVereador = Database['public']['Enums']['condicao_vereador'];

interface ModalAdicionarVereadorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  legislaturaId: number;
  vereadoresAtuais: VereadorComCondicao[];
  onSuccess: () => void;
}

const formSchema = z.object({
  agente_publico_id: z.number({
    required_error: 'Selecione um vereador.',
  }),
  condicao: z.enum(['Titular', 'Suplente'], {
    required_error: 'Selecione a condição.',
  }),
  partido: z.enum(['MDB', 'PDT', 'PSD'], {
    required_error: 'Selecione o partido.',
  }),
  marcar_como_lider: z.boolean().default(false),
  tipo_lideranca: z.enum(['governo', 'oposicao']).optional(),
}).refine((data) => {
  if (data.marcar_como_lider && !data.tipo_lideranca) {
    return false;
  }
  return true;
}, {
  message: 'Selecione o tipo de liderança',
  path: ['tipo_lideranca'],
});

export function ModalAdicionarVereador({
  open,
  onOpenChange,
  legislaturaId,
  vereadoresAtuais,
  onSuccess,
}: ModalAdicionarVereadorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vereadoresElegiveis, setVereadoresElegiveis] = useState<AgentePublicoRow[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    message: string;
    pendingValues: z.infer<typeof formSchema>;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      condicao: 'Titular',
      partido: undefined,
      marcar_como_lider: false,
      tipo_lideranca: undefined,
    },
  });

  const marcarComoLider = form.watch('marcar_como_lider');

  useEffect(() => {
    if (open) {
      const fetchVereadores = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('agentespublicos')
            .select('*')
            .eq('tipo', 'Vereador');

          if (error) throw error;

          const idsAtuais = new Set(vereadoresAtuais.map(v => v.agente_publico_id));
          const elegiveis = data.filter(v => !idsAtuais.has(v.id));

          setVereadoresElegiveis(elegiveis);
        } catch (error: any) {
          toast({
            title: 'Erro ao buscar vereadores',
            description: error.message,
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      };
      fetchVereadores();

      form.reset({
        condicao: 'Titular',
        partido: undefined,
        marcar_como_lider: false,
        tipo_lideranca: undefined,
      });
    }
  }, [open, vereadoresAtuais, toast, form]);

  const confirmSave = async (values: z.infer<typeof formSchema>) => {
    setSaving(true);
    try {
      const insertData: LegislaturaVereadorInsert = {
        legislatura_id: legislaturaId,
        agente_publico_id: values.agente_publico_id,
        condicao: values.condicao as CondicaoVereador,
        partido: values.partido,
      };

      const { error: vereadorError } = await supabase
        .from('legislaturavereadores')
        .insert(insertData);

      if (vereadorError) throw vereadorError;

      if (values.marcar_como_lider && values.tipo_lideranca) {
        await supabase
          .from('liderancaslegislativas' as any)
          .update({ data_fim: new Date().toISOString() })
          .eq('legislatura_id', legislaturaId)
          .eq('tipo', values.tipo_lideranca)
          .is('data_fim', null);

        const { error: liderancaError } = await supabase
          .from('liderancaslegislativas' as any)
          .insert({
            legislatura_id: legislaturaId,
            agente_publico_id: values.agente_publico_id,
            tipo: values.tipo_lideranca,
            data_inicio: new Date().toISOString(),
          });

        if (liderancaError) throw liderancaError;
      }

      toast({ title: 'Sucesso!', description: 'Vereador adicionado.' });
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
    if (values.marcar_como_lider && values.tipo_lideranca) {
      const { data: existingLeaderResult } = await supabase
        .from('liderancaslegislativas' as any)
        .select('agente_publico_id, agentespublicos(nome_completo)')
        .eq('legislatura_id', legislaturaId)
        .eq('tipo', values.tipo_lideranca)
        .is('data_fim', null)
        .single();

      const existingLeader = existingLeaderResult as any;

      if (existingLeader) {
        const currentLeaderName = existingLeader.agentespublicos?.nome_completo || 'Outro vereador';
        const tipoLabel = values.tipo_lideranca === 'governo' ? 'Governo' : 'Oposição';

        setConfirmationData({
          message: `${currentLeaderName} já é o líder do ${tipoLabel}. Deseja substituí-lo?`,
          pendingValues: values
        });
        setConfirmationOpen(true);
        return;
      }
    }
    await confirmSave(values);
  };

  const selectedVereador = useMemo(() => {
    const id = form.watch('agente_publico_id');
    return vereadoresElegiveis.find(v => v.id === id);
  }, [form, vereadoresElegiveis]);

  const partidos = ['MDB', 'PDT', 'PSD'] as const;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Vereador ao Corpo Legislativo</DialogTitle>
            <DialogDescription>
              Selecione um vereador, sua condição (Titular ou Suplente) e o partido para adicioná-lo a esta legislatura.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="agente_publico_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Vereador</FormLabel>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'w-full justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {selectedVereador?.nome_completo ?? 'Selecione um vereador'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar vereador..." />
                          <CommandList>
                            {loading && <div className="p-4 text-center">Carregando...</div>}
                            <CommandEmpty>Nenhum vereador encontrado.</CommandEmpty>
                            <CommandGroup>
                              {vereadoresElegiveis.map(vereador => (
                                <CommandItem
                                  value={vereador.nome_completo}
                                  key={vereador.id}
                                  onSelect={() => {
                                    form.setValue('agente_publico_id', vereador.id);
                                    setPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      vereador.id === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {vereador.nome_completo}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condicao"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Condição</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Titular" />
                          </FormControl>
                          <FormLabel className="font-normal">Titular</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Suplente" />
                          </FormControl>
                          <FormLabel className="font-normal">Suplente</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="partido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partido</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o partido" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {partidos.map(partido => (
                          <SelectItem key={partido} value={partido}>
                            {partido}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marcar_como_lider"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Marcar como líder
                      </FormLabel>
                      <FormDescription>
                        Selecione se este vereador será líder do Governo ou da Oposição
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              {marcarComoLider && (
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
                          className="flex flex-row space-x-4"
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
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
              if (confirmationData?.pendingValues) {
                confirmSave(confirmationData.pendingValues);
              }
            }}>Confirmar substituição</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}