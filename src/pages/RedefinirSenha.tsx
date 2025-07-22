import React, { useState } from "react";
import { Cloud, Eye, EyeOff, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from "@/contexts/AuthContext";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { PasswordRequirements } from "@/components/PasswordRequirements";
import { useToast } from "@/hooks/use-toast";

const RedefinirSenha = () => {
  // --- Estados do formulário ---
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Estados Globais do AuthContext ---
  const { user, loading: authLoading } = useAuth();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validationStatus, isPasswordValid } = usePasswordValidation(newPassword, confirmPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!isPasswordValid) {
      setFormError("Por favor, atenda todos os requisitos de senha antes de continuar.");
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {        
        // Verifica a mensagem de erro específica do Supabase
        if (error.message === "New password should be different from the old password") {
          // Define mensagem traduzida e mais direta
          setFormError("A nova senha deve ser diferente da anterior.");
        } else {
          // Para outros erros, mostra uma mensagem genérica ou traduzir outras também
          setFormError("Ocorreu um erro inesperado. Tente novamente.");
        }        
      } else {
        // Mostrar mensagem de sucesso
        toast({
          title: "Senha redefinida com sucesso!",
          description: "Você será redirecionado para fazer login com sua nova senha.",
        });

        // Aguardar um momento para o toast aparecer
        setTimeout(async () => {
          try {
            // Deslogar o usuário
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.log("Erro ao fazer logout:", signOutError);
          }
          
          // Redirecionar para a página de login
          navigate('/entrar', { 
            state: { 
              message: 'Senha redefinida com sucesso! Faça login com sua nova senha.' 
            }
          });
        }, 1500);
      }
    } catch (err) {
      setFormError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 1. Enquanto o AuthContext está verificando a sessão
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gov-blue-800 px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-gov-blue-800 mb-5 animate-spin" aria-hidden="true" />
          <h1 className="text-2xl font-montserrat font-bold text-gov-blue-800 mb-4 text-center">
            Verificando Link...
          </h1>
        </div>
      </div>
    );
  }

  // 2. Se o loading terminou e NÃO HÁ usuário, o link é inválido.
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gov-blue-800 px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-5" aria-hidden="true" />
          <h1 className="text-2xl font-montserrat font-bold text-red-600 mb-4 text-center">
            Link Inválido ou Expirado
          </h1>
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            Por favor, solicite um novo link para redefinir sua senha.
          </p>
          <Link
            to="/recuperar-senha"
            className="w-full bg-gov-blue-800 hover:bg-gov-blue-700 text-white text-base font-semibold py-3 px-4 rounded-lg transition-colors text-center inline-block"
          >
            Solicitar Novo Link
          </Link>
        </div>
      </div>
    );
  }

  // 3. Se passou pelas verificações, o token é válido. Renderiza a tela completa com o formulário.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-blue-800 px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <Cloud className="h-12 w-12 text-gov-blue-800 mb-5" aria-hidden="true" />
        <h1 className="text-2xl font-montserrat font-bold text-gov-blue-800 mb-4 text-center">
          Crie sua Nova Senha
        </h1>
        <p className="text-gray-600 text-center mb-8 leading-relaxed">
          Sua nova senha deve ser segura e diferente da anterior.
        </p>

        {formError && (
          <Alert variant="destructive" className="mb-4 w-full">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <Label htmlFor="newPassword" className="mb-1 block text-gray-700">
              Nova Senha
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Digite sua nova senha"
                className="mt-1 pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isUpdating}
                required
              />
              <button type="button" tabIndex={-1} className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 z-10 p-1" onClick={() => setShowNewPassword((prev) => !prev)} aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"} disabled={isUpdating}>
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <PasswordRequirements validationStatus={validationStatus} />
          </div>
          
          <div>
            <Label htmlFor="confirmPassword" className="mb-1 block text-gray-700">
              Confirme a Nova Senha
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirme sua nova senha"
                className="mt-1 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isUpdating}
                required
              />
              <button type="button" tabIndex={-1} className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 z-10 p-1" onClick={() => setShowConfirmPassword((prev) => !prev)} aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"} disabled={isUpdating}>
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gov-blue-800 hover:bg-gov-blue-700 text-white text-base font-semibold py-3 mt-2 rounded-lg transition-colors"
            disabled={!isPasswordValid || isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Salvar Nova Senha
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RedefinirSenha;