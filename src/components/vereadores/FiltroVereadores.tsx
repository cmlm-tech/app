
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { PARTIDOS, COMISSOES } from "./types";

type Props = {
  busca: string;
  setBusca: (s: string) => void;
  partido: string;
  setPartido: (s: string) => void;
  comissao: string;
  setComissao: (s: string) => void;
};

export default function FiltroVereadores({
  busca, setBusca, partido, setPartido, comissao, setComissao,
}: Props) {
  return (
    <div className="flex gap-2 flex-wrap justify-end items-end">
      <Input
        placeholder="Buscar vereador por nome..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        className="w-64 max-w-full"
      />
      <Select value={partido} onValueChange={setPartido}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Partido" /></SelectTrigger>
        <SelectContent>
          {PARTIDOS.map((p) => (
            <SelectItem key={p.nome} value={p.nome}>{p.nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={comissao} onValueChange={setComissao}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Comissão" /></SelectTrigger>
        <SelectContent>
          {COMISSOES.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
