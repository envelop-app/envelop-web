import React, { Component } from "react";
import ReactDOM from "react-dom";
import { MDCSnackbar } from '@material/snackbar';

const wrapper = document.querySelector('.js-toast-wrapper');

function unmountComponent() {
  ReactDOM.unmountComponentAtNode(wrapper);
}

class ToastComponent extends Component {
  constructor(props) {
    super(props);
    this.snackbarRef = React.createRef();
    this.snackbar = null;
  }
  componentDidMount() {
    this.snackbar = new MDCSnackbar(this.snackbarRef.current)
    this.snackbar.listen('MDCSnackbar:closed', () => {
      unmountComponent();
    });
    this.snackbar.open();
  }

  componentWillUnmount() {
    this.snackbar.destroy();
  }

  render() {
    return (
      <div className="mdc-snackbar" ref={this.snackbarRef}>
        <div className="mdc-snackbar__surface">
          <div className="mdc-snackbar__label" role="status" aria-live="polite">
            {this.props.text}
          </div>
        </div>
      </div>
    );
  }
}

const Toast = {
  open(text) {
    unmountComponent();
    ReactDOM.render(<ToastComponent text={text} />, wrapper);
  }
}

export default Toast;
