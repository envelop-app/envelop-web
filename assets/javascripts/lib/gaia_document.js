import uuid from 'uuid/v4';
import randomstring from 'randomstring';

import Constants from '../lib/constants';
import Encryptor from './encryptor';
import LocalDocumentUploader from '../lib/local_document_uploader';

import Record from './records/record';
import WithFile from './records/mixins/with_file';

function generateHash(length) {
  return randomstring.generate(length);
}

const types = {
  image:   ['png', 'gif', 'jpg', 'jpeg', 'svg', 'tif', 'tiff', 'ico'],
  audio:   ['wav', 'aac', 'mp3', 'oga', 'weba', 'midi'],
  video:   ['avi', 'mpeg', 'mpg', 'mp4', 'ogv', 'webm', '3gp', 'mov'],
  archive: ['zip', 'rar', 'tar', 'gz', '7z', 'bz', 'bz2', 'arc'],
};

const currentVersion = 2;

class Encryption {
  static parse(raw) {
    return new this({
      type: raw.type,
      iv: Encryptor.utils.decodeBase64(raw.params.iv),
      key_iterations: raw.params.key_iterations,
      key_size: raw.params.key_size,
      passcode: raw.params.passcode,
      salt: raw.params.salt
    });
  }

  constructor(fields = {}) {
    this.type = fields.type || 'PBKDF2/AES';
    this.key_iterations = fields.key_iterations || Constants.KEY_ITERATIONS;
    this.key_size = fields.key_size || Constants.KEY_SIZE;
    this.passcode = fields.passcode;
    this.salt = fields.salt;
    this.iv = fields.iv || Encryptor.utils.generateIv();
  }

  serialize() {
    return {
      type: this.type,
      params: {
        iv: Encryptor.utils.encodeBase64(this.iv),
        key_iterations: this.key_iterations,
        key_size: this.key_size,
        salt: this.salt
      }
    }
  }

  toEncryptor() {
    return {
      iv: this.iv,
      keyIterations: this.key_iterations,
      keySize: this.key_size,
      passcode: this.passcode,
      salt: this.salt
    };
  }
}

class GaiaDocument extends WithFile(Record) {
  static fromFile(file) {
    return new this({
      name: file.name,
      created_at: new Date(),
      size: file.size,
      content_type: file.name.split('.').pop(),
      file: file
    });
  }

  static async parse(raw, options = {}) {
    if (!raw.encryption) {
      return super.parse(raw, options);
    }

    const encryption = Encryption.parse({ ...raw.encryption });
    encryption.passcode = options.passcode;

    const decrypted = await Encryptor.decrypt(
      raw.payload,
      {...encryption.toEncryptor(), encoding: 'utf8' }
    );

    const attributes = JSON.parse(decrypted);
    return super.parse(attributes);
  }


  constructor(fields = {}, options = {}) {
    super(fields);

    this.content_type = fields.content_type;
    this.localContents = null;
    this.localId = fields.localId;

    if (!this.username) {
      if (options.username) {
        this.username = options.username;
      }
      else {
        try {
          const userData = Record.getStorage().loadUserData();
          if (userData) {
            this.username = userData.username;
          }
        }
        catch (e) {
          // User is not logged in. Do nothing
        }
      }
    }

    this.passcode = fields.passcode || generateHash(16);
  }

  getType() {
    if (this._type) { return this._type; }

    for (var t in types) {
      if (types[t].includes(this.content_type)) {
        return this._type = t;
      }
    }
    return this._type = 'file';
  }

  isUploading() {
    if (this.isPersisted() && typeof this.uploaded === 'boolean' && this.uploaded === false) {
      return true;
    }
    else {
      return false;
    }
  }

  isReady() {
    if (!this.isPersisted()) {
      return false;
    }

    if (typeof this.uploaded === 'boolean') {
      return this.uploaded;
    }
    else {
      return true;
    }
  }

  async saveLocal() {
    const payload = this.attributes();
    payload.localId = this.localId || uuid();

    const uploader = new LocalDocumentUploader(payload)
    const uploadedDoc = await uploader.upload(this.file);

    return Object.assign(this, payload, uploadedDoc);
  }

  attributes() {
    return {
      ...super.attributes(),
      content_type: this.content_type || null,
      deleted: this.deleted || undefined,
      localId: this.id || null,
      passcode: this.passcode || null,
      version: this.version || null,
      name: this.name || null,
      encryption: this.encryption || null,
      username: this.username || null
    };
  }

  async serialize(payload = this) {
    const encryptionParams = { salt: payload.id, passcode: payload.passcode };
    const encryption = new Encryption(encryptionParams);
    const serializedEncryption = encryption.serialize();

    payload.encryption = serializedEncryption;

    const encryptedPayload = await Encryptor.encrypt(
      JSON.stringify(payload),
      {...encryption.toEncryptor(), encoding: 'base64'}
    );

    return super.serialize({
      encryption: serializedEncryption,
      payload: encryptedPayload.payload
    });
  }

  getEncryption() {
    const encryption = Encryption.parse(this.encryption);
    encryption.passcode = this.passcode;
    return encryption;
  }

  shareUrl() {
    const username = this.username.replace('.id.blockstack', '');
    let url = `${Constants.SHARE_URI}/${username}/${this.id}`;

    if (this.version > 1) {
      url += `!${this.passcode}`;
    }

    return url;
  }

  uniqueKey() {
    return `${this.name}/${this.created_at.getTime()}`;
  }
}

GaiaDocument.afterInitialize((record) => {
  if (record.id) {
    record.version = record.version || 1;
  }
  else {
    record.version = currentVersion;
  }
});

GaiaDocument.afterInitialize((record) => {
  if (record.version !== 1) { return; }

  if (record.id && record.url) {
    record.name = record.url.split('/').pop();
  }
});

GaiaDocument.afterInitialize((record) => {
  if (record.version < 2) { return; }
  record.uploaded = record.uploaded || false;
});

GaiaDocument.beforeDelete((record) => {
  record.deleted = true;
});

export default GaiaDocument;
