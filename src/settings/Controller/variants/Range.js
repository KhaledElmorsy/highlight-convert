import Controller from "../Controller";

/** @extends Controller<number> */
export default class Range extends Controller {
  _controllerType = /** @type {const} */ ('Range');

  /**
   * Basic number range setting.
   * @param {object} args
   * @param {SettingPath[key]} args.key
   * @param {SettingPath[area]} args.area
   * @param {NumberRange} args.options
   * @param {number} [args.defaultValue]
   */
  constructor({ area, key, options, defaultValue = options.min }) {
    const { min, max, step } = options;
    if (
      min >= max ||
      step > max - min ||
      step <= 0 ||
      (max - min) % step !== 0
    ) {
      throw new Error(
        'The setting was passed an invalid range',
        'Ensure that min < max and that step isnt larger than the range',
        options
      );
    }
    super({ area, key, options, defaultValue });
  }

  /**
   * @param {number} value
   * @param {Range} options
   * @returns {boolean}
   */
  validate(value, options = this.options) {
    const { min, max, step } = options;
    return value >= min && value <= max && (value - min) % step === 0;
  }
}
