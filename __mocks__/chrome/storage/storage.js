import StorageArea from "./StorageArea"

/* Mock and export chrome's storage namespace (Extend as needed) */
const storage = {
  local: new StorageArea(),
  sync: new StorageArea(),
  session: new StorageArea()
}

export default storage
