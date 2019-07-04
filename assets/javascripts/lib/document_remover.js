import Bottleneck from 'bottleneck';

import { privateUserSession } from './blockstack_client';
import GaiaDocument from './gaia_document';

class DocumentRemover {
  constructor(gaiaDocument) {
    this.gaiaDocument = gaiaDocument;
    this.limiter = new Bottleneck({ maxConcurrent: 3 });
  }

  async remove() {
    if (this.gaiaDocument.numParts > 1) {
      await this.removeParts();
    } else {
      await this.removeRawFile(this.gaiaDocument.url);
    }
    return this.removeDocument();
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

  removeDocument() {
    return privateUserSession.deleteFile(this.gaiaDocument.id);
  }
}

export default DocumentRemover;
