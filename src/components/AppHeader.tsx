
import { Menu, Bell, User } from "lucide-react";
import { useState } from "react";

export const AppHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow z-30 flex items-center px-6 justify-between">
      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          aria-label="Abrir menu lateral"
          // no futuro: abrir sidebar colapsável
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
            <span className="text-gray-700 font-medium hidden sm:block">Ana Silva</span>
            <span className="bg-gov-blue-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-montserrat font-bold text-base">
              A
            </span>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-50 animate-fade-in">
              <ul className="py-1">
                <li>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                  >
                    <User className="w-4 h-4 mr-2" /> Meu Perfil
                  </a>
                </li>
                <li>
                  <a
                    href="/login"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                  >
                    <span>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" x2="9" y1="12" y2="12" />
                      </svg>
                    </span>
                    Sair
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
