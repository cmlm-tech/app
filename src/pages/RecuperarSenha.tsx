
import { useState } from "react";
import { Cloud, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link as RouterLink } from "react-router-dom";
import { supabase } from '@/lib/supabaseClient';;

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://cmlm.tech/redefinir-senha'
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Se este e-mail estiver cadastrado, um link de recuperação foi enviado para sua caixa de entrada.");
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-blue-800 px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <Cloud className="h-12 w-12 text-gov-blue-800 mb-5" aria-hidden="true" />
        <h1 className="text-2xl font-montserrat font-bold text-gov-blue-800 mb-4 text-center">
          Recuperar Acesso
        </h1>
        <p className="text-gray-600 text-center mb-8 leading-relaxed">
          Digite seu e-mail de cadastro. Se ele for encontrado em nosso sistema, enviaremos um link para você criar uma nova senha.
        </p>

        {error && (
          <Alert variant="destructive" className="mb-4 w-full">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="mb-4 w-full border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <Label htmlFor="email" className="mb-1 block text-gray-700">
              E-mail funcional ou Matrícula
            </Label>
            <Input
              id="email"
              name="email"
              type="text"
              autoComplete="email"
              placeholder="Digite seu e-mail ou matrícula"
              className="mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gov-blue-800 hover:bg-gov-blue-700 text-white text-base font-semibold py-3 mt-2 rounded-lg transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Enviar Link de Recuperação
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <RouterLink
            to="/entrar"
            className="text-sm text-gov-blue-700 hover:text-gov-blue-800 font-medium transition-colors"
          >
            ← Voltar para o login
          </RouterLink>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;
