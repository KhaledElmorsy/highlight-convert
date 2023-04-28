import Setting from '../Setting';

export default class Picker extends Setting {
  /**
   * Basic picker with an array of options and a single picked value.
   * @template T
   * @param {object} args
   * @param {SettingPath[key]} args.key
   * @param {SettingPath[area]} args.area
   * @param {T[]} args.options
   * @param {T[number]} [args.defaultValue]
   */
  constructor({ area, key, options, defaultValue = options[0] }) {
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
  validate(value, options = this.options) {
    return !!options.find(
      (opt) => JSON.stringify(opt) === JSON.stringify(value)
    );
  }
}
