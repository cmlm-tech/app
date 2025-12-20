import { View } from '@react-pdf/renderer';
import { pdfStyles } from './PDFStyles';

// COMPONENTE EXTRAÍDO DO DocumentoPDF.tsx ORIGINAL
export function PDFFooter() {
    return (
        <View style={pdfStyles.fixedFooter} fixed>
            <View style={pdfStyles.footerBarContainer}>
                <View style={pdfStyles.barBlue} />
                <View style={pdfStyles.barGold} />
            </View>
        </View>
    );
}
