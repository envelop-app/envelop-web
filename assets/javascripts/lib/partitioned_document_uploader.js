import Bottleneck from 'bottleneck';

import Constants from './constants';
import Record from './records/record';
import ProgressRegister from '../lib/progress_register';

const publicFileOptions = { encrypt: false, verify: false };
function putPublicFile(name, contents) {
  return Record.getSession().putFile(name, contents, publicFileOptions);
}

class PartitionedDocumentUploader {
  constructor(doc) {
    this.partSize = doc.partSize || Constants.FILE_PART_SIZE;
    this.numParts = Math.ceil(doc.size / this.partSize);
    this.doc = doc;
    this.progress = new ProgressRegister(doc.size);
    this.readLimiter = new Bottleneck({ maxConcurrent: 6 });
    this.uploadLimiter = new Bottleneck({ maxConcurrent: 3 });
  }

  cleanupLimiters() {
    this.readLimiter.disconnect();
    this.uploadLimiter.disconnect();
  }

  getFileSlice(file, partNumber) {
    const startAt = partNumber * this.partSize;
    const endAt = (partNumber + 1) * this.partSize;
    return file.slice(startAt, endAt);
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

  async upload(file) {
    const uploadPromises = Array(this.numParts).fill(null)
      .map(async (_, partNumber) => {
        const fileSlice = this.getFileSlice(file, partNumber);
        const bufferPromise = this.scheduleRead(fileSlice);
        await this.scheduleUpload(partNumber, bufferPromise);
        this.progress.add(fileSlice.size);
        return true;
      });

    await Promise.all(uploadPromises);

    this.cleanupLimiters();

    const uploadResult = {};
    uploadResult.numParts = this.numParts;

    return uploadResult;
  }

  onProgress(callback) {
    this.progress.onChange(callback);
  }

  uploadPart(partNumber, partBuffer) {
    const options = { contentType: 'application/octet-stream' };
    const partUrl = `${this.doc.url}.part${partNumber}`;
    return putPublicFile(partUrl, partBuffer, options);
  }
}

export default PartitionedDocumentUploader;
