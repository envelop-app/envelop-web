import { detect as detectBrowser } from 'detect-browser';

import NativeEncryptor from './native_encryptor';
import PolyfillEncryptor from './polyfill_encryptor';

let _window;
let worker;
let browser = detectBrowser();

if (typeof window === 'undefined') {
  _window = self;
  worker = true;
}
else {
  _window = window;
  worker = false;
}

let Encryptor;

if (browser && browser.name === 'ie') {
  Encryptor = PolyfillEncryptor;
}
else if (browser && browser.name === 'edge' && worker) {
  Encryptor = PolyfillEncryptor;
}
else if (_window.crypto && _window.crypto.subtle || _window.webkitSubtle) {
  Encryptor = NativeEncryptor;
}
else {
  Encryptor = PolyfillEncryptor;
}

export default Encryptor;
