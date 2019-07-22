import BaseDocumentUploader from './base_document_uploader';

class DocumentUploader extends BaseDocumentUploader {
  constructor(doc) {
    super(doc);
    this.reader = new FileReader();
  }

  upload(file) {
    return new Promise((resolve, reject) => {
      this.reader.onload = (evt) => {
        const buffer = evt.target.result;
        const rawFilePromise = this.uploadRawFile(this.doc.url, buffer, { partNumber: 0 });

        rawFilePromise
          .then(() => {
            this.progress.add(this.doc.size);
            resolve(this.doc);
          });
      }

      this.reader.onerror = (evt) => {
        reject(evt.target.error);
      }

      this.reader.readAsArrayBuffer(file);
    });
  }
}

export default DocumentUploader;
