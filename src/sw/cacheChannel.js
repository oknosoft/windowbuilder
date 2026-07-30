
let cachePointer;

function hasDiff(v1, v2) {

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

export const cacheChannel = {

  open() {
    return cachePointer ? Promise.resolve(cachePointer) :
      caches.open('metadata').then((v) => cachePointer = v);
  },

  get(key) {
    return this.open()
      .then(cache => cache.match(key))
      .then(res => {
        return res.json();
      });
  },

  set(key, value) {
    return this.get(key)
      .then(test => {
        if(hasDiff(test, value)) {
          const res = Response.json(value);
          return cachePointer.put(key, res);
        }
      });
  }

};
