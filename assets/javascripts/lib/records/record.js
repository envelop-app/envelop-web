import randomstring from 'randomstring';

function generateHash(length) {
  return randomstring.generate(length);
}

class Record {
  static config(options = {}) {
    this.session = options.session;
  }

  static getSession() {
    const session = Record.session;

    if (!session) {
      throw "Missing 'session'. Please provide using Record.config({ session: session })";
    }

    return session;
  }

  static async get(id, options = {}) {
    const opts = { decrypt: false, verify: false, ...options };
    const json = await this.getSession().getFile(id, opts);
    const payload = JSON.parse(json);

    return new this(payload, options);
  }

  static hooks = {
    beforeDelete: [],
    beforeSave: []
  }

  static addHook(hookName, hook) {
    if (hook && typeof hook === 'function') {
      this.hooks[hookName].push(hook);
    }
    else {
      throw `${hookName} hook must be of type 'function'`;
    }
  }

  static get attributes() {
    return {
      id: null,
      createdAt: null
    };
  }

  static beforeSave(callback) {
    this.addHook('beforeSave', callback);
  }

  static beforeDelete(callback) {
    this.addHook('beforeDelete', callback);
  }

  constructor(fields = {}) {
    this.attributes = {};

    Object.keys(this.constructor.attributes).forEach(attrName => {
      if (attrName in this) { return; }

      Object.defineProperty(this, attrName, {
        get() {
          return this.attributes[attrName];
        },
        set(value) {
          return this.attributes[attrName] = value;
        }
      });
    });

    Object.keys(fields).forEach(attrName => {
      this[attrName] = fields[attrName];
    });
  }

  set createdAt(value) {
    this.attributes.createdAt = new Date(value);
  }

  get createdAt() {
    return this.attributes.createdAt;
  }

  async delete() {
    await this.runHooks('beforeDelete');
    return Record.getSession().deleteFile(this.id);
  }

  isPersisted() {
    return !!this.id;
  }

  async runHooks(hookName) {
    const hooks = this.constructor.hooks[hookName];
    return hooks.reduce(async (previous, current) => {
      await previous;
      return current(this);
    }, Promise.resolve(this));
  }

  async save(payload = null) {
    await this.runHooks('beforeSave');

    if (!payload) {
      payload = this.serialize();
    }

    if (!payload.id) {
      payload.id = this.id || generateHash(6);
    }

    if (!payload.createdAt) {
      payload.createdAt = this.createdAt || new Date();
    }

    // TODO: Maybe snakecase keys before upload? or camelize?
    const contents = JSON.stringify(payload);
    const fileOptions = { encrypt: false, verify: false };
    await Record.getSession().putFile(payload.id, contents, fileOptions);
    return Object.assign(this, payload);
  }

  serialize() {
    return {
      createdAt: this.createdAt || null,
      id: this.id || null
    };
  }

  toJSON() {
    return this.serialize();
  }
}

export default Record;
