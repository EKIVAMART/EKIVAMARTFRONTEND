import axiosInstance from './axios';

export interface LocationChoice {
  state: string;
  lga: string;
  town: string;
}
export interface DeliveryArea {
  state: string;
  lgas: { lga: string; towns: { town: string; cost: number }[] }[];
}

function sessionList<T>(path: string) {
  let pending: Promise<T[]> | undefined;
  const key = 'ekivamart:' + path;
  return {
    clear() {
      pending = undefined;
      sessionStorage.removeItem(key);
    },
    async get(): Promise<T[]> {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          sessionStorage.removeItem(key);
        }
      }
      if (!pending) {
        const request = axiosInstance
          .get(path, { headers: { skipAuth: true } })
          .then(({ data }) => {
            if (!Array.isArray(data.data))
              throw new Error('Could not load delivery locations.');
            if (pending === request)
              sessionStorage.setItem(key, JSON.stringify(data.data));
            return data.data as T[];
          })
          .finally(() => {
            if (pending === request) pending = undefined;
          });
        pending = request;
      }
      return pending;
    },
  };
}

export const deliveryStates = sessionList<string>('/delivery/states');
export const deliveryTowns = sessionList<DeliveryArea>('/delivery/towns');

export function refreshCoverage() {
  deliveryTowns.clear();
  deliveryStates.clear();
  window.dispatchEvent(new Event('delivery-coverage-changed'));
}

export function reconcileLocation(
  tree: DeliveryArea[],
  value: LocationChoice
): LocationChoice {
  const area =
    tree.find((a) => a.state === value.state) ??
    (tree.length === 1 ? tree[0] : undefined);
  const district =
    area?.state === value.state
      ? area.lgas.find((d) => d.lga === value.lga)
      : undefined;
  return {
    state: area?.state ?? '',
    lga: district?.lga ?? '',
    town: district?.towns.find((t) => t.town === value.town)?.town ?? '',
  };
}

export function locationError(message: string) {
  return /state|town|\blga\b|delivery route|deliver to/i.test(message);
}
