import React from "react";
import ReactDOM from "react-dom";

import { privateUserSession } from '../lib/blockstack_client';
import Constants from '../lib/constants'
import GaiaDocument from '../lib/gaia_document';
import LocalIndex from '../lib/local_index';
import Dialogs from '../lib/dialogs';

import HomepageUploaderComponent from '../components/homepage_uploader.jsx';

function mountComponents() {
  const homepageUploaderContainer = document.querySelector('.js-homepage-uploader-container');
  ReactDOM.render(<HomepageUploaderComponent />, homepageUploaderContainer);
}

function initAuthentication(loginBtn, goToAppBtn) {
  loginBtn.addEventListener('click', event => {
    event.preventDefault();
    privateUserSession.redirectToSignIn(Constants.BLOCKSTACK_REDIRECT_URI);
  })

  goToAppBtn.addEventListener('click', event => {
    event.preventDefault();
    window.location = window.location.origin + '/app';
  })
}

function initUploadInput(inputElement) {
  inputElement.addEventListener('change', event => {
    const file = event.target.files[0];

    if (file.size > Constants.FILE_SIZE_LIMIT) {
      alert(Dialogs.MAXIMUM_FILE_SIZE.title);
      return;
    }

    const gaiaDocument = GaiaDocument.fromFile(file);
    const localIndex = new LocalIndex();
    localIndex
      .setTempDocuments([gaiaDocument])
      .then(() => {
        if (privateUserSession.isUserSignedIn()) {
          window.location = Constants.BLOCKSTACK_REDIRECT_URI;
        }
        else {
          privateUserSession.redirectToSignIn(Constants.BLOCKSTACK_REDIRECT_URI);
        }
      });
  });
}


document.addEventListener("DOMContentLoaded", event => {
  const loginBtn = document.querySelector('.js-login-btn');
  const goToAppBtn = document.querySelector('.js-go-to-app-btn');
  const uploadInput = document.querySelector('.js-upload-input');

  mountComponents();
  initAuthentication(loginBtn, goToAppBtn);
  initUploadInput(uploadInput);

  if (privateUserSession.isUserSignedIn()) {
    goToAppBtn.classList.remove('hide');
  } else if (privateUserSession.isSignInPending()) {
    privateUserSession.handlePendingSignIn().then(userData => {
      window.location = Constants.BLOCKSTACK_REDIRECT_URI;
    });
  } else {
    loginBtn.classList.remove('hide');
  }
});
