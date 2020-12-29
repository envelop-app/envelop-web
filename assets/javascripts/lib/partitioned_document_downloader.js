import Bottleneck from 'bottleneck';

import BrowserDownloader from './browser_downloader';
import BaseDocumentDownloader from './base_document_downloader';
import LocalDatabase from './local_database';

const RETRY_INTERVAL = 1000;
const RETRY_ATTEMPTS = 3;

class PartitionedDocumentDownloader extends BaseDocumentDownloader {
  constructor() {
    super(...arguments);
    this.limiter = new Bottleneck({maxConcurrent: 1});

    this.limiter.on('failed', async (error, jobInfo) => {
      if (jobInfo.retryCount === RETRY_ATTEMPTS) {
        return RETRY_INTERVAL;
      }
    });

    this.browserDownloader = new BrowserDownloader(this.doc);
  }

  async download() {
    try {
      await this.downloadParts({ saveLocal: true });
      await this.loadPartsFromLocal();
    }
    catch (e) {
      if (e.name === 'QuotaExceededError') {
        await this.deletePartsFromLocal();

        await this.downloadParts();
      }
    }

    this.browserDownloader.finish();

    await this.deletePartsFromLocal();

    this.limiter.disconnect();
  }

  downloadParts(options = {}) {
    const promises = this.doc.mapPartUrls(async (partUrl, partNumber) => {
      const part = await this.scheduleDownload(partUrl, partNumber);
      this.browserDownloader.collect(part);

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
