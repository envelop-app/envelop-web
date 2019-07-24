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
      const fileSlice = this.getFileSlice(file, partNumber);
      const bufferPromise = this.scheduleRead(fileSlice);
      await this.scheduleUpload(partUrl, bufferPromise, partNumber);
      this.progress.add(fileSlice.size);
      return true;
    });

    await Promise.all(uploadPromises);

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

  scheduleRead(fileSlice) {
    return this.readLimiter.schedule(() => {
      return this.readFileSlice(fileSlice);
    });
  }

  scheduleUpload(partUrl, bufferPromise, partNumber) {
    return this.uploadLimiter.schedule(async () => {
      const partBuffer = await bufferPromise;
      return this.uploadRawFile(partUrl, partBuffer, { partNumber });
    });
  }
}

export default PartitionedDocumentUploader;
