
import { VereadorComCondicao } from "./types";
import { CardVereadorCompacto } from "./CardVereadorCompacto";

interface VereadorAvatarListProps {
  title: string;
  vereadores: VereadorComCondicao[];
  emptyMessage: string;
}

export function VereadorAvatarList({ title, vereadores, emptyMessage }: VereadorAvatarListProps) {
  return (
    <div>
      <h3 className="text-lg font-medium">
        {title} ({vereadores.length})
      </h3>
      <div className="mt-4 flex flex-wrap gap-3">
        {vereadores.length > 0 ? (
          vereadores.map((vereador) => (
            <CardVereadorCompacto key={vereador.id} vereador={vereador} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}
