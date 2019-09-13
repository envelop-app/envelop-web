import React from "react";
import ReactDOM from "react-dom";

import Constants from '../lib/constants';
import { privateUserSession } from '../lib/blockstack_client';

import ExtensionApp from '../components/extension_app.jsx'

import Record from '../lib/records/record';
Record.config({ session: privateUserSession });

function showContents() {
  const appNode = document.querySelector('.ev-extension-app');
  appNode.classList.remove('hide');

  const goToAppBtn = document.querySelector('.ev-extension-footer__icon');
  goToAppBtn.addEventListener('click', () => {
    window.open(Constants.BLOCKSTACK_REDIRECT_URI);
  });
}

function ensureUsernameExists() {
  if (!privateUserSession.loadUserData().username) {
    confirm("Your account is recent and it doesn't have its username available in the blockstack browser yet. Please try again later.");
    privateUserSession.signUserOut();
    window.location = window.location.origin;
  }
}

function mountComponents() {
  const appContainer = document.querySelector('.js-extension-app-container');
  ReactDOM.render(<ExtensionApp />, appContainer);
}

document.addEventListener("DOMContentLoaded", () => {
  if (privateUserSession.isUserSignedIn()) {
    ensureUsernameExists();
    showContents();
    mountComponents();
  } else if (privateUserSession.isSignInPending()) {
    privateUserSession.handlePendingSignIn().then(() => {
      window.location = window.location.href;
    });
  } else {
    window.location = window.location.origin + "/extension_login.html";
  }
});
