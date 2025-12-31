/**
 * Serviço de Storage para PDFs de Matérias Protocoladas
 * 
 * Responsável por:
 * - Upload de PDFs para o Supabase Storage
 * - Cálculo de hash SHA-256 para integridade
 * - Geração de URLs públicas
 */

import { supabase } from "@/lib/supabaseClient";

const BUCKET_MATERIAS = 'materias-oficiais';
const CUSTOM_STORAGE_DOMAIN = 'https://documentos.cmlm.tech';

/**
 * Calcula o hash SHA-256 de um Blob
 * @param blob - Arquivo PDF como Blob
 * @returns Hash SHA-256 em formato hexadecimal
 */
export async function calcularHashSHA256(blob: Blob): Promise<string> {
    const arrayBuffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Gera o caminho do arquivo no storage
 * @param tipoDocumento - Nome do tipo (ex: "Projeto de Lei", "Ofício")
 * @param numero - Número oficial do documento
 * @param ano - Ano do documento
 * @param documentoId - ID do documento no banco
 * @returns Caminho formatado para o arquivo
 */
function gerarCaminhoArquivo(
    tipoDocumento: string,
    numero: number | string,
    ano: number,
    documentoId: number
): string {
    // Normalizar tipo para uso em path (remover acentos, espaços)
    const tipoNormalizado = tipoDocumento
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    // Formatar número com zeros à esquerda
    const numeroFormatado = String(numero).padStart(3, '0');

    // Estrutura: ano/tipo/numero-docId.pdf
    return `${ano}/${tipoNormalizado}/${numeroFormatado}-${documentoId}.pdf`;
}

/**
 * Faz upload do PDF para o Supabase Storage
 * @param pdfBlob - PDF como Blob
 * @param tipoDocumento - Nome do tipo de documento
 * @param numero - Número oficial
 * @param ano - Ano
 * @param documentoId - ID do documento
 * @returns Objeto com URL pública e hash do arquivo
 */
export async function uploadMateriaPDF(
    pdfBlob: Blob,
    tipoDocumento: string,
    numero: number | string,
    ano: number,
    documentoId: number
): Promise<{ url: string; hash: string; path: string }> {
    // 1. Calcular hash antes do upload
    const hash = await calcularHashSHA256(pdfBlob);

    // 2. Gerar caminho do arquivo
    const filePath = gerarCaminhoArquivo(tipoDocumento, numero, ano, documentoId);

    // 3. Fazer upload
    const { data, error } = await supabase.storage
        .from(BUCKET_MATERIAS)
        .upload(filePath, pdfBlob, {
            contentType: 'application/pdf',
            upsert: false, // Não sobrescrever se existir
            cacheControl: '31536000' // Cache de 1 ano (imutável)
        });

    if (error) {
        console.error('Erro no upload do PDF:', error);
        throw new Error(`Falha ao fazer upload do PDF: ${error.message}`);
    }

    // 4. Gerar URL pública (usando domínio customizado via Cloudflare Worker)
    const publicUrl = `${CUSTOM_STORAGE_DOMAIN}/${filePath}`;

    return {
        url: publicUrl,
        hash,
        path: filePath
    };
}

/**
 * Atualiza o documento com a URL do PDF armazenado
 * @param documentoId - ID do documento
 * @param pdfUrl - URL pública do PDF no storage
 */
export async function atualizarUrlPDF(
    documentoId: number,
    pdfUrl: string
): Promise<void> {
    // Nota: O nome da coluna pode ser arquivo_url ou arquivo_pdf_url dependendo da versão dos tipos
    // Usando type assertion para compatibilidade
    const { error } = await supabase
        .from('documentos')
        .update({ arquivo_url: pdfUrl } as any)
        .eq('id', documentoId);

    if (error) {
        console.error('Erro ao atualizar URL do PDF:', error);
        throw new Error(`Falha ao salvar URL do PDF: ${error.message}`);
    }
}

/**
 * Atualiza o hash do documento no protocolo
 * @param protocoloId - ID do protocolo
 * @param hash - Hash SHA-256 do PDF
 */
export async function atualizarHashProtocolo(
    protocoloId: number,
    hash: string
): Promise<void> {
    const { error } = await supabase
        .from('protocolos' as any)
        .update({ hash_documento: hash })
        .eq('id', protocoloId);

    if (error) {
        console.error('Erro ao atualizar hash do protocolo:', error);
        throw new Error(`Falha ao salvar hash: ${error.message}`);
    }
}

/**
 * Verifica a integridade de um PDF comparando com o hash armazenado
 * @param pdfBlob - PDF para verificar
 * @param hashOriginal - Hash armazenado no banco
 * @returns true se o documento está íntegro
 */
export async function verificarIntegridade(
    pdfBlob: Blob,
    hashOriginal: string
): Promise<boolean> {
    const hashAtual = await calcularHashSHA256(pdfBlob);
    return hashAtual === hashOriginal;
}
