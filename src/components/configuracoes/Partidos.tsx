import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getPartidos, createPartido, updatePartido, deactivatePartido, reactivatePartido } from '@/services/partidosService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, XCircle, CheckCircle, Upload, Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type Partido = {
    id: number;
    sigla: string;
    nome_completo: string;
    logo_url: string | null;
    cor_principal: string | null;
    ativo: boolean;
};

export function AbaPartidos() {
    const { toast } = useToast();
    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState<Partido | null>(null);
    const [salvando, setSalvando] = useState(false);

    // Form state
    const [sigla, setSigla] = useState('');
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [corPrincipal, setCorPrincipal] = useState('#000000');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        carregarPartidos();
    }, []);

    async function carregarPartidos() {
        setLoading(true);
        try {
            const data = await getPartidos(false); // Incluir inativos
            setPartidos(data);
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: 'Erro ao carregar partidos.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    function abrirModal(partido?: Partido) {
        if (partido) {
            setEditando(partido);
            setSigla(partido.sigla);
            setNomeCompleto(partido.nome_completo);
            setCorPrincipal(partido.cor_principal || '#000000');
            setLogoPreview(partido.logo_url);
        } else {
            setEditando(null);
            limparFormulario();
        }
        setModalOpen(true);
    }

    function limparFormulario() {
        setSigla('');
        setNomeCompleto('');
        setCorPrincipal('#000000');
        setLogoFile(null);
        setLogoPreview(null);
    }

    function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    async function uploadLogo(partidoSigla: string): Promise<string | null> {
        if (!logoFile) return null;

        try {
            const fileExt = logoFile.name.split('.').pop();
            const fileName = `${partidoSigla.toLowerCase()}.${fileExt}`;
            const filePath = `partidos/${fileName}`;

            // Upload para Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, logoFile, {
                    upsert: true, // Substituir se já existir
                });

            if (uploadError) throw uploadError;

            // Obter URL pública
            const { data } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error: any) {
            console.error('Erro ao fazer upload do logo:', error);
            toast({
                title: 'Erro no upload',
                description: 'Erro ao fazer upload do logo.',
                variant: 'destructive',
            });
            return null;
        }
    }

    async function handleSalvar() {
        if (!sigla || !nomeCompleto) {
            toast({
                title: 'Campos obrigatórios',
                description: 'Sigla e Nome Completo são obrigatórios.',
                variant: 'destructive',
            });
            return;
        }

        setSalvando(true);
        try {
            // Upload logo se houver
            let logoUrl = editando?.logo_url || null;
            if (logoFile) {
                const uploadedUrl = await uploadLogo(sigla);
                if (uploadedUrl) logoUrl = uploadedUrl;
            }

            const dadosPartido = {
                sigla: sigla.toUpperCase(),
                nome_completo: nomeCompleto,
                cor_principal: corPrincipal,
                logo_url: logoUrl,
                ativo: true,
            };

            if (editando) {
                // Atualizar
                await updatePartido(editando.id, dadosPartido);
                toast({
                    title: 'Sucesso!',
                    description: 'Partido atualizado com sucesso.',
                });
            } else {
                // Criar
                await createPartido(dadosPartido);
                toast({
                    title: 'Sucesso!',
                    description: 'Partido criado com sucesso.',
                });
            }

            setModalOpen(false);
            limparFormulario();
            carregarPartidos();
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error.message || 'Erro ao salvar partido.',
                variant: 'destructive',
            });
        } finally {
            setSalvando(false);
        }
    }

    async function handleToggleAtivo(partido: Partido) {
        try {
            if (partido.ativo) {
                await deactivatePartido(partido.id);
                toast({
                    title: 'Partido desativado',
                    description: `${partido.sigla} foi desativado.`,
                });
            } else {
                await reactivatePartido(partido.id);
                toast({
                    title: 'Partido reativado',
                    description: `${partido.sigla} foi reativado.`,
                });
            }
            carregarPartidos();
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error.message,
                variant: 'destructive',
            });
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gov-blue-800">Partidos Políticos</h2>
                    <p className="text-sm text-gray-600">Gerencie os partidos políticos cadastrados no sistema</p>
                </div>
                <Button onClick={() => abrirModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Partido
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-8">Carregando partidos...</div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">Logo</TableHead>
                                <TableHead>Sigla</TableHead>
                                <TableHead>Nome Completo</TableHead>
                                <TableHead className="w-32">Cor</TableHead>
                                <TableHead className="w-24">Status</TableHead>
                                <TableHead className="w-32 text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partidos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Nenhum partido cadastrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                partidos.map((partido) => (
                                    <TableRow key={partido.id}>
                                        <TableCell>
                                            {partido.logo_url ? (
                                                <img
                                                    src={partido.logo_url}
                                                    alt={partido.sigla}
                                                    className="h-10 w-10 object-contain"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                                                    Sem logo
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-semibold">{partido.sigla}</TableCell>
                                        <TableCell>{partido.nome_completo}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-8 h-8 rounded border"
                                                    style={{ backgroundColor: partido.cor_principal || '#ccc' }}
                                                />
                                                <span className="text-xs text-gray-500">
                                                    {partido.cor_principal || 'N/A'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={partido.ativo ? 'default' : 'secondary'}>
                                                {partido.ativo ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => abrirModal(partido)}
                                                    title="Editar"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleAtivo(partido)}
                                                    title={partido.ativo ? 'Desativar' : 'Reativar'}
                                                >
                                                    {partido.ativo ? (
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Modal Criar/Editar */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar Partido' : 'Novo Partido'}
                        </DialogTitle>
                        <DialogDescription>
                            {editando
                                ? 'Atualize os dados do partido'
                                : 'Preencha os dados do novo partido'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="sigla">Sigla *</Label>
                            <Input
                                id="sigla"
                                placeholder="Ex: MDB"
                                value={sigla}
                                onChange={(e) => setSigla(e.target.value.toUpperCase())}
                                maxLength={30}
                            />
                        </div>

                        <div>
                            <Label htmlFor="nome">Nome Completo *</Label>
                            <Input
                                id="nome"
                                placeholder="Ex: Movimento Democrático Brasileiro"
                                value={nomeCompleto}
                                onChange={(e) => setNomeCompleto(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="cor">Cor Principal</Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    id="cor"
                                    type="color"
                                    value={corPrincipal}
                                    onChange={(e) => setCorPrincipal(e.target.value)}
                                    className="w-20 h-10"
                                />
                                <Input
                                    type="text"
                                    value={corPrincipal}
                                    onChange={(e) => setCorPrincipal(e.target.value)}
                                    placeholder="#000000"
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="logo">Logo do Partido</Label>
                            <div className="space-y-2">
                                {logoPreview && (
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={logoPreview}
                                            alt="Preview"
                                            className="h-16 w-16 object-contain border rounded p-1"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setLogoFile(null);
                                                setLogoPreview(null);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Remover
                                        </Button>
                                    </div>
                                )}
                                <Input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                />
                                <p className="text-xs text-gray-500">
                                    Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 1MB
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setModalOpen(false)}
                            disabled={salvando}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleSalvar} disabled={salvando}>
                            {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Criar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
