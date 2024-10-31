# Hypermedia, lost knowledge and H.A.T.E.O.A.S.

The rise of the frontend framework wars makes sense.  When compared with full page reloads, the ability to update only the parts of the page that need to change is a huge win.  However, the way this is done is often at odds with the declarative nature of HTML.  This has led to a lot of lost knowledge and a lot of confusion. When your application logic lives in both browser and backend your synchronization state is in constant flux.

One of the biggest loses of knowledge is the concept of hypermedia.  Hypermedia is the idea that the web is a set resources that are interconnected.  This is the basis of the web and the reason it has been so successful.  However, the rise of the frontend framework wars has led to a lot of confusion about how to use hypermedia.  This is where H.A.T.E.O.A.S. comes in.

## Hypermedia as the Engine of Application State (H.A.T.E.O.A.S.)
Browsers don't care about your application, they care about the rendering hypermedia.  For example if you have a bank website you can go to the home page and then click on a link to go to the login page, only then are valid links to your accounts available.  This has huge benefits.
1.  Each interaction fuels the valid next state.
2.  When implemented correctly this means the backend is where all your logic lives, leading to no client side routers, validation, etc.
3.  HTML can be generated in any language.

## Hypermedia on whatever you Like (HOWL)

[Carson Gross](https://hypermedia.systems/) coined the term [HOWL stack](https://htmx.org/essays/hypermedia-on-whatever-youd-like/) which is really just getting back to the roots of the web.  People make fun of HTML not being a real language, but it's a wonderful way of exchanging interconnect assets.  The HOWL stack is about leveraging the web's capabilities and with just a thin set of shims make it as powerful as any SPA framework.  This is the basis of Datastar.
