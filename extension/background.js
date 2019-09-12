/* global chrome */

chrome.browserAction.onClicked.addListener(function() {
  var height = 420;
  var width = 320;
  var screen = window.screen;
  var left = (screen.availLeft + (screen.availWidth / 2)) - (width / 2);
  var top = (screen.availTop + (screen.availHeight / 2)) - (height / 2);

  chrome.windows.create({
    url: 'http://localhost:3000/extension_app.html',
    type: 'popup',
    height: parseInt(height),
    width: parseInt(width),
    left: parseInt(left),
    top: parseInt(top),
    focused: true
  });
});
