import Controller from './Controller';
import StorageArea from '@@mocks/chrome/storage/StorageArea';

const area = 'sync';
const key = 'test.setting';
const defaultValue = { name: 'Khaled', level: 320 };
const options = [
  { name: 'Khaled', level: 320 },
  { name: 'Jeff', level: 155 },
  { name: 'Steve', level: 299 },
];
const defaultSetup = { area, key, defaultValue, options };

let controller;

async function createNewController(callback = () => {}, setup = defaultSetup) {
  StorageArea.clearAll();
  jest.clearAllMocks();
  callback();
  controller = new Controller(setup);
  await controller.setupComplete;
}

beforeEach(async () => {
  await createNewController();
});

describe('constructor():', () => {
  it('Sets value to default if no storage item exists', async () => {
    await createNewController(() =>
      chrome.storage.sync.get.mockReturnValueOnce({})
    );
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      [key]: defaultValue,
    });
  });

  it('Updates stored value if its not a valid option', async () => {
    let validateSpy;
    await createNewController(() => {
      const storedValue = {};
      chrome.storage.sync.get.mockReturnValueOnce({ [key]: storedValue });
      validateSpy = jest
        .spyOn(Controller.prototype, 'validate')
        .mockImplementation((v) => v !== storedValue);
    });

    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      [key]: defaultValue,
    });

    validateSpy.mockRestore();
  });
});

describe('get():', () => {
  it('Returns the current setting', async () => {
    chrome.storage.sync.get.mockReturnValue({ [key]: defaultValue });
    const value = await controller.get();
    expect(value).toBe(defaultValue);
    chrome.storage.sync.get.mockReset();
  });
});

describe('set():', () => {
  it('Replaces the current setting value when passed:', async () => {
    await controller.set(options[1]);
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      [key]: options[1],
    });
  });

  it('Throws if attempting to set an invalid value', async () => {
    jest.spyOn(Controller.prototype, 'validate').mockReturnValueOnce(false);
    await expect(controller.set('test')).rejects.toThrow();
  });
});
