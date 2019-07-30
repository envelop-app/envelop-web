const sleep = (milis) => {
  return new Promise((resolve) => setTimeout(resolve, milis));
};

const factory = (workerKlass) => {
  return class {
    constructor(options = {}) {
      this.worker = null // lazy create worker;
      this.busy = false;
      this.restartEvery = options.restartEvery || Infinity;
      this.performCalls = 0;
    }

    async perform(work) {
      if (this.busy) {
        await this.wait();
      }
      this.busy = true;

      if (!this.worker) {
        this.worker = workerKlass();
      }

      if (this.performCalls >= this.restartEvery) {
        this.worker.terminate();
        this.worker = workerKlass();
        this.performCalls = 0;
      }

      const that = this;
      const promise = new Promise((resolve, reject) => {
        this.worker.addEventListener('message', function handle(response) {
          that.worker.removeEventListener('message', handle);

          that.busy = false;
          that.performCalls++;

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
