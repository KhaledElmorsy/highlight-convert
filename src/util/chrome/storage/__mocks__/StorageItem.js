const storageItem = jest.requireActual('../StorageItem').default;

export default class StorageItem {
  constructor(key, area) {
    this.key = key;
    this.area = area;
    Object.setPrototypeOf(this, storageItem.prototype);
  }
}
