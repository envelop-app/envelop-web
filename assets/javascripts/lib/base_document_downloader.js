import Encryptor from './encryptor';
import ProgressRegister from './progress_register';
import Record from './records/record';
import Workers from './workers';

class DocumentDownloader {
  constructor(doc, options = {}) {
    this.doc = doc;
    this.progress = new ProgressRegister(doc.size);
    this.encryption = options.encryption;
  }

  async download() {
    throw '.download() must be implemented by subclasses';
  }

  onProgress(callback) {
    this.progress.onChange(callback);
  }

  async downloadRawFile(url, options = {}) {
    const getOptions = { username: this.doc._username, decrypt: false, verify: false };
    const contents = await Record.getSession().getFile(url, getOptions);

    if (this.doc.version < 2) {
      return contents;
    }

    const key = this.getEncryptionKey();
    const iv = this.encryption.ivs[options.partNumber];

    let decrypted = null;

    if (window.Worker) {
      this.encryptor = await this.getEncryptor();

      const response = await this.encryptor.perform(
        {
          ...this.encryption,
          contents,
          iv,
          key,
          encoding: 'uint8-buffer',
          type: 'decrypt'
        },
        [contents]
      );
      decrypted = response.data.buffer;
    }
    else {
      decrypted = Encryptor.decrypt(contents, {
        key: Encryptor.utils.decodeBase64(key),
        iv: Encryptor.utils.decodeBase64(iv),
        encoding: 'uint8-buffer'
      });
    }

    return decrypted;
  }

  createBlob(contents) {
    const blobOptions = { name: this.doc.name, type: this.doc.getMimeType() };
    const blobContents = contents.length ? contents : [contents];
    return new Blob(blobContents, blobOptions);
  }

  revokeLater(objectUrl) {
    window.addEventListener('focus', function handler() {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      window.removeEventListener('focus', handler);
    });
  }

  getEncryptionKey() {
    if (this._encryptionKey) { return this._encryptionKey; }

    const keyOptions = {
      salt: this.encryption.salt,
      keyIterations: this.encryption.key_iterations,
      keySize: this.encryption.key_size
    };
    const key = Encryptor.utils.generateKey(this.encryption.passcode, keyOptions);

    return this._encryptionKey = Encryptor.utils.encodeBase64(key);
  }

  async getEncryptor() {
    // Opera is showing high memory usage (> 2GB) while uploading a large
    // file (> 1GB) possibly because it is not releasing memory during the whole
    // process. It was observed that the stale memory was related with the Web Worker,
    // so we are killing and replacing the worker on every 10 calls (9MB each call
    // as of the time of this writing as per Constants.FILE_PART_SIZE)

    this._encryptor_calls = this._encryptor_calls || 1;

    if (this.encryptor && this._encryptor_calls % 10 === 0) {
      await this.encryptor.terminate();
      this.encryptor = null;
    }

    this.encryptor = this.encryptor || new Workers.Encryptor();

    this._encryptor_calls++;

    return this.encryptor;
  }
}

export default DocumentDownloader;
