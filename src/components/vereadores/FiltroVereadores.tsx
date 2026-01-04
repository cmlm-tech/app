import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { getPartidos } from "@/services/partidosService";
import { getLegislaturas } from "@/services/vereadoresService";

type Partido = {
  id: number;
  sigla: string;
  nome_completo: string;
};

type Legislatura = {
  id: number;
  numero: number;
  data_inicio: string;
  data_fim: string;
  descricao: string | null;
};

type Props = {
  busca: string;
  setBusca: (s: string) => void;
  partido: string;
  setPartido: (s: string) => void;
  legislaturaId: number | null;
  setLegislaturaId: (id: number | null) => void;
};

export default function FiltroVereadores({
  busca,
  setBusca,
  partido,
  setPartido,
  legislaturaId,
  setLegislaturaId,
}: Props) {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [legislaturas, setLegislaturas] = useState<Legislatura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [partidosData, legislaturasData] = await Promise.all([
          getPartidos(true), // apenas ativos
          getLegislaturas(),
        ]);

        setPartidos(partidosData || []);
        setLegislaturas(legislaturasData || []);
      } catch (error) {
        console.error('Erro ao carregar filtros:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  const formatarPeriodo = (dataInicio: string, dataFim: string) => {
    const inicio = new Date(dataInicio).getFullYear();
    const fim = new Date(dataFim).getFullYear();
    return `${inicio}-${fim}`;
  };

  return (
    <div className="flex gap-2 flex-wrap justify-end items-end">
      <Input
        placeholder="Buscar vereador por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-64 max-w-full"
      />

      <Select
        value={legislaturaId?.toString() || "todas"}
        onValueChange={(value) => {
          setLegislaturaId(value === "todas" ? null : parseInt(value));
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Legislatura" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas</SelectItem>
          {legislaturas.map((leg) => (
            <SelectItem key={leg.id} value={leg.id.toString()}>
              {leg.descricao || formatarPeriodo(leg.data_inicio, leg.data_fim)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={partido} onValueChange={setPartido} disabled={loading}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Partido" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Todos">Todos</SelectItem>
          {partidos.map((p) => (
            <SelectItem key={p.id} value={p.sigla}>
              {p.sigla}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
