import Bottleneck from 'bottleneck';

import Constants from './constants';
import { privateUserSession } from './blockstack_client';
import ProgressRegister from '../lib/progress_register';

const publicFileOptions = { encrypt: false, verify: false };
function putPublicFile(name, contents) {
  return privateUserSession.putFile(name, contents, publicFileOptions);
}

class PartitionedDocumentUploader {
  constructor(serializedDocument) {
    this.partSize = serializedDocument.partSize || Constants.FILE_PART_SIZE;
    this.numParts = Math.ceil(serializedDocument.fileSize / this.partSize);
    this.serializedDocument = serializedDocument;
    this.progress = new ProgressRegister(serializedDocument.fileSize);
    this.readLimiter = new Bottleneck({ maxConcurrent: 6 });
    this.uploadLimiter = new Bottleneck({ maxConcurrent: 3 });
  }

  cleanupLimiters() {
    this.readLimiter.disconnect();
    this.uploadLimiter.disconnect();
  }

  getFileSlice(partNumber) {
    const startAt = partNumber * this.partSize;
    const endAt = (partNumber + 1) * this.partSize;
    return this.serializedDocument.file.slice(startAt, endAt);
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
        this.progress.add(fileSlice.size);
        return true;
      });

    await Promise.all(uploadPromises);

    this.cleanupLimiters();

    this.serializedDocument.numParts = this.numParts;

    return this.serializedDocument;
  }

  onProgress(callback) {
    this.progress.onChange(callback);
  }

  uploadPart(partNumber, partBuffer) {
    const options = { contentType: 'application/octet-stream' };
    const partUrl = `${this.serializedDocument.filePath}.part${partNumber}`;
    return putPublicFile(partUrl, partBuffer, options);
  }
}

export default PartitionedDocumentUploader;
