import Encryptor from './encryptor';
import Record from './records/record';
import ProgressRegister from './progress_register';
import Workers from './workers';

const publicFileOptions = { encrypt: false, verify: false };
function putPublicFile(name, contents) {
  return Record.getStorage().putFile(name, contents, publicFileOptions);
}

class BaseDocumentUploader {
  constructor(doc) {
    this.doc = doc;
    this.progress = new ProgressRegister(doc.size);
    this.encryptor = new Workers.Encryptor({ restartEvery: 10 });
    this.uploadedCallbacks = [];
  }

  async upload(_file) {
    this.doc.uploaded = true;
    this.doc.file = null;
    await this.doc.save({ skipHooks: true });

    this.triggerOnUploaded(this.doc);

    return Promise.resolve();
  }

  onProgress(callback) {
    this.progress.onChange(callback);
  }

  onUploaded(callback) {
    this.uploadedCallbacks.push(callback);
  }

  triggerOnUploaded() {
    this.uploadedCallbacks.forEach(cb => cb(this.doc));
  }

  async encrypt(contents, options = {}) {
    const encryption = this.doc.getEncryption().toEncryptor();

    const key = await this.getEncryptionKey(encryption);
    const iv = this.doc.part_ivs[options.partNumber];

    let encrypted = null;

    if (this.doc.num_parts > 1 && window.Worker) {
      const response = await this.encryptor.perform(
        {
          ...encryption,
          contents,
          iv,
          key,
          encoding: 'uint8-buffer',
          type: 'encrypt'
        },
        [contents]
      );
      encrypted = response.data.buffer;
    }
    else {
      const result = await Encryptor.encrypt(contents, {
        key: Encryptor.utils.decodeBase64(key),
        iv: Encryptor.utils.decodeBase64(iv),
        encoding: 'uint8-buffer'
      });
      encrypted = result.payload;
    }

    return encrypted;
  }

  async uploadRawFile(path, contents, options = {}) {
    let encrypted = await this.encrypt(contents, options)
    contents = null;

    const uploadOptions = { contentType: 'application/octet-stream' };
    let putFile = putPublicFile(path, encrypted, uploadOptions);

    encrypted = null;

    return putFile;
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

export default BaseDocumentUploader;
