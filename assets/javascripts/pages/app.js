import React from "react";
import ReactDOM from "react-dom";

import { privateUserSession } from '../lib/blockstack_client';

import App from '../components/app.jsx'
import AvatarComponent from '../components/avatar.jsx'

function mountComponents() {
  const avatarContainer = document.querySelector('.js-navbar-user');
  ReactDOM.render(<AvatarComponent />, avatarContainer);

  const appContainer = document.querySelector('.js-app-container');
  ReactDOM.render(<App />, appContainer);
}

document.addEventListener("DOMContentLoaded", () => {
  if (privateUserSession.isUserSignedIn()) {
    mountComponents();
  } else if (privateUserSession.isSignInPending()) {
    privateUserSession.handlePendingSignIn().then(userData => {
      window.location = window.location.href;
    });
  } else {
    window.location = window.location.origin;
  }
});

