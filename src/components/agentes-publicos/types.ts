
export type TipoAgente = 'Vereador' | 'Funcionário';
export type TipoVinculo = 'Efetivo' | 'Comissionado' | 'Contratado' | 'Terceirizado';
export type StatusUsuario = 'Ativo' | 'Inativo' | 'Sem Acesso';

export type AgentePublico = {
  id: string;
  nomeCompleto: string;
  cpf: string;
  foto: string;
  tipo: TipoAgente;
  statusUsuario: StatusUsuario;
  // Campos específicos para Vereador
  nomeParlamantar?: string;
  perfil?: string;
  // Campos específicos para Funcionário
  cargo?: string;
  tipoVinculo?: TipoVinculo;
  dataAdmissao?: string;
  dataExoneracao?: string;
};

export const TIPOS_AGENTE: TipoAgente[] = ['Vereador', 'Funcionário'];
export const TIPOS_VINCULO: TipoVinculo[] = ['Efetivo', 'Comissionado', 'Contratado', 'Terceirizado'];
export const STATUS_USUARIO: StatusUsuario[] = ['Ativo', 'Inativo', 'Sem Acesso'];
