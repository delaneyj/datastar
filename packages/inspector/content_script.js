console.log('content script started');
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
const port = extension.runtime.connect({name:"datastarDevToolsContentScript"});
port.postMessage({
  action: 'connect-dev'
});

globalThis.addEventListener("datastar-event", ((evt) => {
    const {el, ...ctx} = evt.detail.ctx;

    port.postMessage({action: 'message-dev', ...evt.detail, ctx: {...ctx, el: elemToSelector(el)}});
}));

function elemToSelector(elm) {
  if (!elm) return "null";

  if (elm instanceof Window) return "Window";
  if (elm instanceof Document) return "Document";

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
