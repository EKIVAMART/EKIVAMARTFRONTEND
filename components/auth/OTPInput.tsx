"use client";

import { OtpInput } from '@/components/ui/otp-input';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OTPInput({ length = 6, value, onChange, disabled = false, error = false }: OTPInputProps) {
  return <div className="flex justify-center"><OtpInput length={length} value={value} onChange={onChange} disabled={disabled} status={error ? 'error' : 'idle'} size="sm" autoFocus aria-label="Verification code" /></div>;
}
