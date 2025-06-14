
import { useState } from "react";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // No cadastro, só login no sistema!
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui, futuramente, irá a autenticação real
    // Exemplo: autenticar usuário e navegar para home
    // navigate("/");
    // Por enquanto, só um log:
    console.log("Login attempt:", userIdentifier, password);
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
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 z-10 p-1"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
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
            <a
              href="#"
              className="text-xs text-gov-blue-700 hover:text-gov-blue-800 font-medium transition-colors"
            >
              Esqueceu sua senha?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full bg-gov-blue-800 hover:bg-gov-blue-700 text-white text-base font-semibold py-3 mt-2 rounded-lg transition-colors"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;

