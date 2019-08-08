import GaiaDocument from './gaia_document';
import { gaiaIndex } from './gaia_index';
import Record from './records/record';

class MockSession {
  constructor() {
    this.files = {};
  }

  async getFile(path) {
    return Promise.resolve(this.files[path]);
  }

  putFile(path, contents) {
    this.files[path] = contents;
    return Promise.resolve(path);
  }

  loadUserData() {
    return { username: 'billburr' };
  }
}

Record.config({ session: new MockSession() });

function buildDoc() {
  const file = new File(["I'm encrypted"], 'foo.txt', { type: 'text/plain' });
  return GaiaDocument.fromFile(file);
}

describe('.addDocuments', () => {
  test('saves document and adds it to the index', async () => {
    const doc = buildDoc();

    await gaiaIndex.load();
    expect(gaiaIndex.documents.length).toBe(0);

    await gaiaIndex.addDocuments([doc]);
    await gaiaIndex.load();
    expect(gaiaIndex.documents.length).toBe(1);
  });

  test("includes document's encryption data", async () => {
    let doc = buildDoc();
    await gaiaIndex.addDocuments([doc]);

    await gaiaIndex.load();
    doc = gaiaIndex.documents[0];

    expect(typeof doc.passcode).toBe('string');
    expect(doc).toMatchObject({
      encryption: {
        type: expect.any(String),
        params: {
          iv: expect.any(String),
          key_iterations: expect.any(Number),
          salt: expect.any(String)
        }
      }
    });
  });
});
