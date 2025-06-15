
import {
  Home,
  FileText,
  Users,
  Gavel,
  Activity,
  Calendar,
  Cog,
  LogOut
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useState } from "react";

const sidebarMenu = [
  {
    label: "Painel de Controle",
    icon: Home,
    to: "/dashboard",
    type: "link",
  },
  {
    label: "Documentos",
    icon: FileText,
    type: "menu",
    children: [
      {
        label: "Matérias",
        to: "/documentos/materias",
      },
      {
        label: "Atas",
        to: "/documentos/atas"
      }
    ],
  },
  {
    label: "Plenário",
    icon: Gavel,
    type: "menu",
    children: [
      {
        label: "Vereadores",
        to: "/plenario/vereadores"
      },
      {
        label: "Mesa Diretora",
        to: "/plenario/mesa-diretora"
      },
      {
        label: "Comissões",
        to: "/plenario/comissoes"
      }
    ],
  },
  {
    label: "Atividade Legislativa",
    icon: Activity,
    type: "menu",
    children: [
      {
        label: "Sessões",
        to: "/atividade-legislativa/sessoes"
      },
      {
        label: "Pautas",
        to: "/atividade-legislativa/pautas"
      },
      {
        label: "Legislaturas",
        to: "/atividade-legislativa/legislaturas"
      }
    ],
  }
];

export const AppSidebar = () => {
  const location = useLocation();
  // Controle do acordeão dos menus principais
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Abre automaticamente o acordeão do menu principal se a rota de filho estiver ativa
  const isSubMenuActive = (children: {to: string}[]) =>
    children.some(child => location.pathname.startsWith(child.to));

  // Alternar abertura accordion menu
  const handleMenuToggle = (label: string) => {
    setOpenMenus(prev => 
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  return (
    <nav className="fixed top-14 left-0 bottom-0 w-64 bg-gov-blue-800 text-white flex flex-col z-20 shadow-lg">
      <div className="flex-1 py-6">
        <ul className="space-y-1">
          {sidebarMenu.map((item) =>
            item.type === "link" ? (
              <li key={item.label}>
                <NavLink
                  to={item.to!}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-6 py-3 rounded-md transition-colors font-medium",
                      isActive
                        ? "bg-gov-blue-700 shadow border-l-4 border-gov-gold-500"
                        : "hover:bg-gov-blue-700/70"
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ) : (
              <li key={item.label}>
                <Accordion
                  type="multiple"
                  value={openMenus.includes(item.label) || isSubMenuActive(item.children) ? [item.label] : []}
                  onValueChange={vals => {
                    // onValueChange sempre retorna string[]
                    setOpenMenus(vals as string[]);
                  }}
                >
                  <AccordionItem value={item.label} className="border-none">
                    <AccordionTrigger
                      className={cn(
                        "flex items-center gap-3 px-6 py-3 rounded-md transition-colors font-medium text-white hover:bg-gov-blue-700/80",
                        (isSubMenuActive(item.children) || openMenus.includes(item.label)) && "bg-gov-blue-700 border-l-4 border-gov-gold-500 shadow"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        handleMenuToggle(item.label);
                      }}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-3">
                      <ul className="flex flex-col gap-1">
                        {item.children.map(sub => (
                          <li key={sub.to}>
                            <NavLink
                              to={sub.to}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center gap-2 px-8 py-2 rounded transition-colors text-sm",
                                  location.pathname.startsWith(sub.to) || isActive
                                    ? "bg-gov-blue-600 border-l-4 border-gov-gold-500 font-semibold text-white"
                                    : "hover:bg-gov-blue-700/70 text-gray-200"
                                )
                              }
                            >
                              <span>{sub.label}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </li>
            )
          )}
        </ul>
      </div>
      <div className="border-t border-gov-blue-700 py-4 px-3 flex flex-col gap-2">
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
              isActive
                ? "bg-gov-blue-700 shadow border-l-4 border-gov-gold-500"
                : "hover:bg-gov-blue-700/70"
            )
          }
        >
          <Cog className="w-5 h-5" />
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
