'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from '@/lib/axios';
import {
  DeliveryArea,
  LocationChoice,
  deliveryStates,
  deliveryTowns,
  reconcileLocation,
} from '@/lib/delivery-coverage';

const field =
  'block w-full mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900';
const label = 'block text-xs font-semibold text-slate-700';
export function deliveryMessage(error: unknown) {
  const e = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return (
    e?.response?.data?.message ||
    e?.message ||
    'Could not load delivery information.'
  );
}

function useList<T>(source: { get(): Promise<T[]> }) {
  const [result, setResult] = useState<{
    version: number;
    items?: T[];
    error?: string;
  }>();
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let current = true;
    source.get().then(
      (rows) => {
        if (current) setResult({ version, items: rows });
      },
      (e) => {
        if (current) setResult({ version, error: deliveryMessage(e) });
      }
    );
    const reload = () => setVersion((v) => v + 1);
    window.addEventListener('delivery-coverage-changed', reload);
    return () => {
      current = false;
      window.removeEventListener('delivery-coverage-changed', reload);
    };
  }, [source, version]);
  const loaded = result?.version === version ? result : undefined;
  return {
    items: loaded?.items,
    error: loaded?.error,
    retry: () => setVersion((v) => v + 1),
  };
}

export function ProductStateSelect({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange(value: string): void;
  error?: string;
}) {
  const list = useList(deliveryStates);
  return (
    <label className={label}>
      State *
      <select
        className={field}
        required
        value={list.items?.includes(value) ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select pickup state</option>
        {list.items?.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      {(error ||
        list.error ||
        (list.items && value && !list.items.includes(value))) && (
        <span role="alert">
          {error ||
            list.error ||
            `Please choose a supported pickup state for this product.`}
        </span>
      )}
      {list.error && (
        <button type="button" onClick={list.retry}>
          Retry
        </button>
      )}
    </label>
  );
}

export function LocationRequest({ close }: { close(): void }) {
  const { items: states } = useList(deliveryStates);
  const [status, setStatus] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const suggestions = useId();
  return createPortal(
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-black/50 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Request a delivery location"
        className="w-full max-w-md max-h-[90vh] overflow-auto rounded-xl bg-white p-6"
      >
        <h3 className="mb-4 text-lg font-bold">Request a delivery location</h3>
        {sent ? (
          <p role="status">Thank you for requesting delivery to your area.</p>
        ) : (
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const body = Object.fromEntries(
                [...new FormData(e.currentTarget)]
                  .map(([key, value]) => [key, String(value).trim()])
                  .filter(([, value]) => value)
              );
              if (busy) return;
              if (!body.state || body.state.length < 2) {
                setStatus('Enter your state.');
                return;
              }
              setBusy(true);
              setStatus('');
              try {
                await axios.post('/delivery/location-requests', body);
                setSent(true);
              } catch (err) {
                setStatus(
                  (err as { response?: { status: number } }).response
                    ?.status === 429
                    ? 'Too many requests. Please try again later.'
                    : deliveryMessage(err)
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            {(
              [
                ['state', 'State', 100],
                ['lga', 'LGA', 100],
                ['town', 'Town', 100],
                ['contactEmail', 'Contact email', 255],
                ['contactPhone', 'Contact phone', 20],
                ['note', 'Note', 500],
              ] as const
            ).map(([name, title, maxLength]) => (
              <label key={name} className={label}>
                {title}
                {name === 'state' ? ' *' : ' (optional)'}
                <input
                  className={field}
                  name={name}
                  required={name === 'state'}
                  minLength={name === 'state' ? 2 : undefined}
                  maxLength={maxLength}
                  disabled={busy}
                  type={
                    name === 'contactEmail'
                      ? 'email'
                      : name === 'contactPhone'
                        ? 'tel'
                        : 'text'
                  }
                  list={name === 'state' ? suggestions : undefined}
                />
              </label>
            ))}
            <datalist id={suggestions}>
              {states?.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {status && <p role="alert">{status}</p>}
            <button
              disabled={busy}
              className="rounded-lg bg-green-800 px-4 py-2 text-white"
            >
              Send request
            </button>
          </form>
        )}
        <button
          type="button"
          onClick={close}
          className="mt-3 text-sm underline"
        >
          Close
        </button>
      </section>
    </div>,
    document.body
  );
}

export function DeliveryLocationPicker({
  value,
  onChange,
  street,
  onStreet,
  preserveSaved,
}: {
  value: LocationChoice;
  onChange(value: LocationChoice): void;
  preserveSaved?: boolean;
  street?: string;
  onStreet?(value: string): void;
}) {
  const { items, error, retry } = useList<DeliveryArea>(deliveryTowns);
  const states = useList(deliveryStates);
  const [request, setRequest] = useState(false);
  const area = items?.find((a) => a.state === value.state);
  const district = area?.lgas.find((d) => d.lga === value.lga);
  useEffect(() => {
    if (!items || !states.items) return;
    const tree = states.items.map(
      (state) =>
        items.find((area) => area.state === state) ?? { state, lgas: [] }
    );
    const next = reconcileLocation(tree, value);
    if (
      next.state !== value.state ||
      next.lga !== value.lga ||
      next.town !== value.town
    ) {
      if (!preserveSaved) onChange(next);
    }
  }, [items, states.items, value, onChange, preserveSaved]);
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ['state', 'State', states.items],
            ['lga', 'LGA', area?.lgas.map((d) => d.lga)],
            ['town', 'Town', district?.towns.map((t) => t.town)],
          ] as const
        ).map(([key, title, options]) => (
          <label key={key} className={label}>
            {title} *
            <select
              aria-label={title}
              required
              disabled={!options?.length}
              className={field}
              value={value[key]}
              onChange={(e) =>
                onChange({
                  state: value.state,
                  lga: key === 'state' ? '' : value.lga,
                  town: '',
                  [key]: e.target.value,
                })
              }
            >
              <option value="">Select {title}</option>
              {options?.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {(error || states.error) && (
        <p role="alert">
          {error || states.error}{' '}
          <button type="button" onClick={error ? retry : states.retry}>
            Retry
          </button>
        </p>
      )}
      {items && states.items && !states.items.length && (
        <p role="status">Delivery is currently unavailable.</p>
      )}
      {items && states.items?.includes(value.state) && !area?.lgas.length && (
        <p role="status">
          No delivery towns are currently available in {value.state}.
        </p>
      )}
      <button
        type="button"
        className="text-sm font-semibold text-green-800 underline"
        onClick={() => setRequest(true)}
      >
        My town isn’t here
      </button>
      {onStreet && (
        <label className={label}>
          Street / house details (optional)
          <input
            className={field}
            value={street ?? ''}
            onChange={(e) => onStreet(e.target.value)}
          />
        </label>
      )}
      {request && <LocationRequest close={() => setRequest(false)} />}
    </div>
  );
}
