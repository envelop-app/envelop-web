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

      this.props.onDroppedFile([...files]);
      this.setState({ open: false });
    });
  }

  render() {
    return (
      <div
        ref={this.dropZoneRef}
        className={`ev-drop-zone ${this.state.open && 'ev-drop-zone--open'}`}
      >
        Drop files here
      </div>
    );
  }
}

DropZoneComponent.propTypes = {
  onDroppedFile: PropTypes.func.isRequired
};

export default DropZoneComponent;
