"use strict";(()=>{var L="datastar",Ae="datastar-event",Fe="Datastar-Request";var We="type module";var k={Morph:"morph",Inner:"inner",Outer:"outer",Prepend:"prepend",Append:"append",Before:"before",After:"after",UpsertAttributes:"upsertAttributes"},$e=k.Morph,I={MergeFragments:"datastar-merge-fragments",MergeSignals:"datastar-merge-signals",RemoveFragments:"datastar-remove-fragments",RemoveSignals:"datastar-remove-signals",ExecuteScript:"datastar-execute-script"};var G=t=>{let e=new Error;return e.name=`${L}${t}`,e},g=G(400),Z=G(409),F=G(404),U=G(403),ie=G(405),Be=G(503);async function Ue(t,e){let n=t.getReader(),r;for(;!(r=await n.read()).done;)e(r.value)}function Ke(t){let e,n,r,o=!1;return function(i){e===void 0?(e=i,n=0,r=-1):e=Qt(e,i);let a=e.length,c=0;for(;n<a;){o&&(e[n]===10&&(c=++n),o=!1);let m=-1;for(;n<a&&m===-1;++n)switch(e[n]){case 58:r===-1&&(r=n-c);break;case 13:o=!0;case 10:m=n;break}if(m===-1)break;t(e.subarray(c,m),r),c=n,r=-1}c===a?e=void 0:c!==0&&(e=e.subarray(c),n-=c)}}function qe(t,e,n){let r=Ge(),o=new TextDecoder;return function(i,a){if(i.length===0)n?.(r),r=Ge();else if(a>0){let c=o.decode(i.subarray(0,a)),m=a+(i[a+1]===32?2:1),u=o.decode(i.subarray(m));switch(c){case"data":r.data=r.data?r.data+`
`+u:u;break;case"event":r.event=u;break;case"id":t(r.id=u);break;case"retry":let l=parseInt(u,10);isNaN(l)||e(r.retry=l);break}}}}function Qt(t,e){let n=new Uint8Array(t.length+e.length);return n.set(t),n.set(e,t.length),n}function Ge(){return{data:"",event:"",id:"",retry:void 0}}var Je="text/event-stream",en=1e3,je="last-event-id";function _e(t,{signal:e,headers:n,onopen:r,onmessage:o,onclose:s,onerror:i,openWhenHidden:a,fetch:c,retryScaler:m=2,retryMaxWaitMs:u=3e4,retryMaxCount:l=10,...f}){return new Promise((d,x)=>{let S=0,y={...n};y.accept||(y.accept=Je);let A;function N(){A.abort(),document.hidden||P()}a||document.addEventListener("visibilitychange",N);let p=en,M=0;function _(){document.removeEventListener("visibilitychange",N),window.clearTimeout(M),A.abort()}e?.addEventListener("abort",()=>{_(),d()});let h=c??window.fetch,b=r??function(){};async function P(){A=new AbortController;try{let T=await h(t,{...f,headers:y,signal:A.signal});await b(T),await Ue(T.body,Ke(qe(R=>{R?y[je]=R:delete y[je]},R=>{p=R},o))),s?.(),_(),d()}catch(T){if(!A.signal.aborted)try{let R=i?.(T)??p;window.clearTimeout(M),M=window.setTimeout(P,R),p*=m,p=Math.min(p,u),S++,S>=l?(_(),x(Be)):console.error(`Datastar failed to reach ${f.method}:${t.toString()} retry in ${R}ms`)}catch(R){_(),x(R)}}}P()})}var K=`${L}-sse`,Te=`${L}-settling`,W=`${L}-swapping`,ae="started",le="finished";function D(t,e){document.addEventListener(K,n=>{if(n.detail.type!=t)return;let{argsRaw:r}=n.detail;e(r)})}var Ye=t=>`${t}`.includes("text/event-stream");function we(t,e){document.dispatchEvent(new CustomEvent(K,{detail:{type:t,argsRaw:e}}))}function C(t){return async(e,n,r)=>{if(!n?.length)throw g;let o=r?.onlyRemoteSignals??!0,s=Object.assign({"Content-Type":"application/json",[Fe]:!0},r?.headers),{signals:i,el:{id:a}}=e,c=i.JSON(!1,o);we(ae,{elID:a});let m=new URL(n,window.location.origin);t=t.toUpperCase();let u={method:t,headers:s,onmessage:l=>{if(!l.event.startsWith(L))return;let f=l.event,d={},x=l.data.split(`
`);for(let y of x){let A=y.indexOf(" "),N=y.slice(0,A),p=d[N];p||(p=[],d[N]=p);let M=y.slice(A+1).trim();p.push(M)}let S={};for(let[y,A]of Object.entries(d))S[y]=A.join(`
`);we(f,S)},onerror:l=>{if(Ye(l))throw l;l&&console.error(l.message)},onclose:()=>{we(le,{elID:a})}};if(t==="GET"){let l=new URLSearchParams(m.search);l.append(L,c),m.search=l.toString()}else u.body=c;try{let l=m.toString();await _e(l,u)}catch(l){if(!Ye(l))throw l}}}var Yn={type:3,name:"delete",fn:C("delete")};var Qn={type:3,name:"get",fn:C("get")};var rr={type:3,name:"patch",fn:C("patch")};var ar={type:3,name:"post",fn:C("post")};var fr={type:3,name:"put",fn:C("put")};var Ar={type:3,name:"clipboard",fn:(t,e)=>{if(!navigator.clipboard)throw U;navigator.clipboard.writeText(e)}};var Rr={type:3,name:"setAll",fn:(t,e,n)=>{let r=new RegExp(e);t.signals.walk((o,s)=>r.test(o)&&(s.value=n))}};var Nr={type:3,name:"toggleAll",fn:(t,e)=>{let n=new RegExp(e);t.signals.walk((r,o)=>n.test(r)&&(o.value=!o.value))}};var Or={type:3,name:"clampFit",fn:(t,e,n,r,o,s)=>Math.max(o,Math.min(s,(e-n)/(r-n)*(s-o)+o))};var Fr={type:3,name:"clampFitInt",fn:(t,e,n,r,o,s)=>Math.round(Math.max(o,Math.min(s,(e-n)/(r-n)*(s-o)+o)))};var Br={type:3,name:"fit",fn:(t,e,n,r,o,s)=>(e-n)/(r-n)*(s-o)+o};var Kr={type:3,name:"fitInt",fn:(t,e,n,r,o,s)=>Math.round((e-n)/(r-n)*(s-o)+o)};var tn=`${L}-indicator`,ao=`${tn}-loading`,lo={type:1,name:"indicator",noKey:!0,onLoad:t=>{let{value:e,signals:n,el:r}=t,o=n.upsert(e,!1),s=i=>{let{type:a,argsRaw:{elID:c}}=i.detail;if(c===r.id)switch(a){case ae:o.value=!0;break;case le:o.value=!1;break}};return document.addEventListener(K,s),()=>{document.removeEventListener(K,s)}}};var ze={type:1,name:"computed",mustKey:!0,onLoad:t=>{let{signals:e,key:n,expr:r,reactivity:{computed:o}}=t,s=o(()=>r(t));return e.add(n,s),()=>{e.remove(n)}}};var Ze="ifmissing",Xe={type:1,name:"mergeSignals",onlyMods:new Set([Ze]),onLoad:t=>{let{el:e,expr:n,mods:r}=t,o=n(t);t.signals.merge(o,r.has(Ze)),delete e.dataset[t.rawKey]}};var Qe={type:1,name:"star",onLoad:()=>{alert("YOU ARE PROBABLY OVERCOMPLICATING IT")}};var ue=t=>t.replace(/[A-Z]+(?![a-z])|[A-Z]/g,(e,n)=>(n?"-":"")+e.toLowerCase()),V=t=>t.trim()==="true";var nn=/^data:(?<mime>[^;]+);base64,(?<contents>.*)$/,et=["change","input","keydown"],Ro={type:1,name:"bind",onLoad:t=>{let{el:e,value:n,expr:r,key:o,signals:s,reactivity:{effect:i}}=t,a=()=>{},c=()=>{},m=o==="";if(m){let l=n;if(typeof l!="string")throw new Error("Invalid expression");if(l.includes("$"))throw new Error("Not an expression");let f=e.tagName.toLowerCase(),d="",x=f.includes("input"),S=e.getAttribute("type"),y=f.includes("checkbox")||x&&S==="checkbox";y&&(d=!1),x&&S==="number"&&(d=0);let N=f.includes("select"),p=f.includes("radio")||x&&S==="radio",M=x&&S==="file";p&&(e.getAttribute("name")?.length||e.setAttribute("name",l)),s.upsert(l,d),a=()=>{let _="value"in e,h=s.value(l),b=`${h}`;if(y||p){let P=e;y?P.checked=!h||h==="true":p&&(P.checked=b===P.value)}else if(!M)if(N){let P=e;P.multiple?Array.from(P.options).forEach(T=>{T?.disabled||(Array.isArray(h)||typeof h=="string"?T.selected=h.includes(T.value):typeof h=="number"?T.selected=h===Number(T.value):T.selected=h)}):P.value=b}else _?e.value=b:e.setAttribute("value",b)},c=async()=>{if(M){let b=[...e?.files||[]],P=[],T=[],R=[];await Promise.all(b.map(He=>new Promise(Xt=>{let z=new FileReader;z.onload=()=>{if(typeof z.result!="string")throw g;let Se=z.result.match(nn);if(!Se?.groups)throw g;P.push(Se.groups.contents),T.push(Se.groups.mime),R.push(He.name)},z.onloadend=()=>Xt(void 0),z.readAsDataURL(He)}))),s.set(l,P);let se=`${l}Mimes`,Ve=`${l}Names`;se in s&&s.upsert(se,T),Ve in s&&s.upsert(Ve,R);return}let _=s.value(l),h=e||e;if(typeof _=="number"){let b=Number(h.value||h.getAttribute("value"));s.set(l,b)}else if(typeof _=="string"){let b=h.value||h.getAttribute("value")||"";s.set(l,b)}else if(typeof _=="boolean")if(y){let b=h.checked||h.getAttribute("checked")==="true";s.set(l,b)}else{let b=!!(h.value||h.getAttribute("value"));s.set(l,b)}else if(!(typeof _>"u"))if(Array.isArray(_)){if(N){let T=[...e.selectedOptions].filter(R=>R.selected).map(R=>R.value);s.set(l,T)}else{let b=JSON.stringify(h.value.split(","));s.set(l,b)}console.log(h.value)}else throw ie}}else{let l=ue(o);a=()=>{let f=r(t),d;typeof f=="string"?d=f:d=JSON.stringify(f),!d||d==="false"||d==="null"||d==="undefined"?e.removeAttribute(l):e.setAttribute(l,d)}}m&&et.forEach(l=>{e.addEventListener(l,c)});let u=i(async()=>{a()});return()=>{u(),m&&et.forEach(l=>{e.removeEventListener(l,c)})}}};var No={type:1,name:"class",noKey:!0,mustValue:!0,onLoad:t=>t.reactivity.effect(()=>{let e=t.expr(t);for(let[n,r]of Object.entries(e)){let o=n.split(" ");r?t.el.classList.add(...o):t.el.classList.remove(...o)}})};function xe(t){if(!t||t?.length===0)return 0;for(let e of t){if(e.endsWith("ms"))return Number(e.replace("ms",""));if(e.endsWith("s"))return Number(e.replace("s",""))*1e3;try{return parseFloat(e)}catch{}}return 0}function X(t,e,n=!1){return t?t.includes(e)||n:!1}function tt(t,e,n=!1,r=!0){let o=-1,s=()=>o&&clearTimeout(o);return function(...a){s(),n&&!o&&t(...a),o=setTimeout(()=>{r&&t(...a),s()},e)}}function nt(t,e,n=!0,r=!1){let o=!1;return function(...i){o||(n&&t(...i),o=!0,setTimeout(()=>{o=!1,r&&t(...i)},e))}}var rn=new Set(["window","once","passive","capture","debounce","throttle","remote","outside"]),rt="",Fo={type:1,name:"on",mustKey:!0,mustValue:!0,argNames:["evt"],onLoad:t=>{let{el:e,key:n,expr:r}=t,o=t.el;t.mods.get("window")&&(o=window);let s=l=>{r(t,l)},i=t.mods.get("debounce");if(i){let l=xe(i),f=X(i,"leading",!1),d=X(i,"noTrail",!0);s=tt(s,l,f,d)}let a=t.mods.get("throttle");if(a){let l=xe(a),f=X(a,"noLead",!0),d=X(a,"noTrail",!1);s=nt(s,l,f,d)}let c={capture:!0,passive:!1,once:!1};t.mods.has("capture")||(c.capture=!1),t.mods.has("passive")&&(c.passive=!0),t.mods.has("once")&&(c.once=!0),[...t.mods.keys()].filter(l=>!rn.has(l)).forEach(l=>{let f=t.mods.get(l)||[],d=s;s=()=>{let S=event,y=S[l],A;if(typeof y=="function")A=y(...f);else if(typeof y=="boolean")A=y;else if(typeof y=="string"){let N=y.toLowerCase().trim(),p=f.join("").toLowerCase().trim();A=N===p}else throw g;A&&d(S)}});let u=ue(n).toLowerCase();switch(u){case"load":return s(),delete t.el.dataset.onLoad,()=>{};case"raf":let l,f=()=>{s(),l=requestAnimationFrame(f)};return l=requestAnimationFrame(f),()=>{l&&cancelAnimationFrame(l)};case"signals-change":return t.reactivity.effect(()=>{let x=t.mods.has("remote"),S=t.signals.JSON(!1,x);rt!==S&&(rt=S,s())});default:if(t.mods.has("outside")){o=document;let x=s,S=!1;s=A=>{let N=A?.target;if(!N)return;let p=e.id===N.id;p&&S&&(S=!1),!p&&!S&&(x(A),S=!0)}}return o.addEventListener(u,s,c),()=>{o.removeEventListener(u,s)}}}};var Bo={type:1,name:"ref",noKey:!0,mustValue:!0,noGenExpr:()=>!0,onLoad:({el:t,value:e,signals:n})=>(n.upsert(e,t),()=>n.remove(e))};var qo={type:1,name:"text",noKey:!0,onLoad:t=>{let{el:e,expr:n,reactivity:{effect:r}}=t;if(!(e instanceof HTMLElement))throw g;return r(()=>{let o=n(t);e.textContent=`${o}`})}};var Q="session",ot="local",st="remote",ns={type:1,name:"persist",onlyMods:new Set([ot,Q,st]),onLoad:t=>{let{signals:e,expr:n}=t,r=t.key||L,o=t.value,s=new Set;if(o.trim()!==""){let f=n(t).split(" ");for(let d of f)s.add(d)}let i="",a=t.mods.has(Q)?Q:ot,c=t.mods.has(st),m=l=>{let f=e.subset(...s).JSON(!1,c);f!==i&&(a===Q?window.sessionStorage.setItem(r,f):window.localStorage.setItem(r,f),i=f)};window.addEventListener(Ae,m);let u;if(a===Q?u=window.sessionStorage.getItem(r):u=window.localStorage.getItem(r),u){let l=JSON.parse(u);e.merge(l,!0)}return()=>{window.removeEventListener(Ae,m)}}};var as={type:1,name:"replaceUrl",noKey:!0,mustValue:!0,onLoad:t=>{let{expr:e,reactivity:{effect:n}}=t;return n(()=>{let r=e(t),o=window.location.href,s=new URL(r,o).toString();window.history.replaceState({},"",s)})}};var it="once",at="half",lt="full",ms={type:1,name:"intersects",onlyMods:new Set([it,at,lt]),noKey:!0,onLoad:t=>{let{mods:e}=t,n={threshold:0};e.has(lt)?n.threshold=1:e.has(at)&&(n.threshold=.5);let r=new IntersectionObserver(o=>{o.forEach(s=>{s.isIntersecting&&(t.expr(t),e.has(it)&&(r.disconnect(),delete t.el.dataset[t.rawKey]))})},n);return r.observe(t.el),()=>r.disconnect()}};function ut(t){if(t.id)return t.id;let e=0,n=o=>(e=(e<<5)-e+o,e&e),r=o=>o.split("").forEach(s=>n(s.charCodeAt(0)));for(;t.parentNode;){if(t.id){r(`${t.id}`);break}else if(t===t.ownerDocument.documentElement)r(t.tagName);else{for(let o=1,s=t;s.previousElementSibling;s=s.previousElementSibling,o++)n(o);t=t.parentNode}t=t.parentNode}return L+e}function ct(t,e,n=!0){if(!(t instanceof HTMLElement||t instanceof SVGElement))throw F;t.tabIndex||t.setAttribute("tabindex","0"),t.scrollIntoView(e),n&&t.focus()}var ce="smooth",Re="instant",Pe="auto",ft="hstart",mt="hcenter",pt="hend",dt="hnearest",gt="vstart",ht="vcenter",vt="vend",bt="vnearest",on="focus",fe="center",Et="start",yt="end",St="nearest",Es={type:1,name:"scrollIntoView",noKey:!0,noVal:!0,onlyMods:new Set([ce,Re,Pe,ft,mt,pt,dt,gt,ht,vt,bt,on]),onLoad:({el:t,mods:e,rawKey:n})=>{t.tabIndex||t.setAttribute("tabindex","0");let r={behavior:ce,block:fe,inline:fe};return e.has(ce)&&(r.behavior=ce),e.has(Re)&&(r.behavior=Re),e.has(Pe)&&(r.behavior=Pe),e.has(ft)&&(r.inline=Et),e.has(mt)&&(r.inline=fe),e.has(pt)&&(r.inline=yt),e.has(dt)&&(r.inline=St),e.has(gt)&&(r.block=Et),e.has(ht)&&(r.block=fe),e.has(vt)&&(r.block=yt),e.has(bt)&&(r.block=St),ct(t,r,e.has("focus")),delete t.dataset[n],()=>{}}};var At="none",_t="display",As={type:1,name:"show",noKey:!0,mustValue:!0,onLoad:t=>{let{expr:e,el:{style:n},reactivity:{effect:r}}=t;return r(async()=>{e(t)?n.display===At&&n.removeProperty(_t):n.setProperty(_t,At)})}};var ee=document,q=!!ee.startViewTransition;var Me="view-transition",Rs={type:1,name:Me,onGlobalInit(){let t=!1;if(document.head.childNodes.forEach(e=>{e instanceof HTMLMetaElement&&e.name===Me&&(t=!0)}),!t){let e=document.createElement("meta");e.name=Me,e.content="same-origin",document.head.appendChild(e)}},onLoad:t=>{if(!q){console.error("Browser does not support view transitions");return}return t.reactivity.effect(()=>{let{el:e,expr:n}=t,r=n(t);if(!r)return;let o=e.style;o.viewTransitionName=r})}};var Tt="[a-zA-Z_$]+",wt=Tt+"[0-9a-zA-Z_$.]*",xt={name:"get$",type:0,regexp:new RegExp(`(?<whole>\\$(?<key>${wt}))`,"gm"),alter:t=>{let{key:e}=t;return`ctx.signals.value('${e}')`}},Rt={name:"set$",type:0,regexp:new RegExp(`(?<whole>\\$(?<key>${wt})\\s*=\\s*(?<value>[\\w.(),]*))`,"gm"),alter:({key:t,value:e})=>`ctx.signals.set("${t}", ${e})`},Pt={name:"action",type:0,regexp:new RegExp(`(?<whole>@(?<method>${Tt})\\((?<args>.*)\\))`,"gm"),alter:({action:t,args:e})=>{let n=["ctx"];e&&n.push(...e.split(",").map(o=>o.trim()));let r=n.join(",");return`ctx.actions.${t}.fn(${r})`}};var zs={type:2,name:I.ExecuteScript,onGlobalInit:async()=>{D(I.ExecuteScript,({autoRemove:t=`${!0}`,attributes:e=We,script:n})=>{let r=V(t);if(!n?.length)throw g;let o=document.createElement("script");e.split(`
`).forEach(s=>{let i=s.indexOf(" "),a=i?s.slice(0,i):s,c=i?s.slice(i):"";o.setAttribute(a.trim(),c.trim())}),o.text=n,document.head.appendChild(o),r&&o.remove()})}};var pe=new WeakSet;function It(t,e,n={}){t instanceof Document&&(t=t.documentElement);let r;typeof e=="string"?r=fn(e):r=e;let o=mn(r),s=ln(t,o,n);return kt(t,o,s)}function kt(t,e,n){if(n.head.block){let r=t.querySelector("head"),o=e.querySelector("head");if(r&&o){let s=Ct(o,r,n);Promise.all(s).then(()=>{kt(t,e,Object.assign(n,{head:{block:!1,ignore:!0}}))});return}}if(n.morphStyle==="innerHTML")return Dt(e,t,n),t.children;if(n.morphStyle==="outerHTML"||n.morphStyle==null){let r=dn(e,t,n);if(!r)throw F;let o=r?.previousSibling,s=r?.nextSibling,i=de(t,r,n);return r?pn(o,i,s):[]}else throw g}function de(t,e,n){if(!(n.ignoreActive&&t===document.activeElement))if(e==null){if(n.callbacks.beforeNodeRemoved(t)===!1)return;t.remove(),n.callbacks.afterNodeRemoved(t);return}else{if(ge(t,e))return n.callbacks.beforeNodeMorphed(t,e)===!1?void 0:(t instanceof HTMLHeadElement&&n.head.ignore||(e instanceof HTMLHeadElement&&t instanceof HTMLHeadElement&&n.head.style!==k.Morph?Ct(e,t,n):(an(e,t),Dt(e,t,n))),n.callbacks.afterNodeMorphed(t,e),t);if(n.callbacks.beforeNodeRemoved(t)===!1||n.callbacks.beforeNodeAdded(e)===!1)return;if(!t.parentElement)throw g;return t.parentElement.replaceChild(e,t),n.callbacks.afterNodeAdded(e),n.callbacks.afterNodeRemoved(t),e}}function Dt(t,e,n){let r=t.firstChild,o=e.firstChild,s;for(;r;){if(s=r,r=s.nextSibling,o==null){if(n.callbacks.beforeNodeAdded(s)===!1)return;e.appendChild(s),n.callbacks.afterNodeAdded(s),$(n,s);continue}if(Ot(s,o,n)){de(o,s,n),o=o.nextSibling,$(n,s);continue}let i=un(t,e,s,o,n);if(i){o=Mt(o,i,n),de(i,s,n),$(n,s);continue}let a=cn(t,s,o,n);if(a){o=Mt(o,a,n),de(a,s,n),$(n,s);continue}if(n.callbacks.beforeNodeAdded(s)===!1)return;e.insertBefore(s,o),n.callbacks.afterNodeAdded(s),$(n,s)}for(;o!==null;){let i=o;o=o.nextSibling,Vt(i,n)}}function an(t,e){let n=t.nodeType;if(n===1){for(let r of t.attributes)e.getAttribute(r.name)!==r.value&&e.setAttribute(r.name,r.value);for(let r of e.attributes)t.hasAttribute(r.name)||e.removeAttribute(r.name)}if((n===Node.COMMENT_NODE||n===Node.TEXT_NODE)&&e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue),t instanceof HTMLInputElement&&e instanceof HTMLInputElement&&t.type!=="file")e.value=t.value||"",me(t,e,"value"),me(t,e,"checked"),me(t,e,"disabled");else if(t instanceof HTMLOptionElement)me(t,e,"selected");else if(t instanceof HTMLTextAreaElement&&e instanceof HTMLTextAreaElement){let r=t.value,o=e.value;r!==o&&(e.value=r),e.firstChild&&e.firstChild.nodeValue!==r&&(e.firstChild.nodeValue=r)}}function me(t,e,n){let r=t.getAttribute(n),o=e.getAttribute(n);r!==o&&(r?e.setAttribute(n,r):e.removeAttribute(n))}function Ct(t,e,n){let r=[],o=[],s=[],i=[],a=n.head.style,c=new Map;for(let u of t.children)c.set(u.outerHTML,u);for(let u of e.children){let l=c.has(u.outerHTML),f=n.head.shouldReAppend(u),d=n.head.shouldPreserve(u);l||d?f?o.push(u):(c.delete(u.outerHTML),s.push(u)):a===k.Append?f&&(o.push(u),i.push(u)):n.head.shouldRemove(u)!==!1&&o.push(u)}i.push(...c.values());let m=[];for(let u of i){let l=document.createRange().createContextualFragment(u.outerHTML).firstChild;if(!l)throw g;if(n.callbacks.beforeNodeAdded(l)){if(l.hasAttribute("href")||l.hasAttribute("src")){let f,d=new Promise(x=>{f=x});l.addEventListener("load",function(){f(void 0)}),m.push(d)}e.appendChild(l),n.callbacks.afterNodeAdded(l),r.push(l)}}for(let u of o)n.callbacks.beforeNodeRemoved(u)!==!1&&(e.removeChild(u),n.callbacks.afterNodeRemoved(u));return n.head.afterHeadMorphed(e,{added:r,kept:s,removed:o}),m}function H(){}function ln(t,e,n){return{target:t,newContent:e,config:n,morphStyle:n.morphStyle,ignoreActive:n.ignoreActive,idMap:bn(t,e),deadIds:new Set,callbacks:Object.assign({beforeNodeAdded:H,afterNodeAdded:H,beforeNodeMorphed:H,afterNodeMorphed:H,beforeNodeRemoved:H,afterNodeRemoved:H},n.callbacks),head:Object.assign({style:"merge",shouldPreserve:r=>r.getAttribute("im-preserve")==="true",shouldReAppend:r=>r.getAttribute("im-re-append")==="true",shouldRemove:H,afterHeadMorphed:H},n.head)}}function Ot(t,e,n){return!t||!e?!1:t.nodeType===e.nodeType&&t.tagName===e.tagName?t?.id?.length&&t.id===e.id?!0:te(n,t,e)>0:!1}function ge(t,e){return!t||!e?!1:t.nodeType===e.nodeType&&t.tagName===e.tagName}function Mt(t,e,n){for(;t!==e;){let r=t;if(t=t?.nextSibling,!r)throw g;Vt(r,n)}return $(n,e),e.nextSibling}function un(t,e,n,r,o){let s=te(o,n,e),i=null;if(s>0){i=r;let a=0;for(;i!=null;){if(Ot(n,i,o))return i;if(a+=te(o,i,t),a>s)return null;i=i.nextSibling}}return i}function cn(t,e,n,r){let o=n,s=e.nextSibling,i=0;for(;o&&s;){if(te(r,o,t)>0)return null;if(ge(e,o))return o;if(ge(s,o)&&(i++,s=s.nextSibling,i>=2))return null;o=o.nextSibling}return o}var Nt=new DOMParser;function fn(t){let e=t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,"");if(e.match(/<\/html>/)||e.match(/<\/head>/)||e.match(/<\/body>/)){let n=Nt.parseFromString(t,"text/html");if(e.match(/<\/html>/))return pe.add(n),n;{let r=n.firstChild;return r?(pe.add(r),r):null}}else{let r=Nt.parseFromString(`<body><template>${t}</template></body>`,"text/html").body.querySelector("template")?.content;if(!r)throw F;return pe.add(r),r}}function mn(t){if(t==null)return document.createElement("div");if(pe.has(t))return t;if(t instanceof Node){let e=document.createElement("div");return e.append(t),e}else{let e=document.createElement("div");for(let n of[...t])e.append(n);return e}}function pn(t,e,n){let r=[],o=[];for(;t;)r.push(t),t=t.previousSibling;for(;r.length>0;){let s=r.pop();o.push(s),e?.parentElement?.insertBefore(s,e)}for(o.push(e);n;)r.push(n),o.push(n),n=n.nextSibling;for(;r.length;)e?.parentElement?.insertBefore(r.pop(),e.nextSibling);return o}function dn(t,e,n){let r=t.firstChild,o=r,s=0;for(;r;){let i=gn(r,e,n);i>s&&(o=r,s=i),r=r.nextSibling}return o}function gn(t,e,n){return ge(t,e)?.5+te(n,t,e):0}function Vt(t,e){$(e,t),e.callbacks.beforeNodeRemoved(t)!==!1&&(t.remove(),e.callbacks.afterNodeRemoved(t))}function hn(t,e){return!t.deadIds.has(e)}function vn(t,e,n){return t.idMap.get(n)?.has(e)||!1}function $(t,e){let n=t.idMap.get(e);if(n)for(let r of n)t.deadIds.add(r)}function te(t,e,n){let r=t.idMap.get(e);if(!r)return 0;let o=0;for(let s of r)hn(t,s)&&vn(t,s,n)&&++o;return o}function Lt(t,e){let n=t.parentElement,r=t.querySelectorAll("[id]");for(let o of r){let s=o;for(;s!==n&&s;){let i=e.get(s);i==null&&(i=new Set,e.set(s,i)),i.add(o.id),s=s.parentElement}}}function bn(t,e){let n=new Map;return Lt(t,n),Lt(e,n),n}var li={type:2,name:I.MergeFragments,onGlobalInit:async t=>{let e=document.createElement("template");D(I.MergeFragments,({fragments:n="<div></div>",selector:r="",mergeMode:o=$e,settleDuration:s=`${300}`,useViewTransition:i=`${!1}`})=>{let a=parseInt(s),c=V(i);e.innerHTML=n.trim(),[...e.content.children].forEach(u=>{if(!(u instanceof Element))throw g;let l=r||`#${u.getAttribute("id")}`,d=[...document.querySelectorAll(l)||[]];if(!d.length)throw g;q&&c?ee.startViewTransition(()=>Ht(t,o,a,u,d)):Ht(t,o,a,u,d)})})}};function Ht(t,e,n,r,o){for(let s of o){s.classList.add(W);let i=s.outerHTML,a=s;switch(e){case k.Morph:let m=It(a,r,{callbacks:{beforeNodeRemoved:(u,l)=>(t.cleanup(u),!0)}});if(!m?.length)throw g;a=m[0];break;case k.Inner:a.innerHTML=r.innerHTML;break;case k.Outer:a.replaceWith(r);break;case k.Prepend:a.prepend(r);break;case k.Append:a.append(r);break;case k.Before:a.before(r);break;case k.After:a.after(r);break;case k.UpsertAttributes:r.getAttributeNames().forEach(u=>{let l=r.getAttribute(u);a.setAttribute(u,l)});break;default:throw g}t.cleanup(a),a.classList.add(W),t.applyPlugins(document.body),setTimeout(()=>{s.classList.remove(W),a.classList.remove(W)},n);let c=a.outerHTML;i!==c&&(a.classList.add(Te),setTimeout(()=>{a.classList.remove(Te)},n))}}var di={type:2,name:I.MergeSignals,onGlobalInit:async t=>{D(I.MergeSignals,({signals:e="{}",onlyIfMissing:n=`${!1}`})=>{let{signals:r}=t,o=V(n),s=` return Object.assign({...ctx.signals}, ${e})`;try{let a=new Function("ctx",s)(t);r.merge(a,o),t.applyPlugins(document.body)}catch(i){console.log(s),console.error(i);debugger}})}};var Ai={type:2,name:I.RemoveFragments,onGlobalInit:async()=>{D(I.RemoveFragments,({selector:t,settleDuration:e=`${300}`,useViewTransition:n=`${!1}`})=>{if(!t.length)throw g;let r=parseInt(e),o=V(n),s=document.querySelectorAll(t),i=()=>{for(let a of s)a.classList.add(W);setTimeout(()=>{for(let a of s)a.remove()},r)};q&&o?ee.startViewTransition(()=>i()):i()})}};var Pi={type:2,name:I.RemoveSignals,onGlobalInit:async t=>{D(I.RemoveSignals,({paths:e=""})=>{let n=e.split(`
`).map(r=>r.trim());if(!n?.length)throw g;t.signals.remove(...n)})}};var yn=Symbol.for("preact-signals"),O=1,j=2,re=4,Y=8,he=16,J=32;function ke(){ve++}function De(){if(ve>1){ve--;return}let t,e=!1;for(;ne!==void 0;){let n=ne;for(ne=void 0,Ie++;n!==void 0;){let r=n._nextBatchedEffect;if(n._nextBatchedEffect=void 0,n._flags&=~j,!(n._flags&Y)&&$t(n))try{n._callback()}catch(o){e||(t=o,e=!0)}n=r}}if(Ie=0,ve--,e)throw t}var E;var ne,ve=0,Ie=0,be=0;function Ft(t){if(E===void 0)return;let e=t._node;if(e===void 0||e._target!==E)return e={_version:0,_source:t,_prevSource:E._sources,_nextSource:void 0,_target:E,_prevTarget:void 0,_nextTarget:void 0,_rollbackNode:e},E._sources!==void 0&&(E._sources._nextSource=e),E._sources=e,t._node=e,E._flags&J&&t._subscribe(e),e;if(e._version===-1)return e._version=0,e._nextSource!==void 0&&(e._nextSource._prevSource=e._prevSource,e._prevSource!==void 0&&(e._prevSource._nextSource=e._nextSource),e._prevSource=E._sources,e._nextSource=void 0,E._sources._nextSource=e,E._sources=e),e}function w(t){this._value=t,this._version=0,this._node=void 0,this._targets=void 0}w.prototype.brand=yn;w.prototype._refresh=function(){return!0};w.prototype._subscribe=function(t){this._targets!==t&&t._prevTarget===void 0&&(t._nextTarget=this._targets,this._targets!==void 0&&(this._targets._prevTarget=t),this._targets=t)};w.prototype._unsubscribe=function(t){if(this._targets!==void 0){let e=t._prevTarget,n=t._nextTarget;e!==void 0&&(e._nextTarget=n,t._prevTarget=void 0),n!==void 0&&(n._prevTarget=e,t._nextTarget=void 0),t===this._targets&&(this._targets=n)}};w.prototype.subscribe=function(t){return Oe(()=>{let e=this.value,n=E;E=void 0;try{t(e)}finally{E=n}})};w.prototype.valueOf=function(){return this.value};w.prototype.toString=function(){return this.value+""};w.prototype.toJSON=function(){return this.value};w.prototype.peek=function(){let t=E;E=void 0;try{return this.value}finally{E=t}};Object.defineProperty(w.prototype,"value",{get(){let t=Ft(this);return t!==void 0&&(t._version=this._version),this._value},set(t){if(t!==this._value){if(Ie>100)throw g;this._value=t,this._version++,be++,ke();try{for(let e=this._targets;e!==void 0;e=e._nextTarget)e._target._notify()}finally{De()}}}});function Wt(t){return new w(t)}function $t(t){for(let e=t._sources;e!==void 0;e=e._nextSource)if(e._source._version!==e._version||!e._source._refresh()||e._source._version!==e._version)return!0;return!1}function Bt(t){for(let e=t._sources;e!==void 0;e=e._nextSource){let n=e._source._node;if(n!==void 0&&(e._rollbackNode=n),e._source._node=e,e._version=-1,e._nextSource===void 0){t._sources=e;break}}}function Gt(t){let e=t._sources,n;for(;e!==void 0;){let r=e._prevSource;e._version===-1?(e._source._unsubscribe(e),r!==void 0&&(r._nextSource=e._nextSource),e._nextSource!==void 0&&(e._nextSource._prevSource=r)):n=e,e._source._node=e._rollbackNode,e._rollbackNode!==void 0&&(e._rollbackNode=void 0),e=r}t._sources=n}function B(t){w.call(this,void 0),this._fn=t,this._sources=void 0,this._globalVersion=be-1,this._flags=re}B.prototype=new w;B.prototype._refresh=function(){if(this._flags&=~j,this._flags&O)return!1;if((this._flags&(re|J))===J||(this._flags&=~re,this._globalVersion===be))return!0;if(this._globalVersion=be,this._flags|=O,this._version>0&&!$t(this))return this._flags&=~O,!0;let t=E;try{Bt(this),E=this;let e=this._fn();(this._flags&he||this._value!==e||this._version===0)&&(this._value=e,this._flags&=~he,this._version++)}catch(e){this._value=e,this._flags|=he,this._version++}return E=t,Gt(this),this._flags&=~O,!0};B.prototype._subscribe=function(t){if(this._targets===void 0){this._flags|=re|J;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._subscribe(e)}w.prototype._subscribe.call(this,t)};B.prototype._unsubscribe=function(t){if(this._targets!==void 0&&(w.prototype._unsubscribe.call(this,t),this._targets===void 0)){this._flags&=~J;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e)}};B.prototype._notify=function(){if(!(this._flags&j)){this._flags|=re|j;for(let t=this._targets;t!==void 0;t=t._nextTarget)t._target._notify()}};Object.defineProperty(B.prototype,"value",{get(){if(this._flags&O)throw g;let t=Ft(this);if(this._refresh(),t!==void 0&&(t._version=this._version),this._flags&he)throw this._value;return this._value}});function Ut(t){return new B(t)}function Kt(t){let e=t._cleanup;if(t._cleanup=void 0,typeof e=="function"){ke();let n=E;E=void 0;try{e()}catch(r){throw t._flags&=~O,t._flags|=Y,Ce(t),r}finally{E=n,De()}}}function Ce(t){for(let e=t._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e);t._fn=void 0,t._sources=void 0,Kt(t)}function Sn(t){if(E!==this)throw g;Gt(this),E=t,this._flags&=~O,this._flags&Y&&Ce(this),De()}function oe(t){this._fn=t,this._cleanup=void 0,this._sources=void 0,this._nextBatchedEffect=void 0,this._flags=J}oe.prototype._callback=function(){let t=this._start();try{if(this._flags&Y||this._fn===void 0)return;let e=this._fn();typeof e=="function"&&(this._cleanup=e)}finally{t()}};oe.prototype._start=function(){if(this._flags&O)throw g;this._flags|=O,this._flags&=~Y,Kt(this),Bt(this),ke();let t=E;return E=this,Sn.bind(this,t)};oe.prototype._notify=function(){this._flags&j||(this._flags|=j,this._nextBatchedEffect=ne,ne=this)};oe.prototype._dispose=function(){this._flags|=Y,this._flags&O||Ce(this)};function Oe(t){let e=new oe(t);try{e._callback()}catch(n){throw e._dispose(),n}return e._dispose.bind(e)}function qt(t,e=!1){let n={};for(let r in t)if(t.hasOwnProperty(r)){let o=t[r];if(o instanceof w){if(e&&r.startsWith("_"))continue;n[r]=o.value}else n[r]=qt(o)}return n}function jt(t,e,n=!1){for(let r in e)if(e.hasOwnProperty(r)){let o=e[r];if(o instanceof Object&&!Array.isArray(o))t[r]||(t[r]={}),jt(t[r],o,n);else{if(n&&t[r])continue;t[r]=new w(o)}}}function Jt(t,e){for(let n in t)if(t.hasOwnProperty(n)){let r=t[n];r instanceof w?e(n,r):Jt(r,e)}}function An(t,...e){let n={};for(let r of e){let o=r.split("."),s=t,i=n;for(let c=0;c<o.length-1;c++){let m=o[c];if(!s[m])return{};i[m]||(i[m]={}),s=s[m],i=i[m]}let a=o[o.length-1];i[a]=s[a]}return n}var Ee=class{constructor(e){this.engine=e;this._signals={}}exists(e){return!!this.signal(e)}signal(e){let n=e.split("."),r=this._signals;for(let s=0;s<n.length-1;s++){let i=n[s];if(!r[i])return null;r=r[i]}let o=n[n.length-1];return r[o]}add(e,n){let r=e.split("."),o=this._signals;for(let i=0;i<r.length-1;i++){let a=r[i];o[a]||(o[a]={}),o=o[a]}let s=r[r.length-1];o[s]=n}value(e){return this.signal(e)?.value}set(e,n){let r=this.upsert(e,n);r.value=n}upsert(e,n){let r=e.split("."),o=this._signals;for(let c=0;c<r.length-1;c++){let m=r[c];o[m]||(o[m]={}),o=o[m]}let s=r[r.length-1],i=o[s];if(i)return i;let a=new w(n);return o[s]=a,a}remove(...e){let n=!1;for(let r of e){let o=r.split("."),s=this._signals;for(let a=0;a<o.length-1;a++){let c=o[a];if(!s[c])return;s=s[c]}let i=o[o.length-1];delete s[i],n=!0}n&&this.engine.applyPlugins(document.body)}merge(e,n=!1){jt(this._signals,e,n)}subset(...e){return An(this.values(),...e)}walk(e){Jt(this._signals,e)}values(e=!1){return qt(this._signals,e)}JSON(e=!0,n=!1){let r=this.values(n);return e?JSON.stringify(r,null,2):JSON.stringify(r)}toString(){return this.JSON()}};var Yt="0.20.1";var _n=t=>t.type===0,Tn=t=>t.type===2,wn=t=>t.type===1,xn=t=>t.type===3,ye=class{constructor(){this._signals=new Ee(this);this.plugins=[];this.macros=[];this.actions={};this.watchers=[];this.reactivity={signal:Wt,computed:Ut,effect:Oe};this.removals=new Map}get version(){return Yt}load(...e){let n=new Set(this.plugins);e.forEach(r=>{if(r.requiredPlugins){for(let s of r.requiredPlugins)if(!n.has(s))throw U}let o;if(_n(r)){if(this.macros.includes(r))throw Z;this.macros.push(r)}else if(Tn(r)){if(this.watchers.includes(r))throw Z;this.watchers.push(r),o=r.onGlobalInit}else if(xn(r)){if(this.actions[r.name])throw Z;this.actions[r.name]=r}else if(wn(r)){if(this.plugins.includes(r))throw Z;this.plugins.push(r),o=r.onGlobalInit}else throw F;if(o){let s=this;o({get signals(){return s._signals},actions:this.actions,reactivity:this.reactivity,applyPlugins:this.applyPlugins.bind(this),cleanup:this.cleanup.bind(this)})}n.add(r)}),this.applyPlugins(document.body)}cleanup(e){let n=this.removals.get(e);if(n){for(let r of n.set)r();this.removals.delete(e)}}applyPlugins(e){let n=new Set;this.plugins.forEach((r,o)=>{this.walkDownDOM(e,s=>{o||this.cleanup(s);for(let i in s.dataset){let a=`${s.dataset[i]}`||"",c=a;if(!i.startsWith(r.name))continue;if(s.id.length||(s.id=ut(s)),n.clear(),r.tags){let p=s.tagName.toLowerCase();if(![...r.tags].some(_=>p.match(_)))throw U}let m=i.slice(r.name.length),[u,...l]=m.split(".");if(r.noKey&&u.length>0)throw g;if(r.mustKey&&u.length===0)throw g;u.length&&(u=u[0].toLowerCase()+u.slice(1));let f=l.map(p=>{let[M,..._]=p.split("_");return{label:M,args:_}});if(r.onlyMods){for(let p of f)if(!r.onlyMods.has(p.label))throw U}let d=new Map;for(let p of f)d.set(p.label,p.args);if(r.noVal&&c.length)throw g;if(r.mustValue&&!c.length)throw g;let x=/;|\n/,S=[...r.macros?.pre||[],...this.macros,...r.macros?.post||[]];for(let p of S){if(n.has(p))continue;n.add(p);let M=c.split(x),_=[];M.forEach(h=>{let b=h,P=[...b.matchAll(p.regexp)];if(P.length)for(let T of P){if(!T.groups)continue;let{groups:R}=T,{whole:se}=R;b=b.replace(se,p.alter(R))}_.push(b)}),c=_.join(`;
`)}let y=this,A={get signals(){return y._signals},applyPlugins:this.applyPlugins.bind(this),cleanup:this.cleanup.bind(this),actions:this.actions,reactivity:this.reactivity,el:s,rawKey:i,key:u,rawValue:a,value:c,expr:()=>{throw ie},mods:d};if(!r.noGenExpr?.(A)&&!r.noVal&&c.length){let p=c.split(x).map(h=>h.trim()).filter(h=>h.length);p[p.length-1]=`return ${p[p.length-1]}`;let M=p.map(h=>`  ${h}`).join(`;
`),_=`try{${M}}catch(e){console.error(\`Error evaluating Datastar expression:
${M.replaceAll("`","\\`")}

Error: \${e.message}

Check if the expression is valid before raising an issue.\`.trim());
debugger
}`;try{let h=r.argNames||[],b=new Function("ctx",...h,_);A.expr=b}catch(h){let b=new Error(`${h}
with
${_}`);console.error(b);debugger}}let N=r.onLoad(A);N&&(this.removals.has(s)||this.removals.set(s,{id:s.id,set:new Set}),this.removals.get(s).set.add(N))}})})}walkDownDOM(e,n,r=0){if(!e||!(e instanceof HTMLElement||e instanceof SVGElement))return null;for(n(e),r=0,e=e.firstElementChild;e;)this.walkDownDOM(e,n,r++),e=e.nextElementSibling}};var zt=new ye;zt.load(Qe,Pt,Rt,xt,Xe,ze);var Zt=zt;Zt.load();})();
//# sourceMappingURL=datastar-core.js.map
