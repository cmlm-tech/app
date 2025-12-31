import React from 'react';
import { Text } from '@react-pdf/renderer';

interface WatermarkProps {
    isRascunho?: boolean;
}

/**
 * Componente de marca d'água para PDFs de rascunho.
 * Renderiza "RASCUNHO" em diagonal no centro da página.
 */
export default function Watermark({ isRascunho }: WatermarkProps) {
    if (!isRascunho) return null;

    return (
        <Text
            style={{
                position: 'absolute',
                fontSize: 80,
                color: 'rgba(200, 200, 200, 0.3)',
                transform: 'rotate(-45deg)',
                top: '45%',
                left: '15%',
                fontWeight: 'bold',
            }}
            fixed
        >
            RASCUNHO
        </Text>
    );
}
