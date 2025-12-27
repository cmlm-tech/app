import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from '../shared/PDFHeader';
import { PDFFooter } from '../shared/PDFFooter';
import { pdfStyles } from '../shared/PDFStyles';

// Estilos específicos para o Relatório de Votação
const votacaoStyles = StyleSheet.create({
    page: {
        ...pdfStyles.page,
        paddingTop: 150,
        paddingBottom: 60,
    },
    title: {
        fontSize: 14,
        fontFamily: 'Times-Bold',
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    infoBlock: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 4,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 10,
        fontFamily: 'Times-Bold',
        width: 80,
        color: '#333',
    },
    infoValue: {
        fontSize: 10,
        flex: 1,
        color: '#444',
    },
    resultadoBox: {
        marginVertical: 15,
        padding: 12,
        borderWidth: 2,
        borderRadius: 4,
        alignItems: 'center',
    },
    resultadoAprovado: {
        borderColor: '#22c55e',
        backgroundColor: '#f0fdf4',
    },
    resultadoRejeitado: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    resultadoText: {
        fontSize: 16,
        fontFamily: 'Times-Bold',
        marginBottom: 6,
    },
    resultadoAprovadoText: {
        color: '#166534',
    },
    resultadoRejeitadoText: {
        color: '#991b1b',
    },
    contagem: {
        fontSize: 11,
        color: '#555',
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Times-Bold',
        backgroundColor: '#07077f',
        color: 'white',
        padding: 6,
        paddingLeft: 10,
        marginTop: 10,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#07077f',
        paddingBottom: 6,
        marginBottom: 4,
    },
    tableHeaderCell: {
        fontSize: 10,
        fontFamily: 'Times-Bold',
        color: '#333',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 5,
    },
    tableCell: {
        fontSize: 10,
        color: '#444',
    },
    colNome: {
        width: '60%',
    },
    colVoto: {
        width: '40%',
    },
    votoFavoravel: {
        color: '#166534',
    },
    votoContrario: {
        color: '#991b1b',
    },
    votoAbstencao: {
        color: '#92400e',
    },
    signatureContainer: {
        marginTop: 50,
        alignItems: 'center',
        // @ts-ignore - propriedade válida no react-pdf para evitar quebra de página
        break: 'avoid',
    },
    signatureName: {
        fontSize: 11,
        fontFamily: 'Times-Bold',
        textAlign: 'center',
    },
    signatureRole: {
        fontSize: 10,
        textAlign: 'center',
        color: '#555',
    },
    dataEmissao: {
        marginTop: 30,
        fontSize: 9,
        textAlign: 'right',
        color: '#666',
    },
});

export interface VotoVereador {
    nome: string;
    voto: 'Favorável' | 'Contrário' | 'Abstenção';
}

export interface RelatorioVotacaoPDFProps {
    materia: {
        tipo: string;
        numero: string;
        ano: number;
        ementa: string;
        autor: string;
    };
    sessao: {
        titulo: string;
        data: string;
    };
    resultado: 'Aprovado' | 'Rejeitado';
    votos: {
        favoraveis: number;
        contrarios: number;
        abstencoes: number;
    };
    votosDetalhados: VotoVereador[];
    presidenteNome: string;
    votacaoSecreta?: boolean;
}

function formatarData(dataISO: string): string {
    try {
        const date = new Date(dataISO);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return dataISO;
    }
}

function getVotoStyle(voto: string) {
    if (voto === 'Favorável') return votacaoStyles.votoFavoravel;
    if (voto === 'Contrário') return votacaoStyles.votoContrario;
    return votacaoStyles.votoAbstencao;
}

function getVotoIcon(voto: string) {
    if (voto === 'Favorável') return '✓';
    if (voto === 'Contrário') return '✗';
    return '○';
}

