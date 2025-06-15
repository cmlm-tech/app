
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  dataSessao: string; // ISO
};

export default function ModalCancelarSessao({ open, onClose, onConfirm, dataSessao }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Cancelamento</DialogTitle>
        </DialogHeader>
        <div className="my-4">
          Tem certeza que deseja cancelar a sessão de <span className="font-medium">{format(parseISO(dataSessao), "dd/MM/yyyy")}</span>? Esta ação poderá ser revertida.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Manter Sessão</Button>
          <Button variant="destructive" onClick={onConfirm}>Sim, Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
