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

const WithFile = (superclass) => {
  const klass = class extends superclass {
    constructor(fields = {}) {
      super(fields);

      if (fields.fileName) {
        this.fileName = fields.fileName;
      }
      else if (fields.filePath) {
        this.fileName = fields.filePath.split('/').pop();
      }

      // FIXME: This doens't work for new clean records: new FileRecord() will have
      // fileName = undefined forever...
      // OR
      // implement overridable filepath function just like rails uploaders
      this.filePath = fields.filePath || `${generateHash(24)}/${fields.fileName}`;

      this.fileSize = fields.fileSize;
      this.downloadProgressCallbacks = [];
      this.numParts = fields.numParts;
      this.partSize = fields.partSize;
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
        const fileUrl = await publicSession.getFileUrl(this.filePath, options);
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
      return mime.lookup(this.fileName) || null;
    }

    getPartUrls() {
      return new Array(this.numParts)
        .fill(null)
        .map((_, index) => `${this.filePath}.part${index}`);
    }

    _prepareForSave() {
      const payload = this.serialize();
      payload.file = this.file;
      return payload;
    }

    serialize() {
      return {
        ...super.serialize(),
        filePath: this.filePath || null,
        fileSize: this.fileSize || null,
        numParts: this.numParts || null
      };
    }
  }

  klass.beforeDelete((record) => {
    return new DocumentRemover(record).remove();
  });

  klass.beforeSave(async (record) => {
    const payload = record._prepareForSave();

    record._uploader = getUploader(payload, record.uploadProgressCallbacks);
    const modifiedPayload = await record._uploader.upload();

    record.numParts = modifiedPayload.numParts;

    return true;
  });

  return klass;
}

export default WithFile;
