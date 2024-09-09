import {
  sendDatastarEvent
} from "@sudodevnull/datastar";

import { datastarInspectorEvtName } from "@sudodevnull/datastar-inspector";

// create connection to browser runtime
const port = browser.runtime.connect({name:"datastarDevTools"});
port.postMessage({tabId: browser.devtools.inspectedWindow.tabId, action: 'connect-dev'});

// retransmit any messages from content script as datastar events
port.onMessage.addListener((evt) => {
  const { category, subcategory, type, target, message } = evt;

  sendDatastarEvent(category, subcategory, type, target, message);
});

// listen for inspector events and retransmit to content script
addEventListener(datastarInspectorEvtName, (evt) => {
	   if ('detail' in evt && typeof evt.detail === 'object') {
             port.postMessage({action: 'message-content', ...evt.detail});
	   } else {
	     console.warn(`devtools-panel script received datastar-inspector-event without detail param`, evt)
	   }
});