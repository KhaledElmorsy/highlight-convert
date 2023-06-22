/**
 * Find the root stacking height of an element, and whether it's in a `fixed` stacking 
 * context.
 * 
 * The element's root stacking height depends on its first positioned ancenstor 
 * from the document root with a numeric `z-index` property.
 * @param {HTMLElement|Node} element 
 * @returns {{zIndex: string, isFixed: boolean}}
 */
export default function getStackingContext(element) {
  if (element === document.body) return {};
  if (!(element instanceof HTMLElement)) {
    return getStackingContext(element.parentElement);
  }

  const styles = getComputedStyle(element);
  const hasZIndex = styles.position !== 'static' && styles.zIndex !== 'auto';
  const zIndex = hasZIndex ? styles.zIndex : 'auto';
  const isFixed = styles.position === 'fixed';

  const parent = getStackingContext(element.parentElement);
  return {
    zIndex: (parent.zIndex !== 'auto' && parent.zIndex) || zIndex,
    isFixed: parent.isFixed || isFixed,
  };
}
