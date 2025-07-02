import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AgenteComStatus } from "@/pages/plenario/AgentesPublicos";
import { Enums } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

type ModalReativarUsuarioProps = {
  isOpen: boolean;
  onClose: () => void;
  agente: AgenteComStatus | null;
  onConfirm: (permissao: Enums<"permissao_usuario">) => void;
};

export const ModalReativarUsuario = ({ isOpen, onClose, agente, onConfirm }: ModalReativarUsuarioProps) => {
  const [permissaoSelecionada, setPermissaoSelecionada] = useState<Enums<"permissao_usuario"> | "">("");
  const [isReactivating, setIsReactivating] = useState(false);

  const handleConfirmClick = async () => {
    if (permissaoSelecionada) {
      setIsReactivating(true);
      await onConfirm(permissaoSelecionada);
      setIsReactivating(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reativar Agente Público</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>O agente <strong>{agente?.nome_completo}</strong> está atualmente inativo.</p>
          <p>Selecione a nova permissão para reativá-lo no sistema:</p>
          <div className="space-y-2">
            <Label htmlFor="permissao">Permissão *</Label>
            <Select value={permissaoSelecionada} onValueChange={(value: Enums<"permissao_usuario">) => setPermissaoSelecionada(value)} disabled={isReactivating}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma permissão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Assessoria">Assessoria</SelectItem>
                <SelectItem value="Secretaria">Secretaria</SelectItem>
                <SelectItem value="Vereador">Vereador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isReactivating}>Cancelar</Button>
          <Button onClick={handleConfirmClick} disabled={isReactivating || !permissaoSelecionada}>
            {isReactivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reativar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
