/**
 * Simple Storage Area mock
 */
export default class StorageArea {
  static instances = [];
  static clearAll() {
    StorageArea.instances.forEach((instance) => {
      instance.storage = {};
    });
  }

  constructor() {
    this.storage = {};
    StorageArea.instances.push(this);
  }

  get(keys) {
    return Object.entries(this.storage).reduce((acc, [key, val]) => {
      return { ...acc, ...(keys.includes(key) ? { [key]: val } : {}) };
    }, {});
  }

  set(items) {
    Object.assign(this.storage, items);
  }

  clear() {
    this.storage = {};
  }

  remove(keys) {
    (Array.isArray(keys) ? keys : [keys]).forEach((key) => {
      delete this.storage[key];
    });
  }
}

const prototype = StorageArea.prototype;
for (let key of Object.getOwnPropertyNames(prototype)) {
  if (key === 'constructor') continue;

  const method = prototype[key];
  prototype[key] = jest.fn(async function (...args) {
    await new Promise((res) => setTimeout(res, 0));
    return method.call(this, ...args);
  });
}
