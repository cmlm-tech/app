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
import { Plus, Pencil, Loader2, Trash2 } from "lucide-react";
import {
    Cargo,
    Orgao,
    listarCargos,
    listarOrgaos,
    criarCargo,
    atualizarCargo,
    excluirCargo
} from "@/services/destinatariosService";

export function TabCargos() {
    const { toast } = useToast();
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [orgaos, setOrgaos] = useState<Orgao[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [salvando, setSalvando] = useState(false);

    // Estado do formulário
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [nome, setNome] = useState("");
    const [orgaoId, setOrgaoId] = useState<number | null>(null);
    const [permiteGenerico, setPermiteGenerico] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        setLoading(true);
        const [dadosCargos, dadosOrgaos] = await Promise.all([
            listarCargos(),
            listarOrgaos()
        ]);
        setCargos(dadosCargos);
        setOrgaos(dadosOrgaos);
        setLoading(false);
    }

    function abrirNovo() {
        setEditandoId(null);
        setNome("");
        setOrgaoId(null);
        setPermiteGenerico(false);
        setModalOpen(true);
    }

    function abrirEditar(cargo: Cargo) {
        setEditandoId(cargo.id);
        setNome(cargo.nome);
        setOrgaoId(cargo.orgao_id);
        setPermiteGenerico(cargo.permite_generico);
        setModalOpen(true);
    }

    async function salvar() {
        if (!nome || !orgaoId) {
            toast({ title: "Campos obrigatórios", description: "Preencha nome e órgão.", variant: "destructive" });
            return;
        }

        setSalvando(true);
        try {
            if (editandoId) {
                await atualizarCargo(editandoId, { nome, orgao_id: orgaoId, permite_generico: permiteGenerico });
                toast({ title: "Sucesso", description: "Cargo atualizado!" });
            } else {
                await criarCargo({ nome, orgao_id: orgaoId, permite_generico: permiteGenerico });
                toast({ title: "Sucesso", description: "Cargo criado!" });
            }
            setModalOpen(false);
            carregarDados();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao salvar cargo.", variant: "destructive" });
        } finally {
            setSalvando(false);
        }
    }

    function getOrgaoNome(orgaoId: number): string {
        return orgaos.find(o => o.id === orgaoId)?.nome || "-";
    }

    async function handleExcluir(id: number, nome: string) {
        if (!confirm(`Deseja realmente excluir "${nome}"?`)) return;

        const resultado = await excluirCargo(id);
        toast({
            title: resultado.success ? "Sucesso" : "Erro",
            description: resultado.message,
            variant: resultado.success ? "default" : "destructive"
        });

        if (resultado.success) {
            carregarDados();
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Cadastre cargos/funções vinculados aos órgãos.</p>
                <Button onClick={abrirNovo} className="bg-gov-blue-600 hover:bg-gov-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Novo Cargo
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>Nome do Cargo</TableHead>
                            <TableHead>Órgão</TableHead>
                            <TableHead className="w-[150px]">Permite Genérico</TableHead>
                            <TableHead className="w-[120px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : cargos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    Nenhum cargo cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            cargos.map((cargo) => (
                                <TableRow key={cargo.id}>
                                    <TableCell className="font-medium">{cargo.nome}</TableCell>
                                    <TableCell>{getOrgaoNome(cargo.orgao_id)}</TableCell>
                                    <TableCell>
                                        {cargo.permite_generico ? (
                                            <span className="text-green-600 text-sm">✓ Sim</span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">✗ Não</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => abrirEditar(cargo)}>
                                            <Pencil className="w-4 h-4 text-gov-blue-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleExcluir(cargo.id, cargo.nome)}>
                                            <Trash2 className="w-4 h-4 text-red-600" />
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
                        <DialogTitle>{editandoId ? 'Editar Cargo' : 'Novo Cargo'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome do Cargo *</Label>
                            <Input
                                placeholder="Ex: Secretário Municipal"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Órgão *</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={orgaoId || ""}
                                onChange={e => setOrgaoId(Number(e.target.value))}
                            >
                                <option value="">Selecione um órgão...</option>
                                {orgaos.map(orgao => (
                                    <option key={orgao.id} value={orgao.id}>{orgao.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="permite-generico"
                                checked={permiteGenerico}
                                onCheckedChange={setPermiteGenerico}
                            />
                            <Label htmlFor="permite-generico" className="cursor-pointer">
                                Permite envio genérico (sem pessoa específica)
                            </Label>
                        </div>
                        <p className="text-xs text-gray-500">
                            Se marcado, permite enviar documentos "Ao Secretário de Saúde" sem especificar o nome da pessoa.
                        </p>
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
