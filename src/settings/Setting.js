import { StorageItem } from '@util/chrome/storage';

export default class Setting {
  /**
   * Create a setting and store it with Chrome's storage api
   * @template T, O
   * @param {object} args
   * @param {SettingPath[key]} args.key qweqwe
   * @param {SettingPath[area]} args.area
   * @param {O} args.options
   * @param {T} args.defaultValue
   */
  constructor({ area, key, options, defaultValue }) {
    this.storage = new StorageItem(key, chrome.storage[area]);
    this.setup(options, defaultValue);
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
    await this.storage.set({ options: this.options, value });
  }

  /**
   * Validate if a value is a valid option.
   * @param {O} options
   * @param {T} value
   * @returns {boolean}
   */
  validate(value, options = this.options) {
    return true;
  }

  /**
   * Create or update the storage item for the setting
   * @param {O} options
   * @param {T} defaultValue Value to initialize the setting with
   */
  async setup(options, defaultValue) {
    const withOptions = options !== undefined;

    const value = this.validate(defaultValue, options) ? defaultValue : null;

    const state = await this.storage.get();
    if (state === undefined) {
      await this.storage.set({
        options: withOptions ? options : null,
        value,
      });
    } else {
      // Update options if they've changed
      const setOptions =
        withOptions &&
        JSON.stringify(options) !== JSON.stringify(state.options);

      if (setOptions) {
        // Change value to passed default if the current one is now invalid
        const shouldUpdateValue = !this.validate(state.value, options);

        await this.storage.set({
          options,
          value: shouldUpdateValue ? value : state.value,
        });
      }
    }
    this.options = options; // Synchronously accessible options since options are static by default
  }

  /**
   * Get the current value of the setting.
   * @returns {T}
   */
  async get() {
    const state = await this.storage.get();
    return state.value;
  }
}
