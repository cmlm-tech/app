
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Props = {
  selectedYear: string;
  onYearChange: (year: string) => void;
  anosDisponiveis: string[];
  isAdmin: boolean;
  onEditClick: () => void;
};

export default function MesaDiretoraHeader({ selectedYear, onYearChange, anosDisponiveis, isAdmin, onEditClick }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold font-montserrat text-gov-blue-800 leading-tight mb-2">
          Mesa Diretora
        </h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="periodo-select" className="text-gray-600 text-lg whitespace-nowrap">
            Exibindo composição para o período de:
          </Label>
          <Select onValueChange={onYearChange} value={selectedYear}>
            <SelectTrigger id="periodo-select" className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {anosDisponiveis.map((ano) => (
                <SelectItem key={ano} value={ano}>
                  {ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isAdmin && (
        <Button variant="default" onClick={onEditClick}>
          Editar Composição para {selectedYear}
        </Button>
      )}
    </div>
  );
}
