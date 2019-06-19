import React, { Component } from "react";
import ReactDOM from "react-dom";

class FileCardComponent extends Component {
  constructor() {
    super();
  }

  render() {
    const { name, size, date } = this.props;
    return (
      <div className="ev-file-card">
        <div className="ev-file-card__media">
          <img src="/images/default-avatar.png"/>
        </div>
        <div className="ev-file-card__body">
          <div className="ev-file-card__text-primary">{name}</div>
          <div className="ev-file-card__text-secondary">{size}</div>
          <div className="ev-file-card__text-tertiary">{date}</div>
        </div>
        <div className="ev-file-card__controls">
          <button className="ev-file-card__btn">copy link</button>
        </div>
      </div>
    );
  }
}

export default FileCardComponent;
