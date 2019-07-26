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
 *
 * Also, we had to fork worker-plugin because it was generating
 * names like 0.worker.js for worker files after build, even in production,
 * and we have to introduct some kind of cache bust mechanis such as
 * the one we are using in Middleman (ex: common-876r5.js).
 *
 * The strategy is:
 *
 * - worker files are now generated with random string prefixes (such
 *   as 0ifd3.worker.js), which has to be done in the fork of worker-plugin
 *   we are now maintaining. Worker files, specifically, cannot have suffixes
 *   put by Middleman because they have to be referenced in the JS code,
 *   and final build pathnames are not known at that point.
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
