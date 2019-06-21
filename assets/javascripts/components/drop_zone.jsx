import PropTypes from 'prop-types';
import React, { Component } from "react";
import ReactDOM from "react-dom";

class DropZoneComponent extends Component {
  constructor() {
    super();
    this.state = { open: false };
    this.dropZoneRef = React.createRef();
  }

  componentDidMount() {
    const that = this;

    window.addEventListener('dragenter', (evt) => {
      this.setState({ open: true });
    });
    const dropNode = this.dropZoneRef.current;
    dropNode.addEventListener('dragover', evt => evt.preventDefault());
    dropNode.addEventListener('dragleave', (evt) => {
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

      if (files.length === 1) {
        this.props.onDroppedFile(files[0]);
      }
      else if (files.length > 1) {
        const message = `
          Sorry, only single file uploads are supported at the moment.
          Please try again with one file at a time.
        `;
        window.alert(message);
      }

      this.setState({ open: false });
    });
  }

  render() {
    return (
      <div
        ref={this.dropZoneRef}
        className={`ev-drop-zone ${this.state.open && 'ev-drop-zone--open'}`}
      >
        Drop a file here
      </div>
    );
  }
}

DropZoneComponent.propTypes = {
  onDroppedFile: PropTypes.func.isRequired
};

export default DropZoneComponent;
