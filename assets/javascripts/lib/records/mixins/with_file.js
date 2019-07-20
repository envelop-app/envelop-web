import mime from 'mime-types';
import uuid from 'uuid/v4';

import Constants from '../../constants';
import DocumentRemover from '../../document_remover';
import DocumentUploader from '../../document_uploader';
import { publicUserSession as publicSession } from '../../blockstack_client';
import PartitionedDocumentDownloader from '../../partitioned_document_downloader';
import PartitionedDocumentUploader from '../../partitioned_document_uploader';

function getUploader(payload, callbacks) {
  let uploader = null;

  if (payload.size <= Constants.SINGLE_FILE_SIZE_LIMIT) {
    uploader = new DocumentUploader(payload)
  }
  else if (payload.size > Constants.SINGLE_FILE_SIZE_LIMIT) {
    uploader = new PartitionedDocumentUploader(payload)
  }
  else {
    throw("Cant get uploader - missing 'size'")
  }

  callbacks.forEach((callback) => uploader.onProgress(callback));

  return uploader;
}

const WithFile = (superclass) => {
  const klass = class extends superclass {
    constructor(fields = {}) {
      super(fields);

      this.file = fields.file;
      this.downloadProgressCallbacks = [];
      this.uploadProgressCallbacks = [];
    }

    async download() {
      if (this.num_parts && this.num_parts > 1) {
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
      if (!this.num_parts) { return []; }

      return new Array(this.num_parts)
        .fill(null)
        .map((_, index) => `${this.url}.part${index}`);
    }

    attributes() {
      return {
        ...super.attributes(),
        name: this.name || null,
        url: this.url || null,
        size: this.size || null,
        num_parts: this.num_parts || null
      };
    }
  }

  klass.beforeDelete((record) => {
    return new DocumentRemover(record).remove();
  });

  klass.beforeSave(async (record) => {
    record.url = record.url || uuid();

    record._uploader = getUploader(record, record.uploadProgressCallbacks);
    const uploadResult = await record._uploader.upload(record.file);

    record.num_parts = uploadResult.numParts;

    return true;
  });

  return klass;
}

export default WithFile;
