import BrowserDownloader from './browser_downloader';
import BaseDocumentDownloader from './base_document_downloader';

class DocumentDownloader extends BaseDocumentDownloader {
  async download() {
    const raw = await this.downloadRawFile(this.doc.url, { partNumber: 0 });

    const browserDownloader = new BrowserDownloader(this.doc);
    browserDownloader.collect(raw);
    browserDownloader.finish();

    this.progress.add(this.doc.size);
  }
}

export default DocumentDownloader;
