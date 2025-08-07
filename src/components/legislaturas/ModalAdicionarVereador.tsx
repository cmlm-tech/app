
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
} from '@/components/ui/select'; // Importar Select components

type LegislaturaVereadorInsert = Database['public']['Tables']['legislaturavereadores']['Insert'];
type CondicaoVereador = Database['public']['Enums']['condicao_vereador'];
type PartidoPolitico = Database['public']['Enums']['partidos_politicos']; // Novo tipo para Partido

interface ModalAdicionarVereadorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  legislaturaId: number;
  vereadoresAtuais: AgentePublicoRow[];
  onSave: (novoVereador: AgentePublicoRow) => void;
}

const formSchema = z.object({
  agente_publico_id: z.number({
    required_error: 'Selecione um vereador.',
  }),
  condicao: z.enum(['Titular', 'Suplente'], {
    required_error: 'Selecione a condição.',
  }),
  partido: z.enum(['MDB', 'PDT', 'PSD'], { // Adicionar validação para o partido
    required_error: 'Selecione o partido.',
  }),
});

export function ModalAdicionarVereador({
  open,
  onOpenChange,
  legislaturaId,
  vereadoresAtuais,
  onSave,
}: ModalAdicionarVereadorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vereadoresElegiveis, setVereadoresElegiveis] = useState<AgentePublicoRow[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      condicao: 'Titular',
      partido: undefined, // Definir valor padrão para partido
    },
  });

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

          const idsAtuais = new Set(vereadoresAtuais.map(v => v.id));
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
      form.reset({ condicao: 'Titular', partido: undefined }); // Resetar partido também
    }
  }, [open, vereadoresAtuais, toast, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSaving(true);
    try {
      const insertData: LegislaturaVereadorInsert = {
        legislatura_id: legislaturaId,
        agente_publico_id: values.agente_publico_id,
        condicao: values.condicao as CondicaoVereador,
        partido: values.partido as PartidoPolitico, // Incluir partido
      };

      const { error } = await supabase.from('legislaturavereadores').insert(insertData);

      if (error) throw error;

      const vereadorAdicionado = vereadoresElegiveis.find(v => v.id === values.agente_publico_id);
      if (vereadorAdicionado) {
        onSave(vereadorAdicionado);
      }

      toast({
        title: 'Sucesso!',
        description: 'Vereador adicionado à legislatura.',
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedVereador = useMemo(() => {
    const id = form.watch('agente_publico_id');
    return vereadoresElegiveis.find(v => v.id === id);
  }, [form, vereadoresElegiveis]);

  const partidos: PartidoPolitico[] = ['MDB', 'PDT', 'PSD']; // Lista de partidos

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Vereador ao Corpo Legislativo</DialogTitle>
          <DialogDescription>
            Selecione um vereador, sua condição (Titular ou Suplente) e o partido para adicioná-lo a esta legislatura.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
  );
}
