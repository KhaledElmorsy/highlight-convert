/**
 * @template T 
 * @typedef {import('@settings/Controller/Controller').default<T>} Controller 
 */

/**
 * @template T
 * @typedef  {(newValue:T) => Promise<void>} ChangeHandler
 */

/**
 * @template T
 * @typedef ChangeRegister
 * @prop {(handler: ChangeHandler<T>) => void} addListener
 * @prop {(handler: ChangeHandler<T>) => void} removeListener
 */

/**
 * @template T
 * @typedef {T extends Controller<infer V> ? V : never} GetType<T>
 */

/**
 * Decorate a controller with a change event listener/emitter. 
 * @template {Controller} C
 * @template {GetType<C>} T
 * @param {C} controller
 * @returns {ChangeRegister<T> & C}
 */
export default function withChangeListener(controller) {
  const listeners = new Set();
  function addListener(func) {
    listeners.add(func);
  }
  function removeListener(func) {
    listeners.delete(func);
  }

  const baseSetter = controller.set.bind(controller);

  /** @type {controller['set']} */
  const emittingSetter = async (newValue) => {
    await baseSetter(newValue);
    await Promise.all([...listeners].map((func) => func(newValue)));
  };

  return Object.assign(controller, {
    set: emittingSetter,
    addListener,
    removeListener,
  });
}
