import {
  datastarEventName
} from "@sudodevnull/datastar";

import {
  sendDatastarInspectorEvent
} from "@sudodevnull/datastar-inspector";

export default defineContentScript({
  matches: ["*://*/*"],
  main() {
	// allows communication with other extension scripts
  	const port = browser.runtime.connect({name:"datastarDevToolsContentScript"});
	port.postMessage({
		action: 'connect-dev'
	});
	
	// Listen to datastar-events from the browser and redirect to the devtools
	globalThis.addEventListener(datastarEventName, ((evt) => {
	   if ('detail' in evt && typeof evt.detail === 'object') {
             port.postMessage({action: 'message-dev', ...evt.detail});
	   } else {
	     console.warn(`content script received datastar-event without detail param`, evt)
	   }
         }));

	// retransmit any messages from devtools as datastar-inspector events
	port.onMessage.addListener((evt) => {
		const { name, script } = evt;

		sendDatastarInspectorEvent(name, script);
	});
  },
});
