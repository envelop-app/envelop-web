function isPreview() {
 return process.env.PREVIEW === 'yes';
}

function isProduction() {
 return process.env.NODE_ENV === 'production';
}

let BLOCKSTACK_ORIGIN = window.location.origin;
// TODO: Fix preview environment
// if (isProduction() && !isPreview()) {
//   BLOCKSTACK_ORIGIN = 'https://envelop.app';
// }
// else {
//   BLOCKSTACK_ORIGIN = window.location.origin;
// }

function redirectUri(suffix) {
  return BLOCKSTACK_ORIGIN + suffix;
}

const Constants = {
  BLOCKSTACK_ORIGIN: BLOCKSTACK_ORIGIN,
  BLOCKSTACK_REDIRECT_URI: isProduction() ? redirectUri('/app') : redirectUri('/app.html'),
  SHARE_ORIGIN: isProduction() ? 'https://envlp.app' : window.location.origin,
  ENV: process.env.NODE_ENV
};

export default Constants;
