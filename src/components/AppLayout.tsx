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
        {/* // ALTERAÇÃO CRÍTICA: Lógica de classes corrigida.
          // - Usa cn() para melhor legibilidade.
          // - Define ml-0 como padrão (mobile-first).
          // - Aplica md:ml-20 ou md:ml-64 apenas em telas médias ou maiores.
        */}
        <main className={cn(
          "flex-1 p-6 md:p-8 transition-all duration-300",
          "ml-0",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};