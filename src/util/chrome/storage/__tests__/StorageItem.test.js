import StorageItem from '../StorageItem';

const key = 'test.path';

afterEach(jest.clearAllMocks);

const testInstance = new StorageItem(key, chrome.storage.local);

describe('set():', () => {
  it('Calls the areas set() method with the key prop and passed items', async () => {
    const items = {
      name: 'Khaled',
    };
    await testInstance.set(items);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      [key]: items,
    });
  });
});

describe('get():', () => {
  it('Calls the areas get() method with the passed key and returns the stored value', async () => {
    const testValue = { test: 'successful ✅' };

    chrome.storage.local.get.mockReturnValueOnce({
      [key]: testValue,
    });

    expect(await testInstance.get()).toEqual(testValue);
  });

  it('returns undefined if nothing is stored at the key', async () => {
    chrome.storage.local.get.mockReturnValueOnce({});

    expect(await testInstance.get()).toBe(undefined);
  });
});

describe('merge():', () => {
  it('Sets the item to the passed value if not an object', () => {
    testInstance.merge('test');
    testInstance.merge([1]);
    expect(chrome.storage.local.set).toHaveBeenNthCalledWith(1, { [key]: 'test' });
    expect(chrome.storage.local.set).toHaveBeenNthCalledWith(2, { [key]: [1] });
  });

  it('Deep merges passed objects with the stored state, overwriting arrays', async () => {
    const initialState = {
      user: {
        settings: {
          darkMode: true,
          showOffline: false,
          sendDiagnostics: false,
        },
      },
      browser: {
        bookmarks: ['bm1', 'bm2'],
        incognito: true,
      },
    };

    chrome.storage.local.get.mockReturnValueOnce({
      [key]: initialState,
    });

    const update = {
      user: { settings: { sendDiagnostics: true } },
      browser: { bookmarks: ['bm0'], incognito: false },
    };

    const expected = JSON.parse(JSON.stringify(initialState));
    expected.user.settings.sendDiagnostics = true;
    expected.browser = {
      bookmarks: ['bm0'], // Overwrite array
      incognito: false,
    };

    await testInstance.merge(update);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ [key]: expected });
  });

  it('Sets item to the passed value if the stored item isnt an object', async () => {
    const update = { test: 'update' };
    const testItems = [{}, {[key]: [1]}, {[key]: 'asd'}];

    for (let item of testItems) {
      chrome.storage.local.get.mockReturnValueOnce(item);
      await testInstance.merge(update);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ [key]: update });
      chrome.storage.local.set.mockClear();
    }
  });
});
