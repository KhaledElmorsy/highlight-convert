/** @template {Controller} T */
export default class Setting {
  /** Name used when rendering the setting @type {string} */
  name;
  /** Description used for tooltips. @type {string} */
  description;
  /** Value controller and validator. @type {Controller} */
  controller;
  /** Invoked after the setting is updated. @type {(newValue: any) => any} */
  onChange;
  /** Associated data @type {{[x: symbol]: any}} */
  data;

  /**
   * Main `Setting` class providing configurable & mutable stored values and associated
   * data to other classes in the extension.
   * @param {object} args
   * @param {string} args.name
   * @param {string} [args.description]
   * @param {T} args.controller Value controller/validator.
   * @param {(newValue: any) => void} [args.onChange] Invoked when the setting is updated.
   * @param {object} [args.data] Data associated with the setting.
   * @param {(setting: Setting) => HTMLElement} [args.view] Override the default setting view
   */
  constructor(args = { description: '', onChange: () => {}, data: {} }) {
    Object.assign(this, args);
  }

  async set(newValue) {
    try {
      await this.controller.set(newValue);

      try {
        this.onChange(newValue);
      } catch (onChangeError) {
        console.error(onChangeError);
      }
    } catch (valueError) {
      console.error(valueError);
    }
  }

  async get() {
    return this.controller.get();
  }
}
