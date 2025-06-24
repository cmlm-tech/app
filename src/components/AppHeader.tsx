
import { Menu, Bell, User, Cog } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const AppHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dialogoSairAberto, setDialogoSairAberto] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleConfirmLogout = async () => {
    try {
      await signOut();
      navigate("/entrar");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Extrair nome do usuário do email (parte antes do @)
  const userName = user?.email?.split('@')[0] || 'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow z-30 flex items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            aria-label="Abrir menu lateral"
          >
            <Menu className="text-gov-blue-800 w-6 h-6" />
          </button>
          <span className="font-montserrat text-xl font-bold text-gov-blue-800">
            CMLM.TECH
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative hover:bg-gray-100 p-2 rounded transition-colors" aria-label="Notificações">
            <Bell className="w-5 h-5 text-gray-500" />
          </button>
          <div className="relative">
            <button
              className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 transition-colors"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-label="Abrir menu do usuário"
            >
              <span className="text-gray-700 font-medium hidden sm:block">{userName}</span>
              <span className="bg-gov-blue-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-montserrat font-bold text-base">
                {userInitial}
              </span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 animate-fade-in">
                <ul className="py-1">
                  <li>
                    <Link
                      to="/perfil"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" /> Meu Perfil
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/configuracoes"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Cog className="w-4 h-4 mr-2" /> Configurações
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setDialogoSairAberto(true);
                      }}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                    >
                      <span>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                      </span>
                      Sair
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <AlertDialog open={dialogoSairAberto} onOpenChange={setDialogoSairAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Saída</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja sair do sistema? Você precisará fazer login novamente para acessar suas informações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout}>
              Confirmar Saída
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
