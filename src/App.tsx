
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Documentos from "./pages/Documentos";
import Configuracoes from "./pages/Configuracoes";
import Dashboard from "./pages/Dashboard";
import Materias from "./pages/documentos/Materias";
import Atas from "./pages/documentos/Atas";
import VereadoresPlenario from "./pages/plenario/Vereadores";
import MesaDiretoraPlenario from "./pages/plenario/MesaDiretora";
// import ComissoesPlenario from "./pages/plenario/Comissoes"; // Rota removida
import SessoesLeg from "./pages/atividade-legislativa/Sessoes";
import Pautas from "./pages/atividade-legislativa/Pautas";
import Legislaturas from "./pages/atividade-legislativa/Legislaturas";
import GerenciarPauta from "./pages/atividade-legislativa/pautas/GerenciarPauta";
import DetalheLegislatura from "./pages/atividade-legislativa/DetalheLegislatura";
import DetalheComissao from "./pages/plenario/comissoes/[id]";
import Painel from "./pages/Painel";

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
          <Route path="/painel" element={<Painel />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/documentos/materias" element={<Materias />} />
          <Route path="/documentos/atas" element={<Atas />} />
          <Route path="/plenario/vereadores" element={<VereadoresPlenario />} />
          <Route path="/plenario/mesa-diretora" element={<MesaDiretoraPlenario />} />
          {/* <Route path="/plenario/comissoes" element={<ComissoesPlenario />} /> */}
          <Route path="/plenario/comissoes/:id" element={<DetalheComissao />} />
          <Route path="/atividade-legislativa/sessoes" element={<SessoesLeg />} />
          <Route path="/atividade-legislativa/pautas" element={<Pautas />} />
          <Route path="/atividade-legislativa/pautas/:pautaId" element={<GerenciarPauta />} />
          <Route path="/atividade-legislativa/legislaturas" element={<Legislaturas />} />
          <Route path="/atividade-legislativa/legislaturas/:legislaturaId" element={<DetalheLegislatura />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
