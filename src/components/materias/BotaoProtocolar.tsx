"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Stamp, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { registrarProtocolo } from "@/services/atividadeLogService";
import { uploadMateriaPDF, atualizarUrlPDF, atualizarHashProtocolo } from "@/services/storageService";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BotaoProtocolarProps {
    documentoId: number;
    statusAtual: string;
    tipoDocumento?: string;
    ano?: number;
    onSuccess?: () => void;
    /** Callback para gerar o PDF blob. Se fornecido, o PDF será armazenado no Storage */
    gerarPdfBlob?: () => Promise<Blob>;
    /** Número oficial do documento (se já existir) */
    numeroOficial?: number | string;
}

export function BotaoProtocolar({
    documentoId,
    statusAtual,
    tipoDocumento,
    ano,
    onSuccess,
    gerarPdfBlob,
    numeroOficial
}: BotaoProtocolarProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [etapa, setEtapa] = useState<string>("");

    // Só mostra o botão se o documento estiver em estado de rascunho
    if (statusAtual !== 'Rascunho') {
        return null;
    }

    const handleProtocolar = async () => {
        try {
            setIsLoading(true);
            setEtapa("Autenticando...");

            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error("Usuário não autenticado.");
            }

            setEtapa("Protocolando...");

            // Call RPC to protocol the document
            const { data, error } = await supabase.rpc('protocolar_documento', {
                p_documento_id: documentoId,
                p_usuario_id: user.id
            } as any);

            if (error) {
                console.error("Erro ao protocolar:", error);
                throw error;
            }

            // O resultado da RPC é um array - pegamos o primeiro item
            // Usando any para flexibilidade com diferentes versões dos tipos
            const resultadoArray = data as any[];
            const resultado = resultadoArray?.[0] || {};

            // Extrair campos com fallbacks seguros
            const protocoloId: number = resultado.protocolo_id || 0;
            const numeroProtocolo: number = resultado.numero_protocolo_geral || resultado.numero_protocolo || 0;
            const anoProtocolo: number = resultado.ano || new Date().getFullYear();
            const numeroFormatado: string = resultado.numero_formatado || `${anoProtocolo}.${String(numeroProtocolo).padStart(7, '0')}`;

            // Se callback de gerar PDF foi fornecido, fazer upload para Storage
            if (gerarPdfBlob) {
                try {
                    setEtapa("Gerando PDF oficial...");
                    const pdfBlob = await gerarPdfBlob();

                    setEtapa("Enviando para Storage...");
                    const anoDoc = ano || new Date().getFullYear();
                    const numero = numeroOficial || numeroProtocolo;

                    const { url, hash } = await uploadMateriaPDF(
                        pdfBlob,
                        tipoDocumento || 'documento',
                        numero,
                        anoDoc,
                        documentoId
                    );

                    // Atualizar URL do PDF no documento
                    await atualizarUrlPDF(documentoId, url);

                    // Atualizar hash no protocolo
                    if (protocoloId) {
                        await atualizarHashProtocolo(protocoloId, hash);
                    }

                    console.log("PDF armazenado:", { url, hash });
                } catch (storageError: any) {
                    // Log do erro mas não falha a protocolação
                    console.error("Erro ao armazenar PDF (protocolo continuará):", storageError);
                    toast({
                        title: "Aviso",
                        description: "Documento protocolado, mas houve erro ao armazenar PDF. O PDF pode ser gerado manualmente.",
                        variant: "default"
                    });
                }
            }

            // Registrar atividade no log
            // Buscar AUTOR do documento (vereador propositor)
            const { data: autorData } = await supabase
                .from('documentoautores')
                .select('autor_id')
                .eq('documento_id', documentoId)
                .limit(1)
                .maybeSingle();

            const agenteId = autorData?.autor_id;

            const anoAtual = new Date().getFullYear();
            await registrarProtocolo(
                documentoId,
                tipoDocumento || 'Documento',
                numeroProtocolo,
                anoAtual,
                agenteId || undefined
            );

            toast({
                title: "Documento Protocolado!",
                description: `Protocolo: ${numeroFormatado}`,
                className: "bg-green-600 text-white"
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            const errorMsg = error?.message || error?.error_description || "Erro ao protocolar documento.";
            toast({
                title: "Erro",
                description: errorMsg,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
            setEtapa("");
        }
    };

    const buttonContent = (
        <>
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {etapa || "Protocolando..."}
                </>
            ) : (
                <>
                    <Stamp className="w-4 h-4 mr-2" />
                    Protocolar
                </>
            )}
        </>
    );

    if (isLoading) {
        return (
            <Button
                disabled
                className="bg-indigo-600 text-white"
            >
                {buttonContent}
            </Button>
        );
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {buttonContent}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Protocolação?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação oficializa o documento no sistema.
                        Após protocolar, o documento receberá um número oficial e <strong>não poderá mais ser editado</strong>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleProtocolar}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        Confirmar e Protocolar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

