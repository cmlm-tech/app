
import { useState } from "react";
import { LogIn, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="min-h-screen flex items-center justify-center bg-gov-blue-800 px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <LogIn className="h-12 w-12 text-gov-blue-800 mb-5" aria-hidden="true" />
        <h2 className="text-2xl font-montserrat font-bold text-gov-blue-800 mb-8 text-center">
          Acesso ao Sistema
        </h2>
        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div>
            <Label htmlFor="userIdentifier" className="mb-1 block text-gray-700">
              E-mail Funcional ou Matrícula
            </Label>
            <Input
              id="userIdentifier"
              name="userIdentifier"
              type="text"
              autoComplete="username"
              placeholder="Digite seu e-mail ou matrícula"
              className="mt-1"
              value={userIdentifier}
              onChange={(e) => setUserIdentifier(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="mb-1 block text-gray-700">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                className="mt-1 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 z-10 p-1"
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
          
          <div className="flex justify-end">
            <RouterLink
              to="/recuperar-senha"
              className="text-xs text-gov-blue-700 hover:text-gov-blue-800 font-medium transition-colors"
            >
              Esqueceu sua senha?
            </RouterLink>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <span className="text-red-600 text-lg">⚠️</span>
              <p className="text-red-800 text-sm font-medium">
                {error}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gov-blue-800 hover:bg-gov-blue-700 text-white text-base font-semibold py-3 mt-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Entrar
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Entrar;
