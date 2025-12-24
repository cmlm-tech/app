import { StatusSessao } from "@/services/sessoesService";

type Props = {
  status: StatusSessao;
};

const statusConfig: Record<StatusSessao, { color: string; label: string }> = {
  "Agendada": {
    color: "bg-gov-blue-200 text-gov-blue-800",
    label: "Agendada"
  },
  "Em Andamento": {
    color: "bg-amber-100 text-amber-700 animate-pulse",
    label: "Em Andamento"
  },
  "Realizada": {
    color: "bg-emerald-100 text-emerald-700",
    label: "Realizada"
  },
  "Cancelada": {
    color: "bg-red-100 text-red-700",
    label: "Cancelada"
  },
  "Adiada": {
    color: "bg-orange-100 text-orange-700",
    label: "Adiada"
  },
  "Suspensa": {
    color: "bg-purple-100 text-purple-700",
    label: "Suspensa"
  },
};

export default function TagStatusSessao({ status }: Props) {
  const config = statusConfig[status] || { color: "bg-gray-100 text-gray-700", label: status };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}
