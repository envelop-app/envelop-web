/* global process */

import Encryptor from './encryptor';

if (process.env.BENCHMARKS) {

  const totalSize = 100000000; // 100 MB
  const partSize = 9000000; // 9 MB
  const buffer = new ArrayBuffer(partSize);
  const numUploads = Math.ceil(totalSize / partSize);

  const passcode = 'hr892jfhr85k195';
  const salt = '95hj5x';

  const eachPartUpload = (cb) => {
    for (let i = 0; i < numUploads; i++) {
      cb(buffer);
    }
  }

  describe('upload', () => {
    test('encrypt, to buffer', () => {
      const options = { passcode, salt, encoding: 'uint8-buffer' };

      eachPartUpload((buffer) => {
        Encryptor.encrypt(buffer, options);
      });
    });

    test('encrypt, to buffer, reuse key', () => {
      const key = Encryptor.utils.generateKey(passcode, { salt });
      const options = { key, encoding: 'uint8-buffer' };

      eachPartUpload((buffer) => {
        Encryptor.encrypt(buffer, options);
      });
    });

    test('encrypt, to JSON', () => {
      const options = { passcode, salt, encoding: 'base64' };

      eachPartUpload((buffer) => {
        const decrypted = Encryptor.encrypt(buffer, options);
        JSON.stringify(decrypted);
      });
    });

    test('encrypt, to JSON, reuse key', () => {
      const key = Encryptor.utils.generateKey(passcode, { salt });
      const options = { key, encoding: 'base64' };

      eachPartUpload((buffer) => {
        const decrypted = Encryptor.encrypt(buffer, options);
        JSON.stringify(decrypted);
      });
    });
  });

  const iv = Encryptor.utils.generateIv();
  const options = { passcode, salt, iv };

  const payload = {
    iv: Encryptor.utils.encodeBase64(iv),
    withBuffer: Encryptor.encrypt(buffer, {...options, encoding: 'uint8-buffer'}),
    withJSON: JSON.stringify(Encryptor.encrypt(buffer, {...options, encoding: 'base64'}))
  }

  const eachPartDownload = (cb) => {
    for (let i = 0; i < numUploads; i++) {
      cb(payload);
    }
  }

  describe('download', () => {
    test('decrypt, from buffer', () => {
      const options = { passcode, salt, encoding: 'uint8-buffer' };

      eachPartDownload((payload) => {
        options.iv = Encryptor.utils.decodeBase64(payload.iv);
        Encryptor.decrypt(payload.withBuffer, options);
      });
    });

    test('decrypt, from buffer, reuse key', () => {
      const key = Encryptor.utils.generateKey(passcode, { salt });
      const options = { key, encoding: 'uint8-buffer' };

      eachPartDownload((payload) => {
        options.iv = Encryptor.utils.decodeBase64(payload.iv);
        Encryptor.decrypt(payload.withBuffer, options);
      });
    });

    test('decrypt, from JSON', () => {
      const options = { passcode, salt, encoding: 'uint8-buffer' };

      eachPartDownload((payload) => {
        const encrypted = JSON.parse(payload.withJSON);
        options.iv = Encryptor.utils.decodeBase64(payload.iv);
        Encryptor.decrypt(encrypted.payload, options);
      });
    });

    test('decrypt, from JSON, reuse key', () => {
      const key = Encryptor.utils.generateKey(passcode, { salt });
      const options = { key, encoding: 'uint8-buffer' };

      eachPartDownload((payload) => {
        const encrypted = JSON.parse(payload.withJSON);
        options.iv = Encryptor.utils.decodeBase64(payload.iv);
        Encryptor.decrypt(encrypted.payload, options);
      });
    });
  });

}
else {
  test('empty', (done) => done());
}
