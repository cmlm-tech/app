
import { useState } from "react";
import { Cloud, Send, Loader2, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-fixed"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80')`,
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
              Recuperar Acesso
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Digite seu e-mail para receber as instruções de recuperação de senha.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start space-x-3 mb-6 animate-fade-in">
              <div className="bg-red-100 p-1 rounded-full shrink-0">
                <span className="text-red-600 text-sm block px-1.5 font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm font-medium leading-tight pt-0.5">
                {error}
              </p>
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start space-x-3 mb-6 animate-fade-in">
              <div className="bg-green-100 p-1 rounded-full shrink-0">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-green-700 text-sm font-medium leading-tight pt-0.5">
                {message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                E-mail ou Matrícula
              </Label>
              <Input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                placeholder="ex: nome@camara.leg.br"
                className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-gov-blue-500 transition-all rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gov-blue-800 to-gov-blue-600 hover:from-gov-blue-900 hover:to-gov-blue-700 text-white text-lg font-semibold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Enviar Link
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center pt-2 border-t border-gray-100">
            <RouterLink
              to="/entrar"
              className="text-sm text-gray-500 hover:text-gov-blue-700 flex items-center justify-center gap-2 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Voltar para o login
            </RouterLink>
          </div>
        </div>

        <p className="text-center text-blue-200/80 text-sm mt-8 font-light">
          &copy; {new Date().getFullYear()} Câmara Municipal de Lavras da Mangabeira
        </p>
      </div>
    </div>
  );
};
import { Check } from "lucide-react";

export default RecuperarSenha;
