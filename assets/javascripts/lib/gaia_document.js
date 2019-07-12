import mime from 'mime-types';
import prettyBytes from 'pretty-bytes';
import randomstring from 'randomstring';

import DocumentRemover from '../lib/document_remover';
import {
  privateUserSession,
  publicUserSession as publicSession
} from '../lib/blockstack_client';
import Constants from '../lib/constants';
import DocumentUploader from '../lib/document_uploader';
import PartitionedDocumentUploader from '../lib/partitioned_document_uploader';
import LocalDocumentUploader from '../lib/local_document_uploader';
import PartitionedDocumentDownloader from '../lib/partitioned_document_downloader';
import Record from './records/record';

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

function getUploader(payload, callbacks) {
  let uploader = null;

  if (payload.file.size <= Constants.SINGLE_FILE_SIZE_LIMIT) {
    uploader = new DocumentUploader(payload)
  }
  else if (payload.file.size > Constants.SINGLE_FILE_SIZE_LIMIT) {
    uploader = new PartitionedDocumentUploader(payload)
  }
  else {
    throw("Cant get uploader - missing 'size'")
  }

  callbacks.forEach((callback) => uploader.onProgress(callback));

  return uploader;
}

class GaiaDocument extends Record {
  static fromFile(file) {
    return new GaiaDocument({
      name: file.name,
      created_at: new Date(),
      size: file.size,
      content_type: file.name.split('.').pop(),
      file: file
    });
  }

  static fromGaia(raw) {
    return new GaiaDocument(
      Object.assign(raw, {
        name: raw.name || raw.url.split('/').pop(),
        created_at: new Date(raw.created_at)
      })
    );
  }

  static fromLocal(raw) {
    return new GaiaDocument(raw);
  }

  static async get(id, options = {}) {
    // FIXME: Use some kind of setters pattern like Rail's assign_attributes

    const gaiaDocument = await super.get(id, options);
    gaiaDocument._username = options.username;
    gaiaDocument.name = gaiaDocument.name || gaiaDocument.url.split('/').pop();
    return gaiaDocument;
  }

  constructor(fields = {}) {
    super(fields);

    this.content_type = fields.content_type;
    this.downloadProgressCallbacks = [];
    this.file = fields.file;
    this.localContents = null;
    this.localId = fields.localId;
    this.name = fields.name;
    this.num_parts = fields.num_parts || null;
    this.partSize = fields.partSize || null;
    this.size = fields.size;
    this.storageType = fields.storageType || 'normal';
    this.uploaded = fields.uploaded;
    this.uploadProgressCallbacks = [];
    this.url = fields.url;
    this._username = fields.username;
    this.version = fields.version || version;
  }

  async delete() {
    const remover = new DocumentRemover(this)
    await remover.remove();
    return super.delete();
  }

  async download() {
    if (this.getNumParts() && this.getNumParts() > 1) {
      this._downloader = new PartitionedDocumentDownloader(this);
      this.downloadProgressCallbacks.forEach((callback) => {
        this._downloader.onProgress(callback);
      });
      return await this._downloader.download();
    }
    else {
      const options = { username: this._username, decrypt: false, verify: false };
      const fileUrl = await publicSession.getFileUrl(this.url, options);
      this.downloadProgressCallbacks.forEach((callback) => callback(1));
      return fileUrl;
    }
  }

  getMimeType() {
    return mime.lookup(this.getName()) || null;
  }

  getName() {
    return this.name;
  }

  getNumParts() {
    return this.num_parts;
  }

  getPartUrls() {
    return new Array(this.getNumParts())
      .fill(null)
      .map((_, index) => `${this.url}.part${index}`);
  }

  getSizePretty() {
    return prettyBytes(this.size);
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

  onDownloadProgress(callback) {
    if (callback && typeof callback === 'function') {
      this.downloadProgressCallbacks.push(callback);

      if (this._downloader) {
        this._downloader.onProgress(callback);
      }
    }
    else {
      throw "Progress callback must be of type 'function'";
    }
  }

  onUploadProgress(callback) {
    if (callback && typeof callback === 'function') {
      this.uploadProgressCallbacks.push(callback);

      if (this._uploader) {
        this._uploader.onProgress(callback);
      }
    }
    else {
      throw "Progress callback must be of type 'function'";
    }
  }

  _prepareForSave() {
    const payload = this.serialize();
    payload.file = this.file;
    payload.url = this.url || `${generateHash(24)}/${this.name}`;
    payload.content_type = this.content_type || this.name.split('.').pop();

    return payload;
  }

  async save() {
    const payload = this._prepareForSave();

    this._uploader = getUploader(payload, this.uploadProgressCallbacks);
    const modifiedPayload = await this._uploader.upload();
    modifiedPayload.uploaded = true;

    return super.save(modifiedPayload);
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
      num_parts: this.num_parts || null,
      url: this.url || null,
      size: this.size || null,
      storageType: this.storageType || null,
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
    return `${this.getName()}/${this.created_at.getTime()}`;
  }
}

export default GaiaDocument;
