import '@ui5/webcomponents/dist/Slider';


/**
 * @typedef {object} RangeSettings
 * @prop {boolean} [showTooltip=true]
 * @prop {boolean} [showTickmarks=true]
 * @prop {number} [labelInterval=1]
 */

/**
 * Create a number slider.
 * @param {object} args
 * @param {NumberRange} args.options
 * @param {number} args.value
 * @param {(value: number) => void} args.onChange
 * @param {RangeSettings} [args.settings] Added customization
 * @returns
 */
export default function range({
  options: { min, max, step = 1 },
  value,
  onChange,
  settings: {
    showTooltip = true,
    showTickmarks = true,
    labelInterval = 1,
  } = {},
}) {
  const sliderElement = document.createElement('ui5-slider');
  Object.entries({ min, max, step }).forEach(([attribute, value]) =>
    sliderElement.setAttribute(attribute, value)
  );

  sliderElement.setAttribute('value', value);
  sliderElement.addEventListener('input', () => {
    onChange(sliderElement.value);
  });

  if (showTooltip) sliderElement.setAttribute('show-tooltip', true);
  if (showTickmarks) sliderElement.setAttribute('show-tickmarks', true);
  if (labelInterval) sliderElement.setAttribute('label-interval', labelInterval);
  
  return sliderElement;
}
