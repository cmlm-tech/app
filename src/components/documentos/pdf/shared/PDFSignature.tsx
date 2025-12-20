import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './PDFStyles';

interface PDFSignatureProps {
    autores?: string[];
    autor?: string;
    cargo: string;
}

// COMPONENTE EXTRAÍDO DO DocumentoPDF.tsx ORIGINAL
export function PDFSignature({ autores, autor, cargo }: PDFSignatureProps) {
    if (autores && autores.length > 0) {
        // Layout de duas colunas para múltiplos autores (Moção)
        return (
            <>
                {Array.from({ length: Math.ceil(autores.length / 2) }, (_, rowIndex) => (
                    <View key={rowIndex} style={pdfStyles.multiSignatureRow}>
                        {autores.slice(rowIndex * 2, rowIndex * 2 + 2).map((nomeAutor, colIndex) => (
                            <View key={colIndex} style={pdfStyles.signatureColumn}>
                                <Text style={pdfStyles.signatureName}>{nomeAutor}</Text>
                                <Text style={pdfStyles.signatureRole}>{cargo}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </>
        );
    }

    // Layout simples para um autor
    return (
        <View style={pdfStyles.signatureContainer}>
            <Text style={pdfStyles.signatureName}>{autor}</Text>
            <Text style={pdfStyles.signatureName}>{cargo}</Text>
        </View>
    );
}
