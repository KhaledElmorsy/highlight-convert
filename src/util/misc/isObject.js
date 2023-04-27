/**
 * Check if a value is a plain JS object
 * @param {any} object
 * @return {boolean}
 */
export default function isObject(object) {
  return object?.constructor.name === 'Object';
}

