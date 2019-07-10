import { privateUserSession } from './blockstack_client';
import Constants from './constants';
import Bottleneck from 'bottleneck';

const publicFileOptions = { encrypt: false, verify: false };
function putPublicFile(name, contents) {
  return privateUserSession.putFile(name, contents, publicFileOptions);
}

class PartitionedDocumentUploader {
  constructor(gaiaDocument) {
    this.partSize = gaiaDocument.partSize || Constants.FILE_PART_SIZE;
    this.numParts = Math.ceil(gaiaDocument.size / this.partSize);
    this.gaiaDocument = gaiaDocument;
    this.readLimiter = new Bottleneck({ maxConcurrent: 6 });
    this.uploadLimiter = new Bottleneck({ maxConcurrent: 3 });
    this.progressCallbacks = [];
    this.bytesUploaded = 0;
  }

  cleanupLimiters() {
    this.readLimiter.disconnect();
    this.uploadLimiter.disconnect();
  }

  getFileSlice(partNumber) {
    const startAt = partNumber * this.partSize;
    const endAt = (partNumber + 1) * this.partSize;
    return this.gaiaDocument.file.slice(startAt, endAt);
  }

  readFileSlice(fileSlice) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (evt) => {
        resolve(evt.target.result);
      };

      reader.onerror = (evt) => {
        reject(evt.target.error);
      }

      reader.readAsArrayBuffer(fileSlice);
    });
  }

  scheduleRead(fileSlice) {
    return this.readLimiter.schedule(() => {
      return this.readFileSlice(fileSlice);
    });
  }

  scheduleUpload(partNumber, bufferPromise) {
    return this.uploadLimiter.schedule(async () => {
      const partBuffer = await bufferPromise;
      return this.uploadPart(partNumber, partBuffer)
    });
  }

  async upload() {
    const uploadPromises = Array(this.numParts).fill(null)
      .map(async (_, partNumber) => {
        const fileSlice = this.getFileSlice(partNumber);
        const bufferPromise = this.scheduleRead(fileSlice);
        await this.scheduleUpload(partNumber, bufferPromise);
        this.addBytesUploaded(fileSlice.size);
        return true;
      });

    await Promise.all(uploadPromises);

    this.cleanupLimiters();

    await this.uploadDocument();

    return this.gaiaDocument;
  }

  addBytesUploaded(bytes) {
    this.bytesUploaded += bytes;
    this.triggerOnProgress();
  }

  onProgress(callback) {
    if (callback && typeof callback === 'function') {
      this.progressCallbacks.push(callback);
    }
  }

  triggerOnProgress() {
    this.progressCallbacks.forEach((callback) => {
      callback(this.getProgress());
    });
  }

  getProgress() {
    const ratio = this.bytesUploaded / this.gaiaDocument.size;
    return Math.round(ratio * 100) / 100;
  }

  uploadDocument() {
    this.gaiaDocument.storageType = 'partitioned';
    this.gaiaDocument.numParts = this.numParts;
    this.gaiaDocument.partSize = this.partSize;

    const contents = JSON.stringify(this.gaiaDocument)
    return putPublicFile(this.gaiaDocument.id, contents);
  }

  uploadPart(partNumber, partBuffer) {
    const options = { contentType: 'application/octet-stream' };
    const partUrl = `${this.gaiaDocument.url}.part${partNumber}`;
    return putPublicFile(partUrl, partBuffer, options);
  }
}

export default PartitionedDocumentUploader;
