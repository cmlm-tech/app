
export type StatusMateria =
  | "Todos"
  | "Protocolado"
  | "Em análise"
  | "Aguardando votação"
  | "Aprovado"
  | "Rejeitado"
  | "Arquivado"
  | "Rascunho";

export type TipoMateria =
  | "Projeto de Lei"
  | "Ofício"
  | "Requerimento"
  | "Moção"
  | "Todos";

export interface Materia {
  id: string;
  protocolo: string;
  tipo: TipoMateria;
  ementa: string;
  autor: string;
  dataProtocolo: Date;
  status: StatusMateria;
  destinatario?: string;
  cargo?: string;
  orgao?: string;
}
