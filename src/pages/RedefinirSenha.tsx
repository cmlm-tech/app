import React, { useState } from "react";
import { Cloud, Eye, EyeOff, Check, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 text-white mb-4 animate-spin mx-auto" aria-hidden="true" />
          <h1 className="text-xl font-montserrat font-semibold">
            Verificando solicitação...
          </h1>
        </div>
      </div>
    );
  }

  // 2. Se o loading terminou e NÃO HÁ usuário, o link é inválido.
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gov-blue-800 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-montserrat font-bold text-gray-900 mb-2 text-center">
            Link Inválido
          </h1>
          <p className="text-gray-600 text-center mb-8 leading-relaxed">
            Este link de redefinição de senha expirou ou é inválido. Por favor, solicite um novo link.
          </p>
          <Link
            to="/recuperar-senha"
            className="w-full bg-gov-blue-800 hover:bg-gov-blue-700 text-white text-base font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center inline-block"
          >
            Solicitar Novo Link
          </Link>
        </div>
      </div>
    );
  }

  // 3. Se passou pelas verificações, o token é válido. Renderiza a tela completa com o formulário.
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-fixed"
        style={{
          backgroundImage: `url('https://itjlzbnrdileuapsqwwe.supabase.co/storage/v1/object/public/assets/background_home_final.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-gov-blue-900/95 via-gov-blue-800/90 to-blue-900/80 z-10" />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -left-24 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-20 w-full max-w-md px-4 animate-fade-in">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 md:p-10 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center group mb-6">
              <div className="w-12 h-12 bg-gov-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                <Cloud className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
            </div>
            <h1 className="text-2xl font-montserrat font-bold text-gray-900 mb-2">
              Nova Senha
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Crie uma senha forte para proteger sua conta.
            </p>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start space-x-3 mb-6 animate-fade-in">
              <div className="bg-red-100 p-1 rounded-full shrink-0">
                <span className="text-red-600 text-sm block px-1.5 font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm font-medium leading-tight pt-0.5">
                {formError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Digite sua nova senha"
                  className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-gov-blue-500 transition-all rounded-lg pr-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isUpdating}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gov-blue-600 transition-colors z-10 p-1"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                  disabled={isUpdating}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-2">
                <PasswordRequirements validationStatus={validationStatus} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirme a Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repita a nova senha"
                  className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-gov-blue-500 transition-all rounded-lg pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isUpdating}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gov-blue-600 transition-colors z-10 p-1"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                  disabled={isUpdating}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-gov-blue-800 to-gov-blue-600 hover:from-gov-blue-900 hover:to-gov-blue-700 text-white text-lg font-semibold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
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

        <p className="text-center text-blue-200/80 text-sm mt-8 font-light">
          &copy; {new Date().getFullYear()} Câmara Municipal de Lavras da Mangabeira
        </p>
      </div>
    </div>
  );
};

export default RedefinirSenha;