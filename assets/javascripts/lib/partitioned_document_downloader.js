import Bottleneck from 'bottleneck';

import BaseDocumentDownloader from './base_document_downloader';
import LocalDatabase from './local_database';

class PartitionedDocumentDownloader extends BaseDocumentDownloader {
  constructor(doc) {
    super(doc);
    this.limiter = new Bottleneck({ maxConcurrent: 3 });
  }

  async download() {
    await this.downloadAndSavePartsLocally();

    const parts = await this.loadPartsFromLocal();
    const blob = this.createBlob(parts);
    const objectUrl = URL.createObjectURL(blob);

    await this.deletePartsFromLocal();
    this.revokeLater(objectUrl);

    this.limiter.disconnect();

    return objectUrl;
  }

  downloadAndSavePartsLocally() {
    const promises = this.doc.mapPartUrls(async (partUrl, partNumber) => {
      const part = await this.scheduleDownload(partUrl, partNumber);
      await LocalDatabase.setItem(this.localUrl(partUrl), part);
      this.progress.add(part.byteLength);
      return true;
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

    return  Promise.all(promises);
  }

  deletePartsFromLocal() {
    const promises = this.doc.mapPartUrls(partUrl => {
      return LocalDatabase.removeItem(this.localUrl(partUrl));
    });

    return  Promise.all(promises);
  }
}

export default PartitionedDocumentDownloader;
