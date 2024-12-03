"use strict";(()=>{var L="datastar";var ke="Datastar-Request",Le="0.20.1";var Ve="type module";var V={Morph:"morph",Inner:"inner",Outer:"outer",Prepend:"prepend",Append:"append",Before:"before",After:"after",UpsertAttributes:"upsertAttributes"},De=V.Morph,k={MergeFragments:"datastar-merge-fragments",MergeSignals:"datastar-merge-signals",RemoveFragments:"datastar-remove-fragments",RemoveSignals:"datastar-remove-signals",ExecuteScript:"datastar-execute-script"};var en="https://data-star.dev/errors";var c=(t,e)=>{let n=new Error;n.name=`${L}${t}`;let r=`${en}/code?${new URLSearchParams(e)}`;return n.message=`${L}${t}, for more info see ${r}`,n};var tn="computed",Oe={type:1,name:tn,purge:!0,onLoad:({key:t,signals:e,genRX:n})=>{let r=n();if(!t.length)throw c("P1");e.setComputed(t,r)}};var C=t=>t.trim()==="true",$=t=>t.replace(/[A-Z]+(?![a-z])|[A-Z]/g,(e,n)=>(n?"-":"")+e.toLowerCase()),te=t=>new Function(`return Object.assign({}, ${t})`)();var Ce={type:1,name:"signals",purge:!0,onLoad:t=>{let{key:e,genRX:n,signals:r}=t;if(e!="")r.setValue(e,n()());else{let i=te(t.value);t.value=JSON.stringify(i),r.merge(n()())}}};var Fe={type:1,name:"star",onLoad:()=>{alert("YOU ARE PROBABLY OVERCOMPLICATING IT")}};var He={name:"signalValue",type:0,fn:t=>{let e=/(?<path>[\w0-9.]*)((\.value))/gm;return t.replaceAll(e,"ctx.signals.signal('$1').value")}};function We(t){if(t.id)return t.id;let e=0,n=i=>(e=(e<<5)-e+i,e&e),r=i=>i.split("").forEach(o=>n(o.charCodeAt(0)));for(;t.parentNode;){if(t.id){r(`${t.id}`);break}else if(t===t.ownerDocument.documentElement)r(t.tagName);else{for(let i=1,o=t;o.previousElementSibling;o=o.previousElementSibling,i++)n(i);t=t.parentNode}t=t.parentNode}return L+e}var nn=Symbol.for("preact-signals"),D=1,G=2,X=4,j=8,ne=16,K=32;function ye(){re++}function be(){if(re>1){re--;return}let t,e=!1;for(;Y!==void 0;){let n=Y;for(Y=void 0,ve++;n!==void 0;){let r=n._nextBatchedEffect;if(n._nextBatchedEffect=void 0,n._flags&=~G,!(n._flags&j)&&Be(n))try{n._callback()}catch(i){e||(t=i,e=!0)}n=r}}if(ve=0,re--,e)throw c("Z1",t)}var E;var Y,re=0,ve=0,ie=0;function Ue(t){if(E===void 0)return;let e=t._node;if(e===void 0||e._target!==E)return e={_version:0,_source:t,_prevSource:E._sources,_nextSource:void 0,_target:E,_prevTarget:void 0,_nextTarget:void 0,_rollbackNode:e},E._sources!==void 0&&(E._sources._nextSource=e),E._sources=e,t._node=e,E._flags&K&&t._subscribe(e),e;if(e._version===-1)return e._version=0,e._nextSource!==void 0&&(e._nextSource._prevSource=e._prevSource,e._prevSource!==void 0&&(e._prevSource._nextSource=e._nextSource),e._prevSource=E._sources,e._nextSource=void 0,E._sources._nextSource=e,E._sources=e),e}function x(t){this._value=t,this._version=0,this._node=void 0,this._targets=void 0}x.prototype.brand=nn;x.prototype._refresh=function(){return!0};x.prototype._subscribe=function(t){this._targets!==t&&t._prevTarget===void 0&&(t._nextTarget=this._targets,this._targets!==void 0&&(this._targets._prevTarget=t),this._targets=t)};x.prototype._unsubscribe=function(t){if(this._targets!==void 0){let e=t._prevTarget,n=t._nextTarget;e!==void 0&&(e._nextTarget=n,t._prevTarget=void 0),n!==void 0&&(n._prevTarget=e,t._nextTarget=void 0),t===this._targets&&(this._targets=n)}};x.prototype.subscribe=function(t){return oe(()=>{let e=this.value,n=E;E=void 0;try{t(e)}finally{E=n}})};x.prototype.valueOf=function(){return this.value};x.prototype.toString=function(){return this.value+""};x.prototype.toJSON=function(){return this.value};x.prototype.peek=function(){let t=E;E=void 0;try{return this.value}finally{E=t}};Object.defineProperty(x.prototype,"value",{get(){let t=Ue(this);return t!==void 0&&(t._version=this._version),this._value},set(t){if(t!==this._value){if(ve>100)throw c("Z2");this._value=t,this._version++,ie++,ye();try{for(let e=this._targets;e!==void 0;e=e._nextTarget)e._target._notify()}finally{be()}}}});function Be(t){for(let e=t._sources;e!==void 0;e=e._nextSource)if(e._source._version!==e._version||!e._source._refresh()||e._source._version!==e._version)return!0;return!1}function $e(t){for(let e=t._sources;e!==void 0;e=e._nextSource){let n=e._source._node;if(n!==void 0&&(e._rollbackNode=n),e._source._node=e,e._version=-1,e._nextSource===void 0){t._sources=e;break}}}function Ge(t){let e=t._sources,n;for(;e!==void 0;){let r=e._prevSource;e._version===-1?(e._source._unsubscribe(e),r!==void 0&&(r._nextSource=e._nextSource),e._nextSource!==void 0&&(e._nextSource._prevSource=r)):n=e,e._source._node=e._rollbackNode,e._rollbackNode!==void 0&&(e._rollbackNode=void 0),e=r}t._sources=n}function W(t){x.call(this,void 0),this._fn=t,this._sources=void 0,this._globalVersion=ie-1,this._flags=X}W.prototype=new x;W.prototype._refresh=function(){if(this._flags&=~G,this._flags&D)return!1;if((this._flags&(X|K))===K||(this._flags&=~X,this._globalVersion===ie))return!0;if(this._globalVersion=ie,this._flags|=D,this._version>0&&!Be(this))return this._flags&=~D,!0;let t=E;try{$e(this),E=this;let e=this._fn();(this._flags&ne||this._value!==e||this._version===0)&&(this._value=e,this._flags&=~ne,this._version++)}catch(e){this._value=e,this._flags|=ne,this._version++}return E=t,Ge(this),this._flags&=~D,!0};W.prototype._subscribe=function(t){if(this._targets===void 0){this._flags|=X|K;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._subscribe(e)}x.prototype._subscribe.call(this,t)};W.prototype._unsubscribe=function(t){if(this._targets!==void 0&&(x.prototype._unsubscribe.call(this,t),this._targets===void 0)){this._flags&=~K;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e)}};W.prototype._notify=function(){if(!(this._flags&G)){this._flags|=X|G;for(let t=this._targets;t!==void 0;t=t._nextTarget)t._target._notify()}};Object.defineProperty(W.prototype,"value",{get(){if(this._flags&D)throw c("Z2");let t=Ue(this);if(this._refresh(),t!==void 0&&(t._version=this._version),this._flags&ne)throw c("Z3",{value:this._value});return this._value}});function Ke(t){return new W(t)}function je(t){let e=t._cleanup;if(t._cleanup=void 0,typeof e=="function"){ye();let n=E;E=void 0;try{e()}catch(r){throw t._flags&=~D,t._flags|=j,Ee(t),c("Z4",{error:r})}finally{E=n,be()}}}function Ee(t){for(let e=t._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e);t._fn=void 0,t._sources=void 0,je(t)}function rn(t){if(E!==this)throw c("Z5");Ge(this),E=t,this._flags&=~D,this._flags&j&&Ee(this),be()}function z(t){this._fn=t,this._cleanup=void 0,this._sources=void 0,this._nextBatchedEffect=void 0,this._flags=K}z.prototype._callback=function(){let t=this._start();try{if(this._flags&j||this._fn===void 0)return;let e=this._fn();typeof e=="function"&&(this._cleanup=e)}finally{t()}};z.prototype._start=function(){if(this._flags&D)throw c("Z2");this._flags|=D,this._flags&=~j,je(this),$e(this),ye();let t=E;return E=this,rn.bind(this,t)};z.prototype._notify=function(){this._flags&G||(this._flags|=G,this._nextBatchedEffect=Y,Y=this)};z.prototype._dispose=function(){this._flags|=j,this._flags&D||Ee(this)};function oe(t){let e=new z(t);try{e._callback()}catch(n){throw e._dispose(),c("Z6",{error:n})}return e._dispose.bind(e)}function qe(t,e=!1){let n={};for(let r in t)if(t.hasOwnProperty(r)){let i=t[r];if(i instanceof x){if(e&&r.startsWith("_"))continue;n[r]=i.value}else n[r]=qe(i)}return n}function Je(t,e,n=!1){for(let r in e)if(e.hasOwnProperty(r)){let i=e[r];if(i instanceof Object&&!Array.isArray(i))t[r]||(t[r]={}),Je(t[r],i,n);else{if(n&&t[r])continue;t[r]=new x(i)}}}function Ye(t,e){for(let n in t)if(t.hasOwnProperty(n)){let r=t[n];r instanceof x?e(n,r):Ye(r,e)}}function on(t,...e){let n={};for(let r of e){let i=r.split("."),o=t,s=n;for(let l=0;l<i.length-1;l++){let d=i[l];if(!o[d])return{};s[d]||(s[d]={}),o=o[d],s=s[d]}let a=i[i.length-1];s[a]=o[a]}return n}var se=class{constructor(){this._signals={}}exists(e){return!!this.signal(e)}signal(e){let n=e.split("."),r=this._signals;for(let o=0;o<n.length-1;o++){let s=n[o];if(!r[s])return null;r=r[s]}let i=n[n.length-1];return r[i]}setSignal(e,n){let r=e.split("."),i=this._signals;for(let s=0;s<r.length-1;s++){let a=r[s];i[a]||(i[a]={}),i=i[a]}let o=r[r.length-1];i[o]=n}setComputed(e,n){let r=Ke(()=>n());this.setSignal(e,r)}value(e){return this.signal(e)?.value}setValue(e,n){let r=this.upsert(e,n);r.value=n}upsert(e,n){let r=e.split("."),i=this._signals;for(let l=0;l<r.length-1;l++){let d=r[l];i[d]||(i[d]={}),i=i[d]}let o=r[r.length-1],s=i[o];if(s)return s;let a=new x(n);return i[o]=a,a}remove(...e){for(let n of e){let r=n.split("."),i=this._signals;for(let s=0;s<r.length-1;s++){let a=r[s];if(!i[a])return;i=i[a]}let o=r[r.length-1];delete i[o]}}merge(e,n=!1){Je(this._signals,e,n)}subset(...e){return on(this.values(),...e)}walk(e){Ye(this._signals,e)}values(e=!1){return qe(this._signals,e)}JSON(e=!0,n=!1){let r=this.values(n);return e?JSON.stringify(r,null,2):JSON.stringify(r)}toString(){return this.JSON()}};var ae=class{constructor(){this._signals=new se;this.plugins=[];this.macros=[];this.actions={};this.watchers=[];this.removals=new Map}get version(){return Le}load(...e){e.forEach(n=>{let r;switch(n.type){case 0:this.macros.push(n);break;case 2:let i=n;this.watchers.push(i),r=i.onGlobalInit;break;case 3:this.actions[n.name]=n;break;case 1:let o=n;this.plugins.push(o),r=o.onGlobalInit;break;default:throw c("A3",{name:n.name,type:n.type})}if(r){let i=this;r({get signals(){return i._signals},effect:o=>oe(o),actions:this.actions,apply:this.apply.bind(this),cleanup:this.cleanup.bind(this)})}}),this.apply(document.body)}cleanup(e){let n=this.removals.get(e);if(n){for(let r of n.set)r();this.removals.delete(e)}}apply(e){let n=new Set;this.plugins.forEach((r,i)=>{this.walkDownDOM(e,o=>{i||this.cleanup(o);for(let s in o.dataset){let a=`${o.dataset[s]}`||"",l=a;if(!s.startsWith(r.name))continue;o.id.length||(o.id=We(o)),n.clear();let d=s.slice(r.name.length),[f,...u]=d.split(".");f.length&&(f=f[0].toLowerCase()+f.slice(1));let p=new Map;u.forEach(v=>{let[S,...h]=v.split("_");p.set(S,new Set(h))});let A=[...r.macros?.pre||[],...this.macros,...r.macros?.post||[]];for(let v of A)n.has(v)||(n.add(v),l=v.fn(l));let{actions:m,apply:g,cleanup:y}=this,w=this,N;N={get signals(){return w._signals},effect:v=>oe(v),apply:g.bind(this),cleanup:y.bind(this),actions:m,genRX:()=>this.genRX(N,...r.argNames||[]),el:o,rawKey:s,rawValue:a,key:f,value:l,mods:p};let b=r.onLoad(N);b&&(this.removals.has(o)||this.removals.set(o,{id:o.id,set:new Set}),this.removals.get(o).set.add(b)),r?.purge&&delete o.dataset[s]}})})}genRX(e,...n){let r=e.value.split(/;|\n/).map(m=>m.trim()).filter(m=>m!=""),i=r.length-1;r[i].startsWith("return")||(r[i]=`return ${r[i]};`);let s=r.join(`
`),a=/(\w*)\(/gm,l=s.matchAll(a),d=new Set;for(let m of l)d.add(m[1]);let f=Object.keys(this.actions).filter(m=>d.has(m)),p=`${f.map(m=>`const ${m} = ctx.actions.${m}.fn;`).join(`
`)}
${s}`,A=p.trim();f.forEach(m=>{A=A.replaceAll(m+"(",m+"(ctx,")});try{let m=n||[],g=new Function("ctx",...m,A);return(...y)=>g(e,...y)}catch(m){throw c("A5",{error:m,fnContent:p})}}walkDownDOM(e,n){if(!e||!(e instanceof HTMLElement||e instanceof SVGElement))return null;for(n(e),e=e.firstElementChild;e;)this.walkDownDOM(e,n),e=e.nextElementSibling}};var Xe=new ae;Xe.load(Fe,He,Ce,Oe);var ze=Xe;async function sn(t,e){let n=t.getReader(),r;for(;!(r=await n.read()).done;)e(r.value)}function an(t){let e,n,r,i=!1;return function(s){e===void 0?(e=s,n=0,r=-1):e=cn(e,s);let a=e.length,l=0;for(;n<a;){i&&(e[n]===10&&(l=++n),i=!1);let d=-1;for(;n<a&&d===-1;++n)switch(e[n]){case 58:r===-1&&(r=n-l);break;case 13:i=!0;case 10:d=n;break}if(d===-1)break;t(e.subarray(l,d),r),l=n,r=-1}l===a?e=void 0:l!==0&&(e=e.subarray(l),n-=l)}}function ln(t,e,n){let r=Ze(),i=new TextDecoder;return function(s,a){if(s.length===0)n?.(r),r=Ze();else if(a>0){let l=i.decode(s.subarray(0,a)),d=a+(s[a+1]===32?2:1),f=i.decode(s.subarray(d));switch(l){case"data":r.data=r.data?r.data+`
`+f:f;break;case"event":r.event=f;break;case"id":t(r.id=f);break;case"retry":let u=parseInt(f,10);isNaN(u)||e(r.retry=u);break}}}}function cn(t,e){let n=new Uint8Array(t.length+e.length);return n.set(t),n.set(e,t.length),n}function Ze(){return{data:"",event:"",id:"",retry:void 0}}var un="text/event-stream",fn=1e3,Qe="last-event-id";function et(t,{signal:e,headers:n,onopen:r,onmessage:i,onclose:o,onerror:s,openWhenHidden:a,fetch:l,retryScaler:d=2,retryMaxWaitMs:f=3e4,retryMaxCount:u=10,...p}){return new Promise((A,m)=>{let g=0,y={...n};y.accept||(y.accept=un);let w;function N(){w.abort(),document.hidden||I()}a||document.addEventListener("visibilitychange",N);let b=fn,v=0;function S(){document.removeEventListener("visibilitychange",N),window.clearTimeout(v),w.abort()}e?.addEventListener("abort",()=>{S(),A()});let h=l??window.fetch,_=r??function(){};async function I(){w=new AbortController;try{let P=await h(t,{...p,headers:y,signal:w.signal});await _(P),await sn(P.body,an(ln(M=>{M?y[Qe]=M:delete y[Qe]},M=>{b=M},i))),o?.(),S(),A()}catch(P){if(!w.signal.aborted)try{let M=s?.(P)??b;window.clearTimeout(v),v=window.setTimeout(I,M),b*=d,b=Math.min(b,f),g++,g>=u?(S(),m(c("SSE_MAX_RETRIES",{retryInterval:b,retryMaxCount:u,...p}))):console.error(`Datastar failed to reach ${p.method}:${t.toString()} retry in ${M}ms`)}catch(M){S(),m(M)}}}I()})}var q=`${L}-sse`,Se=`${L}-settling`,U=`${L}-swapping`,le="started",ce="finished";function O(t,e){document.addEventListener(q,n=>{if(n.detail.type!=t)return;let{argsRaw:r}=n.detail;e(r)})}function Te(t,e){document.dispatchEvent(new CustomEvent(q,{detail:{type:t,argsRaw:e}}))}var tt=t=>`${t}`.includes("text/event-stream"),nt={type:3,name:"sse",fn:async(t,e,n={method:"GET",headers:{},onlyRemote:!0})=>{let{el:{id:r},signals:i}=t,{headers:o,onlyRemote:s}=n,a=n.method.toUpperCase();try{if(Te(le,{elId:r}),!e?.length)throw c("B1");let l=Object.assign({"Content-Type":"application/json",[ke]:!0},o),d={method:a,headers:l,onmessage:p=>{if(!p.event.startsWith(L))return;let A=p.event,m={},g=p.data.split(`
`);for(let w of g){let N=w.indexOf(" "),b=w.slice(0,N),v=m[b];v||(v=[],m[b]=v);let S=w.slice(N+1).trim();v.push(S)}let y={};for(let[w,N]of Object.entries(m))y[w]=N.join(`
`);Te(A,y)},onerror:p=>{if(tt(p))throw c("B2",{url:e,error:p});p&&console.error(p.message)}},f=new URL(e,window.location.origin),u=i.JSON(!1,s);if(a==="GET"){let p=new URLSearchParams(f.search);p.set(L,u),f.search=p.toString()}else d.body=u;try{await et(f.toString(),d)}catch(p){if(!tt(p))throw c("B3",{method:a,url:e,error:p})}}finally{Te(ce,{elId:r})}}};var dn=`${L}-indicator`,ei=`${dn}-loading`,rt={type:1,name:"indicator",onLoad:({value:t,signals:e,el:n,key:r})=>{if(r.length)throw c("C1");if(!t.length)throw c("C2");let i=e.upsert(t,!1),o=s=>{let{type:a,argsRaw:{elId:l}}=s.detail;if(l===n.id)switch(a){case le:i.value=!0;break;case ce:i.value=!1;break}};return document.addEventListener(q,o),()=>{document.removeEventListener(q,o)}}};var it={type:2,name:k.ExecuteScript,onGlobalInit:async()=>{O(k.ExecuteScript,({autoRemove:t=`${!0}`,attributes:e=Ve,script:n})=>{let r=C(t);if(!n?.length)throw c("D1");let i=document.createElement("script");e.split(`
`).forEach(o=>{let s=o.indexOf(" "),a=s?o.slice(0,s):o,l=s?o.slice(s):"";i.setAttribute(a.trim(),l.trim())}),i.text=n,document.head.appendChild(i),r&&i.remove()})}};var Z=document,J=!!Z.startViewTransition;var fe=new WeakSet;function lt(t,e,n={}){t instanceof Document&&(t=t.documentElement);let r;typeof e=="string"?r=yn(e):r=e;let i=bn(r),o=gn(t,i,n);return ct(t,i,o)}function ct(t,e,n){if(n.head.block){let r=t.querySelector("head"),i=e.querySelector("head");if(r&&i){let o=ft(i,r,n);Promise.all(o).then(()=>{ct(t,e,Object.assign(n,{head:{block:!1,ignore:!0}}))});return}}if(n.morphStyle==="innerHTML")return ut(e,t,n),t.children;if(n.morphStyle==="outerHTML"||n.morphStyle==null){let r=Sn(e,t,n);if(!r)throw c("Y1",{old:t,new:e});let i=r?.previousSibling,o=r?.nextSibling,s=de(t,r,n);return r?En(i,s,o):[]}else throw c("Y2",{style:n.morphStyle})}function de(t,e,n){if(!(n.ignoreActive&&t===document.activeElement))if(e==null){if(n.callbacks.beforeNodeRemoved(t)===!1)return;t.remove(),n.callbacks.afterNodeRemoved(t);return}else{if(pe(t,e))return n.callbacks.beforeNodeMorphed(t,e)===!1?void 0:(t instanceof HTMLHeadElement&&n.head.ignore||(e instanceof HTMLHeadElement&&t instanceof HTMLHeadElement&&n.head.style!==V.Morph?ft(e,t,n):(mn(e,t),ut(e,t,n))),n.callbacks.afterNodeMorphed(t,e),t);if(n.callbacks.beforeNodeRemoved(t)===!1||n.callbacks.beforeNodeAdded(e)===!1)return;if(!t.parentElement)throw c("Y3",{oldNode:t});return t.parentElement.replaceChild(e,t),n.callbacks.afterNodeAdded(e),n.callbacks.afterNodeRemoved(t),e}}function ut(t,e,n){let r=t.firstChild,i=e.firstChild,o;for(;r;){if(o=r,r=o.nextSibling,i==null){if(n.callbacks.beforeNodeAdded(o)===!1)return;e.appendChild(o),n.callbacks.afterNodeAdded(o),B(n,o);continue}if(dt(o,i,n)){de(i,o,n),i=i.nextSibling,B(n,o);continue}let s=hn(t,e,o,i,n);if(s){i=ot(i,s,n),de(s,o,n),B(n,o);continue}let a=vn(t,o,i,n);if(a){i=ot(i,a,n),de(a,o,n),B(n,o);continue}if(n.callbacks.beforeNodeAdded(o)===!1)return;e.insertBefore(o,i),n.callbacks.afterNodeAdded(o),B(n,o)}for(;i!==null;){let s=i;i=i.nextSibling,pt(s,n)}}function mn(t,e){let n=t.nodeType;if(n===1){for(let r of t.attributes)e.getAttribute(r.name)!==r.value&&e.setAttribute(r.name,r.value);for(let r of e.attributes)t.hasAttribute(r.name)||e.removeAttribute(r.name)}if((n===Node.COMMENT_NODE||n===Node.TEXT_NODE)&&e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue),t instanceof HTMLInputElement&&e instanceof HTMLInputElement&&t.type!=="file")e.value=t.value||"",ue(t,e,"value"),ue(t,e,"checked"),ue(t,e,"disabled");else if(t instanceof HTMLOptionElement)ue(t,e,"selected");else if(t instanceof HTMLTextAreaElement&&e instanceof HTMLTextAreaElement){let r=t.value,i=e.value;r!==i&&(e.value=r),e.firstChild&&e.firstChild.nodeValue!==r&&(e.firstChild.nodeValue=r)}}function ue(t,e,n){let r=t.getAttribute(n),i=e.getAttribute(n);r!==i&&(r?e.setAttribute(n,r):e.removeAttribute(n))}function ft(t,e,n){let r=[],i=[],o=[],s=[],a=n.head.style,l=new Map;for(let f of t.children)l.set(f.outerHTML,f);for(let f of e.children){let u=l.has(f.outerHTML),p=n.head.shouldReAppend(f),A=n.head.shouldPreserve(f);u||A?p?i.push(f):(l.delete(f.outerHTML),o.push(f)):a===V.Append?p&&(i.push(f),s.push(f)):n.head.shouldRemove(f)!==!1&&i.push(f)}s.push(...l.values());let d=[];for(let f of s){let u=document.createRange().createContextualFragment(f.outerHTML).firstChild;if(!u)throw c("Y4",{newNode:f});if(n.callbacks.beforeNodeAdded(u)){if(u.hasAttribute("href")||u.hasAttribute("src")){let p,A=new Promise(m=>{p=m});u.addEventListener("load",function(){p(void 0)}),d.push(A)}e.appendChild(u),n.callbacks.afterNodeAdded(u),r.push(u)}}for(let f of i)n.callbacks.beforeNodeRemoved(f)!==!1&&(e.removeChild(f),n.callbacks.afterNodeRemoved(f));return n.head.afterHeadMorphed(e,{added:r,kept:o,removed:i}),d}function F(){}function gn(t,e,n){return{target:t,newContent:e,config:n,morphStyle:n.morphStyle,ignoreActive:n.ignoreActive,idMap:wn(t,e),deadIds:new Set,callbacks:Object.assign({beforeNodeAdded:F,afterNodeAdded:F,beforeNodeMorphed:F,afterNodeMorphed:F,beforeNodeRemoved:F,afterNodeRemoved:F},n.callbacks),head:Object.assign({style:"merge",shouldPreserve:r=>r.getAttribute("im-preserve")==="true",shouldReAppend:r=>r.getAttribute("im-re-append")==="true",shouldRemove:F,afterHeadMorphed:F},n.head)}}function dt(t,e,n){return!t||!e?!1:t.nodeType===e.nodeType&&t.tagName===e.tagName?t?.id?.length&&t.id===e.id?!0:Q(n,t,e)>0:!1}function pe(t,e){return!t||!e?!1:t.nodeType===e.nodeType&&t.tagName===e.tagName}function ot(t,e,n){for(;t!==e;){let r=t;if(t=t?.nextSibling,!r)throw c("Y5",{startInclusive:t,endExclusive:e});pt(r,n)}return B(n,e),e.nextSibling}function hn(t,e,n,r,i){let o=Q(i,n,e),s=null;if(o>0){s=r;let a=0;for(;s!=null;){if(dt(n,s,i))return s;if(a+=Q(i,s,t),a>o)return null;s=s.nextSibling}}return s}function vn(t,e,n,r){let i=n,o=e.nextSibling,s=0;for(;i&&o;){if(Q(r,i,t)>0)return null;if(pe(e,i))return i;if(pe(o,i)&&(s++,o=o.nextSibling,s>=2))return null;i=i.nextSibling}return i}var st=new DOMParser;function yn(t){let e=t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,"");if(e.match(/<\/html>/)||e.match(/<\/head>/)||e.match(/<\/body>/)){let n=st.parseFromString(t,"text/html");if(e.match(/<\/html>/))return fe.add(n),n;{let r=n.firstChild;return r?(fe.add(r),r):null}}else{let r=st.parseFromString(`<body><template>${t}</template></body>`,"text/html").body.querySelector("template")?.content;if(!r)throw c("Y6",{newContent:t});return fe.add(r),r}}function bn(t){if(t==null)return document.createElement("div");if(fe.has(t))return t;if(t instanceof Node){let e=document.createElement("div");return e.append(t),e}else{let e=document.createElement("div");for(let n of[...t])e.append(n);return e}}function En(t,e,n){let r=[],i=[];for(;t;)r.push(t),t=t.previousSibling;for(;r.length>0;){let o=r.pop();i.push(o),e?.parentElement?.insertBefore(o,e)}for(i.push(e);n;)r.push(n),i.push(n),n=n.nextSibling;for(;r.length;)e?.parentElement?.insertBefore(r.pop(),e.nextSibling);return i}function Sn(t,e,n){let r=t.firstChild,i=r,o=0;for(;r;){let s=Tn(r,e,n);s>o&&(i=r,o=s),r=r.nextSibling}return i}function Tn(t,e,n){return pe(t,e)?.5+Q(n,t,e):0}function pt(t,e){B(e,t),e.callbacks.beforeNodeRemoved(t)!==!1&&(t.remove(),e.callbacks.afterNodeRemoved(t))}function An(t,e){return!t.deadIds.has(e)}function _n(t,e,n){return t.idMap.get(n)?.has(e)||!1}function B(t,e){let n=t.idMap.get(e);if(n)for(let r of n)t.deadIds.add(r)}function Q(t,e,n){let r=t.idMap.get(e);if(!r)return 0;let i=0;for(let o of r)An(t,o)&&_n(t,o,n)&&++i;return i}function at(t,e){let n=t.parentElement,r=t.querySelectorAll("[id]");for(let i of r){let o=i;for(;o!==n&&o;){let s=e.get(o);s==null&&(s=new Set,e.set(o,s)),s.add(i.id),o=o.parentElement}}}function wn(t,e){let n=new Map;return at(t,n),at(e,n),n}var gt={type:2,name:k.MergeFragments,onGlobalInit:async t=>{let e=document.createElement("template");O(k.MergeFragments,({fragments:n="<div></div>",selector:r="",mergeMode:i=De,settleDuration:o=`${300}`,useViewTransition:s=`${!1}`})=>{let a=parseInt(o),l=C(s);e.innerHTML=n.trim(),[...e.content.children].forEach(f=>{if(!(f instanceof Element))throw c("E1");let u=r||`#${f.getAttribute("id")}`,p=[...document.querySelectorAll(u)||[]];if(!p.length)throw c("E2",{selectorOrID:u});J&&l?Z.startViewTransition(()=>mt(t,i,a,f,p)):mt(t,i,a,f,p)})})}};function mt(t,e,n,r,i){for(let o of i){o.classList.add(U);let s=o.outerHTML,a=o;switch(e){case V.Morph:let f=lt(a,r,{callbacks:{beforeNodeRemoved:(u,p)=>(t.cleanup(u),!0)}});if(!f?.length)throw c("E3");a=f[0];break;case V.Inner:a.innerHTML=r.innerHTML;break;case V.Outer:a.replaceWith(r);break;case V.Prepend:a.prepend(r);break;case V.Append:a.append(r);break;case V.Before:a.before(r);break;case V.After:a.after(r);break;case V.UpsertAttributes:r.getAttributeNames().forEach(u=>{let p=r.getAttribute(u);a.setAttribute(u,p)});break;default:throw c("E4",{mergeMode:e})}t.cleanup(a);let l=a.classList;l.add(U),t.apply(document.body),setTimeout(()=>{o.classList.remove(U),l.remove(U)},n);let d=a.outerHTML;s!==d&&(l.add(Se),setTimeout(()=>{l.remove(Se)},n))}}var ht={type:2,name:k.MergeSignals,onGlobalInit:async t=>{O(k.MergeSignals,({signals:e="{}",onlyIfMissing:n=`${!1}`})=>{let{signals:r}=t,i=C(n);r.merge(te(e),i),t.apply(document.body)})}};var vt={type:2,name:k.RemoveFragments,onGlobalInit:async()=>{O(k.RemoveFragments,({selector:t,settleDuration:e=`${300}`,useViewTransition:n=`${!1}`})=>{if(!t.length)throw c("F1");let r=parseInt(e),i=C(n),o=document.querySelectorAll(t),s=()=>{for(let a of o)a.classList.add(U);setTimeout(()=>{for(let a of o)a.remove()},r)};J&&i?Z.startViewTransition(()=>s()):s()})}};var yt={type:2,name:k.RemoveSignals,onGlobalInit:async t=>{O(k.RemoveSignals,({paths:e=""})=>{let n=e.split(`
`).map(r=>r.trim());if(!n?.length)throw c("G1");t.signals.remove(...n),t.apply(document.body)})}};var bt={type:3,name:"clipboard",fn:(t,e)=>{if(!navigator.clipboard)throw c("H1");navigator.clipboard.writeText(e)}};var Et="once",St="half",Tt="full",At={type:1,name:"intersects",mods:new Set([Et,St,Tt]),onLoad:({el:t,key:e,rawKey:n,mods:r,genRX:i})=>{if(e.length)throw c("J1");let o={threshold:0};r.has(Tt)?o.threshold=1:r.has(St)&&(o.threshold=.5);let s=i(),a=new IntersectionObserver(l=>{l.forEach(d=>{d.isIntersecting&&(s(),r.has(Et)&&(a.disconnect(),delete t.dataset[n]))})},o);return a.observe(t),()=>a.disconnect()}};var xn="session",Rn="local",Pn="remote",_t={type:1,name:"persist",mods:new Set([Rn,xn,Pn]),onLoad:()=>{throw c("K1")}};var wt={type:1,name:"replaceUrl",onLoad:({key:t,value:e,effect:n,genRX:r})=>{if(t.length)throw c("L1");if(!e.length)throw c("L2");let i=r();return n(()=>{let o=i(),s=window.location.href,a=new URL(o,s).toString();window.history.replaceState({},"",a)})}};var me="smooth",we="instant",Ne="auto",Nt="hstart",xt="hcenter",Rt="hend",Pt="hnearest",Mt="vstart",It="vcenter",kt="vend",Lt="vnearest",Mn="focus",ge="center",Vt="start",Dt="end",Ot="nearest",Ct={type:1,name:"scrollIntoView",mods:new Set([me,we,Ne,Nt,xt,Rt,Pt,Mt,It,kt,Lt,Mn]),onLoad:({el:t,mods:e,key:n,value:r,rawKey:i})=>{if(n.length)throw c("M1");if(r.length)throw c("M2");t.tabIndex||t.setAttribute("tabindex","0");let o={behavior:me,block:ge,inline:ge};if(e.has(me)&&(o.behavior=me),e.has(we)&&(o.behavior=we),e.has(Ne)&&(o.behavior=Ne),e.has(Nt)&&(o.inline=Vt),e.has(xt)&&(o.inline=ge),e.has(Rt)&&(o.inline=Dt),e.has(Pt)&&(o.inline=Ot),e.has(Mt)&&(o.block=Vt),e.has(It)&&(o.block=ge),e.has(kt)&&(o.block=Dt),e.has(Lt)&&(o.block=Ot),!(t instanceof HTMLElement||t instanceof SVGElement))throw c("M3",t);return t.tabIndex||t.setAttribute("tabindex","0"),t.scrollIntoView(o),e.has("focus")&&t.focus(),delete t.dataset[i],()=>{}}};var Ft="none",Ht="display",Wt={type:1,name:"show",onLoad:({el:{style:t},key:e,value:n,genRX:r,effect:i})=>{if(e.length)throw c("N1");if(!n.length)throw c("N2");let o=r();return i(async()=>{o()?t.display===Ft&&t.removeProperty(Ht):t.setProperty(Ht,Ft)})}};var xe="view-transition",Ut={type:1,name:xe,onGlobalInit(){let t=!1;if(document.head.childNodes.forEach(e=>{e instanceof HTMLMetaElement&&e.name===xe&&(t=!0)}),!t){let e=document.createElement("meta");e.name=xe,e.content="same-origin",document.head.appendChild(e)}},onLoad:({effect:t,el:e,genRX:n})=>{if(!J){console.error("Browser does not support view transitions");return}let r=n();return t(()=>{let i=r();if(!i?.length)return;let o=e.style;o.viewTransitionName=i})}};var In=/^data:(?<mime>[^;]+);base64,(?<contents>.*)$/,Bt=["change","input","keydown"],$t={type:1,name:"bind",onLoad:t=>{let{el:e,value:n,genRX:r,key:i,signals:o,effect:s}=t,a=()=>{},l=()=>{},d=i==="";if(d){let u=n;if(typeof u!="string")throw c("Q1");let p=e.tagName.toLowerCase(),A="",m=p.includes("input"),g=e.getAttribute("type"),y=p.includes("checkbox")||m&&g==="checkbox";y&&(A=!1),m&&g==="number"&&(A=0);let N=p.includes("select"),b=p.includes("radio")||m&&g==="radio",v=m&&g==="file";b&&(e.getAttribute("name")?.length||e.setAttribute("name",u)),o.upsert(u,A),a=()=>{let S="value"in e,h=o.value(u),_=`${h}`;if(y||b){let I=e;y?I.checked=!!h||h==="true":b&&(I.checked=_===I.value)}else if(!v)if(N){let I=e;I.multiple?Array.from(I.options).forEach(P=>{P?.disabled||(Array.isArray(h)||typeof h=="string"?P.selected=h.includes(P.value):typeof h=="number"?P.selected=h===Number(P.value):P.selected=h)}):I.value=_}else S?e.value=_:e.setAttribute("value",_)},l=async()=>{if(v){let _=[...e?.files||[]],I=[],P=[],M=[];await Promise.all(_.map(Ie=>new Promise(Qt=>{let H=new FileReader;H.onload=()=>{if(typeof H.result!="string")throw c("Q2",{type:typeof H.result});let he=H.result.match(In);if(!he?.groups)throw c("Q3",{result:H.result});I.push(he.groups.contents),P.push(he.groups.mime),M.push(Ie.name)},H.onloadend=()=>Qt(void 0),H.readAsDataURL(Ie)}))),o.setValue(u,I);let Pe=`${u}Mimes`,Me=`${u}Names`;Pe in o&&o.upsert(Pe,P),Me in o&&o.upsert(Me,M);return}let S=o.value(u),h=e||e;if(typeof S=="number"){let _=Number(h.value||h.getAttribute("value"));o.setValue(u,_)}else if(typeof S=="string"){let _=h.value||h.getAttribute("value")||"";o.setValue(u,_)}else if(typeof S=="boolean")if(y){let _=h.checked||h.getAttribute("checked")==="true";o.setValue(u,_)}else{let _=!!(h.value||h.getAttribute("value"));o.setValue(u,_)}else if(!(typeof S>"u"))if(Array.isArray(S)){if(N){let P=[...e.selectedOptions].filter(M=>M.selected).map(M=>M.value);o.setValue(u,P)}else{let _=JSON.stringify(h.value.split(","));o.setValue(u,_)}console.log(h.value)}else throw c("Q4",{current:typeof S})}}else{let u=$(i),p=r();a=()=>{let A=p(),m;typeof A=="string"?m=A:m=JSON.stringify(A),!m||m==="false"||m==="null"||m==="undefined"?e.removeAttribute(u):e.setAttribute(u,m)}}d&&Bt.forEach(u=>{e.addEventListener(u,l)});let f=s(async()=>{a()});return()=>{f(),d&&Bt.forEach(u=>{e.removeEventListener(u,l)})}}};var Gt={type:1,name:"class",onLoad:({key:t,el:e,genRX:n,effect:r})=>{let i=e.classList,o=n();return r(()=>{if(t===""){let s=o();for(let[a,l]of Object.entries(s)){let d=a.split(" ");l?i.add(...d):i.remove(...d)}}else{let s=o(),a=$(t);s?i.add(a):i.remove(a)}})}};function Re(t){if(!t||t.size<=0)return 0;for(let e of t){if(e.endsWith("ms"))return Number(e.replace("ms",""));if(e.endsWith("s"))return Number(e.replace("s",""))*1e3;try{return parseFloat(e)}catch{}}return 0}function ee(t,e,n=!1){return t?t.has(e):n}function Kt(t,e,n=!1,r=!0){let i=-1,o=()=>i&&clearTimeout(i);return function(...a){o(),n&&!i&&t(...a),i=setTimeout(()=>{r&&t(...a),o()},e)}}function jt(t,e,n=!0,r=!1){let i=!1;return function(...s){i||(n&&t(...s),i=!0,setTimeout(()=>{i=!1,r&&t(...s)},e))}}var kn=new Set(["window","once","passive","capture","debounce","throttle","remote","outside"]),qt={type:1,name:"on",argNames:["evt"],onLoad:({el:t,key:e,genRX:n,mods:r,signals:i,effect:o})=>{let s=n(),a=t;r.has("window")&&(a=window);let l=g=>s(g),d=r.get("debounce");if(d){let g=Re(d),y=ee(d,"leading",!1),w=!ee(d,"noTrail",!1);l=Kt(l,g,y,w)}let f=r.get("throttle");if(f){let g=Re(f),y=!ee(f,"noLeading",!1),w=ee(f,"trail",!1);l=jt(l,g,y,w)}let u={capture:!0,passive:!1,once:!1};r.has("capture")||(u.capture=!1),r.has("passive")&&(u.passive=!0),r.has("once")&&(u.once=!0),[...r.keys()].filter(g=>!kn.has(g)).forEach(g=>{let y=r.get(g)||[],w=l;l=()=>{let b=event,v=b[g],S;if(typeof v=="function")S=v(...y);else if(typeof v=="boolean")S=v;else if(typeof v=="string"){let h=v.toLowerCase().trim(),_=[...y].join("").toLowerCase().trim();S=h===_}else throw c("R1",{attrName:g,key:e,el:t});S&&w(b)}});let A="",m=$(e).toLowerCase();switch(m){case"load":return l(),delete t.dataset.onLoad,()=>{};case"raf":let g,y=()=>{l(),g=requestAnimationFrame(y)};return g=requestAnimationFrame(y),()=>{g&&cancelAnimationFrame(g)};case"signals-change":return o(()=>{let N=r.has("remote"),b=i.JSON(!1,N);A!==b&&(A=b,l())});default:if(r.has("outside")){a=document;let N=l,b=!1;l=S=>{let h=S?.target;if(!h)return;let _=t.id===h.id;_&&b&&(b=!1),!_&&!b&&(N(S),b=!0)}}return a.addEventListener(m,l,u),()=>{a.removeEventListener(m,l)}}}};var Jt={type:1,name:"ref",onLoad:({el:t,key:e,value:n,signals:r})=>{if(e.length)throw c("S1");if(!n.length)throw c("S2");return r.upsert(n,t),()=>r.remove(n)}};var Yt={type:1,name:"text",onLoad:t=>{let{el:e,genRX:n,effect:r}=t,i=n();return e instanceof HTMLElement||c("Element is not HTMLElement"),r(()=>{let o=i(t);e.textContent=`${o}`})}};var{round:Ln,max:Vn,min:Dn}=Math,Xt={type:3,name:"fit",fn:(t,e,n,r,i,o,s=!1,a=!1)=>{let l=(e-n)/(r-n)*(o-i)+i;return a&&(l=Ln(l)),s&&(l=Vn(i,Dn(o,l))),l}};var zt={type:3,name:"setAll",fn:(t,e,n)=>{let r=new RegExp(e);t.signals.walk((i,o)=>r.test(i)&&(o.value=n))}};var Zt={type:3,name:"toggleAll",fn:(t,e)=>{let n=new RegExp(e);t.signals.walk((r,i)=>n.test(r)&&(i.value=!i.value))}};ze.load($t,rt,Jt,Gt,qt,Wt,Yt,nt,gt,ht,vt,yt,it,bt,At,_t,wt,Ct,Ut,Xt,zt,Zt);})();
//# sourceMappingURL=datastar.js.map
