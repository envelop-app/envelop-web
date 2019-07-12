import { privateUserSession } from '../blockstack_client';

// TODO: Use Record.config({ blockstack: blockstack });

class Record {
  constructor(fields = {}) {
    this.id = fields.id;
  }

  delete() {
    return privateUserSession.deleteFile(this.id);
  }
}

export default Record;
