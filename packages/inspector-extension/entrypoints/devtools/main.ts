browser.devtools.panels.create(
  "Datastar",
  "icon/128.png",
  "devtools-panel.html"
);

browser.devtools.panels.elements.createSidebarPane("Datastar").then((pane) => {
  pane.setPage("devtools-pane.html");
});

debugger;
