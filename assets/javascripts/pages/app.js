import React from "react";
import ReactDOM from "react-dom";

import { privateUserSession } from '../lib/blockstack_client';

import App from '../components/app.jsx'
import AvatarComponent from '../components/avatar.jsx'

import Record from '../lib/records/record';
Record.config({ session: privateUserSession });

function ensureUsernameExists() {
  if (!privateUserSession.loadUserData().username) {
    confirm("Your account is recent and it doesn't have its username available in the blockstack browser yet. Please try again later.");
    privateUserSession.signUserOut();
    window.location = window.location.origin;
  }
}

function mountComponents() {
  const avatarContainer = document.querySelector('.js-navbar-user');
  ReactDOM.render(<AvatarComponent />, avatarContainer);

  const appContainer = document.querySelector('.js-app-container');
  ReactDOM.render(<App />, appContainer);
}

document.addEventListener("DOMContentLoaded", () => {
  if (privateUserSession.isUserSignedIn()) {
    ensureUsernameExists();
    mountComponents();
  } else if (privateUserSession.isSignInPending()) {
    privateUserSession.handlePendingSignIn().then(() => {
      window.location = window.location.href;
    });
  } else {
    window.location = window.location.origin;
  }
});

