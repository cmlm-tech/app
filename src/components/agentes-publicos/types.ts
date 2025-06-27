
export type TipoAgente = 'Vereador' | 'Funcionario'; // Removido acento para coincidir com o banco
export type TipoVinculo = 'Efetivo' | 'Comissionado' | 'Terceirizado'; // Removido 'Contratado' 
export type StatusUsuario = 'Ativo' | 'Inativo' | 'Sem Acesso' | 'Convite Pendente';
export type PermissaoUsuario = 'Vereador' | 'Assessoria' | 'Secretaria' | 'Admin';

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

export const TIPOS_AGENTE: TipoAgente[] = ['Vereador', 'Funcionario']; // Removido acento
export const TIPOS_VINCULO: TipoVinculo[] = ['Efetivo', 'Comissionado', 'Terceirizado']; // Removido 'Contratado'
export const STATUS_USUARIO: StatusUsuario[] = ['Ativo', 'Inativo', 'Sem Acesso', 'Convite Pendente'];
export const PERMISSOES_USUARIO: PermissaoUsuario[] = ['Vereador', 'Assessoria', 'Secretaria', 'Admin'];
