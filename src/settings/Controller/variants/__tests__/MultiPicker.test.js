import MultiPicker from '../MultiPicker';
import { defaultSetup as pickerSetup } from './Picker.test';

const { options, key, area } = pickerSetup;
const defaultValue = options.slice(0, 2);
const defaultSetup = { ...pickerSetup, defaultValue };

describe('validate():', () => {
  it('Returns true if each element in the value array is an option and not repeated', () => {
    const multiPicker = new MultiPicker(defaultSetup);
    const valid = [[], options, options.slice(1), [options[0], options.at(-1)]];

    const invalid = [
      options[0], // Must be an array
      [options[1], { name: 'Steve' }], // No invalid options
      options.concat(options.slice(1)), // No repetitions
    ];

    [
      [valid, true],
      [invalid, false],
    ].forEach(([tests, expected]) => {
      tests.forEach((value) =>
        expect(multiPicker.validate(value)).toBe(expected)
      );
    });
  });
});
