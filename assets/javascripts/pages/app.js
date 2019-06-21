import React from "react";
import ReactDOM from "react-dom";
import DocumentListComponent from '../components/document_list.jsx'
import AvatarComponent from '../components/avatar.jsx'
import FileInputUploader from '../lib/file_input_uploader'
import { privateUserSession } from '../lib/blockstack_client';

function showUploadInput() {
  const input = document.querySelector('.js-file-input');

  new FileInputUploader(input)
    .bind()
    .then(() => window.location = window.location.href);
}

function mountComponents() {
  const avatarContainer = document.querySelector('.js-navbar-user');
  ReactDOM.render(<AvatarComponent />, avatarContainer);

  const documentListContainer = document.querySelector('.js-document-list-container');
  ReactDOM.render(<DocumentListComponent />, documentListContainer);
}

document.addEventListener("DOMContentLoaded", () => {
  if (privateUserSession.isUserSignedIn()) {
    showUploadInput();
    mountComponents();
  } else if (privateUserSession.isSignInPending()) {
    privateUserSession.handlePendingSignIn().then(userData => {
      window.location = window.location.href;
    });
  } else {
    window.location = window.location.origin;
  }
});

