/* global process */

import Encryptor from './encryptor';

if (process.env.BENCHMARKS) {

  const totalSize = 100 * 1000 * 1000; // 100 MB
  const partSize = 9000000; // 9 MB
  const buffer = new ArrayBuffer(partSize);
  const numUploads = Math.ceil(totalSize / partSize);

  const uint8View = new Uint8Array(buffer);
  for (var i=0; i< uint8View.length; i++) {
    uint8View[i] = i % 64;
  }

  const passcode = 'hr892jfhr85k195';
  const salt = '95hj5x';

  /*
   * Test Parameters
   *
   */

  const keySizes = [
    // 128,
    256
  ];
  const iterations = [
    // 5000,
    10000,
    // 20000,
    // 40000,
    // 60000
  ];

  const hashers = {
    SHA1: Encryptor.hashers.SHA1,
    SHA256: Encryptor.hashers.SHA256
  };

  const strategies = {
    // buffer: true,
    bufferReuseKey: true,
    // json: true,
    // jsonReuseKey: true
  };

  const testEncryption = false;

  function encryptAll(encryptAllOptions) {
    const results = [];

    for (let i = 0; i < numUploads; i++) {
      results.push(Encryptor.encrypt(buffer, encryptAllOptions));
    }

    return results;
  }

  function testEncrypt(options) {
    const keySize = options.keySize;
    const keyIterations = options.keyIterations;
    const hasher = options.hasher;

    if (strategies.buffer) {
      test('encrypt, to buffer', () => {
        const options = { passcode, salt, keySize, keyIterations, encoding: 'uint8-buffer' };
        encryptAll(options);
      });
    }

    if (strategies.bufferReuseKey) {
      test('encrypt, to buffer, reuse key', () => {
        const key = Encryptor.utils.generateKey(passcode, { salt, keySize, keyIterations, hasher });
        const options = { key, encoding: 'uint8-buffer' };
        encryptAll(options);
      });
    }

    if (strategies.json) {
      test('encrypt, to JSON', () => {
        const options = { passcode, salt, keySize, keyIterations, encoding: 'base64' };
        encryptAll(options, encrypted => JSON.stringify(encrypted));
      });
    }

    if (strategies.jsonReuseKey) {
      test('encrypt, to JSON, reuse key', () => {
        const key = Encryptor.utils.generateKey(passcode, { salt, keySize, keyIterations });
        const options = { key, encoding: 'base64' };
        encryptAll(options, encrypted => JSON.stringify(encrypted));
      });
    }
  }

  const iv = Encryptor.utils.generateIv();
  const theOptions = { passcode, salt, iv };

  const thePayload = {
    iv: Encryptor.utils.encodeBase64(iv),
    withBuffer: Encryptor.encrypt(buffer, {...theOptions, encoding: 'uint8-buffer'}),
    withJSON: JSON.stringify(Encryptor.encrypt(buffer, {...theOptions, encoding: 'base64'}))
  }

  function decryptAll(decryptAlloptions, cb) {
    let encryptedPayload = null;
    const results = [];

    for (let i = 0; i < numUploads; i++) {
      decryptAlloptions.iv = Encryptor.utils.decodeBase64(thePayload.iv);

      if (cb) {
        encryptedPayload = cb(thePayload)
      }
      else {
        encryptedPayload = thePayload.withBuffer;
      }

      results.push(Encryptor.decrypt(encryptedPayload.payload, decryptAlloptions));
    }

    return results;
  }

  if (testEncryption) {
    test('encrypts and decrypts stuff', () => {
      const key = Encryptor.utils.generateKey(passcode, { salt });
      const options = { key, encoding: 'uint8-buffer' };
      const decryptedResult = decryptAll(options);
      const view = new Uint8Array(decryptedResult);

      for (let i = 0; i < numUploads; i++) {
        expect(view[i]).toEqual(uint8View[i]);
      }
    });
  }

  function testDecrypt(testOptions = {}) {
    const keySize = testOptions.keySize;
    const keyIterations = testOptions.keyIterations;
    const hasher = testOptions.hasher;

    if (strategies.buffer) {
      test('decrypt, from buffer', () => {
        const options = { passcode, salt, keySize, keyIterations, encoding: 'uint8-buffer' };
        decryptAll(options);
      });
    }

    if (strategies.bufferReuseKey) {
      test('decrypt, from buffer, reuse key', () => {
        const key = Encryptor.utils.generateKey(passcode, { salt, keySize, keyIterations, hasher });
        const options = { key, encoding: 'uint8-buffer' };
        decryptAll(options);
      });
    }

    if (strategies.json) {
      test('decrypt, from JSON', () => {
        const options = { passcode, salt, keySize, keyIterations, encoding: 'uint8-buffer' };
        decryptAll(options, payload => JSON.parse(payload.withJSON));
      });
    }

    if (strategies.jsonReuseKey) {
      test('decrypt, from JSON, reuse key', () => {
        const key = Encryptor.utils.generateKey(passcode, { salt, keySize, keyIterations });
        const options = { key, encoding: 'uint8-buffer' };
        decryptAll(options, payload => JSON.parse(payload.withJSON));
      });
    }
  }

  describe('upload', () => {
    keySizes.forEach(keySize => {
      iterations.forEach(iteration => {
        Object.keys(hashers).forEach(hasherKey => {

          describe(`${keySize} bit`, () => {
            describe(`${iteration} iterations`, () => {
              describe(`${hasherKey} hasher`, () => {
                const hasher = hashers[hasherKey];
                const options = { keySize, keyIterations: iteration, hasher };
                testEncrypt(options);
              });
            });
          });

        });
      });
    });
  });

  describe('download', () => {
    keySizes.forEach(keySize => {
      iterations.forEach(iteration => {

        Object.keys(hashers).forEach(hasherKey => {
          describe(`${keySize} bit`, () => {
            describe(`${iteration} iterations`, () => {
              describe(`${hasherKey} hasher`, () => {
                const hasher = hashers[hasherKey];
                const options = { keySize, keyIterations: iteration, hasher };
                testDecrypt(options);
              });
            });
          });
        });

      });
    });
  });
}
else {
  test('empty', (done) => done());
}
