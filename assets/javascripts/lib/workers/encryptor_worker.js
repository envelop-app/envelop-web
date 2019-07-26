import Encryptor from '../encryptor';

/* All background workloads must be denfined in this file.
 *
 * The issue mentioned below prevents us from defining multiple works
 * so we are left to use this file to define all background workloads
 * until it is resolved.
 *
 * Right now there's only Encryptor and Decryptor, so I'm not up to
 * abstract this worker file definition to a more generic service.
 *
 * => https://github.com/GoogleChromeLabs/worker-plugin/issues/24
 *
 */

self.onmessage = function(message) {
  switch (message.data.type) {
    case 'decrypt':
      decrypt(message)
      break;
    case 'encrypt':
      encrypt(message)
      break;
    default:
      throw "Unknown or missing worker `type`"
  }
}

function decrypt(message) {
  const iv = Encryptor.utils.decodeBase64(message.data.iv);
  const key = Encryptor.utils.decodeBase64(message.data.key);

  const decryptOptions = { iv, key, encoding: 'uint8-buffer' };
  let decrypted = Encryptor.decrypt(message.data.contents, decryptOptions);

  let response = { buffer: decrypted };
  self.postMessage(response, [decrypted]);

  delete message.data.contents;
  message = null;

  delete response.buffer;
  response = null;

  delete decrypted.payload;
  decrypted = null;
}

function encrypt(message) {
  const iv = Encryptor.utils.decodeBase64(message.data.iv);
  const key = Encryptor.utils.decodeBase64(message.data.key);

  const encryptOptions = { iv, key, encoding: 'uint8-buffer' };
  let encrypted = Encryptor.encrypt(message.data.contents, encryptOptions);

  let response = { buffer: encrypted.payload };
  self.postMessage(response, [encrypted.payload]);

  delete message.data.contents;
  message = null;

  delete response.buffer;
  response = null;

  delete encrypted.payload;
  encrypted = null;
}
