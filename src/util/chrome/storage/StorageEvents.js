import Observable from '@util/classes/Observable';

/**
 * @typedef {chrome.storage.StorageArea} StorageArea
 * @typedef {chrome.storage.StorageChange} StorageChange
 */

/**
 * @typedef {Observable<[change: StorageChange]>} StorageKeyObservable
 * @typedef {StorageKeyObservable['_observer']} StorageKeyObserver
 */

/**
 * @type {Map<StorageArea, Map<string, StorageKeyObservable> }
 */
const registry = new Map([
  [chrome.storage.local, new Map()],
  [chrome.storage.sync, new Map()],
  [chrome.storage.session, new Map()],
]);

/**
 * @param {Object<string, StorageChange>} changes
 * @param {string} storageArea
 */
export function dispatchObservables(changes, storageArea) {
  const observables = registry.get(chrome.storage[storageArea]);
  observables.forEach((observable, key) => {
    const change = changes[key];
    if (!change) return;
    observable.dispatch(change);
  });
}

chrome.storage.onChanged.addListener(dispatchObservables);

/**
 * Validate storage area and return relevant observable registry.
 * @param {StorageArea} area 
 * @returns {Map<string, StorageKeyObservable>}
 */
function getAreaRegistry(area) {
  const areaRegistry = registry.get(area);
  if (!areaRegistry) {
    throw new Error('Invalid storage area. Only pass a Chrome storage area.')
  }
  return areaRegistry
}

export default {
  /**
   * Invoke a callback when the value at the specified key in the passed storage
   * area changes.
   *
   * Callbacks are invoked with a {@link StorageChange} object containing the old
   * and new values.
   * @param {chrome.storage.StorageArea} area
   * @param {string} key
   * @param {StorageKeyObserver} callback
   */
  observe(area, key, callback) {
    const areaRegistry = getAreaRegistry(area);

    let observable;
    if (areaRegistry.has(key)) {
      observable = areaRegistry.get(key);
    } else {
      observable = new Observable();
      areaRegistry.set(key, observable);
    }

    observable.add(callback);
  },

  /**
   * Remove a previously registered observer.
   * @param {chrome.storage.StorageArea} area
   * @param {string} key
   * @param {StorageKeyObserver} callback
   */
  removeObserver(area, key, callback) {
    const areaRegistry = getAreaRegistry(area);
    const observable = areaRegistry.get(key);
    if (!observable) return;
    observable.remove(callback);
    if (!observable.size) areaRegistry.delete(key);
  },
};
