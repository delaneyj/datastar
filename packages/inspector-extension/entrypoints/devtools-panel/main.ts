import {
  datastarEventName,
  sendDatastarEvent
} from "@sudodevnull/datastar";

import "@sudodevnull/datastar-inspector";

// create connection to browser runtime
const port = browser.runtime.connect({name:"datastarDevTools"});
port.postMessage({tabId: browser.devtools.inspectedWindow.tabId, action: 'connect-dev'});

// retransmit any messages as datastar events
port.onMessage.addListener((evt) => {
  const { action, time, category, subcategory, type, target, message } = evt;

  sendDatastarEvent(category, subcategory, type, target, message);
});

