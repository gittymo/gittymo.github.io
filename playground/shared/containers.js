class Dictionary {
  #keys = [];
  #values = [];

  static KeyValid = (key) =>
    key !== null &&
    key !== undefined &&
    (typeof key === "string" || key instanceof String) &&
    key.trim().length >= 1;

  Add(key, value) {
    if (!Dictionary.KeyValid(key)) {
      throw Error("Key must be a string of at least one character.");
    }

    let existingKeyIndex = this.#getKeyIndex(key);
    if (existingKeyIndex >= 0) {
      if (this.#values[existingKeyIndex] !== value) {
        this.#values[existingKeyIndex] = value;
      }
    } else {
      this.#keys.push(key);
      this.#values.push(value);
    }
  }

  #getKeyIndex(key) {
    return Dictionary.KeyValid(key) ? this.#keys.indexOf(key.trim()) : -1;
  }

  Get(key) {
    let existingKeyIndex = this.#getKeyIndex(key);
    return existingKeyIndex >= 0 ? this.#values[existingKeyIndex] : null;
  }

  KeyExists(key) {
    return this.#getKeyIndex(key) > 0;
  }

  Remove(key) {
    let existingKeyIndex = this.#getKeyIndex(key);
    if (existingKeyIndex > -1) {
      this.#keys.splice(existingKeyIndex, 1);
      this.#values.splice(existingKeyIndex, 1);
    }
  }

  Clear() {
    this.#keys = [];
    this.#values = [];
  }

  Size() {
    return this.#keys.length;
  }
}

class Cache extends Dictionary {
  constructor() {
    super();
  }

  AddOrGet(key, objectConstructor) {
    if (
      objectConstructor === null ||
      objectConstructor === undefined ||
      typeof objectConstructor !== "function"
    ) {
      throw Error("Object constructor must be a function.");
    }
    let existingValue = this.Get(key);
    if (existingValue == null) {
      let value = objectConstructor(key);
      this.Add(key, value);
      // console.log(`Adding new cache item "${key}=${value}".`);
      return value;
    } else {
      // console.log(`Returning cached value "${existingValue}" for key "${key}".`);
      return existingValue;
    }
  }
}

export { Dictionary, Cache };
