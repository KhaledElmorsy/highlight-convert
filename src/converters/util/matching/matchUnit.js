import { escapeRegex } from '@util/misc';

/**
 * Capture group names for each match target.
 * @satisfies {{[target: string]}: string}
 */
const captureGroups = /** @type {const} */ ({
  unit: 'unit',
  numLeft: 'numLeft',
  numRight: 'numRight',
});

/**
 * @typedef {captureGroups[keyof captureGroups]} GroupNames
 * @typedef { {[group in GroupNames]: [number, number]}} Indices Start & end (excl.) indices of the capture group
 * @typedef { {[group in GroupNames]: string}} Matches
 * @typedef {Matches & {indices: Indices}} UnitMatch
 */

/**
 * @param {string} string Input string
 * @param {string} label String to Match
 * @param {boolean} caseSensetive
 * @returns {UnitMatch[]}
 */
export default function matchUnit(string, label, caseSensetive = false) {
  const escapedLabel = escapeRegex(label);
  const labelGroup = `(?<${captureGroups.unit}>${escapedLabel})s?`;
  const labelMatcher = `(?<![a-z])${labelGroup}(?![a-z])`; // No adjacent letters

  const numberMatcher = (() => {
    const dec = '\\.(\\d+)?'; // Also accept sole decimal point
    const withCommas = '(\\d{1,3},(?=\\d))?(\\d{3},)*\\d{3}'; // 12,123 | 123,423 | 12,123,123
    const numberMatcher = `-?((${withCommas})|\\d+)(${dec})?`;
    return `(?<!\\d)${numberMatcher}(?!\\d)`; // No adjacent digits
  })();


  const horizSpace = '[^\\S\\n\\r]'; // Match the same line only. Optional whitespace between number/unit shouldn't be new lines
  const separators = (sep) => `${horizSpace}?(${sep.join('|')})?${horizSpace}?`; // Optional separators between the unit and number. '10 usd', '10.usd', '10 - usd'
  const numLeftSeparators = separators(['-', ',', '.'].map(escapeRegex));
  const numRightSeparators = separators([
    ...['.', ','].map(escapeRegex),
    '-(?!\\d)', // Don't match the negative sign as a separator
  ]);

  const numLeft = `(?<${captureGroups.numLeft}>${numberMatcher})${numLeftSeparators}`;
  const numRight = `${numRightSeparators}(?<${captureGroups.numRight}>${numberMatcher})`;

  const flags = 'dg' + (!caseSensetive ? 'i' : ''); // 'd' flag causes matches to include capture group indices
  const regex = new RegExp(
    `(${numLeft})?(${labelMatcher})(${numRight})?`, // Numbers are optional.
    flags
  );

  let match;
  const matches = [];
  while ((match = regex.exec(string))) {
    const { indices, groups } = match;
    matches.push({
      ...groups,
      indices: indices.groups,
    });
    regex.lastIndex = indices.groups.unit[1];
  }
  return matches;
}
