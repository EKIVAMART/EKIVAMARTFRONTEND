'use client';

import { forwardRef, useLayoutEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { Lock, Eye as EyeIcon, EyeOff } from '@/components/ui/platform-icons';
import { Input } from './Input';
import styles from './password-input.module.css';

function Eye({ open }: { open: boolean }) {
  const Icon = open ? EyeIcon : EyeOff;
  return <Icon size={20} aria-hidden="true" />;
}

type PasswordInputProps = Omit<ComponentPropsWithoutRef<typeof Input>, 'type' | 'rightIcon'>;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput({ label = 'Password', icon = Lock, autoComplete = 'current-password', disabled, className, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);
  const selection = useRef<{ start: number | null; end: number | null } | null>(null);
  useLayoutEffect(() => {
    if (selection.current) input.current?.setSelectionRange(selection.current.start, selection.current.end);
  }, [visible]);
  return <Input {...props} ref={node => {
    input.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }} label={label} icon={icon} type={visible ? 'text' : 'password'} autoComplete={autoComplete} autoCapitalize="none" spellCheck={false} disabled={disabled} className={`${styles.input} ${className || ''}`} rightIcon={
    <button type="button" className={styles.reveal} disabled={disabled} aria-label={`${visible ? 'Hide' : 'Show'} ${(label || 'password').toLowerCase()}`} aria-pressed={visible}
      onPointerDown={event => event.preventDefault()}
      onClick={() => { selection.current = { start: input.current?.selectionStart ?? null, end: input.current?.selectionEnd ?? null }; setVisible(value => !value); }}>
      <Eye open={visible} />
    </button>
  } />;
});
