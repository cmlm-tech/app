
import { useState, useEffect } from 'react';

export interface ValidationStatus {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  passwordsMatch: boolean;
}

export const usePasswordValidation = (password: string, confirmPassword: string) => {
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    passwordsMatch: false,
  });

  useEffect(() => {
    setValidationStatus({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      passwordsMatch: password === confirmPassword && password.length > 0 && confirmPassword.length > 0,
    });
  }, [password, confirmPassword]);

  const isPasswordValid = Object.values(validationStatus).every(Boolean);

  return { validationStatus, isPasswordValid };
};
