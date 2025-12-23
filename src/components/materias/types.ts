export type StatusMateria =
  | "Todos"
  | "Protocolado"
  | "Em análise"
  | "Aguardando votação"
  | "Aprovado"
  | "Rejeitado"
  | "Arquivado"
  | "Rascunho"
  | "Aguardando Deliberação";

export type TipoMateria =
  | "Projeto de Lei"
  | "Ofício"
  | "Requerimento"
  | "Moção"
  | "Projeto de Decreto Legislativo"
  | "Indicação"
  | "Todos";

export interface Materia {
  id: string;
  protocolo: string;
  tipo: TipoMateria;
  ementa: string;
  autor: string;
  autorId?: number;
  autorTipo?: string;
  dataProtocolo: Date;
  status: StatusMateria;
  destinatario?: string;
  cargo?: string;
  orgao?: string;
}

// --- tipar o retorno da Procedure SQL ---
export interface RetornoProtocolo {
  documento_id: number;
  protocolo_geral: number;
  mensagem: string;
}