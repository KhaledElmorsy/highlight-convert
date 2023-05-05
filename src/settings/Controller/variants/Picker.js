import Controller from '../Controller';

export default class Picker extends Controller {
  /**
   * @template T
   * Basic picker with an array of options and a single picked value.
   * @param {object} args
   * @param {SettingPath[key]} args.key
   * @param {SettingPath[area]} args.area
   * @param {T[]} args.options
   * @param {number} [args.defaultValue = 0] Index of the default pick. `Default = 0`
   */
  constructor({ area, key, options, defaultValue = 0 }) {
    if (!Array.isArray(options)) {
      throw new Error('Options must be an array of values', { options });
    }
    super({ area, key, options, defaultValue });
  }

  /**
   * @param {T} value
   * @param {T[]} options
   * @returns {boolean}
   */
  validate(value) {
    return value >= 0 && value < this.options.length;
  }

  /**
   * Get the option associated with the current selected value
   * @returns {Promise<T>}
   */
  async get() {
    const index = await super.get();
    return this.options[index];
  }
}
