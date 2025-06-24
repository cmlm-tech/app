
import { Check, X } from 'lucide-react';
import { ValidationStatus } from '@/hooks/usePasswordValidation';

interface PasswordRequirementsProps {
  validationStatus: ValidationStatus;
}

export const PasswordRequirements = ({ validationStatus }: PasswordRequirementsProps) => {
  const requirements = [
    { key: 'minLength', text: 'Pelo menos 8 caracteres', valid: validationStatus.minLength },
    { key: 'hasUppercase', text: 'Pelo menos uma letra maiúscula (A-Z)', valid: validationStatus.hasUppercase },
    { key: 'hasLowercase', text: 'Pelo menos uma letra minúscula (a-z)', valid: validationStatus.hasLowercase },
    { key: 'hasNumber', text: 'Pelo menos um número (0-9)', valid: validationStatus.hasNumber },
    { key: 'passwordsMatch', text: 'As senhas devem coincidir', valid: validationStatus.passwordsMatch },
  ];

  return (
    <ul className="space-y-2 text-sm mt-2">
      {requirements.map((requirement) => (
        <li
          key={requirement.key}
          className={`flex items-center space-x-2 ${
            requirement.valid ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          {requirement.valid ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-gray-400" />
          )}
          <span>{requirement.text}</span>
        </li>
      ))}
    </ul>
  );
};
