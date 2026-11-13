import React, { useState } from 'react';
import { Copy, Check } from '@/components/ui/platform-icons';

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#1c711c]/70 hover:text-[#228b22] transition-colors px-2 py-1 rounded-lg bg-[#f7f9f5] border border-[#bfd4bc] hover:border-[#1c711c]"
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}