const ports = {};

function connected(p) {
    p.onMessage.addListener((m) => {
        if ('tabId' in m) {
            ports[p.name] = {port: p, tab: m.tabId};
        } else if ('type' in m) {
            ports['datastarDevTools'].port.postMessage(m);
        }
    })
}

browser.runtime.onConnect.addListener(
    connected
);

