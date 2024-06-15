browser.devtools.inspectedWindow.eval('window.ds.plugins?.length').then((datastar) => {
  if (datastar) {
    browser.devtools.panels.create(
      "Datastar Inspector",
      "/rocket.png",
      "/index.html"
    );
  }
});

