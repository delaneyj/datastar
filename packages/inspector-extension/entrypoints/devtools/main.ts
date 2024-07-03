const datastarExists = 'window.ds.plugins?.length';

 browser.devtools.inspectedWindow.eval(datastarExists).then((results) => {
   if (results) {
     browser.devtools.panels.create(
      "Datastar Inspector",
      "icon/128.png",
      "devtools-panel.html"
    );
   }
 });
