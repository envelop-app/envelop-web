import uuid from 'uuid/v4';
import randomstring from 'randomstring';

import { privateUserSession, } from '../lib/blockstack_client';
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

const version = 2;

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

  static fromLocal(raw) {
    return new this(raw);
  }

  static parse(raw, options = {}) {
    if (!raw.iv && !raw.payload) {
      return super.parse(raw, options);
    }

    const decrypted = Encryptor.decrypt(
      raw.payload,
      {
        iv: Encryptor.utils.decodeBase64(raw.iv),
        passcode: options.passcode,
        salt: options.salt,
        encoding: 'utf8'
      }
    );

    const attributes = JSON.parse(decrypted);
    return super.parse(attributes);
  }


  constructor(fields = {}, options = {}) {
    super(fields);

    this.content_type = fields.content_type;
    this.localContents = null;
    this.localId = fields.localId;
    this._username = options.username;
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
      localId: this.id || null,
      passcode: this.passcode || null,
      version: this.version || null,
      name: this.name || null
    };
  }

  serialize(payload = this) {
    const encryptedPayload = Encryptor.encrypt(
      JSON.stringify(payload),
      {
        passcode: payload.passcode,
        salt: payload.id,
        encoding: 'base64'
      }
    );

    return super.serialize({
      iv: encryptedPayload.iv,
      payload: encryptedPayload.payload
    });
  }

  shareUrl() {
    let username = privateUserSession.loadUserData().username;
    username = username.replace('.id.blockstack', '');

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
    record.version = version;
  }
});

GaiaDocument.afterInitialize((record) => {
  if (record.version !== 1) { return; }

  if (record.id && record.url) {
    record.name = record.url.split('/').pop();
  }
});

export default GaiaDocument;
