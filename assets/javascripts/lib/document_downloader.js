import BaseDocumentDownloader from './base_document_downloader';

class DocumentDownloader extends BaseDocumentDownloader {
  async download() {
    const raw = await this.downloadRawFile(this.doc.url, { partNumber: 0 });
    const blob = this.createBlob(raw);
    const objectUrl = URL.createObjectURL(blob);

    this.progress.add(this.doc.size);

    this.revokeLater(objectUrl);

    return objectUrl;
  }
}

export default DocumentDownloader;
