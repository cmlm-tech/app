
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

const schema = z.object({
  tipo: z.enum(["Ordinária", "Extraordinária", "Solene"]),
  data: z.date(),
  hora: z.string().min(1),
  titulo: z.string().min(1, "Digite um título/descrição"),
});

type FormValues = z.infer<typeof schema>;
type Sessao = {
  id?: string;
  tipo: "Ordinária" | "Extraordinária" | "Solene";
  data: string; // ISO
  hora: string;
  titulo: string;
  status: "Agendada" | "Realizada" | "Cancelada";
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: Sessao, isEdit: boolean) => void;
  sessao: Sessao | null;
};

export default function ModalSessao({ open, onClose, onSave, sessao }: Props) {
  const isEdit = !!sessao;
  // Para garantir que data seja objeto Date
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: sessao
      ? {
          tipo: sessao.tipo,
          data: parseISO(sessao.data),
          hora: sessao.hora,
          titulo: sessao.titulo,
        }
      : {
          tipo: "Ordinária",
          data: new Date(),
          hora: "",
          titulo: "",
        },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  useEffect(() => {
    if (sessao) {
      setValue("tipo", sessao.tipo);
      setValue("data", parseISO(sessao.data));
      setValue("hora", sessao.hora);
      setValue("titulo", sessao.titulo);
    }
  }, [sessao, setValue]);

  const onSubmit = (data: FormValues) => {
    onSave({
      id: sessao?.id,
      tipo: data.tipo,
      data: data.data.toISOString().slice(0, 10),
      hora: data.hora,
      titulo: data.titulo,
      status: sessao?.status ?? "Agendada"
    }, isEdit);
  };

  // Date/time helpers
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Sessão" : "Agendar Nova Sessão"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Edite as informações da sessão e salve as alterações."
              : "Preencha os dados para agendar uma nova sessão."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Tipo da Sessão</label>
            <select
              {...register("tipo")}
              className="w-full border rounded p-2"
              defaultValue={form.getValues("tipo")}
            >
              <option value="Ordinária">Ordinária</option>
              <option value="Extraordinária">Extraordinária</option>
              <option value="Solene">Solene</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Data</label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch("data")
                    ? format(watch("data"), "dd 'de' MMMM 'de' yyyy")
                    : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch("data")}
                  onSelect={(date) => {
                    setValue("data", date!);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.data && <p className="text-red-600 text-sm">{errors.data.message}</p>}
          </div>
          <div>
            <label className="block font-medium mb-1">Hora de Início</label>
            <Input type="time" {...register("hora")} />
            {errors.hora && <p className="text-red-600 text-sm">{errors.hora.message}</p>}
          </div>
          <div>
            <label className="block font-medium mb-1">Título / Descrição</label>
            <Input type="text" {...register("titulo")} />
            {errors.titulo && <p className="text-red-600 text-sm">{errors.titulo.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{isEdit ? "Salvar" : "Agendar Sessão"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
