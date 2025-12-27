"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Stamp } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface BotaoProtocolarProps {
    documentoId: number;
    statusAtual: string;
    onSuccess?: () => void;
}

export function BotaoProtocolar({ documentoId, statusAtual, onSuccess }: BotaoProtocolarProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Só mostra o botão se o documento estiver em estado de rascunho
    if (statusAtual !== 'Rascunho') {
        return null;
    }

    const handleProtocolar = async () => {
        try {
            setIsLoading(true);

            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error("Usuário não autenticado.");
            }

            // Call RPC to protocol the document
            const { data, error } = await supabase.rpc('protocolar_documento', {
                p_documento_id: documentoId,
                p_usuario_id: user.id
            }) as { data: any; error: any };

            if (error) {
                console.error("Erro ao protocolar:", error);
                throw error;
            }

            const resultado = data as {
                protocolo_id: number;
                numero_protocolo_geral: number;
                numero_formatado: string;
                status: string;
                mensagem: string;
            };

            toast({
                title: "Documento Protocolado!",
                description: `Protocolo: ${resultado.numero_formatado}`,
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
        }
    };

    return (
        <Button
            onClick={handleProtocolar}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
            <Stamp className="w-4 h-4 mr-2" />
            {isLoading ? "Protocolando..." : "Protocolar"}
        </Button>
    );
}
