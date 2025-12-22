import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../shared/PDFStyles';
import { PDFHeader } from '../shared/PDFHeader';
import { PDFFooter } from '../shared/PDFFooter';
import { PDFSignature } from '../shared/PDFSignature';

interface DecretoLegislativoPDFProps {
    numero: string;
    dataProtocolo: string;
    texto: string;
    autor: string;
    autorCargo: string;
    ementa?: string;
    membrosComissao?: { nome: string; cargo: string }[];
}

// TEMPLATE EXTRAÍDO DO PLANO DE IMPLEMENTAÇÃO
export default function DecretoLegislativoPDF({
    numero,
    dataProtocolo,
    texto,
    autor,
    autorCargo,
    ementa,
    membrosComissao
}: DecretoLegislativoPDFProps) {
    const dataObj = new Date(dataProtocolo);
    const dia = dataObj.getDate();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mes = meses[dataObj.getMonth()];
    const ano = dataObj.getFullYear();
    const dataExtenso = `Lavras da Mangabeira – Ceará, ${dia} de ${mes} de ${ano}.`;

    // Limpar número - remove prefixos e corrige ano duplicado (ex: "8/2025/2025" -> "8/2025")
    let numeroLimpo = numero || '';
    // Remove prefixo "Projeto de Decreto Legislativo nº" ou "Decreto Legislativo nº"
    numeroLimpo = numeroLimpo.replace(/^(projeto\s*de\s*)?(decreto\s*legislativo)\s*n[º°]?\s*/i, '');
    // Remove ano duplicado (ex: "8/2025/2025" -> "8/2025")
    numeroLimpo = numeroLimpo.replace(/(\d+\/\d{4})\/\d{4}$/, '$1');
    numeroLimpo = numeroLimpo.trim();

    // Limpar texto
    const cleanText = texto ? texto.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : '';
    const paragrafos = cleanText.split('\n').filter(p => p.trim() !== '');

    // Organizar membros da comissão para assinatura
    const presidente = membrosComissao?.find(m => m.cargo === 'Presidente');
    const relator = membrosComissao?.find(m => m.cargo === 'Relator');
    const membro = membrosComissao?.find(m => m.cargo === 'Membro');

    // Se não tiver cargos, tentar pegar por ordem (ex: 0=Pres, 1=Rel, 2=Memb sob responsabilidade do cadastro)
    // Mas o ideal é confiar no cargo

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <PDFHeader />

                <Text style={[pdfStyles.documentNumberText, { textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10 }]}>
                    PROJETO DE DECRETO LEGISLATIVO N° {numeroLimpo}
                </Text>

                <Text style={[pdfStyles.documentNumberText, { textAlign: 'center', fontWeight: 'bold', fontSize: 11, marginBottom: 30 }]}>
                    {autor.toUpperCase()}
                </Text>

                {ementa && (
                    <Text style={[pdfStyles.paragraph, { textAlign: 'center', marginBottom: 20, fontStyle: 'normal' }]}>
                        {ementa}
                    </Text>
                )}

                <Text style={[pdfStyles.paragraph, { marginBottom: 15, textIndent: 0 }]}>
                    A Câmara Municipal de Lavras da Mangabeira no uso de suas atribuições legais e regimentais,
                    especialmente nos termos do art. 64 da Lei Orgânica Municipal decreta:
                </Text>

                <View>
                    {paragrafos.map((p, i) => (
                        <Text key={i} style={pdfStyles.paragraph}>{p}</Text>
                    ))}
                </View>

                <Text style={[pdfStyles.paragraph, { marginTop: 30, textAlign: 'center', textIndent: 0 }]}>
                    Lavras da Mangabeira/CE, Sala das Sessões, em {dia} de {mes} de {ano}
                </Text>

                {/* DEBUG INFO - REMOVER DEPOIS */}
                <Text style={{ marginTop: 20, fontSize: 8, color: 'red', textAlign: 'center' }}>
                    DEBUG: membrosComissao = {membrosComissao ? `${membrosComissao.length} membros` : 'undefined/null'}
                </Text>
                {membrosComissao && membrosComissao.map((m, i) => (
                    <Text key={i} style={{ fontSize: 8, color: 'red', textAlign: 'center' }}>
                        {m.cargo}: {m.nome}
                    </Text>
                ))}
                {/* FIM DEBUG */}

                {membrosComissao && membrosComissao.length > 0 ? (
                    <View style={{ marginTop: 40 }}>
                        {/* Linha 1: Presidente Centralizado */}
                        {presidente && (
                            <View style={{ marginBottom: 40, alignItems: 'center' }}>
                                <Text style={pdfStyles.signatureLine}>_________________________________________________</Text>
                                <Text style={pdfStyles.signatureName}>{presidente.nome}</Text>
                                <Text style={pdfStyles.signatureRole}>{presidente.cargo}</Text>
                            </View>
                        )}

                        {/* Linha 2: Relator e Membro lado a lado */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                            {relator && (
                                <View style={{ alignItems: 'center', width: '45%' }}>
                                    <Text style={pdfStyles.signatureLine}>________________________________</Text>
                                    <Text style={pdfStyles.signatureName}>{relator.nome}</Text>
                                    <Text style={pdfStyles.signatureRole}>{relator.cargo}</Text>
                                </View>
                            )}
                            {membro && (
                                <View style={{ alignItems: 'center', width: '45%' }}>
                                    <Text style={pdfStyles.signatureLine}>________________________________</Text>
                                    <Text style={pdfStyles.signatureName}>{membro.nome}</Text>
                                    <Text style={pdfStyles.signatureRole}>{membro.cargo}</Text>
                                </View>
                            )}
                        </View>

                        {/* Fallback para outros membros se não tiver cargos definidos ou forem extras */}
                        {!presidente && !relator && !membro && (
                            membrosComissao.map((m, i) => (
                                <View key={i} style={{ marginBottom: 20, alignItems: 'center' }}>
                                    <Text style={pdfStyles.signatureLine}>_________________________________________________</Text>
                                    <Text style={pdfStyles.signatureName}>{m.nome}</Text>
                                    <Text style={pdfStyles.signatureRole}>{m.cargo}</Text>
                                </View>
                            ))
                        )}
                    </View>
                ) : (
                    <PDFSignature autor={autor} cargo={autorCargo} />
                )}

                <PDFFooter />
            </Page>
        </Document>
    );
}
