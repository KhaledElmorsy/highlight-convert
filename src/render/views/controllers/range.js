import Slider from '@ui5/webcomponents/dist/Slider';

/**
 * @template Value
 * @typedef {import('./typedefs').ControllerViewExtension<Value>} ControllerViewExtension
 */

/**
 * @typedef {object} RangeSettings
 * @prop {boolean} [showTooltip=false]
 * @prop {boolean} [showTickmarks=false]
 * @prop {number} [labelInterval=0]
 */

/**
 * Create a number slider.
 * @param {object} args
 * @param {NumberRange} args.options
 * @param {number} args.value
 * @param {(value: number) => void} args.onChange
 * @param {RangeSettings} [args.settings] Added customization
 * @returns {Slider & ControllerViewExtension<number>}
 */
export default function range({
  options: { min, max, step = 1 },
  value,
  onChange,
  settings: {
    showTooltip = false,
    showTickmarks = false,
    labelInterval = 0,
  } = {},
}) {
  /** @type {Slider} */
  const sliderElement = document.createElement('ui5-slider');

  Object.entries({ min, max, step }).forEach(([attribute, attrValue]) => {
    sliderElement[attribute] = attrValue;
  });

  sliderElement.value = value;
  sliderElement.addEventListener('input', () => {
    onChange(sliderElement.value);
  });

  Object.assign(sliderElement, {
    showTooltip,
    showTickmarks,
    labelInterval
  })

  /** @type {ControllerViewExtension<number>} */
  const controllerExtension = {
    acceptVisitor(viewVisitor) {
      viewVisitor.range({
        options: { min, max, step },
        element: sliderElement,
      });
    },
    setValue(newValue) {
      this.value = newValue;
    },
  };

  Object.assign(sliderElement, controllerExtension);

  return sliderElement;
}
