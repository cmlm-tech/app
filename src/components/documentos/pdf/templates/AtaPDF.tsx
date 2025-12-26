import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFHeader } from "../shared/PDFHeader";
import { PDFFooter } from "../shared/PDFFooter";

interface AtaPDFProps {
    sessaoNumero: string;
    sessaoTipo: string;
    data: string;
    textoAta: string;
    presidente: string;
    secretario: string;
}

const styles = StyleSheet.create({
    page: {
        fontFamily: "Times-Roman",
        fontSize: 12,
        paddingTop: 130,
        paddingBottom: 60,
        paddingHorizontal: 60,
        lineHeight: 1.6,
    },
    title: {
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        marginTop: 10,
    },
    body: {
        textAlign: "justify",
        marginBottom: 30,
    },
    assinaturas: {
        marginTop: 50,
        paddingTop: 20,
    },
    assinatura: {
        marginTop: 40,
        textAlign: "center",
    },
    linha: {
        borderTop: "1pt solid black",
        width: 250,
        marginBottom: 4,
        marginLeft: "auto",
        marginRight: "auto",
    },
    nome: {
        fontSize: 10,
        fontWeight: "bold",
    },
    cargo: {
        fontSize: 9,
        color: "#666",
    },
});

export default function AtaPDF({
    sessaoNumero,
    sessaoTipo,
    data,
    textoAta,
    presidente,
    secretario,
}: AtaPDFProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <PDFHeader />

                <View>
                    <Text style={styles.title}>
                        ATA DA {sessaoNumero} SESSÃO {sessaoTipo.toUpperCase()}
                    </Text>
                </View>

                <View style={styles.body}>
                    <Text>{textoAta}</Text>
                </View>

                <View style={styles.assinaturas}>
                    {/* Assinatura do Presidente */}
                    <View style={styles.assinatura}>
                        <View style={styles.linha} />
                        <Text style={styles.nome}>{presidente}</Text>
                        <Text style={styles.cargo}>Presidente da Sessão</Text>
                    </View>

                    {/* Assinatura do Secretário */}
                    <View style={styles.assinatura}>
                        <View style={styles.linha} />
                        <Text style={styles.nome}>{secretario}</Text>
                        <Text style={styles.cargo}>Secretário</Text>
                    </View>
                </View>

                <PDFFooter />
            </Page>
        </Document>
    );
}
