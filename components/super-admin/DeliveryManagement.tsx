'use client';

import { FormEvent, useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { deliveryRoutesApi, DeliveryRoute } from '@/lib/api';
import { deliveryMessage } from '@/components/DeliveryLocationPicker';
import { refreshCoverage } from '@/lib/delivery-coverage';
import DeliveryRoutesManagement from './DeliveryRoutesManagement';

type StateRow = { id: string; name: string; isActive: boolean };
type TownRow = {
  id: string;
  state: string;
  lga: string;
  town: string;
  cost: number;
  isActive: boolean;
};
type RequestRow = {
  state: string;
  lga?: string;
  town?: string;
  requestCount: number;
  lastRequestedAt: string;
};
const pages = [
  'Supported states',
  'Delivery towns',
  'External routes',
  'Requested locations',
] as const;
const base = '/admin/delivery';
const field = 'rounded border border-slate-300 bg-white px-2 py-2 text-sm';
const action =
  'rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-green-50';
async function rows<T>(
  path: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const { data } = await axios.get(path, { params });
  return data.data;
}

function Table({
  headings,
  children,
}: {
  headings: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm [&_td]:border-b [&_td]:p-3 [&_th]:bg-slate-50 [&_th]:p-3">
        <thead>
          <tr>
            {headings.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default function DeliveryManagement() {
  const [page, setPage] = useState<(typeof pages)[number]>('Supported states');
  const [states, setStates] = useState<StateRow[]>([]);
  const [towns, setTowns] = useState<TownRow[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [filterState, setFilterState] = useState('');
  const [filterLga, setFilterLga] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [requestLimit, setRequestLimit] = useState(100);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState('');
  const queryKey = JSON.stringify([
    page,
    filterState,
    filterLga,
    activeOnly,
    requestLimit,
    version,
  ]);
  const [loadedKey, setLoadedKey] = useState('');
  const loading = loadedKey !== queryKey;
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<StateRow | TownRow | null>(null);

  useEffect(() => {
    let current = true;
    async function load() {
      if (page === 'Requested locations') {
        const list = await rows<RequestRow>(base + '/location-requests', {
          limit: requestLimit,
        });
        if (current)
          setRequests(list.sort((a, b) => b.requestCount - a.requestCount));
      } else if (page === 'Supported states') {
        const [list, links] = await Promise.all([
          rows<StateRow>(base + '/states'),
          deliveryRoutesApi.getRoutes(),
        ]);
        if (current) {
          setStates(list);
          setRoutes(links.data);
        }
      } else if (page === 'Delivery towns') {
        const [list, areas] = await Promise.all([
          rows<StateRow>(base + '/states'),
          rows<TownRow>(base + '/towns', {
            state: filterState || undefined,
            lga: filterLga || undefined,
            activeOnly: activeOnly || undefined,
          }),
        ]);
        if (current) {
          setStates(list);
          setTowns(areas);
        }
      }
    }
    load()
      .then(() => {
        if (current) setError('');
      })
      .catch((e) => {
        if (current) setError(deliveryMessage(e));
      })
      .finally(() => {
        if (current) setLoadedKey(queryKey);
      });
    return () => {
      current = false;
    };
  }, [page, filterState, filterLga, activeOnly, requestLimit, queryKey]);

  async function mutate(work: () => Promise<unknown>) {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      await work();
      refreshCoverage();
      setEditing(null);
      setVersion((v) => v + 1);
      return true;
    } catch (e) {
      setError(deliveryMessage(e));
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const body =
      page === 'Supported states'
        ? { name: data.get('name') }
        : editing
          ? { cost: Number(data.get('cost')) }
          : {
              state: data.get('state'),
              lga: data.get('lga'),
              town: data.get('town'),
              cost: Number(data.get('cost')),
            };
    const url = base + (page === 'Supported states' ? '/states' : '/towns');
    if (
      await mutate(() =>
        editing
          ? axios.patch(url + '/' + editing.id, {
              ...body,
              isActive: data.has('active'),
            })
          : axios.post(url, body)
      )
    )
      form.reset();
  }

  const statePage = page === 'Supported states';
  const activeStates = states.filter((s) => s.isActive);
  return (
    <section className="space-y-5 rounded-lg border bg-white p-5">
      <h1 className="text-2xl font-bold">Delivery</h1>
      <nav aria-label="Delivery management" className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <button
            key={p}
            disabled={saving}
            aria-current={p === page ? 'page' : undefined}
            className={action + (page === p ? ' bg-green-100' : '')}
            onClick={() => {
              setEditing(null);
              setPage(p);
            }}
          >
            {p}
          </button>
        ))}
      </nav>
      {page === 'External routes' ? (
        <DeliveryRoutesManagement />
      ) : (
        <>
          <h2 className="text-xl font-semibold">{page}</h2>
          {!loading && error && (
            <p role="alert" className="text-red-700">
              {error}{' '}
              <button
                className="underline"
                onClick={() => setVersion((v) => v + 1)}
              >
                Reload
              </button>
            </p>
          )}
          {page === 'Requested locations' && (
            <form
              className="flex items-end gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                setRequestLimit(
                  Number(new FormData(event.currentTarget).get('limit'))
                );
              }}
            >
              <label>
                Maximum results
                <input
                  className={'block ' + field}
                  name="limit"
                  type="number"
                  min={1}
                  max={500}
                  step={1}
                  required
                  defaultValue={requestLimit}
                />
              </label>
              <button type="submit" className={action}>
                Apply limit
              </button>
            </form>
          )}
          {page === 'Delivery towns' && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by state"
                className={field}
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
              >
                <option value="">All states</option>
                {states.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
              <input
                aria-label="Filter by LGA"
                className={field}
                placeholder="Filter by LGA"
                value={filterLga}
                onChange={(e) => setFilterLga(e.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                />{' '}
                Active only
              </label>
            </div>
          )}
          {loading ? (
            <p role="status">Loading…</p>
          ) : page === 'Requested locations' ? (
            <Table
              headings={['State', 'LGA', 'Town', 'Requests', 'Last requested']}
            >
              {requests.map((r) => (
                <tr key={JSON.stringify([r.state, r.lga, r.town])}>
                  <td>{r.state}</td>
                  <td>{r.lga || '—'}</td>
                  <td>{r.town || '—'}</td>
                  <td>{r.requestCount}</td>
                  <td>{new Date(r.lastRequestedAt).toLocaleString()}</td>
                </tr>
              ))}
            </Table>
          ) : (
            <>
              <form
                key={page + (editing?.id || 'add')}
                onSubmit={save}
                className="flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 p-4"
              >
                {statePage ? (
                  <label>
                    State name
                    <input
                      className={'block ' + field}
                      name="name"
                      required
                      defaultValue={(editing as StateRow)?.name}
                    />
                  </label>
                ) : (
                  <>
                    <label>
                      State
                      <select
                        className={'block ' + field}
                        name="state"
                        disabled={!!editing}
                        required
                        defaultValue={(editing as TownRow)?.state || ''}
                      >
                        <option value="">Select state</option>
                        {(editing
                          ? [(editing as TownRow).state]
                          : activeStates.map((s) => s.name)
                        ).map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    {(['lga', 'town'] as const).map((k) => (
                      <label key={k}>
                        {k === 'lga' ? 'LGA' : 'Town'}
                        <input
                          className={'block ' + field}
                          name={k}
                          required
                          disabled={!!editing}
                          defaultValue={(editing as TownRow)?.[k]}
                        />
                      </label>
                    ))}
                    <label>
                      Cost (₦)
                      <input
                        className={'block ' + field}
                        name="cost"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        defaultValue={(editing as TownRow)?.cost}
                      />
                    </label>
                  </>
                )}
                {editing && (
                  <label>
                    <input
                      name="active"
                      type="checkbox"
                      defaultChecked={editing.isActive}
                    />{' '}
                    Active
                  </label>
                )}
                <button disabled={saving} className={action}>
                  {editing
                    ? 'Save changes'
                    : statePage
                      ? 'Add state'
                      : 'Add town'}
                </button>
                {editing && (
                  <button
                    type="button"
                    className={action}
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </button>
                )}
              </form>
              {statePage ? (
                <Table
                  headings={['State', 'Status', 'Missing routes', 'Actions']}
                >
                  {states.map((s) => {
                    const missing = s.isActive
                      ? activeStates.filter(
                          (other) =>
                            other.id !== s.id &&
                            !routes.some(
                              (r) =>
                                r.isActive &&
                                [r.originState, r.destinationState].includes(
                                  s.name
                                ) &&
                                [r.originState, r.destinationState].includes(
                                  other.name
                                )
                            )
                        )
                      : [];
                    return (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.isActive ? 'Active' : 'Inactive'}</td>
                        <td>
                          {missing.length
                            ? 'Missing route to ' +
                              missing.map((m) => m.name).join(', ')
                            : '—'}
                        </td>
                        <td>
                          <button
                            className={action}
                            onClick={() => setEditing(s)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </Table>
              ) : (
                <Table
                  headings={[
                    'State',
                    'LGA',
                    'Town',
                    'Cost',
                    'Status',
                    'Actions',
                  ]}
                >
                  {towns.map((t) => (
                    <tr key={t.id}>
                      <td>{t.state}</td>
                      <td>{t.lga}</td>
                      <td>{t.town}</td>
                      <td>₦{t.cost.toLocaleString()}</td>
                      <td>{t.isActive ? 'Active' : 'Inactive'}</td>
                      <td className="space-x-2">
                        <button
                          className={action}
                          onClick={() => setEditing(t)}
                        >
                          Edit
                        </button>
                        <button
                          className={action}
                          disabled={saving}
                          onClick={() => {
                            if (
                              confirm(
                                'Delete ' +
                                  t.town +
                                  '? Saved addresses using this town will need updating.'
                              )
                            )
                              void mutate(() =>
                                axios.delete(base + '/towns/' + t.id)
                              );
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
