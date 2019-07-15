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

const version = 1;

function generateHash(length) {
  return randomstring.generate(length);
}

class GaiaDocument extends WithFile(Record) {
  static fromFile(file) {
    return new this({
      fileName: file.name,
      created_at: new Date(),
      fileSize: file.size,
      content_type: file.name.split('.').pop(),
      file: file
    });
  }

  static fromGaiaIndex(raw) {
    return new this({
      ...raw,
      fileName: (raw.filePath || raw.url).split('/').pop(),
      filePath: (raw.filePath || raw.url),
      fileSize: raw.fileSize || raw.size,
      created_at: new Date(raw.created_at)
    });
  }

  static fromLocal(raw) {
    return new this(raw);
  }

  constructor(fields = {}, options = {}) {
    super(fields);

    // Backwards compatibility
    // this.filePath = this.filePath || this.url;
    this.numParts = this.numParts || fields.num_parts;

    this.content_type = fields.content_type;
    this.file = fields.file;
    this.localContents = null;
    this.localId = fields.localId;
    this.uploaded = fields.uploaded;
    this._username = options.username;
    this.version = fields.version || version;
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
    const payload = this._prepareForSave();
    payload.localId = this.localId || generateHash(20);

    const uploader = new LocalDocumentUploader(payload)
    const uploadedDoc = await uploader.upload();

    return Object.assign(this, payload, uploadedDoc);
  }

  serialize() {
    return {
      ...super.serialize(),
      content_type: this.content_type || null,
      localId: this.id || null,
      num_parts: this.numParts || null,
      url: this.filePath || null,
      size: this.fileSize || null,
      uploaded: this.uploaded || null,
      version: this.version || null
    };
  }

  shareUrl() {
    let username = privateUserSession.loadUserData().username;
    username = username.replace('.id.blockstack', '');
    return `${Constants.SHARE_URI}/${username}/${this.id}`;
  }

  uniqueKey() {
    return `${this.fileName}/${this.created_at.getTime()}`;
  }
}

export default GaiaDocument;
