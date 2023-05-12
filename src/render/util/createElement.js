/** @typedef {{[attr: string]: value}} Attributes */

/**
 * Create an HTML element.
 * @param {HTMLElementTagNameMap} tag 
 * @param {Attributes}} attributes 
 * @param {string} textContent 
 * @returns 
 */
export default function createElement(tag, attributes, textContent) {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([attr, value]) =>
    element.setAttribute(attr, value)
  );
  if (textContent !== undefined) element.textContent = textContent;
  return element;
}

/**
 * Create a `span` element
 * @param {string} textContent 
 * @param {string} className 
 * @param {Attributes} atrr 
 * @returns 
 */
createElement.span = function (textContent, className, atrr) {
  return createElement('span', { class: className, ...atrr }, textContent);
};

/**
 * Create an `img` element.
 * @param {string} src 
 * @param {string} alt 
 * @param {string} className 
 * @param {Attributes} atrr 
 * @returns 
 */
createElement.image = function (src, alt, className, atrr) {
  return createElement('span', { src, alt, class: className, ...atrr });
};
