import Encryptor from './encryptor';
import ProgressRegister from './progress_register';
import Record from './records/record';

class DocumentDownloader {
  constructor(doc) {
    this.doc = doc;
    this.progress = new ProgressRegister(doc.size);
  }

  async download() {
    throw '.download() must be implemented by subclasses';
  }

  onProgress(callback) {
    this.progress.onChange(callback);
  }

  async downloadRawFile(url) {
    const getOptions = { username: this.doc._username, decrypt: false, verify: false };
    const contents = await Record.getSession().getFile(url, getOptions);

    let parsedContents = contents;

    if (this.doc.version > 1) {
      parsedContents = JSON.parse(contents);

      const options = {
        salt: this.doc.id,
        passcode: this.doc.passcode,
        iv: Encryptor.utils.decodeBase64(parsedContents.iv),
        encoding: 'uint8-buffer',
      };

      parsedContents = Encryptor.decrypt(parsedContents.payload, options);
    }

    return parsedContents;
  }

  createBlob(contents) {
    const blobOptions = { name: this.doc.name, type: this.doc.getMimeType() };
    const blobContents = contents.length ? contents : [contents];
    console.log(blobContents)
    return new Blob(blobContents, blobOptions);
  }

  revokeLater(objectUrl) {
    window.addEventListener('focus', function handler() {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      window.removeEventListener('focus', handler);
    });
  }
}

export default DocumentDownloader;
