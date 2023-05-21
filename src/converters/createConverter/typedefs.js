/**
 * @template {ConverterConstructor} T
 * @typedef {Omit<ConstructorParameters<T>['0'], keyof ConverterParamters<any>} SpecialParameters<T>
 */

/**
 * @template {Unit} U
 * @typedef ControllerSettings<U>
 * @prop {U} mainUnit
 * @prop {U} secondUnit
 * @prop {U[]} [featuredUnits]
 * @prop {{[label: string]: {options: U[], default: U} }} [labelDefaults]
 */

/** 
 * @template {Unit} U
 * @typedef {ConverterParamters<U>['options']} ConverterOptions<U>
 */
