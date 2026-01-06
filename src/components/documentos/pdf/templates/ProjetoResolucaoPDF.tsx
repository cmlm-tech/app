import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../shared/PDFStyles';
import { PDFHeader } from '../shared/PDFHeader';
import { PDFFooter } from '../shared/PDFFooter';
import Watermark from '../shared/Watermark';

interface ProjetoResolucaoPDFProps {
    numero: string;
    dataProtocolo: string;
    texto: string;
    autor: string;
    autorCargo?: string;
    ementa?: string;
    membrosMesa?: { nome: string; cargo: string }[];
    autores?: string[];
    isRascunho?: boolean;
}

export default function ProjetoResolucaoPDF({
    numero,
    dataProtocolo,
    texto,
    autor,
    autorCargo = "Vereador",
    ementa,
    membrosMesa,
    autores,
    isRascunho = false,
}: ProjetoResolucaoPDFProps) {
    const dataObj = new Date(dataProtocolo);
    const dia = dataObj.getDate();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mes = meses[dataObj.getMonth()];
    const ano = dataObj.getFullYear();
    const dataExtenso = `Lavras da Mangabeira/CE, ${dia} de ${mes} de ${ano}.`;

    // Limpar número
    const numeroLimpo = numero ? numero.replace(/^(projeto de resolução|resolução)\s*n[º°]?\s*/i, '').trim() : '';

    // Limpar texto
    const cleanText = texto ? texto.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : '';
    const paragrafos = cleanText.split('\n').filter(p => p.trim() !== '');

    // Determinar se é Mesa Diretora ou Autoria Coletiva
    const isMesa = autor.toUpperCase().includes("MESA DIRETORA");
    const isColetivo = autores && autores.length > 1;

    // Organizar assinaturas
    const assinaturas: { nome: string; cargo: string }[] = [];
    if (isMesa && membrosMesa && membrosMesa.length > 0) {
        // Ordenação desejada
        const ordemCargos = [
            "Presidente",
            "Vice-Presidente",
            "1º Secretário",
            "2º Secretário",
            "1º Tesoureiro",
            "2º Tesoureiro"
        ];

        const membrosOrdenados = [...membrosMesa].sort((a, b) => {
            const indexA = ordemCargos.indexOf(a.cargo);
            const indexB = ordemCargos.indexOf(b.cargo);
            return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
        });

        assinaturas.push(...membrosOrdenados);
    } else if (isColetivo && autores) {
        assinaturas.push(...autores.map(nome => ({ nome, cargo: "Vereador" })));
    } else {
        assinaturas.push({ nome: autor, cargo: autorCargo });
    }

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <PDFHeader />
                <Watermark isRascunho={isRascunho} />

                {/* Título Centralizado */}
                <View style={{ alignItems: 'center', marginBottom: 30 }}>
                    <Text style={[pdfStyles.documentNumberText, { fontFamily: 'Helvetica-Bold', marginBottom: 2 }]}>
                        PROJETO DE RESOLUÇÃO Nº {numeroLimpo}
                    </Text>
                    <Text style={[pdfStyles.documentNumberText, { fontFamily: 'Helvetica-Bold' }]}>
                        {autor.toUpperCase()}
                    </Text>
                </View>

                {/* Ementa à Direita */}
                {ementa && (
                    <View style={pdfStyles.ementaBlock}>
                        <Text>{ementa.toUpperCase()}</Text>
                    </View>
                )}

                {/* Texto de Abertura */}
                <Text style={pdfStyles.paragraph}>
                    {isMesa
                        ? "A Mesa Diretora da Câmara Municipal de Lavras da Mangabeira, no uso de suas atribuições legais e nos termos regimentais, apresenta o seguinte projeto de Resolução:"
                        : `O Vereador que a este subscreve, no uso de suas atribuições legais e regimentais, apresenta o seguinte projeto de Resolução:`
                    }
                </Text>

                {/* Corpo do Texto */}
                <View style={{ marginBottom: 30 }}>
                    {paragrafos.map((p, i) => (
                        <Text key={i} style={pdfStyles.paragraph}>{p}</Text>
                    ))}
                </View>

                {/* Data */}
                <Text style={[pdfStyles.dateLocation, { textAlign: 'left', marginTop: 20 }]}>
                    {dataExtenso}
                </Text>

                {/* Assinaturas em Grid */}
                <View style={{ marginTop: 40 }}>
                    {renderAssinaturas(assinaturas)}
                </View>

                <PDFFooter />
            </Page>
        </Document>
    );
}

function renderAssinaturas(assinaturas: { nome: string; cargo: string }[]) {
    const rows: { nome: string; cargo: string }[][] = [];

    if (assinaturas.length === 1) {
        rows.push([assinaturas[0]]);
    } else {
        // Se for Mesa Diretora, tentar seguir a ordem do print se possível, 
        // ou apenas fazer pares.
        // Vamos fazer o primeiro centralizado se for ímpar? 
        // Não, vamos seguir a lógica de pares:
        for (let i = 0; i < assinaturas.length; i += 2) {
            if (i + 1 < assinaturas.length) {
                rows.push([assinaturas[i], assinaturas[i + 1]]);
            } else {
                rows.push([assinaturas[i]]);
            }
        }
    }

    return rows.map((row, i) => (
        <View key={i} style={row.length === 2 ? pdfStyles.multiSignatureRow : pdfStyles.signatureContainer}>
            {row.map((sig, j) => (
                <View key={j} style={row.length === 2 ? pdfStyles.signatureColumn : { alignItems: 'center' }}>
                    <Text style={pdfStyles.signatureName}>{sig.nome}</Text>
                    <Text style={pdfStyles.signatureRole}>{sig.cargo}</Text>
                </View>
            ))}
        </View>
    ));
}
