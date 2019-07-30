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

  const options = {
    encryption: {
      ...record.getEncryption().toEncryptor(),
      part_ivs: record.part_ivs
    }
  }

  if (record.size <= Constants.SINGLE_FILE_SIZE_LIMIT) {
    uploader = new DocumentUploader(record, options)
  }
  else if (record.size > Constants.SINGLE_FILE_SIZE_LIMIT) {
    uploader = new PartitionedDocumentUploader(record, options)
  }
  else {
    throw("Cant get uploader - missing 'size'")
  }

  record.uploadProgressCallbacks.forEach((callback) => {
    uploader.onProgress(callback);
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
      this.url = fields.url || uuid();
    }

    async download() {
      const options = {};
      if (this.version > 1) {
        options.encryption = {
          ...this.getEncryption().toEncryptor(),
          part_ivs: this.part_ivs
        }
      }

      if (this.num_parts && this.num_parts > 1) {
        this._downloader = new PartitionedDocumentDownloader(this, options);
      }
      else {
        this._downloader = new DocumentDownloader(this, options);
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

  klass.afterSave(async (record) => {
    if (!record.file) { return; }

    // FIXME: only record.attributes must be passed to the uploader,
    // in order to be able to 'serialize' attributes first
    record.salt = record.id;

    record._uploader = getUploader(record);
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
