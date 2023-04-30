import Range from '../Range';
import storage from '@mocks/chrome/storage/storage';
import setupCompletion from '@/settings/test-utils/setupCompletion';

const key = 'test';
const area = 'sync';
const path = { key, area };

describe('constructor():', () => {
  it('Throws if passed an invalid options range', () => {
    const validRange = { min: 0, max: 10, step: 2.5 };
    expect(() => new Range({ ...path, options: validRange })).not.toThrow();

    const invalidRanges = [
      { min: 10, max: 0, step: 2 }, // max < min
      { min: 10, max: 10, step: 4 }, // max == min
      { min: 0, max: 10, step: 20 }, // step > (max - min)
      { min: 0, max: 10, step: 0 }, // step == 0
      { min: 0, max: 10, step: -2 }, // step < 0
      { min: 0, max: 10, step: 3 }, // Imperfect width: (max - min)%step !== 0
    ];
    invalidRanges.forEach((range) => {
      expect(() => new Range({ ...path, options: range })).toThrow();
    });
  });
});

describe('validate():', () => {
  it('Fails invalid values', async () => {
    const options = { min: 2, max: 8, step: 0.5 };
    const range = new Range({ ...path, options });
    await setupCompletion();

    const tests = [
      { group: 'valid', values: [2, 8, 3.5], expected: true },
      { group: 'invalid', values: [0, 9, 4.25], expected: false },
    ];

    tests.forEach(({ values, expected }) => {
      values.forEach((value) => expect(range.validate(value)).toBe(expected));
    });
  });
});
