import React, { useState } from "react";
import { Key, Eye, EyeOff, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Importa o hook principal
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { PasswordRequirements } from "@/components/PasswordRequirements";
import { supabase } from "@/integrations/supabase/client";

const RedefinirSenha = () => {
  // Estados do formulário
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Consumindo o estado global de autenticação
  const { user, loading } = useAuth();
  
  const navigate = useNavigate();
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
        setFormError(error.message);
      } else {
        navigate('/entrar', { 
          state: { 
            message: 'Senha redefinida com sucesso! Faça login com sua nova senha.' 
          }
        });
      }
    } catch (err) {
      setFormError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 1. Enquanto o AuthContext está verificando, mostramos o loading.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gov-blue-800 px-4">
        {/* ... (seu JSX de loading aqui, pode copiar do código antigo) ... */}
        <Loader2 className="h-12 w-12 text-white mb-5 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  // 2. Se o loading terminou e NÃO HÁ usuário, o link é inválido.
  if (!loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gov-blue-800 px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-5" aria-hidden="true" />
          <h1 className="text-2xl font-montserrat font-bold text-red-600 mb-4 text-center">
            Link Inválido
          </h1>
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            Link de redefinição de senha inválido ou expirado. Solicite um novo link.
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

  // 3. Se o loading terminou e HÁ um usuário, o link é válido. Exibimos o formulário.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-blue-800 px-4">
      {/* ... (Cole aqui todo o seu JSX do formulário, sem alterações) ... */}
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <Key className="h-12 w-12 text-gov-blue-800 mb-5" aria-hidden="true" />
        <h1 className="text-2xl font-montserrat font-bold text-gov-blue-800 mb-4 text-center">
          Crie sua Nova Senha
        </h1>
        {/* Restante do seu formulário... */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
           {/* ... seus inputs e botão ... */}
        </form>
      </div>
    </div>
  );
};

export default RedefinirSenha;