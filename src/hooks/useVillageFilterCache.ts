import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "villageFilter:activeVillageId";

/**
 * Module-level subscription so multiple screens (WaterUsageScreen, PaymentScreen)
 * can stay in sync with the same cached village filter selection.
 */
type Listener = (villageId: number | undefined) => void;
const listeners = new Set<Listener>();
let cachedVillageId: number | undefined = undefined;
let hydrated = false;
let hydrationPromise: Promise<void> | null = null;

/**
 * Hydrate the cached value from AsyncStorage. Safe to call multiple times —
 * subsequent calls re-use the same promise.
 */
function hydrate(): Promise<void> {
  if (hydrated) return Promise.resolve();
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => {
      if (raw) {
        const parsed = Number(raw);
        cachedVillageId = Number.isFinite(parsed) ? parsed : undefined;
      } else {
        cachedVillageId = undefined;
      }
      hydrated = true;
    })
    .catch(() => {
      // On error, treat as no selection
      cachedVillageId = undefined;
      hydrated = true;
    })
    .finally(() => {
      hydrationPromise = null;
    });

  return hydrationPromise;
}

/** Get the currently cached village id (sync, may be undefined until hydrated). */
function getActiveVillageIdSync(): number | undefined {
  return cachedVillageId;
}

function setActiveVillageId(villageId: number | undefined): void {
  cachedVillageId = villageId;
  // Persist async; fire-and-forget but log on failure
  AsyncStorage.setItem(STORAGE_KEY, villageId == null ? "" : String(villageId)).catch(
    () => {}
  );
  listeners.forEach((cb) => cb(villageId));
}

function clearActiveVillageId(): void {
  setActiveVillageId(undefined);
}

function subscribe(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/**
 * React hook that returns the active village filter id and a setter,
 * keeping the value cached in AsyncStorage and in sync across screens.
 */
export function useVillageFilterCache() {
  const [villageId, setLocal] = useState<number | undefined>(cachedVillageId);

  useEffect(() => {
    let active = true;

    // Hydrate once on first mount
    hydrate().then(() => {
      if (active) setLocal(cachedVillageId);
    });

    // Subscribe to changes from other screens
    const unsubscribe = subscribe((next) => {
      if (active) setLocal(next);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const setVillageId = (next: number | undefined) => {
    setActiveVillageId(next);
    setLocal(next);
  };

  return { villageId, setVillageId, clearVillageId: clearActiveVillageId };
}

export const villageFilterCache = {
  get: getActiveVillageIdSync,
  set: setActiveVillageId,
  clear: clearActiveVillageId,
  subscribe,
  hydrate,
};
