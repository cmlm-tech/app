
import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, MoreVertical, Edit, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ModalLegislatura } from '@/components/legislaturas/ModalLegislatura';

interface Legislatura {
  id: number;
  numero: number;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  numero_vagas_vereadores: number;
}

const Legislaturas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [legislaturas, setLegislaturas] = useState<Legislatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissaoLogado, setPermissaoLogado] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLegislatura, setEditingLegislatura] = useState<Legislatura | null>(null);

  // Verificação de permissão seguindo o padrão obrigatório
  useEffect(() => {
    const fetchUserPermission = async () => {
      if (user) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('permissao')
          .eq('id', user.id)
          .single();
        setPermissaoLogado(perfil?.permissao || null);
      }
    };
    fetchUserPermission();
  }, [user]);

  const isStaff = ['admin', 'assessoria', 'secretaria'].includes(permissaoLogado?.toLowerCase() || '');

  // Buscar legislaturas do Supabase
  const fetchLegislaturas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legislaturas')
        .select('*')
        .order('numero', { ascending: false });

      if (error) {
        throw error;
      }

      setLegislaturas(data || []);
    } catch (error) {
      console.error('Erro ao buscar legislaturas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar legislaturas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegislaturas();
  }, []);

  const handleNovaLegislatura = () => {
    setEditingLegislatura(null);
    setModalOpen(true);
  };

  const handleEditarLegislatura = (legislatura: Legislatura) => {
    setEditingLegislatura(legislatura);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingLegislatura(null);
  };

  const handleModalSuccess = () => {
    fetchLegislaturas();
  };

  const formatarPeriodo = (dataInicio: string, dataFim: string) => {
    const inicio = new Date(dataInicio).getFullYear();
    const fim = new Date(dataFim).getFullYear();
    return `${inicio} - ${fim}`;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-gov-blue-800" />
            <p className="text-gray-600">Carregando legislaturas...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">Legislaturas</h1>
          <p className="text-gray-600 text-lg">Selecione uma legislatura para gerenciar seus períodos legislativos.</p>
        </div>
        {isStaff && (
          <Button 
            onClick={handleNovaLegislatura}
            className="bg-gov-blue-800 hover:bg-gov-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Legislatura
          </Button>
        )}
      </div>

      {legislaturas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhuma legislatura encontrada.</p>
          {isStaff && (
            <Button 
              onClick={handleNovaLegislatura}
              className="mt-4 bg-gov-blue-800 hover:bg-gov-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira legislatura
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {legislaturas.map((leg) => (
            <div key={leg.id} className="relative">
              <Link to={`/atividade-legislativa/legislaturas/${leg.id}`} className="block">
                <Card className="hover:shadow-lg hover:border-gov-blue-500 transition-all duration-200 cursor-pointer h-full flex flex-col">
                  <CardHeader className="flex-grow">
                    <CardTitle className="text-gov-blue-800">
                      {leg.descricao || `Legislatura ${formatarPeriodo(leg.data_inicio, leg.data_fim)}`}
                    </CardTitle>
                    <CardDescription>
                      {formatarPeriodo(leg.data_inicio, leg.data_fim)} • {leg.numero_vagas_vereadores} vagas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end items-center text-sm font-semibold text-gov-blue-700">
                      Ver detalhes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {isStaff && (
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.preventDefault();
                        handleEditarLegislatura(leg);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ModalLegislatura
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        legislatura={editingLegislatura}
      />
    </AppLayout>
  );
};

export default Legislaturas;
