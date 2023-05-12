import BasePicker from './baseClass/BasePicker';

/**
 * @template T
 * @extends BasePicker<T[]>
 */
export default class MultiPicker extends BasePicker {
  _controllerType = /** @type {const} */ ('MultiPicker');

  /**
   * Pick zero or more unique items from an array of options.
   * @param {object} args
   * @param {SettingPath[key]} args.key
   * @param {SettingPath[area]} args.area
   * @param {T[]} args.options
   * @param {T[]} [args.defaultValue]
   */
  constructor({ area, key, options, defaultValue }) {
    super({ area, key, options, defaultValue });
  }

  validate(value) {
    return (
      Array.isArray(value) &&
      value.every(super.validateItem.bind(this)) &&
      value.length <= this.options.length
    );
  }
}
