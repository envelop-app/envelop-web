import {MDCRipple} from '@material/ripple/index';

document.addEventListener("DOMContentLoaded", event => {
  const ripple = new MDCRipple(document.querySelector('.foo-button'));
  console.log("hello!");
});
