import chrome from "@@mocks/chrome"; 

// Mock chrome api's
global.chrome = chrome;

// Mock fetch since it's not implemented in JSDOM https://github.com/jsdom/jsdom/issues/1724
global.fetch = jest.fn();

// Bypass duplicate storage arae/key exceptions while maintaining normal fuinctionality
jest.mock('@util/chrome/storage/StorageItem')
