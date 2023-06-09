/**
 * A mutable registry of callbacks that can all be dispatched at once.
 * @template {Array} DispatchArgs
 */
export default class Observable {
  /** @typedef {(...args: DispatchArgs) => void | Promise<void>} Observer */

  /** 
   * Callback to be dispatched. *Utility type*.
   * @type {Observer} 
   */
  _observer;

  /** @type {Set<Observable.Observer>} */
  _observers;

  constructor() {
    this._observers = new Set();
  }

  /**
   * Register a unique callback.
   * 
   * Callbacks can be asynchronous and awaited when dispatched.
   * 
   * Existing callbacks won't be duplicated.
   * @param {Observer} callback 
   */
  add(callback) {
    this._observers.add(callback);
  }

  /**
   * Remove a registered callback.
   * @param {Observer} callback 
   */
  remove(callback) {
    this._observers.delete(callback);
  }

  /**
   * Invoke registered callbacks. Asynchronous callbacks can be awaited.
   * @param  {DispatchArgs} args 
   */
  async dispatch(...args) {
    const observerPromises = [...this._observers.values()].map((callback) =>
      callback(...args)
    );

    await Promise.all(observerPromises);
  }

  clear() {
    this._observers.clear();
  }

  get size() {
    return this._observers.size;
  }
}
