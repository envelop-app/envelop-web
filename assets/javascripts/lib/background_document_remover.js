import Bottleneck from 'bottleneck';

import LocalDatabase from './local_database';
import Record from './records/record';
import sleep from './sleep';

let busy = false;

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
  while (busy) {
    await sleep(50);
  }
  busy = true;

  const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 1000 });

  const urls = await fetchUrls();

  const deletePromises = urls.map(async url => {
    return limiter.schedule(async () => {
      try {
        await Record.getSession().deleteFile(url);
      }
      finally {
        removeUrl(url);
      }
    });
  });

  await Promise.all(deletePromises);

  busy = false;

  return Promise.resolve();
}

const BackgroundDocumentRemover = {};
BackgroundDocumentRemover.removeAll = removeAll;

export default BackgroundDocumentRemover;
