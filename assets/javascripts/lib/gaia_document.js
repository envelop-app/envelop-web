import randomstring from 'randomstring';

import { privateUserSession, } from '../lib/blockstack_client';
import Constants from '../lib/constants';
import LocalDocumentUploader from '../lib/local_document_uploader';

import Record from './records/record';
import WithFile from './records/mixins/with_file';

const types = {
  image:   ['png', 'gif', 'jpg', 'jpeg', 'svg', 'tif', 'tiff', 'ico'],
  audio:   ['wav', 'aac', 'mp3', 'oga', 'weba', 'midi'],
  video:   ['avi', 'mpeg', 'mpg', 'mp4', 'ogv', 'webm', '3gp', 'mov'],
  archive: ['zip', 'rar', 'tar', 'gz', '7z', 'bz', 'bz2', 'arc'],
};

function generateHash(length) {
  return randomstring.generate(length);
}

const version = 2;

class GaiaDocument extends WithFile(Record) {
  static get attributes() {
    return {
      ...super.attributes,
      version: null
    }
  }
  static fromFile(file) {
    return new this({
      name: file.name,
      created_at: new Date(),
      size: file.size,
      content_type: file.name.split('.').pop(),
      file: file
    });
  }

  static fromGaiaIndex(raw) {
    if (!raw.version || raw.version < 2) {
      raw.version = 1;
    }

    return new this({
      ...raw,
      name: raw.name,
      url: raw.url,
      size: raw.size,
      created_at: new Date(raw.created_at),
      version: raw.version || 1
    });
  }

  static fromLocal(raw) {
    return new this(raw);
  }

  static async get(id, options = {}) {
    const doc = await super.get(id, options);

    if (!doc.version || doc.version < 2) {
      doc.version = 1;
    }

    return doc;
  }

  constructor(fields = {}, options = {}) {
    super(fields);

    this.content_type = fields.content_type;
    this.localContents = null;
    this.localId = fields.localId;
    this.uploaded = fields.uploaded;
    this._username = options.username;

    // FIXME:
    if (this.id) {
      this.version = this.version || 1;
    }
    else {
      this.version = version;
    }

    if (!this.name && this.url) {
      this.name = this.url.split('/').pop();
    }
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

  async saveLocal() {
    const payload = this.serialize();
    payload.localId = this.localId || generateHash(20);

    const uploader = new LocalDocumentUploader(payload)
    const uploadedDoc = await uploader.upload(this.file);

    return Object.assign(this, payload, uploadedDoc);
  }

  serialize() {
    return {
      ...super.serialize(),
      content_type: this.content_type || null,
      localId: this.id || null,
      version: this.version || null,

      // Ignore other serialized fields
      name: this.version > 1 ? this.name : undefined,
      numParts: undefined,

      // Backwards compatibility
      num_parts: this.numParts || null,
      size: this.size || null,
      url: this.url || null,
      uploaded: this.uploaded || null
    };
  }

  shareUrl() {
    let username = privateUserSession.loadUserData().username;
    username = username.replace('.id.blockstack', '');
    return `${Constants.SHARE_URI}/${username}/${this.id}`;
  }

  uniqueKey() {
    return `${this.name}/${this.created_at.getTime()}`;
  }

  // Backwards compatibility
  set num_parts(value) {
    this.numParts = value;
  }
}

export default GaiaDocument;
