
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Gavel } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center relative overflow-hidden p-4">
      <Gavel
        className="absolute w-96 h-96 sm:w-[500px] sm:h-[500px] text-gray-200/60 -rotate-12 transform-gpu pointer-events-none"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-[12rem] leading-none font-montserrat font-extrabold text-gov-blue-800/10 select-none">
          404
        </div>
        <h1 className="text-4xl font-bold text-gov-blue-800 -mt-16">
          Página Não Encontrada
        </h1>
        <p className="text-lg text-gray-600 mt-4 max-w-md mx-auto">
          "Não havendo mais nada a tratar, a sessão está encerrada."
        </p>
        <Button asChild className="mt-8 text-base font-semibold py-3 px-6">
          <Link to="/">Voltar ao Painel Principal</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
