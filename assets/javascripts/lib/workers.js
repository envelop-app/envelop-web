const sleep = (milis) => {
  return new Promise((resolve) => setTimeout(resolve, milis));
};

const factory = (workerKlass) => {
  return class {
    constructor() {
      this.worker = workerKlass();
      this.busy = false;
    }

    async perform(work) {
      if (this.busy) {
        await this.wait();
      }

      this.busy = true;

      const that = this;
      const promise = new Promise((resolve, reject) => {
        this.worker.addEventListener('message', function handle(response) {
          that.worker.removeEventListener('message', handle);

          that.busy = false;
          resolve(response);
        });

        this.worker.addEventListener('onerror', (err) => {
          reject(err);
        });
      });

      this.worker.postMessage(work);

      return promise;
    }

    async wait() {
      while (this.busy) {
        await sleep(50);
      }
    }

    async terminate() {
      if (this.busy) {
        await this.wait();
      }

      this.worker.terminate();
    }
  }
}

const workerConstructors = {
  Encryptor: () => new Worker('./workers/encryptor_worker.js', { type: 'module' })
}

const Workers = {
  Encryptor: factory(workerConstructors.Encryptor)
};

export default Workers;
