import merge from 'deepmerge';

/** @template T */
export default class StorageItem {
  /**
   * Create a concise link to a specific key in a chrome storage area
   * @param {string} key
   * @param {chrome.storage.StorageArea} area
   */
  constructor(key, area) {
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
