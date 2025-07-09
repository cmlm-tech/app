import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Legislatura {
  id?: number;
  numero: number;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  numero_vagas_vereadores: number;
}

interface ModalLegislaturaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  legislatura?: Legislatura | null;
}

export const ModalLegislatura: React.FC<ModalLegislaturaProps> = ({
  isOpen,
  onClose,
  onSuccess,
  legislatura = null
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    numero: 0,
    descricao: '',
    data_inicio: undefined as Date | undefined,
    data_fim: undefined as Date | undefined,
    numero_vagas_vereadores: 9
  });

  const isEditMode = Boolean(legislatura);

  useEffect(() => {
    if (legislatura && isOpen) {
      setFormData({
        numero: legislatura.numero,
        descricao: legislatura.descricao,
        data_inicio: new Date(legislatura.data_inicio),
        data_fim: new Date(legislatura.data_fim),
        numero_vagas_vereadores: legislatura.numero_vagas_vereadores
      });
    } else {
      setFormData({
        numero: new Date().getFullYear(),
        descricao: '',
        data_inicio: undefined,
        data_fim: undefined,
        numero_vagas_vereadores: 9
      });
    }
  }, [legislatura, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.data_inicio || !formData.data_fim || !formData.descricao.trim()) {
      toast({ title: "Erro", description: "Todos os campos são obrigatórios.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        numero: formData.numero,
        descricao: formData.descricao.trim(),
        data_inicio: format(formData.data_inicio, 'yyyy-MM-dd'),
        data_fim: format(formData.data_fim, 'yyyy-MM-dd'),
        numero_vagas_vereadores: formData.numero_vagas_vereadores
      };
      
      if (isEditMode && legislatura) {
        const { error } = await supabase
          .from('legislaturas')
          .update(dataToSave)
          .eq('id', legislatura.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.functions.invoke('criar-legislatura-completa', {
          body: dataToSave
        });
        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: `Legislatura ${isEditMode ? 'atualizada' : 'criada'} com sucesso!`
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar legislatura:', error);
      toast({
        title: "Erro",
        description: error.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} legislatura.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // ALTERAÇÃO APLICADA AQUI
    <Dialog open={isOpen} onOpenChange={onClose} modal={false}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Legislatura' : 'Nova Legislatura'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="numero">Número/Ano</Label>
            <Input id="numero" type="number" value={formData.numero} onChange={(e) => handleInputChange('numero', parseInt(e.target.value) || 0)} required min="1" />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" value={formData.descricao} onChange={(e) => handleInputChange('descricao', e.target.value)} placeholder="Ex: Legislatura 2029-2032" required />
          </div>
          <div>
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.data_inicio && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.data_inicio ? format(formData.data_inicio, "dd/MM/yyyy") : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.data_inicio} onSelect={(date) => handleInputChange('data_inicio', date)} initialFocus /></PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Data de Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.data_fim && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.data_fim ? format(formData.data_fim, "dd/MM/yyyy") : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.data_fim} onSelect={(date) => handleInputChange('data_fim', date)} initialFocus /></PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="vagas">Número de Vagas para Vereadores</Label>
            <Input id="vagas" type="number" value={formData.numero_vagas_vereadores} onChange={(e) => handleInputChange('numero_vagas_vereadores', parseInt(e.target.value) || 0)} required min="1" />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};