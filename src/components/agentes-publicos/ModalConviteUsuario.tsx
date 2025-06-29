import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgenteComStatus } from "@/pages/plenario/AgentesPublicos"; // Importa o tipo correto
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Enums } from "@/integrations/supabase/types"; // Importa os Enums para permissão

type ModalConviteUsuarioProps = {
  isOpen: boolean;
  onClose: () => void;
  agente: AgenteComStatus | null;
  onConviteEnviado: () => void;
};

export const ModalConviteUsuario = ({ isOpen, onClose, agente, onConviteEnviado }: ModalConviteUsuarioProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [permissao, setPermissao] = useState<Enums<"permissao_usuario">>("Vereador");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Limpa os campos quando o modal é aberto ou o agente muda
    if (isOpen) {
      setEmail("");
      // Define a permissão padrão com base no tipo do agente
      const permissaoPadrao = agente?.tipo === 'Funcionario' ? 'Assessoria' : 'Vereador';
      setPermissao(permissaoPadrao);
    }
  }, [isOpen, agente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agente) return;
    setIsSending(true);

    try {
      const { error } = await supabase.functions.invoke('convidar-usuario', {
        body: {
          agente_publico_id: agente.id,
          email: email,
          permissao: permissao,
        },
      });

      if (error) {
        // A Edge Function agora retorna um objeto de erro com uma propriedade 'error'
        throw new Error(error.message);
      }

      toast({
        title: "Sucesso!",
        description: "Convite enviado com sucesso para o agente.",
      });
      onConviteEnviado(); // Chama a função para recarregar a lista
      onClose(); // Fecha o modal

    } catch (error: any) {
      toast({
        title: "Erro ao enviar convite",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    // Garante que o estado seja limpo ao fechar
    setEmail('');
    setPermissao('Vereador');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convidar Agente Público</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome-agente">Nome do Agente</Label>
            <Input
              id="nome-agente"
              // CORREÇÃO: Acedendo a `agente.nome_completo` com optional chaining
              value={agente?.nome_completo || ""}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail para convite *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite o e-mail do agente"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="permissao">Permissão inicial *</Label>
            <Select value={permissao} onValueChange={(value) => setPermissao(value as Enums<"permissao_usuario">)} disabled={isSending}>
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
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSending || !email}>
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};