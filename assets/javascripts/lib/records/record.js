import randomstring from 'randomstring';

function generateHash(length) {
  return randomstring.generate(length);
}

const hooks = {
  afterInitialize: [],
  beforeSave: [],
  afterSave: [],
  beforeDelete: []
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
    if (options.username && !options.username.includes('.')) {
      options.username += '.id.blockstack';
    }

    const opts = { decrypt: false, verify: false, ...options };
    const json = await this.getSession().getFile(id, opts);
    const payload = JSON.parse(json);
    const parsed = await this.parse(payload, options);

    return new this(parsed, options);
  }

  static async parse(raw, _options) {
    return raw;
  }

  static get hooks() {
    return hooks;
  }

  static addHook(hookName, hook) {
    if (hook && typeof hook === 'function') {
      this.hooks[hookName].push(hook);
    }
    else {
      throw `${hookName} hook must be of type 'function'`;
    }
  }

  static afterInitialize(callback) {
    this.addHook('afterInitialize', callback);
  }

  static beforeSave(callback) {
    this.addHook('beforeSave', callback);
  }

  static afterSave(callback) {
    this.addHook('afterSave', callback);
  }

  static beforeDelete(callback) {
    this.addHook('beforeDelete', callback);
  }

  constructor(fields = {}) {
    Object.keys(fields).forEach(attrName => {
      this[attrName] = fields[attrName];
    });

    if (this.created_at) {
      this.created_at = new Date(this.created_at);
    }

    this.runHooks('afterInitialize', { sync: true });
  }

  async delete() {
    await this.runHooks('beforeDelete');
    return Record.getSession().deleteFile(this.id);
  }

  isPersisted() {
    return !!this.id;
  }

  runHooks(hookName, options = {}) {
    if (options.sync) {
      this.constructor.hooks[hookName].forEach(hook => hook(this));
    }
    else {
      return this.runHooksAsync(hookName);
    }
  }

  async runHooksAsync(hookName, _options) {
    const hooks = this.constructor.hooks[hookName];
    return hooks.reduce(async (previous, current) => {
      await previous;
      return current(this);
    }, Promise.resolve(this));
  }

  attributes() {
    return {
      created_at: this.created_at || null,
      id: this.id || null
    };
  }

  async serialize(payload = this) {
    return payload;
  }

  async save(options = {}) {
    if (!options.skipHooks) {
      await this.runHooks('beforeSave');
    }

    const payload = this.attributes();
    payload.id = this.id || generateHash(6);
    payload.created_at = this.created_at || new Date();

    // TODO: Maybe snakecase keys before upload? or camelize?
    const serialized = await this.serialize(payload);
    const content = JSON.stringify(serialized);
    const fileOptions = { encrypt: false, verify: false };
    await Record.getSession().putFile(payload.id, content, fileOptions);

    // FIXME: What about code that checks for isPersisted????
    Object.assign(this, payload);

    if (!options.skipHooks) {
      await this.runHooks('afterSave');
    }

    return this;
  }

  toJSON() {
    return this.attributes();
  }
}

export default Record;
