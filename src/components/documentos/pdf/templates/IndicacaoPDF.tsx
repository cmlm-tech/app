import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../shared/PDFStyles';
import { PDFHeader } from '../shared/PDFHeader';
import { PDFFooter } from '../shared/PDFFooter';
import { PDFSignature } from '../shared/PDFSignature';
import Watermark from '../shared/Watermark';

interface IndicacaoPDFProps {
    numero: string;
    dataProtocolo: string;
    texto: string; // Justificativa
    autor: string;
    autorCargo: string;
    destinatario?: string;
    indicacao?: string; // O texto da indicação em si
    isRascunho?: boolean;
}

// TEMPLATE PARA INDICAÇÃO
// Formato: Texto fixo + indicação + justificativa
export default function IndicacaoPDF({
    numero,
    dataProtocolo,
    texto,
    autor,
    autorCargo,
    destinatario = "Sr. Prefeito Municipal",
    indicacao = "",
    isRascunho = false,
}: IndicacaoPDFProps) {
    const dataObj = new Date(dataProtocolo);
    const dia = dataObj.getDate();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mes = meses[dataObj.getMonth()];
    const ano = dataObj.getFullYear();

    // Limpar número (remover prefixo se existir)
    const numeroLimpo = numero ? numero.replace(/^(projeto de indicação|indicação)\s*n[º°]?\s*/i, '').trim() : '';

    // Limpar texto (remover HTML)
    const cleanText = texto ? texto.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : '';
    const paragrafos = cleanText.split('\n').filter(p => p.trim() !== '');

    // Limpar indicação (remover HTML)
    const indicacaoLimpa = indicacao ? indicacao.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : '';

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <PDFHeader />
                <Watermark isRascunho={isRascunho} />

                {/* Título centralizado */}
                <Text style={pdfStyles.documentNumberText}>
                    PROJETO DE INDICAÇÃO Nº {numeroLimpo}
                </Text>
                <Text style={[pdfStyles.documentNumberText, { marginTop: 2, marginBottom: 20 }]}>
                    {autorCargo.toUpperCase()} {autor.toUpperCase()}
                </Text>

                {/* Texto Fixo + Indicação */}
                <View style={{ marginBottom: 15 }}>
                    <Text style={pdfStyles.paragraph}>
                        Excelentíssimo Sr. Presidente, nos termos do art. 98 e seguintes do Regimento Interno desta Casa, apresento a Vossa Excelência INDICAÇÃO de minha autoria que deve ser encaminhada ao {destinatario}, {indicacaoLimpa || "[texto da indicação]"}.
                    </Text>
                </View>

                {/* Seção Justificativa */}
                <Text style={[pdfStyles.documentNumberText, { marginTop: 20, marginBottom: 15 }]}>
                    JUSTIFICATIVA
                </Text>

                <View>
                    {paragrafos.map((p, i) => (
                        <Text key={i} style={pdfStyles.paragraph}>{p}</Text>
                    ))}
                </View>

                {/* Data */}
                <Text style={[pdfStyles.paragraph, { marginTop: 30, textAlign: 'right', textIndent: 0 }]}>
                    Lavras da Mangabeira/CE, {dia} de {mes} de {ano}.
                </Text>

                {/* Fecho e Assinatura */}
                <Text style={[pdfStyles.paragraph, { marginTop: 30, textAlign: 'left', textIndent: 0 }]}>
                    Atenciosamente,
                </Text>

                <PDFSignature autor={autor} cargo={autorCargo} />
                <PDFFooter />
            </Page>
        </Document>
    );
}
