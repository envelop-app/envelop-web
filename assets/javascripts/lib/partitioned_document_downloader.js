import Bottleneck from 'bottleneck';

import { publicUserSession } from '../lib/blockstack_client';

class PartitionedDocumentDownloader {
  constructor(gaiaDocument) {
    this.gaiaDocument = gaiaDocument;
    this.limiter = new Bottleneck({ maxConcurrent: 3 });
  }

  async download() {
    const getPartBuffers = this.gaiaDocument.getPartUrls().map((partUrl) => {
      return this.limiter.schedule(() => this.downloadPart(partUrl));
    });
    const partBuffers = await Promise.all(getPartBuffers);
    const blobOptions = { name: this.gaiaDocument.getName(), type: this.gaiaDocument.getMimeType() };
    const blob = new Blob(partBuffers, blobOptions);
    return URL.createObjectURL(blob);
  }

  async downloadPart(partUrl) {
    const options = { username: this.gaiaDocument._username, decrypt: false, verify: false };
    return await publicUserSession.getFile(partUrl, options);
  }
}

export default PartitionedDocumentDownloader;
