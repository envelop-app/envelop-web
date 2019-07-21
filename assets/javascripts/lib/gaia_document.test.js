import Encryptor from './encryptor';
import GaiaDocument from './gaia_document';
import Record from './records/record';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

class MockSession {
  constructor() {
    this.files = {};
  }

  async getFile(path) {
    if (!this.files[path]) {
      throw '404 File does not exist';
    }
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

function buildDoc(additionalAttributes) {
  const attributes = {
    id: '123',
    content_type: null,
    localId: '123',
    version: 2,
    created_at: new Date('2019-07-16T10:47:39.865Z'),
    size: 500,
    url: 'abcdef',
    name: 'name.txt',
    file: new File(['hello'], 'hello.txt'),
    ...additionalAttributes
  }
  return new GaiaDocument(attributes);
}

test('new documents are version = 2', async () => {
  const doc = new GaiaDocument({});
  expect(doc.version).toBe(2);
});

describe('v2', () => {
  describe('.fromFile', () => {
    test('creates a gaia document from a File', async () => {
      const file = new File(["I'm encrypted"], 'foo.txt', { type: 'text/plain' });
      const doc = GaiaDocument.fromFile(file);

      expect(doc.name).toEqual('foo.txt');
      expect(doc.size).toEqual(13);
      expect(doc.content_type).toEqual('txt');
      expect(doc.file).toBe(file);
    });
  });

  describe('.save', () => {
    test('populates appropriate attributes', async () => {
      const attributes = {
        name: 'name.pdf',
        size: 500,
        file: new File([1], '...')
      }
      const doc = new GaiaDocument(attributes);

      expect(doc.uploaded).toBe(false);
      expect(doc.isReady()).toBe(false);

      await doc.save();

      expect(doc.version).toBe(2);
      expect(doc.url).toMatch(uuidRegex);
      expect(doc.name).toEqual('name.pdf');
      expect(doc.passcode).toMatch(/[A-Za-z0-9]{16}/)
      expect(doc.uploaded).toBe(true);
      expect(doc.isReady()).toBe(true);
    });

    test('encrypts contents', async () => {
      const doc = buildDoc();
      await doc.save();

      const encryptedContent = await Record.getSession().getFile(doc.id);
      const encryptedPayload = JSON.parse(encryptedContent);
      const payloadKeys = Object.keys(encryptedPayload).sort();
      expect(payloadKeys).toEqual(['iv', 'payload']);

      const options = { salt: doc.id, passcode: doc.passcode};
      const decrypted = GaiaDocument.parse(encryptedPayload, options);

      expect(decrypted).toEqual(jsonify(doc));
    });

    test('uploads encrypted file', async () => {
      const file = new File(["I'm encrypted"], 'foo.txt', { type: 'text/plain' });
      const doc = GaiaDocument.fromFile(file);
      await doc.save();

      const encryptedContent = await Record.getSession().getFile(doc.url);
      const encryptedPayload = JSON.parse(encryptedContent);
      const payloadKeys = Object.keys(encryptedPayload).sort();
      expect(payloadKeys).toEqual(['iv', 'payload']);

      const options = {
        salt: doc.id,
        passcode: doc.passcode,
        iv: Encryptor.utils.decodeBase64(encryptedPayload.iv),
        encoding: 'utf8'
      };
      const decrypted = Encryptor.decrypt(encryptedPayload.payload, options);
      expect(decrypted).toEqual("I'm encrypted");
    });
  });

  describe('.get', () => {
    test('parses encrypted document', async () => {
      let doc = new GaiaDocument({
        id: '123',
        url: 'abcdef',
        name: 'name.pdf',
        size: 500,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 1,
        passcode: '123',
        uploaded: true,
        version: 2
      })
      await doc.save();

      const getOptions = { passcode: doc.passcode, salt: doc.id };
      doc = await GaiaDocument.get(doc.id, getOptions);

      expect(doc.url).toBe('abcdef');
      expect(doc.name).toBe('name.pdf');
      expect(doc.size).toBe(500);
      expect(doc.created_at).toEqual(new Date('2019-07-16T10:47:39.865Z'));
      expect(doc.num_parts).toBe(1);
      expect(doc.uploaded).toBe(true);
      expect(doc.version).toBe(2);
    });
  });

  describe('.attributes', () => {
    test('returns configured attributes', async () => {
      const attributes = {
        id: '123',
        name: 'name.pdf',
        url: 'abcdef',
        size: 500,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 2,
        uploaded: true,
        version: 2
      }

      const doc = new GaiaDocument(attributes);
      const docJson = doc.attributes();

      expect(docJson).toEqual({
        id: '123',
        content_type: null,
        localId: '123',
        version: 2,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 2,
        passcode: doc.passcode,
        size: 500,
        url: 'abcdef',
        name: 'name.pdf',
        uploaded: true
      });
    });
  });

  test('isUploading considers both .id and .uploaded', async () => {
    const attributes = buildDoc().attributes();
    await Record.getSession().putFile(attributes.id, JSON.stringify(attributes));

    const doc = await GaiaDocument.get(attributes.id);

    delete doc.uploaded;
    expect(doc.id).toEqual('123');
    expect(doc.uploaded).not.toBeDefined();
    expect(doc.isUploading()).toEqual(false);

    doc.uploaded = false;
    expect(doc.id).toEqual('123');
    expect(doc.uploaded).toEqual(false);
    expect(doc.isUploading()).toEqual(true);

    doc.uploaded = true;
    expect(doc.id).toEqual('123');
    expect(doc.uploaded).toEqual(true);
    expect(doc.isUploading()).toEqual(false);

    doc.id = null;
    expect(doc.id).toEqual(null);
    expect(doc.isUploading()).toEqual(false);
  });

  test('isReady considers both .id and .uploaded', async () => {
    const attributes = buildDoc().attributes();
    await Record.getSession().putFile(attributes.id, JSON.stringify(attributes));

    const doc = await GaiaDocument.get(attributes.id);

    delete doc.uploaded;
    expect(doc.id).toEqual('123');
    expect(doc.uploaded).not.toBeDefined();
    expect(doc.isReady()).toEqual(true);

    doc.uploaded = false;
    expect(doc.id).toEqual('123');
    expect(doc.uploaded).toEqual(false);
    expect(doc.isReady()).toEqual(false);

    doc.uploaded = true;
    expect(doc.id).toEqual('123');
    expect(doc.uploaded).toEqual(true);
    expect(doc.isReady()).toEqual(true);

    doc.id = null;
    expect(doc.id).toEqual(null);
    expect(doc.isReady()).toEqual(false);
  });

  describe('.serialize', () => {
    test('returns encrypted shit', async () => {
    });
  })
});

describe('v1', () => {
  const v1Attributes = {
    id: '123',
    url: 'abcdef/name.pdf',
    size: 500,
    created_at: new Date('2019-07-16T10:47:39.865Z'),
    num_parts: 2,
    uploaded: true
  }

  describe('.get', () => {
    describe('new', () => {
      test('parses fields', async () => {
        const doc = new GaiaDocument(v1Attributes);

        expect(doc.url).toBe('abcdef/name.pdf');
        expect(doc.name).toBe('name.pdf');
        expect(doc.size).toBe(500);
        expect(doc.created_at).toEqual(new Date('2019-07-16T10:47:39.865Z'));
        expect(doc.num_parts).toBe(2);
        expect(doc.uploaded).toBe(true);
        expect(doc.version).toBe(1);
      });
    });

    test('parses document', async () => {
      await Record.getSession().putFile(v1Attributes.id, JSON.stringify(v1Attributes));

      const doc = await GaiaDocument.get(v1Attributes.id);

      expect(doc.url).toBe('abcdef/name.pdf');
      expect(doc.name).toBe('name.pdf');
      expect(doc.size).toBe(500);
      expect(doc.created_at).toEqual(new Date('2019-07-16T10:47:39.865Z'));
      expect(doc.num_parts).toBe(2);
      expect(doc.uploaded).toBe(true);
      expect(doc.version).toBe(1);
    });
  });

  describe('.attributes', () => {
    test('parses from v1 attributes', async () => {
      await Record.getSession().putFile(v1Attributes.id, JSON.stringify(v1Attributes));

      const doc = await GaiaDocument.get(v1Attributes.id);
      const docJson = jsonify(doc);

      const expectedJson = jsonify({
        id: '123',
        content_type: null,
        localId: '123',
        version: 1,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 2,
        passcode: doc.passcode,
        size: 500,
        url: 'abcdef/name.pdf',
        name: 'name.pdf',
        uploaded: true
      });

      expect(docJson).toEqual(expectedJson);
    });
  });

  test('isUploading considers both .id and .upladed', async () => {
    await Record.getSession().putFile(v1Attributes.id, JSON.stringify(v1Attributes));

    const doc = await GaiaDocument.get(v1Attributes.id);

    delete doc.uploaded;
    expect(doc.id).toEqual('123');
    expect(doc.uploaded).not.toBeDefined();
    expect(doc.isUploading()).toEqual(false);

    doc.uploaded = false;
    expect(doc.id).toEqual('123');
    expect(doc.uploaded).toEqual(false);
    expect(doc.isUploading()).toEqual(true);

    doc.uploaded = true;
    expect(doc.id).toEqual('123');
    expect(doc.uploaded).toEqual(true);
    expect(doc.isUploading()).toEqual(false);

    doc.id = null;
    expect(doc.id).toEqual(null);
    expect(doc.isUploading()).toEqual(false);
  });

  test('isReady considers both .id and .uploaded', async () => {
    await Record.getSession().putFile(v1Attributes.id, JSON.stringify(v1Attributes));

    const doc = await GaiaDocument.get(v1Attributes.id);

    delete doc.uploaded;
    expect(doc.id).toEqual('123');
    expect(doc.uploaded).not.toBeDefined();
    expect(doc.isReady()).toEqual(true);

    doc.uploaded = false;
    expect(doc.id).toEqual('123');
    expect(doc.uploaded).toEqual(false);
    expect(doc.isReady()).toEqual(false);

    doc.uploaded = true;
    expect(doc.id).toEqual('123');
    expect(doc.uploaded).toEqual(true);
    expect(doc.isReady()).toEqual(true);

    doc.id = null;
    expect(doc.id).toEqual(null);
    expect(doc.isReady()).toEqual(false);
  });
});
