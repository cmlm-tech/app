// Caminho: src/components/agentes-publicos/ModalAgentePublico.tsx (VERSÃO CORRIGIDA)

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgenteComStatus } from "@/pages/plenario/AgentesPublicos";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Database, Enums } from "@/integrations/supabase/types";

// Tipos para as props do modal
type ModalAgentePublicoProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  agente: AgenteComStatus | null;
  isEditing: boolean;
};

// Tipo para o estado do formulário
type FormData = {
  nome_completo: string;
  cpf: string;
  foto_url: string;
  tipo: Enums<'tipo_agente_publico'>;
  cargo: string;
  tipo_vinculo: Enums<'tipo_vinculo_funcionario'>;
  data_admissao: string;
  nome_parlamentar: string;
  perfil: string;
};

export const ModalAgentePublico = ({ isOpen, onClose, onSave, agente, isEditing }: ModalAgentePublicoProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const initialState: FormData = {
    nome_completo: '',
    cpf: '',
    foto_url: '',
    tipo: 'Funcionario',
    cargo: '',
    tipo_vinculo: 'Efetivo',
    data_admissao: '',
    nome_parlamentar: '',
    perfil: ''
  };
  
  const [formData, setFormData] = useState<FormData>(initialState);
  const [errors, setErrors] = useState<{ nome_completo?: string }>({});

  // Efeito para popular o formulário quando o modo de edição é ativado
  useEffect(() => {
    if (isEditing && agente) {
      setFormData({
        nome_completo: agente.nome_completo || '',
        cpf: agente.cpf || '',
        foto_url: agente.foto_url || '',
        tipo: agente.tipo || 'Funcionario',
        cargo: agente.cargo || '',
        tipo_vinculo: agente.tipo_vinculo || 'Efetivo',
        data_admissao: agente.data_admissao ? new Date(agente.data_admissao).toISOString().split('T')[0] : '',
        nome_parlamentar: agente.nome_parlamentar || '',
        perfil: agente.perfil || ''
      });
      // Limpa os erros ao carregar novos dados
      setErrors({});
    } else {
      setFormData(initialState);
    }
  }, [agente, isEditing, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = useCallback(() => {
    const newErrors: { nome_completo?: string } = {};
    if (!formData.nome_completo.trim()) {
      newErrors.nome_completo = "O nome completo é obrigatório.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.nome_completo]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const { error } = await supabase.rpc('upsert_agente_publico', {
        p_id: isEditing ? agente?.id : null,
        p_nome_completo: formData.nome_completo,
        p_cpf: formData.cpf || null,
        p_foto_url: formData.foto_url || null,
        p_tipo: formData.tipo,
        p_cargo: formData.tipo === 'Funcionario' ? formData.cargo : null,
        p_tipo_vinculo: formData.tipo === 'Funcionario' ? formData.tipo_vinculo : null,
        p_data_admissao: formData.tipo === 'Funcionario' && formData.data_admissao ? formData.data_admissao : null,
        p_nome_parlamentar: formData.tipo === 'Vereador' ? formData.nome_parlamentar : null,
        p_perfil: formData.tipo === 'Vereador' ? formData.perfil : null
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Agente ${isEditing ? 'atualizado' : 'criado'} com sucesso.`,
      });
      onSave();
      onClose();

    } catch (error: any) {
      console.error("Erro ao salvar agente:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar os dados do agente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // O botão de salvar é desativado se estiver a carregar ou se o nome estiver vazio.
  const isSaveDisabled = loading || !formData.nome_completo.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Agente Público' : 'Cadastrar Novo Agente Público'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_completo">Nome Completo *</Label>
              <Input id="nome_completo" name="nome_completo" value={formData.nome_completo} onChange={handleInputChange} />
               {errors.nome_completo && <p className="text-sm text-red-500 mt-1">{errors.nome_completo}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleInputChange} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Agente</Label>
            <Select value={formData.tipo} onValueChange={(v) => handleSelectChange('tipo', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Funcionario">Funcionário</SelectItem>
                <SelectItem value="Vereador">Vereador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipo === 'Funcionario' ? (
            <div className="p-4 border rounded-md space-y-4 bg-gray-50">
              <h3 className="font-semibold text-gray-800">Dados do Funcionário</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" name="cargo" value={formData.cargo} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_vinculo">Tipo de Vínculo</Label>
                   <Select value={formData.tipo_vinculo} onValueChange={(v) => handleSelectChange('tipo_vinculo', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Efetivo">Efetivo</SelectItem>
                      <SelectItem value="Comissionado">Comissionado</SelectItem>
                      <SelectItem value="Terceirizado">Terceirizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_admissao">Data de Admissão</Label>
                  <Input id="data_admissao" name="data_admissao" type="date" value={formData.data_admissao} onChange={handleInputChange} />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-md space-y-4 bg-gray-50">
              <h3 className="font-semibold text-gray-800">Dados do Vereador</h3>
              <div className="space-y-2">
                  <Label htmlFor="nome_parlamentar">Nome Parlamentar</Label>
                  <Input id="nome_parlamentar" name="nome_parlamentar" value={formData.nome_parlamentar} onChange={handleInputChange} />
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={isSaveDisabled}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Agente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
