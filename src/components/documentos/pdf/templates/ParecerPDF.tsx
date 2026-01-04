
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../shared/PDFStyles';
import { PDFHeader } from '../shared/PDFHeader';
import { PDFFooter } from '../shared/PDFFooter';
import Watermark from '../shared/Watermark';

interface MembroComissao {
    nome: string;
    cargo: string;
}

interface ParecerPDFProps {
    comissaoNome: string;
    materiaTipo: string;
    materiaNumero: string;
    materiaAno: number;
    parecerNumero?: string; // Parecer ID/Ano
    parecerAno?: number;
    texto: string;
    dataProtocolo?: string;
    membros: MembroComissao[];
    isRascunho?: boolean;
}

export default function ParecerPDF({
    comissaoNome,
    materiaTipo,
    materiaNumero,
    materiaAno,
    parecerNumero,
    parecerAno,
    texto,
    dataProtocolo,
    membros,
    isRascunho = false
}: ParecerPDFProps) {
    const dataObj = dataProtocolo ? new Date(dataProtocolo) : new Date();
    const dia = dataObj.getDate();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mes = meses[dataObj.getMonth()];
    const ano = dataObj.getFullYear();
    const dataExtenso = `Sala das Comissões, ${dia} de ${mes} de ${ano}.`;

    const cleanText = texto ? texto.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : '';
    const paragrafos = cleanText.split('\n').filter(p => p.trim() !== '');

    // Organizar membros por cargo
    const presidente = membros.find(m => m.cargo === 'Presidente');
    const relator = membros.find(m => m.cargo === 'Relator');
    const demaisMembros = membros.filter(m => m.cargo !== 'Presidente' && m.cargo !== 'Relator');

    // Título Formato: PARECER DA COMISSÃO DE [NOME] SOBRE O [TIPO] Nº [NUM]/[ANO]
    const comissaoPrefix = (comissaoNome.toLowerCase().startsWith('comissão') || comissaoNome.toLowerCase().startsWith('comissao'))
        ? 'DA'
        : 'DA COMISSÃO DE';

    // Garantir padding de 3 dígitos também no componente (camada extra de proteção)
    const numeroPadded = materiaNumero.toString().split('/')[0].padStart(3, '0');

    const titulo = `PARECER ${comissaoPrefix} ${comissaoNome.toUpperCase()} SOBRE O ${materiaTipo.toUpperCase()} Nº ${numeroPadded}/${materiaAno}`;

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <PDFHeader />

                {/* Título */}
                <View style={{ marginTop: 20, marginBottom: 20 }}>
                    <Text style={{
                        fontSize: 12,
                        fontFamily: 'Times-Bold',
                        textAlign: 'center',
                        textTransform: 'uppercase'
                    }}>
                        {titulo}
                    </Text>
                </View>

                {/* Corpo do Texto */}
                <View style={{ marginBottom: 30 }}>
                    {paragrafos.map((p, i) => (
                        <Text key={i} style={{
                            fontSize: 12,
                            fontFamily: 'Times-Roman',
                            textAlign: 'justify',
                            marginBottom: 8,
                            lineHeight: 1.5,
                            textIndent: 30
                        }}>
                            {p}
                        </Text>
                    ))}
                </View>

                {/* Data e Local */}
                <Text style={{
                    fontSize: 12,
                    fontFamily: 'Times-Roman',
                    textAlign: 'center',
                    marginBottom: 40
                }}>
                    {dataExtenso}
                </Text>

                {/* Assinaturas Customizadas */}
                <View style={{ width: '100%' }}>
                    {/* Presidente Centralizado */}
                    {presidente && (
                        <View style={{ alignItems: 'center', marginBottom: 40 }}>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', width: 200, marginBottom: 5 }} />
                            <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{presidente.nome}</Text>
                            <Text style={{ fontSize: 10, fontFamily: 'Times-Roman' }}>Presidente</Text>
                        </View>
                    )}

                    {/* Relator e Demais Membros lado a lado (se houver apenas 1 outro membro) */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        {relator && (
                            <View style={{ alignItems: 'center', width: '45%', marginBottom: 20 }}>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', width: 180, marginBottom: 5 }} />
                                <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{relator.nome}</Text>
                                <Text style={{ fontSize: 10, fontFamily: 'Times-Roman' }}>Relator</Text>
                            </View>
                        )}

                        {demaisMembros.map((membro, idx) => (
                            <View key={idx} style={{ alignItems: 'center', width: '45%', marginBottom: 20 }}>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', width: 180, marginBottom: 5 }} />
                                <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{membro.nome}</Text>
                                <Text style={{ fontSize: 10, fontFamily: 'Times-Roman' }}>{membro.cargo || 'Membro'}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Watermark isRascunho={isRascunho} />
                <PDFFooter />
            </Page>
        </Document>
    );
}
