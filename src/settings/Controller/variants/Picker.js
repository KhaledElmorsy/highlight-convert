import BasePicker from './baseClass/BasePicker';

/**
 * @template T
 * @extends BasePicker<T>
 */
export default class Picker extends BasePicker {
  /**
   * Pick a single item from an array of options.
   * @template {T[]} Options
   * @param {object} args
   * @param {SettingPath[key]} args.key
   * @param {SettingPath[area]} args.area
   * @param {Options} args.options
   * @param {Value} args.defaultValue
  */
 constructor({ area, key, options, defaultValue}) {
    super({ area, key, options, defaultValue });
  }

  /**
   * @param {T} value
   * @param {T[]} options
   * @returns {boolean}
   */
  validate(value) {
    return this.validateItem(value);
  }
}
