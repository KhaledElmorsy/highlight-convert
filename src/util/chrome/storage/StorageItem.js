import merge from 'deepmerge';

/** @typedef {chrome.storage.StorageArea} StorageArea */

/** @template T */
export default class StorageItem {
  /**
   * Map of registered storage areas and their key sets. 
   * @type {Map<StorageArea, Set<string>>} */
  static registry = new Map();

  /**
   * Create a concise link to a specific key in a storage area
   * @param {string} key
   * @param {StorageArea} area
   */
  constructor(key, area) {
    // Ensure the key is unique for that area
    const keySet = StorageItem.registry.get(area);
    if (keySet) {
      if (keySet.has(key)) {
        throw new Error(
          `The key "${key}" has already been registered for the passed storage area`,
        );
      }
      keySet.add(key);
    } else {
      StorageItem.registry.set(area, new Set([key]));
    }

    this.area = area;
    this.key = key;
  }

  /**
   * Change the value of the storage item.
   * @param {T} item
   */
  async set(item) {
    await this.area.set({ [this.key]: item });
  }

  /**
   * Get the *value* of the stored item.
   * @returns {Promise<T>}
   */
  async get() {
    const item = await this.area.get(this.key);
    return item?.[this.key];
  }

  /**
   * Merge an update object with the current stored value.
   *
   * If not passed an object, replace the stored value.
   *
   * Array properties are overwritten.
   * @param {{[prop: string] : any}} update
   */
  async merge(update) {
    const isObject = (item) => typeof item === 'object' && !Array.isArray(item);

    if (!isObject(update)) {
      await this.set(update);
      return;
    }

    const state = await this.get();
    if (state === undefined || !isObject(state)) {
      await this.set(update);
      return;
    }

    // Overwrite arrays
    await this.set(merge(state, update, { arrayMerge: (_, src) => src }));
  }
}
