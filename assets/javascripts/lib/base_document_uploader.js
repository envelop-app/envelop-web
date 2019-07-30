import Encryptor from './encryptor';
import Record from './records/record';
import ProgressRegister from './progress_register';
import Workers from './workers';

const publicFileOptions = { encrypt: false, verify: false };
function putPublicFile(name, contents) {
  return Record.getSession().putFile(name, contents, publicFileOptions);
}

class BaseDocumentUploader {
  constructor(doc) {
    this.doc = doc;
    this.progress = new ProgressRegister(doc.size);
  }

  upload(_file) {
    return Promise.reject('.upload must be implemented in subclasses');
  }

  onProgress(callback) {
    this.progress.onChange(callback);
  }

  async encrypt(contents, options = {}) {
    const encryption = this.doc.getEncryption().toEncryptor();

    const key = this.getEncryptionKey(encryption);
    const iv = this.doc.part_ivs[options.partNumber];

    let encrypted = null;

    if (this.doc.num_parts > 1 && window.Worker) {
      this.encryptor = await this.getEncryptor();

      const response = await this.encryptor.perform(
        {
          ...encryption,
          contents,
          iv,
          key,
          encoding: 'uint8-buffer',
          type: 'encrypt'
        },
        [contents]
      );
      encrypted = response.data.buffer;
    }
    else {
      const result = Encryptor.encrypt(contents, {
        key: Encryptor.utils.decodeBase64(key),
        iv: Encryptor.utils.decodeBase64(iv),
        encoding: 'uint8-buffer'
      });
      encrypted = result.payload;
    }

    return encrypted;
  }

  async uploadRawFile(path, contents, options = {}) {
    let encrypted = await this.encrypt(contents, options)
    contents = null;

    const uploadOptions = { contentType: 'application/octet-stream' };
    let putFile = putPublicFile(path, encrypted, uploadOptions);

    encrypted = null;

    return putFile;
  }

  getEncryptionKey(encryption) {
    if (this._encryptionKey) { return this._encryptionKey; }

    const keyOptions = {
      salt: encryption.salt,
      keyIterations: encryption.keyIterations,
      keySize: encryption.keySize
    };
    const key = Encryptor.utils.generateKey(
      encryption.passcode,
      keyOptions
    );

    return this._encryptionKey = Encryptor.utils.encodeBase64(key);
  }

  async getEncryptor() {
    // Opera is showing high memory usage (> 2GB) while uploading a large
    // file (> 1GB) possibly because it is not releasing memory during the whole
    // process. It was observed that the stale memory was related with the Web Worker,
    // so we are killing and replacing the worker on every 10 calls (9MB each call
    // as of the time of this writing as per Constants.FILE_PART_SIZE)

    this._encryptor_calls = this._encryptor_calls || 1;

    if (this._encryptor_calls % 10 === 0) {
      await this.encryptor.terminate();
      this.encryptor = null;
    }

    this.encryptor = this.encryptor || new Workers.Encryptor();

    this._encryptor_calls++;

    return this.encryptor;
  }
}

export default BaseDocumentUploader;
