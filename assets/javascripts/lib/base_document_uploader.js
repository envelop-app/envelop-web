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
    if (!this._encryptionKey) {
      const keyOptions = { salt: this.doc.id };
      this._encryptionKey = Encryptor.utils.generateKey(this.doc.passcode, keyOptions);
    }

    const encryptOptions = {
      key: this._encryptionKey,
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
}

export default BaseDocumentUploader;
