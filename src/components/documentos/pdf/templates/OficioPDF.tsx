import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../shared/PDFStyles';
import { PDFHeader } from '../shared/PDFHeader';
import { PDFFooter } from '../shared/PDFFooter';
import { PDFSignature } from '../shared/PDFSignature';

interface OficioPDFProps {
    numero: string;
    dataProtocolo: string;
    texto: string;
    autor: string;
    autorCargo: string;
    pronomeTratamento: string;
    destinatarioNome?: string;
    destinatarioCargo?: string;
    destinatarioOrgao?: string;
}

// TEMPLATE EXTRAÍDO DO DocumentoPDF.tsx ORIGINAL (formato padrão)
export default function OficioPDF({
    numero,
    dataProtocolo,
    texto,
    autor,
    autorCargo,
    pronomeTratamento,
    destinatarioNome,
    destinatarioCargo,
    destinatarioOrgao,
}: OficioPDFProps) {
    const dataObj = new Date(dataProtocolo);
    const dia = dataObj.getDate();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mes = meses[dataObj.getMonth()];
    const ano = dataObj.getFullYear();
    const dataExtenso = `Lavras da Mangabeira – Ceará, ${dia} de ${mes} de ${ano}.`;

    const numeroLimpo = numero ? numero.replace(/^(ofício)\s*n[º°]?\s*/i, '').trim() : '';
    const cleanText = texto ? texto.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : '';
    const paragrafos = cleanText.split('\n').filter(p => p.trim() !== '');

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <PDFHeader />

                <Text style={pdfStyles.dateLocation}>
                    {dataExtenso}
                </Text>

                <Text style={pdfStyles.documentNumberText}>
                    Ofício Nº {numeroLimpo}
                </Text>

                <View style={pdfStyles.recipientBlock}>
                    <Text style={pdfStyles.recipientText}>{pronomeTratamento}</Text>
                    <Text style={pdfStyles.recipientText}>{destinatarioNome}</Text>
                    {destinatarioCargo && <Text style={pdfStyles.recipientText}>{destinatarioCargo}</Text>}
                    {destinatarioOrgao && <Text style={pdfStyles.recipientText}>{destinatarioOrgao}</Text>}
                </View>

                <View>
                    {paragrafos.map((p, i) => (
                        <Text key={i} style={pdfStyles.paragraph}>{p}</Text>
                    ))}
                </View>

                <PDFSignature autor={autor} cargo={autorCargo} />
                <PDFFooter />
            </Page>
        </Document>
    );
}
