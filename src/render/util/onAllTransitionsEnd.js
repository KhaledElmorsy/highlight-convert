/**
 * Watch for transitions to start, then invoke a callback after they all end.
 * 
 * 
 * @param {HTMLElement} element 
 * @param {() => void} callback
 * @param {object} options
 * @param {boolean} options.once Stop listening after a set of overlapping transitions ends 
 */
export default function onAllTransitionsEnd(element, callback, {once=true} = {}) {
  let transitioningProperties = new Set();
  function watchTransition({ propertyName }) {
    transitioningProperties.add(propertyName);
  }
  function checkEnd({ propertyName }) {
    transitioningProperties.delete(propertyName);
    if (transitioningProperties.size) return;
    callback();
    if (!once) return;
    element.removeEventListener('transitionstart', watchTransition);
    element.removeEventListener('transitionend', checkEnd);
  }
  element.addEventListener('transitionstart', watchTransition);
  element.addEventListener('transitionend', checkEnd);
}
