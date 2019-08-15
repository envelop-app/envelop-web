import PropTypes from 'prop-types';
import React, { Component } from "react";
import ReactDOM from "react-dom";
import Dialogs from '../lib/dialogs';
import MainDialogComponent from './main_dialog.jsx';

class DropZoneComponent extends Component {
  constructor() {
    super();
    this.state = { open: false, ...Dialogs.initState() };
    this.dropZoneRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('dragenter', () => {
      this.setState({ open: true });
    });
    const dropNode = this.dropZoneRef.current;
    dropNode.addEventListener('dragover', evt => evt.preventDefault());
    dropNode.addEventListener('dragleave', () => {
      this.setState({ open: false });
    });
    dropNode.addEventListener('drop', (evt) => {
      evt.preventDefault();

      const files = [];

      if (evt.dataTransfer.items) {
        for (let i = 0; i < evt.dataTransfer.items.length; i++) {
          if (evt.dataTransfer.items[i].kind === 'file') {
            files.push(evt.dataTransfer.items[i].getAsFile());
          }
        }
      }
      else {
        for (var i = 0; i < evt.dataTransfer.files.length; i++) {
          files.push(evt.dataTransfer.files[i]);
        }
      }

      const validations = files.map(file => this.ensureValidFile(file));

      Promise
        .all(validations)
        .then(() => this.props.onDroppedFile(files))
        .catch(() => {
          Dialogs.open((state) => this.setState(state), Dialogs.DIRECTORY);
        })
        .finally(() => this.setState({ open: false }))
    });
  }

  ensureValidFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (evt) => {
        resolve(evt.target.result);
      }

      reader.onerror = (evt) => {
        reject(evt.target.error);
      }

      reader.readAsArrayBuffer(file.slice(0, 1));
    });
  }

  render() {
    return (
      [
        <div
          key="drop-zone"
          ref={this.dropZoneRef}
          className={`ev-drop-zone ${this.state.open && 'ev-drop-zone--open'}`}
        >
          Drop files here
        </div>,
        <MainDialogComponent key="dialog" {...this.state.dialog} />
      ]
    );
  }
}

DropZoneComponent.propTypes = {
  onDroppedFile: PropTypes.func.isRequired
};

export default DropZoneComponent;
