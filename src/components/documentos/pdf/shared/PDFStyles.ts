import { StyleSheet } from '@react-pdf/renderer';

// ESTILOS EXTRAÍDOS DO DocumentoPDF.tsx ORIGINAL
export const pdfStyles = StyleSheet.create({
    page: {
        paddingTop: 130,
        paddingBottom: 50,
        paddingLeft: 50,
        paddingRight: 40,
        fontFamily: 'Helvetica',
        fontSize: 12,
        lineHeight: 1.5,
    },

    // --- CABEÇALHO FIXO ---
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
        height: 80,
    },
    logo: {
        width: 70,
        height: 70,
        marginRight: 15,
    },
    headerTextColumn: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
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

    // --- BARRAS COLORIDAS ---
    colorBarContainer: {
        flexDirection: 'row',
        height: 16,
        width: '100%',
        marginBottom: 40,
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
    dateLocation: {
        textAlign: 'left',
        marginBottom: 20,
        fontSize: 12,
    },
    documentNumberText: {
        fontSize: 12,
        marginBottom: 20,
    },
    recipientBlock: {
        marginBottom: 20,
        lineHeight: 1.4,
    },
    recipientText: {
        fontSize: 12,
    },
    subjectBlock: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    subjectLabel: {
        fontWeight: 'bold',
        marginRight: 4,
    },
    vocative: {
        marginBottom: 15,
        textIndent: 40,
    },
    paragraph: {
        marginBottom: 10,
        textIndent: 40,
        textAlign: 'justify',
    },

    // --- ASSINATURA ---
    signatureContainer: {
        marginTop: 40,
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
    multiSignatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 40,
        marginBottom: 10,
    },
    signatureColumn: {
        width: '45%',
        alignItems: 'center',
    },
    signatureLine: {
        marginBottom: 2,
    },

    // --- RODAPÉ FIXO ---
    fixedFooter: {
        position: 'absolute',
        bottom: 20,
        left: 50,
        right: 40,
    },
});
