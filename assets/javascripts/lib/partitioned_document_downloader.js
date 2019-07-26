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
      await this.downloadParts({ saveLocal: true });
      parts = await this.loadPartsFromLocal();
    }
    catch (e) {
      if (e.name === 'QuotaExceededError') {
        await this.deletePartsFromLocal();

        parts = await this.downloadParts();
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
    const promises = this.doc.mapPartUrls(async (partUrl, partNumber) => {
      const part = await this.scheduleDownload(partUrl, partNumber);

      if (options.saveLocal) {
        await LocalDatabase.setItem(this.localUrl(partUrl), part);
      }

      this.progress.add(part.byteLength);

      return options.saveLocal ? true : part;
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
