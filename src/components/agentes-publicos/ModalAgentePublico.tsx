
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AgentePublico } from './types'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ui/use-toast'
import { ImageUpload } from '../ImageUpload'
import { useCpfValidation } from '@/hooks/useCpfValidation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AgenteComStatus } from '@/pages/plenario/AgentesPublicos'

export function ModalAgentePublico({
  agente,
  isOpen,
  onClose,
  onSave,
}: ModalAgentePublicoProps) {
  const { isCpfValid } = useCpfValidation()

  const agentePublicoSchema = z.object({
    nome_completo: z
      .string()
      .min(3, 'O nome deve ter pelo menos 3 caracteres.')
      .refine((name) => name.trim().split(' ').length >= 2, {
        message: 'Por favor, insira o nome completo.',
      }),
    cpf: z.string().refine(isCpfValid, {
      message: 'CPF inválido.',
    }),
    data_admissao: z
      .string()
      .refine((date) => !isNaN(new Date(date).getTime()), {
        message: 'Data inválida.',
      })
      .refine((date) => new Date(date) <= new Date(), {
        message: 'A data de admissão não pode ser no futuro.',
      })
      .refine(
        (date) =>
          new Date().getFullYear() - new Date(date).getFullYear() <= 200,
        {
          message: 'A data de admissão não pode ser há mais de 200 anos.',
        },
      ),
    email: z.string().email('Email inválido.'),
    telefone: z.string().optional(),
    cargo: z.string().optional(),
    partido: z.string().optional(),
    foto_url: z.string().optional(),
  })

  type AgentePublicoFormData = z.infer<typeof agentePublicoSchema>
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<AgentePublicoFormData>({
    resolver: zodResolver(agentePublicoSchema),
    mode: 'onChange',
  })
  const { toast } = useToast()
  const fotoUrl = watch('foto_url')

  useEffect(() => {
    if (agente) {
      reset({
        nome_completo: agente.nome_completo || '',
        cpf: agente.cpf || '',
        email: agente.email || '',
        telefone: agente.telefone || '',
        data_admissao: agente.data_admissao
          ? agente.data_admissao.split('T')[0]
          : '',
        cargo: agente.cargo || '',
        partido: agente.partido || '',
        foto_url: agente.foto_url || '',
      })
    } else {
      reset({
        nome_completo: '',
        cpf: '',
        email: '',
        telefone: '',
        data_admissao: '',
        cargo: '',
        partido: '',
        foto_url: '',
      })
    }
  }, [agente, reset])

  const onSubmit = async (data: AgentePublicoFormData) => {
    let p_foto_url = data.foto_url
    if (!p_foto_url) {
      const nomeCompleto = data.nome_completo.trim().replace(/ /g, '+')
      p_foto_url = `https://ui-avatars.com/api/?name=${nomeCompleto}&background=random`
    }

    const { error } = await supabase.rpc('upsert_agente_publico', {
      p_id: agente ? agente.id : undefined,
      p_nome_completo: data.nome_completo,
      p_cpf: data.cpf,
      p_email: data.email,
      p_telefone: data.telefone,
      p_data_admissao: data.data_admissao,
      p_cargo: data.cargo,
      p_partido: data.partido,
      p_foto_url,
    })

    if (error) {
      toast({
        title: 'Erro ao salvar agente público',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: `Agente Público ${
          agente ? 'atualizado' : 'criado'
        } com sucesso.`,
      })
      onSave()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {agente ? 'Editar Agente Público' : 'Novo Agente Público'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <ImageUpload
            onImageSelect={(url) => setValue('foto_url', url, { shouldValidate: true })}
            currentImage={fotoUrl}
            placeholder="Selecione a foto"
          />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nome_completo" className="text-right">
              Nome Completo
            </Label>
            <div className="col-span-3">
              <Input id="nome_completo" {...register('nome_completo')} />
              {errors.nome_completo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.nome_completo.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cpf" className="text-right">
              CPF
            </Label>
            <div className="col-span-3">
              <Input id="cpf" {...register('cpf')} />
              {errors.cpf && (
                <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <div className="col-span-3">
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="telefone" className="text-right">
              Telefone
            </Label>
            <div className="col-span-3">
              <Input id="telefone" {...register('telefone')} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="data_admissao" className="text-right">
              Data de Admissão
            </Label>
            <div className="col-span-3">
              <Input
                id="data_admissao"
                type="date"
                {...register('data_admissao')}
              />
              {errors.data_admissao && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.data_admissao.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cargo" className="text-right">
              Cargo
            </Label>
            <div className="col-span-3">
              <Input id="cargo" {...register('cargo')} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="partido" className="text-right">
              Partido
            </Label>
            <div className="col-span-3">
              <Input id="partido" {...register('partido')} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={!isValid}>
              {agente ? 'Salvar Alterações' : 'Salvar Agente Público'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
