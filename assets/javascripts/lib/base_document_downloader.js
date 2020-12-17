import Encryptor from './encryptor';
import ProgressRegister from './progress_register';
import Record from './records/record';
import Workers from './workers';

class BaseDocumentDownloader {
  constructor(doc) {
    this.doc = doc;
    this.progress = new ProgressRegister(doc.size);
    this.encryptor = new Workers.Encryptor({ restartEvery: 10 });
  }

  async download() {
    throw '.download() must be implemented by subclasses';
  }

  onProgress(callback) {
    this.progress.onChange(callback);
  }

  async downloadRawFile(url, options = {}) {
    const getOptions = { username: this.doc.username, decrypt: false, verify: false };
    const contents = await Record.getSession().getFile(url, getOptions);

    if (this.doc.version < 2) {
      return contents;
    }

    const encryption = this.doc.getEncryption().toEncryptor();

    const key = await this.getEncryptionKey(encryption);
    const iv = this.doc.part_ivs[options.partNumber];

    let decrypted = null;

    if (this.doc.num_parts > 1 && window.Worker) {
      const response = await this.encryptor.perform(
        {
          ...encryption,
          contents,
          iv,
          key,
          encoding: 'uint8-buffer',
          type: 'decrypt'
        },
        [contents]
      );
      decrypted = response.data.buffer;
    }
    else {
      decrypted = await Encryptor.decrypt(contents, {
        key: Encryptor.utils.decodeBase64(key),
        iv: Encryptor.utils.decodeBase64(iv),
        encoding: 'uint8-buffer'
      });
    }

    return decrypted;
  }

  async getEncryptionKey(encryption) {
    if (this._encryptionKey) { return this._encryptionKey; }

    const key = await Encryptor.utils.generateKey(
      encryption.passcode,
      {...encryption, encoding: 'base64' }
    );

    return this._encryptionKey = key;
  }
}

export default BaseDocumentDownloader;
