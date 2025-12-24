import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from '../shared/PDFHeader';
import { PDFFooter } from '../shared/PDFFooter';
import { pdfStyles } from '../shared/PDFStyles';

// Estilos específicos para a Pauta
const pautaStyles = StyleSheet.create({
    page: {
        ...pdfStyles.page,
        paddingTop: 130,
        paddingBottom: 60,
    },
    title: {
        fontSize: 14,
        fontFamily: 'Times-Bold',
        textAlign: 'center',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 20,
        color: '#444',
    },
    sectionHeader: {
        fontSize: 12,
        fontFamily: 'Times-Bold',
        backgroundColor: '#07077f',
        color: 'white',
        padding: 6,
        paddingLeft: 10,
        marginTop: 15,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    itemRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    itemOrdem: {
        width: 30,
        fontSize: 10,
        fontFamily: 'Times-Bold',
        textAlign: 'center',
    },
    itemContent: {
        flex: 1,
        paddingLeft: 8,
    },
    itemProtocolo: {
        fontSize: 10,
        fontFamily: 'Times-Bold',
        color: '#07077f',
    },
    itemEmenta: {
        fontSize: 9,
        color: '#333',
        marginTop: 2,
    },
    itemAutor: {
        fontSize: 8,
        color: '#666',
        marginTop: 2,
        fontStyle: 'italic',
    },
    emptySection: {
        textAlign: 'center',
        color: '#999',
        fontSize: 10,
        fontStyle: 'italic',
        paddingVertical: 10,
    },
    footer: {
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 10,
    },
    footerText: {
        fontSize: 9,
        textAlign: 'center',
        color: '#666',
    },
    totalItens: {
        fontSize: 10,
        textAlign: 'right',
        marginTop: 15,
        color: '#333',
    },
});

export interface ItemPautaPDF {
    ordem: number;
    protocolo: string;
    tipo: string;
    ementa: string;
    autor: string;
}

export interface PautaPDFProps {
    sessaoTitulo: string;
    sessaoData: string;
    sessaoHora: string;
    sessaoLocal?: string;
    itensExpediente: ItemPautaPDF[];
    itensOrdemDoDia: ItemPautaPDF[];
    itensExplicacoes: ItemPautaPDF[];
}

function formatarData(dataISO: string): string {
    try {
        const date = new Date(dataISO);
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return dataISO;
    }
}

function ItemPautaRow({ item }: { item: ItemPautaPDF }) {
    return (
        <View style={pautaStyles.itemRow}>
            <Text style={pautaStyles.itemOrdem}>{item.ordem}.</Text>
            <View style={pautaStyles.itemContent}>
                <Text style={pautaStyles.itemProtocolo}>
                    {item.protocolo}
                </Text>
                <Text style={pautaStyles.itemEmenta}>
                    {item.ementa || 'Sem ementa'}
                </Text>
                <Text style={pautaStyles.itemAutor}>
                    Autor: {item.autor}
                </Text>
            </View>
        </View>
    );
}

function SecaoPauta({ titulo, itens }: { titulo: string; itens: ItemPautaPDF[] }) {
    return (
        <View>
            <Text style={pautaStyles.sectionHeader}>{titulo}</Text>
            {itens.length > 0 ? (
                itens.map((item, index) => (
                    <ItemPautaRow key={index} item={item} />
                ))
            ) : (
                <Text style={pautaStyles.emptySection}>
                    Nenhum item nesta seção
                </Text>
            )}
        </View>
    );
}

export default function PautaPDF({
    sessaoTitulo,
    sessaoData,
    sessaoHora,
    sessaoLocal = 'Plenário da Câmara Municipal',
    itensExpediente,
    itensOrdemDoDia,
    itensExplicacoes,
}: PautaPDFProps) {
    const totalItens = itensExpediente.length + itensOrdemDoDia.length + itensExplicacoes.length;
    const dataFormatada = formatarData(sessaoData);

    return (
        <Document>
            <Page size="A4" style={pautaStyles.page}>
                <PDFHeader />

                {/* Título da Pauta */}
                <View>
                    <Text style={pautaStyles.title}>PAUTA DA SESSÃO</Text>
                    <Text style={pautaStyles.subtitle}>
                        {sessaoTitulo}
                    </Text>
                    <Text style={pautaStyles.subtitle}>
                        {dataFormatada} às {sessaoHora} | {sessaoLocal}
                    </Text>
                </View>

                {/* Seções da Pauta */}
                <SecaoPauta titulo="I - Expediente" itens={itensExpediente} />
                <SecaoPauta titulo="II - Ordem do Dia" itens={itensOrdemDoDia} />
                <SecaoPauta titulo="III - Explicações Pessoais" itens={itensExplicacoes} />

                {/* Total de Itens */}
                <Text style={pautaStyles.totalItens}>
                    Total de itens na pauta: {totalItens}
                </Text>

                {/* Rodapé */}
                <View style={pautaStyles.footer}>
                    <Text style={pautaStyles.footerText}>
                        Documento gerado eletronicamente pelo Sistema de Gestão Legislativa
                    </Text>
                </View>

                <PDFFooter />
            </Page>
        </Document>
    );
}
