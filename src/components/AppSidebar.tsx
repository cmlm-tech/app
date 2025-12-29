
import {
  Home,
  FileText,
  Gavel,
  Activity,
  Cog,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface SubMenuItem {
  label: string;
  to: string;
}

interface MenuItem {
  label: string;
  icon: React.ElementType;
  to?: string;
  type: 'link' | 'menu';
  children?: SubMenuItem[];
}

const sidebarMenu: MenuItem[] = [
  { label: "Painel de Controle", icon: Home, to: "/painel", type: "link" },
  { label: "Documentos", icon: FileText, type: "menu", children: [{ label: "Matérias", to: "/documentos/materias" }, { label: "Atas", to: "/documentos/atas" }] },
  { label: "Plenário", icon: Gavel, type: "menu", children: [{ label: "Agentes Públicos", to: "/plenario/agentes-publicos" }, { label: "Vereadores", to: "/plenario/vereadores" }, { label: "Mesa Diretora", to: "/plenario/mesa-diretora" }, { label: "Comissões", to: "/plenario/comissoes" }] },
  { label: "Atividade Legislativa", icon: Activity, type: "menu", children: [{ label: "Sessões", to: "/atividade-legislativa/sessoes" }, { label: "Legislaturas", to: "/atividade-legislativa/legislaturas" }] }
];

type AppSidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
};

export const AppSidebar = ({ isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [dialogoSairAberto, setDialogoSairAberto] = useState(false);

  const isSubMenuActive = (children: SubMenuItem[] = []) => children.some(child => location.pathname.startsWith(child.to));

  const handleMenuToggle = (label: string) => {
    if (isCollapsed) return;
    setOpenMenus(prev => prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]);
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
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const SidebarLink = ({ item }: { item: MenuItem }) => {
    const content = (
      <NavLink
        to={item.to!}
        onClick={handleMobileNavClick}
        className={({ isActive }) => {
          if (isCollapsed) {
            return cn(
              "relative flex items-center justify-center w-full px-3 py-3 rounded-md transition-colors",
              isActive
                ? "bg-gov-blue-700 shadow before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gov-gold-500 before:rounded-r-full"
                : "hover:bg-gov-blue-700/70"
            );
          }
          return cn(
            "relative flex items-center gap-3 px-3 py-3 rounded-md transition-colors font-medium w-full",
            isActive
              ? "bg-gov-blue-700 shadow before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gov-gold-500 before:rounded-r-full"
              : "hover:bg-gov-blue-700/70"
          );
        }}
      >
        <item.icon className="w-5 h-5" />
        {!isCollapsed && <span>{item.label}</span>}
      </NavLink>
    );
    return isCollapsed ? <Tooltip><TooltipTrigger asChild>{content}</TooltipTrigger><TooltipContent side="right"><p>{item.label}</p></TooltipContent></Tooltip> : content;
  };

  const SidebarMenuGroup = ({ item }: { item: MenuItem }) => {
    const isActive = isSubMenuActive(item.children);

    if (isCollapsed) {
      return (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <div className={cn("relative flex items-center justify-center w-full px-3 py-3 rounded-md cursor-pointer hover:bg-gov-blue-700/70", isActive && "bg-gov-blue-700 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gov-gold-500 before:rounded-r-full shadow")}>
                  <item.icon className="w-5 h-5" />
                </div>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right"><p>{item.label}</p></TooltipContent>
          </Tooltip>
          <DropdownMenuContent side="right" align="start" className="ml-2">
            <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {item.children?.map((sub) => (
              <DropdownMenuItem key={sub.to} asChild>
                <NavLink to={sub.to} onClick={handleMobileNavClick}>{sub.label}</NavLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Accordion type="multiple" value={openMenus.includes(item.label) || isActive ? [item.label] : []} onValueChange={(vals) => { setOpenMenus(vals as string[]); }}>
        <AccordionItem value={item.label} className="border-none">
          <AccordionTrigger
            className={cn(
              "relative flex items-center gap-3 px-3 py-3 rounded-md transition-colors font-medium text-white hover:bg-gov-blue-700/80 hover:no-underline w-full",
              (isActive || openMenus.includes(item.label)) && "bg-gov-blue-700 shadow before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gov-gold-500 before:rounded-r-full"
            )}
            onClick={(e) => { e.preventDefault(); handleMenuToggle(item.label); }}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </AccordionTrigger>
          <AccordionContent className="pl-3">
            <ul className="flex flex-col gap-1">
              {item.children?.map((sub) => (
                <li key={sub.to}>
                  <NavLink to={sub.to} onClick={handleMobileNavClick} className={({ isActive: subIsActive }) => cn("flex items-center gap-2 px-8 py-2 rounded transition-colors text-sm", subIsActive ? "bg-gov-blue-600 border-l-4 border-gov-gold-500 font-semibold text-white" : "hover:bg-gov-blue-700/70 text-gray-200")}>
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
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
      <nav className={cn("fixed top-14 left-0 bottom-0 bg-gov-blue-800 text-white flex flex-col shadow-lg transition-all duration-300 z-50", isMobileMenuOpen ? "translate-x-0" : "-translate-x-full", "md:translate-x-0", isCollapsed ? "w-20" : "w-64")}>
        <div className="flex-1 py-6 space-y-1 overflow-y-auto">
          <ul className="list-none p-0 m-0 px-3">
            {sidebarMenu.map((item) => <li key={item.label}>{item.type === "link" ? <SidebarLink item={item} /> : <SidebarMenuGroup item={item} />}</li>)}
          </ul>
        </div>
        <div className="border-t border-gov-blue-700 p-4 space-y-3">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex items-center justify-center w-full p-2 rounded-md transition-colors hover:bg-gov-blue-700/70" title={isCollapsed ? "Expandir menu" : "Recolher menu"}>
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5" /> <span className="ml-2">Recolher</span></>}
          </button>

          {/* Configurações */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/configuracoes"
                  className={({ isActive }) => cn(
                    "relative flex items-center justify-center w-full px-3 py-3 rounded-md transition-colors hover:bg-gov-blue-700/70",
                    isActive && "bg-gov-blue-700 shadow before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gov-gold-500 before:rounded-r-full"
                  )}
                >
                  <Cog className="w-5 h-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Configurações</p></TooltipContent>
            </Tooltip>
          ) : (
            <NavLink
              to="/configuracoes"
              className={({ isActive }) => cn(
                "relative flex items-center gap-3 px-3 py-3 rounded-md transition-colors font-medium w-full",
                isActive
                  ? "bg-gov-blue-700 shadow before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gov-gold-500 before:rounded-r-full"
                  : "hover:bg-gov-blue-700/70"
              )}
            >
              <Cog className="w-5 h-5" />
              <span>Configurações</span>
            </NavLink>
          )}

          {/* Sair */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setDialogoSairAberto(true)}
                  className="flex items-center justify-center w-full px-3 py-3 rounded-md transition-colors hover:bg-gov-blue-700/70"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Sair</p></TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => setDialogoSairAberto(true)}
              className="flex items-center gap-3 px-3 py-3 rounded-md transition-colors hover:bg-gov-blue-700/70 w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
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
