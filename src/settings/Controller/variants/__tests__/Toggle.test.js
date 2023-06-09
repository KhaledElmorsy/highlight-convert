import StorageArea from '@@mocks/chrome/storage/StorageArea';
import Toggle from '../Toggle';

const key = 'test';
const area = 'sync';
const defaultSetup = { key, area };

beforeEach(() => {
  StorageArea.clearAll()
})

describe('constructor():', () => {
  it('Sets default value if passed', async () => {
    const toggle = new Toggle({ ...defaultSetup, defaultValue: false });
    await toggle.setupComplete;
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ [key]: false });
  });

  it('Sets value to "true" by default if one isnt passed', async () => {
    const toggle = new Toggle(defaultSetup);
    await toggle.setupComplete;
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ [key]: true });
  });
});

describe('validate():', () => {
  it('Validates if the value is a boolean', async () => {
    const toggle = new Toggle(defaultSetup);
    await toggle.setupComplete;
    const tests = [
      { group: 'valid', values: [false, true], expected: true },
      { group: 'invalid', values: [[], {}, 'asd', 2, null], expected: false },
    ];
    tests.forEach(({ values, expected }) => {
      values.forEach((value) => expect(toggle.validate(value)).toBe(expected));
    });
  });
});

describe('toggle():', () => {
  it('Toggles the value', async () => {
    const toggle = new Toggle(defaultSetup);
    await toggle.setupComplete;

    for (let initialVal of [true, false]) {
      chrome.storage.sync.get.mockReturnValueOnce({ [key]: initialVal });
      await toggle.toggle();
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({
        [key]: !initialVal,
      });
    }
  });
});
