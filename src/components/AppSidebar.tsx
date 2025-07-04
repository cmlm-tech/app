
import {
  Home,
  FileText,
  Users,
  Gavel,
  Activity,
  Calendar,
  Cog,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarMenu = [
  {
    label: "Painel de Controle",
    icon: Home,
    to: "/painel",
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
        label: "Agentes Públicos",
        to: "/plenario/agentes-publicos"
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

type AppSidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
};

export const AppSidebar = ({ 
  isCollapsed, 
  setIsCollapsed, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [dialogoSairAberto, setDialogoSairAberto] = useState(false);

  // Abre automaticamente o acordeão do menu principal se a rota de filho estiver ativa
  const isSubMenuActive = (children: {to: string}[]) =>
    children.some(child => location.pathname.startsWith(child.to));

  // Alternar abertura accordion menu
  const handleMenuToggle = (label: string) => {
    if (isCollapsed) return; // Não permitir toggle quando colapsado
    setOpenMenus(prev => 
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  const handleConfirmLogout = async () => {
    try {
      await signOut();
      navigate("/entrar");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const SidebarLink = ({ item, isCollapsed }: { item: any, isCollapsed: boolean }) => {
    const content = (
      <NavLink
        to={item.to!}
        onClick={handleMobileNavClick}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-6 py-3 rounded-md transition-colors font-medium",
            isActive
              ? "bg-gov-blue-700 shadow border-l-4 border-gov-gold-500"
              : "hover:bg-gov-blue-700/70",
            isCollapsed && "justify-center px-3"
          )
        }
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && <span>{item.label}</span>}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const SidebarMenuGroup = ({ item, isCollapsed }: { item: any, isCollapsed: boolean }) => {
    const isActive = isSubMenuActive(item.children);
    
    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center justify-center px-3 py-3 rounded-md cursor-pointer",
              isActive && "bg-gov-blue-700 border-l-4 border-gov-gold-500 shadow"
            )}>
              <item.icon className="w-5 h-5" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div>
              <p className="font-semibold">{item.label}</p>
              <div className="mt-1 space-y-1">
                {item.children.map((sub: any) => (
                  <p key={sub.to} className="text-sm">{sub.label}</p>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Accordion
        type="multiple"
        value={openMenus.includes(item.label) || isActive ? [item.label] : []}
        onValueChange={vals => {
          setOpenMenus(vals as string[]);
        }}
      >
        <AccordionItem value={item.label} className="border-none">
          <AccordionTrigger
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-md transition-colors font-medium text-white hover:bg-gov-blue-700/80",
              (isActive || openMenus.includes(item.label)) && "bg-gov-blue-700 border-l-4 border-gov-gold-500 shadow"
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
              {item.children.map((sub: any) => (
                <li key={sub.to}>
                  <NavLink
                    to={sub.to}
                    onClick={handleMobileNavClick}
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
    );
  };

  return (
    <TooltipProvider>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={cn(
        "fixed top-14 left-0 bottom-0 bg-gov-blue-800 text-white flex flex-col shadow-lg transition-all duration-300 z-50",
        // Mobile styles
        "md:block",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        // Desktop styles
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex-1 py-6">
          <ul className="space-y-1">
            {sidebarMenu.map((item) =>
              item.type === "link" ? (
                <li key={item.label}>
                  <SidebarLink item={item} isCollapsed={isCollapsed} />
                </li>
              ) : (
                <li key={item.label}>
                  <SidebarMenuGroup item={item} isCollapsed={isCollapsed} />
                </li>
              )
            )}
          </ul>
        </div>

        {/* Footer com controles */}
        <div className="border-t border-gov-blue-700 py-4 px-3 flex flex-col gap-2">
          {/* Botão de colapsar - apenas no desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center p-2 rounded-md transition-colors hover:bg-gov-blue-700/70 mb-2"
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>

          {/* Configurações */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/configuracoes"
                  onClick={handleMobileNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-center p-2 rounded-md transition-colors",
                      isActive
                        ? "bg-gov-blue-700 shadow border-l-4 border-gov-gold-500"
                        : "hover:bg-gov-blue-700/70"
                    )
                  }
                >
                  <Cog className="w-5 h-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Configurações</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <NavLink
              to="/configuracoes"
              onClick={handleMobileNavClick}
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
          )}

          {/* Sair */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setDialogoSairAberto(true)}
                  className="flex items-center justify-center p-2 rounded-md transition-colors hover:bg-gov-blue-700/70"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Sair</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => setDialogoSairAberto(true)}
              className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm hover:bg-gov-blue-700/70 w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          )}
        </div>
      </nav>

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
    </TooltipProvider>
  );
};
