
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
import { AgenteComStatus } from "@/pages/plenario/AgentesPublicos";
import { agentePublicoSchema, generateDefaultAvatar, type AgentePublicoFormData } from "./validation";
import { z } from "zod";

type ModalAgentePublicoProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agente: Partial<AgentePublico>) => void;
  agente?: AgenteComStatus | null;
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
  const { formatCpf } = useCpfValidation();
  
  const [formData, setFormData] = useState<Partial<AgentePublico>>({
    nomeCompleto: '',
    cpf: '',
    foto: '',
    tipo: undefined,
    nomeParlamantar: '',
    perfil: '',
    cargo: '',
    tipoVinculo: undefined,
    dataAdmissao: '',
    dataExoneracao: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (agente && isEditing) {
      setFormData({
        id: agente.id.toString(),
        nomeCompleto: agente.nome_completo || '',
        cpf: agente.cpf || '',
        foto: agente.foto_url || '',
        tipo: agente.tipo,
        nomeParlamantar: agente.nome_parlamentar || '',
        perfil: agente.perfil || '',
        cargo: agente.cargo || '',
        tipoVinculo: agente.tipo_vinculo || undefined,
        dataAdmissao: agente.data_admissao || '',
        dataExoneracao: agente.data_exoneracao || ''
      });
    } else {
      setFormData({
        nomeCompleto: '',
        cpf: '',
        foto: '',
        tipo: undefined,
        nomeParlamantar: '',
        perfil: '',
        cargo: '',
        tipoVinculo: undefined,
        dataAdmissao: '',
        dataExoneracao: ''
      });
    }
    setValidationErrors({});
  }, [agente, isEditing, isOpen]);

  // Validar formulário em tempo real
  const validateForm = () => {
    try {
      agentePublicoSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  // Executar validação sempre que formData mudar
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      validateForm();
    }
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      // Gerar avatar padrão se não houver foto
      let fotoUrl = formData.foto;
      if (!fotoUrl || fotoUrl.trim() === '') {
        fotoUrl = generateDefaultAvatar(formData.nomeCompleto || '');
      }

      const { data, error } = await supabase.rpc('upsert_agente_publico', {
        p_id: isEditing && agente ? Number(agente.id) : null,
        p_nome_completo: formData.nomeCompleto,
        p_cpf: formData.cpf?.replace(/\D/g, ''),
        p_foto_url: fotoUrl,
        p_tipo: formData.tipo,
        p_nome_parlamentar: formData.nomeParlamantar || null,
        p_perfil: formData.perfil || null,
        p_cargo: formData.cargo || null,
        p_tipo_vinculo: formData.tipoVinculo || null,
        p_data_admissao: formData.dataAdmissao || null,
        p_data_exoneracao: formData.dataExoneracao || null
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: isEditing ? "Agente atualizado com sucesso!" : "Agente cadastrado com sucesso!"
      });

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

  // Verificar se o formulário é válido
  const isFormValid = Object.keys(validationErrors).length === 0 && 
                     formData.nomeCompleto?.trim() && 
                     formData.cpf?.trim() && 
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
          {/* Seleção de Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Agente *</Label>
            <Select
              value={formData.tipo || ''}
              onValueChange={(value) => handleInputChange('tipo', value as TipoAgente)}
              disabled={isSaving}
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
            {validationErrors.tipo && (
              <p className="text-sm text-red-600">{validationErrors.tipo}</p>
            )}
          </div>

          {/* Campos Comuns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto">Nome Completo *</Label>
              <Input
                id="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                required
                disabled={isSaving}
              />
              {validationErrors.nomeCompleto && (
                <p className="text-sm text-red-600">{validationErrors.nomeCompleto}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                required
                disabled={isSaving}
              />
              {validationErrors.cpf && (
                <p className="text-sm text-red-600">{validationErrors.cpf}</p>
              )}
            </div>
          </div>

          {/* Upload de Imagem */}
          <div className="space-y-2">
            <Label>Foto do Agente</Label>
            <ImageUpload
              onImageUploaded={(url) => handleInputChange('foto', url)}
              currentImageUrl={formData.foto}
              disabled={isSaving}
            />
            <p className="text-sm text-gray-500">
              Se não enviar uma foto, será gerado um avatar automaticamente com as iniciais do nome.
            </p>
          </div>

          {/* Campos Condicionais para Vereador */}
          {formData.tipo === 'Vereador' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nomeParlamantar">Nome Parlamentar</Label>
                <Input
                  id="nomeParlamantar"
                  value={formData.nomeParlamantar}
                  onChange={(e) => handleInputChange('nomeParlamantar', e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perfil">Perfil</Label>
                <Textarea
                  id="perfil"
                  value={formData.perfil}
                  onChange={(e) => handleInputChange('perfil', e.target.value)}
                  rows={3}
                  disabled={isSaving}
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
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoVinculo">Tipo de Vínculo</Label>
                  <Select
                    value={formData.tipoVinculo || ''}
                    onValueChange={(value) => handleInputChange('tipoVinculo', value)}
                    disabled={isSaving}
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
                    disabled={isSaving}
                  />
                  {validationErrors.dataAdmissao && (
                    <p className="text-sm text-red-600">{validationErrors.dataAdmissao}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataExoneracao">Data de Exoneração</Label>
                  <Input
                    id="dataExoneracao"
                    type="date"
                    value={formData.dataExoneracao}
                    onChange={(e) => handleInputChange('dataExoneracao', e.target.value)}
                    disabled={isSaving}
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
