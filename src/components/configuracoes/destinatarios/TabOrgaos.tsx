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
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Loader2, Trash2 } from "lucide-react";
import {
    Orgao,
    listarOrgaos,
    criarOrgao,
    atualizarOrgao,
    verificarOrgaoDuplicado,
    excluirOrgao
} from "@/services/destinatariosService";

export function TabOrgaos() {
    const { toast } = useToast();
    const [orgaos, setOrgaos] = useState<Orgao[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [salvando, setSalvando] = useState(false);

    // Estado do formulário
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [nome, setNome] = useState("");
    const [tipoOrgao, setTipoOrgao] = useState("");
    const [enderecoLogradouro, setEnderecoLogradouro] = useState("");
    const [enderecoCidade, setEnderecoCidade] = useState("");
    const [enderecoUf, setEnderecoUf] = useState("");

    useEffect(() => {
        carregarOrgaos();
    }, []);

    async function carregarOrgaos() {
        setLoading(true);
        const dados = await listarOrgaos();
        setOrgaos(dados);
        setLoading(false);
    }

    function abrirNovo() {
        setEditandoId(null);
        setNome("");
        setTipoOrgao("");
        setEnderecoLogradouro("");
        setEnderecoCidade("");
        setEnderecoUf("");
        setModalOpen(true);
    }

    function abrirEditar(orgao: Orgao) {
        setEditandoId(orgao.id);
        setNome(orgao.nome);
        setTipoOrgao(orgao.tipo_orgao || "");
        setEnderecoLogradouro(orgao.endereco_logradouro || "");
        setEnderecoCidade(orgao.endereco_cidade || "");
        setEnderecoUf(orgao.endereco_uf || "");
        setModalOpen(true);
    }

    async function salvar() {
        if (!nome) {
            toast({ title: "Campo obrigatório", description: "Preencha o nome do órgão.", variant: "destructive" });
            return;
        }

        // Verificar duplicata
        const duplicata = await verificarOrgaoDuplicado(nome, editandoId || undefined);
        if (duplicata) {
            toast({
                title: "Órgão já existe",
                description: "Já existe um órgão cadastrado com este nome.",
                variant: "destructive"
            });
            return;
        }

        setSalvando(true);
        try {
            if (editandoId) {
                await atualizarOrgao(editandoId, {
                    nome,
                    tipo_orgao: tipoOrgao,
                    endereco_logradouro: enderecoLogradouro,
                    endereco_cidade: enderecoCidade,
                    endereco_uf: enderecoUf
                });
                toast({ title: "Sucesso", description: "Órgão atualizado!" });
            } else {
                await criarOrgao({
                    nome,
                    tipo_orgao: tipoOrgao,
                    endereco_logradouro: enderecoLogradouro,
                    endereco_cidade: enderecoCidade,
                    endereco_uf: enderecoUf
                });
                toast({ title: "Sucesso", description: "Órgão criado!" });
            }
            setModalOpen(false);
            carregarOrgaos();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao salvar órgão.", variant: "destructive" });
        } finally {
            setSalvando(false);
        }
    }

    async function handleExcluir(id: number, nome: string) {
        if (!confirm(`Deseja realmente excluir "${nome}"?`)) return;

        const resultado = await excluirOrgao(id);
        toast({
            title: resultado.success ? "Sucesso" : "Erro",
            description: resultado.message,
            variant: resultado.success ? "default" : "destructive"
        });

        if (resultado.success) {
            carregarOrgaos();
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Cadastre órgãos públicos, secretarias e entidades.</p>
                <Button onClick={abrirNovo} className="bg-gov-blue-600 hover:bg-gov-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Novo Órgão
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Cidade</TableHead>
                            <TableHead>UF</TableHead>
                            <TableHead className="w-[120px] text-right">Ações</TableHead>
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
                        ) : orgaos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    Nenhum órgão cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orgaos.map((orgao) => (
                                <TableRow key={orgao.id}>
                                    <TableCell className="font-medium">{orgao.nome}</TableCell>
                                    <TableCell>{orgao.tipo_orgao || "-"}</TableCell>
                                    <TableCell>{orgao.endereco_cidade || "-"}</TableCell>
                                    <TableCell>{orgao.endereco_uf || "-"}</TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => abrirEditar(orgao)}>
                                            <Pencil className="w-4 h-4 text-gov-blue-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleExcluir(orgao.id, orgao.nome)}>
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
                        <DialogTitle>{editandoId ? 'Editar Órgão' : 'Novo Órgão'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome do Órgão *</Label>
                            <Input
                                placeholder="Ex: Secretaria de Saúde"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={tipoOrgao}
                                onChange={e => setTipoOrgao(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                <option value="Prefeitura">Prefeitura</option>
                                <option value="Secretaria">Secretaria</option>
                                <option value="Camara">Câmara Municipal</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Endereço (Logradouro)</Label>
                            <Input
                                placeholder="Ex: Rua Principal, 123"
                                value={enderecoLogradouro}
                                onChange={e => setEnderecoLogradouro(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label>Cidade</Label>
                                <Input
                                    placeholder="Ex: São Paulo"
                                    value={enderecoCidade}
                                    onChange={e => setEnderecoCidade(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>UF</Label>
                                <Input
                                    placeholder="SP"
                                    maxLength={2}
                                    value={enderecoUf}
                                    onChange={e => setEnderecoUf(e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>
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
