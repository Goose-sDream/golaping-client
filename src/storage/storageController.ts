export default class StorageController {
  private storage: Storage;

  constructor(type: "session" | "local" = "session") {
    this.storage = type === "session" ? sessionStorage : localStorage;
  }

  setItem(key: string, value: string) {
    this.storage.setItem(key, value);
  }

  getItem(key: string) {
    return this.storage.getItem(key);
  }

  removeItem(key: string) {
    this.storage.removeItem(key);
  }

  clear() {
    this.storage.clear();
  }
}
