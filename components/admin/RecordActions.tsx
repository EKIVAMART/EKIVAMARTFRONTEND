'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { MoreHorizontal } from 'lucide-react';

export interface RecordAction {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
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
        <MenuButton className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50" aria-label={`Actions for ${name}`}>
          Actions <MoreHorizontal size={16} aria-hidden="true" />
        </MenuButton>
        <MenuItems anchor="bottom end" className="z-[150] min-w-44 rounded-md border border-slate-200 bg-white p-1 shadow-sm [--anchor-gap:4px] focus:outline-none">
          {availableActions.map((action) => (
            <MenuItem key={action.label}>
              <button
                type="button"
                onClick={action.onSelect}
                className={`block w-full rounded-sm px-3 py-2 text-left text-sm data-focus:bg-slate-100 ${action.destructive ? 'text-slate-700' : 'text-slate-700'}`}
              >
                {action.label}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
}
