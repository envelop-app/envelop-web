import mime from 'mime-types';
import randomstring from 'randomstring';

import Constants from '../../constants';
import DocumentRemover from '../../document_remover';
import DocumentUploader from '../../document_uploader';
import { publicUserSession as publicSession } from '../../blockstack_client';
import PartitionedDocumentDownloader from '../../partitioned_document_downloader';
import PartitionedDocumentUploader from '../../partitioned_document_uploader';

function generateHash(length) {
  return randomstring.generate(length);
}

function getUploader(payload, callbacks) {
  let uploader = null;

  if (payload.fileSize <= Constants.SINGLE_FILE_SIZE_LIMIT) {
    uploader = new DocumentUploader(payload)
  }
  else if (payload.fileSize > Constants.SINGLE_FILE_SIZE_LIMIT) {
    uploader = new PartitionedDocumentUploader(payload)
  }
  else {
    throw("Cant get uploader - missing 'fileSize'")
  }

  callbacks.forEach((callback) => uploader.onProgress(callback));

  return uploader;
}

const WithFile = (superclass) => {
  const klass = class extends superclass {
    static get attributes() {
      return {
        ...super.attributes,
        name: null,
        url: null,
        fileSize: null,
        numParts: null
      }
    }

    constructor(fields = {}) {
      super(fields);

      this.file = fields.file;
      this.downloadProgressCallbacks = [];
      this.uploadProgressCallbacks = [];
    }

    async download() {
      if (this.numParts && this.numParts > 1) {
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

    getMimeType() {
      return mime.lookup(this.name) || null;
    }

    getPartUrls() {
      if (!this.numParts) { return []; }

      return new Array(this.numParts)
        .fill(null)
        .map((_, index) => `${this.url}.part${index}`);
    }

    serialize() {
      return {
        ...super.serialize(),
        name: this.name || null,
        url: this.url || null,
        fileSize: this.fileSize || null,
        numParts: this.numParts || null
      };
    }
  }

  klass.beforeDelete((record) => {
    return new DocumentRemover(record).remove();
  });

  klass.beforeSave(async (record) => {
    record.url = record.url || `${generateHash(24)}`;

    record._uploader = getUploader(record, record.uploadProgressCallbacks);
    const modifiedPayload = await record._uploader.upload(record.file);

    record.numParts = modifiedPayload.numParts;

    return true;
  });

  return klass;
}

export default WithFile;
