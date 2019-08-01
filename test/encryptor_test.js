import PolyfillEncryptor from '../assets/javascripts/lib/polyfill_encryptor';
import NativeEncryptor from '../assets/javascripts/lib/native_encryptor';

[PolyfillEncryptor, NativeEncryptor].forEach(encryptor => {
  describe(encryptor === PolyfillEncryptor ? 'PolyfillEncryptor' : 'NativeEncryptor', () => {

    describe('interoperability', () => {
      describe('128 bit, 5k iterations, SHA1', async () => {
        const keyIterations = 5000;
        const hasher = encryptor.hashers.SHA1;
        const keySize = 128;
        const commonOptions = { keyIterations, hasher, keySize };

        it('derived key matches', async () => {
          const salt = 'envelop';
          const passcode = '1234567890';

          const options = { ...commonOptions, salt, encoding: 'base64' }
          const key = await encryptor.utils.generateKey(passcode, options);
          expect(key).equal('J487qP6vIrcZq7WAlPqvmg=='); });

        it('encrypted content matches', async () => {
          const content = 'Lorem ipsum';
          const passcode = 'very_secure_password';
          const iv = encryptor.utils.decodeBase64('YhgzuN+x+X0aWZ7P2pAsPw==');
          const salt = 'envelop';

          const options = { ...commonOptions, iv, passcode, salt, encoding: 'base64' }
          const result = await encryptor.encrypt(content, options);
          expect(result.payload).equal('yn/g2A98nyML3/4=');
        });

        it('decrypted content matches', async () => {
          const encrypted = 'yn/g2A98nyML3/4=';
          const passcode = 'very_secure_password';
          const iv = encryptor.utils.decodeBase64('YhgzuN+x+X0aWZ7P2pAsPw==');
          const salt = 'envelop';

          const options = { ...commonOptions, iv, passcode, salt, encoding: 'utf8' }
          const result = await encryptor.decrypt(encrypted, options);
          expect(result).equal('Lorem ipsum');
        });
      });

      describe('default: 256 bit, 10k iterations, SHA256', () => {
        it('derived key matches', async () => {
          const salt = 'envelop';
          const passcode = '1234567890';

          const options = { salt, encoding: 'base64' }
          const key = await encryptor.utils.generateKey(passcode, options);
          expect(key).equal('UO5jyuBhLcLG2roF53OWtQzhdTInmVYgxvMn3egcXqA=');
        });

        it('encrypted content matches', async () => {
          const content = 'Lorem ipsum';
          const passcode = 'very_secure_password';
          const iv = encryptor.utils.decodeBase64('YhgzuN+x+X0aWZ7P2pAsPw==');
          const salt = 'envelop';

          const options = { iv, passcode, salt, encoding: 'base64' }
          const result = await encryptor.encrypt(content, options);
          expect(result.payload).equal('PnUqCSCgEV8FSGQ=');
        });

        it('decrypted content matches', async () => {
          const encrypted = 'PnUqCSCgEV8FSGQ=';
          const passcode = 'very_secure_password';
          const iv = encryptor.utils.decodeBase64('YhgzuN+x+X0aWZ7P2pAsPw==');
          const salt = 'envelop';

          const options = { iv, passcode, salt, encoding: 'utf8' };
          const result = await encryptor.decrypt(encrypted, options);
          expect(result).equal('Lorem ipsum');
        });
      });
    })

    it('encrypts and decrypts JSON', async () => {
      const object = { id: '123' };
      const passcode = 'hfskwi385015hfk4';

      // Encrypt
      const content = JSON.stringify(object);
      const encryptOptions = { passcode, salt: object.id, encoding: 'base64' };
      const encrypted = await encryptor.encrypt(content, encryptOptions);

      // Decrypt
      const iv = encryptor.utils.decodeBase64(encrypted.iv);
      const decryptOptions = { passcode, iv, salt: object.id, encoding: 'utf8' };
      const decrypted = await encryptor.decrypt(encrypted.payload, decryptOptions);

      expect(decrypted).equal(JSON.stringify(object));
    });

    it('encrypts and decrypts typed arrays using base64 encoding', async () => {
      const salt = '123';
      const passcode = 'hfskwi385015hfk4';
      const iv = encryptor.utils.generateIv();
      const key = await encryptor.utils.generateKey(passcode, { salt });

      const myArray = new ArrayBuffer(128);
      const uint8View = new Uint8Array(myArray);
      for (var i=0; i< uint8View.length; i++) {
        uint8View[i] = i % 64;
      }

      // Encrypt
      const encryptOptions = { key, iv, encoding: 'base64' };
      const encrypted = await encryptor.encrypt(myArray, encryptOptions);

      // Decrypt
      const decryptOptions = { key, iv, encoding: 'uint8-buffer' };
      const decrypted = await encryptor.decrypt(encrypted.payload, decryptOptions);

      expect(new Uint8Array(myArray)).to.deep.equal(new Uint8Array(decrypted));
    });

    it('encrypts and decrypts typed arrays with uint8 encoding', async () => {
      const salt = '123';
      const passcode = 'hfskwi385015hfk4';
      const iv = encryptor.utils.generateIv();
      const key = await encryptor.utils.generateKey(passcode, { salt });

      const buffer = new ArrayBuffer(128);
      const uint8View = new Uint8Array(buffer);
      for (var i=0; i< uint8View.length; i++) {
        uint8View[i] = i % 64;
      }

      // Encrypt
      const encryptOptions = {iv, key, encoding: 'uint8-buffer'};
      const encrypted = await encryptor.encrypt(buffer, encryptOptions);

      // Decrypt
      const decryptOptions = {iv, key, encoding: 'uint8-buffer'};
      const decrypted = await encryptor.decrypt(encrypted.payload, decryptOptions);

      expect(new Uint8Array(buffer)).to.deep.equal(new Uint8Array(decrypted));
    });

    it('decrypts with buffer key', async () => {
      const encrypted = 'PnUqCSCgEV8FSGQ=';
      const passcode = 'very_secure_password';
      const iv = encryptor.utils.decodeBase64('YhgzuN+x+X0aWZ7P2pAsPw==');
      const salt = 'envelop';
      let key = await encryptor.utils.generateKey(passcode, { salt, encoding: 'base64' });
      key = encryptor.utils.decodeBase64(key);

      const options = { iv, key, encoding: 'utf8' };
      const result = await encryptor.decrypt(encrypted, options);
      expect(result).equal('Lorem ipsum');
    });

  });
});
