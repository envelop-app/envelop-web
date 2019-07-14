import Bottleneck from 'bottleneck';

import { privateUserSession } from './blockstack_client';

class DocumentRemover {
  constructor(gaiaDocument) {
    this.gaiaDocument = gaiaDocument;
    this.limiter = new Bottleneck({ maxConcurrent: 1, minTime: 1000 });
  }

  remove() {
    if (this.gaiaDocument.getNumParts() > 1) {
      return this.removeParts();
    } else {
      return this.removeRawFile(this.gaiaDocument.filePath);
    }
  }

  removeParts() {
    const removeJobs = this.gaiaDocument.getPartUrls().map((partUrl) => {
      return this.limiter.schedule(() => this.removeRawFile(partUrl));
    });
    return Promise.all(removeJobs);
  }

  removeRawFile(url) {
    return privateUserSession.deleteFile(url);
  }
}

export default DocumentRemover;
