import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Loader2, Check, X } from "lucide-react";
import {
    Destinatario,
    listarTodosDestinatarios,
    criarDestinatario,
    atualizarDestinatario,
    toggleAtivoDestinatario
} from "@/services/destinatariosService";

export function AbaDestinatarios() {
    const { toast } = useToast();
    const [destinatarios, setDestinatarios] = useState<Destinatario[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [salvando, setSalvando] = useState(false);

    // Estado do formulário
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [nome, setNome] = useState("");
    const [cargo, setCargo] = useState("");
    const [orgao, setOrgao] = useState("");
    const [ativo, setAtivo] = useState(true);

    useEffect(() => {
        carregarDestinatarios();
    }, []);

    async function carregarDestinatarios() {
        setLoading(true);
        const dados = await listarTodosDestinatarios();
        setDestinatarios(dados);
        setLoading(false);
    }

    function abrirNovo() {
        setEditandoId(null);
        setNome("");
        setCargo("");
        setOrgao("");
        setAtivo(true);
        setModalOpen(true);
    }

    function abrirEditar(dest: Destinatario) {
        setEditandoId(dest.id);
        setNome(dest.nome);
        setCargo(dest.cargo);
        setOrgao(dest.orgao);
        setAtivo(dest.ativo);
        setModalOpen(true);
    }

    async function salvar() {
        if (!nome || !cargo || !orgao) {
            toast({ title: "Campos obrigatórios", description: "Preencha Nome, Cargo e Órgão.", variant: "destructive" });
            return;
        }

        setSalvando(true);
        try {
            if (editandoId) {
                // Atualizar
                await atualizarDestinatario(editandoId, { nome, cargo, orgao, ativo });
                toast({ title: "Sucesso", description: "Destinatário atualizado!" });
            } else {
                // Criar
                const novo = await criarDestinatario(nome, cargo, orgao);
                // Se criar, precisamos ver se salvou o ativo corretamente (criarDestinatario no service original não recebia 'ativo', assumia true. Se quisermos suportar criar inativo, precisaria alterar service, mas por padrão cria ativo, o que é OK)
                if (novo && !ativo) {
                    await toggleAtivoDestinatario(novo.id, false);
                }
                toast({ title: "Sucesso", description: "Destinatário criado!" });
            }
            setModalOpen(false);
            carregarDestinatarios();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao salvar destinatário.", variant: "destructive" });
        } finally {
            setSalvando(false);
        }
    }

    async function toggleStatus(dest: Destinatario) {
        // Otimista
        const novoStatus = !dest.ativo;
        setDestinatarios(prev => prev.map(d => d.id === dest.id ? { ...d, ativo: novoStatus } : d));

        const sucesso = await toggleAtivoDestinatario(dest.id, novoStatus);
        if (!sucesso) {
            // Reverter
            setDestinatarios(prev => prev.map(d => d.id === dest.id ? { ...d, ativo: !novoStatus } : d));
            toast({ title: "Erro", description: "Não foi possível alterar o status.", variant: "destructive" });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-lg font-semibold text-gov-blue-800">Gerenciar Destinatários</h2>
                    <p className="text-sm text-gray-500">Cadastre órgãos e autoridades frequentes para os ofícios.</p>
                </div>
                <Button onClick={abrirNovo} className="bg-gov-blue-600 hover:bg-gov-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Novo Destinatário
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>Nome (Busca)</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Órgão</TableHead>
                            <TableHead className="w-[100px] text-center">Status</TableHead>
                            <TableHead className="w-[100px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : destinatarios.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    Nenhum destinatário cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            destinatarios.map((dest) => (
                                <TableRow key={dest.id} className={!dest.ativo ? "opacity-60 bg-gray-50" : ""}>
                                    <TableCell className="font-medium">{dest.nome}</TableCell>
                                    <TableCell>{dest.cargo}</TableCell>
                                    <TableCell>{dest.orgao}</TableCell>
                                    <TableCell className="text-center">
                                        <button
                                            title={dest.ativo ? "Desativar" : "Ativar"}
                                            onClick={() => toggleStatus(dest)}
                                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors ${dest.ativo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                                        >
                                            {dest.ativo ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => abrirEditar(dest)}>
                                            <Pencil className="w-4 h-4 text-gov-blue-600" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editandoId ? 'Editar Destinatário' : 'Novo Destinatário'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome Principal (Para busca e exibição)</Label>
                            <Input
                                placeholder="Ex: Secretaria de Saúde ou Dr. João Silva"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                            />
                            <p className="text-xs text-gray-500">Este é o nome que aparecerá nas sugestões de busca.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cargo</Label>
                                <Input
                                    placeholder="Ex: Secretário Municipal"
                                    value={cargo}
                                    onChange={e => setCargo(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Órgão</Label>
                                <Input
                                    placeholder="Ex: Prefeitura"
                                    value={orgao}
                                    onChange={e => setOrgao(e.target.value)}
                                />
                            </div>
                        </div>

                        {editandoId && (
                            <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                    id="ativo-mode"
                                    checked={ativo}
                                    onCheckedChange={setAtivo}
                                />
                                <Label htmlFor="ativo-mode">Cadastro Ativo</Label>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                        <Button onClick={salvar} disabled={salvando} className="bg-gov-blue-600 hover:bg-gov-blue-700 text-white">
                            {salvando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
