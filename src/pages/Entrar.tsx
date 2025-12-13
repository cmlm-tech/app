
import { useState } from "react";
import { Cloud, LogIn, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { supabase } from '@/lib/supabaseClient';

const Entrar = () => {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Assumindo que userIdentifier é sempre email neste caso
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: userIdentifier,
        password: password,
      });

      if (signInError) {
        setError("E-mail ou senha inválidos. Por favor, verifique seus dados e tente novamente.");
        return;
      }

      if (data.user) {
        // Redirecionar para o painel em caso de sucesso
        navigate("/painel");
      }
    } catch (err) {
      setError("E-mail ou senha inválidos. Por favor, verifique seus dados e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-fixed"
        style={{
          backgroundImage: `url('https://itjlzbnrdileuapsqwwe.supabase.co/storage/v1/object/public/assets/background_home_final.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'top',
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
            <RouterLink to="/" className="inline-flex items-center group mb-6">
              <div className="w-12 h-12 bg-gov-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                <Cloud className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
            </RouterLink>
            <h2 className="text-3xl font-montserrat font-bold text-gray-900 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-500">
              Acesse sua conta para gerenciar o legislativo
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userIdentifier" className="text-gray-700 font-medium">
                E-mail ou Matrícula
              </Label>
              <Input
                id="userIdentifier"
                name="userIdentifier"
                type="text"
                autoComplete="username"
                placeholder="ex: nome@camara.leg.br"
                className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-gov-blue-500 transition-all rounded-lg"
                value={userIdentifier}
                onChange={(e) => setUserIdentifier(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Senha
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-gov-blue-500 transition-all pr-10 rounded-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gov-blue-600 transition-colors z-10 p-1"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <RouterLink
                to="/"
                className="text-sm text-gray-500 hover:text-gov-blue-700 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao site
              </RouterLink>

              <RouterLink
                to="/recuperar-senha"
                className="text-sm font-medium text-gov-blue-700 hover:text-gov-blue-900 transition-colors hover:underline"
              >
                Esqueceu a senha?
              </RouterLink>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
                <div className="bg-red-100 p-1 rounded-full shrink-0">
                  <span className="text-red-600 text-sm block px-1.5 font-bold">!</span>
                </div>
                <p className="text-red-700 text-sm font-medium leading-tight pt-0.5">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gov-blue-800 to-gov-blue-600 hover:from-gov-blue-900 hover:to-gov-blue-700 text-white text-lg font-semibold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Acessando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Acessar Plataforma
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

export default Entrar;
