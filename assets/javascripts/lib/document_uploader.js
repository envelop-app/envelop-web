import crypto from 'crypto-js';

import Encryptor from './encryptor';
import Record from './records/record';
import ProgressRegister from './progress_register';

const publicFileOptions = { encrypt: false, verify: false };
function putPublicFile(name, contents) {
  return Record.getSession().putFile(name, contents, publicFileOptions);
}

class DocumentUploader {
  constructor(doc) {
    this.doc = doc;
    this.reader = new FileReader();
    this.progress = new ProgressRegister(doc.size);
  }

  upload(file) {
    return new Promise((resolve, reject) => {
      this.reader.onload = (evt) => {
        const rawFilePromise = this.uploadRawFile(evt.target.result);
        rawFilePromise
          .then(() => {
            this.progress.add(this.doc.size);
            resolve(this.doc);
          });
      }

      this.reader.onerror = (evt) => {
        reject(evt.target.error);
      }

      this.reader.readAsArrayBuffer(file);
    });
  }

  onProgress(callback) {
    this.progress.onChange(callback);
  }

  uploadRawFile(contents) {
    const encrypted = Encryptor.encrypt(
      contents,
      {
        passcode: this.doc.passcode,
        salt: this.doc.id,
        encoding: 'base64'
      }
    );

    const encryptedPayload = JSON.stringify({
      iv: encrypted.iv,
      payload: encrypted.payload
    });

    const options = { contentType: 'application/json' };
    return putPublicFile(this.doc.url, encryptedPayload, options);
  }
}

export default DocumentUploader;
