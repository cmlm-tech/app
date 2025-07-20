// src/components/AppLayout.tsx

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
          // Classes Estáticas: aplicadas sempre
          "flex-1 transition-all duration-300 p-6 md:p-8 ml-0",

          // **A CORREÇÃO PRINCIPAL ESTÁ AQUI**
          // Permite que o container encolha, ativando o overflow do filho.
          "min-w-0", 

          // Classes Condicionais: baseadas no estado 'isCollapsed'
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