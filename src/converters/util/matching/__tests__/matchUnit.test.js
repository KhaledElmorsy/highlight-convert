import matchUnit from '../matchUnit';
const unit = 'usd';

describe('Finding Matches', () => {
  describe('Matching units:', () => {
    /** @type {[string: string, matchCount: number][]} */
    let tests;

    afterEach(() => {
      tests.forEach(([string, matchCount]) => {
        expect(matchUnit(string, unit).length).toBe(matchCount);
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
        const match = matchUnit(string, unit)[0];
        expect(match.numLeft).toBe(numLeft ?? both);
        expect(match.numRight).toBe(numRight ?? both);
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
        ['-123,123 usd -123,123',, , '-123,123'], // Negative numbers
        ['14,12 usd 14,12', '12', '14'], // If invalid, match the nearest valid
      ];
    });
    test('Number-Unit Separators', () => {
      tests = [
        ['111-usd','111'], // Dash (other side would be a negative number)
        ['-111-usd--111', , ,'-111'], // Dash w/ negative
        ['112 - usd - 112', , , '112'], // Dash & white space
        ['-112 - usd - -112', , , '-112'], // Dash & white space w/ negative
        ['113 .usd.113', , , '113'], // Period - Decimal points are included w/ the number i.e. '123.' ✅
        ['-113 .usd.-113', , , '-113'], // Period w/ negative
        ['114 . usd . 114', , , '114'], // Period & white space
        ['-114 . usd . -114', , , '-114'], // Period & white space w/ negative
        ['115  usd  115', , , '115'], // Two whitespaces max
        ['-115  usd  -115', , , '-115'], // Two whitespaces max w/ negative
        ['116   usd   116'], // ^^
        ['10\nusd\n-10'] // Must be on the same line
      ];
    });

    test('Numbers next to (potentially belonging to) multiple units', () => {
      tests = [];
      const string = '12 usd 10 usd 15'; // 10 can belong to either unit
      const matches = matchUnit(string, unit);
      expect(matches[0].numLeft).toBe('12');
      expect(matches[0].numRight).toBe('10');
      expect(matches[1].numLeft).toBe('10');
      expect(matches[1].numRight).toBe('15');
    });
  });
});

it('Returns the start & end (excl.) indices of the matched unit & numbers', () => {
  const string = 'test 123 usd 435';
  const { indices } = matchUnit(string, unit)[0];
  expect(indices.unit).toEqual([9, 12]);
  expect(indices.numLeft).toEqual([5, 8]);
  expect(indices.numRight).toEqual([13, 16]);
});

it('Optionally matches the units letter case', () => {
  const string = '10 kb are not 10 kB';
  const unit = 'kB';
  expect(matchUnit(string, unit, false).length).toBe(2);
  const matches = matchUnit(string, unit, true);
  expect(matches.length).toBe(1);
  expect(matches[0].indices.unit[0]).toBe(17);
});
