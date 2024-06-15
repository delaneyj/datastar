const port = browser.runtime.connect({name:"datastarDevToolsContentScript"});

globalThis.addEventListener("datastar-event", ((evt) => {
    const {el, ...ctx} = evt.detail.ctx;
    port.postMessage({action: 'message-dev', ...evt.detail, ctx: {...ctx, el: elemToSelector(el)}});
}));

function elemToSelector(elm) {
  if (!elm) return "null";

  if (elm.tagName === "BODY") return "BODY";
  const names = [];
  while (elm.parentElement && elm.tagName !== "BODY") {
    if (elm.id) {
      names.unshift("#" + elm.getAttribute("id")); // getAttribute, because `elm.id` could also return a child element with name "id"
      break; // Because ID should be unique, no more is needed. Remove the break, if you always want a full path.
    } else {
      let c = 1,
        e = elm;
      for (; e.previousElementSibling; e = e.previousElementSibling, c++);
      names.unshift(elm.tagName + ":nth-child(" + c + ")");
    }
    elm = elm.parentElement;
  }
  return names.join(">");
}
