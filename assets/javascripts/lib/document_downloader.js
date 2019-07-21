import ProgressRegister from './progress_register';

import { publicUserSession as publicSession } from './blockstack_client';

class DocumentDownloader {
  constructor(doc) {
    this.doc = doc;
    this.progress = new ProgressRegister(doc.size);
  }

  async download() {
    const contents = await this.downloadContents();

    const blob = this.createBlob(contents);
    const objectUrl = URL.createObjectURL(blob);

    this.progress.add(this.doc.size);

    this.revokeLater(objectUrl);

    return objectUrl;
  }

  onProgress(callback) {
    this.progress.onChange(callback);
  }

  downloadContents() {
    const options = { username: this.doc._username, decrypt: false, verify: false };
    return publicSession.getFile(this.doc.url, options);
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
