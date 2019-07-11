import React, { Component } from "react";
import ReactDOM from "react-dom";

const DELETE_CONFIRMATION = {
  acceptText: 'Delete',
  content: <p>Delete this file?</p>,
  dismissText: 'Cancel'
}

const MAXIMUM_FILE_SIZE = {
  title: 'File size over limit (25Mb)',
  acceptText: 'Ok, got it',
  content: <p>File size limit is <strong>25Mb</strong>, try again with a smaller file.</p>
}

const EMPTY_FILE = {
  title: "Empty file",
  acceptText: 'Ok, got it',
  content: <p>Sorry, you can't upload empty files.</p>
}

function initState() {
  return { dialog: {} };
}

function open(setState, dialogState, options = {}) {
  const state = Object.assign({}, dialogState, options);
  set(setState, 'open', state);
}

function set(setState, status, dialogState = {}) {
  if (status === 'open') {
    const openState = Object.assign(
      dialogState,
      { open: true, onClose: (() => set(setState, 'close'))}
    );
    setState({ dialog: openState });
  }
  else if (status === 'close') {
    setState({ dialog: {} });
  }
  else {
    throw("Missing argument 'status'")
  }
}

const Dialogs = {
  DELETE_CONFIRMATION,
  MAXIMUM_FILE_SIZE,
  EMPTY_FILE,
  initState,
  open
};

export default Dialogs;
