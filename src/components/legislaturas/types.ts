import { Database } from '@/lib/database.types';

// Tipos reais, derivados diretamente do seu banco de dados!
export type LegislaturaRow = Database['public']['Tables']['legislaturas']['Row'];
export type PeriodoRow = Database['public']['Tables']['periodossessao']['Row'];
export type AgentePublicoRow = Database['public']['Tables']['agentespublicos']['Row'];

// Tipo customizado para usar no estado do componente, combinando a legislatura com seus períodos
export type LegislaturaComPeriodos = LegislaturaRow & {
  periodos: PeriodoRow[];
};