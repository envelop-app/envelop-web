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
    const ratio = this.currentSize / this.totalSize;
    return Math.round(ratio * 100) / 100;
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
