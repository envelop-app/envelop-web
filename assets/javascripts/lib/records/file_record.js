import Record from './record';

class FileRecord extends Record {
  constructor(fields = {}) {
    super(fields);

    this.fileName = fields.fileName;
    this.filePath = fields.filePath;
  }

  serialize() {
    return {
      ...super.serialize(),
      filePath: this.filePath || null
    };
  }
}

export default FileRecord;
