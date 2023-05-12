/**
 * Replace a parent element's child node at a specific index. If the index is
 * larger than the number of children, append it to the end.
 * @param {HTMLElement} element
 * @param {number} index
 * @param {HTMLElement} parent
 */
export default function replaceElementAt(element, index, parent) {
  if (index >= parent.childNodes.length) {
    parent.append(element);
  } else {
    parent.childNodes[index].replaceWith(element);
  }
}
