import Encryptor from '../encryptor';

self.onmessage = function(message) {
  const iv = Encryptor.utils.decodeBase64(message.data.iv);
  const key = Encryptor.utils.decodeBase64(message.data.key);
  // const key = message.data.key // || deriveKey(message.data);

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
