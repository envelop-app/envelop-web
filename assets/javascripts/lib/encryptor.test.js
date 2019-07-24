import Encryptor from './encryptor';

describe('interoperability', () => {
  describe('128 bit, 5k iterations, SHA1', () => {
    const keyIterations = 5000;
    const hasher = Encryptor.hashers.SHA1;
    const keySize = 128;
    const commonOptions = { keyIterations, hasher, keySize };

    test('derived key matches', () => {
      const salt = 'envelop';
      const passcode = '1234567890';

      const options = { ...commonOptions, salt, encoding: 'base64' }
      const key = Encryptor.utils.generateKey(passcode, options);
      expect(key).toEqual('J487qP6vIrcZq7WAlPqvmg=='); });

    test('encrypted content matches', () => {
      const content = 'Lorem ipsum';
      const passcode = 'very_secure_password';
      const iv = Encryptor.utils.decodeBase64('YhgzuN+x+X0aWZ7P2pAsPw==');
      const salt = 'envelop';

      const options = { ...commonOptions, iv, passcode, salt, encoding: 'base64' }
      const result = Encryptor.encrypt(content, options);
      expect(result.payload).toEqual('yn/g2A98nyML3/4=');
    });

    test('decrypted content matches', () => {
      const encrypted = 'yn/g2A98nyML3/4=';
      const passcode = 'very_secure_password';
      const iv = Encryptor.utils.decodeBase64('YhgzuN+x+X0aWZ7P2pAsPw==');
      const salt = 'envelop';

      const options = { ...commonOptions, iv, passcode, salt, encoding: 'utf8' }
      const result = Encryptor.decrypt(encrypted, options);
      expect(result).toEqual('Lorem ipsum');
    });
  });

  describe('default: 256 bit, 10k iterations, SHA256', () => {
    test('derived key matches', () => {
      const salt = 'envelop';
      const passcode = '1234567890';

      const options = { salt, encoding: 'base64' }
      const key = Encryptor.utils.generateKey(passcode, options);
      expect(key).toEqual('UO5jyuBhLcLG2roF53OWtQzhdTInmVYgxvMn3egcXqA=');
    });

    test('encrypted content matches', () => {
      const content = 'Lorem ipsum';
      const passcode = 'very_secure_password';
      const iv = Encryptor.utils.decodeBase64('YhgzuN+x+X0aWZ7P2pAsPw==');
      const salt = 'envelop';

      const options = { iv, passcode, salt, encoding: 'base64' }
      const result = Encryptor.encrypt(content, options);
      expect(result.payload).toEqual('PnUqCSCgEV8FSGQ=');
    });

    test('decrypted content matches', () => {
      const encrypted = 'PnUqCSCgEV8FSGQ=';
      const passcode = 'very_secure_password';
      const iv = Encryptor.utils.decodeBase64('YhgzuN+x+X0aWZ7P2pAsPw==');
      const salt = 'envelop';

      const options = { iv, passcode, salt, encoding: 'utf8' };
      const result = Encryptor.decrypt(encrypted, options);
      expect(result).toEqual('Lorem ipsum');
    });
  });
})

test('encrypts and decripts JSON', () => {
  const object = { id: '123' };
  const passcode = 'hfskwi385015hfk4';

  // Encrypt
  const content = JSON.stringify(object);
  const encryptOptions = { passcode, salt: object.id, encoding: 'base64' };
  const encrypted = Encryptor.encrypt(content, encryptOptions);

  // Decrypt
  const iv = Encryptor.utils.decodeBase64(encrypted.iv);
  const decryptOptions = { passcode, iv, salt: object.id, encoding: 'utf8' };
  const decrypted = Encryptor.decrypt(encrypted.payload, decryptOptions);

  expect(decrypted).toEqual(JSON.stringify(object));
});

test('encrypts and decrypts typed arrays using base64 encoding', () => {
  const salt = '123';
  const passcode = 'hfskwi385015hfk4';
  const iv = Encryptor.utils.generateIv();
  const key = Encryptor.utils.generateKey(passcode, { salt });

  const myArray = new ArrayBuffer(128);
  const uint8View = new Uint8Array(myArray);
  for (var i=0; i< uint8View.length; i++) {
    uint8View[i] = i % 64;
  }

  // Encrypt
  const encryptOptions = { key, iv, encoding: 'base64' };
  const encrypted = Encryptor.encrypt(myArray, encryptOptions);

  // Decrypt
  const decryptOptions = { key, iv, encoding: 'uint8-buffer' };
  const decrypted = Encryptor.decrypt(encrypted.payload, decryptOptions);

  expect(new Uint8Array(myArray)).toEqual(new Uint8Array(decrypted));
});

test('encrypts and decrypts typed arrays with uint8 encoding', () => {
  const salt = '123';
  const passcode = 'hfskwi385015hfk4';
  const iv = Encryptor.utils.generateIv();
  const key = Encryptor.utils.generateKey(passcode, { salt });

  const buffer = new ArrayBuffer(128);
  const uint8View = new Uint8Array(buffer);
  for (var i=0; i< uint8View.length; i++) {
    uint8View[i] = i % 64;
  }

  // Encrypt
  const encryptOptions = {iv, key, encoding: 'uint8-buffer'};
  const encrypted = Encryptor.encrypt(buffer, encryptOptions);

  // Decrypt
  const decryptOptions = {iv, key, encoding: 'uint8-buffer'};
  const decrypted = Encryptor.decrypt(encrypted.payload, decryptOptions);

  expect(new Uint8Array(buffer)).toEqual(new Uint8Array(decrypted));
});
