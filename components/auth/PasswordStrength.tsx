'use client';

export const PasswordStrength = ({ password }: { password: string }) => {
  const variety = [/[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length;
  const level = !password ? 0 : password.length < 8 ? 1 : Math.min(4, 1 + variety + Number(password.length >= 12));
  const label = ['Not entered', 'Weak', 'Fair', 'Good', 'Strong'][level];
  const color = ['#cbd5ca', '#b42318', '#986b1e', '#387243', '#22643e'][level];
  const advice = password.length < 8 ? 'Use at least 8 characters.' : password.length < 12 ? 'A longer password is harder to guess.' : 'Use a unique password for this account.';
  return <div className="space-y-2" data-slot="password-strength">
    <div className="flex gap-1" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={4} aria-valuenow={level} aria-valuetext={label}>
      {[1, 2, 3, 4].map(step => <span key={step} className="h-1 flex-1 rounded-sm transition-colors motion-reduce:transition-none" style={{ backgroundColor: step <= level ? color : '#e2e7e1' }} />)}
    </div>
    <p className="text-xs leading-5 text-[#657065]"><span className="font-semibold" style={{ color: password ? color : '#657065' }}>{password ? `${label} · ` : ''}</span>{advice}</p>
  </div>;
};
