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
import { Plus, Pencil, Loader2, Calendar } from "lucide-react";
import {
    OcupacaoCargo,
    Pessoa,
    Cargo,
    Orgao,
    listarOcupacoes,
    listarPessoas,
    listarCargos,
    listarOrgaos,
    criarOcupacao,
    atualizarOcupacao,
    encerrarOcupacao
} from "@/services/destinatariosService";

export function TabOcupacoes() {
    const { toast } = useToast();
    const [ocupacoes, setOcupacoes] = useState<OcupacaoCargo[]>([]);
    const [pessoas, setPessoas] = useState<Pessoa[]>([]);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [orgaos, setOrgaos] = useState<Orgao[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [salvando, setSalvando] = useState(false);

    // Estado do formulário
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [pessoaId, setPessoaId] = useState<number | null>(null);
    const [cargoId, setCargoId] = useState<number | null>(null);
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [ativo, setAtivo] = useState(true);

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        setLoading(true);
        const [dadosOcupacoes, dadosPessoas, dadosCargos, dadosOrgaos] = await Promise.all([
            listarOcupacoes(),
            listarPessoas(),
            listarCargos(),
            listarOrgaos()
        ]);
        setOcupacoes(dadosOcupacoes);
        setPessoas(dadosPessoas);
        setCargos(dadosCargos);
        setOrgaos(dadosOrgaos);
        setLoading(false);
    }

    function abrirNovo() {
        setEditandoId(null);
        setPessoaId(null);
        setCargoId(null);
        setDataInicio(new Date().toISOString().split('T')[0]);
        setDataFim("");
        setAtivo(true);
        setModalOpen(true);
    }

    function abrirEditar(ocupacao: OcupacaoCargo) {
        setEditandoId(ocupacao.id);
        setPessoaId(ocupacao.pessoa_id);
        setCargoId(ocupacao.cargo_id);
        setDataInicio(ocupacao.data_inicio);
        setDataFim(ocupacao.data_fim || "");
        setAtivo(ocupacao.ativo);
        setModalOpen(true);
    }

    async function salvar() {
        if (!pessoaId || !cargoId || !dataInicio) {
            toast({ title: "Campos obrigatórios", description: "Preencha pessoa, cargo e data de início.", variant: "destructive" });
            return;
        }

        setSalvando(true);
        try {
            if (editandoId) {
                await atualizarOcupacao(editandoId, {
                    pessoa_id: pessoaId,
                    cargo_id: cargoId,
                    data_inicio: dataInicio,
                    data_fim: dataFim || undefined,
                    ativo
                });
                toast({ title: "Sucesso", description: "Ocupação atualizada!" });
            } else {
                await criarOcupacao({
                    pessoa_id: pessoaId,
                    cargo_id: cargoId,
                    data_inicio: dataInicio,
                    data_fim: dataFim || undefined,
                    ativo
                });
                toast({ title: "Sucesso", description: "Ocupação criada!" });
            }
            setModalOpen(false);
            carregarDados();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao salvar ocupação.", variant: "destructive" });
        } finally {
            setSalvando(false);
        }
    }

    async function handleEncerrar(ocupacaoId: number) {
        const hoje = new Date().toISOString().split('T')[0];
        const sucesso = await encerrarOcupacao(ocupacaoId, hoje);
        if (sucesso) {
            toast({ title: "Sucesso", description: "Ocupação encerrada!" });
            carregarDados();
        } else {
            toast({ title: "Erro", description: "Falha ao encerrar ocupação.", variant: "destructive" });
        }
    }

    function getPessoaNome(pessoaId: number): string {
        return pessoas.find(p => p.id === pessoaId)?.nome || "-";
    }

    function getCargoNome(cargoId: number): string {
        return cargos.find(c => c.id === cargoId)?.nome || "-";
    }

    function getOrgaoNome(cargoId: number): string {
        const cargo = cargos.find(c => c.id === cargoId);
        if (!cargo) return "-";
        return orgaos.find(o => o.id === cargo.orgao_id)?.nome || "-";
    }

    function formatarData(data: string): string {
        if (!data) return "-";
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Gerencie quando uma pessoa ocupa um cargo (histórico temporal).</p>
                <Button onClick={abrirNovo} className="bg-gov-blue-600 hover:bg-gov-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Nova Ocupação
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>Pessoa</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Órgão</TableHead>
                            <TableHead>Início</TableHead>
                            <TableHead>Fim</TableHead>
                            <TableHead className="w-[100px] text-center">Status</TableHead>
                            <TableHead className="w-[120px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : ocupacoes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                    Nenhuma ocupação cadastrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            ocupacoes.map((ocupacao) => (
                                <TableRow key={ocupacao.id} className={!ocupacao.ativo || ocupacao.data_fim ? "opacity-60 bg-gray-50" : ""}>
                                    <TableCell className="font-medium">{getPessoaNome(ocupacao.pessoa_id)}</TableCell>
                                    <TableCell>{getCargoNome(ocupacao.cargo_id)}</TableCell>
                                    <TableCell>{getOrgaoNome(ocupacao.cargo_id)}</TableCell>
                                    <TableCell>{formatarData(ocupacao.data_inicio)}</TableCell>
                                    <TableCell>{ocupacao.data_fim ? formatarData(ocupacao.data_fim) : <span className="text-green-600 font-medium">Atual</span>}</TableCell>
                                    <TableCell className="text-center">
                                        {ocupacao.ativo && !ocupacao.data_fim ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                Inativo
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => abrirEditar(ocupacao)}>
                                            <Pencil className="w-4 h-4 text-gov-blue-600" />
                                        </Button>
                                        {ocupacao.ativo && !ocupacao.data_fim && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEncerrar(ocupacao.id)}
                                                title="Encerrar ocupação"
                                            >
                                                <Calendar className="w-4 h-4 text-orange-600" />
                                            </Button>
                                        )}
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
                        <DialogTitle>{editandoId ? 'Editar Ocupação' : 'Nova Ocupação'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Pessoa *</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={pessoaId || ""}
                                onChange={e => setPessoaId(Number(e.target.value))}
                            >
                                <option value="">Selecione uma pessoa...</option>
                                {pessoas.map(pessoa => (
                                    <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Cargo *</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={cargoId || ""}
                                onChange={e => setCargoId(Number(e.target.value))}
                            >
                                <option value="">Selecione um cargo...</option>
                                {cargos.map(cargo => (
                                    <option key={cargo.id} value={cargo.id}>
                                        {cargo.nome} ({getOrgaoNome(cargo.id)})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Data de Início *</Label>
                                <Input
                                    type="date"
                                    value={dataInicio}
                                    onChange={e => setDataInicio(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Data de Fim</Label>
                                <Input
                                    type="date"
                                    value={dataFim}
                                    onChange={e => setDataFim(e.target.value)}
                                />
                                <p className="text-xs text-gray-500">Deixe em branco se ainda ocupa o cargo.</p>
                            </div>
                        </div>
                        {editandoId && (
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="ativo-ocupacao"
                                    checked={ativo}
                                    onCheckedChange={setAtivo}
                                />
                                <Label htmlFor="ativo-ocupacao" className="cursor-pointer">
                                    Ocupação Ativa
                                </Label>
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
