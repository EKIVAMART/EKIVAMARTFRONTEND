import { PasswordStrength } from '@/types/auth.types';

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  let feedback = '';

  if (!password) {
    return {
      score: 0,
      feedback: 'Enter a password',
      color: 'bg-gray-200',
      label: '',
    };
  }

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  // Determine feedback
  if (score <= 1) {
    feedback = 'Weak password. Add uppercase, numbers, and special characters.';
    return {
      score: 1,
      feedback,
      color: 'bg-red-500',
      label: 'Weak',
    };
  } else if (score === 2) {
    feedback = 'Fair password. Consider making it longer and more complex.';
    return {
      score: 2,
      feedback,
      color: 'bg-orange-500',
      label: 'Fair',
    };
  } else if (score === 3) {
    feedback = 'Good password. You could add more special characters.';
    return {
      score: 3,
      feedback,
      color: 'bg-yellow-500',
      label: 'Good',
    };
  } else {
    feedback = 'Strong password!';
    return {
      score: 4,
      feedback,
      color: 'bg-green-500',
      label: 'Strong',
    };
  }
}
