import Switch from '@ui5/webcomponents/dist/Switch';

/**
 * @template Value
 * @typedef {import('./typedefs').ControllerViewExtension<Value>} ControllerViewExtension
 */

/**
 * @typedef {object} ToggleSettings
 * @prop {object} text Text to display on the button at each state
 * @prop {string} [text.on=null] Default: `null` => `✓`
 * @prop {string} [text.off=null] Default: `null` => `-`
 * @prop {string} tooltip Blank strings will be ignored
 * @prop {boolean} graphical Changes on/off colors to gren/red and overrides text with `✓`|`x`
 */

/**
 * Create a boolean toggle view.
 * @param {object} args
 * @param {boolean} args.value
 * @param {(value: boolean) => void} args.onChange
 * @param {ToggleSettings} args.settings
 * @returns {Switch & ControllerViewExtension<boolean>}
 */
export default function toggle({
  value,
  settings: { text = {}, tooltip, graphical } = {},
  onChange,
}) {
  /** @type {Switch} */
  const toggleEl = document.createElement('ui5-switch');
  
  toggleEl.checked = value;

  if (graphical) {
    toggleEl.design = 'Graphical';
  } else {
    const { on = null, off = null } = text;
    if (on !== null) toggleEl.textOn = on;
    if (off !== null) toggleEl.textOff = off;
  }

  if (tooltip !== undefined && tooltip !== '') toggleEl.tooltip = tooltip;

  toggleEl.addEventListener('change', () => {
    onChange(toggleEl.checked);
  });

  /** @type {ControllerViewExtension<boolean>} */
  const controllerExtension = {
    acceptVisitor(viewVisitor) {
      viewVisitor.toggle({ element: toggleEl });
    },
    setValue(newValue) {
      this.checked = newValue;
    },
  };

  Object.assign(toggleEl, controllerExtension);

  return toggleEl;
}
