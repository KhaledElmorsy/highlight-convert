/**
 * @template {Unit} U
 * @typedef {keyof import('@converters/createConverter/createConverter').Constructors<U>} ConverterTypeName<U>
 */

/**
 * @template {ConverterTypeName<U>} cType
 * @template {Unit} U
 * @typedef {import('@converters/createConverter/createConverter').ConverterFactoryParams<cType, U>}  ConverterFactoryParams<cType,U>
 */
