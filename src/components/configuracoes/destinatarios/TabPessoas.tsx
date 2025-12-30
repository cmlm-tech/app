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
    Pessoa,
    listarPessoas,
    criarPessoa,
    atualizarPessoa,
    verificarPessoaDuplicada,
    excluirPessoa
} from "@/services/destinatariosService";

export function TabPessoas() {
    const { toast } = useToast();
    const [pessoas, setPessoas] = useState<Pessoa[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [salvando, setSalvando] = useState(false);

    // Estado do formulário
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [tipoPessoa, setTipoPessoa] = useState<'fisica' | 'juridica'>('fisica');

    useEffect(() => {
        carregarPessoas();
    }, []);

    async function carregarPessoas() {
        setLoading(true);
        const dados = await listarPessoas();
        setPessoas(dados);
        setLoading(false);
    }

    function abrirNovo() {
        setEditandoId(null);
        setNome("");
        setCpf("");
        setEmail("");
        setTelefone("");
        setTipoPessoa('fisica');
        setModalOpen(true);
    }

    function abrirEditar(pessoa: Pessoa) {
        setEditandoId(pessoa.id);
        setNome(pessoa.nome);
        setCpf(pessoa.cpf || "");
        setEmail(pessoa.email || "");
        setTelefone(pessoa.telefone || "");
        setTipoPessoa(pessoa.tipo_pessoa);
        setModalOpen(true);
    }

    async function salvar() {
        if (!nome) {
            toast({ title: "Campo obrigatório", description: "Preencha o nome.", variant: "destructive" });
            return;
        }

        // Verificar duplicata
        const duplicata = await verificarPessoaDuplicada(nome, cpf, editandoId || undefined);
        if (duplicata) {
            toast({
                title: "Pessoa já existe",
                description: `Já existe uma pessoa cadastrada com este ${duplicata.cpf === cpf ? 'CPF' : 'nome'}.`,
                variant: "destructive"
            });
            return;
        }

        setSalvando(true);
        try {
            if (editandoId) {
                await atualizarPessoa(editandoId, { nome, cpf, email, telefone, tipo_pessoa: tipoPessoa });
                toast({ title: "Sucesso", description: "Pessoa atualizada!" });
            } else {
                await criarPessoa({ nome, cpf, email, telefone, tipo_pessoa: tipoPessoa });
                toast({ title: "Sucesso", description: "Pessoa criada!" });
            }
            setModalOpen(false);
            carregarPessoas();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao salvar pessoa.", variant: "destructive" });
        } finally {
            setSalvando(false);
        }
    }

    async function handleExcluir(id: number, nome: string) {
        if (!confirm(`Deseja realmente excluir "${nome}"?`)) return;

        const resultado = await excluirPessoa(id);
        toast({
            title: resultado.success ? "Sucesso" : "Erro",
            description: resultado.message,
            variant: resultado.success ? "default" : "destructive"
        });

        if (resultado.success) {
            carregarPessoas();
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Cadastre pessoas físicas ou jurídicas que podem ocupar cargos.</p>
                <Button onClick={abrirNovo} className="bg-gov-blue-600 hover:bg-gov-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Nova Pessoa
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>Nome</TableHead>
                            <TableHead>CPF/CNPJ</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="w-[120px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : pessoas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    Nenhuma pessoa cadastrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pessoas.map((pessoa) => (
                                <TableRow key={pessoa.id}>
                                    <TableCell className="font-medium">{pessoa.nome}</TableCell>
                                    <TableCell>{pessoa.cpf || "-"}</TableCell>
                                    <TableCell>{pessoa.email || "-"}</TableCell>
                                    <TableCell>{pessoa.telefone || "-"}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${pessoa.tipo_pessoa === 'fisica' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {pessoa.tipo_pessoa === 'fisica' ? 'Física' : 'Jurídica'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => abrirEditar(pessoa)}>
                                            <Pencil className="w-4 h-4 text-gov-blue-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleExcluir(pessoa.id, pessoa.nome)}>
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
                        <DialogTitle>{editandoId ? 'Editar Pessoa' : 'Nova Pessoa'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome Completo *</Label>
                            <Input
                                placeholder="Ex: João Silva ou Empresa LTDA"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>CPF/CNPJ</Label>
                                <Input
                                    placeholder="000.000.000-00"
                                    value={cpf}
                                    onChange={e => setCpf(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={tipoPessoa}
                                    onChange={e => setTipoPessoa(e.target.value as 'fisica' | 'juridica')}
                                >
                                    <option value="fisica">Física</option>
                                    <option value="juridica">Jurídica</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder="email@exemplo.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Telefone</Label>
                                <Input
                                    placeholder="(00) 00000-0000"
                                    value={telefone}
                                    onChange={e => setTelefone(e.target.value)}
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
