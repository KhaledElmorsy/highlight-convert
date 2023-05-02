import { StorageItem } from '@util/chrome/storage';

export default class Controller {
  /**
   * Create a mutable value with instance specific options, class validation,
   * and is stored with Chrome's storage api.
   * @template T, O
   * @param {object} args
   * @param {SettingPath[key]} args.key
   * @param {SettingPath[area]} args.area
   * @param {O} args.options
   * @param {T} args.defaultValue
   */
  constructor({ area, key, options, defaultValue }) {
    this.storage = new StorageItem(key, chrome.storage[area]);
    this.options = options ?? null;
    this.setup(defaultValue);
  }

  /**
   * Change the value of the setting.
   *
   * The new value must be valid.
   * @param {T} value
   */
  async set(value) {
    if (!this.validate(value)) {
      throw new Error('Attempting to set an invalid value', this, value);
    }
    await this.storage.set(value);
  }

  /**
   * Validate if a value is a valid option.
   * @param {T} value
   * @returns {boolean}
   */
  validate(value) {
    return true;
  }

  /**
   * Get the current value of the setting.
   * @returns {Promise<T>}
   */
  async get() {
    return await this.storage.get();
  }

  /**
   * Create or update the storage item for the setting
   * @param {T} defaultValue Value to initialize the setting with
   */
  async setup(defaultValue) {
    const currentValue = await this.get();
    if (currentValue !== undefined && this.validate(currentValue)) return;
    this.set(defaultValue);
  }
}
