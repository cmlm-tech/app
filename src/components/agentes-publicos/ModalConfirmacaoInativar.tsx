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
import { AgentePublico } from './types'

interface ModalConfirmacaoInativarProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  agente: AgentePublico | null
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
            <strong>{agente.nome}</strong>? Esta ação irá bloquear o seu acesso
            ao sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Inativar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}