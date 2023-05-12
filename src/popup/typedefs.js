/**
 * @typedef {object} View
 * @prop {string} [label]
 * @prop {string} [description]
 * @prop {() => Promise<HTMLElement>} [createElement]
 */

/**
 * @typedef {object} Section
 * @prop {string} [title] Section heading
 * @prop {View[]} views Views rendered in order as a column
 */

/**
 * @typedef {Section[]} SettingsPage
 */
