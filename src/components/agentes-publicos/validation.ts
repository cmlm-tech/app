
import { z } from 'zod';

// Função para validar CPF (reutilizando a lógica existente)
const validateCpf = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/\D/g, '');
  
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder >= 10 ? 0 : remainder;
  
  if (digit1 !== parseInt(cleanCpf.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder >= 10 ? 0 : remainder;
  
  return digit2 === parseInt(cleanCpf.charAt(10));
};

// Esquema de validação para Agente Público
export const agentePublicoSchema = z.object({
  nomeCompleto: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .refine(
      (val) => val.trim().split(/\s+/).length >= 2,
      "Por favor, insira o nome completo (nome e sobrenome)"
    ),
  cpf: z
    .string()
    .min(1, "CPF é obrigatório")
    .refine(
      (val) => validateCpf(val),
      "CPF inválido"
    ),
  foto: z.string().optional(),
  tipo: z.enum(['Vereador', 'Funcionario'], {
    required_error: "Tipo de agente é obrigatório"
  }),
  // Campos específicos para Vereador
  nomeParlamantar: z.string().optional(),
  perfil: z.string().optional(),
  // Campos específicos para Funcionário
  cargo: z.string().optional(),
  tipoVinculo: z.enum(['Efetivo', 'Comissionado', 'Terceirizado']).optional(),
  dataAdmissao: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Campo opcional
        const date = new Date(val);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Fim do dia atual
        return date <= today;
      },
      "A data de admissão não pode ser uma data futura"
    ),
  dataExoneracao: z.string().optional()
});

export type AgentePublicoFormData = z.infer<typeof agentePublicoSchema>;

// Função para gerar avatar padrão
export const generateDefaultAvatar = (nomeCompleto: string): string => {
  const iniciais = nomeCompleto
    .trim()
    .split(/\s+/)
    .map(palavra => palavra.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(iniciais)}&background=random&color=fff&size=200`;
};
