import Bottleneck from 'bottleneck';

import BaseDocumentUploader from './base_document_uploader';

class PartitionedDocumentUploader extends BaseDocumentUploader {
  constructor() {
    super(...arguments);
    this.readLimiter = new Bottleneck({ maxConcurrent: 6 });
    this.uploadLimiter = new Bottleneck({ maxConcurrent: 3 });
  }

  async upload(file) {
    const uploadPromises = this.doc.mapPartUrls(async (partUrl, partNumber) => {
      const bufferPromise = this.scheduleRead(file, partNumber);
      await this.scheduleUpload(partUrl, bufferPromise, partNumber);
      return true;
    });

    await Promise.all(uploadPromises);

    this.encryptor && this.encryptor.terminate();
    this.encryptor = null;

    this.cleanupLimiters();

    return true;
  }

  cleanupLimiters() {
    this.readLimiter.disconnect();
    this.uploadLimiter.disconnect();
  }

  getFileSlice(file, partNumber) {
    const startAt = partNumber * this.doc.partSize;
    const endAt = (partNumber + 1) * this.doc.partSize;
    return file.slice(startAt, endAt);
  }

  readFileSlice(fileSlice) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (evt) => {
        resolve(evt.target.result || reader.result);
      };

      reader.onerror = (evt) => {
        reject(evt.target.error);
      }

      reader.readAsArrayBuffer(fileSlice);
    });
  }

  scheduleRead(file, partNumber) {
    return this.readLimiter.schedule(() => {
      let fileSlice = this.getFileSlice(file, partNumber);
      return this.readFileSlice(fileSlice);
    });
  }

  scheduleUpload(partUrl, bufferPromise, partNumber) {
    return this.uploadLimiter.schedule(async () => {
      let partBuffer = await bufferPromise;
      const upload =  this.uploadRawFile(partUrl, partBuffer, { partNumber });
      this.progress.add(partBuffer.byteLength);
      partBuffer = null;
      return upload;
    });
  }
}

export default PartitionedDocumentUploader;
