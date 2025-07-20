// src/components/atas/FiltroAtas.tsx

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Search } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ... (interface e props permanecem os mesmos)
interface FiltroAtasProps {
  busca: string;
  setBusca: (value: string) => void;
  tipoSessao: string;
  setTipoSessao: (value: string) => void;
  periodo: DateRange | undefined;
  setPeriodo: (value: DateRange | undefined) => void;
}


export default function FiltroAtas({ busca, setBusca, tipoSessao, setTipoSessao, periodo, setPeriodo }: FiltroAtasProps) {
  return (
    // ALTERAÇÃO: Trocamos 'sm:flex-row' por 'lg:flex-row' e adicionamos 'flex-col' como padrão.
    // Isso faz com que os filtros fiquem empilhados em telas pequenas e médias.
    <div className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Pesquisar resumo..."
          className="pl-9"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      {/* ALTERAÇÃO: Removemos a largura fixa 'sm:w-[180px]' para que o select ocupe toda a largura
          em telas pequenas, e adicionamos uma largura fixa para telas grandes 'lg:w-[180px]' */}
      <Select value={tipoSessao} onValueChange={setTipoSessao}>
        <SelectTrigger className="w-full lg:w-[180px]">
          <SelectValue placeholder="Tipo de Sessão" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Todas">Todos os Tipos</SelectItem>
          <SelectItem value="Ordinária">Ordinária</SelectItem>
          <SelectItem value="Extraordinária">Extraordinária</SelectItem>
          <SelectItem value="Solene">Solene</SelectItem>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          {/* ALTERAÇÃO: Mesma lógica do select, largura total em telas pequenas. */}
          <Button variant="outline" className="w-full lg:w-[240px] justify-start text-left font-normal">
            {periodo?.from ? (
              `${format(periodo.from, "dd/MM/yy", { locale: ptBR })} - ${periodo.to ? format(periodo.to, "dd/MM/yy", { locale: ptBR }) : ""}`
            ) : (
              <span>Selecione o período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={periodo}
            onSelect={setPeriodo}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}