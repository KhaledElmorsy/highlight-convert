import '@ui5/webcomponents/dist/Select';

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
 * @returns {HTMLElement}
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
  const selectElement = document.createElement('ui5-select');
  const optionElements = options.map(mapOptions).map((option, i) => {
    const [mainText, subText] =
      typeof option === 'object'
        ? [option[main], option[sub] ?? null]
        : [option, null];

    const element = document.createElement('ui5-option');
    element.textContent = mainText;
    element.setAttribute('data-index', i);

    if (JSON.stringify(option) === JSON.stringify(value)) {
      element.setAttribute('selected', true);
    }

    if (subText !== null) element.setAttribute('additional-text', subText);
    return element;
  });

  selectElement.append(...optionElements);
  selectElement.addEventListener('change', ({ detail: { selectedOption } }) => {
    const index = selectedOption.getAttribute('data-index');
    onChange(options[index]);
  });

  return selectElement;
}
