
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Props {
  value: {inicio: Date|null; fim: Date|null};
  onChange: (v: {inicio: Date|null; fim: Date|null}) => void;
}

export default function DatePickerFiltro({ value, onChange }: Props) {
  const [open, setOpen] = React.useState(false);

  function handleSelect(range: { from?: Date; to?: Date }) {
    onChange({ inicio: range.from || null, fim: range.to || null });
  }

  let label = "Período";
  if (value.inicio && value.fim) label = `${format(value.inicio, "dd/MM/yyyy")} - ${format(value.fim, "dd/MM/yyyy")}`;
  else if (value.inicio) label = `de ${format(value.inicio, "dd/MM/yyyy")}`;
  else if (value.fim) label = `até ${format(value.fim, "dd/MM/yyyy")}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("flex w-[200px] justify-between text-left")}
        >
          <span>{label}</span>
          <CalendarIcon className="ml-2 w-4 h-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50" align="start">
        <Calendar
          mode="range"
          selected={{from: value.inicio ?? undefined, to: value.fim ?? undefined }}
          onSelect={handleSelect}
          className="p-3 pointer-events-auto"
          initialFocus
        />
        <div className="flex gap-2 justify-end px-3 pb-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => { onChange({inicio:null,fim:null}); setOpen(false); }}
          >
            Limpar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
