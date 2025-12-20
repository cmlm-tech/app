import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../shared/PDFStyles';
import { PDFHeader } from '../shared/PDFHeader';
import { PDFFooter } from '../shared/PDFFooter';
import { PDFSignature } from '../shared/PDFSignature';

interface MocaoPDFProps {
    numero: string;
    dataProtocolo: string;
    texto: string;
    autorCargo: string;
    ementa?: string;
    autores?: string[];
}

// TEMPLATE EXTRAÍDO DO DocumentoPDF.tsx ORIGINAL (seção Moção)
export default function MocaoPDF({
    numero,
    dataProtocolo,
    texto,
    autorCargo,
    ementa,
    autores,
}: MocaoPDFProps) {
    const dataObj = new Date(dataProtocolo);
    const dia = dataObj.getDate();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mes = meses[dataObj.getMonth()];
    const ano = dataObj.getFullYear();

    const numeroLimpo = numero ? numero.replace(/^(moção)\s*n[º°]?\s*/i, '').trim() : '';
    const cleanText = texto ? texto.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : '';
    const paragrafos = cleanText.split('\n').filter(p => p.trim() !== '');

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <PDFHeader />

                <Text style={pdfStyles.documentNumberText}>
                    Projeto de Moção N° {numeroLimpo}
                </Text>

                {ementa && (
                    <Text style={[pdfStyles.paragraph, { fontStyle: 'italic', marginBottom: 12 }]}>
                        Concede moção e adota outras providências...
                    </Text>
                )}

                <Text style={pdfStyles.paragraph}>
                    A Câmara Municipal de Lavras da Mangabeira – Ceará, aprovou o seguinte Projeto de Moção:
                </Text>

                <View>
                    {paragrafos.map((p, i) => (
                        <Text key={i} style={pdfStyles.paragraph}>{p}</Text>
                    ))}

                    <Text style={pdfStyles.paragraph}>
                        Art. 2º - A Moção acima é de conformidade com o Art. 110 do Regimento Interno da Câmara Municipal.
                    </Text>
                    <Text style={pdfStyles.paragraph}>
                        Art. 3º - Esta Moção entra em vigor na data de sua publicação, ficando revogadas as disposições em contrário.
                    </Text>
                </View>

                <Text style={[pdfStyles.paragraph, { marginTop: 20 }]}>
                    Sala das Sessões da Câmara Municipal, em {dia} de {mes} de {ano}.
                </Text>

                <PDFSignature autores={autores} cargo={autorCargo} />
                <PDFFooter />
            </Page>
        </Document>
    );
}
