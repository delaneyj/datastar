console.log('devtool script started');
const getExtension = () => {
  try {
  // @ts-ignore
    if (browser) return browser
  } catch (_) {
    //do nothing
  }

  try {
  // @ts-ignore
    if (chrome) return chrome
  } catch (_) {
    return false
  }
}
const extension = getExtension();
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