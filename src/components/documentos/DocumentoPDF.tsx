import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Dica: Para fontes mais próximas do oficial (Times New Roman ou Arial),
// você pode registrar fontes externas aqui. O padrão Helvetica é o mais próximo de Arial.

const styles = StyleSheet.create({
    page: {
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 60, // Margem esquerda padrão ABNT (~2.5 a 3cm)
        paddingRight: 40, // Margem direita (~1.5 a 2cm)
        fontFamily: 'Helvetica',
        fontSize: 12,
        lineHeight: 1.3, // Um pouco mais compacto que 1.5 para ofícios
    },
    // --- Cabeçalho ---
    headerContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1, // Opcional: linha separadora visual
        borderBottomColor: '#ccc',
        paddingBottom: 10,
    },
    brasao: {
        width: 60,
        height: 60,
        marginBottom: 5,
        objectFit: 'contain',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold', // Helvetica-Bold
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
        fontSize: 9,
        textAlign: 'center',
        color: '#333',
    },
    // --- Corpo do Ofício ---
    dateLocation: {
        textAlign: 'right',
        marginTop: 10,
        marginBottom: 20,
        fontSize: 12,
    },
    documentNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    recipientBlock: {
        marginBottom: 25,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    recipientText: {
        fontSize: 12,
    },
    content: {
        textAlign: 'justify',
        textIndent: 30, // Recuo de parágrafo
        marginBottom: 30,
        minHeight: 100,
    },
    // --- Rodapé / Assinatura ---
    footer: {
        marginTop: 40,
        width: '100%',
        alignItems: 'center',
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
        fontStyle: 'italic', // Simulando itálico se a fonte suportar, ou normal
    }
});

interface DocumentoPDFProps {
    tipo: string; // Ex: "Ofício"
    ano: number;
    numero: string; // Ex: "05/2025"
    dataExtenso: string; // Ex: "Lavras da Mangabeira - Ceará, 14 de Janeiro de 2025."
    texto: string; // O corpo do texto (HTML stripado ou texto puro)
    autor: string; // Nome do Vereador(a)
    autorCargo?: string; // Ex: "Vereadora"
    destinatarioNome: string; // Ex: "Thiago Sobreira Augusto Lima"
    destinatarioCargo: string; // Ex: "Secretário Municipal de Esporte..."
}

export function DocumentoPDF({
    tipo,
    // ano, // Se já vier formatado no 'numero', não precisa isolado
    numero,
    dataExtenso,
    texto,
    autor,
    autorCargo = "Vereador(a)",
    destinatarioNome,
    destinatarioCargo
}: DocumentoPDFProps) {

    // Limpeza simples de tags HTML caso venha de um Rich Text Editor
    const cleanText = texto.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* --- CABEÇALHO --- */}
                <View style={styles.headerContainer}>
                    {/* TODO: Substitua a URL abaixo pelo caminho público do brasão de Lavras da Mangabeira.
                       Se estiver usando Next.js, pode ser algo na pasta public como "/brasao-lavras.png"
                       ou uma URL remota.
                    */}
                    {/* <Image src="/logo_camara.png" style={styles.brasao} /> */}

                    <Text style={styles.headerTitle}>CÂMARA MUNICIPAL DE</Text>
                    <Text style={styles.headerSubtitle}>LAVRAS DA MANGABEIRA - CE</Text>

                    <Text style={styles.headerAddress}>
                        Rua Monsenhor Meceno, S/N, Centro, Lavras da Mangabeira - CE{'\n'}
                        CEP: 63.300-000 | CNPJ: 12.464.996/0001-75
                    </Text>
                </View>

                {/* --- DATA E LOCAL --- */}
                <View style={styles.dateLocation}>
                    <Text>{dataExtenso}</Text>
                </View>

                {/* --- NÚMERO DO DOCUMENTO --- */}
                <View>
                    <Text style={styles.documentNumber}>
                        {tipo} Nº {numero}
                    </Text>
                </View>

                {/* --- DESTINATÁRIO --- */}
                <View style={styles.recipientBlock}>
                    <Text style={styles.recipientText}>Ao Ilmo. Sr.</Text>
                    <Text style={{ ...styles.recipientText, fontWeight: 'bold' }}>{destinatarioNome}</Text>
                    <Text style={styles.recipientText}>DD. {destinatarioCargo}</Text>
                    <Text style={styles.recipientText}>Nesta</Text>
                </View>

                {/* --- CORPO DO TEXTO --- */}
                <View style={styles.content}>
                    {/* Dica: Se o texto tiver quebras de linha (\n), o componente Text
                       geralmente renderiza corretamente. Se forem parágrafos distintos,
                       pode ser necessário fazer um .split('\n').map(...) 
                    */}
                    <Text>{cleanText}</Text>
                </View>

                {/* --- FECHAMENTO PADRÃO --- */}
                <View style={{ marginBottom: 40 }}>
                    <Text>Na oportunidade apresentamos protestos de estima e consideração.</Text>
                    <Text style={{ marginTop: 15 }}>Atenciosamente,</Text>
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