import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { upsertVereador } from "@/services/vereadoresService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type AgentePublico = {
  id: number;
  nome_completo: string;
  foto_url: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export default function ModalNovoVereador({ open, onOpenChange }: Props) {
  const { toast } = useToast();

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Vereadores disponíveis
  const [vereadores, setVereadores] = useState<AgentePublico[]>([]);
  const [vereadorSelecionado, setVereadorSelecionado] = useState<number | null>(null);

  // Dados complementares
  const [nomeParlamentar, setNomeParlamentar] = useState("");
  const [perfil, setPerfil] = useState("");
  const [biografiaCompleta, setBiografiaCompleta] = useState("");
  const [emailGabinete, setEmailGabinete] = useState("");
  const [telefoneGabinete, setTelefoneGabinete] = useState("");
  const [sitePessoal, setSitePessoal] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [formacaoAcademica, setFormacaoAcademica] = useState("");
  const [profissaoAnterior, setProfissaoAnterior] = useState("");
  const [areasAtuacao, setAreasAtuacao] = useState("");

  // Buscar vereadores ao abrir modal
  useEffect(() => {
    if (open) {
      carregarVereadores();
    }
  }, [open]);

  // Carregar dados do vereador quando selecionado
  useEffect(() => {
    if (vereadorSelecionado && open) {
      carregarDadosVereador(vereadorSelecionado);
    } else {
      limparFormulario();
    }
  }, [vereadorSelecionado, open]);

  async function carregarVereadores() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agentespublicos')
        .select('id, nome_completo, foto_url')
        .eq('tipo', 'Vereador')
        .order('nome_completo');

      if (error) throw error;
      setVereadores(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar vereadores:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar lista de vereadores.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function carregarDadosVereador(agentePublicoId: number) {
    try {
      const { data, error } = await supabase
        .from('vereadores')
        .select('*')
        .eq('agente_publico_id', agentePublicoId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Type assertion para novos campos (até regenerar tipos)
        const vereador = data;

        // Preencher formulário com dados existentes
        setNomeParlamentar(vereador.nome_parlamentar || '');
        setPerfil(vereador.perfil || '');
        setBiografiaCompleta(vereador.biografia_completa || '');
        setEmailGabinete(vereador.email_gabinete || '');
        setTelefoneGabinete(vereador.telefone_gabinete || '');
        setSitePessoal(vereador.site_pessoal || '');
        setInstagram(vereador.instagram || '');
        setFacebook(vereador.facebook || '');
        setTwitter(vereador.twitter || '');
        setFormacaoAcademica(vereador.formacao_academica || '');
        setProfissaoAnterior(vereador.profissao_anterior || '');
        setAreasAtuacao(vereador.areas_atuacao?.join(', ') || '');
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados do vereador:', error);
    }
  }

  function limparFormulario() {
    setNomeParlamentar('');
    setPerfil('');
    setBiografiaCompleta('');
    setEmailGabinete('');
    setTelefoneGabinete('');
    setSitePessoal('');
    setInstagram('');
    setFacebook('');
    setTwitter('');
    setFormacaoAcademica('');
    setProfissaoAnterior('');
    setAreasAtuacao('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!vereadorSelecionado) {
      toast({
        title: 'Atenção',
        description: 'Selecione um vereador.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Processar áreas de atuação (string separada por vírgulas -> array)
      const areasArray = areasAtuacao
        ? areasAtuacao.split(',').map(a => a.trim()).filter(a => a.length > 0)
        : null;

      // Type assertion temporária até regenerar tipos corretamente
      await upsertVereador({
        agente_publico_id: vereadorSelecionado,
        nome_parlamentar: nomeParlamentar || null,
        perfil: perfil || null,
        biografia_completa: biografiaCompleta || null,
        email_gabinete: emailGabinete || null,
        telefone_gabinete: telefoneGabinete || null,
        site_pessoal: sitePessoal || null,
        instagram: instagram || null,
        facebook: facebook || null,
        twitter: twitter || null,
        formacao_academica: formacaoAcademica || null,
        profissao_anterior: profissaoAnterior || null,
        areas_atuacao: areasArray,
      });

      toast({
        title: 'Sucesso!',
        description: 'Dados complementares salvos com sucesso.',
      });

      onOpenChange(false);
      setVereadorSelecionado(null);
      limparFormulario();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar dados complementares. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  const vereadorAtual = vereadores.find(v => v.id === vereadorSelecionado);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Dados Complementares de Vereador</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de Vereador */}
          <div>
            <Label>Vereador *</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between',
                    !vereadorSelecionado && 'text-muted-foreground'
                  )}
                  disabled={loading}
                >
                  {vereadorAtual?.nome_completo ?? 'Selecione um vereador'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar vereador..." />
                  <CommandList>
                    {loading && <div className="p-4 text-center">Carregando...</div>}
                    <CommandEmpty>Nenhum vereador encontrado.</CommandEmpty>
                    <CommandGroup>
                      {vereadores.map(vereador => (
                        <CommandItem
                          key={vereador.id}
                          value={vereador.nome_completo}
                          onSelect={() => {
                            setVereadorSelecionado(vereador.id);
                            setPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              vereador.id === vereadorSelecionado
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Nome Parlamentar */}
            <div className="col-span-2">
              <Label htmlFor="nome_parlamentar">Nome Parlamentar</Label>
              <Input
                id="nome_parlamentar"
                placeholder="Nome usado no mandato"
                value={nomeParlamentar}
                onChange={e => setNomeParlamentar(e.target.value)}
              />
            </div>

            {/* Perfil (Resumo) */}
            <div className="col-span-2">
              <Label htmlFor="perfil">Perfil (Resumo)</Label>
              <Textarea
                id="perfil"
                placeholder="Breve descrição (1-2 linhas)"
                value={perfil}
                onChange={e => setPerfil(e.target.value)}
                rows={2}
              />
            </div>

            {/* Biografia Completa */}
            <div className="col-span-2">
              <Label htmlFor="biografia">Biografia Completa</Label>
              <Textarea
                id="biografia"
                placeholder="Biografia detalhada"
                value={biografiaCompleta}
                onChange={e => setBiografiaCompleta(e.target.value)}
                rows={4}
              />
            </div>

            {/* Contatos */}
            <div>
              <Label htmlFor="email">Email do Gabinete</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@camara.gov.br"
                value={emailGabinete}
                onChange={e => setEmailGabinete(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone do Gabinete</Label>
              <Input
                id="telefone"
                placeholder="(XX) XXXXX-XXXX"
                value={telefoneGabinete}
                onChange={e => setTelefoneGabinete(e.target.value)}
              />
            </div>

            {/* Redes Sociais */}
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="@username (sem @)"
                value={instagram}
                onChange={e => setInstagram(e.target.value.replace('@', ''))}
              />
            </div>

            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                placeholder="URL do perfil"
                value={facebook}
                onChange={e => setFacebook(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                placeholder="@username (sem @)"
                value={twitter}
                onChange={e => setTwitter(e.target.value.replace('@', ''))}
              />
            </div>

            <div>
              <Label htmlFor="site">Site Pessoal</Label>
              <Input
                id="site"
                placeholder="https://exemplo.com"
                value={sitePessoal}
                onChange={e => setSitePessoal(e.target.value)}
              />
            </div>

            {/* Formação e Profissão */}
            <div className="col-span-2">
              <Label htmlFor="formacao">Formação Acadêmica</Label>
              <Textarea
                id="formacao"
                placeholder="Cursos, graduação, pós-graduação..."
                value={formacaoAcademica}
                onChange={e => setFormacaoAcademica(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="profissao">Profissão Anterior</Label>
              <Input
                id="profissao"
                placeholder="Profissão antes do mandato"
                value={profissaoAnterior}
                onChange={e => setProfissaoAnterior(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="areas">Áreas de Atuação</Label>
              <Input
                id="areas"
                placeholder="Saúde, Educação, Segurança (separado por vírgula)"
                value={areasAtuacao}
                onChange={e => setAreasAtuacao(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !vereadorSelecionado}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Dados Complementares'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
