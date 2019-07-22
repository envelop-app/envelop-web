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

  uploadRawFile(path, contents) {
    if (!this._encryptionKey) {
      const keyOptions = { salt: this.doc.id };
      this._encryptionKey = Encryptor.utils.generateKey(this.doc.passcode, keyOptions);
    }

    const encrypted = Encryptor.encrypt(
      contents,
      {
        key: this._encryptionKey,
        salt: this.doc.id,
        encoding: 'base64'
      }
    );

    const encryptedPayload = JSON.stringify({
      iv: encrypted.iv,
      payload: encrypted.payload
    });

    const options = { contentType: 'application/json' };
    return putPublicFile(path, encryptedPayload, options);
  }
}

export default BaseDocumentUploader;
