
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { AgentePublico, TipoAgente, TIPOS_AGENTE, TIPOS_VINCULO } from "./types";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleInputChange = (field: keyof AgentePublico, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
                      {tipo}
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
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foto">URL da Foto</Label>
            <Input
              id="foto"
              value={formData.foto}
              onChange={(e) => handleInputChange('foto', e.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
            />
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
          {formData.tipo === 'Funcionário' && (
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
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar Agente Público
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
