'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Award, CircleSlash, CreditCard, Eye, EyeOff, MessageSquare, MoreHorizontal, Pencil, RotateCcw, Send, Settings2, Trash2, UserRoundCheck } from '@/components/ui/platform-icons';

export interface RecordAction {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

function ActionIcon({ label }: { label: string }) {
  const value = label.toLowerCase();
  if (value.includes('review') || value.includes('repl')) return <MessageSquare size={16} aria-hidden="true" />;
  if (value.includes('edit')) return <Pencil size={16} aria-hidden="true" />;
  if (value.includes('delete') || value.includes('remove')) return <Trash2 size={16} aria-hidden="true" />;
  if (value.includes('assign') || value.includes('approve')) return <UserRoundCheck size={16} aria-hidden="true" />;
  if (value.includes('trust')) return <Award size={16} aria-hidden="true" />;
  if (value.includes('deactivate') || value.includes('suspend') || value.includes('ban') || value.includes('reject') || value.includes('block')) return <CircleSlash size={16} aria-hidden="true" />;
  if (value.includes('reactivate') || value.includes('activate') || value.includes('unban')) return <RotateCcw size={16} aria-hidden="true" />;
  if (value.includes('payout')) return <CreditCard size={16} aria-hidden="true" />;
  if (value.includes('override') || value.includes('rate')) return <Settings2 size={16} aria-hidden="true" />;
  if (value.includes('unpublish')) return <EyeOff size={16} aria-hidden="true" />;
  if (value.includes('publish')) return <Send size={16} aria-hidden="true" />;
  return <Eye size={16} aria-hidden="true" />;
}

export default function RecordActions({ name, actions }: {
  name: string;
  actions: Array<RecordAction | false | undefined>;
}) {
  const availableActions = actions.filter((action): action is RecordAction => Boolean(action));
  if (availableActions.length === 0) return null;

  return (
    <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
      <Menu>
        <MenuButton className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600" aria-label={`Actions for ${name}`}>
          <MoreHorizontal size={20} aria-hidden="true" />
        </MenuButton>
        <MenuItems portal anchor="bottom end" onClick={(event) => event.stopPropagation()} className="z-[150] min-w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl [--anchor-gap:8px] focus:outline-none">
          {availableActions.map((action) => (
            <MenuItem key={action.label}>
              <button
                type="button"
                onClick={action.onSelect}
                className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition data-focus:bg-slate-100 ${action.destructive ? 'text-rose-700 data-focus:bg-rose-50' : 'text-slate-700'}`}
              >
                <ActionIcon label={action.label} />
                {action.label}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
}
