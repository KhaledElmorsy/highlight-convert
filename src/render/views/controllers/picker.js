import Select from '@ui5/webcomponents/dist/Select';

/** @typedef {import('@ui5/webcomponents/dist/Option').default} Option */

/**
 * @template Value
 * @typedef {import('./typedefs').ControllerViewExtension<Value>} ControllerViewExtension
 */

/**
 * @typedef {object} PickerSettings
 * @prop {(option: any) => any} [mapOptions]
 * @prop {object} [keys] If options are objects, specify properties to render
 * as the main and secondary columns
 * @prop {string} [keys.main] Default: `name`
 * @prop {string|null} [keys.sub=null] Optional second column. Ignored if `null` (default).
 */

/**
 * Create a basic picker.
 *
 * Options can be strings or objects. When using objects, specifiy the property
 * containing the main text to render, and optionally, a second property to render
 * in a second column.
 * @template {string | {[key: string]: any}} Option
 * @param {object} args
 * @param {Option[]} args.options
 * @param {Option} args.value
 * @param {PickerSettings} [args.settings]
 * @param {(value:  Option) => void} [args.onChange]
 * @returns {Select & ControllerViewExtension<Option>}
 */
export default function picker({
  options,
  value,
  settings: {
    keys: { main = 'name', sub = null } = {},
    mapOptions = (options) => options,
  } = {},
  onChange = () => {},
}) {
  /** @type {Select} */
  const selectElement = document.createElement('ui5-select');
  const areObjects = typeof options[0] === 'object';

  function getOptionElements(selectedValue) {
    const optionElements = options.map(mapOptions).map((option, i) => {
      const [mainText, subText] = areObjects
        ? [option[main], option[sub] ?? null]
        : [option, null];

      /** @type {Option} */
      const element = document.createElement('ui5-option');
      element.textContent = mainText;
      element.setAttribute('data-index', i); // To cross-reference he relevant option

      // Compare the (pre-map) option with the passed picked 'value' to set the selected option
      const initalOption = options[i];
      if (JSON.stringify(initalOption) === JSON.stringify(selectedValue)) {
        element.setAttribute('selected', '');
      }

      if (subText !== null) element.setAttribute('additional-text', subText);
      return element;
    });

    return optionElements;
  }

  selectElement.append(...getOptionElements(value));
  selectElement.addEventListener('change', ({ detail: { selectedOption } }) => {
    const index = selectedOption.getAttribute('data-index');
    onChange(options[index]);
  });

  /** @type {ControllerViewExtension<Option>} */
  const controllerExtension = {
    acceptVisitor(viewVisitor) {
      viewVisitor.picker({
        options,
        keys: areObjects ? { main, sub } : null,
        mapOptions,
        element: selectElement,
      });
    },
    setValue(newValue) {
      const tempParent = document.createElement('div');
      tempParent.append(...getOptionElements(newValue));
      this.innerHTML = tempParent.innerHTML;
    },
  };

  Object.assign(selectElement, controllerExtension);

  return selectElement;
}
