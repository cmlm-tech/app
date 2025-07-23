import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from 'lucide-react'; // Importação dos ícones

const MeuPerfil = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estado para armazenar o ID numérico do Agente Público
  const [agentePublicoId, setAgentePublicoId] = useState<number | null>(null);

  // Estados para controlar a visibilidade da senha
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setEmail(authUser.email || '');

          // ETAPA 1: Usar o UUID do auth para descobrir o ID numérico do Agente Público
          const { data: usuarioData, error: usuarioError } = await supabase
            .from('usuarios')
            .select('agente_publico_id')
            .eq('id', authUser.id)
            .single();

          if (usuarioError) throw new Error(`Erro ao buscar na tabela Usuarios: ${usuarioError.message}`);
          if (!usuarioData) throw new Error("Registro de usuário não encontrado na tabela 'Usuarios'.");
          
          const idAgente = usuarioData.agente_publico_id;
          setAgentePublicoId(idAgente);

          // ETAPA 2: Usar o ID numérico para buscar os dados em AgentesPublicos
          const { data: profile, error: profileError } = await supabase
            .from('agentespublicos')
            .select('nome_completo, foto_url')
            .eq('id', idAgente)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          if (profile) {
            setNome(profile.nome_completo || '');
            setAvatarUrl(profile.foto_url || '');
          }
        }
      } catch (error: any) {
        toast({
          title: "Erro ao carregar perfil",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !agentePublicoId) return;

    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Usuário não autenticado.");

      const filePath = `${authUser.id}/${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from('fotos_agentes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('fotos_agentes')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      const { error: updateError } = await supabase
        .from('agentespublicos')
        .update({ foto_url: publicUrl })
        .eq('id', agentePublicoId);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso!",
        description: "Sua foto de perfil foi atualizada.",
      });

    } catch (error: any) {
      toast({ title: "Erro no upload da foto", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast({ title: "Erro", description: "As novas senhas não coincidem.", variant: "destructive" });
      return;
    }
    
    if (!agentePublicoId) return;

    setLoading(true);
    try {
      const { error: profileError } = await supabase
        .from('agentespublicos')
        .update({ nome_completo: nome })
        .eq('id', agentePublicoId);

      if (profileError) throw profileError;

      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
        if (passwordError) throw passwordError;
      }

      toast({
        title: "Sucesso!",
        description: "Seu perfil foi atualizado.",
      });
      setNewPassword('');
      setConfirmPassword('');

    } catch (error: any) {
      toast({ title: "Erro ao salvar alterações", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">
          Meu Perfil
        </h1>
        <p className="text-gray-600 mt-1">
          Gerencie suas informações pessoais e de segurança.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarUrl} alt="Foto do usuário" />
                <AvatarFallback>{nome?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
                disabled={loading}
              />
              <Button variant="link" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                Alterar Foto
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-perfil">E-mail</Label>
              <Input
                id="email-perfil"
                value={email}
                readOnly
                className="bg-gray-100"
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Alterar Senha</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nova-senha">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="nova-senha"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmar-nova-senha">Confirme a Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmar-nova-senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveChanges} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </AppLayout>
  );
};

export default MeuPerfil;