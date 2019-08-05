import Record from './record';

const session = {
  async getFile() {
    return JSON.stringify({ id: '123', created_at: new Date() });
  },
  async putFile() {
    return true;
  },
  async deleteFile() {
    return true;
  }
}

Record.config({ session });

describe('.get', () => {
  test('parses default attributes', async () => {
    const TestRecord = class extends Record { }

    const testRecord = await TestRecord.get('123');

    expect(testRecord.id).toBe('123');
    expect(testRecord.created_at).toBeInstanceOf(Date);
  });
});

describe('.save', () => {
  test('sets id and created_at', async () => {
    const TestRecord = class extends Record { }

    const testRecord = new TestRecord();
    await testRecord.save();

    expect(typeof testRecord.id).toBe('string');
    expect(testRecord.created_at).toBeInstanceOf(Date);
  });
});

describe('hooks', () => {
  test('.afteInitialize', () => {
    const HookedRecord = class extends Record {}
    HookedRecord.afterInitialize(record => record.foo = 'bar');

    const record = new HookedRecord();

    expect(record.foo).toEqual('bar');
  });

  test('.beforeSave', async () => {
    const HookedRecord = class extends Record {}
    HookedRecord.beforeSave(record => Promise.resolve(record.saving = true));

    const record = new HookedRecord();
    await record.save();

    expect(record.saving).toEqual(true);
  });

  test('.beforeDelete', async () => {
    const HookedRecord = class extends Record {}
    HookedRecord.beforeDelete(record => Promise.resolve(record.deleting = true));

    const record = new HookedRecord();
    await record.delete();

    expect(record.deleting).toEqual(true);
  });
});
