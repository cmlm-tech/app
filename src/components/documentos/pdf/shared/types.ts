export interface PDFBaseProps {
    tipo: string;
    numero: string;
    dataProtocolo: string;
    autor: string;
    autorCargo?: string;
}

export interface PDFMocaoProps extends PDFBaseProps {
    texto: string;
    ementa?: string;
    autores?: string[];
}

export interface PDFOficioProps extends PDFBaseProps {
    texto: string;
    pronomeTratamento?: string;
    destinatarioNome?: string;
    destinatarioCargo?: string;
    destinatarioOrgao?: string;
}

export interface PDFProjetoLeiProps extends PDFBaseProps {
    texto: string;
    ementa?: string;
}

export interface PDFRequerimentoProps extends PDFBaseProps {
    texto: string;
    pronomeTratamento?: string;
    destinatarioNome?: string;
    destinatarioCargo?: string;
    destinatarioOrgao?: string;
}

// Union type para o DocumentoPDF principal
export type DocumentoPDFProps =
    | PDFMocaoProps
    | PDFOficioProps
    | PDFProjetoLeiProps
    | PDFRequerimentoProps;
