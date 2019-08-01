import base64 from 'base64-js';
const Buffer = require('buffer/').Buffer;

import Constants from './constants';

let _window;
if (typeof window === 'undefined') {
  _window = self;
}
else {
  _window = window;
}

const crypto = _window && _window.crypto && _window.crypto.subtle;
const hashers = { SHA1: 'SHA-1', SHA256: 'SHA-256' };
const strategy = 'AES-CTR';
const algo = 'PBKDF2';

function encodeBase64(content) {
  const buffer = content.constructor === Uint8Array ? content : new Uint8Array(content);
  return base64.fromByteArray(buffer);
}

function decodeBase64(content) {
  return base64.toByteArray(content);
}

async function parseOptions(options = {}) {
  if (!options.key && !(options.passcode && options.salt)) {
    throw("Either `key` or (`passcode` and `salt`)) are required for 'decrypt");
  }

  const opts = {};

  if (!options.key) {
    opts.key = await generateKey(options.passcode, {...options, encoding: undefined });
  }
  else if (options.key.constructor === Uint8Array) {
    opts.key = await crypto.importKey('raw', options.key, { name: strategy }, false, ['encrypt', 'decrypt']);
  }
  else {
    opts.key = options.key;
  }

  if (!options.iv) {
    opts.iv = generateIv();
  }
  else if (typeof options.iv === 'string') {
    opts.iv = decodeBase64(options.iv);
  }
  else {
    opts.iv = options.iv;
  }

  return opts;
}

async function generateKey(password, options = {}) {
  if (!options.salt) {
    throw "`options.salt` is required for 'generateKey()'";
  }

  const hasher = options.hasher || hashers.SHA256;
  const keyIterations = options.keyIterations || Constants.KEY_ITERATIONS;
  const keySize = options.keySize || 256;

  const passwordBuffer = Buffer.from(password, 'utf8');
  const importedKey = await crypto.importKey('raw', passwordBuffer, algo, false, ['deriveBits']);

  // FIXME: Maybe I don't need to extract bits and then import, but just call deriveKey
  const saltBuffer = Buffer.from(options.salt, 'utf8');
  const params = {name: algo, hash: hasher, salt: saltBuffer, iterations: keyIterations};
  const derivation = await crypto.deriveBits(params, importedKey, keySize);

  const key = await crypto.importKey('raw', derivation, { name: strategy }, false, ['encrypt', 'decrypt']);

  return options.encoding === 'base64' ? encodeBase64(derivation) : key;
}

function generateIv(options = {}) {
  const iv = _window.crypto.getRandomValues(new Uint8Array(16));
  return options.encoding === 'base64' ? encodeBase64(iv) : iv;
}

async function encrypt(contents, options = {}) {
  const opts = await parseOptions(options);

  let buffer = contents;

  if (typeof contents === 'string') {
    buffer = Buffer.from(contents, 'utf8');
  }

  const aesParams = { name: 'AES-CTR', counter: opts.iv, length: 128 };
  const encrypted = await crypto.encrypt(aesParams, opts.key, buffer);

  const result = {};
  result.iv = opts.iv;
  result.payload = encrypted;

  if (options.encoding === 'base64') {
    result.iv = encodeBase64(opts.iv);
    result.payload = encodeBase64(encrypted);
  }

  return result;
}

async function decrypt(encrypted, options = {}) {
  if (!options.iv) {
    throw("iv is required for 'decrypt'");
  }

  const opts = await parseOptions(options);

  if (typeof encrypted === 'string') {
    encrypted = decodeBase64(encrypted);
  }

  const aesParams = { name: 'AES-CTR', counter: opts.iv, length: 128 };
  const decrypted = await crypto.decrypt(aesParams, opts.key, encrypted);

  if (options.encoding === 'utf8') {
    return Buffer.from(decrypted).toString('utf8');
  }

  return decrypted;
}

const NativeEncryptor = {
  decrypt: decrypt,
  encrypt: encrypt,
  utils: {
    decodeBase64,
    encodeBase64,
    generateKey,
    generateIv
  },
  hashers
};

export default NativeEncryptor;
