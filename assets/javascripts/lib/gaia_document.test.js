import Encryptor from './encryptor';
import GaiaDocument from './gaia_document';
import Record from './records/record';


const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function mockSession(session) {
  Record.config({ session });
}

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
    name: 'name.pdf',
    file: new File([1], '...'),
    ...additionalAttributes
  }
  return new GaiaDocument(attributes);
}

test('new documents are version = 2', async () => {
  const doc = new GaiaDocument({});
  expect(doc.version).toBe(2);
});

describe('v2', () => {
  describe('.save', () => {
    test('populates appropriate attributes', async () => {
      mockSession({ putFile: async() => true });

      const attributes = {
        name: 'name.pdf',
        size: 500,
        file: new File([1], '...')
      }
      const doc = new GaiaDocument(attributes);
      await doc.save();

      expect(doc.version).toBe(2);
      expect(doc.url).toMatch(uuidRegex);
      expect(doc.name).toEqual('name.pdf');
      expect(doc.passcode).toMatch(/[A-Za-z0-9]{16}/)
    });

    test('encrypts contents', async () => {
      let encryptedContent = null;
      mockSession({
        putFile: async (_, content) => encryptedContent = content
      });

      const doc = buildDoc();
      await doc.save();

      const encryptedPayload = JSON.parse(encryptedContent);
      const payloadKeys = Object.keys(encryptedPayload).sort();
      expect(payloadKeys).toEqual(['iv', 'payload']);

      const options = { salt: doc.id, passcode: doc.passcode};
      const decrypted = GaiaDocument.parse(encryptedPayload, options);

      expect(decrypted).toEqual(jsonify(doc));
    });
  });

  describe('.get', () => {
    test('parses encrypted document', async () => {
      let docBeforeSave = new GaiaDocument({
        id: '123',
        url: 'abcdef',
        name: 'name.pdf',
        size: 500,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 2,
        passcode: '123',
        uploaded: true,
        version: 2
      })

      const encrypted = JSON.stringify(docBeforeSave.serialize());
      mockSession({ getFile: async() => encrypted });

      const getOptions = {
        passcode: docBeforeSave.passcode,
        salt: docBeforeSave.id
      };
      const doc = await GaiaDocument.get('123', getOptions);

      expect(doc.url).toBe('abcdef');
      expect(doc.name).toBe('name.pdf');
      expect(doc.size).toBe(500);
      expect(doc.created_at).toEqual(new Date('2019-07-16T10:47:39.865Z'));
      expect(doc.num_parts).toBe(2);
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
        passcode: null,
        size: 500,
        url: 'abcdef',
        name: 'name.pdf',
        uploaded: true
      });
    });
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
      mockSession({ getFile: async() => JSON.stringify(v1Attributes) })

      const doc = await GaiaDocument.get('123');

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
      mockSession({ getFile: async() => JSON.stringify(v1Attributes) })

      const doc = await GaiaDocument.get('123');
      const docJson = jsonify(doc);

      const expectedJson = jsonify({
        id: '123',
        content_type: null,
        localId: '123',
        version: 1,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 2,
        passcode: null,
        size: 500,
        url: 'abcdef/name.pdf',
        name: 'name.pdf',
        uploaded: true
      });

      expect(docJson).toEqual(expectedJson);
    });
  });
});
