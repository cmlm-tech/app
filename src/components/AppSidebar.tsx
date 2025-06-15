
import {
  Dashboard,
  Document,
  Users,
  Calendar,
  Gear,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navLinks = [
  {
    to: "/",
    label: "Dashboard",
    icon: Dashboard,
  },
  {
    to: "/documentos",
    label: "Documentos",
    icon: Document,
  },
  {
    to: "/vereadores",
    label: "Vereadores",
    icon: Users,
  },
  {
    to: "/comissoes",
    label: "Comissões",
    icon: Users,
  },
  {
    to: "/mesa-diretora",
    label: "Mesa Diretora",
    icon: Users,
  },
  {
    to: "/sessoes",
    label: "Sessões",
    icon: Calendar,
  },
];

export const AppSidebar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-14 left-0 bottom-0 w-60 bg-gov-blue-800 text-white flex flex-col z-20 shadow-lg">
      <div className="flex-1 py-6">
        <ul className="space-y-1">
          {navLinks.map((item) => {
            const active = location.pathname === item.to;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-5 py-3 rounded-md transition-colors font-medium",
                      active || isActive
                        ? "bg-gov-blue-700 shadow border-l-4 border-gov-gold-500"
                        : "hover:bg-gov-blue-700/70",
                    ].join(" ")
                  }
                  end={item.to === "/"}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="border-t border-gov-blue-700 py-4 px-3 flex flex-col gap-2">
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            [
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
              isActive
                ? "bg-gov-blue-700 shadow border-l-4 border-gov-gold-500"
                : "hover:bg-gov-blue-700/70",
            ].join(" ")
          }
        >
          <Gear className="w-5 h-5" />
          Configurações
        </NavLink>
        <a
          href="/login"
          className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm hover:bg-gov-blue-700/70"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </a>
      </div>
    </nav>
  );
};
