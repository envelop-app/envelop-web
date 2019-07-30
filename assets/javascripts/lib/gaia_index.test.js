import Constants from './constants';
import Encryptor from './encryptor';
import GaiaDocument from './gaia_document';
import GaiaIndex from './gaia_index';
import Record from './records/record';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

class MockSession {
  constructor() {
    this.files = {};
  }

  async getFile(path) {
    // if (!this.files[path]) {
    //   throw '404 File does not exist';
    // }
    return Promise.resolve(this.files[path]);
  }

  putFile(path, contents) {
    this.files[path] = contents;
    return Promise.resolve(path);
  }
}

Record.config({ session: new MockSession() });

function jsonify(payload) {
  return JSON.parse(JSON.stringify(payload));
}

function buildDoc() {
  const file = new File(["I'm encrypted"], 'foo.txt', { type: 'text/plain' });
  return GaiaDocument.fromFile(file);
}

describe('.addDocuments', () => {
  test('saves document and adds it to the index', async () => {
    const doc = buildDoc();
    const gaiaIndex = new GaiaIndex();

    await gaiaIndex.load();
    expect(gaiaIndex.documents.length).toBe(0);

    await gaiaIndex.addDocuments([doc]);
    await gaiaIndex.load();
    expect(gaiaIndex.documents.length).toBe(1);
  });

  test("includes document's encryption data", async () => {
    let doc = buildDoc();
    const gaiaIndex = new GaiaIndex();
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
