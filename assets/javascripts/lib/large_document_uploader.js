import { privateUserSession } from './blockstack_client';
import Constants from './constants';
import Bottleneck from 'bottleneck';

const publicFileOptions = { encrypt: false, verify: false };
function putPublicFile(name, contents) {
  return privateUserSession.putFile(name, contents, publicFileOptions);
}

class LargeDocumentUploader {
  constructor(gaiaDocument) {
    this.partSize = gaiaDocument.partSize || Constants.FILE_PART_SIZE;
    this.numParts = Math.ceil(gaiaDocument.size / this.partSize);
    this.gaiaDocument = gaiaDocument;
    this.limiter = new Bottleneck({ maxConcurrent: 3 });
  }

  async upload() {
    const buffers = await this.readAndSplitFile();
    const results = buffers.map((buffer, partNumber) => {
      return this.limiter.schedule(() => this.uploadPart(partNumber, buffer));
    });
    await Promise.all(results);

    await this.uploadDocument();

    return this.gaiaDocument;
  }

  readAndSplitFile(callback) {
    const that = this;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (evt) => {
        const buffers = this.assembleBuffers(evt.target.result);
        resolve(buffers);
      };

      reader.onerror = (evt) => {
        reject(evt.target.error);
      }

      reader.readAsArrayBuffer(that.gaiaDocument.file);
    });
  }

  assembleBuffers(mainBuffer) {
    return new Array(this.numParts).fill(null).map((_, idx) => {
      const startAt = idx * this.partSize;
      const endAt = (idx + 1) * this.partSize;
      return mainBuffer.slice(startAt, endAt);
    });
  }

  uploadPart(partNumber, partBuffer) {
    const options = { contentType: ',application/octet-stream' };
    const partUrl = `${this.gaiaDocument.url}.part${partNumber}`;
    return putPublicFile(partUrl, partBuffer, options);
  }

  uploadDocument() {
    this.gaiaDocument.storageType = 'partitioned';
    this.gaiaDocument.numParts = this.numParts;
    this.gaiaDocument.partSize = this.partSize;

    const contents = JSON.stringify(this.gaiaDocument)
    return putPublicFile(this.gaiaDocument.id, contents);
  }
}

export default LargeDocumentUploader;
