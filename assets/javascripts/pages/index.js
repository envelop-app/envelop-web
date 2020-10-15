import React from "react";
import ReactDOM from "react-dom";

import {
  authenticate,
  privateUserSession,
  publicUserSession
} from '../lib/blockstack_client';
import Constants from '../lib/constants'
import GaiaDocument from '../lib/gaia_document';
import LocalIndex from '../lib/local_index';
import Dialogs from '../lib/dialogs';

import Record from '../lib/records/record';
Record.config({ session: publicUserSession });

import HomepageUploaderComponent from '../components/homepage_uploader.jsx';

function mountComponents() {
  const homepageUploaderContainer = document.querySelector('.js-homepage-uploader-container');
  ReactDOM.render(<HomepageUploaderComponent />, homepageUploaderContainer);
}

function initAuthentication(loginBtn, goToAppBtn) {
  loginBtn.addEventListener('click', event => {
    event.preventDefault();
    console.log(Constants.BLOCKSTACK_REDIRECT_URI)
    authenticate();
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

    if (file.size === 0) {
      alert(Dialogs.EMPTY_FILE.title);
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
          console.log(Constants.BLOCKSTACK_REDIRECT_URI)
          authenticate();
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
    privateUserSession.handlePendingSignIn().then(() => {
      window.location = Constants.BLOCKSTACK_REDIRECT_URI;
    });
  } else {
    loginBtn.classList.remove('hide');
  }
});
