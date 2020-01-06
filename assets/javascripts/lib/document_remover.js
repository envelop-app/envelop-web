import Bottleneck from 'bottleneck';

import BackgroundDocumentRemover from './background_document_remover';
import Record from './records/record';

import LocalDatabase from './local_database';

const RETRY_INTERVAL = 1000;
const RETRY_ATTEMPTS = 3;

class DocumentRemover {
  constructor(gaiaDocument) {
    this.gaiaDocument = gaiaDocument;
    this.limiter = new Bottleneck({maxConcurrent: 1, minTime: 1000});

    this.limiter.on('failed', async (error, jobInfo) => {
      if (jobInfo.retryCount === RETRY_ATTEMPTS) {
        return RETRY_INTERVAL;
      }
    });
  }

  async remove() {
    try {
      await this.removeLater();
    }
    catch (e) {
      if (e.name === 'QuotaExceededError') {
        if (this.gaiaDocument.num_parts > 1) {
          await this.removeParts();
        } else {
          await this.removeRawFile(this.gaiaDocument.url);
        }
      }
    }
  }

  async removeLater() {
    let urls = [];

    if (this.gaiaDocument.num_parts > 1) {
      urls = [...this.gaiaDocument.getPartUrls()];
    } else {
      urls = [this.gaiaDocument.url];
    }

    const promises = urls.map(url => {
      return LocalDatabase.setItem(`delete:${url}`, true);
    });

    await Promise.all(promises);

    BackgroundDocumentRemover.removeAll();

    return true;
  }

  removeParts() {
    const removeJobs = this.gaiaDocument.getPartUrls().map((partUrl) => {
      return this.limiter.schedule(() => this.removeRawFile(partUrl));
    });
    return Promise.all(removeJobs);
  }

  removeRawFile(url) {
    return Record.getSession().deleteFile(url);
  }
}

export default DocumentRemover;
