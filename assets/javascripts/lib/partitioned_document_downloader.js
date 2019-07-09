import Bottleneck from 'bottleneck';

import LocalDatabase from '../lib/local_database';
import { publicUserSession } from '../lib/blockstack_client';

class PartitionedDocumentDownloader {
  constructor(gaiaDocument, options = {}) {
    this.gaiaDocument = gaiaDocument;
    this.limiter = new Bottleneck({ maxConcurrent: 3 });
    this.progressCallbacks = [];
    this.bytesDownloaded = 0;

    if (options.onProgress && typeof options.onProgress === 'function') {
      this.progressCallbacks.push(options.onProgress);
    }
  }

  async download() {
    await this.downloadAndSavePartsLocally();

    const parts = await this.loadPartsFromLocal();
    const blob = this.createBlob(parts);
    const objectUrl = URL.createObjectURL(blob);

    this.deletePartsFromLocal();
    this.revokeLater(objectUrl);

    return objectUrl;
  }

  downloadAndSavePartsLocally() {
    const promises = this.mapPartUrls(async (partUrl) => {
      const part = await this.scheduleDownload(partUrl);
      await LocalDatabase.setItem(this.localUrl(partUrl), part);
      this.addBytesDownloaded(part.byteLength);
      return true;
    });

    return Promise.all(promises);
  }

  addBytesDownloaded(bytes) {
    this.bytesDownloaded += bytes;
    this.triggerOnProgress();
  }

  triggerOnProgress() {
    this.progressCallbacks.forEach((callback) => {
      callback(this.getProgress());
    });
  }

  getProgress() {
    const ratio = this.bytesDownloaded / this.gaiaDocument.size;
    return Math.round(ratio * 100) / 100;
  }

  localUrl(partUrl) {
    return `download:${partUrl}`;
  }

  mapPartUrls(callback) {
    return this.gaiaDocument.getPartUrls().map(partUrl => callback(partUrl));
  }

  scheduleDownload(partUrl) {
    return this.limiter.schedule(() => this.downloadPart(partUrl));
  }

  downloadPart(partUrl) {
    const options = { username: this.gaiaDocument._username, decrypt: false, verify: false };
    return publicUserSession.getFile(partUrl, options);
  }

  loadPartsFromLocal() {
    const promises = this.mapPartUrls(partUrl => {
      return LocalDatabase.getItem(this.localUrl(partUrl));
    });

    return  Promise.all(promises);
  }

  createBlob(partBuffers) {
    const blobOptions = { name: this.gaiaDocument.getName(), type: this.gaiaDocument.getMimeType() };
    return new Blob(partBuffers, blobOptions);
  }

  deletePartsFromLocal() {
    const promises = this.mapPartUrls(partUrl => {
      return LocalDatabase.removeItem(this.localUrl(partUrl));
    });

    return  Promise.all(promises);
  }

  revokeLater(objectUrl) {
    window.addEventListener('focus', function handler() {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      window.removeEventListener('focus', handler);
    });
  }
}

export default PartitionedDocumentDownloader;
