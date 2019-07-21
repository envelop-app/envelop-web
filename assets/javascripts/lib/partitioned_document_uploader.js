import Bottleneck from 'bottleneck';

import Record from './records/record';
import ProgressRegister from '../lib/progress_register';

const publicFileOptions = { encrypt: false, verify: false };
function putPublicFile(name, contents) {
  return Record.getSession().putFile(name, contents, publicFileOptions);
}

class PartitionedDocumentUploader {
  constructor(doc) {
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
    const startAt = partNumber * this.doc.partSize;
    const endAt = (partNumber + 1) * this.doc.partSize;
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
    const uploadPromises = Array(this.doc.num_parts).fill(null)
      .map(async (_, partNumber) => {
        const fileSlice = this.getFileSlice(file, partNumber);
        const bufferPromise = this.scheduleRead(fileSlice);
        await this.scheduleUpload(partNumber, bufferPromise);
        this.progress.add(fileSlice.size);
        return true;
      });

    await Promise.all(uploadPromises);

    this.cleanupLimiters();

    return true;
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
