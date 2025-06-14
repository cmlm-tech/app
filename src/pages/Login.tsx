
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  // Simulação de login (apenas navega de volta pra home)
  const handleLogin = () => {
    // Aqui futuramente pode colocar a autenticação real
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-blue-800 px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <LogIn className="h-12 w-12 text-gov-blue-800 mb-4" aria-hidden="true" />
        <h2 className="text-2xl font-montserrat font-bold text-gov-blue-800 mb-2 text-center">
          Acesso ao Sistema
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Insira suas credenciais para acessar a plataforma cmlm.tech<br />
          (Esta tela é uma simulação.)
        </p>
        <Button
          className="w-full bg-gov-blue-800 hover:bg-gov-blue-700 text-white text-base font-semibold py-3 mt-2 rounded-lg transition-colors"
          onClick={handleLogin}
        >
          <LogIn className="mr-2 h-5 w-5" />
          Entrar
        </Button>
      </div>
    </div>
  );
};

export default Login;
