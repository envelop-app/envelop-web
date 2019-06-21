import { privateUserSession } from '../lib/blockstack_client';

const redirectURI = window.location.origin + '/app';

document.addEventListener("DOMContentLoaded", event => {
  const loginControlsNode = document.querySelector('.ev-login-controls');
  const loginBtn = document.querySelector('.ev-login-btn');
  const goToAppBtn = document.querySelector('.ev-go-to-app-btn');
  const logoutBtn = document.querySelector('.ev-logout-btn');

  if (window.location.href.indexOf('?dev') != -1) {
    loginControlsNode.classList.remove('hide');
  }

  loginBtn.addEventListener('click', event => {
    event.preventDefault();
    privateUserSession.redirectToSignIn(redirectURI);
  })

  logoutBtn.addEventListener('click', event => {
    event.preventDefault();
    privateUserSession.signUserOut();
    window.location = window.location.href;
  });

  if (privateUserSession.isUserSignedIn()) {
    goToAppBtn.classList.remove('hide');
    logoutBtn.classList.remove('hide');
  } else if (privateUserSession.isSignInPending()) {
    privateUserSession.handlePendingSignIn().then(userData => {
      window.location = redirectURI;
    });
  } else {
    loginBtn.classList.remove('hide');
  }
});
