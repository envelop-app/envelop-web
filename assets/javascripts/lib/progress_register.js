class ProgressRegister {
  constructor(totalSize) {
    this.totalSize = totalSize;
    this.currentSize = 0;
    this.callbacks = [];
  }

  add(size) {
    this.currentSize += size;
    this.triggerOnChange();
  }

  get() {
    return this.currentSize / this.totalSize;
  }

  onChange(callback) {
    if (callback && typeof callback === 'function') {
      this.callbacks.push(callback);
    }
    else {
      throw "Progress callback must be of type 'function'";
    }
  }

  triggerOnChange() {
    this.callbacks.forEach((callback) => {
      callback(this.get());
    });
  }
}

export default ProgressRegister;
