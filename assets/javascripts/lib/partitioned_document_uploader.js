import Bottleneck from 'bottleneck';

import BaseDocumentUploader from './base_document_uploader';

const RETRY_INTERVAL = 1000;
const RETRY_ATTEMPTS = 3;

class PartitionedDocumentUploader extends BaseDocumentUploader {
  constructor() {
    super(...arguments);
    this.uploadLimiter = new Bottleneck({maxConcurrent: 3});

    this.uploadLimiter.on('failed', async (error, jobInfo) => {
      if (jobInfo.retryCount === RETRY_ATTEMPTS) {
        return RETRY_INTERVAL;
      }
    });
  }

  async upload(file) {
    const uploadPromises = this.doc.mapPartUrls((partUrl, partNumber) => {
      return this.scheduleUpload(file, partUrl, partNumber);
    });

    await Promise.all(uploadPromises);

    this.encryptor && await this.encryptor.terminate();
    this.encryptor = null;

    this.cleanupLimiters();

    return super.upload(file);
  }

  async cancel() {
    await this.uploadLimiter.stop();
    this.cleanupLimiters();
    return true;
  }

  cleanupLimiters() {
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

  scheduleUpload(file, partUrl, partNumber) {
    return this.uploadLimiter.schedule(async () => {
      let fileSlice = this.getFileSlice(file, partNumber);
      let partBuffer = await this.readFileSlice(fileSlice);
      fileSlice = null;

      const uploadPromise = await this.uploadRawFile(partUrl, partBuffer, { partNumber });
      this.progress.add(partBuffer.byteLength);
      partBuffer = null;

      return uploadPromise;
    });
  }
}

export default PartitionedDocumentUploader;
