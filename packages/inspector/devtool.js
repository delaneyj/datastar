console.log('devtool script started');
const extension = browser ? browser : chrome ? chrome : console.error('Not being run as extension');

function panelCreate (datastar) {
  if (datastar) {
    extension.devtools.panels.create(
      "Datastar Inspector",
      "/rocket.png",
      "/index.html"
    );
  }
};

const datastarExists = 'window.ds.plugins?.length';

if (browser) {
  browser.devtools.inspectedWindow.eval(datastarExists).then(panelCreate);
} else if (chrome) {
  chrome.devtools.inspectedWindow.eval(datastarExists, panelCreate);
}