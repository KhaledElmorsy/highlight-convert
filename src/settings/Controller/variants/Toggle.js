import Controller from "../Controller";

/** @extends Controller<boolean> */
export default class Toggle extends Controller {
  _controllerType = /** @type {const} */ ('Toggle');

  /**
   * Toggleable boolean setting
   * @param {object} args
   * @param {SettingPath[key]} args.key
   * @param {SettingPath[area]} args.area
   * @param {boolean} [args.defaultValue=true]
   */
  constructor({ area, key, defaultValue = true }) {
    super({ area, key, defaultValue });
  }

  validate(value) {
    return typeof value === 'boolean';
  }

  async toggle() {
    const current = await this.get();
    await this.set(!current);
  }
}
