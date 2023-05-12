import styles from './styles/labeledContainer.module.scss'

/**
 * @typedef {object} ClassOverride
 * @prop {object} base Override base styling
 * @prop {string} [base.container]
 * @prop {string} [base.label];
 * @prop {object} extra Extend styling
 * @prop {string[]} [extra.container]
 * @prop {string[]} [extra.label];
 */

/**
 * 
 * @param {object} args
 * @param {string} args.label
 * @param {Node} args.child Node to append next to the label
 * @param {string} [args.description] Tooltip on label hover
 * @param {Partial<ClassOverride>} args.classes
 * @returns 
 */
export default function labledContainer({
  label,
  child,
  description,
  classes: {
    base: {
      container: baseContainerClass = styles.container,
      label: baseLabelClass = styles.label,
    } = {},
    extra: { container: containerClasses = [], label: labelClasses = [] } = {},
  } = {},
}) {
  const containerElement = document.createElement('div');
  containerElement.classList.add(baseContainerClass, ...containerClasses);

  const labelElement = containerElement.appendChild(document.createElement('span'));
  labelElement.textContent = label;
  labelElement.setAttribute('aria-label', label);
  labelElement.classList.add(baseLabelClass, ...labelClasses);

  if (description !== undefined) {
    labelElement.setAttribute('title', description);
    labelElement.setAttribute('aria-description', description);
  }

  containerElement.append(child);
  return containerElement;
}
