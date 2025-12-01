
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import DatePickerFiltro from "./DatePickerFiltro";
import { StatusMateria, TipoMateria } from "./types";

interface Props {
  busca: string;
  setBusca: (str: string) => void;
  tipo: string;
  setTipo: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  periodo: { inicio: Date | null; fim: Date | null };
  setPeriodo: (val: { inicio: Date | null; fim: Date | null }) => void;
}

const tipos: TipoMateria[] = ["Todos", "Projeto de Lei", "Ofício", "Requerimento", "Moção"];
const statusList: StatusMateria[] = ["Todos", "Rascunho", "Protocolado", "Em análise", "Aguardando votação", "Aprovado", "Rejeitado", "Arquivado"];

export default function FiltroMaterias({
  busca, setBusca,
  tipo, setTipo,
  status, setStatus,
  periodo, setPeriodo
}: Props) {
  return (
    <div className="flex flex-wrap gap-2 items-end">
      {/* Busca */}
      <Input
        type="text"
        placeholder="Buscar por número, ementa ou autor..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        className="w-64 max-w-full"
      />
      {/* Tipo */}
      <Select value={tipo} onValueChange={setTipo}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          {tipos.map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Status */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          {statusList.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Período */}
      <DatePickerFiltro value={periodo} onChange={setPeriodo} />
    </div>
  );
}
