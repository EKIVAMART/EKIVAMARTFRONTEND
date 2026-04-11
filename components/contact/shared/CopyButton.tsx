import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

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
      className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#c740b0]/70 hover:text-[#981d87] transition-colors px-2 py-1 rounded-lg bg-[#fdf3fc] border border-[#e8b8e4] hover:border-[#c740b0]"
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}