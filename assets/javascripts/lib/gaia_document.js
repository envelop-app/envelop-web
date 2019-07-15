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
      createdAt: new Date(),
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
      createdAt: new Date(raw.createdAt || raw.created_at)
    });
  }

  static fromLocal(raw) {
    return new this(raw);
  }

  constructor(fields = {}, options = {}) {
    super(fields);

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
      version: this.version || null,

      // Backwards compatibility
      created_at: this.createdAt || null,
      num_parts: this.numParts || null,
      size: this.fileSize || null,
      url: this.filePath || null,
      uploaded: this.uploaded || null
    };
  }

  shareUrl() {
    let username = privateUserSession.loadUserData().username;
    username = username.replace('.id.blockstack', '');
    return `${Constants.SHARE_URI}/${username}/${this.id}`;
  }

  uniqueKey() {
    return `${this.fileName}/${this.createdAt.getTime()}`;
  }

  // Backwards compatibility
  set created_at(value) {
    this.createdAt = new Date(value);
  }

  set num_parts(value) {
    this.numParts = value;
  }

  set size(value) {
    this.fileSize = value;
  }

  set url(value) {
    this.filePath = value;
  }

}

export default GaiaDocument;
