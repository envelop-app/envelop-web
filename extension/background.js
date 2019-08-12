/* global chrome */

// TODO: https://github.com/mozilla/webextension-polyfill
// TODO: The following must be done in the app window:
// function(win) {
//   // Force window to not change size
//   win.onresize = function() {
//     console.log('resize');
//     win.resizeTo(width, height);
//   }
// }

chrome.browserAction.onClicked.addListener(function() {
  var height = 480;
  var width = 320;
  var screen = window.screen;
  var left = (screen.availLeft + (screen.availWidth / 2)) - (width / 2);
  var top = (screen.availTop + (screen.availHeight / 2)) - (height / 2);

  chrome.windows.create({
    url: 'https://envelop.app/',
    type: 'popup',
    height: parseInt(height),
    width: parseInt(width),
    left: parseInt(left),
    top: parseInt(top)
  });
});
