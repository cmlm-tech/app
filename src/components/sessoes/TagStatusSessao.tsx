
type Props = {
  status: "Agendada" | "Realizada" | "Cancelada";
};
export default function TagStatusSessao({ status }: Props) {
  let color = "bg-gov-blue-200 text-gov-blue-800";
  if (status === "Realizada") color = "bg-emerald-100 text-emerald-700";
  if (status === "Cancelada") color = "bg-red-100 text-red-700";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}
