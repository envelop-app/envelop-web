import crypto from 'crypto-js';
// import encoding from 'text-encoding';

import Encryptor from './encryptor';

describe('interoperability', () => {
  test('derived key matches', () => {
    const salt = 'envelop';
    const passcode = '1234567890';

    const options = { salt, encoding: 'base64' }
    const key = Encryptor.utils.generateKey(passcode, options);
    expect(key).toEqual('J487qP6vIrcZq7WAlPqvmg==');
  });

  test('encrypted content matches', () => {
    const content = 'Lorem ipsum';
    const passcode = 'very_secure_password';
    const iv = crypto.enc.Base64.parse('YhgzuN+x+X0aWZ7P2pAsPw==');
    const salt = 'envelop';

    const options = { iv, passcode, salt, encoding: 'base64' }
    const result = Encryptor.encrypt(content, options);
    expect(result.payload).toEqual('yn/g2A98nyML3/4=');
  });

  test('decrypted content matches', () => {
    const encrypted = 'yn/g2A98nyML3/4=';
    const passcode = 'very_secure_password';
    const iv = crypto.enc.Base64.parse('YhgzuN+x+X0aWZ7P2pAsPw==');
    const salt = 'envelop';

    const options = { iv, passcode, salt, encoding: 'utf8' };
    const result = Encryptor.decrypt(encrypted, options);
    expect(result).toEqual('Lorem ipsum');
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

test('encrypts and decripts ArrayBuffer', () => {
  // TODO
});
