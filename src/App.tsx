import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import RotaProtegida from "@/components/RotaProtegida";
import RotaPublica from "@/components/RotaPublica";

// --- PÁGINAS EXISTENTES ---
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Entrar from "./pages/Entrar";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Configuracoes from "./pages/Configuracoes";
import Materias from "./pages/documentos/Materias";
import Atas from "./pages/documentos/Atas";
import AgentesPublicos from "./pages/plenario/AgentesPublicos";
import Vereadores from "./pages/plenario/Vereadores";
import SessoesLeg from "./pages/atividade-legislativa/Sessoes";
import Pautas from "./pages/atividade-legislativa/Pautas";
import Legislaturas from "./pages/atividade-legislativa/Legislaturas";
import GerenciarPauta from "./pages/atividade-legislativa/pautas/GerenciarPauta";
import DetalheLegislatura from "./pages/atividade-legislativa/DetalheLegislatura";
import DetalheComissao from "./pages/plenario/comissoes/[id]";
import Painel from "./pages/Painel";
import MeuPerfil from "./pages/MeuPerfil";

// --- PÁGINAS ANTIGAS (serão removidas ou reaproveitadas) ---
import MesaDiretoraPlenario from "./pages/plenario/MesaDiretora"; // ANTIGA
import ComissoesPlenario from "./pages/plenario/Comissoes";     // ANTIGA

// ===================================================================
// PASSO 1: Importe os novos componentes de página que você irá criar
// ===================================================================
import MesaDiretoraLegislatura from "./pages/atividade-legislativa/MesaDiretoraLegislatura";
import ComissoesLegislatura from "./pages/atividade-legislativa/ComissoesLegislatura";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* --- ROTAS PÚBLICAS (Apenas para NÃO LOGADOS) --- */}
            <Route path="/entrar" element={<RotaPublica><Entrar /></RotaPublica>} />
            <Route path="/recuperar-senha" element={<RotaPublica><RecuperarSenha /></RotaPublica>} />

            {/* --- ROTAS PÚBLICAS GERAIS (Acessíveis por todos) --- */}
            <Route path="/" element={<Index />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />

            {/* --- ROTAS PROTEGIDAS --- */}
            <Route path="/painel" element={<RotaProtegida><Painel /></RotaProtegida>} />            
            <Route path="/documentos/materias" element={<RotaProtegida><Materias /></RotaProtegida>} />
            <Route path="/documentos/atas" element={<RotaProtegida><Atas /></RotaProtegida>} />
            
            {/* Rota para o futuro módulo /plenario como arquivo */}
            <Route path="/plenario/agentes-publicos" element={<RotaProtegida><AgentesPublicos /></RotaProtegida>} />
            <Route path="/plenario/vereadores" element={<RotaProtegida><Vereadores /></RotaProtegida>} />   

            {/*
              Estas rotas antigas serão mantidas por enquanto para não quebrar nada.
              Após a migração dos links, elas poderão ser removidas.
            */}
            <Route path="/plenario/mesa-diretora" element={<RotaProtegida><MesaDiretoraPlenario /></RotaProtegida>} />
            <Route path="/plenario/comissoes" element={<RotaProtegida><ComissoesPlenario /></RotaProtegida>} />
            <Route path="/plenario/comissoes/:id" element={<RotaProtegida><DetalheComissao /></RotaProtegida>} />

            {/* --- MÓDULO DE ATIVIDADE LEGISLATIVA --- */}
            <Route path="/atividade-legislativa/sessoes" element={<RotaProtegida><SessoesLeg /></RotaProtegida>} />
            <Route path="/atividade-legislativa/pautas" element={<RotaProtegida><Pautas /></RotaProtegida>} />
            <Route path="/atividade-legislativa/pautas/:pautaId" element={<RotaProtegida><GerenciarPauta /></RotaProtegida>} />
            <Route path="/atividade-legislativa/legislaturas" element={<RotaProtegida><Legislaturas /></RotaProtegida>} />
            <Route path="/atividade-legislativa/legislaturas/:legislaturaNumero" element={<RotaProtegida><DetalheLegislatura /></RotaProtegida>} />
            
            {/* ==============================================================================================
              PASSO 2: Adicione as novas rotas aninhadas para a Mesa Diretora e Comissões
              Elas pertencem ao contexto de uma legislatura e período específicos.
             ============================================================================================== */}
            <Route 
              path="/atividade-legislativa/legislaturas/:legislaturaNumero/periodos/:periodoId/mesa-diretora" 
              element={<RotaProtegida><MesaDiretoraLegislatura /></RotaProtegida>} 
            />
            <Route 
              path="/atividade-legislativa/legislaturas/:legislaturaNumero/periodos/:periodoId/comissoes" 
              element={<RotaProtegida><ComissoesLegislatura /></RotaProtegida>} 
            />

            <Route path="/configuracoes" element={<RotaProtegida><Configuracoes /></RotaProtegida>} />
            <Route path="/perfil" element={<RotaProtegida><MeuPerfil /></RotaProtegida>} />

            {/* --- 404 --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;