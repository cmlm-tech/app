// src/components/atas/types.ts

// Definição do tipo para uma Ata, que pode ser usada em vários componentes.
export type Ata = {
  id: string;
  numeroSessao: number;
  tipoSessao: 'Ordinária' | 'Extraordinária' | 'Solene';
  dataRealizacao: Date;
  status: 'Agendada' | 'Realizada' | 'Cancelada';
  resumoPauta: string;
  materiasDeliberadas: number;
  presentes: number;
  linkPDF?: string;
};