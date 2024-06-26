console.log('background script started');
const extension = browser ? browser : chrome ? chrome : console.error('Not being run as extension');
const ports = {};

function connected(p) {
    p.onMessage.addListener(async(m, s) => {
      switch(m.action) {
        case "connect-dev":
            console.log(`connected to dev port on tab ${m.tabId}`);
            ports[m.tabId] = {dev: p, content: ports[m.tabId]?.content};
            break;
         case "connect-content":
            console.log(`connected to content script port on tab ${p.name}`);
            ports[s.sender.tab.id] = {dev: ports[s.sender.tab.id]?.dev, content: p};
            break;
         case "message-dev":
            console.log(`message from content to ${ports[s.sender.tab.id]?.dev?.name} `, m)
            ports[s.sender.tab.id].dev.postMessage(m);
            break;
         case "message-content":
            ports[m.tabId].content.postMessage(m);
            break;
         default:
            console.log(`browser got a message from ${p.name}`, m);
            break;
    }})
}

extension.runtime.onConnect.addListener(
    connected
);

