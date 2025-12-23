import React from 'react';
import MocaoPDF from './pdf/templates/MocaoPDF';
import OficioPDF from './pdf/templates/OficioPDF';
import ProjetoLeiPDF from './pdf/templates/ProjetoLeiPDF';
import RequerimentoPDF from './pdf/templates/RequerimentoPDF';
import DecretoLegislativoPDF from './pdf/templates/DecretoLegislativoPDF';
import IndicacaoPDF from './pdf/templates/IndicacaoPDF';

interface DocumentoPDFProps {
    tipo: string;
    numero: string;
    dataProtocolo: string;
    texto: string;
    autor: string;
    autorCargo?: string;
    pronomeTratamento?: string;
    destinatarioNome?: string;
    destinatarioCargo?: string;
    destinatarioOrgao?: string;
    ementa?: string;
    autores?: string[] | any[];
    membrosComissao?: { nome: string; cargo: string }[];
}

/**
 * Componente orquestrador que seleciona o template apropriado
 * baseado no tipo de documento.
 * 
 * Código original refatorado em componentes modulares:
 * - pdf/shared: componentes reutilizáveis (Header, Footer, Signature, Styles)
 * - pdf/templates: templates específicos por tipo de documento
 */
export function DocumentoPDF(props: DocumentoPDFProps) {
    const { tipo, autorCargo = "Vereador(a)", pronomeTratamento = "Ao Ilmo. Sr." } = props;

    switch (tipo) {
        case 'Moção':
            return (
                <MocaoPDF
                    numero={props.numero}
                    dataProtocolo={props.dataProtocolo}
                    texto={props.texto}
                    autorCargo={autorCargo}
                    ementa={props.ementa}
                    autores={props.autores}
                />
            );

        case 'Ofício':
            return (
                <OficioPDF
                    numero={props.numero}
                    dataProtocolo={props.dataProtocolo}
                    texto={props.texto}
                    autor={props.autor}
                    autorCargo={autorCargo}
                    pronomeTratamento={pronomeTratamento}
                    destinatarioNome={props.destinatarioNome}
                    destinatarioCargo={props.destinatarioCargo}
                    destinatarioOrgao={props.destinatarioOrgao}
                />
            );

        case 'Projeto de Lei':
            return (
                <ProjetoLeiPDF
                    numero={props.numero}
                    dataProtocolo={props.dataProtocolo}
                    texto={props.texto}
                    autor={props.autor}
                    autorCargo={autorCargo}
                    ementa={props.ementa}
                />
            );

        case 'Requerimento':
            return (
                <RequerimentoPDF
                    numero={props.numero}
                    dataProtocolo={props.dataProtocolo}
                    texto={props.texto}
                    autor={props.autor}
                    autorCargo={autorCargo}
                    pronomeTratamento={pronomeTratamento}
                    destinatarioNome={props.destinatarioNome}
                    destinatarioCargo={props.destinatarioCargo}
                    destinatarioOrgao={props.destinatarioOrgao}
                />
            );

        case 'Projeto de Decreto Legislativo':
            return (
                <DecretoLegislativoPDF
                    numero={props.numero}
                    dataProtocolo={props.dataProtocolo}
                    texto={props.texto}
                    autor={props.autor}
                    autorCargo={autorCargo}
                    ementa={props.ementa}
                    membrosComissao={props.membrosComissao}
                />
            );

        case 'Indicação':
            return (
                <IndicacaoPDF
                    numero={props.numero}
                    dataProtocolo={props.dataProtocolo}
                    texto={props.texto}
                    autor={props.autor}
                    autorCargo={autorCargo}
                    destinatario={props.destinatarioNome}
                    indicacao={props.ementa}
                />
            );

        default:
            // Fallback para Ofício
            console.warn(`Tipo de documento não reconhecido: "${tipo}". Usando template de Ofício.`);
            return (
                <OficioPDF
                    numero={props.numero}
                    dataProtocolo={props.dataProtocolo}
                    texto={props.texto}
                    autor={props.autor}
                    autorCargo={autorCargo}
                    pronomeTratamento={pronomeTratamento}
                    destinatarioNome={props.destinatarioNome}
                    destinatarioCargo={props.destinatarioCargo}
                    destinatarioOrgao={props.destinatarioOrgao}
                />
            );
    }
}
