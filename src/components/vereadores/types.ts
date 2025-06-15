
export type Vereador = {
  id: string;
  nome: string;
  partido: string;
  partidoLogo: string;
  cargoMesa?: string;
  foto: string;
  email: string;
  telefone: string;
  biografia: string;
  legislatura: string;
  comissoes: string[];
};

export const PARTIDOS = [
  { nome: "Democratas", logo: "/partidos/democratas.png" },
  { nome: "Republicanos", logo: "/partidos/republicanos.png" },
  { nome: "Progressistas", logo: "/partidos/progressistas.png" },
  { nome: "Todos", logo: "" },
];

export const COMISSOES = [
  "Educação",
  "Saúde",
  "Finanças",
  "Transportes",
  "Segurança Pública",
  "Todos",
];

export const CARGOS_MESA = [
  "Nenhum",
  "Presidente",
  "Vice-presidente",
  "1º Secretário",
  "2º Secretário",
];

