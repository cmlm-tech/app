export const STORAGE_BUCKETS = {
    MATERIAS: 'materias-oficiais',
    PARECERES: 'pareceres',
    ATAS: 'atas-sessoes',
    RELATORIOS_VOTACAO: 'relatorios-votacao',
    ANEXOS: 'anexos-documentos',
} as const;

export function getBucketForDocumentType(tipo: string): string {
    // Normalizar tipo para garantir match
    const tipoNorm = tipo ? tipo.trim().toLowerCase() : '';

    // Mapeamento de tipos para buckets
    if (tipoNorm.includes('parecer')) return STORAGE_BUCKETS.PARECERES;
    if (tipoNorm.includes('ata')) return STORAGE_BUCKETS.ATAS;
    if (tipoNorm.includes('votação') || tipoNorm.includes('votacao')) return STORAGE_BUCKETS.RELATORIOS_VOTACAO;

    // Default para matérias legislativas
    return STORAGE_BUCKETS.MATERIAS;
}
