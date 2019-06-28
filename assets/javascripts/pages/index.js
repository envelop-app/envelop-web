import React from "react";
import ReactDOM from "react-dom";
import { privateUserSession } from '../lib/blockstack_client';
import Constants from '../lib/constants'
import HomepageUploaderComponent from '../components/homepage_uploader.jsx';

function mountComponents() {
  const homepageUploaderContainer = document.querySelector('.js-homepage-uploader-container');
  ReactDOM.render(<HomepageUploaderComponent />, homepageUploaderContainer);
}

document.addEventListener("DOMContentLoaded", event => {
  const loginControlsNode = document.querySelector('.ev-login-controls');
  const loginBtn = document.querySelector('.js-login-btn');
  const goToAppBtn = document.querySelector('.js-go-to-app-btn');
  const logoutBtn = document.querySelector('.js-logout-btn');

  mountComponents();

  function initAuthentication() {
    loginBtn.addEventListener('click', event => {
      event.preventDefault();
      privateUserSession.redirectToSignIn(Constants.BLOCKSTACK_REDIRECT_URI);
    })

    logoutBtn.addEventListener('click', event => {
      event.preventDefault();
      privateUserSession.signUserOut();
      window.location = window.location.href;
    });
  }

  initAuthentication();

  if (privateUserSession.isUserSignedIn()) {
    goToAppBtn.classList.remove('hide');
    logoutBtn.classList.remove('hide');
  } else if (privateUserSession.isSignInPending()) {
    privateUserSession.handlePendingSignIn().then(userData => {
      window.location = Constants.BLOCKSTACK_REDIRECT_URI;
    });
  } else {
    loginBtn.classList.remove('hide');
  }
});
