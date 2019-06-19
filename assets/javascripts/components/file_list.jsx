import React, { Component } from "react";
import ReactDOM from "react-dom";
import FileCardComponent from "./file_card.jsx"
import GaiaFile from '../lib/gaia_file'

class FileListComponent extends Component {
  constructor() {
    super();
    this.state = {
      files: [
        {
          name: 'My_Fileasdaa-sd-adas-das-dadasasd-.png',
          date: 'May 31, 11:45',
          size: '123 Kb'
        },
        {
          name: 'Sedond_File.png',
          date: 'May 31, 11:45',
          size: '44 Kb'
        },
        {
          name: 'Third_File.png',
          date: 'May 31, 11:45',
          size: '44 Kb'
        },
        {
          name: 'Third_Fe.png',
          date: 'May 31, 11:45',
          size: '44 Kb'
        },
        {
          name: 'Thd_File.png',
          date: 'May 31, 11:45',
          size: '44 Kb'
        }
      ]
    };
  }

  renderFiles() {
    return this.state.files.map(file => {
      return <FileCardComponent key={file.name} {...file} />;
    });
  }

  render() {
    return (
      <div className="ev-file-list">
        {this.renderFiles()}
      </div>
    );
  }
}

export default FileListComponent;
