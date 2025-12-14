import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed (standard Helvetica is default and reliable)
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
    page: {
        paddingTop: 60, // 3cm ~ 85px, assuming 72dpi. 60 is safer for default.
        paddingBottom: 60,
        paddingLeft: 80, // 3cm
        paddingRight: 60, // 2cm
        fontFamily: 'Helvetica',
        fontSize: 12,
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 40,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    brasao: {
        width: 60,
        height: 60,
        marginBottom: 10,
        // Add a placeholder color or load an actual image if URL is stable
        backgroundColor: '#f0f0f0',
    },
    headerText: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    subHeaderText: {
        fontSize: 12,
        fontWeight: 'normal',
        textTransform: 'uppercase',
    },
    titleSection: {
        marginBottom: 30,
        textAlign: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: '#333',
    },
    protocolInfo: {
        fontSize: 10,
        textAlign: 'right',
        marginBottom: 20,
        color: '#666',
    },
    content: {
        textAlign: 'justify',
        marginBottom: 50,
        minHeight: 200,
    },
    footer: {
        marginTop: 'auto', // Push to bottom
        textAlign: 'center',
        width: '100%',
    },
    signatureLine: {
        borderTopWidth: 1,
        borderTopColor: '#000',
        width: '60%',
        alignSelf: 'center',
        marginBottom: 5,
        marginTop: 50,
    },
    signatureName: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    signatureRole: {
        fontSize: 10,
    },
    dateLocation: {
        marginTop: 30,
        textAlign: 'right',
        fontSize: 12,
    }
});

interface DocumentoPDFProps {
    tipo: string;
    ano: number;
    numero: string; // The official formatted number
    protocolo: number;
    dataProtocolo: string;
    texto: string;
    autor: string;
}

export function DocumentoPDF({ tipo, ano, numero, protocolo, dataProtocolo, texto, autor }: DocumentoPDFProps) {

    // Basic HTML stripper for now since react-pdf text is raw strings
    const cleanText = texto.replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ');

    const currentDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    {/* Placeholder for official Coat of Arms (Brasão) */}
                    {/* <Image src="/path/to/brasao.png" style={styles.brasao} /> */}
                    <Text style={styles.headerText}>Estado de Goiás</Text>
                    <Text style={styles.subHeaderText}>Câmara Municipal de [Nome da Cidade]</Text>
                </View>

                {/* Protocol Metadata (Optional, visible for internal tracking) */}
                <View style={styles.protocolInfo}>
                    <Text>Prot. Geral: {ano}.{protocolo.toString().padStart(6, '0')}</Text>
                </View>

                {/* Official Title */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{numero}</Text>
                </View>

                {/* Content Body */}
                <View style={styles.content}>
                    <Text>{cleanText}</Text>
                </View>

                {/* Date */}
                <View style={styles.dateLocation}>
                    <Text>[Cidade], {currentDate}.</Text>
                </View>

                {/* Signature */}
                <View style={styles.footer}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureName}>{autor}</Text>
                    <Text style={styles.signatureRole}>Vereador(a) - Autor(a)</Text>
                </View>
            </Page>
        </Document>
    );
}
