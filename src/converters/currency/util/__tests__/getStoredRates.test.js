import getStoredRates, { key } from '../getStoredRates';
import storage from '@mocks/chrome/storage/storage';

const mockStoredRates = () => {
  const storedRates = {
    date: new Date().toLocaleDateString('en-us'),
    rates: {},
  };

  storage.local.get.mockReturnValueOnce({
    [key]: storedRates,
  });

  return storedRates;
};

it('Returns stored rates if their date matches the current date', async () => {
  const storedRates = mockStoredRates();
  expect(await getStoredRates()).toBe(storedRates.rates);
});

describe('Requests, transforms and stores updated rates, with:', () => {
  afterEach(async () => {
    const apiRates = { date: '', usd: { eur: 0.8, egp: 30 } };
    const response = { ok: true, json: async () => apiRates };
    jest.spyOn(global, 'fetch').mockResolvedValue(response);

    const finalRates = expect.objectContaining({
      eur: 0.8,
      egp: 30,
      usd: 1, // Rates come normalized to usd and without a usd property. Add one.
    });

    expect(await getStoredRates()).toEqual(finalRates);
    expect(storage.local.set).toBeCalledWith({
      [key]: {
        date: new Date().toLocaleDateString('en-us'),
        rates: finalRates,
      },
    });
  });

  test('No stored rates', async () => {
    storage.local.get.mockReturnValueOnce({});
  });

  test('Stale rates', async () => {
    storage.local.get.mockReturnValueOnce({
      [key]: {
        date: '29/02/2000',
        rates: { usd: 1 },
      },
    });
  });

  describe('On failed requests, return stored rates:', () => {
    let fetchSpy;
    afterEach(async () => {
      const storedRates = mockStoredRates();
      expect(await getStoredRates()).toBe(storedRates.rates);
      fetchSpy.mockRestore();
    });

    test('Fetch request throws', () => {
      fetchSpy = jest.spyOn(global, 'fetch').mockRejectedValue();
    });
    test('HTTP errors', () => {
      fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false });
    });
  });
});
