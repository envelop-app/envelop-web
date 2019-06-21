
function isProduction() {
 return process.env.NODE_ENV === 'production';
}

const Constants = {
  SHARE_ORIGIN: isProduction() ? 'https://envlp.app' : window.location.origin,
  BLOCKSTACK_REDIRECT_URI: isProduction() ? window.location.origin + '/app' : window.location.origin + '/app.html'
};

export default Constants;
