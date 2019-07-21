import mime from 'mime-types';
import uuid from 'uuid/v4';

import Constants from '../../constants';
import DocumentDownloader from '../../document_downloader';
import DocumentRemover from '../../document_remover';
import DocumentUploader from '../../document_uploader';
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
      this.url = fields.url || uuid();
    }

    async download() {
      if (this.num_parts && this.num_parts > 1) {
        this._downloader = new PartitionedDocumentDownloader(this);
      }
      else {
        this._downloader = new DocumentDownloader(this);
      }

      this.downloadProgressCallbacks.forEach((callback) => {
        this._downloader.onProgress(callback);
      });

      return await this._downloader.download();
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
        num_parts: this.num_parts || null,
        uploaded: this.uploaded
      };
    }
  }

  klass.beforeSave(async (record) => {
    record.partSize = record.partSize || Constants.FILE_PART_SIZE;
    record.num_parts = Math.ceil(record.size / record.partSize);

    return true;
  });

  klass.afterSave(async (record) => {
    if (!record.file) { return; }

    record._uploader = getUploader(record, record.uploadProgressCallbacks);
    await record._uploader.upload(record.file);

    record.uploaded = true;
    record.file = null;
    await record.save({ skipHooks: false });

    return true;
  });

  klass.beforeDelete((record) => {
    return new DocumentRemover(record).remove();
  });

  return klass;
}

export default WithFile;
