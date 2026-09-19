import {
  exportLocalState,
  importLocalState,
  type LocalState,
} from "./local-state";

export const LOCAL_STATE_DATABASE = "freetimers-local";
export const LOCAL_STATE_STORE = "state";
export const LOCAL_STATE_KEY = "current";
export const LOCAL_STATE_DATABASE_VERSION = 1;

type StoredState = {
  key: string;
  serialized: string;
};

type IndexedDbOptions = {
  indexedDB?: IDBFactory;
  maxBytes?: number;
};

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });
}

function getIndexedDb(options: IndexedDbOptions): IDBFactory {
  const indexedDB = options.indexedDB ?? globalThis.indexedDB;
  if (!indexedDB) {
    throw new Error("IndexedDB is unavailable in this environment");
  }
  return indexedDB;
}

function openDatabase(options: IndexedDbOptions): Promise<IDBDatabase> {
  const request = getIndexedDb(options).open(
    LOCAL_STATE_DATABASE,
    LOCAL_STATE_DATABASE_VERSION,
  );
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(LOCAL_STATE_STORE)) {
      request.result.createObjectStore(LOCAL_STATE_STORE, { keyPath: "key" });
    }
  };
  return requestResult(request);
}

export async function loadLocalState(
  options: IndexedDbOptions = {},
): Promise<LocalState | null> {
  const database = await openDatabase(options);
  try {
    const transaction = database.transaction(LOCAL_STATE_STORE, "readonly");
    const record = await requestResult(
      transaction.objectStore(LOCAL_STATE_STORE).get(LOCAL_STATE_KEY),
    );
    await transactionComplete(transaction);
    if (!record) {
      return null;
    }
    return importLocalState((record as StoredState).serialized);
  } finally {
    database.close();
  }
}

export async function saveLocalState(
  state: LocalState,
  options: IndexedDbOptions = {},
): Promise<void> {
  const serialized = exportLocalState(state, {
    maxBytes: options.maxBytes,
  });
  const database = await openDatabase(options);
  try {
    const transaction = database.transaction(LOCAL_STATE_STORE, "readwrite");
    const request = transaction.objectStore(LOCAL_STATE_STORE).put({
      key: LOCAL_STATE_KEY,
      serialized,
    } satisfies StoredState);
    await requestResult(request);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}
