import {
  publicUserSession,
  extensionAuthOptions
} from '../lib/blockstack_client';

import Record from '../lib/records/record';
import { showBlockstackConnect } from '@blockstack/connect';
Record.config({ session: publicUserSession });

function initAuthentication(loginBtn) {
  loginBtn.addEventListener('click', event => {
    event.preventDefault();
    showBlockstackConnect(extensionAuthOptions);
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
