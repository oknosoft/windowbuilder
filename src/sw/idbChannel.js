
const props = {
  name: 'metadata-channel',
  version: 1,
  store: 'store',
  idb: null,
};

export function hasDiff(v1, v2) {

  if(typeof v1 === 'object' && typeof v2 === 'object') {
    // Find updated or added keys
    for (const key in v2) {
      if (hasDiff(v1[key], v2[key])) {
        return true;
      }
    }

    // Find deleted keys
    for (const key in v1) {
      if (hasDiff(v1[key], v2[key])) {
        return true;
      }
    }

    return false;
  }
  else {
    return v1 !== v2;
  }
}


export const idbChannel = {

  open() {
    if(props.idb) {
      return Promise.resolve(props.idb);
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(props.name, props.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(props.store)) {
          db.createObjectStore(props.store, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        props.idb = event.target.result;
        resolve(props.idb);
      };
      request.onerror = (event) => reject(event.target.error);
    });
  },

  get(key) {
    return this.open().then((idb) => new Promise((resolve, reject) => {
      const transaction = idb.transaction(props.store, 'readonly');
      const store = transaction.objectStore(props.store);
      const request = store.get(key);

      request.onsuccess = () => {
        if(request.result) {
          const {key, ...value} = request.result;
          resolve(value);
        }
        else {
          resolve();
        }
      };
      request.onerror = () => {
        reject(request.error);
      };
    }));
  },

  set(key, value) {
    return this.get(key)
      .then(test => {
          if(hasDiff(test, value)) {
            return new Promise((resolve, reject) => {
              const transaction = props.idb.transaction(props.store, 'readwrite');
              const store = transaction.objectStore(props.store);
              const request = store.put({key, ...value});

              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
            });
          }
      });
  }

};
