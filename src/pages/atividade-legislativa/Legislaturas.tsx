import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowRight, Plus, MoreVertical, Edit, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient'
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [legislaturas, setLegislaturas] = useState<Legislatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissaoLogado, setPermissaoLogado] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLegislatura, setEditingLegislatura] = useState<Legislatura | null>(null);

  const isAdmin = permissaoLogado?.toLowerCase() === 'admin';

  const fetchLegislaturas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('legislaturas')
        .select('*')
        .order('numero', { ascending: false });

      if (error) throw error;
      setLegislaturas(data || []);
    } catch (error) {
      console.error('Erro ao buscar legislaturas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar legislaturas. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setLoading(true);
      if (user) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('permissao')
          .eq('id', user.id)
          .single();
        setPermissaoLogado(perfil?.permissao || null);
      } else {
        setPermissaoLogado(null);
      }
      await fetchLegislaturas();
      setLoading(false);
    };
    carregarDadosIniciais();
  }, [user, fetchLegislaturas]);

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
    setModalOpen(false);
  };

  const formatarPeriodo = (dataInicio: string, dataFim: string) => {
    const inicio = new Date(dataInicio).getFullYear();
    const fim = new Date(dataFim).getFullYear();
    return `${inicio} - ${fim}`;
  };

  const handleCardClick = (numero: number) => {
    navigate(`/atividade-legislativa/legislaturas/${numero}`);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gov-blue-800">Legislaturas</h1>
          <p className="text-base md:text-lg text-gray-600">
            {isAdmin
              ? "Selecione uma legislatura para gerenciar seus períodos legislativos."
              : "Consulte os detalhes e os períodos de cada legislatura."
            }
          </p>
        </div>
        {isAdmin && legislaturas.length > 0 && (
          <Button
            onClick={handleNovaLegislatura}
            className="bg-gov-blue-800 hover:bg-gov-blue-700 text-white flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Legislatura
          </Button>
        )}
      </div>

      {legislaturas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhuma legislatura encontrada.</p>
          {isAdmin && (
            <Button
              onClick={handleNovaLegislatura}
              className="mt-4 bg-gov-blue-800 hover:bg-gov-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira legislatura
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {legislaturas.map((leg) => (
            <div key={leg.id} className="relative">
              <Card 
                onClick={() => handleCardClick(leg.numero)}
                className="hover:shadow-lg hover:border-gov-blue-500 transition-all duration-200 cursor-pointer h-full flex flex-col"
              >
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
              
              {isAdmin && (
                <div 
                  className="absolute top-2 right-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* ALTERAÇÃO 2: Substituição do DropdownMenu pelo Popover.
                    O PopoverTrigger é o botão de 3 pontos.
                    O PopoverContent contém o botão "Editar", que agora deve funcionar.
                  */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleEditarLegislatura(leg)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    </PopoverContent>
                  </Popover>
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