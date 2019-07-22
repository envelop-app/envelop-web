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

  async downloadRawFile(url, options = {}) {
    const getOptions = { username: this.doc._username, decrypt: false, verify: false };
    const contents = await Record.getSession().getFile(url, getOptions);

    let parsedContents = contents;

    if (this.doc.version > 1) {
      if (!this._encryptionKey) {
        const keyOptions = { salt: this.doc.id };
        this._encryptionKey = Encryptor.utils.generateKey(this.doc.passcode, keyOptions);
      }

      const decryptOptions = {
        key: this._encryptionKey,
        iv: this.getIv(options.partNumber),
        encoding: 'uint8-buffer',
      };

      parsedContents = Encryptor.decrypt(parsedContents, decryptOptions);
    }

    return parsedContents;
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

  getIv(partNumber) {
    const iv = this.doc.ivs[partNumber];
    return Encryptor.utils.decodeBase64(iv);
  }
}

export default DocumentDownloader;
