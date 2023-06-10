/**
 * @typedef {Parameters<import("../../range").default>[0]} RangeParams
 * @typedef {Parameters<import("../../combBox").default>[0]} ComboBoxParams
 * @typedef {Parameters<import("../../picker").default>[0]} PickerParams
 */

/**
 * Pass into a controller view's `acceptVisitor` method to invoke functions specific
 * to that view.
 */
export default class ViewVisitor {
  /*
   * Views dispatch methods methods with both themselves (`element:HTMLElement`)
   * and useful data used to instantiate them in a `visitorPackage`.
   */

  /**
   * @typedef {object} ComboBoxVisitorPackage
   * @prop {ComboBoxParams['settings']['keys']} keys
   * @prop {ComboBoxParams['settings']['mapOptions']} mapOptions
   * @prop {ComboBoxParams['options']} options
   * @prop {import("@ui5/webcomponents/dist/ComboBox").default} element
   */

  /** @param {ComboBoxVisitorPackage} visitorPackage */
  comboBox(visitorPackage) {}

  /** @param {ComboBoxVisitorPackage} visitorPackage */
  multiComboBox(visitorPackage) {}

  /**
   * @param {object} visitorPackage
   * @param {PickerParams['options']} visitorPackage.options
   * @param {PickerParams['settings']['mapOptions']} visitorPackage.mapOptions
   * @param {PickerParams['settings']['keys']} visitorPackage.keys
   * @param {import("@ui5/webcomponents/dist/Select").default} visitorPackage.element
   */
  picker(visitorPackage) {}

  /**
   * @param {object} visitorPackage
   * @param {RangeParams['options']} visitorPackage.options
   * @param {import("@ui5/webcomponents/dist/Slider").default} visitorPackage.element
   */
  range(visitorPackage) {}

  /**
   * @param {object} visitorPackage
   * @param {import("@ui5/webcomponents/dist/Switch").default} visitorPackage.element
   */
  toggle(visitorPackage) {}
}
