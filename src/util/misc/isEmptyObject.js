/**
 * Return whether a *plain* object (POJO) is void of any own properties or methods.
 * 
 * If a custom object is passed, properties in the prototype chain will be ignored.
 * @param {Object} obj
 * @returns {Boolean}
 */
export default function isEmptyObject(obj, {warn = true} = {}) {
  if (warn && Object.getPrototypeOf(obj) !== Object.prototype ) {
    console.warn(`Trying to check if an object of type ${obj.constructor.name} is empty.
    Enumerable properties in the prototype chain will be ignored. 
    For intuitive results, make sure to only test plain objects.`);
  }

  for (let prop in obj) {
    return !Object.hasOwn(obj, prop);
  }
  return true;
}
