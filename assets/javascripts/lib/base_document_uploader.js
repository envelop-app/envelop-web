import Encryptor from './encryptor';
import Record from './records/record';
import ProgressRegister from './progress_register';

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

  uploadRawFile(path, contents, options = {}) {
    const encryptOptions = {
      key: this.getEncryptionKey(),
      encoding: 'uint8-buffer',
      iv: this.getIv(options.partNumber)
    }
    const encrypted = Encryptor.encrypt(contents, encryptOptions);

    const uploadOptions = { contentType: 'application/octet-stream' };
    return putPublicFile(path, encrypted.payload, uploadOptions);
  }

  getIv(partNumber) {
    const iv = this.doc.ivs[partNumber];
    return Encryptor.utils.decodeBase64(iv);
  }

  getEncryptionKey() {
    if (this._encryptionKey) { return this._encryptionKey; }

    const keyOptions = {
      salt: this.doc.salt,
      keyIterations: this.doc.key_iterations,
      keySize: this.doc.key_size
    };
    const key = Encryptor.utils.generateKey(this.doc.passcode, keyOptions);

    return this._encryptionKey = key;
  }
}

export default BaseDocumentUploader;
