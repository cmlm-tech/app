
import { Database } from '@/lib/database.types';

// Tipos reais, derivados diretamente do seu banco de dados!
export type LegislaturaRow = Database['public']['Tables']['legislaturas']['Row'];
export type PeriodoRow = Database['public']['Tables']['periodossessao']['Row'];
export type AgentePublicoRow = Database['public']['Tables']['agentespublicos']['Row'];
export type LegislaturaVereadorRow = Database['public']['Tables']['legislaturavereadores']['Row'];

// Tipo customizado para usar no estado do componente, combinando a legislatura com seus períodos
export type LegislaturaComPeriodos = LegislaturaRow & {
  periodos: PeriodoRow[];
};

export type VereadorComCondicao = AgentePublicoRow & {
  condicao: LegislaturaVereadorRow['condicao'];
  data_posse: LegislaturaVereadorRow['data_posse'];
  data_afastamento: LegislaturaVereadorRow['data_afastamento'];
  nome_parlamentar: string | null;
  id: LegislaturaVereadorRow['id'];
  vereadores: AgentePublicoRow
};
