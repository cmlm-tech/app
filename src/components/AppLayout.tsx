import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="flex pt-14">
        <AppSidebar 
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <main className={cn(
          "flex-1 transition-all duration-300",

          // **MELHORIA 1: Padding Responsivo (Correto!)**
          // Define um padding menor para telas pequenas (p-6) e um maior
          // para telas a partir do breakpoint 'md' (p-8).
          "p-6 md:p-8",

          // **MELHORIA 2: Margem Responsiva para o Sidebar (Correto!)**
          // Garante que no mobile a margem é zero, pois o sidebar é um overlay.
          "ml-0", 
          
          // Aplica a margem correta no desktop, ajustando-se se o
          // menu está recolhido (ml-20) ou expandido (ml-64).
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};