import Encryptor from './encryptor';
import ProgressRegister from './progress_register';

import { publicUserSession as publicSession } from './blockstack_client';

class DocumentDownloader {
  constructor(doc) {
    this.doc = doc;
    this.progress = new ProgressRegister(doc.size);
  }

  async download() {
    const blob = await this.downloadContents();
    const objectUrl = URL.createObjectURL(blob);

    this.progress.add(this.doc.size);

    this.revokeLater(objectUrl);

    return objectUrl;
  }

  onProgress(callback) {
    this.progress.onChange(callback);
  }

  async downloadContents() {
    const getOptions = { username: this.doc._username, decrypt: false, verify: false };
    const encryptedContents = await publicSession.getFile(this.doc.url, getOptions);
    const encryptedPayload = JSON.parse(encryptedContents);

    const options = {
      salt: this.doc.id,
      passcode: this.doc.passcode,
      iv: Encryptor.utils.decodeBase64(encryptedPayload.iv),
      encoding: 'uint8'
    };

    const decrypted = Encryptor.decrypt(encryptedPayload.payload, options);

    // FIXME:
    // Test the solution with the url = 'base64.,' and then
    // fetch(url) becase in that case decoding should be done by the
    // browser's native code

    return this.createBlob(decrypted);
  }

  createBlob(contents) {
    const blobOptions = { name: this.doc.name, type: this.doc.getMimeType() };
    return new Blob([ contents ], blobOptions);
  }

  revokeLater(objectUrl) {
    window.addEventListener('focus', function handler() {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      window.removeEventListener('focus', handler);
    });
  }
}

export default DocumentDownloader;
