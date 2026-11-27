'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import {
  Check,
  ChevronDown,
  Loader2,
  MapPin,
  Send,
} from '@/components/ui/platform-icons';
import axios from '@/lib/axios';
import {
  DeliveryArea,
  LocationChoice,
  deliveryStates,
  deliveryTowns,
  reconcileLocation,
} from '@/lib/delivery-coverage';

const fieldBase =
  'block w-full rounded-lg border border-gray-300 bg-white py-2 text-sm text-slate-900';
const field = `${fieldBase} mt-1 px-3`;
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

export function LocationRequest({
  close,
  location,
}: {
  close(): void;
  location?: LocationChoice;
}) {
  const { items: states } = useList(deliveryStates);
  const [error, setError] = useState('');
  const [receivedLocation, setReceivedLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const confirmationHeading = useRef<HTMLHeadingElement>(null);
  const suggestions = useId();

  useEffect(() => {
    if (receivedLocation) confirmationHeading.current?.focus();
  }, [receivedLocation]);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (submitting.current) return;

    const form = event.currentTarget;
    const body = Object.fromEntries(
      [...new FormData(form)]
        .map(([key, value]) => [key, String(value).trim()])
        .filter(([, value]) => value)
    );
    const invalidField = (name: string, message: string) => {
      setError(message);
      const input = form.elements.namedItem(name);
      if (input instanceof HTMLInputElement) input.focus();
    };
    if (!body.state || body.state.length < 2) {
      invalidField('state', 'Enter a state name with at least two characters.');
      return;
    }
    if (body.contactPhone) {
      body.contactPhone = body.contactPhone.replace(/[\s().-]/g, '');
      if (!/^\+?[1-9]\d{1,14}$/.test(body.contactPhone)) {
        invalidField(
          'contactPhone',
          'Enter a phone number with its country code, such as +234.'
        );
        return;
      }
    }

    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const { data } = await axios.post<{
        success?: boolean;
        message?: string;
      }>('/delivery/location-requests', body);
      if (data?.success !== true) {
        setError(
          data?.message ||
            'We couldn’t confirm your request was received. Please try again.'
        );
        return;
      }
      setReceivedLocation(
        [body.town, body.lga, body.state].filter(Boolean).join(', ')
      );
    } catch (err) {
      const failure = err as { response?: { status: number } };
      if (failure.response?.status === 429) {
        setError('Too many requests. Please wait and try again later.');
      } else if (!failure.response) {
        setError(
          'We couldn’t confirm your request was received. Check your connection and try again.'
        );
      } else if (failure.response.status >= 500) {
        setError('We couldn’t send your request right now. Please try again.');
      } else {
        setError(deliveryMessage(err));
      }
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  const primaryAction =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60';

  return (
    <Dialog
      open
      onClose={() => {
        if (!submitting.current) close();
      }}
      className="relative z-[200]"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 grid place-items-center p-4">
        <DialogPanel className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
          {receivedLocation ? (
            <div className="text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-brand-100 text-brand-800">
                <Check size={28} strokeWidth={2} aria-hidden="true" />
              </div>
              <DialogTitle
                as="h2"
                ref={confirmationHeading}
                tabIndex={-1}
                className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 focus:outline-none"
              >
                Request received
              </DialogTitle>
              <Description className="mt-2 text-sm leading-6 text-slate-600">
                We’ll use your request to help decide where to expand delivery.
              </Description>
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-left">
                <MapPin
                  size={19}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-brand-800"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-600">
                    Requested location
                  </p>
                  <p className="mt-0.5 text-sm font-semibold break-words text-slate-900">
                    {receivedLocation}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={`${primaryAction} mt-5 w-full`}
                onClick={close}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <DialogTitle
                as="h2"
                className="text-xl font-semibold tracking-tight text-slate-900"
              >
                Request a delivery location
              </DialogTitle>
              <form
                className="mt-5"
                onSubmit={submitRequest}
                onChange={() => {
                  if (error) setError('');
                }}
                aria-busy={busy}
              >
                <fieldset disabled={busy} className="space-y-3">
                  <legend className="sr-only">
                    Delivery location and contact details
                  </legend>
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
                        minLength={
                          ['state', 'lga', 'town'].includes(name)
                            ? 2
                            : undefined
                        }
                        maxLength={maxLength}
                        type={
                          name === 'contactEmail'
                            ? 'email'
                            : name === 'contactPhone'
                              ? 'tel'
                              : 'text'
                        }
                        autoComplete={
                          name === 'contactEmail'
                            ? 'section-delivery-request email'
                            : name === 'contactPhone'
                              ? 'section-delivery-request tel'
                              : 'off'
                        }
                        defaultValue={
                          name === 'state'
                            ? location?.state
                            : name === 'lga'
                              ? location?.lga
                              : undefined
                        }
                        list={name === 'state' ? suggestions : undefined}
                        data-autofocus={name === 'state'}
                      />
                    </label>
                  ))}
                  <datalist id={suggestions}>
                    {states?.map((state) => (
                      <option key={state} value={state} />
                    ))}
                  </datalist>
                </fieldset>
                {error && (
                  <p
                    role="alert"
                    className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                  >
                    {error}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={close}
                    className="min-h-11 rounded-lg px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className={primaryAction}
                  >
                    {busy ? (
                      <>
                        <Loader2
                          size={16}
                          className="motion-safe:animate-spin"
                          aria-hidden="true"
                        />
                        Sending request…
                      </>
                    ) : (
                      <>
                        <Send size={16} aria-hidden="true" />
                        Send request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
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
            <span className="relative mt-1 block">
              <select
                aria-label={title}
                required
                disabled={!options?.length}
                className={`${fieldBase} appearance-none pl-3 pr-8`}
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
              <ChevronDown
                aria-hidden="true"
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-900"
              />
            </span>
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
      {request && (
        <LocationRequest close={() => setRequest(false)} location={value} />
      )}
    </div>
  );
}
