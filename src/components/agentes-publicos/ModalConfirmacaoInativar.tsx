import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
// CORREÇÃO: Importa o tipo correto da página principal
import { AgenteComStatus } from '@/pages/plenario/AgentesPublicos';

interface ModalConfirmacaoInativarProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  // CORREÇÃO: Usa o tipo correto 'AgenteComStatus'
  agente: AgenteComStatus | null
}

export function ModalConfirmacaoInativar({
  isOpen,
  onClose,
  onConfirm,
  agente,
}: ModalConfirmacaoInativarProps) {
  if (!agente) {
    return null
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Inativação</AlertDialogTitle>
          <AlertDialogDescription>
            Tem a certeza que deseja inativar o agente{' '}
            {/* CORREÇÃO: Usa a propriedade correta 'nome_completo' */}
            <strong className="text-gray-900">{agente.nome_completo}</strong>? Esta ação irá bloquear o seu acesso
            ao sistema, caso exista.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Sim, inativar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}