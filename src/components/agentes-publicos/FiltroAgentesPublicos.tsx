
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { TipoAgente, StatusUsuario } from "./types";

type FiltroAgentesPublicosProps = {
  busca: string;
  setBusca: (busca: string) => void;
  tipoFiltro: string;
  setTipoFiltro: (tipo: string) => void;
  statusFiltro: string;
  setStatusFiltro: (status: string) => void;
};

export const FiltroAgentesPublicos = ({
  busca,
  setBusca,
  tipoFiltro,
  setTipoFiltro,
  statusFiltro,
  setStatusFiltro
}: FiltroAgentesPublicosProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por nome ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Todos">Todos os tipos</SelectItem>
          <SelectItem value="Vereador">Vereador</SelectItem>
          <SelectItem value="Funcionario">Funcionário</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFiltro} onValueChange={setStatusFiltro}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Todos">Todos os status</SelectItem>
          <SelectItem value="Ativo">Ativo</SelectItem>
          <SelectItem value="Inativo">Inativo</SelectItem>
          <SelectItem value="Sem Acesso">Sem Acesso</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
