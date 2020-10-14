import { extensionAuthenticate, publicUserSession } from '../lib/blockstack_client';

import Record from '../lib/records/record';
Record.config({ session: publicUserSession });

function initAuthentication(loginBtn) {
  loginBtn.addEventListener('click', event => {
    event.preventDefault();
    extensionAuthenticate();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector('.js-login-btn');

  initAuthentication(loginBtn);
});
