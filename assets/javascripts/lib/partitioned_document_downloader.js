import Bottleneck from 'bottleneck';

import LocalDatabase from '../lib/local_database';
import ProgressRegister from '../lib/progress_register';
import Record from './records/record';

class PartitionedDocumentDownloader {
  constructor(gaiaDocument) {
    this.gaiaDocument = gaiaDocument;
    this.limiter = new Bottleneck({ maxConcurrent: 3 });
    this.progress = new ProgressRegister(gaiaDocument.size);
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
      this.progress.add(part.byteLength);
      return true;
    });

    return Promise.all(promises);
  }

  onProgress(callback) {
    this.progress.onChange(callback);
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
    return Record.getSession().getFile(partUrl, options);
  }

  loadPartsFromLocal() {
    const promises = this.mapPartUrls(partUrl => {
      return LocalDatabase.getItem(this.localUrl(partUrl));
    });

    return  Promise.all(promises);
  }

  createBlob(partBuffers) {
    const blobOptions = { name: this.gaiaDocument.name, type: this.gaiaDocument.getMimeType() };
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
