/** @typedef {import("./util/visitor/ViewVisitor").default} ViewVisitor */

/** 
 * @template Value
 * @typedef ControllerViewExtension
 * @prop {(newValue: Value) => void} setValue
 * @prop {(viewVisitor: ViewVisitor) => void} acceptVisitor
 */

/**
 * @template Value 
 * @typedef {HTMLElement & ControllerViewExtension<Value>} ControllerView 
 */

/**
 * @template Value
 * @typedef ControllerViewArgs
 * @prop {Value} value
 * @prop {unknown} [options]
 * @prop {(newValue: Value) => void} onChange
 * @prop {object} Settings
 */


/** 
 * @template Value
 * @typedef {(args: ControllerViewArgs<Value>) => ControllerView<Value>} ControllerViewFactory Generic controller view factory
 */

export {}
