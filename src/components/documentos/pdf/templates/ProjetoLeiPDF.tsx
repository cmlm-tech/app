import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../shared/PDFStyles';
import { PDFHeader } from '../shared/PDFHeader';
import { PDFFooter } from '../shared/PDFFooter';
import { PDFSignature } from '../shared/PDFSignature';
import Watermark from '../shared/Watermark';

interface ProjetoLeiPDFProps {
    numero: string;
    dataProtocolo: string;
    texto: string;
    autor: string;
    autorCargo: string;
    ementa?: string;
    isRascunho?: boolean;
}

// TEMPLATE PARA PROJETO DE LEI (usa formato padrão)
export default function ProjetoLeiPDF({
    numero,
    dataProtocolo,
    texto,
    autor,
    autorCargo,
    ementa,
    isRascunho = false,
}: ProjetoLeiPDFProps) {
    const dataObj = new Date(dataProtocolo);
    const dia = dataObj.getDate();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mes = meses[dataObj.getMonth()];
    const ano = dataObj.getFullYear();
    const dataExtenso = `Lavras da Mangabeira – Ceará, ${dia} de ${mes} de ${ano}.`;

    const numeroLimpo = numero ? numero.replace(/^(projeto)\s*n[º°]?\s*/i, '').trim() : '';
    const cleanText = texto ? texto.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : '';
    const paragrafos = cleanText.split('\n').filter(p => p.trim() !== '');

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <PDFHeader />
                <Watermark isRascunho={isRascunho} />

                <Text style={pdfStyles.dateLocation}>
                    {dataExtenso}
                </Text>

                <Text style={pdfStyles.documentNumberText}>
                    Projeto de Lei Nº {numeroLimpo}
                </Text>

                {ementa && (
                    <Text style={[pdfStyles.paragraph, { fontStyle: 'italic', marginBottom: 12 }]}>
                        {ementa}
                    </Text>
                )}

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
