/* global chrome */

var url = 'http://localhost:3000';
// var url = 'https://envelop.app';

var currentWindowId = null;

function openWindow() {
  var height = 460;
  var width = 380;
  var screen = window.screen;
  var left = (screen.availLeft + (screen.availWidth / 2)) - (width / 2);
  var top = (screen.availTop + (screen.availHeight / 2)) - (height / 2);

  var options = {
    url: url + '/extension_app.html',
    type: 'popup',
    height: parseInt(height),
    width: parseInt(width),
    left: parseInt(left),
    top: parseInt(top)
  }

  browser.windows.create(options).then(function(newWindow) {
    currentWindowId = newWindow.id;
    focusWindow();
  });
}

function openOrFocusWindow() {
  if (!currentWindowId) {
    openWindow();
    return
  }

  browser.windows.getAll({}).then(function(windows) {
    var windowIds = windows.map(function(win) { return win.id });

    if (windowIds.indexOf(currentWindowId) > -1) {
      focusWindow();
    } else {
      openWindow();
    }
  });
}

function focusWindow() {
  browser.windows.update(currentWindowId, { focused: true });
}

browser.browserAction.onClicked.addListener(function() {
  openOrFocusWindow();
});
