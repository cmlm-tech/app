
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { AgentePublico, PermissaoUsuario, PERMISSOES_USUARIO } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ModalConviteUsuarioProps = {
  isOpen: boolean;
  onClose: () => void;
  agente: AgentePublico | null;
  onConviteEnviado: () => void;
};

export const ModalConviteUsuario = ({
  isOpen,
  onClose,
  agente,
  onConviteEnviado
}: ModalConviteUsuarioProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [permissao, setPermissao] = useState<PermissaoUsuario>('Assessoria');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agente || !email || !permissao) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('convidar-usuario', {
        body: {
          agente_publico_id: agente.id,
          email: email,
          permissao: permissao
        }
      });

      if (error) throw error;

      toast({
        title: "Convite enviado!",
        description: `Convite enviado para ${email} com sucesso. O agente receberá um email para definir sua senha.`,
      });

      // Resetar formulário
      setEmail('');
      setPermissao('Assessoria');
      
      // Fechar modal e atualizar lista
      onClose();
      onConviteEnviado();

    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar convite. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPermissao('Assessoria');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar Agente Público</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Agente</Label>
            <Input
              value={agente?.nomeCompleto || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail para convite *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o e-mail do agente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Permissão inicial *</Label>
            <Select value={permissao} onValueChange={(value: PermissaoUsuario) => setPermissao(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a permissão" />
              </SelectTrigger>
              <SelectContent>
                {PERMISSOES_USUARIO.map((perm) => (
                  <SelectItem key={perm} value={perm}>
                    {perm}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !email || !permissao}
              className="flex-1"
            >
              {loading ? "Enviando..." : "Enviar Convite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
