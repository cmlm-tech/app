import { VereadorComCondicao } from "./types";
import { CardVereadorCompacto } from "./CardVereadorCompacto";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface VereadorAvatarListProps {
  title: string;
  vereadores: VereadorComCondicao[];
  emptyMessage: string;
  liderancasMap?: Record<number, 'governo' | 'oposicao'>;
  onActionClick?: () => void;
  actionLabel?: string;
  onEndLicenca?: (vereador: VereadorComCondicao) => void; // Para encerrar licença
}

export function VereadorAvatarList({
  title,
  vereadores,
  emptyMessage,
  liderancasMap = {},
  onActionClick,
  actionLabel,
  onEndLicenca
}: VereadorAvatarListProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {title} ({vereadores.length})
        </h3>
        {onActionClick && actionLabel && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onActionClick}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            {actionLabel}
          </Button>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {vereadores.length > 0 ? (
          vereadores.map((vereador) => (
            <CardVereadorCompacto
              key={vereador.id}
              vereador={vereador}
              lideranca={liderancasMap[(vereador as any).agente_publico_id] || null}
              onEndLicenca={onEndLicenca ? () => onEndLicenca(vereador) : undefined}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}
