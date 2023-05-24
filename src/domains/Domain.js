/**
 * Facade for a domain's major services:
 *  - *Match* the domain's units in an input string.
 *  - *Convert* an amount of a domain unit to the rest of its units.
 *  - Providing *render settings* to customize how values and conversions are rendered.
 * @template {Domain} U
 */
export default class Domain {
  /**
   * @typedef {(text: string) => Promise<Match<U>[]>} match
   * @typedef {(value: ValueVector<U>) => Promise<ValueVector<U>[]>} convert
   * @typedef {() => Promise<ConversionRenderSettings<U>>} getRenderSettings
   */

  /** 
   * Match units of this domain in an input string. Matches include neighboring 
   * amounts and the start/end indices of the match.
   * @type {match}
   */
  match;

  /**
   * Convert a value vector composed of a unit and amount to equivalent vectors 
   * of the all the units in the domain.
   * @type {convert}
   */
  convert;

  /**
   * Generate settings that are used by the conversion view to customize how 
   * conversions are rendered for the domain.
   * @type {getRenderSettings}
   */
  getRenderSettings
  
  /**
   * @param {object} args
   * @param {match} args.match Match value vectors `{unit: Unit, amount: number}` 
   * and their start/end indices in a target string.
   * @param {convert} args.convert Convert a value vector to vectors of other units.
   * @param {getRenderSettings} args.getRenderSettings
   */
  constructor({ match, convert, getRenderSettings }) {
    this.getRenderSettings = getRenderSettings;
    this.match = match;
    this.convert = convert;
  }
}
