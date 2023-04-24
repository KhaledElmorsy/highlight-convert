/**
 * Prepend a path string to a key, array of keys, or the outer level of an object.
 * @template {string|string[]|{[name: string]: any}} T
 * @param {T} keys 
 * @param {string} path
 * @returns {T}
 */
export default function mapKeys(keys, path) {
  const mapKey = (key) => `${path}.${key}`;

  /**
   * Map the outer keys of an object
   * @param {[name: string]: any} items
   * @returns {[name: string]: any}
   */
  function mapObject(items) {
    const output = {};
    for (let [key, value] of Object.entries(items)) {
      output[mapKey(key)] = value;
    }
    return output;
  }

  if (typeof keys === 'object') {
    return Array.isArray(keys) ? keys.map(mapKey) : mapObject(keys);
  }
  return mapKey(`${keys}`); // Coerce to string
}

/**
 * Instantiate a mapper for a specific path.
 * @param {string} path
 */
mapKeys.new = function (path) {
  /**
   * Map keys to the instanced path
   * @template {string|string[]|{[name: string]: any}} T
   * @param {T} keys
   * @returns {T}
   */
  return function (keys) {
    return mapKeys(keys, path);
  }
}
