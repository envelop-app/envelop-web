import mime from 'mime-types';
import uuid from 'uuid/v4';

import Constants from '../../constants';
import DocumentDownloader from '../../document_downloader';
import DocumentRemover from '../../document_remover';
import DocumentUploader from '../../document_uploader';
import Encryptor from '../../encryptor';
import PartitionedDocumentDownloader from '../../partitioned_document_downloader';
import PartitionedDocumentUploader from '../../partitioned_document_uploader';

function getUploader(record) {
  let uploader = null;

  if (record.size <= Constants.SINGLE_FILE_SIZE_LIMIT) {
    uploader = new DocumentUploader(record)
  }
  else if (record.size > Constants.SINGLE_FILE_SIZE_LIMIT) {
    uploader = new PartitionedDocumentUploader(record)
  }
  else {
    throw("Cant get uploader - missing 'size'")
  }

  record.uploadProgressCallbacks.forEach((callback) => {
    uploader.onProgress(callback);
  });

  record.uploadedCallbacks.forEach((callback) => {
    uploader.onUploaded(callback);
  });

  return uploader;
}

const WithFile = (superclass) => {
  const klass = class extends superclass {
    constructor(fields = {}) {
      super(fields);

      this.file = fields.file;
      this.downloadProgressCallbacks = [];
      this.uploadProgressCallbacks = [];
      this.uploadedCallbacks = [];
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

    onUploaded(callback) {
      if (callback && typeof callback === 'function') {
        this.uploadedCallbacks.push(callback);

        if (this._uploader) {
          this._uploader.onUploaded(callback);
        }
      }
      else {
        throw "Uploaded callback must be of type 'function'";
      }
    }

    getMimeType() {
      return mime.lookup(this.name) || null;
    }

    getPartUrl(partNumber) {
      return `${this.url}.part${partNumber}`;
    }

    getPartUrls() {
      if (!this.num_parts) { return []; }

      return new Array(this.num_parts)
        .fill(null)
        .map((_, index) => this.getPartUrl(index));
    }

    mapPartUrls(callback) {
      return this.getPartUrls().map((partUrl, partNumber) => {
        return callback(partUrl, partNumber);
      });
    }

    attributes() {
      return {
        ...super.attributes(),
        name: this.name || null,
        url: this.url || null,
        size: this.size || null,
        num_parts: this.num_parts || null,
        uploaded: this.uploaded,
        part_ivs: this.part_ivs || null
      };
    }
  }

  klass.beforeSave(async (record) => {
    if (!record.file) { return; }

    record.partSize = record.partSize || Constants.FILE_PART_SIZE;
    record.num_parts = Math.ceil(record.size / record.partSize);

    record.part_ivs = [];
    for (let i = 0; i < record.num_parts; i++) {
      const iv = Encryptor.utils.generateIv();
      record.part_ivs.push(Encryptor.utils.encodeBase64(iv));
    }

    return true;
  });

  klass.afterSave(async (record, options = {}) => {
    if (!record.file) { return; }

    // FIXME: only record.attributes must be passed to the uploader,
    // in order to be able to 'serialize' attributes first
    record.salt = record.id;

    record._uploader = getUploader(record);
    const upload = record._uploader.upload(record.file);

    if (options.syncUpload) {
      await upload;
    }

    return Promise.resolve();
  });

  klass.afterDelete((record) => {
    new DocumentRemover(record).remove();
    return Promise.resolve();
  });

  return klass;
}

export default WithFile;