export default function RelatorioVotacaoPDF({
    materia,
    sessao,
    resultado,
    votos,
    votosDetalhados,
    presidenteNome,
    votacaoSecreta = false,
}: RelatorioVotacaoPDFProps) {
    const isAprovado = resultado === 'Aprovado';
    const dataEmissao = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Document>
            <Page size="A4" style={votacaoStyles.page}>
                <PDFHeader />

                {/* Título */}
                <Text style={votacaoStyles.title}>
                    Certidão de Resultado de Votação
                </Text>

                {/* Informações da Matéria */}
                <View style={votacaoStyles.infoBlock}>
                    <View style={votacaoStyles.infoRow}>
                        <Text style={votacaoStyles.infoLabel}>Matéria:</Text>
                        <Text style={votacaoStyles.infoValue}>
                            {materia.tipo} {materia.numero}/{materia.ano}
                        </Text>
                    </View>
                    <View style={votacaoStyles.infoRow}>
                        <Text style={votacaoStyles.infoLabel}>Ementa:</Text>
                        <Text style={votacaoStyles.infoValue}>{materia.ementa}</Text>
                    </View>
                    <View style={votacaoStyles.infoRow}>
                        <Text style={votacaoStyles.infoLabel}>Autor:</Text>
                        <Text style={votacaoStyles.infoValue}>{materia.autor}</Text>
                    </View>
                    <View style={votacaoStyles.infoRow}>
                        <Text style={votacaoStyles.infoLabel}>Sessão:</Text>
                        <Text style={votacaoStyles.infoValue}>
                            {sessao.titulo} - {formatarData(sessao.data)}
                        </Text>
                    </View>
                </View>

                {/* Resultado da Votação */}
                <View style={[
                    votacaoStyles.resultadoBox,
                    isAprovado ? votacaoStyles.resultadoAprovado : votacaoStyles.resultadoRejeitado
                ]}>
                    <Text style={[
                        votacaoStyles.resultadoText,
                        isAprovado ? votacaoStyles.resultadoAprovadoText : votacaoStyles.resultadoRejeitadoText
                    ]}>
                        {resultado.toUpperCase()}
                    </Text>
                    <Text style={votacaoStyles.contagem}>
                        Favoráveis: {votos.favoraveis} | Contrários: {votos.contrarios} | Abstenções: {votos.abstencoes}
                    </Text>
                </View>

                {/* Tabela de Votos */}
                {votacaoSecreta ? (
                    <View style={[votacaoStyles.infoBlock, { marginTop: 20 }]}>
                        <Text style={{ textAlign: 'center', fontSize: 12, fontFamily: 'Times-Bold', color: '#B45309' }}>
                            VOTAÇÃO SECRETA
                        </Text>
                        <Text style={{ textAlign: 'center', fontSize: 10, marginTop: 5, color: '#555' }}>
                            Os votos individuais são mantidos sob sigilo conforme regimento interno.
                            Apenas o resultado consolidado é exibido neste relatório.
                        </Text>
                    </View>
                ) : (
                    <>
                        <Text style={votacaoStyles.sectionTitle}>Votos Nominais</Text>

                        <View style={votacaoStyles.tableHeader}>
                            <Text style={[votacaoStyles.tableHeaderCell, votacaoStyles.colNome]}>
                                Vereador(a)
                            </Text>
                            <Text style={[votacaoStyles.tableHeaderCell, votacaoStyles.colVoto]}>
                                Voto
                            </Text>
                        </View>

                        {votosDetalhados.map((voto, index) => (
                            <View key={index} style={votacaoStyles.tableRow}>
                                <Text style={[votacaoStyles.tableCell, votacaoStyles.colNome]}>
                                    {voto.nome}
                                </Text>
                                <Text style={[votacaoStyles.tableCell, votacaoStyles.colVoto, getVotoStyle(voto.voto)]}>
                                    {getVotoIcon(voto.voto)} {voto.voto}
                                </Text>
                            </View>
                        ))}
                    </>
                )}

                {/* Assinatura do Presidente */}
                <View style={votacaoStyles.signatureContainer}>
                    <Text style={votacaoStyles.signatureName}>{presidenteNome}</Text>
                    <Text style={votacaoStyles.signatureRole}>Presidente da Sessão</Text>
                </View>

                {/* Data de Emissão */}
                <Text style={votacaoStyles.dataEmissao}>
                    Documento gerado em: {dataEmissao}
                </Text>

                <PDFFooter />
            </Page>
        </Document>
    );
}
