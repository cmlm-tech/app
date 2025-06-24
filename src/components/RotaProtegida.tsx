
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface RotaProtegidaProps {
  children: React.ReactNode;
}

const RotaProtegida: React.FC<RotaProtegidaProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Se ainda está carregando, mostra o loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-gov-blue-800" />
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário logado, redireciona para login
  if (!user) {
    return <Navigate to="/entrar" replace />;
  }

  // Se há usuário logado, renderiza o componente filho
  return <>{children}</>;
};

export default RotaProtegida;
