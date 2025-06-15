
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PautaStatus = "Em Elaboração" | "Publicada" | "Concluída";

type Props = {
  status: PautaStatus;
};

export default function TagStatusPauta({ status }: Props) {
  const statusStyles: Record<PautaStatus, string> = {
    "Em Elaboração": "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
    "Publicada": "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
    "Concluída": "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn("font-semibold text-xs", statusStyles[status])}
    >
      {status}
    </Badge>
  );
}
