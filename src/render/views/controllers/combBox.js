import ComboBox from '@ui5/webcomponents/dist/ComboBox';
import MultiComboBox from '@ui5/webcomponents/dist/MultiComboBox';
import { sortObject } from '@util/misc';

/**
 * @template Value
 * @typedef {import('./typedefs').ControllerViewExtension<Value>} ControllerViewExtension
 */

/**
 * @typedef {object} ComboBoxSettings
 * @prop {boolean} multi Allow multiple selections.
 * @prop {(option: any) => any} mapOptions
 * @prop {object} keys Property names for the rendered text and optional grouping.
 *
 * Only apply when options are objects.
 * @prop {string} keys.main Property to render in the picker. `Default: "name"`
 * @prop {string} keys.sub Optional property to render in a second column.
 * @prop {string} keys.group Property to group options by.
 */

/**
 * @template {boolean} M
 * @template O
 * @typedef {M extends true ? O[] : O} ValueType<M,O>
 */

/**
 * Create a searchable combo box.
 *
 * Optionally allows option grouping and multiple selection.
 * @template {string|object} Option
 * @template {boolean} M Multi Combo box
 * @param {object} args
 * @param {ValueType<M,Option>} args.value
 * @param {Option[]} args.options
 * @param {(value: ValueType<M, Option>) => void} [args.onChange]
 * @param {ComboBoxSettings & {multi: M}} args.settings
 * @returns {(M extends true ? MultiComboBox : ComboBox) & ControllerViewExtension<Option>}
 */
export default function comboBox({
  options,
  value,
  onChange,
  settings: {
    multi = false,
    keys: { main = 'name', sub = null, group = null } = {},
    mapOptions = (option) => option,
  } = {},
}) {
  const [comboboxTag, cbItemTag, cbGroupTag] = multi
    ? ['ui5-multi-combobox', 'ui5-mcb-item', 'ui5-mcb-group-item']
    : ['ui5-combobox', 'ui5-cb-item', 'ui5-cb-group-item'];

  const comboBoxElement = document.createElement(comboboxTag);
  const areObjects = typeof options[0] === 'object';
  const grouped = areObjects && group !== null;

  function getChildren(selectedValues) {
    const optionElements = options.reduce((acc, baseOption, i) => {
      const option = mapOptions(baseOption);
      const element = document.createElement(cbItemTag);
      const mainText = areObjects ? option[main] : option;
      element.setAttribute('text', mainText);
      element.setAttribute('data-index', i);

      if (areObjects && sub)
        element.setAttribute('additional-text', option[sub]);

      if (
        multi &&
        selectedValues.find(
          (v) =>
            !!(
              (
                JSON.stringify(sortObject(v)) ===
                JSON.stringify(sortObject(baseOption))
              ) // TODO Think about this
            )
        )
      ) {
        element.setAttribute('selected', '');
      }

      if (grouped) {
        const groupName = option[group];
        acc[groupName] ??= [];
        acc[groupName].push(element);
      } else {
        acc[i] = element;
      }
      return acc;
    }, {});

    const optionsAndGroupElements = !grouped
      ? Object.values(optionElements)
      : Object.entries(optionElements)
          .map(([groupName, items]) => {
            const groupElement = document.createElement(cbGroupTag);
            groupElement.setAttribute('text', groupName);
            return [groupElement, ...items];
          })
          .flat(1);
    return optionsAndGroupElements;
  }

  comboBoxElement.append(...getChildren(value));

  function setSingleValue(selectedValue) {
    const mappedValue = mapOptions(selectedValue);
    comboBoxElement.setAttribute(
      'value',
      areObjects ? mappedValue[main] : mappedValue
    );
  }

  if (!multi) setSingleValue(value);

  comboBoxElement.addEventListener(
    'selection-change',
    // Apply same handler on both single and multi combo boxes (item vs. items)
    ({ detail: { items, item } }) => {
      const selectedElements = items ? [...items] : [item];
      const indices = selectedElements.map((el) =>
        el.getAttribute('data-index')
      );
      const selectedOptions = indices.map((i) => options[i]);
      if (multi) {
        onChange(selectedOptions, event);
      } else {
        onChange(selectedOptions[0], event);
      }
    }
  );

  /** @type {ControllerViewExtension<Option>} */
  const controllerExtension = {
    acceptVisitor(viewVisitor) {
      viewVisitor[multi ? 'multiComboBox' : 'comboBox']({
        options,
        keys: areObjects ? { main, sub, group } : null,
        mapOptions,
        element: comboBoxElement,
      });
    },
    setValue(newValue) {
      if (!multi) {
        setSingleValue(newValue);
      } else {
        const updatedChildren = getChildren(newValue);
        for (let i = 0; i < updatedChildren.length; i++) {
          if (
            updatedChildren[i].getAttribute('selected') ===
            this.children[i].getAttribute('selected')
          )
            continue;
          const tempParent = document.createElement('div');
          tempParent.append(...updatedChildren);
          this.innerHTML = tempParent.innerHTML;
          return;
        }
      }
    },
  };

  Object.assign(comboBoxElement, controllerExtension);

  return comboBoxElement;
}
