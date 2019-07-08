import Bottleneck from 'bottleneck';

import { publicUserSession } from '../lib/blockstack_client';

class PartitionedDocumentDownloader {
  constructor(gaiaDocument) {
    this.gaiaDocument = gaiaDocument;
    this.limiter = new Bottleneck({ maxConcurrent: 3 });
  }

  createBlob(partBuffers) {
    const blobOptions = { name: this.gaiaDocument.getName(), type: this.gaiaDocument.getMimeType() };
    return new Blob(partBuffers, blobOptions);
  }

  async download() {
    const getPartBuffers = this.gaiaDocument.getPartUrls().map((partUrl) => {
      return this.limiter.schedule(() => this.downloadPart(partUrl));
    });
    const partBuffers = await Promise.all(getPartBuffers);
    const blob = this.createBlob(partBuffers);
    const objectUrl = URL.createObjectURL(blob);

    this.revokeLater(objectUrl)

    return objectUrl;
  }

  async downloadPart(partUrl) {
    const options = { username: this.gaiaDocument._username, decrypt: false, verify: false };
    return await publicUserSession.getFile(partUrl, options);
  }

  revokeLater(objectUrl) {
    window.addEventListener('focus', function handler() {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      window.removeEventListener('focus', handler);
    });
  }
}

export default PartitionedDocumentDownloader;
