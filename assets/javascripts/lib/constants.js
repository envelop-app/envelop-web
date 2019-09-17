function isPreview() {
 return __PREVIEW__;
}

function isProduction() {
 return process.env.NODE_ENV === 'production';
}

let _window;

// Web Workers don't have access to the `window` context
if (typeof window === 'undefined') {
  _window = { location: { origin: 'https://envelop.app' } }
}
else {
  _window = window;
}

let BLOCKSTACK_ORIGIN = _window.location.origin;
let SHARE_URI = _window.location.origin + '/d';
if (isProduction() && !isPreview()) {
  BLOCKSTACK_ORIGIN = 'https://envelop.app';
  SHARE_URI = 'https://envl.app';
}

function redirectUri(suffix) {
  return BLOCKSTACK_ORIGIN + suffix;
}

const Constants = {
  BLOCKSTACK_ORIGIN: BLOCKSTACK_ORIGIN,
  BLOCKSTACK_REDIRECT_URI: isProduction() ? redirectUri('/app') : redirectUri('/app.html'),
  BLOCKSTACK_EXTENSION_REDIRECT_URI: isProduction() ? redirectUri('/extension_app') : redirectUri('/extension_app.html'),
  SHARE_URI: SHARE_URI,
  PREVIEW: __PREVIEW__,
  FILE_SIZE_LIMIT: Infinity,
  FILE_PART_SIZE: 9 * (10 ** 6), // 9 MB
  DOWNLOAD_FILE_REFRESH: 10 * 1000, // 10 seconds,
  KEY_ITERATIONS: 10000,
  KEY_SIZE: 256,
  SINGLE_FILE_SIZE_LIMIT: 9 * (10 ** 6), // 9 MB
  TEMP_DOCUMENTS_PREFIX: 'tempDocuments',
  FEEDBACK_URL: 'mailto:feedback@envelop.app?subject=Envelop Feedback'
};

export default Constants;
