import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Registrar fonte Times-Roman (integrada ao react-pdf, similar ao Goudy Old Style)
// react-pdf tem suporte limitado a fontes externas, usando fontes integradas por estabilidade

// --- ESTILOS (Baseado na Imagem de Referência) ---
const styles = StyleSheet.create({
    page: {
        paddingTop: 130,
        paddingBottom: 50,
        paddingLeft: 50,
        paddingRight: 40,
        fontFamily: 'Helvetica',
        fontSize: 12,
        lineHeight: 1.5,
    },
    // --- CABEÇALHO FIXO (repete em todas as páginas) ---
    fixedHeader: {
        position: 'absolute',
        top: 20,
        left: 50,
        right: 40,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        height: 80, // Altura fixa para alinhar logo e texto
    },
    logo: {
        width: 70,
        height: 70,
        marginRight: 15,
    },
    headerTextColumn: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start', // Texto alinhado à esquerda dentro do bloco
    },
    headerTitle: {
        fontFamily: 'Times-Bold',
        fontSize: 16,
        textTransform: 'uppercase',
        color: '#333',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontFamily: 'Times-Bold',
        fontSize: 14,
        textTransform: 'uppercase',
        color: '#444',
        marginBottom: 4,
    },
    headerAddress: {
        fontFamily: 'Times-Italic',
        fontSize: 9,
        color: '#444',
    },
    // --- BARRAS COLORIDAS (Cabeçalho e Rodapé) ---
    colorBarContainer: {
        flexDirection: 'row',
        height: 16,
        width: '100%',
        marginBottom: 25,
    },
    footerBarContainer: {
        flexDirection: 'row',
        height: 16,
        width: '100%',
        marginTop: 20,
    },
    barBlue: {
        width: '45%',
        height: 16,
        backgroundColor: '#07077f',
    },
    barGold: {
        width: '55%',
        height: 16,
        backgroundColor: '#fcbf05',
    },

    // --- CORPO DO DOCUMENTO ---

    // Data
    dateLocation: {
        textAlign: 'left', // Na imagem parece alinhado à esquerda ou justificado
        marginBottom: 20,
        fontSize: 12,
    },

    // Número do Ofício
    documentNumberText: {
        fontSize: 12,
        marginBottom: 20,
    },

    // Destinatário
    recipientBlock: {
        marginBottom: 20,
        lineHeight: 1.4,
    },
    recipientText: {
        fontSize: 12,
    },

    // Assunto
    subjectBlock: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    subjectLabel: {
        fontWeight: 'bold',
        marginRight: 4,
    },

    // Texto
    vocative: {
        marginBottom: 15,
        textIndent: 40,
    },
    paragraph: {
        marginBottom: 10,
        textIndent: 40, // Recuo de parágrafo da imagem
        textAlign: 'justify',
    },

    // --- ASSINATURA ---
    signatureContainer: {
        marginTop: 40, // Espaço antes da assinatura
        alignItems: 'center',
        marginBottom: 10,
    },
    signatureName: {
        fontWeight: 'bold',
        marginBottom: 2,
    },
    signatureRole: {
        fontWeight: 'bold',
    },
    // --- RODAPÉ FIXO (repete em todas as páginas) ---
    fixedFooter: {
        position: 'absolute',
        bottom: 20,
        left: 50,
        right: 40,
    },
});

interface DocumentoPDFProps {
    tipo: string;
    numero: string;
    dataProtocolo: string;
    texto: string;
    autor: string;
    autorCargo?: string;
    pronomeTratamento?: string;
    destinatarioNome?: string;
    destinatarioCargo?: string;
    destinatarioOrgao?: string;
}

export function DocumentoPDF({
    tipo,
    numero,
    dataProtocolo,
    texto,
    autor,
    autorCargo = "Vereador(a)",
    pronomeTratamento = "Ao Ilmo. Sr.",
    destinatarioNome,
    destinatarioCargo,
    destinatarioOrgao,
}: DocumentoPDFProps) {
    const dataObj = new Date(dataProtocolo);
    const dia = dataObj.getDate();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mes = meses[dataObj.getMonth()];
    const ano = dataObj.getFullYear();
    const dataExtenso = `Lavras da Mangabeira – Ceará, ${dia} de ${mes} de ${ano}.`;

    // Limpar número (remove prefixos duplicados como "Ofício nº")
    const numeroLimpo = numero ? numero.replace(/^(ofício|requerimento|projeto)\s*n[º°]?\s*/i, '').trim() : '';

    const cleanText = texto ? texto.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : '';
    const paragrafos = cleanText.split('\n').filter(p => p.trim() !== '');

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* CABEÇALHO FIXO (aparece em todas as páginas) */}
                <View style={styles.fixedHeader} fixed>
                    <View style={styles.headerContainer}>
                        {/* Logo */}
                        <Image src="/logo-camara.png" style={styles.logo} />

                        {/* Texto (Direita do Logo) */}
                        <View style={styles.headerTextColumn}>
                            <Text style={styles.headerTitle}>CÂMARA MUNICIPAL DE</Text>
                            <Text style={styles.headerSubtitle}>LAVRAS DA MANGABEIRA – CE</Text>
                            <Text style={styles.headerAddress}>
                                Rua Monsenhor Meceno, S/N, Centro, Lavras da Mangabeira - CE
                            </Text>
                            <Text style={styles.headerAddress}>
                                CEP: 63.300-000 | CNPJ: 12.464.996/0001-75
                            </Text>
                        </View>
                    </View>

                    {/* BARRAS COLORIDAS SUPERIORES */}
                    <View style={styles.colorBarContainer}>
                        <View style={styles.barBlue} />
                        <View style={styles.barGold} />
                    </View>
                </View>

                {/* LOCAL E DATA */}
                <Text style={styles.dateLocation}>
                    {dataExtenso}
                </Text>

                {/* NÚMERO DO OFÍCIO */}
                <Text style={styles.documentNumberText}>
                    {tipo} Nº {numeroLimpo}
                </Text>

                {/* DESTINATÁRIO */}
                <View style={styles.recipientBlock}>
                    <Text style={styles.recipientText}>{pronomeTratamento}</Text>
                    <Text style={styles.recipientText}>{destinatarioNome}</Text>
                    {destinatarioCargo && <Text style={styles.recipientText}>{destinatarioCargo}</Text>}
                    {destinatarioOrgao && <Text style={styles.recipientText}>{destinatarioOrgao}</Text>}
                </View>

                {/* CORPO DO TEXTO */}
                <View>
                    {paragrafos.map((p, i) => (
                        <Text key={i} style={styles.paragraph}>{p}</Text>
                    ))}
                </View>

                {/* ASSINATURA */}
                <View style={styles.signatureContainer}>
                    <Text style={styles.signatureName}>{autor}</Text>
                    <Text style={styles.signatureName}>{autorCargo}</Text>
                </View>

                {/* RODAPÉ FIXO (aparece em todas as páginas) */}
                <View style={styles.fixedFooter} fixed>
                    <View style={styles.footerBarContainer}>
                        <View style={styles.barBlue} />
                        <View style={styles.barGold} />
                    </View>
                </View>

            </Page>
        </Document>
    );
}
