export default defineContentScript({
  matches: ["*://*/*"],
  main() {
  	const port = browser.runtime.connect({name:"datastarDevToolsContentScript"});
	port.postMessage({
		action: 'connect-dev'
	});

	globalThis.addEventListener("datastar-event", ((evt) => {
           port.postMessage({action: 'message-dev', ...evt.detail});
         }));
  },
});
