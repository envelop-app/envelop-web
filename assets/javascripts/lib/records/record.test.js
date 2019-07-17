import Record from './record';

const session = {
  async getFile() {
    return JSON.stringify({ id: '123', created_at: new Date() });
  },
  async putFile() {
    return true;
  }
}

Record.config({ session });

class TestRecord extends Record { }

describe('.get', () => {
  test('parses default attributes', async () => {
    const testRecord = await TestRecord.get('123');

    expect(testRecord.id).toBe('123');
    expect(testRecord.created_at).toBeInstanceOf(Date);
  });
});

describe('.save', () => {
  test('sets id and created_at', async () => {
    const testRecord = new TestRecord();
    await testRecord.save();

    expect(typeof testRecord.id).toBe('string');
    expect(testRecord.created_at).toBeInstanceOf(Date);
  });
});
