import StorageArea from "./StorageArea"

global.chrome ??= {}

/* Mock and export chrome's storage namespace (Extend as needed) */
global.chrome.storage = {
  local: new StorageArea(),
  sync: new StorageArea(),
  session: new StorageArea()
}

export default global.chrome.storage
