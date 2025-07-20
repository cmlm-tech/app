// src/components/atas/ModalNovaAta.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ata } from "./types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Adicionamos um tipo para a Sessão, que é a fonte dos nossos dados.
// No futuro, isso também viria de um arquivo central de tipos.
export type SessaoParaAta = {
    id: string;
    numero: number;
    tipoSessao: 'Ordinária' | 'Extraordinária' | 'Solene';
    dataAbertura: Date;
    totalPresentes: number;
    totalDeliberacoes: number;
}

interface ModalNovaAtaProps {
    aberto: boolean;
    onClose: () => void;
    onRegistrar: (novaAta: Omit<Ata, "id">) => void;
    // O modal agora recebe uma lista de sessões elegíveis
    sessoes: SessaoParaAta[];
}

export default function ModalNovaAta({ aberto, onClose, onRegistrar, sessoes }: ModalNovaAtaProps) {
    const [selectedSessaoId, setSelectedSessaoId] = useState<string | null>(null);

    if (!aberto) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSessaoId) return; // Não faz nada se nenhuma sessão for selecionada

        // Encontra a sessão completa com base no ID selecionado
        const sessaoSelecionada = sessoes.find(s => s.id === selectedSessaoId);
        if (!sessaoSelecionada) return;

        // **A MÁGICA DA AUTOMAÇÃO ACONTECE AQUI**
        // Transforma os dados da Sessão em um novo objeto Ata.
        const novaAtaGerada: Omit<Ata, "id"> = {
            numeroSessao: sessaoSelecionada.numero,
            tipoSessao: sessaoSelecionada.tipoSessao,
            dataRealizacao: sessaoSelecionada.dataAbertura,
            status: 'Realizada', // Assume que a ata é gerada para uma sessão já realizada
            resumoPauta: `Ata da ${sessaoSelecionada.numero}ª Sessão ${sessaoSelecionada.tipoSessao}, realizada em ${format(sessaoSelecionada.dataAbertura, "dd/MM/yyyy")}.`,
            materiasDeliberadas: sessaoSelecionada.totalDeliberacoes,
            presentes: sessaoSelecionada.totalPresentes,
            linkPDF: undefined, // O PDF será adicionado posteriormente
        };

        onRegistrar(novaAtaGerada);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-gov-blue-800 mb-4">Gerar Ata de Sessão</h2>
                <p className="text-gray-600 mb-6">Selecione uma sessão já realizada para extrair os dados e gerar a ata correspondente automaticamente.</p>
                <form onSubmit={handleSubmit}>
                    
                    <Select onValueChange={setSelectedSessaoId} value={selectedSessaoId || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma sessão..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sessoes.length > 0 ? (
                            sessoes.map(sessao => (
                                <SelectItem key={sessao.id} value={sessao.id}>
                                    {`${sessao.numero}ª Sessão ${sessao.tipoSessao} - ${format(sessao.dataAbertura, "dd/MM/yyyy")}`}
                                </SelectItem>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500">Nenhuma sessão disponível para gerar ata.</p>
                        )}
                      </SelectContent>
                    </Select>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button 
                          type="submit" 
                          className="bg-gov-blue-700 hover:bg-gov-blue-800"
                          // Desabilita o botão se nenhuma sessão for selecionada
                          disabled={!selectedSessaoId}
                        >
                          Gerar Ata
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}