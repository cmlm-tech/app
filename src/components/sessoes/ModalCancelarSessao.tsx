import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo?: string) => void;
  dataSessao: string; // ISO
};

export default function ModalCancelarSessao({ open, onClose, onConfirm, dataSessao }: Props) {
  const [motivo, setMotivo] = useState("");

  const handleConfirm = () => {
    onConfirm(motivo || undefined);
    setMotivo("");
  };

  const handleClose = () => {
    setMotivo("");
    onClose();
  };

  // Handle invalid date gracefully
  let dataFormatada = "data inválida";
  try {
    if (dataSessao) {
      dataFormatada = format(parseISO(dataSessao), "dd/MM/yyyy");
    }
  } catch {
    dataFormatada = dataSessao || "data não informada";
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Cancelamento</DialogTitle>
          <DialogDescription>
            Esta ação cancelará a sessão legislativa.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 space-y-4">
          <p>
            Tem certeza que deseja cancelar a sessão de{" "}
            <span className="font-medium">{dataFormatada}</span>?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo do cancelamento (opcional)
            </label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Informe o motivo do cancelamento..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Manter Sessão</Button>
          <Button variant="destructive" onClick={handleConfirm}>Sim, Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
