import isObject from './isObject';

/**
 * Sort the keys of an object and all its nested objects. Only sorts {@link isObject plain objects}.
 * @param {object} object
 * @param {boolean} [ascending=true] Default: `true`
 * 
 * For the unlikely event where it's needed. 
 * @return {object}
 */
export default function sortObject(object, ascending = true) {
  const coeff = ascending ? 1 : -1;
  const sortedEntries = Object.entries(object)
    .map(([key, value]) =>
      isObject(value) ? [key, sortObject(value, ascending)] : [key, value]
    )
    .sort((a, b) => (a[0] < b[0] ? -1 * coeff : 1 * coeff));

  return Object.fromEntries(sortedEntries);
}
