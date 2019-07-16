import Record from './record';

const session = {
  async getFile() {
    return JSON.stringify({ id: '123', createdAt: new Date() });
  },
  async putFile() {
    return true;
  }
}

Record.config({ session });

class TestRecord extends Record {
  static get attributes() {
    return {
      ...super.attributes,
      custom: null
    }
  }

  get custom() {
    return 'overriden';
  }
}

describe('.get', () => {
  test('parses default attributes', async () => {
    const testRecord = await TestRecord.get('123');

    expect(testRecord.id).toBe('123');
    expect(testRecord.createdAt).toBeInstanceOf(Date);
  });

  test('parses custom attributes', async () => {
    const testRecord = await TestRecord.get('123');

    expect(testRecord.custom).toBe('overriden');
  });
});

describe('.save', () => {
  test('sets id and createdAt', async () => {
    const testRecord = new TestRecord();
    await testRecord.save();

    expect(typeof testRecord.id).toBe('string');
    expect(testRecord.createdAt).toBeInstanceOf(Date);
  });
});

describe('attribute getters/setters', () => {
  test('are set by default if defined in attributes()', () => {
    const testRecord = new TestRecord();

    expect('custom' in testRecord).toBe(true);
  });

  test('are overridable', () => {
    const testRecord = new TestRecord();

    expect(testRecord.custom).toEqual('overriden');
  });
});
