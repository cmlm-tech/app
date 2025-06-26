
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { AgentePublico, TipoAgente, TIPOS_AGENTE, TIPOS_VINCULO } from "./types";
import { useCpfValidation } from "@/hooks/useCpfValidation";
import { ImageUpload } from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ModalAgentePublicoProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agente: Partial<AgentePublico>) => void;
  agente?: AgentePublico | null;
  isEditing: boolean;
};

export const ModalAgentePublico = ({
  isOpen,
  onClose,
  onSave,
  agente,
  isEditing
}: ModalAgentePublicoProps) => {
  const { toast } = useToast();
  const { cpfError, isValidCpf, handleCpfBlur, formatCpf } = useCpfValidation();
  
  const [formData, setFormData] = useState<Partial<AgentePublico>>({
    nomeCompleto: '',
    cpf: '',
    foto: '',
    tipo: undefined,
    statusUsuario: 'Sem Acesso',
    nomeParlamantar: '',
    perfil: '',
    cargo: '',
    tipoVinculo: undefined,
    dataAdmissao: '',
    dataExoneracao: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (agente && isEditing) {
      setFormData(agente);
    } else {
      setFormData({
        nomeCompleto: '',
        cpf: '',
        foto: '',
        tipo: undefined,
        statusUsuario: 'Sem Acesso',
        nomeParlamantar: '',
        perfil: '',
        cargo: '',
        tipoVinculo: undefined,
        dataAdmissao: '',
        dataExoneracao: ''
      });
    }
  }, [agente, isEditing, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nomeCompleto?.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome completo é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.cpf?.trim()) {
      toast({
        title: "Erro de validação", 
        description: "CPF é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidCpf) {
      toast({
        title: "Erro de validação",
        description: "CPF inválido.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.tipo) {
      toast({
        title: "Erro de validação",
        description: "Tipo de agente é obrigatório.", 
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && agente) {
        // Atualizar agente existente
        const { error: updateError } = await supabase
          .from('agentespublicos')
          .update({
            nome_completo: formData.nomeCompleto,
            cpf: formData.cpf?.replace(/\D/g, ''), // Salvar CPF apenas com números
            foto_url: formData.foto,
            tipo: formData.tipo
          })
          .eq('id', Number(agente.id));

        if (updateError) throw updateError;

        // Atualizar tabelas específicas
        if (formData.tipo === 'Vereador') {
          const { error: vereadorError } = await supabase
            .from('vereadores')
            .upsert({
              agente_publico_id: Number(agente.id),
              nome_parlamentar: formData.nomeParlamantar,
              perfil: formData.perfil
            });
          
          if (vereadorError) throw vereadorError;
        } else if (formData.tipo === 'Funcionario') {
          const { error: funcionarioError } = await supabase
            .from('funcionarios')
            .upsert({
              agente_publico_id: Number(agente.id),
              cargo: formData.cargo,
              tipo_vinculo: formData.tipoVinculo,
              data_admissao: formData.dataAdmissao || null,
              data_exoneracao: formData.dataExoneracao || null
            });
          
          if (funcionarioError) throw funcionarioError;
        }

        toast({
          title: "Sucesso!",
          description: "Agente atualizado com sucesso!"
        });
      } else {
        // Criar novo agente
        const { data: novoAgente, error: insertError } = await supabase
          .from('agentespublicos')
          .insert({
            nome_completo: formData.nomeCompleto,
            cpf: formData.cpf?.replace(/\D/g, ''), // Salvar CPF apenas com números
            foto_url: formData.foto,
            tipo: formData.tipo
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Inserir nas tabelas específicas
        if (formData.tipo === 'Vereador') {
          const { error: vereadorError } = await supabase
            .from('vereadores')
            .insert({
              agente_publico_id: novoAgente.id,
              nome_parlamentar: formData.nomeParlamantar,
              perfil: formData.perfil
            });
          
          if (vereadorError) throw vereadorError;
        } else if (formData.tipo === 'Funcionario') {
          const { error: funcionarioError } = await supabase
            .from('funcionarios')
            .insert({
              agente_publico_id: novoAgente.id,
              cargo: formData.cargo,
              tipo_vinculo: formData.tipoVinculo,
              data_admissao: formData.dataAdmissao || null,
              data_exoneracao: formData.dataExoneracao || null
            });
          
          if (funcionarioError) throw funcionarioError;
        }

        toast({
          title: "Sucesso!",
          description: "Agente cadastrado com sucesso!"
        });
      }

      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar agente:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar agente. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof AgentePublico, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCpfChange = (value: string) => {
    const formattedCpf = formatCpf(value);
    handleInputChange('cpf', formattedCpf);
  };

  const handleCpfBlurEvent = (e: React.FocusEvent<HTMLInputElement>) => {
    handleCpfBlur(e.target.value);
  };

  const isFormValid = formData.nomeCompleto?.trim() && 
                     formData.cpf?.trim() && 
                     isValidCpf && 
                     formData.tipo;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Agente Público' : 'Cadastrar Novo Agente Público'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Tipo (apenas no cadastro) */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Agente *</Label>
              <Select
                value={formData.tipo || ''}
                onValueChange={(value) => handleInputChange('tipo', value as TipoAgente)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_AGENTE.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo === 'Funcionario' ? 'Funcionário' : tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Campos Comuns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto">Nome Completo *</Label>
              <Input
                id="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                onBlur={handleCpfBlurEvent}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
              {cpfError && (
                <p className="text-sm text-red-600">{cpfError}</p>
              )}
            </div>
          </div>

          {/* Upload de Imagem */}
          <ImageUpload
            onImageUploaded={(url) => handleInputChange('foto', url)}
            currentImageUrl={formData.foto}
            disabled={isSaving}
          />

          {/* Campos Condicionais para Vereador */}
          {formData.tipo === 'Vereador' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nomeParlamantar">Nome Parlamentar</Label>
                <Input
                  id="nomeParlamantar"
                  value={formData.nomeParlamantar}
                  onChange={(e) => handleInputChange('nomeParlamantar', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perfil">Perfil</Label>
                <Textarea
                  id="perfil"
                  value={formData.perfil}
                  onChange={(e) => handleInputChange('perfil', e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Campos Condicionais para Funcionário */}
          {formData.tipo === 'Funcionario' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => handleInputChange('cargo', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoVinculo">Tipo de Vínculo</Label>
                  <Select
                    value={formData.tipoVinculo || ''}
                    onValueChange={(value) => handleInputChange('tipoVinculo', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o vínculo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_VINCULO.map((vinculo) => (
                        <SelectItem key={vinculo} value={vinculo}>
                          {vinculo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataAdmissao">Data de Admissão</Label>
                  <Input
                    id="dataAdmissao"
                    type="date"
                    value={formData.dataAdmissao}
                    onChange={(e) => handleInputChange('dataAdmissao', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataExoneracao">Data de Exoneração</Label>
                  <Input
                    id="dataExoneracao"
                    type="date"
                    value={formData.dataExoneracao}
                    onChange={(e) => handleInputChange('dataExoneracao', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Botões */}
          <div className="flex gap-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!isFormValid || isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar Agente Público'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
