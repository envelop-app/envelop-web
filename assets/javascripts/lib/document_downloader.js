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
    const contents = await publicSession.getFile(this.doc.url, getOptions);

    let parsedContents = contents;

    if (this.doc.version > 1) {
      parsedContents = JSON.parse(contents);

      const options = {
        salt: this.doc.id,
        passcode: this.doc.passcode,
        iv: Encryptor.utils.decodeBase64(parsedContents.iv),
        encoding: 'uint8'
      };

      parsedContents = Encryptor.decrypt(parsedContents.payload, options);
    }

    // FIXME:
    // Test the solution with the url = 'base64.,' and then
    // fetch(url) becase in that case decoding should be done by the
    // browser's native code

    return this.createBlob(parsedContents);
  }

  createBlob(contents) {
    const blobOptions = { name: this.doc.name, type: this.doc.getMimeType() };
    return new Blob([contents], blobOptions);
  }

  revokeLater(objectUrl) {
    window.addEventListener('focus', function handler() {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      window.removeEventListener('focus', handler);
    });
  }
}

export default DocumentDownloader;
