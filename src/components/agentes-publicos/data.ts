
import { AgentePublico } from './types';

export const AGENTES_MOCK: AgentePublico[] = [
  {
    id: '1',
    nomeCompleto: 'João Silva Santos',
    cpf: '12345678901',
    foto: '/placeholder.svg',
    tipo: 'Vereador',
    statusUsuario: 'Ativo',
    nomeParlamantar: 'João Silva',
    perfil: 'Vereador atuante nas áreas de educação e saúde pública, com foco em políticas sociais.'
  },
  {
    id: '2',
    nomeCompleto: 'Maria Oliveira Costa',
    cpf: '98765432109',
    foto: '/placeholder.svg',
    tipo: 'Vereador',
    statusUsuario: 'Ativo',
    nomeParlamantar: 'Dra. Maria Costa',
    perfil: 'Médica e vereadora com especialização em políticas de saúde e bem-estar social.'
  },
  {
    id: '3',
    nomeCompleto: 'Carlos Roberto Ferreira',
    cpf: '11122233344',
    foto: '/placeholder.svg',
    tipo: 'Funcionario',
    statusUsuario: 'Ativo',
    cargo: 'Diretor Geral',
    tipoVinculo: 'Efetivo',
    dataAdmissao: '2020-01-15',
    dataExoneracao: ''
  },
  {
    id: '4',
    nomeCompleto: 'Ana Paula Mendes',
    cpf: '55566677788',
    foto: '/placeholder.svg',
    tipo: 'Funcionario',
    statusUsuario: 'Ativo',
    cargo: 'Assessora Parlamentar',
    tipoVinculo: 'Comissionado',
    dataAdmissao: '2022-03-10',
    dataExoneracao: ''
  },
  {
    id: '5',
    nomeCompleto: 'Pedro Henrique Lima',
    cpf: '99988877766',
    foto: '/placeholder.svg',
    tipo: 'Vereador',
    statusUsuario: 'Inativo',
    nomeParlamantar: 'Pedro Lima',
    perfil: 'Ex-vereador com atuação na área de infraestrutura e obras públicas.'
  }
];
