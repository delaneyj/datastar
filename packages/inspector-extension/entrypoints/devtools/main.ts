browser.scripting.executeScript({
      target: {
        tabId:  browser.devtools.inspectedWindow.tabId,
        allFrames: true,
      },
      func: () => {
            return (window as any).ds.plugins?.length
      },
}).then(([{ result }]) => {
  if (result) {
     browser.devtools.panels.create(
      "Datastar Inspector",
      "icon/128.png",
      "devtools-panel.html"
    );
   }
});

