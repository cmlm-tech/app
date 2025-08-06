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

interface ModalConfirmarRemocaoProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
  vereadorNome: string
}

export function ModalConfirmarRemocaoVereador({
  isOpen,
  onOpenChange,
  onConfirm,
  vereadorNome,
}: ModalConfirmarRemocaoProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover o vínculo de "{vereadorNome}" com
            esta legislatura?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Remover</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}