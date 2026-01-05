import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Legislatura = {
  id: number;
  numero: number;
  data_inicio: string;
  data_fim: string;
};

type Periodo = {
  id: number;
  numero: number;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
};

type Props = {
  legislaturas: Legislatura[];
  periodos: Periodo[];
  legislaturaSelecionada?: number;
  periodoSelecionado?: number;
  onLegislaturaChange: (legislaturaId: number) => void;
  onPeriodoChange: (periodoId: number) => void;
};

export default function MesaDiretoraHeader({
  legislaturas,
  periodos,
  legislaturaSelecionada,
  periodoSelecionado,
  onLegislaturaChange,
  onPeriodoChange
}: Props) {
  const formatarAno = (data: string) => new Date(data).getFullYear();

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-4">
        {/* Dropdown de Legislaturas */}
        <div className="flex items-center gap-2">
          <Label htmlFor="legislatura-select" className="text-gray-600 whitespace-nowrap">
            Legislatura:
          </Label>
          <Select
            value={legislaturaSelecionada?.toString()}
            onValueChange={(value) => onLegislaturaChange(Number(value))}
          >
            <SelectTrigger id="legislatura-select" className="w-[200px]">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {legislaturas.map((leg) => (
                <SelectItem key={leg.id} value={leg.id.toString()}>
                  {formatarAno(leg.data_inicio)}-{formatarAno(leg.data_fim)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-gray-400">•</span>

        {/* Dropdown de Períodos */}
        <div className="flex items-center gap-2">
          <Label htmlFor="periodo-select" className="text-gray-600 whitespace-nowrap">
            Período:
          </Label>
          <Select
            value={periodoSelecionado?.toString()}
            onValueChange={(value) => onPeriodoChange(Number(value))}
            disabled={!legislaturaSelecionada || periodos.length === 0}
          >
            <SelectTrigger id="periodo-select" className="w-[160px]">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {periodos.map((per) => (
                <SelectItem key={per.id} value={per.id.toString()}>
                  {per.descricao || `${per.numero}º Período`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
