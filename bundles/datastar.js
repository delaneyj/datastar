"use strict";(()=>{var tn="computed",Pe={type:1,name:tn,keyReq:1,valReq:1,onLoad:({key:t,signals:e,genRX:n})=>{let r=n();e.setComputed(t,r)}};var O=t=>t.trim()==="true",$=t=>t.replace(/[A-Z]+(?![a-z])|[A-Z]/g,(e,n)=>(n?"-":"")+e.toLowerCase()),ke=t=>t.replace(/(?:^\w|[A-Z]|\b\w)/g,function(e,n){return n==0?e.toLowerCase():e.toUpperCase()}).replace(/\s+/g,""),te=t=>new Function(`return Object.assign({}, ${t})`)();var Ie={type:1,name:"signals",valReq:1,removeOnLoad:!0,onLoad:t=>{let{key:e,genRX:n,signals:r}=t;if(e!="")r.setValue(e,n()());else{let i=te(t.value);t.value=JSON.stringify(i),r.merge(n()())}}};var Le={type:1,name:"star",keyReq:2,valReq:2,onLoad:()=>{alert("YOU ARE PROBABLY OVERCOMPLICATING IT")}};var Ce={name:"signalValue",type:0,fn:t=>{let e=/(?<path>[\w0-9.]*)((\.value))/gm;return t.replaceAll(e,"ctx.signals.signal('$1').value")}};var I="datastar";var De="Datastar-Request",Ve="0.21.0-beta1";var Oe="type module";var L={Morph:"morph",Inner:"inner",Outer:"outer",Prepend:"prepend",Append:"append",Before:"before",After:"after",UpsertAttributes:"upsertAttributes"},Fe=L.Morph,N={MergeFragments:"datastar-merge-fragments",MergeSignals:"datastar-merge-signals",RemoveFragments:"datastar-remove-fragments",RemoveSignals:"datastar-remove-signals",ExecuteScript:"datastar-execute-script"};function He(t){if(t.id)return t.id;let e=0,n=i=>(e=(e<<5)-e+i,e&e),r=i=>i.split("").forEach(s=>n(s.charCodeAt(0)));for(;t.parentNode;){if(t.id){r(`${t.id}`);break}else if(t===t.ownerDocument.documentElement)r(t.tagName);else{for(let i=1,s=t;s.previousElementSibling;s=s.previousElementSibling,i++)n(i);t=t.parentNode}t=t.parentNode}return I+e}var nn="http://localhost:8080/errors";var c=(t,e)=>{let n=new Error;n.name=`error ${t}`;let r=`${nn}/${t}?${new URLSearchParams(e)}`;return n.message=`for more info see ${r}`,n};var rn=Symbol.for("preact-signals"),D=1,B=2,X=4,j=8,ne=16,G=32;function be(){re++}function ye(){if(re>1){re--;return}let t,e=!1;for(;z!==void 0;){let n=z;for(z=void 0,ve++;n!==void 0;){let r=n._nextBatchedEffect;if(n._nextBatchedEffect=void 0,n._flags&=~B,!(n._flags&j)&&We(n))try{n._callback()}catch(i){e||(t=i,e=!0)}n=r}}if(ve=0,re--,e)throw c("BatchError, error",{error:t})}var T;var z,re=0,ve=0,ie=0;function qe(t){if(T===void 0)return;let e=t._node;if(e===void 0||e._target!==T)return e={_version:0,_source:t,_prevSource:T._sources,_nextSource:void 0,_target:T,_prevTarget:void 0,_nextTarget:void 0,_rollbackNode:e},T._sources!==void 0&&(T._sources._nextSource=e),T._sources=e,t._node=e,T._flags&G&&t._subscribe(e),e;if(e._version===-1)return e._version=0,e._nextSource!==void 0&&(e._nextSource._prevSource=e._prevSource,e._prevSource!==void 0&&(e._prevSource._nextSource=e._nextSource),e._prevSource=T._sources,e._nextSource=void 0,T._sources._nextSource=e,T._sources=e),e}function R(t){this._value=t,this._version=0,this._node=void 0,this._targets=void 0}R.prototype.brand=rn;R.prototype._refresh=function(){return!0};R.prototype._subscribe=function(t){this._targets!==t&&t._prevTarget===void 0&&(t._nextTarget=this._targets,this._targets!==void 0&&(this._targets._prevTarget=t),this._targets=t)};R.prototype._unsubscribe=function(t){if(this._targets!==void 0){let e=t._prevTarget,n=t._nextTarget;e!==void 0&&(e._nextTarget=n,t._prevTarget=void 0),n!==void 0&&(n._prevTarget=e,t._nextTarget=void 0),t===this._targets&&(this._targets=n)}};R.prototype.subscribe=function(t){return se(()=>{let e=this.value,n=T;T=void 0;try{t(e)}finally{T=n}})};R.prototype.valueOf=function(){return this.value};R.prototype.toString=function(){return this.value+""};R.prototype.toJSON=function(){return this.value};R.prototype.peek=function(){let t=T;T=void 0;try{return this.value}finally{T=t}};Object.defineProperty(R.prototype,"value",{get(){let t=qe(this);return t!==void 0&&(t._version=this._version),this._value},set(t){if(t!==this._value){if(ve>100)throw c("SignalCycleDetected");this._value=t,this._version++,ie++,be();try{for(let e=this._targets;e!==void 0;e=e._nextTarget)e._target._notify()}finally{ye()}}}});function We(t){for(let e=t._sources;e!==void 0;e=e._nextSource)if(e._source._version!==e._version||!e._source._refresh()||e._source._version!==e._version)return!0;return!1}function Ue(t){for(let e=t._sources;e!==void 0;e=e._nextSource){let n=e._source._node;if(n!==void 0&&(e._rollbackNode=n),e._source._node=e,e._version=-1,e._nextSource===void 0){t._sources=e;break}}}function $e(t){let e=t._sources,n;for(;e!==void 0;){let r=e._prevSource;e._version===-1?(e._source._unsubscribe(e),r!==void 0&&(r._nextSource=e._nextSource),e._nextSource!==void 0&&(e._nextSource._prevSource=r)):n=e,e._source._node=e._rollbackNode,e._rollbackNode!==void 0&&(e._rollbackNode=void 0),e=r}t._sources=n}function q(t){R.call(this,void 0),this._fn=t,this._sources=void 0,this._globalVersion=ie-1,this._flags=X}q.prototype=new R;q.prototype._refresh=function(){if(this._flags&=~B,this._flags&D)return!1;if((this._flags&(X|G))===G||(this._flags&=~X,this._globalVersion===ie))return!0;if(this._globalVersion=ie,this._flags|=D,this._version>0&&!We(this))return this._flags&=~D,!0;let t=T;try{Ue(this),T=this;let e=this._fn();(this._flags&ne||this._value!==e||this._version===0)&&(this._value=e,this._flags&=~ne,this._version++)}catch(e){this._value=e,this._flags|=ne,this._version++}return T=t,$e(this),this._flags&=~D,!0};q.prototype._subscribe=function(t){if(this._targets===void 0){this._flags|=X|G;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._subscribe(e)}R.prototype._subscribe.call(this,t)};q.prototype._unsubscribe=function(t){if(this._targets!==void 0&&(R.prototype._unsubscribe.call(this,t),this._targets===void 0)){this._flags&=~G;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e)}};q.prototype._notify=function(){if(!(this._flags&B)){this._flags|=X|B;for(let t=this._targets;t!==void 0;t=t._nextTarget)t._target._notify()}};Object.defineProperty(q.prototype,"value",{get(){if(this._flags&D)throw c("SignalCycleDetected");let t=qe(this);if(this._refresh(),t!==void 0&&(t._version=this._version),this._flags&ne)throw c("GetComputedError",{value:this._value});return this._value}});function Be(t){return new q(t)}function Ge(t){let e=t._cleanup;if(t._cleanup=void 0,typeof e=="function"){be();let n=T;T=void 0;try{e()}catch(r){throw t._flags&=~D,t._flags|=j,Ee(t),c("CleanupEffectError",{error:r})}finally{T=n,ye()}}}function Ee(t){for(let e=t._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e);t._fn=void 0,t._sources=void 0,Ge(t)}function sn(t){if(T!==this)throw c("EndEffectError");$e(this),T=t,this._flags&=~D,this._flags&j&&Ee(this),ye()}function Y(t){this._fn=t,this._cleanup=void 0,this._sources=void 0,this._nextBatchedEffect=void 0,this._flags=G}Y.prototype._callback=function(){let t=this._start();try{if(this._flags&j||this._fn===void 0)return;let e=this._fn();typeof e=="function"&&(this._cleanup=e)}finally{t()}};Y.prototype._start=function(){if(this._flags&D)throw c("SignalCycleDetected");this._flags|=D,this._flags&=~j,Ge(this),Ue(this),be();let t=T;return T=this,sn.bind(this,t)};Y.prototype._notify=function(){this._flags&B||(this._flags|=B,this._nextBatchedEffect=z,z=this)};Y.prototype._dispose=function(){this._flags|=j,this._flags&D||Ee(this)};function se(t){let e=new Y(t);try{e._callback()}catch(n){throw e._dispose(),c("EffectError",{error:n})}return e._dispose.bind(e)}function je(t,e=!1){let n={};for(let r in t)if(t.hasOwnProperty(r)){let i=t[r];if(i instanceof R){if(e&&r.startsWith("_"))continue;n[r]=i.value}else n[r]=je(i)}return n}function Ke(t,e,n=!1){for(let r in e)if(e.hasOwnProperty(r)){let i=e[r];if(i instanceof Object&&!Array.isArray(i))t[r]||(t[r]={}),Ke(t[r],i,n);else{if(n&&t[r])continue;t[r]=new R(i)}}}function Je(t,e){for(let n in t)if(t.hasOwnProperty(n)){let r=t[n];r instanceof R?e(n,r):Je(r,e)}}function on(t,...e){let n={};for(let r of e){let i=r.split("."),s=t,o=n;for(let l=0;l<i.length-1;l++){let f=i[l];if(!s[f])return{};o[f]||(o[f]={}),s=s[f],o=o[f]}let a=i[i.length-1];o[a]=s[a]}return n}var oe=class{constructor(){this._signals={}}exists(e){return!!this.signal(e)}signal(e){let n=e.split("."),r=this._signals;for(let o=0;o<n.length-1;o++){let a=n[o];if(!r[a])return null;r=r[a]}let i=n[n.length-1],s=r[i];if(!s)throw c("SignalNotFound",{path:e});return s}setSignal(e,n){let r=e.split("."),i=this._signals;for(let o=0;o<r.length-1;o++){let a=r[o];i[a]||(i[a]={}),i=i[a]}let s=r[r.length-1];i[s]=n}setComputed(e,n){let r=Be(()=>n());this.setSignal(e,r)}value(e){return this.signal(e)?.value}setValue(e,n){let r=this.upsert(e,n);r.value=n}upsert(e,n){let r=e.split("."),i=this._signals;for(let l=0;l<r.length-1;l++){let f=r[l];i[f]||(i[f]={}),i=i[f]}let s=r[r.length-1],o=i[s];if(o)return o;let a=new R(n);return i[s]=a,a}remove(...e){for(let n of e){let r=n.split("."),i=this._signals;for(let o=0;o<r.length-1;o++){let a=r[o];if(!i[a])return;i=i[a]}let s=r[r.length-1];delete i[s]}}merge(e,n=!1){Ke(this._signals,e,n)}subset(...e){return on(this.values(),...e)}walk(e){Je(this._signals,e)}values(e=!1){return je(this._signals,e)}JSON(e=!0,n=!1){let r=this.values(n);return e?JSON.stringify(r,null,2):JSON.stringify(r)}toString(){return this.JSON()}};var ae=class{constructor(){this._signals=new oe;this.plugins=[];this.macros=[];this.actions={};this.watchers=[];this.removals=new Map}get version(){return Ve}load(...e){e.forEach(n=>{let r;switch(n.type){case 0:this.macros.push(n);break;case 2:let i=n;this.watchers.push(i),r=i.onGlobalInit;break;case 3:this.actions[n.name]=n;break;case 1:let s=n;this.plugins.push(s),r=s.onGlobalInit;break;default:throw c("InvalidPluginType",{name:n.name,type:n.type})}if(r){let i=this;r({get signals(){return i._signals},effect:s=>se(s),actions:this.actions,apply:this.apply.bind(this),cleanup:this.cleanup.bind(this)})}}),this.apply(document.body)}cleanup(e){let n=this.removals.get(e);if(n){for(let r of n.set)r();this.removals.delete(e)}}apply(e){let n=new Set;this.plugins.forEach((r,i)=>{this.walkDownDOM(e,s=>{i||this.cleanup(s);for(let o in s.dataset){if(!o.startsWith(r.name))continue;let a=o.slice(r.name.length),[l,...f]=a.split(":"),u=l.length>0;u&&(l=l[0].toLowerCase()+l.slice(1));let p=`${s.dataset[o]}`||"",v=p,A=v.length>0,d=r.keyReq||0;if(u){if(d===2)throw c(r.name+"KeyNotAllowed")}else if(d===1)throw c(r.name+"KeyRequired");let b=r.valReq||0;if(A){if(b===2)throw c(r.name+"ValueNotAllowed")}else if(b===1)throw c(r.name+"ValueRequired");if(d===3||b===3){if(u&&A)throw c(r.name+"KeyAndValueProvided");if(!u&&!A)throw c(r.name+"KeyOrValueRequired")}s.id.length||(s.id=He(s)),n.clear();let y=new Map;f.forEach(x=>{let[C,...k]=x.split("_");y.set(ke(C),new Set(k))});let w=[...r.macros?.pre||[],...this.macros,...r.macros?.post||[]];for(let x of w)n.has(x)||(n.add(x),v=x.fn(v));let{actions:P,apply:m,cleanup:g}=this,h=this,E;E={get signals(){return h._signals},effect:x=>se(x),apply:m.bind(this),cleanup:g.bind(this),actions:P,genRX:()=>this.genRX(E,...r.argNames||[]),el:s,rawKey:o,rawValue:p,key:l,value:v,mods:y};let _=r.onLoad(E);_&&(this.removals.has(s)||this.removals.set(s,{id:s.id,set:new Set}),this.removals.get(s).set.add(_)),r?.removeOnLoad&&delete s.dataset[o]}})})}genRX(e,...n){let r=e.value.split(/;|\n/).map(d=>d.trim()).filter(d=>d!=""),i=r.length-1;r[i].startsWith("return")||(r[i]=`return (${r[i]});`);let o=r.join(`
`),a=/(\w*)\(/gm,l=o.matchAll(a),f=new Set;for(let d of l)f.add(d[1]);let u=Object.keys(this.actions).filter(d=>f.has(d)),v=`${u.map(d=>`const ${d} = ctx.actions.${d}.fn;`).join(`
`)}return (()=> {${o}})()`,A=v.trim();u.forEach(d=>{A=A.replaceAll(d+"(",d+"(ctx,")});try{let d=n||[],b=new Function("ctx",...d,A);return(...y)=>b(e,...y)}catch(d){throw c("GeneratingExpressionFailed",{error:d,fnContent:v})}}walkDownDOM(e,n){if(!e||!(e instanceof HTMLElement||e instanceof SVGElement))return null;for(n(e),e=e.firstElementChild;e;)this.walkDownDOM(e,n),e=e.nextElementSibling}};var ze=new ae;ze.load(Le,Ce,Ie,Pe);var Xe=ze;async function an(t,e){let n=t.getReader(),r;for(;!(r=await n.read()).done;)e(r.value)}function ln(t){let e,n,r,i=!1;return function(o){e===void 0?(e=o,n=0,r=-1):e=cn(e,o);let a=e.length,l=0;for(;n<a;){i&&(e[n]===10&&(l=++n),i=!1);let f=-1;for(;n<a&&f===-1;++n)switch(e[n]){case 58:r===-1&&(r=n-l);break;case 13:i=!0;case 10:f=n;break}if(f===-1)break;t(e.subarray(l,f),r),l=n,r=-1}l===a?e=void 0:l!==0&&(e=e.subarray(l),n-=l)}}function un(t,e,n){let r=Ye(),i=new TextDecoder;return function(o,a){if(o.length===0)n?.(r),r=Ye();else if(a>0){let l=i.decode(o.subarray(0,a)),f=a+(o[a+1]===32?2:1),u=i.decode(o.subarray(f));switch(l){case"data":r.data=r.data?r.data+`
`+u:u;break;case"event":r.event=u;break;case"id":t(r.id=u);break;case"retry":let p=parseInt(u,10);isNaN(p)||e(r.retry=p);break}}}}function cn(t,e){let n=new Uint8Array(t.length+e.length);return n.set(t),n.set(e,t.length),n}function Ye(){return{data:"",event:"",id:"",retry:void 0}}var fn="text/event-stream",dn=1e3,Ze="last-event-id";function Qe(t,{signal:e,headers:n,onopen:r,onmessage:i,onclose:s,onerror:o,openWhenHidden:a,fetch:l,retryScaler:f=2,retryMaxWaitMs:u=3e4,retryMaxCount:p=10,...v}){return new Promise((A,d)=>{let b=0,y={...n};y.accept||(y.accept=fn);let w;function P(){w.abort(),document.hidden||x()}a||document.addEventListener("visibilitychange",P);let m=dn,g=0;function h(){document.removeEventListener("visibilitychange",P),window.clearTimeout(g),w.abort()}e?.addEventListener("abort",()=>{h(),A()});let E=l??window.fetch,_=r??function(){};async function x(){w=new AbortController;try{let C=await E(t,{...v,headers:y,signal:w.signal});await _(C),await an(C.body,ln(un(k=>{k?y[Ze]=k:delete y[Ze]},k=>{m=k},i))),s?.(),h(),A()}catch(C){if(!w.signal.aborted)try{let k=o?.(C)??m;window.clearTimeout(g),g=window.setTimeout(x,k),m*=f,m=Math.min(m,u),b++,b>=p?(h(),d(c("SSE_MAX_RETRIES",{retryInterval:m,retryMaxCount:p,...v}))):console.error(`Datastar failed to reach ${v.method}:${t.toString()} retry in ${k}ms`)}catch(k){h(),d(k)}}}x()})}var K=`${I}-sse`,Se=`${I}-settling`,W=`${I}-swapping`,le="started",ue="finished";function V(t,e){document.addEventListener(K,n=>{if(n.detail.type!=t)return;let{argsRaw:r}=n.detail;e(r)})}function Te(t,e){document.dispatchEvent(new CustomEvent(K,{detail:{type:t,argsRaw:e}}))}var et=t=>`${t}`.includes("text/event-stream"),tt={type:3,name:"sse",fn:async(t,e,n)=>{let{el:{id:r},signals:i}=t,{method:s,headers:o,includeLocal:a,openWhenHidden:l}=Object.assign({method:"GET",headers:{},includeLocal:!1,openWhenHidden:!1},n),f=s.toUpperCase();try{if(Te(le,{elId:r}),!e?.length)throw c("NoUrlProvided");let u=Object.assign({"Content-Type":"application/json",[De]:!0},o),p={method:f,headers:u,openWhenHidden:l,onmessage:d=>{if(!d.event.startsWith(I))return;let b=d.event,y={},w=d.data.split(`
`);for(let m of w){let g=m.indexOf(" "),h=m.slice(0,g),E=y[h];E||(E=[],y[h]=E);let _=m.slice(g+1).trim();E.push(_)}let P={};for(let[m,g]of Object.entries(y))P[m]=g.join(`
`);Te(b,P)},onerror:d=>{if(et(d))throw c("InvalidContentType",{url:e,error:d});d&&console.error(d.message)}},v=new URL(e,window.location.origin),A=i.JSON(!1,!a);if(f==="GET"){let d=new URLSearchParams(v.search);d.set(I,A),v.search=d.toString()}else p.body=A;try{await Qe(v.toString(),p)}catch(d){if(!et(d))throw c("SseFetchFailed",{method:f,url:e,error:d})}}finally{Te(ue,{elId:r})}}};var pn=`${I}-indicator`,Zr=`${pn}-loading`,nt={type:1,name:"indicator",keyReq:3,valReq:3,onLoad:({value:t,signals:e,el:n,key:r})=>{let i=r||t,s=e.upsert(i,!1),o=a=>{let{type:l,argsRaw:{elId:f}}=a.detail;if(f===n.id)switch(l){case le:s.value=!0;break;case ue:s.value=!1;break}};return document.addEventListener(K,o),()=>{document.removeEventListener(K,o)}}};var rt={type:2,name:N.ExecuteScript,onGlobalInit:async()=>{V(N.ExecuteScript,({autoRemove:t=`${!0}`,attributes:e=Oe,script:n})=>{let r=O(t);if(!n?.length)throw c("NoScriptProvided");let i=document.createElement("script");e.split(`
`).forEach(s=>{let o=s.indexOf(" "),a=o?s.slice(0,o):s,l=o?s.slice(o):"";i.setAttribute(a.trim(),l.trim())}),i.text=n,document.head.appendChild(i),r&&i.remove()})}};var Z=document,J=!!Z.startViewTransition;var fe=new WeakSet;function at(t,e,n={}){t instanceof Document&&(t=t.documentElement);let r;typeof e=="string"?r=yn(e):r=e;let i=En(r),s=hn(t,i,n);return lt(t,i,s)}function lt(t,e,n){if(n.head.block){let r=t.querySelector("head"),i=e.querySelector("head");if(r&&i){let s=ct(i,r,n);Promise.all(s).then(()=>{lt(t,e,Object.assign(n,{head:{block:!1,ignore:!0}}))});return}}if(n.morphStyle==="innerHTML")return ut(e,t,n),t.children;if(n.morphStyle==="outerHTML"||n.morphStyle==null){let r=Tn(e,t,n);if(!r)throw c("NoBestMatchFound",{old:t,new:e});let i=r?.previousSibling,s=r?.nextSibling,o=de(t,r,n);return r?Sn(i,o,s):[]}else throw c("InvalidMorphStyle",{style:n.morphStyle})}function de(t,e,n){if(!(n.ignoreActive&&t===document.activeElement))if(e==null){if(n.callbacks.beforeNodeRemoved(t)===!1)return;t.remove(),n.callbacks.afterNodeRemoved(t);return}else{if(pe(t,e))return n.callbacks.beforeNodeMorphed(t,e)===!1?void 0:(t instanceof HTMLHeadElement&&n.head.ignore||(e instanceof HTMLHeadElement&&t instanceof HTMLHeadElement&&n.head.style!==L.Morph?ct(e,t,n):(gn(e,t),ut(e,t,n))),n.callbacks.afterNodeMorphed(t,e),t);if(n.callbacks.beforeNodeRemoved(t)===!1||n.callbacks.beforeNodeAdded(e)===!1)return;if(!t.parentElement)throw c("NoParentElementFound",{oldNode:t});return t.parentElement.replaceChild(e,t),n.callbacks.afterNodeAdded(e),n.callbacks.afterNodeRemoved(t),e}}function ut(t,e,n){let r=t.firstChild,i=e.firstChild,s;for(;r;){if(s=r,r=s.nextSibling,i==null){if(n.callbacks.beforeNodeAdded(s)===!1)return;e.appendChild(s),n.callbacks.afterNodeAdded(s),U(n,s);continue}if(ft(s,i,n)){de(i,s,n),i=i.nextSibling,U(n,s);continue}let o=vn(t,e,s,i,n);if(o){i=it(i,o,n),de(o,s,n),U(n,s);continue}let a=bn(t,s,i,n);if(a){i=it(i,a,n),de(a,s,n),U(n,s);continue}if(n.callbacks.beforeNodeAdded(s)===!1)return;e.insertBefore(s,i),n.callbacks.afterNodeAdded(s),U(n,s)}for(;i!==null;){let o=i;i=i.nextSibling,dt(o,n)}}function gn(t,e){let n=t.nodeType;if(n===1){for(let r of t.attributes)e.getAttribute(r.name)!==r.value&&e.setAttribute(r.name,r.value);for(let r of e.attributes)t.hasAttribute(r.name)||e.removeAttribute(r.name)}if((n===Node.COMMENT_NODE||n===Node.TEXT_NODE)&&e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue),t instanceof HTMLInputElement&&e instanceof HTMLInputElement&&t.type!=="file")e.value=t.value||"",ce(t,e,"value"),ce(t,e,"checked"),ce(t,e,"disabled");else if(t instanceof HTMLOptionElement)ce(t,e,"selected");else if(t instanceof HTMLTextAreaElement&&e instanceof HTMLTextAreaElement){let r=t.value,i=e.value;r!==i&&(e.value=r),e.firstChild&&e.firstChild.nodeValue!==r&&(e.firstChild.nodeValue=r)}}function ce(t,e,n){let r=t.getAttribute(n),i=e.getAttribute(n);r!==i&&(r?e.setAttribute(n,r):e.removeAttribute(n))}function ct(t,e,n){let r=[],i=[],s=[],o=[],a=n.head.style,l=new Map;for(let u of t.children)l.set(u.outerHTML,u);for(let u of e.children){let p=l.has(u.outerHTML),v=n.head.shouldReAppend(u),A=n.head.shouldPreserve(u);p||A?v?i.push(u):(l.delete(u.outerHTML),s.push(u)):a===L.Append?v&&(i.push(u),o.push(u)):n.head.shouldRemove(u)!==!1&&i.push(u)}o.push(...l.values());let f=[];for(let u of o){let p=document.createRange().createContextualFragment(u.outerHTML).firstChild;if(!p)throw c("NewElementCouldNotBeCreated",{newNode:u});if(n.callbacks.beforeNodeAdded(p)){if(p.hasAttribute("href")||p.hasAttribute("src")){let v,A=new Promise(d=>{v=d});p.addEventListener("load",function(){v(void 0)}),f.push(A)}e.appendChild(p),n.callbacks.afterNodeAdded(p),r.push(p)}}for(let u of i)n.callbacks.beforeNodeRemoved(u)!==!1&&(e.removeChild(u),n.callbacks.afterNodeRemoved(u));return n.head.afterHeadMorphed(e,{added:r,kept:s,removed:i}),f}function F(){}function hn(t,e,n){return{target:t,newContent:e,config:n,morphStyle:n.morphStyle,ignoreActive:n.ignoreActive,idMap:Rn(t,e),deadIds:new Set,callbacks:Object.assign({beforeNodeAdded:F,afterNodeAdded:F,beforeNodeMorphed:F,afterNodeMorphed:F,beforeNodeRemoved:F,afterNodeRemoved:F},n.callbacks),head:Object.assign({style:"merge",shouldPreserve:r=>r.getAttribute("im-preserve")==="true",shouldReAppend:r=>r.getAttribute("im-re-append")==="true",shouldRemove:F,afterHeadMorphed:F},n.head)}}function ft(t,e,n){return!t||!e?!1:t.nodeType===e.nodeType&&t.tagName===e.tagName?t?.id?.length&&t.id===e.id?!0:Q(n,t,e)>0:!1}function pe(t,e){return!t||!e?!1:t.nodeType===e.nodeType&&t.tagName===e.tagName}function it(t,e,n){for(;t!==e;){let r=t;if(t=t?.nextSibling,!r)throw c("NoTemporaryNodeFound",{startInclusive:t,endExclusive:e});dt(r,n)}return U(n,e),e.nextSibling}function vn(t,e,n,r,i){let s=Q(i,n,e),o=null;if(s>0){o=r;let a=0;for(;o!=null;){if(ft(n,o,i))return o;if(a+=Q(i,o,t),a>s)return null;o=o.nextSibling}}return o}function bn(t,e,n,r){let i=n,s=e.nextSibling,o=0;for(;i&&s;){if(Q(r,i,t)>0)return null;if(pe(e,i))return i;if(pe(s,i)&&(o++,s=s.nextSibling,o>=2))return null;i=i.nextSibling}return i}var st=new DOMParser;function yn(t){let e=t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,"");if(e.match(/<\/html>/)||e.match(/<\/head>/)||e.match(/<\/body>/)){let n=st.parseFromString(t,"text/html");if(e.match(/<\/html>/))return fe.add(n),n;{let r=n.firstChild;return r?(fe.add(r),r):null}}else{let r=st.parseFromString(`<body><template>${t}</template></body>`,"text/html").body.querySelector("template")?.content;if(!r)throw c("NoContentFound",{newContent:t});return fe.add(r),r}}function En(t){if(t==null)return document.createElement("div");if(fe.has(t))return t;if(t instanceof Node){let e=document.createElement("div");return e.append(t),e}else{let e=document.createElement("div");for(let n of[...t])e.append(n);return e}}function Sn(t,e,n){let r=[],i=[];for(;t;)r.push(t),t=t.previousSibling;for(;r.length>0;){let s=r.pop();i.push(s),e?.parentElement?.insertBefore(s,e)}for(i.push(e);n;)r.push(n),i.push(n),n=n.nextSibling;for(;r.length;)e?.parentElement?.insertBefore(r.pop(),e.nextSibling);return i}function Tn(t,e,n){let r=t.firstChild,i=r,s=0;for(;r;){let o=An(r,e,n);o>s&&(i=r,s=o),r=r.nextSibling}return i}function An(t,e,n){return pe(t,e)?.5+Q(n,t,e):0}function dt(t,e){U(e,t),e.callbacks.beforeNodeRemoved(t)!==!1&&(t.remove(),e.callbacks.afterNodeRemoved(t))}function _n(t,e){return!t.deadIds.has(e)}function wn(t,e,n){return t.idMap.get(n)?.has(e)||!1}function U(t,e){let n=t.idMap.get(e);if(n)for(let r of n)t.deadIds.add(r)}function Q(t,e,n){let r=t.idMap.get(e);if(!r)return 0;let i=0;for(let s of r)_n(t,s)&&wn(t,s,n)&&++i;return i}function ot(t,e){let n=t.parentElement,r=t.querySelectorAll("[id]");for(let i of r){let s=i;for(;s!==n&&s;){let o=e.get(s);o==null&&(o=new Set,e.set(s,o)),o.add(i.id),s=s.parentElement}}}function Rn(t,e){let n=new Map;return ot(t,n),ot(e,n),n}var mt={type:2,name:N.MergeFragments,onGlobalInit:async t=>{let e=document.createElement("template");V(N.MergeFragments,({fragments:n="<div></div>",selector:r="",mergeMode:i=Fe,settleDuration:s=`${300}`,useViewTransition:o=`${!1}`})=>{let a=parseInt(s),l=O(o);e.innerHTML=n.trim(),[...e.content.children].forEach(u=>{if(!(u instanceof Element))throw c("NoFragmentsFound");let p=r||`#${u.getAttribute("id")}`,v=[...document.querySelectorAll(p)||[]];if(!v.length)throw c("NoTargetsFound",{selectorOrID:p});J&&l?Z.startViewTransition(()=>pt(t,i,a,u,v)):pt(t,i,a,u,v)})})}};function pt(t,e,n,r,i){for(let s of i){s.classList.add(W);let o=s.outerHTML,a=s;switch(e){case L.Morph:let u=at(a,r,{callbacks:{beforeNodeRemoved:(p,v)=>(t.cleanup(p),!0)}});if(!u?.length)throw c("MorphFailed");a=u[0];break;case L.Inner:a.innerHTML=r.innerHTML;break;case L.Outer:a.replaceWith(r);break;case L.Prepend:a.prepend(r);break;case L.Append:a.append(r);break;case L.Before:a.before(r);break;case L.After:a.after(r);break;case L.UpsertAttributes:r.getAttributeNames().forEach(p=>{let v=r.getAttribute(p);a.setAttribute(p,v)});break;default:throw c("InvalidMergeMode",{mergeMode:e})}t.cleanup(a);let l=a.classList;l.add(W),t.apply(document.body),setTimeout(()=>{s.classList.remove(W),l.remove(W)},n);let f=a.outerHTML;o!==f&&(l.add(Se),setTimeout(()=>{l.remove(Se)},n))}}var gt={type:2,name:N.MergeSignals,onGlobalInit:async t=>{V(N.MergeSignals,({signals:e="{}",onlyIfMissing:n=`${!1}`})=>{let{signals:r}=t,i=O(n);r.merge(te(e),i),t.apply(document.body)})}};var ht={type:2,name:N.RemoveFragments,onGlobalInit:async()=>{V(N.RemoveFragments,({selector:t,settleDuration:e=`${300}`,useViewTransition:n=`${!1}`})=>{if(!t.length)throw c("NoSelectorProvided");let r=parseInt(e),i=O(n),s=document.querySelectorAll(t),o=()=>{for(let a of s)a.classList.add(W);setTimeout(()=>{for(let a of s)a.remove()},r)};J&&i?Z.startViewTransition(()=>o()):o()})}};var vt={type:2,name:N.RemoveSignals,onGlobalInit:async t=>{V(N.RemoveSignals,({paths:e=""})=>{let n=e.split(`
`).map(r=>r.trim());if(!n?.length)throw c("NoPathsProvided");t.signals.remove(...n),t.apply(document.body)})}};var bt={type:3,name:"clipboard",fn:(t,e)=>{if(!navigator.clipboard)throw c("ClipboardNotAvailable");navigator.clipboard.writeText(e)}};var yt="once",Et="half",St="full",Tt={type:1,name:"intersects",keyReq:2,mods:new Set([yt,Et,St]),onLoad:({el:t,rawKey:e,mods:n,genRX:r})=>{let i={threshold:0};n.has(St)?i.threshold=1:n.has(Et)&&(i.threshold=.5);let s=r(),o=new IntersectionObserver(a=>{a.forEach(l=>{l.isIntersecting&&(s(),n.has(yt)&&(o.disconnect(),delete t.dataset[e]))})},i);return o.observe(t),()=>o.disconnect()}};var At="session",_t={type:1,name:"persist",mods:new Set([At]),onLoad:({key:t,value:e,signals:n,effect:r,mods:i})=>{t===""&&(t=I);let s=i.has(At)?sessionStorage:localStorage,o=e.split(/\s+/).filter(f=>f!==""),a=()=>{let f=s.getItem(t)||"{}",u=JSON.parse(f);n.merge(u)},l=()=>{let f;o.length?f=n.subset(...o):f=n.values(),s.setItem(t,JSON.stringify(f))};return a(),r(()=>{l()})}};var wt={type:1,name:"replaceUrl",keyReq:2,valReq:1,onLoad:({effect:t,genRX:e})=>{let n=e();return t(()=>{let r=n(),i=window.location.href,s=new URL(r,i).toString();window.history.replaceState({},"",s)})}};var me="smooth",we="instant",Re="auto",Rt="hstart",xt="hcenter",Mt="hend",Nt="hnearest",Pt="vstart",kt="vcenter",It="vend",Lt="vnearest",Mn="focus",ge="center",Ct="start",Dt="end",Vt="nearest",Ot={type:1,name:"scrollIntoView",keyReq:2,valReq:2,mods:new Set([me,we,Re,Rt,xt,Mt,Nt,Pt,kt,It,Lt,Mn]),onLoad:({el:t,mods:e,rawKey:n})=>{t.tabIndex||t.setAttribute("tabindex","0");let r={behavior:me,block:ge,inline:ge};if(e.has(me)&&(r.behavior=me),e.has(we)&&(r.behavior=we),e.has(Re)&&(r.behavior=Re),e.has(Rt)&&(r.inline=Ct),e.has(xt)&&(r.inline=ge),e.has(Mt)&&(r.inline=Dt),e.has(Nt)&&(r.inline=Vt),e.has(Pt)&&(r.block=Ct),e.has(kt)&&(r.block=ge),e.has(It)&&(r.block=Dt),e.has(Lt)&&(r.block=Vt),!(t instanceof HTMLElement||t instanceof SVGElement))throw c("NotHtmlSvgElement, el");return t.tabIndex||t.setAttribute("tabindex","0"),t.scrollIntoView(r),e.has("focus")&&t.focus(),delete t.dataset[n],()=>{}}};var Ft="none",Ht="display",qt={type:1,name:"show",keyReq:2,valReq:1,onLoad:({el:{style:t},genRX:e,effect:n})=>{let r=e();return n(async()=>{r()?t.display===Ft&&t.removeProperty(Ht):t.setProperty(Ht,Ft)})}};var xe="view-transition",Wt={type:1,name:xe,keyReq:2,valReq:1,onGlobalInit(){let t=!1;if(document.head.childNodes.forEach(e=>{e instanceof HTMLMetaElement&&e.name===xe&&(t=!0)}),!t){let e=document.createElement("meta");e.name=xe,e.content="same-origin",document.head.appendChild(e)}},onLoad:({effect:t,el:e,genRX:n})=>{if(!J){console.error("Browser does not support view transitions");return}let r=n();return t(()=>{let i=r();if(!i?.length)return;let s=e.style;s.viewTransitionName=i})}};var Ut={type:1,name:"attributes",valReq:1,onLoad:({el:t,genRX:e,key:n,effect:r})=>{let i=e();return n===""?r(async()=>{let s=i();Object.entries(s).forEach(([o,a])=>{t.setAttribute(o,a)})}):(n=$(n),r(async()=>{let s=!1;try{s=i()}catch{}let o;typeof s=="string"?o=s:o=JSON.stringify(s),!o||o==="false"||o==="null"||o==="undefined"?t.removeAttribute(n):t.setAttribute(n,o)}))}};var Nn=/^data:(?<mime>[^;]+);base64,(?<contents>.*)$/,$t=["change","input","keydown"],Bt={type:1,name:"bind",keyReq:3,valReq:3,onLoad:t=>{let{el:e,value:n,key:r,signals:i,effect:s}=t,o=r||n,a=()=>{},l=()=>{};if(typeof o!="string")throw c("InvalidExpression");let f=e.tagName.toLowerCase(),u="",p=f.includes("input"),v=e.getAttribute("type"),A=f.includes("checkbox")||p&&v==="checkbox";A&&(u=!1),p&&v==="number"&&(u=0);let b=f.includes("select"),y=f.includes("radio")||p&&v==="radio",w=p&&v==="file";y&&(e.getAttribute("name")?.length||e.setAttribute("name",o)),i.upsert(o,u),a=()=>{let m="value"in e,g=i.value(o),h=`${g}`;if(A||y){let E=e;A?E.checked=!!g||g==="true":y&&(E.checked=h===E.value)}else if(!w)if(b){let E=e;E.multiple?Array.from(E.options).forEach(_=>{_?.disabled||(Array.isArray(g)||typeof g=="string"?_.selected=g.includes(_.value):typeof g=="number"?_.selected=g===Number(_.value):_.selected=g)}):E.value=h}else m?e.value=h:e.setAttribute("value",h)},l=async()=>{if(w){let h=[...e?.files||[]],E=[],_=[],x=[];await Promise.all(h.map(Ne=>new Promise(en=>{let H=new FileReader;H.onload=()=>{if(typeof H.result!="string")throw c("InvalidFileResultType",{type:typeof H.result});let he=H.result.match(Nn);if(!he?.groups)throw c("InvalidDataUri",{result:H.result});E.push(he.groups.contents),_.push(he.groups.mime),x.push(Ne.name)},H.onloadend=()=>en(void 0),H.readAsDataURL(Ne)}))),i.setValue(o,E);let C=`${o}Mimes`,k=`${o}Names`;C in i&&i.upsert(C,_),k in i&&i.upsert(k,x);return}let m=i.value(o),g=e||e;if(typeof m=="number"){let h=Number(g.value||g.getAttribute("value"));i.setValue(o,h)}else if(typeof m=="string"){let h=g.value||g.getAttribute("value")||"";i.setValue(o,h)}else if(typeof m=="boolean")if(A){let h=g.checked||g.getAttribute("checked")==="true";i.setValue(o,h)}else{let h=!!(g.value||g.getAttribute("value"));i.setValue(o,h)}else if(!(typeof m>"u"))if(Array.isArray(m))if(b){let _=[...e.selectedOptions].filter(x=>x.selected).map(x=>x.value);i.setValue(o,_)}else{let h=JSON.stringify(g.value.split(","));i.setValue(o,h)}else throw c("UnsupportedSignalType",{current:typeof m})},$t.forEach(m=>e.addEventListener(m,l));let P=s(()=>a());return()=>{P(),$t.forEach(m=>{e.removeEventListener(m,l)})}}};var Gt={type:1,name:"class",valReq:1,onLoad:({key:t,el:e,genRX:n,effect:r})=>{let i=e.classList,s=n();return r(()=>{if(t===""){let o=s();for(let[a,l]of Object.entries(o)){let f=a.split(/\s+/);l?i.add(...f):i.remove(...f)}}else{let o=s(),a=$(t);o?i.add(a):i.remove(a)}})}};function Me(t){if(!t||t.size<=0)return 0;for(let e of t){if(e.endsWith("ms"))return Number(e.replace("ms",""));if(e.endsWith("s"))return Number(e.replace("s",""))*1e3;try{return parseFloat(e)}catch{}}return 0}function ee(t,e,n=!1){return t?t.has(e):n}function jt(t,e,n=!1,r=!0){let i=-1,s=()=>i&&clearTimeout(i);return function(...a){s(),n&&!i&&t(...a),i=setTimeout(()=>{r&&t(...a),s()},e)}}function Kt(t,e,n=!0,r=!1){let i=!1;return function(...o){i||(n&&t(...o),i=!0,setTimeout(()=>{i=!1,r&&t(...o)},e))}}var Pn=new Set(["window","once","passive","capture","debounce","throttle","remote","outside"]),kn="evt",Jt={type:1,name:"on",keyReq:1,valReq:1,argNames:[kn],macros:{pre:[{type:0,name:"evtEsc",fn:t=>t.replaceAll(/evt.([\w\.]+)value/gm,"EVT_$1_VALUE")}],post:[{type:0,name:"evtUnesc",fn:t=>t.replaceAll(/EVT_([\w\.]+)_VALUE/gm,"evt.$1.value")}]},onLoad:({el:t,key:e,genRX:n,mods:r,signals:i,effect:s})=>{let o=n(),a=t;r.has("window")&&(a=window);let l=b=>{o(b)},f=r.get("debounce");if(f){let b=Me(f),y=ee(f,"leading",!1),w=!ee(f,"noTrail",!1);l=jt(l,b,y,w)}let u=r.get("throttle");if(u){let b=Me(u),y=!ee(u,"noLeading",!1),w=ee(u,"trail",!1);l=Kt(l,b,y,w)}let p={capture:!0,passive:!1,once:!1};r.has("capture")||(p.capture=!1),r.has("passive")&&(p.passive=!0),r.has("once")&&(p.once=!0),[...r.keys()].filter(b=>!Pn.has(b)).forEach(b=>{let y=r.get(b)||[],w=l;l=()=>{let m=event,g=m[b],h;if(typeof g=="function")h=g(...y);else if(typeof g=="boolean")h=g;else if(typeof g=="string"){let E=g.toLowerCase().trim(),_=[...y].join("").toLowerCase().trim();h=E===_}else throw c("InvalidValue",{attrName:b,key:e,el:t});h&&w(m)}});let A="",d=$(e).toLowerCase();switch(d){case"load":return l(),delete t.dataset.onLoad,()=>{};case"raf":let b,y=()=>{l(),b=requestAnimationFrame(y)};return b=requestAnimationFrame(y),()=>{b&&cancelAnimationFrame(b)};case"signals-change":return s(()=>{let P=r.has("remote"),m=i.JSON(!1,P);A!==m&&(A=m,l())});default:if(r.has("outside")){a=document;let P=l,m=!1;l=h=>{let E=h?.target;if(!E)return;let _=t.id===E.id;_&&m&&(m=!1),!_&&!m&&(P(h),m=!0)}}return a.addEventListener(d,l,p),()=>{a.removeEventListener(d,l)}}}};var zt={type:1,name:"ref",keyReq:3,valReq:3,onLoad:({el:t,key:e,value:n,signals:r})=>{let i=e||n;return r.upsert(i,t),()=>r.setValue(i,null)}};var Xt={type:1,name:"text",keyReq:2,valReq:1,onLoad:t=>{let{el:e,genRX:n,effect:r}=t,i=n();return e instanceof HTMLElement||c("NotHtmlElement"),r(()=>{let s=i(t);e.textContent=`${s}`})}};var{round:In,max:Ln,min:Cn}=Math,Yt={type:3,name:"fit",fn:(t,e,n,r,i,s,o=!1,a=!1)=>{let l=(e-n)/(r-n)*(s-i)+i;return a&&(l=In(l)),o&&(l=Ln(i,Cn(s,l))),l}};var Zt={type:3,name:"setAll",fn:({signals:t},e,n)=>{t.walk((r,i)=>{r.startsWith(e)&&(i.value=n)})}};var Qt={type:3,name:"toggleAll",fn:(t,e)=>{t.signals.walk((n,r)=>{n.startsWith(e)&&(r.value=!r.value)})}};Xe.load(Ut,Bt,nt,zt,Gt,Jt,qt,Xt,tt,mt,gt,ht,vt,rt,bt,Tt,_t,wt,Ot,Wt,Yt,Zt,Qt);})();
//# sourceMappingURL=datastar.js.map
