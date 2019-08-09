import Bottleneck from 'bottleneck';

import LocalDatabase from './local_database';
import Record from './records/record';

async function fetchUrls() {
  const keys = await LocalDatabase.keys();
  return keys
    .filter(key => key.startsWith('delete:'))
    .map(key => key.replace('delete:', ''));
}

async function removeUrl(url) {
  return LocalDatabase.removeItem(`delete:${url}`);
}

async function removeAll() {
  const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 1000 });

  const urls = await fetchUrls();

  const deletePromises = urls.map(async url => {
    return limiter.schedule(async () => {
      await Record.getSession().deleteFile(url);
      return removeUrl(url);
    });
  });

  return Promise.all(deletePromises);
}

const BackgroundDocumentRemover = {};
BackgroundDocumentRemover.removeAll = removeAll;

export default BackgroundDocumentRemover;
