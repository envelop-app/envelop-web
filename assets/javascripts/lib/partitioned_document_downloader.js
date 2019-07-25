import Bottleneck from 'bottleneck';

import BaseDocumentDownloader from './base_document_downloader';
import LocalDatabase from './local_database';

class PartitionedDocumentDownloader extends BaseDocumentDownloader {
  constructor() {
    super(...arguments);
    this.limiter = new Bottleneck({ maxConcurrent: 3 });
  }

  async download() {
    let parts;

    try {
      await this.downloadParts();
      parts = await this.loadPartsFromLocal();
    }
    catch (e) {
      if (e.name === 'QuotaExceededError') {
        await this.deletePartsFromLocal();

        parts = await this.downloadParts({ saveLocal: false });
      }
    }

    const blob = this.createBlob(parts);
    const objectUrl = URL.createObjectURL(blob);

    await this.deletePartsFromLocal();
    this.revokeLater(objectUrl);

    this.limiter.disconnect();

    return objectUrl;
  }

  downloadParts(options = {}) {
    const saveLocal = (options.saveLocal === false) ? false : true;

    const promises = this.doc.mapPartUrls(async (partUrl, partNumber) => {
      // `ret` is needed because we don't want to keep the part buffer
      // around if the data is saved locally to disk (LocalDatabase).
      let ret = true;
      let part = await this.scheduleDownload(partUrl, partNumber);

      if (saveLocal) {
        ret = await LocalDatabase.setItem(this.localUrl(partUrl), part);
        part = null;
      }

      this.progress.add(part.byteLength);

      return ret;
    });

    return Promise.all(promises);
  }

  localUrl(partUrl) {
    return `download:${partUrl}`;
  }

  scheduleDownload(partUrl, partNumber) {
    return this.limiter.schedule(() => this.downloadRawFile(partUrl, { partNumber }));
  }

  loadPartsFromLocal() {
    const promises = this.doc.mapPartUrls(partUrl => {
      return LocalDatabase.getItem(this.localUrl(partUrl));
    });

    return Promise.all(promises);
  }

  deletePartsFromLocal() {
    const promises = this.doc.mapPartUrls(partUrl => {
      return LocalDatabase.removeItem(this.localUrl(partUrl));
    });

    return Promise.all(promises);
  }
}

export default PartitionedDocumentDownloader;
