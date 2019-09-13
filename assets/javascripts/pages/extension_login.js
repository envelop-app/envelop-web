import {
  privateUserSession,
  publicUserSession
} from '../lib/blockstack_client';
import Constants from '../lib/constants'

import Record from '../lib/records/record';
Record.config({ session: publicUserSession });

function initAuthentication(loginBtn) {
  loginBtn.addEventListener('click', event => {
    event.preventDefault();
    privateUserSession.redirectToSignIn(Constants.BLOCKSTACK_EXTENSION_REDIRECT_URI);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector('.js-login-btn');

  initAuthentication(loginBtn);

  // if (privateUserSession.isUserSignedIn()) {
  //   window.location = Constants.BLOCKSTACK_REDIRECT_URI;
  // } else if (privateUserSession.isSignInPending()) {
  //   privateUserSession.handlePendingSignIn().then(() => {
  //     window.location = Constants.BLOCKSTACK_REDIRECT_URI;
  //   });
  // } else {
  //   loginBtn.classList.remove('hide');
  // }
});
