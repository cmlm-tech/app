
export type PeriodoStatus = "Em andamento" | "Concluído" | "Futuro";

export interface PeriodoLegislativo {
  id: string;
  ano: number;
  status: PeriodoStatus;
  presidenteId?: string;
}

export interface Legislatura {
  id: string;
  anoInicio: number;
  anoFim: number;
  periodos: PeriodoLegislativo[];
}

