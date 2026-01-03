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
    gerarPdfBlob?: (isOficial?: boolean) => Promise<Blob>;
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
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Só mostra o botão se o documento estiver em estado de rascunho
    if (statusAtual !== 'Rascunho') {
        return null;
    }

    const handlePreValidacao = () => {
        if (!numeroOficial) {
            toast({
                title: "Número Oficial Necessário",
                description: "Clique no botão 'Gerar Número' antes de protocolar o documento.",
                variant: "destructive",
                duration: 5000
            });
            return;
        }
        setConfirmOpen(true);
    };

    const handleProtocolar = async () => {
        // Fechar modal primeiro
        setConfirmOpen(false);

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
                    const pdfBlob = await gerarPdfBlob(true); // isOficial = true para remover marca d'água

                    setEtapa("Enviando para Storage...");
                    const anoDoc = ano || new Date().getFullYear();

                    // Extrair apenas o número (001) do numeroOficial (001/2026)
                    let numero = numeroOficial || numeroProtocolo;
                    if (typeof numero === 'string' && numero.includes('/')) {
                        numero = numero.split('/')[0]; // Pega apenas "001" de "001/2026"
                    }

                    // Buscar autor do documento (para Ofícios)
                    let autorId: number | undefined;
                    const { data: autorData } = await supabase
                        .from('documentoautores')
                        .select('autor_id')
                        .eq('documento_id', documentoId)
                        .single();

                    if (autorData) {
                        autorId = autorData.autor_id;
                    }

                    const { url, hash } = await uploadMateriaPDF(
                        pdfBlob,
                        tipoDocumento || 'documento',
                        numero,
                        anoDoc,
                        documentoId,
                        autorId // Passa autorId para Ofícios
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
                numeroOficial || numeroProtocolo,
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
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Button
                onClick={handlePreValidacao}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
                {buttonContent}
            </Button>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Protocolação?</AlertDialogTitle>
                    <div className="text-sm text-muted-foreground space-y-3 pt-2">
                        <p>Ao protocolar este documento:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Será atribuído número de protocolo permanente</li>
                            <li>O PDF oficial será gerado e salvo</li>
                            <li>O status mudará para <strong className="text-foreground">Protocolado</strong></li>
                            <li className="text-red-500 font-medium">⚠️ NÃO poderá mais ser editado</li>
                        </ul>
                        <p className="pt-2">Confirma o protocolamento?</p>
                    </div>
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

