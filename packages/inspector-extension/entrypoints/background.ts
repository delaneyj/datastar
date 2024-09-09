
const ports: Record<string, {dev: Runtime.Port, content: Runtime.Port}> = {};
 
export default defineBackground(() => {
  browser.runtime.onConnect.addListener((p) => {
    p.onMessage.addListener(async(m: unknown, s) => {
      const senderId = s.sender?.tab?.id;
      if (!(m && typeof m === 'object')) {
        console.error(`Message ${m} is not an object`)
        return
      }
      else if (!('action' in m && typeof m.action === 'string')) {
        console.error(`No action or wrong type in message ${m}`)
        return
      }

      switch(m.action) {
        case "connect-dev":
	   if (!('tabId' in m)) {
              console.error('No tabId in message', m)
	     return
            }
            if (!(typeof m.tabId === 'string')) {
              console.error('tabId should be a string', m)
	     return
	   }
            console.log(`connected to dev port on tab ${m.tabId}`);
            ports[m.tabId] = {dev: p, content: ports[m.tabId]?.content};
            break;
         case "connect-content":
            console.log(`connected to content script port on tab ${p.name}`);
	   if (senderId)
              ports[senderId] = {dev: ports[senderId]?.dev, content: p};
	   else console.error('sender with no tabId', s);
            break;
         case "message-dev":
            if (senderId) {
              console.log(`message from content to ${ports[senderId]?.dev?.name} `, m)
	     ports[senderId].dev.postMessage(m);
	   }
	   else console.error('sender with no tabId', s);
            break;
         case "message-content":
	   if (!('tabId' in m)) {
              console.error('No tabId in message', m)
	     return
            }
            if (!(typeof m.tabId === 'string')) {
              console.error('tabId should be a string', m)
	     return
	   }
            ports[m.tabId].content.postMessage(m);
            break;
         default:
            console.log(`browser got a message from ${p.name}`, m);
            break;
    }})
});
});
