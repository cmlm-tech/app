
import { Vereador } from "../vereadores/types";
import { ComposicaoMesa } from "./types";

// MOCK dos vereadores (simples, poderia ser vindo de contexto/API)
export const VEREADORES: Vereador[] = [
  {
    id: "1",
    nome: "Ana Paula Silva",
    partido: "Democratas",
    partidoLogo: "/placeholder.svg",
    cargoMesa: "Presidente",
    foto: "https://static.wikia.nocookie.net/simpsons/images/0/0b/Marge_Simpson.png",
    email: "anapaula@cmlm.tech",
    telefone: "(61) 1234-5678",
    biografia: "Advogada, atuante na defesa dos direitos humanos.",
    legislatura: "2025-2028",
    comissoes: ["Educação", "Saúde"],
  },
  {
    id: "2",
    nome: "Carlos Moura",
    partido: "Republicanos",
    partidoLogo: "/placeholder.svg",
    cargoMesa: "",
    foto: "/vereadores/bart.png",
    email: "carlos@cmlm.tech",
    telefone: "(61) 8765-4321",
    biografia: "Empresário e líder comunitário.",
    legislatura: "2025-2028",
    comissoes: ["Finanças"],
  },
  {
    id: "3",
    nome: "Lívia Rocha",
    partido: "Progressistas",
    partidoLogo: "/placeholder.svg",
    cargoMesa: "Vice-presidente",
    foto: "https://static.wikia.nocookie.net/simpsons/images/e/ec/Lisa_Simpson.png",
    email: "livia@cmlm.tech",
    telefone: "(61) 2233-4455",
    biografia: "Professora e defensora do ensino público.",
    legislatura: "2025-2028",
    comissoes: ["Educação"],
  },
  {
    id: "4",
    nome: "Roberto Lima",
    partido: "Democratas",
    partidoLogo: "/placeholder.svg",
    cargoMesa: "",
    foto: "https://static.wikia.nocookie.net/simpsons/images/0/02/Homer_Simpson_2006.png",
    email: "roberto@cmlm.tech",
    telefone: "(61) 9988-7766",
    biografia: "Servidor público e líder sindical.",
    legislatura: "2025-2028",
    comissoes: ["Transportes", "Segurança Pública"],
  },
];

// MOCK de composições por ano
export const COMPOSICOES_MESA_INICIAL: Record<string, ComposicaoMesa> = {
  "2025": {
    presidente: "1",
    vicePresidente: "3",
    primeiroSecretario: "2",
    segundoSecretario: "4",
    primeiroTesoureiro: "2",
    segundoTesoureiro: "4",
  },
  "2024": {
    presidente: "4",
    vicePresidente: "2",
    primeiroSecretario: "1",
    segundoSecretario: "3",
    primeiroTesoureiro: "1",
    segundoTesoureiro: "3",
  },
  "2023": {
    presidente: "2",
    vicePresidente: "1",
    primeiroSecretario: "3",
    segundoSecretario: "4",
    primeiroTesoureiro: "3",
    segundoTesoureiro: "4",
  },
};

export const ANOS_DISPONIVEIS = Object.keys(COMPOSICOES_MESA_INICIAL).sort((a, b) => Number(b) - Number(a));

export function getVereadorById(id: string) {
  return VEREADORES.find((v) => v.id === id) || null;
}
