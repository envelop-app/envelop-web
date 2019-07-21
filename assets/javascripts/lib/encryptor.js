import crypto from 'crypto-js';

function encodeBase64(content) {
  return content.toString(crypto.enc.Base64);
}

function decodeBase64(content) {
  return crypto.enc.Base64.parse(content);
}

function decodeUint8(wordArray) {
  var length = wordArray.words.length;
  var buffer = new Uint8Array(length << 2);
  var offset = 0;

  for (var i = 0; i < length; i++) {
    var word = wordArray.words[i];
    buffer[offset++] = word >> 24;
    buffer[offset++] = (word >> 16) & 0xff;
    buffer[offset++] = (word >> 8) & 0xff;
    buffer[offset++] = word & 0xff;
  }

  return buffer
}

function generateKey(input, options = {}) {
  const salt = options.salt;
  const iterations = 5000;
  const keyLength = 128;

  const key = crypto.PBKDF2(input, salt, {
    keySize: keyLength / 32,
    iterations: iterations,
    hasher: crypto.algo.SHA1
  });

  return options.encoding === 'base64' ? encodeBase64(key) : key;
}

function generateIv() {
  return crypto.lib.WordArray.random(128 / 8);
}

function encrypt(contents, options = {}) {
  if (!options.passcode || !options.salt) {
    throw("options { passcode, salt } are required for 'decrypt'")
  }

  const generateKeyOptions = { salt: options.salt };
  const key = generateKey(options.passcode, generateKeyOptions);
  const iv = options.iv || generateIv();

  const cryptoOptions = {
    iv: iv,
    mode: crypto.mode.CTR,
    padding: crypto.pad.NoPadding
  };

  if (contents instanceof ArrayBuffer) {
    contents = crypto.lib.WordArray.create(contents);
  }

  const encrypted = crypto.AES.encrypt(contents, key, cryptoOptions);

  const result = {};
  result.passcode = key;
  result.iv = iv;
  result.payload = encodeBase64(encrypted.ciphertext);

  if (options.encoding === 'base64') {
    result.iv = encodeBase64(encrypted.iv);
    result.passcode = encodeBase64(encrypted.key);
    result.payload = encodeBase64(encrypted.ciphertext);
  }
  else {
    result.iv = iv;
    result.passcode = key;
    result.payload = encrypted;
  }

  return result;
}

function decrypt(encrypted, options = {}) {
  if (!options.passcode || !options.iv || !options.salt) {
    throw("options { passcode, iv, salt } are required for 'decrypt'")
  }

  const key = generateKey(options.passcode, { salt: options.salt });

  const cryptoOptions = {
    iv: options.iv,
    mode: crypto.mode.CTR,
    padding: crypto.pad.NoPadding,
    // format: crypto.enc.Utf8
  };

  const decrypted = crypto.AES.decrypt(encrypted, key, cryptoOptions);

  if (options.encoding === 'utf8') {
    return crypto.enc.Utf8.stringify(decrypted);
  }
  else if (options.encoding === 'uint8') {
    return decodeUint8(decrypted);
  }
  else {
    return decrypted;
  }
}

const Encryptor = {
  decrypt: decrypt,
  encrypt: encrypt,
  utils: {
    decodeBase64,
    encodeBase64,
    generateKey
  }
};

export default Encryptor;

// const formatter = {
//   stringify: function (cipherParams) {
//     const encrypted = {
//       iv: encodeBase64(cipherParams.iv),
//       passcode: encodeBase64(cipherParams.key),
//       payload: encodeBase64(cipherParams.ciphertext)
//     };
//
//     return JSON.stringify(encrypted);
//   },
//   parse: function (json) {
//   //   console.log('cu')
//   //   // const encrypted = JSON.parse(json);
//   //   //
//   //   // const cipherParams = crypto.lib.CipherParams.create({
//   //   //   ciphertext: crypto.enc.Base64.parse(encrypted.payload),
//   //   //   iv: crypto.enc.Base64.parse(encrypted.iv)
//   //   // });
//   //   //
//   //   // return cipherParams;
//     // console.log('ble')
//     throw 'gluglu';
//   }
// }

