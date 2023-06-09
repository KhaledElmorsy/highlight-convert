import matchUnit from '../matchUnit';
const units = new Set(['usd']);

describe('Finding Matches', () => {
  describe('Matching units:', () => {
    /** @type {[string: string, matchCount: number][]} */
    let tests;

    afterEach(() => {
      tests.forEach(([string, matchCount]) => {
        expect(matchUnit(string, units).length).toBe(matchCount);
      });
    });
    test('No matches', () => {
      tests = [['how many euro', 0]];
    });
    test('Same case', () => {
      tests = [['How many usd', 1]];
    });
    test('Case insensitive', () => {
      tests = [
        ['How about USD', 1],
        ['Or UsD', 1],
      ];
    });
    test('Multiple occorunces', () => {
      tests = [['usd & usd', 2]];
    });
    test('With adjacent symbols', () => {
      tests = [
        ['usd!', 1],
        ['$usd', 1],
      ];
    });
    test('Without adjacent letters', () => {
      tests = [
        ['usdt', 0],
        ['ausd', 0],
      ];
    });
    test('With following "s" (plural)', () => {
      tests = [['usds', 1]];
    });
    test('With adjacent numbers', () => {
      tests = [
        ['10usd', 1],
        ['usd100', 1],
      ];
    });
  });

  describe('Matching numbers:', () => {
    /**
     * @type {
     *  [string: string, numLeft: string, numRight: string, both: number][]
     * }
     */
    let tests;

    afterEach(() => {
      tests.forEach(([string, numLeft, numRight, both]) => {
        const match = matchUnit(string, units)[0];
        expect(match.strings.numLeft).toBe(numLeft ?? both);
        expect(match.strings.numRight).toBe(numRight ?? both);
      });
    });

    /*
      Test for negative numbers in each case instead of in its own test that includes 
      all the base cases.
      Better to add/update one test each change instead of two.
    */

    test('Integer before', () => {
      tests = [
        ['123usd', '123'],
        ['-123 usd', '-123'],
      ];
    });
    test('Integer after', () => {
      tests = [
        ['usd10', , '10'],
        ['usd -20', , '-20'],
      ];
    });
    test('Decimals', () => {
      tests = [
        ['10.01 usd 10.01', , , '10.01'],
        ['10. usd 10.', , , '10.'],
        ['-10.234 usd -10.', '-10.234', '-10.'],
      ];
    });
    test('Thousands separator', () => {
      tests = [
        ['12,123 usd 12,123', , , '12,123'],
        ['123,123 usd 123,123', , , '123,123'],
        ['-123,123 usd -123,123', , , '-123,123'], // Negative numbers
        ['14,12 usd 14,12', '12', '14'], // If invalid, match the nearest valid
      ];
    });

    test('Composite fractions', () => {
      tests = [
        // Forward slash
        ['100/200 usd 100/200', , , '100/200'],
        ['-100/200 usd -100/200', , , '-100/200'],

        // Forward slash - Mixed numbers
        ['5 1/2 usd 5 1/2', , , '5 1/2'],
        ['-5 1/2 usd -5 1/2', , , '-5 1/2'],

        // Forward slash - Invalid
        ['12.4/124.5 usd 1,000/2,000', '124.5', '1,000'],
        ['5.23 1/2 usd', '23 1/2'],

        // Fraction slash (U+2044)
        ['100⁄200 usd 100⁄200', , , '100⁄200'],
        ['-100⁄200 usd -100⁄200', , , '-100⁄200'],

        // Fraction slash - Mixed numbers
        ['5 100⁄200 usd 5 100⁄200', , , '5 100⁄200'],
        ['-5 100⁄200 usd -5 100⁄200', , , '-5 100⁄200'],

        // Fraction slash - Mixed numbers
        ['12.5⁄3 usd 2⁄3.1', '5⁄3', '2⁄3'], // Hard to screw this one up
      ];
    });

    test('Vulgar fractions', () => {
      const unicodeRanges = [
        [188, 190],
        [8528, 8542],
        [8585, 8585],
      ];

      const characters = unicodeRanges.flatMap(([start, end]) =>
        Array.from({ length: end - start + 1 }, (_, i) => start + i)
      );

      tests = characters.flatMap((charCode) => {
        const f = String.fromCharCode(charCode);
        return [
          // Standalone Fraction
          [`${f} usd ${f}`, , , f],
          [`-${f} usd -${f}`, , , `-${f}`],

          // Mixed Number
          [`5${f} usd 5${f}`, , , `5${f}`], // Adjacent, since it's one character
          [`-5${f} usd -5${f}`, , , `-5${f}`],
          [`5 ${f} usd 5 ${f}`, , , `5 ${f}`], // Space separated
          [`-5 ${f} usd -5 ${f}`, , , `-5 ${f}`],

          // Invalid
          [`20.2${f} usd 20.2${f}`, `2${f}`, '20.2'],
        ];
      });
    });

    test('Number-Unit Separators', () => {
      tests = [
        ['111-usd', '111'], // Dash (other side would be a negative number)
        ['-111-usd--111', , , '-111'], // Dash w/ negative
        ['112 - usd - 112', , , '112'], // Dash & white space
        ['-112 - usd - -112', , , '-112'], // Dash & white space w/ negative
        ['113 .usd.113', , , '113'], // Period - Decimal points are included w/ the number i.e. '123.' ✅
        ['-113 .usd.-113', , , '-113'], // Period w/ negative
        ['114 . usd . 114', , , '114'], // Period & white space
        ['-114 . usd . -114', , , '-114'], // Period & white space w/ negative
        ['115  usd  115', , , '115'], // Two whitespaces max
        ['-115  usd  -115', , , '-115'], // Two whitespaces max w/ negative
        ['116   usd   116'], // ^^
        ['10\nusd\n-10'], // Must be on the same line
      ];
    });

    test('Numbers next to (potentially belonging to) multiple units', () => {
      tests = [];
      const string = '12 usd 10 usd 15'; // 10 can belong to either unit
      const matches = matchUnit(string, units);
      expect(matches[0].strings.numLeft).toBe('12');
      expect(matches[0].strings.numRight).toBe('10');
      expect(matches[1].strings.numLeft).toBe('10');
      expect(matches[1].strings.numRight).toBe('15');
    });
  });
});

it('Returns the start & end (excl.) indices of the matched unit & numbers', () => {
  const string = 'test 123 usd 435';
  const { indices } = matchUnit(string, units)[0];
  expect(indices.label).toEqual([9, 12]);
  expect(indices.fullLabel).toEqual([9, 12]);
  expect(indices.numLeft).toEqual([5, 8]);
  expect(indices.numRight).toEqual([13, 16]);

  // Include the 's' in indices for plural labels
  const pluralTest = 'Convert 200 USDs';
  const { indices: pluralIndices } = matchUnit(pluralTest, units)[0];
  expect(pluralIndices.fullLabel).toEqual([12, 16]);
});

it('Optionally matches the units letter case', () => {
  const string = '10 kb are not 10 kB';
  const labels = new Set(['kB']);
  expect(matchUnit(string, labels, false).length).toBe(2);
  const matches = matchUnit(string, labels, true);
  expect(matches.length).toBe(1);
  expect(matches[0].indices.fullLabel[0]).toBe(17);
});
