import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { PasswordRequirements } from "@/components/PasswordRequirements";

const RedefinirSenha = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  
  // Estados de controle da página
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [error, setError] = useState('');

  // Hook de validação de senha
  const { validationStatus, isPasswordValid } = usePasswordValidation(newPassword, confirmPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validar senha antes de continuar
    if (!isPasswordValid) {
      setFormError("Por favor, atenda todos os requisitos de senha antes de continuar.");
      return;
    }

    // Aqui futuramente será implementada a lógica de redefinição
    console.log("Password reset attempt:", { newPassword, confirmPassword });
  };

  useEffect(() => {
    // Configurar listener para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        
        // Verificar se é um evento de recuperação de senha
        if (event === 'PASSWORD_RECOVERY') {
          setIsTokenValid(true);
          setIsVerifyingToken(false);
        }
      }
    );

    // Timeout para detectar link inválido ou acesso direto
    const timeoutId = setTimeout(() => {
      if (!isTokenValid) {
        setIsVerifyingToken(false);
        setError('Link de redefinição de senha inválido ou expirado.');
      }
    }, 2000);

    // Função de limpeza
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [isTokenValid]);

  // Renderização condicional: Verificando token
  if (isVerifyingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gov-blue-800 px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-gov-blue-800 mb-5 animate-spin" aria-hidden="true" />
          <h1 className="text-2xl font-montserrat font-bold text-gov-blue-800 mb-4 text-center">
            Verificando Link
          </h1>
          <p className="text-gray-600 text-center leading-relaxed">
            Aguarde enquanto verificamos a validade do seu link de redefinição...
          </p>
        </div>
      </div>
    );
  }

  // Renderização condicional: Token inválido
  if (!isVerifyingToken && !isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gov-blue-800 px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-5" aria-hidden="true" />
          <h1 className="text-2xl font-montserrat font-bold text-red-600 mb-4 text-center">
            Link Inválido
          </h1>
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            {error}
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

  // Renderização condicional: Token válido - Exibir formulário
  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-blue-800 px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <Key className="h-12 w-12 text-gov-blue-800 mb-5" aria-hidden="true" />
        <h1 className="text-2xl font-montserrat font-bold text-gov-blue-800 mb-4 text-center">
          Crie sua Nova Senha
        </h1>
        <p className="text-gray-600 text-center mb-8 leading-relaxed">
          Sua nova senha deve ser segura e diferente da anterior.
        </p>
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
                required
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 z-10 p-1"
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
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
                required
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 z-10 p-1"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {formError && (
            <div className="text-red-600 text-sm mt-2 text-center">
              {formError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gov-blue-800 hover:bg-gov-blue-700 text-white text-base font-semibold py-3 mt-2 rounded-lg transition-colors"
            disabled={!isPasswordValid}
          >
            <Check className="mr-2 h-5 w-5" />
            Salvar Nova Senha
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RedefinirSenha;
