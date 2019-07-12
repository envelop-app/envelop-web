import randomstring from 'randomstring';

import { privateUserSession, publicUserSession } from '../blockstack_client';

// TODO: Use Record.config({ blockstack: blockstack });

const publicFileOptions = { encrypt: false, verify: false };
function putPublicFile(name, contents) {
  return privateUserSession.putFile(name, contents, publicFileOptions);
}

function generateHash(length) {
  return randomstring.generate(length);
}

class Record {
  static async get(id, options = {}) {
    const opts = { decrypt: false, verify: false, ...options };
    const json = await publicUserSession.getFile(id, opts);
    const payload = JSON.parse(json);

    return new this({
      ...payload,
      created_at: new Date(payload.created_at)
    });
  }

  constructor(fields = {}) {
    this.created_at = fields.created_at;
    this.id = fields.id;
  }

  delete() {
    return privateUserSession.deleteFile(this.id);
  }

  isPersisted() {
    return !!this.id;
  }

  isSynced() {
    // TODO: alias isPersisted
    return this.isPersisted();
  }

  async save(payload = null) {
    if (!payload) {
      payload = this.serialize();
    }

    if (!payload.id) {
      payload.id = this.id || generateHash(6);
    }

    if (!payload.created_at) {
      payload.created_at = this.created_at || new Date();
    }

    // TODO: Maybe snakecase keys before upload? or camelize?
    const contents = JSON.stringify(payload);
    await putPublicFile(payload.id, contents);
    return Object.assign(this, payload);
  }

  serialize() {
    return {
      created_at: this.created_at || null,
      id: this.id || null
    };
  }

  toJSON() {
    return this.serialize();
  }
}

export default Record;
