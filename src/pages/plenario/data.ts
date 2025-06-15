
// Mocks compartilhados para comissões e vereadores
export const vereadoresMock = [
  {
    id: "1",
    nome: "Ana Souza",
    partido: "Democratas",
    foto: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    id: "2",
    nome: "Carlos Lima",
    partido: "Republicanos",
    foto: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    id: "3",
    nome: "Beatriz Pereira",
    partido: "Progressistas",
    foto: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: "4",
    nome: "Paulo Silva",
    partido: "PSD",
    foto: "https://randomuser.me/api/portraits/men/44.jpg",
  },
  {
    id: "5",
    nome: "Lucas Gama",
    partido: "Republicanos",
    foto: "https://randomuser.me/api/portraits/men/92.jpg",
  },
];

export const COMISSOES_MOCK = [
  {
    id: "c2",
    nome: "Comissão de Finanças e Orçamento",
    competencias: "Emitir parecer sobre todos os assuntos de caráter financeiro especialmente sobre: I - A proposta Orçamentária; II - Projetos que fixem vencimentos do funcionalismo; III - Concessão de subvenções; IV - Legislação tributária municipal; V - Outros assuntos de caráter financeiro.",
    membros: [
      { papel: "presidente", id: "4" },
      { papel: "relator", id: "1" },
      { papel: "membro", id: "2" },
      { papel: "membro", id: "5" },
    ],
  },
  {
    id: "c1",
    nome: "Comissão de Constituição, Justiça e Redação",
    competencias: "Analisa projetos, emendas e matérias quanto à constitucionalidade, legalidade, jurídico, gramatical e lógica.",
    membros: [
      { papel: "presidente", id: "2" },
      { papel: "relator", id: "3" },
      { papel: "membro", id: "1" },
    ],
  },
];
