
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Documentos from "./pages/Documentos";
import Vereadores from "./pages/Vereadores";
import Comissoes from "./pages/Comissoes";
import MesaDiretora from "./pages/MesaDiretora";
import Sessoes from "./pages/Sessoes";
import Configuracoes from "./pages/Configuracoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Tela pública */}
          <Route path="/login" element={<Login />} />
          {/* Layout app protegida */}
          <Route path="/" element={<Index />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/vereadores" element={<Vereadores />} />
          <Route path="/comissoes" element={<Comissoes />} />
          <Route path="/mesa-diretora" element={<MesaDiretora />} />
          <Route path="/sessoes" element={<Sessoes />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
