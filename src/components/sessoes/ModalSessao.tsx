import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { useEffect, useState } from "react";
import { TipoSessao } from "@/services/sessoesService";

const schema = z.object({
  tipo: z.enum(["Ordinária", "Extraordinária", "Solene"]),
  data: z.date(),
  hora: z.string().min(1, "Informe o horário"),
  local: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Sessao = {
  id?: string;
  tipo: TipoSessao;
  data: string; // ISO
  hora: string;
  titulo: string;
  status: "Agendada" | "Em Andamento" | "Realizada" | "Cancelada" | "Adiada" | "Suspensa";
  local?: string;
  observacoes?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: Sessao, isEdit: boolean) => void;
  sessao: Sessao | null;
};

export default function ModalSessao({ open, onClose, onSave, sessao }: Props) {
  const isEdit = !!sessao;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: sessao
      ? {
        tipo: sessao.tipo,
        data: sessao.data ? parseISO(sessao.data) : new Date(),
        hora: sessao.hora || "16:00",
        local: sessao.local || "Plenário da Câmara Municipal",
        observacoes: sessao.observacoes || "",
      }
      : {
        tipo: "Ordinária",
        data: new Date(),
        hora: "16:00", // Default às 16h
        local: "Plenário da Câmara Municipal",
        observacoes: "",
      },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = form;

  useEffect(() => {
    if (sessao) {
      setValue("tipo", sessao.tipo);
      setValue("data", sessao.data ? parseISO(sessao.data) : new Date());
      setValue("hora", sessao.hora || "16:00");
      setValue("local", sessao.local || "Plenário da Câmara Municipal");
      setValue("observacoes", sessao.observacoes || "");
    } else {
      reset({
        tipo: "Ordinária",
        data: new Date(),
        hora: "16:00",
        local: "Plenário da Câmara Municipal",
        observacoes: "",
      });
    }
  }, [sessao, setValue, reset]);

  const onSubmit = (data: FormValues) => {
    onSave({
      id: sessao?.id,
      tipo: data.tipo,
      data: data.data.toISOString().slice(0, 10),
      hora: data.hora,
      titulo: "", // Será gerado automaticamente pelo backend
      status: sessao?.status ?? "Agendada",
      local: data.local,
      observacoes: data.observacoes,
    }, isEdit);
  };

  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Sessão" : "Agendar Nova Sessão"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Edite as informações da sessão e salve as alterações."
              : "Preencha os dados para agendar uma nova sessão legislativa."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tipo da Sessão */}
          <div>
            <label className="block font-medium mb-1 text-sm">Tipo da Sessão</label>
            <select
              {...register("tipo")}
              className="w-full border rounded p-2 text-sm"
              defaultValue={form.getValues("tipo")}
            >
              <option value="Ordinária">Ordinária</option>
              <option value="Extraordinária">Extraordinária</option>
              <option value="Solene">Solene</option>
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block font-medium mb-1 text-sm">Data</label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch("data")
                    ? format(watch("data"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch("data")}
                  onSelect={(date) => {
                    if (date) {
                      setValue("data", date);
                      setCalendarOpen(false);
                    }
                  }}
                  locale={ptBR}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.data && <p className="text-red-600 text-sm">{errors.data.message}</p>}
          </div>

          {/* Hora */}
          <div>
            <label className="block font-medium mb-1 text-sm">Hora de Início</label>
            <Input
              type="time"
              {...register("hora")}
              defaultValue="16:00"
            />
            {errors.hora && <p className="text-red-600 text-sm">{errors.hora.message}</p>}
          </div>

          {/* Local */}
          <div>
            <label className="block font-medium mb-1 text-sm">Local</label>
            <Input
              type="text"
              {...register("local")}
              placeholder="Plenário da Câmara Municipal"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block font-medium mb-1 text-sm">Observações (opcional)</label>
            <Textarea
              {...register("observacoes")}
              placeholder="Informações adicionais sobre a sessão..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-gov-blue-700 hover:bg-gov-blue-800">
              {isEdit ? "Salvar Alterações" : "Agendar Sessão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
