import Controller from '../../Controller';

/**
 * @template Value
 * @extends Controller<Value>
 */
export default class BasePicker extends Controller {
  /**
   * Accepts an array of options and expects values to be elements of that array.
   * 
   * Exposes `validateItem` which checks if the argument is included in the options array.
   * 
   * Extend into functional classes that define the actual `value` shape.
   * @param {object} args
   * @template {any[]} Options
   * @param {SettingPath[key]} args.key
   * @param {SettingPath[area]} args.area
   * @param {Options} args.options
   * @param {Value} args.defaultValue
   */
  constructor({ area, key, options, defaultValue }) {
    if (!Array.isArray(options)) {
      throw new Error('Options must be an array of values', { options });
    }
    super({ area, key, options, defaultValue });
  }

  /**
   * @param {any} item
   * @returns {boolean}
   */
  validateItem(item) {
    return !!this.options.find(
      (option) => JSON.stringify(option) === JSON.stringify(item)
    );
  }
}
