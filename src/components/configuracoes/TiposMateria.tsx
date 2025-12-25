import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Undo } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/database.types";

type TipoDocumento = Database['public']['Tables']['tiposdedocumento']['Row'];

export const AbaTiposMateria = () => {
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const { toast } = useToast();

  // Carregar dados
  const loadTipos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tiposdedocumento')
        .select('*')
        .order('nome');

      if (error) throw error;
      setTipos(data || []);
    } catch (error) {
      console.error('Erro ao carregar tipos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tipos de documento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTipos();
  }, []);

  // Atualizar configuração
  const updateConfig = async (id: number, field: keyof TipoDocumento, value: any) => {
    try {
      setSaving(id);

      // Atualizar localmente primeiro (otimista)
      setTipos(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));

      const { error } = await supabase
        .from('tiposdedocumento')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;

    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro ao salvar",
        description: "A alteração não pôde ser salva.",
        variant: "destructive"
      });
      loadTipos(); // Reverter
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gov-blue-800">Gerenciar Tipos de Matéria</h2>
            <p className="text-sm text-gray-500">Configure as regras de tramitação para cada tipo de documento.</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Nome do Tipo</TableHead>
                <TableHead className="text-center">Exige Parecer</TableHead>
                <TableHead className="text-center">Leitura em Expediente</TableHead>
                <TableHead className="text-center">Turnos de Votação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipos.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell className="font-medium">
                    {tipo.nome}
                    {saving === tipo.id && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={tipo.exige_parecer || false}
                        onCheckedChange={(checked) => updateConfig(tipo.id, 'exige_parecer', checked)}
                      />
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={tipo.exige_leitura !== false} // Default true
                        onCheckedChange={(checked) => updateConfig(tipo.id, 'exige_leitura', checked)}
                      />
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Select
                      value={String(tipo.votacao_turnos || 1)}
                      onValueChange={(val) => updateConfig(tipo.id, 'votacao_turnos', parseInt(val))}
                    >
                      <SelectTrigger className="w-[100px] mx-auto h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Turno</SelectItem>
                        <SelectItem value="2">2 Turnos</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};