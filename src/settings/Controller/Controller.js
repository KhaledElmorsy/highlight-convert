import { StorageItem } from '@util/chrome/storage';

/** @template T */
export default class Controller {
  /**
   * String identifying the controller sub class (Picker, Range, etc).
   *
   * The setting factory in './createSetting' maps compatible views to each subtype
   * but the typing system (JSDoc/Typescript) can't identify which subclass an controller
   * instance is from, making type hinting the specific compatible views not possible.
   *
   * The other possible work around is to add a string parameter to the factory but this
   * property has less overhead since it only needs to be specified in the subclasses.
   */
  _controllerType;

  /**
   * Create a mutable value with instance specific options, class validation,
   * and is stored with Chrome's storage api.
   * @template O
   * @param {object} args
   * @param {SettingPath[key]} args.key
   * @param {SettingPath[area]} args.area
   * @param {O} args.options
   * @param {T} args.defaultValue
   */
  constructor({ area, key, options, defaultValue }) {
    this.storage = new StorageItem(key, chrome.storage[area]);
    this.options = options ?? null;
    this.setupComplete = this.setup(defaultValue);
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
    await this.setupComplete;
    return await this.storage.get();;
  }

  /**
   * Create or update the storage item for the setting
   * @param {T} defaultValue Value to initialize the setting with
   */
  async setup(defaultValue) {
    const currentValue = await this.storage.get();
    if (currentValue !== undefined && this.validate(currentValue)) return;
    await this.set(defaultValue);
  }
}
