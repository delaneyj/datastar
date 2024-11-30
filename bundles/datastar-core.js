"use strict";(()=>{var L="datastar",Ae="datastar-event",We="Datastar-Request";var $e="type module";var k={Morph:"morph",Inner:"inner",Outer:"outer",Prepend:"prepend",Append:"append",Before:"before",After:"after",UpsertAttributes:"upsertAttributes"},Be=k.Morph,I={MergeFragments:"datastar-merge-fragments",MergeSignals:"datastar-merge-signals",RemoveFragments:"datastar-remove-fragments",RemoveSignals:"datastar-remove-signals",ExecuteScript:"datastar-execute-script"};var U=t=>{let e=new Error;return e.name=`${L}${t}`,e},g=U(400),X=U(409),F=U(404),K=U(403),se=U(405),Ge=U(503);async function Ke(t,e){let n=t.getReader(),r;for(;!(r=await n.read()).done;)e(r.value)}function qe(t){let e,n,r,o=!1;return function(s){e===void 0?(e=s,n=0,r=-1):e=en(e,s);let a=e.length,c=0;for(;n<a;){o&&(e[n]===10&&(c=++n),o=!1);let f=-1;for(;n<a&&f===-1;++n)switch(e[n]){case 58:r===-1&&(r=n-c);break;case 13:o=!0;case 10:f=n;break}if(f===-1)break;t(e.subarray(c,f),r),c=n,r=-1}c===a?e=void 0:c!==0&&(e=e.subarray(c),n-=c)}}function je(t,e,n){let r=Ue(),o=new TextDecoder;return function(s,a){if(s.length===0)n?.(r),r=Ue();else if(a>0){let c=o.decode(s.subarray(0,a)),f=a+(s[a+1]===32?2:1),u=o.decode(s.subarray(f));switch(c){case"data":r.data=r.data?r.data+`
`+u:u;break;case"event":r.event=u;break;case"id":t(r.id=u);break;case"retry":let l=parseInt(u,10);isNaN(l)||e(r.retry=l);break}}}}function en(t,e){let n=new Uint8Array(t.length+e.length);return n.set(t),n.set(e,t.length),n}function Ue(){return{data:"",event:"",id:"",retry:void 0}}var Ye="text/event-stream",tn=1e3,Je="last-event-id";function _e(t,{signal:e,headers:n,onopen:r,onmessage:o,onclose:i,onerror:s,openWhenHidden:a,fetch:c,retryScaler:f=2,retryMaxWaitMs:u=3e4,retryMaxCount:l=10,...m}){return new Promise((p,x)=>{let S=0,_={...n};_.accept||(_.accept=Ye);let E;function M(){E.abort(),document.hidden||P()}a||document.addEventListener("visibilitychange",M);let d=tn,y=0;function A(){document.removeEventListener("visibilitychange",M),window.clearTimeout(y),E.abort()}e?.addEventListener("abort",()=>{A(),p()});let v=c??window.fetch,R=r??function(){};async function P(){E=new AbortController;try{let T=await v(t,{...m,headers:_,signal:E.signal});await R(T),await Ke(T.body,qe(je(N=>{N?_[Je]=N:delete _[Je]},N=>{d=N},o))),i?.(),A(),p()}catch(T){if(!E.signal.aborted)try{let N=s?.(T)??d;window.clearTimeout(y),y=window.setTimeout(P,N),d*=f,d=Math.min(d,u),S++,S>=l?(A(),x(Ge)):console.error(`Datastar failed to reach ${m.method}:${t.toString()} retry in ${N}ms`)}catch(N){A(),x(N)}}}P()})}var q=`${L}-sse`,Te=`${L}-settling`,W=`${L}-swapping`,ae="started",le="finished";function D(t,e){document.addEventListener(q,n=>{if(n.detail.type!=t)return;let{argsRaw:r}=n.detail;e(r)})}var ze=t=>`${t}`.includes("text/event-stream");function we(t,e){document.dispatchEvent(new CustomEvent(q,{detail:{type:t,argsRaw:e}}))}function C(t){return async(e,n,r)=>{if(!n?.length)throw g;let o=r?.onlyRemoteSignals??!0,i=Object.assign({"Content-Type":"application/json",[We]:!0},r?.headers),{signals:s,el:{id:a}}=e,c=s.JSON(!1,o);we(ae,{elID:a});let f=new URL(n,window.location.origin);t=t.toUpperCase();let u={method:t,headers:i,onmessage:l=>{if(!l.event.startsWith(L))return;let m=l.event,p={},x=l.data.split(`
`);for(let _ of x){let E=_.indexOf(" "),M=_.slice(0,E),d=p[M];d||(d=[],p[M]=d);let y=_.slice(E+1).trim();d.push(y)}let S={};for(let[_,E]of Object.entries(p))S[_]=E.join(`
`);we(m,S)},onerror:l=>{if(ze(l))throw l;l&&console.error(l.message)},onclose:()=>{we(le,{elID:a})}};if(t==="GET"){let l=new URLSearchParams(f.search);l.append(L,c),f.search=l.toString()}else u.body=c;try{let l=f.toString();await _e(l,u)}catch(l){if(!ze(l))throw l}}}var Zn={type:3,name:"delete",fn:C("delete")};var tr={type:3,name:"get",fn:C("get")};var ir={type:3,name:"patch",fn:C("patch")};var ur={type:3,name:"post",fn:C("post")};var pr={type:3,name:"put",fn:C("put")};var Tr={type:3,name:"clipboard",fn:(t,e)=>{if(!navigator.clipboard)throw K;navigator.clipboard.writeText(e)}};var Mr={type:3,name:"setAll",fn:(t,e,n)=>{let r=new RegExp(e);t.signals.walk((o,i)=>r.test(o)&&(i.value=n))}};var Ir={type:3,name:"toggleAll",fn:(t,e)=>{let n=new RegExp(e);t.signals.walk((r,o)=>n.test(r)&&(o.value=!o.value))}};var Hr={type:3,name:"clampFit",fn:(t,e,n,r,o,i)=>Math.max(o,Math.min(i,(e-n)/(r-n)*(i-o)+o))};var $r={type:3,name:"clampFitInt",fn:(t,e,n,r,o,i)=>Math.round(Math.max(o,Math.min(i,(e-n)/(r-n)*(i-o)+o)))};var Ur={type:3,name:"fit",fn:(t,e,n,r,o,i)=>(e-n)/(r-n)*(i-o)+o};var jr={type:3,name:"fitInt",fn:(t,e,n,r,o,i)=>Math.round((e-n)/(r-n)*(i-o)+o)};var nn=`${L}-indicator`,uo=`${nn}-loading`,co={type:1,name:"indicator",noKey:!0,onLoad:t=>{let{value:e,signals:n,el:r}=t,o=n.upsert(e,!1),i=s=>{let{type:a,argsRaw:{elID:c}}=s.detail;if(c===r.id)switch(a){case ae:o.value=!0;break;case le:o.value=!1;break}};return document.addEventListener(q,i),()=>{document.removeEventListener(q,i)}}};var Ze={type:1,name:"computed",mustKey:!0,onLoad:t=>{let{signals:e,key:n,expr:r,reactivity:{computed:o}}=t,i=o(()=>r(t));return e.add(n,i),()=>{e.remove(n)}}};var Xe="ifmissing",Qe={type:1,name:"mergeSignals",onlyMods:new Set([Xe]),onLoad:t=>{let{el:e,expr:n,mods:r}=t,o=n(t);t.signals.merge(o,r.has(Xe)),delete e.dataset[t.rawKey]}};var et={type:1,name:"star",onLoad:()=>{alert("YOU ARE PROBABLY OVERCOMPLICATING IT")}};var ue=t=>t.replace(/[A-Z]+(?![a-z])|[A-Z]/g,(e,n)=>(n?"-":"")+e.toLowerCase()),V=t=>t.trim()==="true";var rn=/^data:(?<mime>[^;]+);base64,(?<contents>.*)$/,tt=["change","input","keydown"],Mo={type:1,name:"bind",onLoad:t=>{let{el:e,value:n,expr:r,key:o,signals:i,reactivity:{effect:s}}=t,a=()=>{},c=()=>{},f=o==="";if(f){if(typeof n!="string")throw new Error("Invalid expression");if(n.includes("$"))throw new Error("Not an expression");let l=e.tagName.toLowerCase(),m="",p=l.includes("input"),x=e.getAttribute("type"),S=l.includes("checkbox")||p&&x==="checkbox";S&&(m=!1),p&&x==="number"&&(m=0);let E=l.includes("select"),M=l.includes("radio")||p&&x==="radio",d=p&&x==="file";M&&(e.getAttribute("name")?.length||e.setAttribute("name",n));let y=i.upsert(n,m);a=()=>{let A="value"in e,v=y.value,R=`${v}`;if(S||M){let P=e;S?P.checked=!v||v==="true":M&&(P.checked=R===P.value)}else if(!d)if(E){let P=e;P.multiple?Array.from(P.options).forEach(T=>{T?.disabled||(typeof v=="string"?T.selected=v.includes(T.value):typeof v=="number"?T.selected=v===Number(T.value):T.selected=v)}):P.value=R}else A?e.value=R:e.setAttribute("value",R)},c=async()=>{if(d){let R=[...e?.files||[]],P=[],T=[],N=[];await Promise.all(R.map(Fe=>new Promise(Qt=>{let Z=new FileReader;Z.onload=()=>{if(typeof Z.result!="string")throw g;let ye=Z.result.match(rn);if(!ye?.groups)throw g;P.push(ye.groups.contents),T.push(ye.groups.mime),N.push(Fe.name)},Z.onloadend=()=>Qt(void 0),Z.readAsDataURL(Fe)}))),y.value=P.join(",");let{signals:G}=t,Ve=`${n}Mimes`,He=`${n}Names`;Ve in G&&G.upsert(Ve,T),He in G&&G.upsert(He,N);return}let A=y.value,v=e||e;if(typeof A=="number")y.value=Number(v.value||v.getAttribute("value"));else if(typeof A=="string")y.value=v.value||v.getAttribute("value")||"";else if(typeof A=="boolean")S?y.value=v.checked||v.getAttribute("checked")==="true":y.value=!!(v.value||v.getAttribute("value"));else if(!(typeof A>"u"))if(Array.isArray(A)){if(E){let T=[...e.selectedOptions].map(N=>N.value);y.value=T}else y.value=JSON.parse(v.value).split(",");console.log(v.value)}else throw se}}else{let l=ue(o);a=()=>{let m=r(t),p;typeof m=="string"?p=m:p=JSON.stringify(m),!p||p==="false"||p==="null"||p==="undefined"?e.removeAttribute(l):e.setAttribute(l,p)}}f&&tt.forEach(l=>{e.addEventListener(l,c)});let u=s(async()=>{a()});return()=>{u(),f&&tt.forEach(l=>{e.removeEventListener(l,c)})}}};var Io={type:1,name:"class",noKey:!0,mustValue:!0,onLoad:t=>t.reactivity.effect(()=>{let e=t.expr(t);for(let[n,r]of Object.entries(e)){let o=n.split(" ");r?t.el.classList.add(...o):t.el.classList.remove(...o)}})};function xe(t){if(!t||t?.length===0)return 0;for(let e of t){if(e.endsWith("ms"))return Number(e.replace("ms",""));if(e.endsWith("s"))return Number(e.replace("s",""))*1e3;try{return parseFloat(e)}catch{}}return 0}function Q(t,e,n=!1){return t?t.includes(e)||n:!1}function nt(t,e,n=!1,r=!0){let o=-1,i=()=>o&&clearTimeout(o);return function(...a){i(),n&&!o&&t(...a),o=setTimeout(()=>{r&&t(...a),i()},e)}}function rt(t,e,n=!0,r=!1){let o=!1;return function(...s){o||(n&&t(...s),o=!0,setTimeout(()=>{o=!1,r&&t(...s)},e))}}var on=new Set(["window","once","passive","capture","debounce","throttle","remote","outside"]),ot="",$o={type:1,name:"on",mustKey:!0,mustValue:!0,argNames:["evt"],onLoad:t=>{let{el:e,key:n,expr:r}=t,o=t.el;t.mods.get("window")&&(o=window);let i=l=>{r(t,l)},s=t.mods.get("debounce");if(s){let l=xe(s),m=Q(s,"leading",!1),p=Q(s,"noTrail",!0);i=nt(i,l,m,p)}let a=t.mods.get("throttle");if(a){let l=xe(a),m=Q(a,"noLead",!0),p=Q(a,"noTrail",!1);i=rt(i,l,m,p)}let c={capture:!0,passive:!1,once:!1};t.mods.has("capture")||(c.capture=!1),t.mods.has("passive")&&(c.passive=!0),t.mods.has("once")&&(c.once=!0),[...t.mods.keys()].filter(l=>!on.has(l)).forEach(l=>{let m=t.mods.get(l)||[],p=i;i=()=>{let S=event,_=S[l],E;if(typeof _=="function")E=_(...m);else if(typeof _=="boolean")E=_;else if(typeof _=="string"){let M=_.toLowerCase().trim(),d=m.join("").toLowerCase().trim();E=M===d}else throw g;E&&p(S)}});let u=ue(n).toLowerCase();switch(u){case"load":return i(),delete t.el.dataset.onLoad,()=>{};case"raf":let l,m=()=>{i(),l=requestAnimationFrame(m)};return l=requestAnimationFrame(m),()=>{l&&cancelAnimationFrame(l)};case"signals-change":return t.reactivity.effect(()=>{let x=t.mods.has("remote"),S=t.signals.JSON(!1,x);ot!==S&&(ot=S,i())});default:if(t.mods.has("outside")){o=document;let x=i,S=!1;i=E=>{let M=E?.target;if(!M)return;let d=e.id===M.id;d&&S&&(S=!1),!d&&!S&&(x(E),S=!0)}}return o.addEventListener(u,i,c),()=>{o.removeEventListener(u,i)}}}};var Uo={type:1,name:"ref",noKey:!0,mustValue:!0,noGenExpr:()=>!0,onLoad:({el:t,value:e,signals:n})=>(n.upsert(e,t),()=>n.remove(e))};var Jo={type:1,name:"text",noKey:!0,onLoad:t=>{let{el:e,expr:n,reactivity:{effect:r}}=t;if(!(e instanceof HTMLElement))throw g;return r(()=>{let o=n(t);e.textContent=`${o}`})}};var ee="session",it="local",st="remote",oi={type:1,name:"persist",onlyMods:new Set([it,ee,st]),onLoad:t=>{let{signals:e,expr:n}=t,r=t.key||L,o=t.value,i=new Set;if(o.trim()!==""){let m=n(t).split(" ");for(let p of m)i.add(p)}let s="",a=t.mods.has(ee)?ee:it,c=t.mods.has(st),f=l=>{let m=e.subset(...i).JSON(!1,c);m!==s&&(a===ee?window.sessionStorage.setItem(r,m):window.localStorage.setItem(r,m),s=m)};window.addEventListener(Ae,f);let u;if(a===ee?u=window.sessionStorage.getItem(r):u=window.localStorage.getItem(r),u){let l=JSON.parse(u);e.merge(l,!0)}return()=>{window.removeEventListener(Ae,f)}}};var ui={type:1,name:"replaceUrl",noKey:!0,mustValue:!0,onLoad:t=>{let{expr:e,reactivity:{effect:n}}=t;return n(()=>{let r=e(t),o=window.location.href,i=new URL(r,o).toString();window.history.replaceState({},"",i)})}};var at="once",lt="half",ut="full",di={type:1,name:"intersects",onlyMods:new Set([at,lt,ut]),noKey:!0,onLoad:t=>{let{mods:e}=t,n={threshold:0};e.has(ut)?n.threshold=1:e.has(lt)&&(n.threshold=.5);let r=new IntersectionObserver(o=>{o.forEach(i=>{i.isIntersecting&&(t.expr(t),e.has(at)&&(r.disconnect(),delete t.el.dataset[t.rawKey]))})},n);return r.observe(t.el),()=>r.disconnect()}};function ct(t){if(t.id)return t.id;let e=0,n=o=>(e=(e<<5)-e+o,e&e),r=o=>o.split("").forEach(i=>n(i.charCodeAt(0)));for(;t.parentNode;){if(t.id){r(`${t.id}`);break}else if(t===t.ownerDocument.documentElement)r(t.tagName);else{for(let o=1,i=t;i.previousElementSibling;i=i.previousElementSibling,o++)n(o);t=t.parentNode}t=t.parentNode}return L+e}function ft(t,e,n=!0){if(!(t instanceof HTMLElement||t instanceof SVGElement))throw F;t.tabIndex||t.setAttribute("tabindex","0"),t.scrollIntoView(e),n&&t.focus()}var ce="smooth",Re="instant",Pe="auto",mt="hstart",pt="hcenter",dt="hend",gt="hnearest",ht="vstart",vt="vcenter",bt="vend",Et="vnearest",sn="focus",fe="center",St="start",yt="end",At="nearest",yi={type:1,name:"scrollIntoView",noKey:!0,noVal:!0,onlyMods:new Set([ce,Re,Pe,mt,pt,dt,gt,ht,vt,bt,Et,sn]),onLoad:({el:t,mods:e,rawKey:n})=>{t.tabIndex||t.setAttribute("tabindex","0");let r={behavior:ce,block:fe,inline:fe};return e.has(ce)&&(r.behavior=ce),e.has(Re)&&(r.behavior=Re),e.has(Pe)&&(r.behavior=Pe),e.has(mt)&&(r.inline=St),e.has(pt)&&(r.inline=fe),e.has(dt)&&(r.inline=yt),e.has(gt)&&(r.inline=At),e.has(ht)&&(r.block=St),e.has(vt)&&(r.block=fe),e.has(bt)&&(r.block=yt),e.has(Et)&&(r.block=At),ft(t,r,e.has("focus")),delete t.dataset[n],()=>{}}};var _t="none",Tt="display",Ti={type:1,name:"show",noKey:!0,mustValue:!0,onLoad:t=>{let{expr:e,el:{style:n},reactivity:{effect:r}}=t;return r(async()=>{e(t)?n.display===_t&&n.removeProperty(Tt):n.setProperty(Tt,_t)})}};var te=document,j=!!te.startViewTransition;var Me="view-transition",Mi={type:1,name:Me,onGlobalInit(){let t=!1;if(document.head.childNodes.forEach(e=>{e instanceof HTMLMetaElement&&e.name===Me&&(t=!0)}),!t){let e=document.createElement("meta");e.name=Me,e.content="same-origin",document.head.appendChild(e)}},onLoad:t=>{if(!j){console.error("Browser does not support view transitions");return}return t.reactivity.effect(()=>{let{el:e,expr:n}=t,r=n(t);if(!r)return;let o=e.style;o.viewTransitionName=r})}};var wt="[a-zA-Z_$]+",an=wt+"[0-9a-zA-Z_$.]*";function xt(t,e,n,r=!0){let o=r?an:wt;return new RegExp(`(?<whole>${t}(?<${e}>${o})${n})`,"g")}var Rt={name:"action",type:0,regexp:xt("@","action","(?<call>\\((?<args>.*)\\))",!1),alter:({action:t,args:e})=>{let n=["ctx"];e&&n.push(...e.split(",").map(o=>o.trim()));let r=n.join(",");return`ctx.actions.${t}.fn(${r})`}};var Pt={name:"get$",type:0,regexp:/(?<whole>\$(?<key>\w*))/gm,alter:t=>{let{key:e}=t;return`ctx.signals.value('${e}')`}},Mt={name:"set$",type:0,regexp:/(?<whole>\$(?<key>\w*)\s*=\s*(?<value>\w*))/gm,alter:({key:t,value:e})=>`ctx.signals.set("${t}", ${e})`};var is={type:2,name:I.ExecuteScript,onGlobalInit:async()=>{D(I.ExecuteScript,({autoRemove:t=`${!0}`,attributes:e=$e,script:n})=>{let r=V(t);if(!n?.length)throw g;let o=document.createElement("script");e.split(`
`).forEach(i=>{let s=i.indexOf(" "),a=s?i.slice(0,s):i,c=s?i.slice(s):"";o.setAttribute(a.trim(),c.trim())}),o.text=n,document.head.appendChild(o),r&&o.remove()})}};var pe=new WeakSet;function kt(t,e,n={}){t instanceof Document&&(t=t.documentElement);let r;typeof e=="string"?r=pn(e):r=e;let o=dn(r),i=cn(t,o,n);return Dt(t,o,i)}function Dt(t,e,n){if(n.head.block){let r=t.querySelector("head"),o=e.querySelector("head");if(r&&o){let i=Ot(o,r,n);Promise.all(i).then(()=>{Dt(t,e,Object.assign(n,{head:{block:!1,ignore:!0}}))});return}}if(n.morphStyle==="innerHTML")return Ct(e,t,n),t.children;if(n.morphStyle==="outerHTML"||n.morphStyle==null){let r=hn(e,t,n);if(!r)throw F;let o=r?.previousSibling,i=r?.nextSibling,s=de(t,r,n);return r?gn(o,s,i):[]}else throw g}function de(t,e,n){if(!(n.ignoreActive&&t===document.activeElement))if(e==null){if(n.callbacks.beforeNodeRemoved(t)===!1)return;t.remove(),n.callbacks.afterNodeRemoved(t);return}else{if(ge(t,e))return n.callbacks.beforeNodeMorphed(t,e)===!1?void 0:(t instanceof HTMLHeadElement&&n.head.ignore||(e instanceof HTMLHeadElement&&t instanceof HTMLHeadElement&&n.head.style!==k.Morph?Ot(e,t,n):(un(e,t),Ct(e,t,n))),n.callbacks.afterNodeMorphed(t,e),t);if(n.callbacks.beforeNodeRemoved(t)===!1||n.callbacks.beforeNodeAdded(e)===!1)return;if(!t.parentElement)throw g;return t.parentElement.replaceChild(e,t),n.callbacks.afterNodeAdded(e),n.callbacks.afterNodeRemoved(t),e}}function Ct(t,e,n){let r=t.firstChild,o=e.firstChild,i;for(;r;){if(i=r,r=i.nextSibling,o==null){if(n.callbacks.beforeNodeAdded(i)===!1)return;e.appendChild(i),n.callbacks.afterNodeAdded(i),$(n,i);continue}if(Vt(i,o,n)){de(o,i,n),o=o.nextSibling,$(n,i);continue}let s=fn(t,e,i,o,n);if(s){o=Nt(o,s,n),de(s,i,n),$(n,i);continue}let a=mn(t,i,o,n);if(a){o=Nt(o,a,n),de(a,i,n),$(n,i);continue}if(n.callbacks.beforeNodeAdded(i)===!1)return;e.insertBefore(i,o),n.callbacks.afterNodeAdded(i),$(n,i)}for(;o!==null;){let s=o;o=o.nextSibling,Ht(s,n)}}function un(t,e){let n=t.nodeType;if(n===1){for(let r of t.attributes)e.getAttribute(r.name)!==r.value&&e.setAttribute(r.name,r.value);for(let r of e.attributes)t.hasAttribute(r.name)||e.removeAttribute(r.name)}if((n===Node.COMMENT_NODE||n===Node.TEXT_NODE)&&e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue),t instanceof HTMLInputElement&&e instanceof HTMLInputElement&&t.type!=="file")e.value=t.value||"",me(t,e,"value"),me(t,e,"checked"),me(t,e,"disabled");else if(t instanceof HTMLOptionElement)me(t,e,"selected");else if(t instanceof HTMLTextAreaElement&&e instanceof HTMLTextAreaElement){let r=t.value,o=e.value;r!==o&&(e.value=r),e.firstChild&&e.firstChild.nodeValue!==r&&(e.firstChild.nodeValue=r)}}function me(t,e,n){let r=t.getAttribute(n),o=e.getAttribute(n);r!==o&&(r?e.setAttribute(n,r):e.removeAttribute(n))}function Ot(t,e,n){let r=[],o=[],i=[],s=[],a=n.head.style,c=new Map;for(let u of t.children)c.set(u.outerHTML,u);for(let u of e.children){let l=c.has(u.outerHTML),m=n.head.shouldReAppend(u),p=n.head.shouldPreserve(u);l||p?m?o.push(u):(c.delete(u.outerHTML),i.push(u)):a===k.Append?m&&(o.push(u),s.push(u)):n.head.shouldRemove(u)!==!1&&o.push(u)}s.push(...c.values());let f=[];for(let u of s){let l=document.createRange().createContextualFragment(u.outerHTML).firstChild;if(!l)throw g;if(n.callbacks.beforeNodeAdded(l)){if(l.hasAttribute("href")||l.hasAttribute("src")){let m,p=new Promise(x=>{m=x});l.addEventListener("load",function(){m(void 0)}),f.push(p)}e.appendChild(l),n.callbacks.afterNodeAdded(l),r.push(l)}}for(let u of o)n.callbacks.beforeNodeRemoved(u)!==!1&&(e.removeChild(u),n.callbacks.afterNodeRemoved(u));return n.head.afterHeadMorphed(e,{added:r,kept:i,removed:o}),f}function H(){}function cn(t,e,n){return{target:t,newContent:e,config:n,morphStyle:n.morphStyle,ignoreActive:n.ignoreActive,idMap:Sn(t,e),deadIds:new Set,callbacks:Object.assign({beforeNodeAdded:H,afterNodeAdded:H,beforeNodeMorphed:H,afterNodeMorphed:H,beforeNodeRemoved:H,afterNodeRemoved:H},n.callbacks),head:Object.assign({style:"merge",shouldPreserve:r=>r.getAttribute("im-preserve")==="true",shouldReAppend:r=>r.getAttribute("im-re-append")==="true",shouldRemove:H,afterHeadMorphed:H},n.head)}}function Vt(t,e,n){return!t||!e?!1:t.nodeType===e.nodeType&&t.tagName===e.tagName?t?.id?.length&&t.id===e.id?!0:ne(n,t,e)>0:!1}function ge(t,e){return!t||!e?!1:t.nodeType===e.nodeType&&t.tagName===e.tagName}function Nt(t,e,n){for(;t!==e;){let r=t;if(t=t?.nextSibling,!r)throw g;Ht(r,n)}return $(n,e),e.nextSibling}function fn(t,e,n,r,o){let i=ne(o,n,e),s=null;if(i>0){s=r;let a=0;for(;s!=null;){if(Vt(n,s,o))return s;if(a+=ne(o,s,t),a>i)return null;s=s.nextSibling}}return s}function mn(t,e,n,r){let o=n,i=e.nextSibling,s=0;for(;o&&i;){if(ne(r,o,t)>0)return null;if(ge(e,o))return o;if(ge(i,o)&&(s++,i=i.nextSibling,s>=2))return null;o=o.nextSibling}return o}var Lt=new DOMParser;function pn(t){let e=t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,"");if(e.match(/<\/html>/)||e.match(/<\/head>/)||e.match(/<\/body>/)){let n=Lt.parseFromString(t,"text/html");if(e.match(/<\/html>/))return pe.add(n),n;{let r=n.firstChild;return r?(pe.add(r),r):null}}else{let r=Lt.parseFromString(`<body><template>${t}</template></body>`,"text/html").body.querySelector("template")?.content;if(!r)throw F;return pe.add(r),r}}function dn(t){if(t==null)return document.createElement("div");if(pe.has(t))return t;if(t instanceof Node){let e=document.createElement("div");return e.append(t),e}else{let e=document.createElement("div");for(let n of[...t])e.append(n);return e}}function gn(t,e,n){let r=[],o=[];for(;t;)r.push(t),t=t.previousSibling;for(;r.length>0;){let i=r.pop();o.push(i),e?.parentElement?.insertBefore(i,e)}for(o.push(e);n;)r.push(n),o.push(n),n=n.nextSibling;for(;r.length;)e?.parentElement?.insertBefore(r.pop(),e.nextSibling);return o}function hn(t,e,n){let r=t.firstChild,o=r,i=0;for(;r;){let s=vn(r,e,n);s>i&&(o=r,i=s),r=r.nextSibling}return o}function vn(t,e,n){return ge(t,e)?.5+ne(n,t,e):0}function Ht(t,e){$(e,t),e.callbacks.beforeNodeRemoved(t)!==!1&&(t.remove(),e.callbacks.afterNodeRemoved(t))}function bn(t,e){return!t.deadIds.has(e)}function En(t,e,n){return t.idMap.get(n)?.has(e)||!1}function $(t,e){let n=t.idMap.get(e);if(n)for(let r of n)t.deadIds.add(r)}function ne(t,e,n){let r=t.idMap.get(e);if(!r)return 0;let o=0;for(let i of r)bn(t,i)&&En(t,i,n)&&++o;return o}function It(t,e){let n=t.parentElement,r=t.querySelectorAll("[id]");for(let o of r){let i=o;for(;i!==n&&i;){let s=e.get(i);s==null&&(s=new Set,e.set(i,s)),s.add(o.id),i=i.parentElement}}}function Sn(t,e){let n=new Map;return It(t,n),It(e,n),n}var vs={type:2,name:I.MergeFragments,onGlobalInit:async t=>{let e=document.createElement("template");D(I.MergeFragments,({fragments:n="<div></div>",selector:r="",mergeMode:o=Be,settleDuration:i=`${300}`,useViewTransition:s=`${!1}`})=>{let a=parseInt(i),c=V(s);e.innerHTML=n.trim(),[...e.content.children].forEach(u=>{if(!(u instanceof Element))throw g;let l=r||`#${u.getAttribute("id")}`,p=[...document.querySelectorAll(l)||[]];if(!p.length)throw g;j&&c?te.startViewTransition(()=>Ft(t,o,a,u,p)):Ft(t,o,a,u,p)})})}};function Ft(t,e,n,r,o){for(let i of o){i.classList.add(W);let s=i.outerHTML,a=i;switch(e){case k.Morph:let f=kt(a,r,{callbacks:{beforeNodeRemoved:(u,l)=>(t.cleanup(u),!0)}});if(!f?.length)throw g;a=f[0];break;case k.Inner:a.innerHTML=r.innerHTML;break;case k.Outer:a.replaceWith(r);break;case k.Prepend:a.prepend(r);break;case k.Append:a.append(r);break;case k.Before:a.before(r);break;case k.After:a.after(r);break;case k.UpsertAttributes:r.getAttributeNames().forEach(u=>{let l=r.getAttribute(u);a.setAttribute(u,l)});break;default:throw g}t.cleanup(a),a.classList.add(W),t.applyPlugins(document.body),setTimeout(()=>{i.classList.remove(W),a.classList.remove(W)},n);let c=a.outerHTML;s!==c&&(a.classList.add(Te),setTimeout(()=>{a.classList.remove(Te)},n))}}var _s={type:2,name:I.MergeSignals,onGlobalInit:async t=>{D(I.MergeSignals,({signals:e="{}",onlyIfMissing:n=`${!1}`})=>{let{signals:r}=t,o=V(n),i=` return Object.assign({...ctx.signals}, ${e})`;try{let a=new Function("ctx",i)(t);r.merge(a,o),t.applyPlugins(document.body)}catch(s){console.log(i),console.error(s);debugger}})}};var Ls={type:2,name:I.RemoveFragments,onGlobalInit:async()=>{D(I.RemoveFragments,({selector:t,settleDuration:e=`${300}`,useViewTransition:n=`${!1}`})=>{if(!t.length)throw g;let r=parseInt(e),o=V(n),i=document.querySelectorAll(t),s=()=>{for(let a of i)a.classList.add(W);setTimeout(()=>{for(let a of i)a.remove()},r)};j&&o?te.startViewTransition(()=>s()):s()})}};var Vs={type:2,name:I.RemoveSignals,onGlobalInit:async t=>{D(I.RemoveSignals,({paths:e=""})=>{let n=e.split(`
`).map(r=>r.trim());if(!n?.length)throw g;t.signals.remove(...n)})}};var An=Symbol.for("preact-signals"),O=1,J=2,oe=4,z=8,he=16,Y=32;function ke(){ve++}function De(){if(ve>1){ve--;return}let t,e=!1;for(;re!==void 0;){let n=re;for(re=void 0,Ie++;n!==void 0;){let r=n._nextBatchedEffect;if(n._nextBatchedEffect=void 0,n._flags&=~J,!(n._flags&z)&&Bt(n))try{n._callback()}catch(o){e||(t=o,e=!0)}n=r}}if(Ie=0,ve--,e)throw t}var b;var re,ve=0,Ie=0,be=0;function Wt(t){if(b===void 0)return;let e=t._node;if(e===void 0||e._target!==b)return e={_version:0,_source:t,_prevSource:b._sources,_nextSource:void 0,_target:b,_prevTarget:void 0,_nextTarget:void 0,_rollbackNode:e},b._sources!==void 0&&(b._sources._nextSource=e),b._sources=e,t._node=e,b._flags&Y&&t._subscribe(e),e;if(e._version===-1)return e._version=0,e._nextSource!==void 0&&(e._nextSource._prevSource=e._prevSource,e._prevSource!==void 0&&(e._prevSource._nextSource=e._nextSource),e._prevSource=b._sources,e._nextSource=void 0,b._sources._nextSource=e,b._sources=e),e}function w(t){this._value=t,this._version=0,this._node=void 0,this._targets=void 0}w.prototype.brand=An;w.prototype._refresh=function(){return!0};w.prototype._subscribe=function(t){this._targets!==t&&t._prevTarget===void 0&&(t._nextTarget=this._targets,this._targets!==void 0&&(this._targets._prevTarget=t),this._targets=t)};w.prototype._unsubscribe=function(t){if(this._targets!==void 0){let e=t._prevTarget,n=t._nextTarget;e!==void 0&&(e._nextTarget=n,t._prevTarget=void 0),n!==void 0&&(n._prevTarget=e,t._nextTarget=void 0),t===this._targets&&(this._targets=n)}};w.prototype.subscribe=function(t){return Oe(()=>{let e=this.value,n=b;b=void 0;try{t(e)}finally{b=n}})};w.prototype.valueOf=function(){return this.value};w.prototype.toString=function(){return this.value+""};w.prototype.toJSON=function(){return this.value};w.prototype.peek=function(){let t=b;b=void 0;try{return this.value}finally{b=t}};Object.defineProperty(w.prototype,"value",{get(){let t=Wt(this);return t!==void 0&&(t._version=this._version),this._value},set(t){if(t!==this._value){if(Ie>100)throw g;this._value=t,this._version++,be++,ke();try{for(let e=this._targets;e!==void 0;e=e._nextTarget)e._target._notify()}finally{De()}}}});function $t(t){return new w(t)}function Bt(t){for(let e=t._sources;e!==void 0;e=e._nextSource)if(e._source._version!==e._version||!e._source._refresh()||e._source._version!==e._version)return!0;return!1}function Gt(t){for(let e=t._sources;e!==void 0;e=e._nextSource){let n=e._source._node;if(n!==void 0&&(e._rollbackNode=n),e._source._node=e,e._version=-1,e._nextSource===void 0){t._sources=e;break}}}function Ut(t){let e=t._sources,n;for(;e!==void 0;){let r=e._prevSource;e._version===-1?(e._source._unsubscribe(e),r!==void 0&&(r._nextSource=e._nextSource),e._nextSource!==void 0&&(e._nextSource._prevSource=r)):n=e,e._source._node=e._rollbackNode,e._rollbackNode!==void 0&&(e._rollbackNode=void 0),e=r}t._sources=n}function B(t){w.call(this,void 0),this._fn=t,this._sources=void 0,this._globalVersion=be-1,this._flags=oe}B.prototype=new w;B.prototype._refresh=function(){if(this._flags&=~J,this._flags&O)return!1;if((this._flags&(oe|Y))===Y||(this._flags&=~oe,this._globalVersion===be))return!0;if(this._globalVersion=be,this._flags|=O,this._version>0&&!Bt(this))return this._flags&=~O,!0;let t=b;try{Gt(this),b=this;let e=this._fn();(this._flags&he||this._value!==e||this._version===0)&&(this._value=e,this._flags&=~he,this._version++)}catch(e){this._value=e,this._flags|=he,this._version++}return b=t,Ut(this),this._flags&=~O,!0};B.prototype._subscribe=function(t){if(this._targets===void 0){this._flags|=oe|Y;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._subscribe(e)}w.prototype._subscribe.call(this,t)};B.prototype._unsubscribe=function(t){if(this._targets!==void 0&&(w.prototype._unsubscribe.call(this,t),this._targets===void 0)){this._flags&=~Y;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e)}};B.prototype._notify=function(){if(!(this._flags&J)){this._flags|=oe|J;for(let t=this._targets;t!==void 0;t=t._nextTarget)t._target._notify()}};Object.defineProperty(B.prototype,"value",{get(){if(this._flags&O)throw g;let t=Wt(this);if(this._refresh(),t!==void 0&&(t._version=this._version),this._flags&he)throw this._value;return this._value}});function Kt(t){return new B(t)}function qt(t){let e=t._cleanup;if(t._cleanup=void 0,typeof e=="function"){ke();let n=b;b=void 0;try{e()}catch(r){throw t._flags&=~O,t._flags|=z,Ce(t),r}finally{b=n,De()}}}function Ce(t){for(let e=t._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e);t._fn=void 0,t._sources=void 0,qt(t)}function _n(t){if(b!==this)throw g;Ut(this),b=t,this._flags&=~O,this._flags&z&&Ce(this),De()}function ie(t){this._fn=t,this._cleanup=void 0,this._sources=void 0,this._nextBatchedEffect=void 0,this._flags=Y}ie.prototype._callback=function(){let t=this._start();try{if(this._flags&z||this._fn===void 0)return;let e=this._fn();typeof e=="function"&&(this._cleanup=e)}finally{t()}};ie.prototype._start=function(){if(this._flags&O)throw g;this._flags|=O,this._flags&=~z,qt(this),Gt(this),ke();let t=b;return b=this,_n.bind(this,t)};ie.prototype._notify=function(){this._flags&J||(this._flags|=J,this._nextBatchedEffect=re,re=this)};ie.prototype._dispose=function(){this._flags|=z,this._flags&O||Ce(this)};function Oe(t){let e=new ie(t);try{e._callback()}catch(n){throw e._dispose(),n}return e._dispose.bind(e)}function jt(t,e=!1){let n={};for(let r in t)if(t.hasOwnProperty(r)){let o=t[r];if(o instanceof w){if(e&&r.startsWith("_"))continue;n[r]=o.value}else n[r]=jt(o)}return n}function Jt(t,e,n=!1){for(let r in e)if(e.hasOwnProperty(r)){let o=e[r];if(o instanceof Object)t[r]||(t[r]={}),Jt(t[r],o,n);else{if(n&&t[r])continue;t[r]=new w(o)}}}function Yt(t,e){for(let n in t)if(t.hasOwnProperty(n)){let r=t[n];r instanceof w?e(n,r):Yt(r,e)}}function Tn(t,...e){let n={};for(let r of e){let o=r.split("."),i=t,s=n;for(let c=0;c<o.length-1;c++){let f=o[c];if(!i[f])return{};s[f]||(s[f]={}),i=i[f],s=s[f]}let a=o[o.length-1];s[a]=i[a]}return n}var Ee=class{constructor(e){this.engine=e;this._signals={}}exists(e){return!!this.signal(e)}signal(e){let n=e.split("."),r=this._signals;for(let i=0;i<n.length-1;i++){let s=n[i];if(!r[s])return null;r=r[s]}let o=n[n.length-1];return r[o]}add(e,n){let r=e.split("."),o=this._signals;for(let s=0;s<r.length-1;s++){let a=r[s];o[a]||(o[a]={}),o=o[a]}let i=r[r.length-1];o[i]=n}value(e){return this.signal(e)?.value}set(e,n){let r=this.upsert(e,n);r.value=n}upsert(e,n){let r=e.split("."),o=this._signals;for(let c=0;c<r.length-1;c++){let f=r[c];o[f]||(o[f]={}),o=o[f]}let i=r[r.length-1],s=o[i];if(s)return s;let a=new w(n);return o[i]=a,a}remove(...e){let n=!1;for(let r of e){let o=r.split("."),i=this._signals;for(let a=0;a<o.length-1;a++){let c=o[a];if(!i[c])return;i=i[c]}let s=o[o.length-1];delete i[s],n=!0}n&&this.engine.applyPlugins(document.body)}merge(e,n=!1){Jt(this._signals,e,n)}subset(...e){return Tn(this.values(),...e)}walk(e){Yt(this._signals,e)}values(e=!1){return jt(this._signals,e)}JSON(e=!0,n=!1){let r=this.values(n);return e?JSON.stringify(r,null,2):JSON.stringify(r)}toString(){return this.JSON()}};var zt="0.20.1";var wn=t=>t.type===0,xn=t=>t.type===2,Rn=t=>t.type===1,Pn=t=>t.type===3,Se=class{constructor(){this._signals=new Ee(this);this.plugins=[];this.macros=[];this.actions={};this.watchers=[];this.reactivity={signal:$t,computed:Kt,effect:Oe};this.removals=new Map}get version(){return zt}load(...e){let n=new Set(this.plugins);e.forEach(r=>{if(r.requiredPlugins){for(let i of r.requiredPlugins)if(!n.has(i))throw K}let o;if(wn(r)){if(this.macros.includes(r))throw X;this.macros.push(r)}else if(xn(r)){if(this.watchers.includes(r))throw X;this.watchers.push(r),o=r.onGlobalInit}else if(Pn(r)){if(this.actions[r.name])throw X;this.actions[r.name]=r}else if(Rn(r)){if(this.plugins.includes(r))throw X;this.plugins.push(r),o=r.onGlobalInit}else throw F;if(o){let i=this;o({get signals(){return i._signals},actions:this.actions,reactivity:this.reactivity,applyPlugins:this.applyPlugins.bind(this),cleanup:this.cleanup.bind(this)})}n.add(r)}),this.applyPlugins(document.body)}cleanup(e){let n=this.removals.get(e);if(n){for(let r of n.set)r();this.removals.delete(e)}}applyPlugins(e){let n=new Set;this.plugins.forEach((r,o)=>{this.walkDownDOM(e,i=>{o||this.cleanup(i);for(let s in i.dataset){let a=`${i.dataset[s]}`||"",c=a;if(!s.startsWith(r.name))continue;if(i.id.length||(i.id=ct(i)),n.clear(),r.tags){let d=i.tagName.toLowerCase();if(![...r.tags].some(A=>d.match(A)))throw K}let f=s.slice(r.name.length),[u,...l]=f.split(".");if(r.noKey&&u.length>0)throw g;if(r.mustKey&&u.length===0)throw g;u.length&&(u=u[0].toLowerCase()+u.slice(1));let m=l.map(d=>{let[y,...A]=d.split("_");return{label:y,args:A}});if(r.onlyMods){for(let d of m)if(!r.onlyMods.has(d.label))throw K}let p=new Map;for(let d of m)p.set(d.label,d.args);if(r.noVal&&c.length)throw g;if(r.mustValue&&!c.length)throw g;let x=/;|\n/,S=[...r.macros?.pre||[],...this.macros,...r.macros?.post||[]];for(let d of S){if(n.has(d))continue;n.add(d);let y=c.split(x),A=[];y.forEach(v=>{let R=v,P=[...R.matchAll(d.regexp)];if(P.length)for(let T of P){if(!T.groups)continue;let{groups:N}=T,{whole:G}=N;R=R.replace(G,d.alter(N))}A.push(R)}),c=A.join(`;
`)}let _=this,E={get signals(){return _._signals},applyPlugins:this.applyPlugins.bind(this),cleanup:this.cleanup.bind(this),actions:this.actions,reactivity:this.reactivity,el:i,rawKey:s,key:u,rawValue:a,value:c,expr:()=>{throw se},mods:p};if(!r.noGenExpr?.(E)&&!r.noVal&&c.length){let d=c.split(x).map(v=>v.trim()).filter(v=>v.length);d[d.length-1]=`return ${d[d.length-1]}`;let y=d.map(v=>`  ${v}`).join(`;
`),A=`try{${y}}catch(e){console.error(\`Error evaluating Datastar expression:
${y.replaceAll("`","\\`")}

Error: \${e.message}

Check if the expression is valid before raising an issue.\`.trim());debugger}`;try{let v=r.argNames||[],R=new Function("ctx",...v,A);E.expr=R}catch(v){let R=new Error(`${v}
with
${A}`);console.error(R);debugger}}let M=r.onLoad(E);M&&(this.removals.has(i)||this.removals.set(i,{id:i.id,set:new Set}),this.removals.get(i).set.add(M))}})})}walkDownDOM(e,n,r=0){if(!e||!(e instanceof HTMLElement||e instanceof SVGElement))return null;for(n(e),r=0,e=e.firstElementChild;e;)this.walkDownDOM(e,n,r++),e=e.nextElementSibling}};var Zt=new Se;Zt.load(et,Rt,Mt,Pt,Qe,Ze);var Xt=Zt;Xt.load();})();
//# sourceMappingURL=datastar-core.js.map
