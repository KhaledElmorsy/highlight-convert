import { escapeRegex } from '@util/misc';

/**
 * Capture group names for each match target.
 * @satisfies {{[target: string]}: string}
 */
export const captureGroups = /** @type {const} */ ({
  label: 'label',
  fullLabel: 'fullLabel',
  numLeft: 'numLeft',
  numRight: 'numRight',
});

/**
 * @typedef {captureGroups[keyof captureGroups]} GroupNames
 * @typedef { {[group in GroupNames]: [number, number]}} Indices Start & end (excl.) indices of the capture group
 * @typedef { {[group in GroupNames]: string}} MatchedStrings
 * @typedef {{label: string, strings: MatchedStrings, indices: Indices}} MatchData
 */

/**
 * @param {string} string Input string
 * @param {Set<string>} labels String to Match
 * @param {boolean} caseSensetive
 * @returns {MatchData[]}
 */
export default function matchUnit(string, labels, caseSensetive = false) {
  const normalizedLabels = new Map([...labels.values()].map(l => [l.toLowerCase(),l]));
  const labelMatcher = (() => {
    const labelAlternatives = [...labels.values()].map(escapeRegex).join('|')
    const labelGroup = `(?<${captureGroups.label}>${labelAlternatives})`;
    return `(?<![a-z])(?<${captureGroups.fullLabel}>${labelGroup}s?)(?![a-z])`; // No adjacent letters
  })()

  const numberMatcher = (() => {
    const commaSeparated = '(\\d{1,3},(?=\\d))?(\\d{3},)*\\d{3}'; // 12,123 | 123,423 | 12,123,123
    const integer = `((${commaSeparated})|\\d+)`;

    const decimal = '\\.(\\d+)?'; // Also accept sole decimal point

    const compositeFractions = '\\d+(\\/|\\u2044)\\d+';
    const vulgarFractions = '[\\u00BC-\\u00BE]|[\\u2150-\\u215f]|\\u2189';
    const standaloneFraction = `(${compositeFractions})|(${vulgarFractions})`;
    const mixedNumFraction = `\\s(${compositeFractions})|\\s?(${vulgarFractions})`;

    // Alternator is greedy. Prioritize fraction to avoid the numerator being matched as an integer
    const unsigned = `${standaloneFraction}|${integer}(${mixedNumFraction}|${decimal})?`;
    return { signed: `-?(${unsigned})`, unsigned };
  })();

  const horizSpace = '[^\\S\\n\\r]'; // Match the same line only. Optional whitespace between number/unit shouldn't be new lines
  const separators = (sep) => `${horizSpace}?(${sep.join('|')})?${horizSpace}?`; // Optional separators between the unit and number. '10 usd', '10.usd', '10 - usd'
  const numLeftSeparators = separators(['-', ',', '.'].map(escapeRegex));
  const numRightSeparators = separators([
    ...['.', ','].map(escapeRegex),
    `-(?!(${numberMatcher.unsigned}))`, // Don't match the negative sign as a separator
  ]);

  const numLeft = `(?<${captureGroups.numLeft}>${numberMatcher.signed})${numLeftSeparators}`;
  const numRight = `${numRightSeparators}(?<${captureGroups.numRight}>${numberMatcher.signed})`;

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
      label: normalizedLabels.get(groups.label.toLowerCase()),
      strings: groups,
      indices: indices.groups,
    });
    regex.lastIndex = indices.groups.fullLabel[1];
  }
  return matches;
}
