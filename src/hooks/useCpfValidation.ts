
import { useState, useCallback } from 'react';

export const useCpfValidation = () => {
  const [cpfError, setCpfError] = useState<string>('');
  const [isValidCpf, setIsValidCpf] = useState<boolean>(false);

  const validateCpf = useCallback((cpf: string): boolean => {
    // Remove caracteres não numéricos
    const cleanCpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    const digit1 = remainder >= 10 ? 0 : remainder;
    
    if (digit1 !== parseInt(cleanCpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    const digit2 = remainder >= 10 ? 0 : remainder;
    
    return digit2 === parseInt(cleanCpf.charAt(10));
  }, []);

  const handleCpfBlur = useCallback((cpf: string) => {
    if (!cpf.trim()) {
      setCpfError('');
      setIsValidCpf(false);
      return;
    }

    const isValid = validateCpf(cpf);
    setIsValidCpf(isValid);
    setCpfError(isValid ? '' : 'CPF inválido');
  }, [validateCpf]);

  const formatCpf = useCallback((value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  }, []);

  return {
    cpfError,
    isValidCpf,
    handleCpfBlur,
    formatCpf,
    validateCpf
  };
};
