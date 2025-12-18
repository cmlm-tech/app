import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// --- ESTILOS (Padrão Redação Oficial) ---
const styles = StyleSheet.create({
    page: {
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 60, // Margem esquerda (~2.5cm)
        paddingRight: 40, // Margem direita (~1.5cm)
        fontFamily: 'Helvetica', // Padrão PDF (similar a Arial)
        fontSize: 12,
        lineHeight: 1.5,
    },
    // Cabeçalho
    headerContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    headerAddress: {
        fontSize: 10,
        textAlign: 'center',
        color: '#333',
    },
    // Data e Local
    dateLocation: {
        textAlign: 'right',
        marginTop: 5,
        marginBottom: 15,
        fontSize: 12,
    },
    // Número do Documento
    documentNumberView: {
        marginBottom: 20,
        // Garante separação visual antes do endereçamento
    },
    documentNumberText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        textAlign: 'left',
    },
    // --- BLOCO DO DESTINATÁRIO (Vertical / Quebra de Linha) ---
    recipientBlock: {
        display: 'flex',
        flexDirection: 'column', // Força um item abaixo do outro
        alignItems: 'flex-start', // Alinha tudo à esquerda
        marginBottom: 25, // Espaço antes do corpo do texto
        gap: 2, // Pequeno espaçamento entre as linhas
    },
    recipientLine1: {
        fontSize: 12,
        // Pronome de tratamento (Ex: Ao Exmo. Sr.)
    },
    recipientLine2: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        // Nome em Negrito e Caixa Alta (Ex: FULANO DE TAL)
    },
    recipientLine3: {
        fontSize: 12,
        // Cargo e Órgão (Ex: Prefeito Municipal)
    },
    // Corpo do Texto
    content: {
        textAlign: 'justify',
        marginBottom: 30,
        minHeight: 100,
    },
    paragraph: {
        marginBottom: 10,
        textIndent: 30, // Recuo da primeira linha do parágrafo (3cm visual)
    },
    // Rodapé / Assinatura
    footer: {
        marginTop: 'auto', // Empurra para o fim da página
        width: '100%',
        alignItems: 'center',
        paddingTop: 20,
    },
    signatureLine: {
        borderTopWidth: 1,
        borderTopColor: '#000',
        width: '60%',
        marginBottom: 5,
    },
    signatureName: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    signatureRole: {
        fontSize: 11,
        fontStyle: 'italic',
    }
});

interface DocumentoPDFProps {
    tipo: string;           // Ex: "Ofício"
    numero: string;         // Ex: "022/2025" (será limpo se vier com texto extra)
    dataProtocolo: string;  // Data ISO
    texto: string;          // Corpo do texto gerado pela IA
    autor: string;          // Nome do Vereador
    autorCargo?: string;    // Cargo do Vereador
    // Props do Destinatário
    pronomeTratamento?: string; // Ex: "Ao Exmo. Sr."
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
    pronomeTratamento = "Ao Ilmo(a). Sr(a).", // Valor padrão
    destinatarioNome,
    destinatarioCargo,
    destinatarioOrgao
}: DocumentoPDFProps) {

    // 1. Formatar Data
    const dataObj = new Date(dataProtocolo);
    const dia = dataObj.getDate();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mes = meses[dataObj.getMonth()];
    const ano = dataObj.getFullYear();
    const dataExtenso = `Lavras da Mangabeira - CE, ${dia} de ${mes} de ${ano}.`;

    // 2. Limpar Número (Evita "OFÍCIO Nº OFÍCIO Nº")
    // Mantém apenas números, barras e hífens.
    const numeroLimpo = numero ? numero.replace(/[^0-9/-]/g, '') : '____/____';
    const tipoFormatado = tipo ? tipo.toUpperCase() : 'DOCUMENTO';

    // 3. Processar Texto da IA (Quebra em parágrafos)
    const cleanText = texto ? texto.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : '';
    const paragrafos = cleanText.split('\n').filter(p => p.trim() !== '');

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* --- CABEÇALHO --- */}
                <View style={styles.headerContainer}>
                    {/* <Image src="/logo.png" style={{width: 60, height: 60, marginBottom: 5}} /> */}
                    <Text style={styles.headerTitle}>CÂMARA MUNICIPAL DE</Text>
                    <Text style={styles.headerSubtitle}>LAVRAS DA MANGABEIRA - CE</Text>
                    <Text style={styles.headerAddress}>
                        Rua Monsenhor Meceno, S/N, Centro, Lavras da Mangabeira - CE{'\n'}
                        CEP: 63.300-000 | CNPJ: 12.464.996/0001-75
                    </Text>
                </View>

                {/* --- DATA --- */}
                <View style={styles.dateLocation}>
                    <Text>{dataExtenso}</Text>
                </View>

                {/* --- NÚMERO DO DOCUMENTO --- */}
                <View style={styles.documentNumberView}>
                    <Text style={styles.documentNumberText}>
                        {tipoFormatado} Nº {numeroLimpo}
                    </Text>
                </View>

                {/* --- DESTINATÁRIO (BLOCO VERTICAL) --- */}
                {/* Renderiza linha por linha para garantir a quebra visual */}
                {destinatarioNome && (
                    <View style={styles.recipientBlock}>

                        {/* Linha 1: Pronome */}
                        <Text style={styles.recipientLine1}>
                            {pronomeTratamento}
                        </Text>

                        {/* Linha 2: Nome */}
                        <Text style={styles.recipientLine2}>
                            {destinatarioNome}
                        </Text>

                        {/* Linha 3: Cargo */}
                        {destinatarioCargo && (
                            <Text style={styles.recipientLine3}>
                                {destinatarioCargo}
                            </Text>
                        )}

                        {/* Linha 4: Órgão */}
                        {destinatarioOrgao && (
                            <Text style={styles.recipientLine3}>
                                {destinatarioOrgao}
                            </Text>
                        )}
                    </View>
                )}

                {/* --- CORPO DO TEXTO (IA) --- */}
                <View style={styles.content}>
                    {paragrafos.map((paragrafo, index) => (
                        <Text key={index} style={styles.paragraph}>
                            {paragrafo}
                        </Text>
                    ))}
                </View>

                {/* --- ASSINATURA --- */}
                <View style={styles.footer}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureName}>{autor}</Text>
                    <Text style={styles.signatureRole}>{autorCargo}</Text>
                </View>

            </Page>
        </Document>
    );
}