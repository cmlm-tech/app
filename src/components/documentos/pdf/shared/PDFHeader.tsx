import { View, Text, Image } from '@react-pdf/renderer';
import { pdfStyles } from './PDFStyles';

// COMPONMENTE EXTRAÍDO DO DocumentoPDF.tsx ORIGINAL
export function PDFHeader() {
    return (
        <View style={pdfStyles.fixedHeader} fixed>
            <View style={pdfStyles.headerContainer}>
                <Image src="/logo-camara.png" style={pdfStyles.logo} />

                <View style={pdfStyles.headerTextColumn}>
                    <Text style={pdfStyles.headerTitle}>CÂMARA MUNICIPAL DE</Text>
                    <Text style={pdfStyles.headerSubtitle}>LAVRAS DA MANGABEIRA – CE</Text>
                    <Text style={pdfStyles.headerAddress}>
                        Rua Monsenhor Meceno, S/N, Centro, Lavras da Mangabeira - CE
                    </Text>
                    <Text style={pdfStyles.headerAddress}>
                        CEP: 63.300-000 | CNPJ: 12.464.996/0001-75
                    </Text>
                </View>
            </View>

            <View style={pdfStyles.colorBarContainer}>
                <View style={pdfStyles.barBlue} />
                <View style={pdfStyles.barGold} />
            </View>
        </View>
    );
}
