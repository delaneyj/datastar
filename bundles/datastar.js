"use strict";(()=>{var M="datastar";var Me="Datastar-Request",Ie="0.20.1";var Le="type module";var I={Morph:"morph",Inner:"inner",Outer:"outer",Prepend:"prepend",Append:"append",Before:"before",After:"after",UpsertAttributes:"upsertAttributes"},ke=I.Morph,R={MergeFragments:"datastar-merge-fragments",MergeSignals:"datastar-merge-signals",RemoveFragments:"datastar-remove-fragments",RemoveSignals:"datastar-remove-signals",ExecuteScript:"datastar-execute-script"};var Qt="http://localhost:8080/errors";var c=(t,e)=>{let n=new Error;n.name=`${M} error ${t}`;let r=`${Qt}/${t}?${new URLSearchParams(e)}`;return n.message=`for more info see ${r}`,n};var en="computed",Ve={type:1,name:en,purge:!0,onLoad:({key:t,signals:e,genRX:n})=>{let r=n();if(!t.length)throw c("P1");e.setComputed(t,r)}};var C=t=>t.trim()==="true",$=t=>t.replace(/[A-Z]+(?![a-z])|[A-Z]/g,(e,n)=>(n?"-":"")+e.toLowerCase()),te=t=>new Function(`return Object.assign({}, ${t})`)();var De={type:1,name:"signals",purge:!0,onLoad:t=>{let{key:e,genRX:n,signals:r}=t;if(e!="")r.setValue(e,n()());else{let i=te(t.value);t.value=JSON.stringify(i),r.merge(n()())}}};var Oe={type:1,name:"star",onLoad:()=>{alert("YOU ARE PROBABLY OVERCOMPLICATING IT")}};var Ce={name:"signalValue",type:0,fn:t=>{let e=/(?<path>[\w0-9.]*)((\.value))/gm;return t.replaceAll(e,"ctx.signals.signal('$1')?.value")}};function Fe(t){if(t.id)return t.id;let e=0,n=i=>(e=(e<<5)-e+i,e&e),r=i=>i.split("").forEach(o=>n(o.charCodeAt(0)));for(;t.parentNode;){if(t.id){r(`${t.id}`);break}else if(t===t.ownerDocument.documentElement)r(t.tagName);else{for(let i=1,o=t;o.previousElementSibling;o=o.previousElementSibling,i++)n(i);t=t.parentNode}t=t.parentNode}return M+e}var tn=Symbol.for("preact-signals"),V=1,G=2,z=4,j=8,ne=16,K=32;function be(){re++}function ye(){if(re>1){re--;return}let t,e=!1;for(;Y!==void 0;){let n=Y;for(Y=void 0,ve++;n!==void 0;){let r=n._nextBatchedEffect;if(n._nextBatchedEffect=void 0,n._flags&=~G,!(n._flags&j)&&We(n))try{n._callback()}catch(i){e||(t=i,e=!0)}n=r}}if(ve=0,re--,e)throw c("Z1",t)}var E;var Y,re=0,ve=0,ie=0;function He(t){if(E===void 0)return;let e=t._node;if(e===void 0||e._target!==E)return e={_version:0,_source:t,_prevSource:E._sources,_nextSource:void 0,_target:E,_prevTarget:void 0,_nextTarget:void 0,_rollbackNode:e},E._sources!==void 0&&(E._sources._nextSource=e),E._sources=e,t._node=e,E._flags&K&&t._subscribe(e),e;if(e._version===-1)return e._version=0,e._nextSource!==void 0&&(e._nextSource._prevSource=e._prevSource,e._prevSource!==void 0&&(e._prevSource._nextSource=e._nextSource),e._prevSource=E._sources,e._nextSource=void 0,E._sources._nextSource=e,E._sources=e),e}function w(t){this._value=t,this._version=0,this._node=void 0,this._targets=void 0}w.prototype.brand=tn;w.prototype._refresh=function(){return!0};w.prototype._subscribe=function(t){this._targets!==t&&t._prevTarget===void 0&&(t._nextTarget=this._targets,this._targets!==void 0&&(this._targets._prevTarget=t),this._targets=t)};w.prototype._unsubscribe=function(t){if(this._targets!==void 0){let e=t._prevTarget,n=t._nextTarget;e!==void 0&&(e._nextTarget=n,t._prevTarget=void 0),n!==void 0&&(n._prevTarget=e,t._nextTarget=void 0),t===this._targets&&(this._targets=n)}};w.prototype.subscribe=function(t){return oe(()=>{let e=this.value,n=E;E=void 0;try{t(e)}finally{E=n}})};w.prototype.valueOf=function(){return this.value};w.prototype.toString=function(){return this.value+""};w.prototype.toJSON=function(){return this.value};w.prototype.peek=function(){let t=E;E=void 0;try{return this.value}finally{E=t}};Object.defineProperty(w.prototype,"value",{get(){let t=He(this);return t!==void 0&&(t._version=this._version),this._value},set(t){if(t!==this._value){if(ve>100)throw c("Z2");this._value=t,this._version++,ie++,be();try{for(let e=this._targets;e!==void 0;e=e._nextTarget)e._target._notify()}finally{ye()}}}});function We(t){for(let e=t._sources;e!==void 0;e=e._nextSource)if(e._source._version!==e._version||!e._source._refresh()||e._source._version!==e._version)return!0;return!1}function Ue(t){for(let e=t._sources;e!==void 0;e=e._nextSource){let n=e._source._node;if(n!==void 0&&(e._rollbackNode=n),e._source._node=e,e._version=-1,e._nextSource===void 0){t._sources=e;break}}}function Be(t){let e=t._sources,n;for(;e!==void 0;){let r=e._prevSource;e._version===-1?(e._source._unsubscribe(e),r!==void 0&&(r._nextSource=e._nextSource),e._nextSource!==void 0&&(e._nextSource._prevSource=r)):n=e,e._source._node=e._rollbackNode,e._rollbackNode!==void 0&&(e._rollbackNode=void 0),e=r}t._sources=n}function W(t){w.call(this,void 0),this._fn=t,this._sources=void 0,this._globalVersion=ie-1,this._flags=z}W.prototype=new w;W.prototype._refresh=function(){if(this._flags&=~G,this._flags&V)return!1;if((this._flags&(z|K))===K||(this._flags&=~z,this._globalVersion===ie))return!0;if(this._globalVersion=ie,this._flags|=V,this._version>0&&!We(this))return this._flags&=~V,!0;let t=E;try{Ue(this),E=this;let e=this._fn();(this._flags&ne||this._value!==e||this._version===0)&&(this._value=e,this._flags&=~ne,this._version++)}catch(e){this._value=e,this._flags|=ne,this._version++}return E=t,Be(this),this._flags&=~V,!0};W.prototype._subscribe=function(t){if(this._targets===void 0){this._flags|=z|K;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._subscribe(e)}w.prototype._subscribe.call(this,t)};W.prototype._unsubscribe=function(t){if(this._targets!==void 0&&(w.prototype._unsubscribe.call(this,t),this._targets===void 0)){this._flags&=~K;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e)}};W.prototype._notify=function(){if(!(this._flags&G)){this._flags|=z|G;for(let t=this._targets;t!==void 0;t=t._nextTarget)t._target._notify()}};Object.defineProperty(W.prototype,"value",{get(){if(this._flags&V)throw c("Z2");let t=He(this);if(this._refresh(),t!==void 0&&(t._version=this._version),this._flags&ne)throw c("Z3",{value:this._value});return this._value}});function $e(t){return new W(t)}function Ge(t){let e=t._cleanup;if(t._cleanup=void 0,typeof e=="function"){be();let n=E;E=void 0;try{e()}catch(r){throw t._flags&=~V,t._flags|=j,Ee(t),c("Z4",{error:r})}finally{E=n,ye()}}}function Ee(t){for(let e=t._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e);t._fn=void 0,t._sources=void 0,Ge(t)}function nn(t){if(E!==this)throw c("Z5");Be(this),E=t,this._flags&=~V,this._flags&j&&Ee(this),ye()}function X(t){this._fn=t,this._cleanup=void 0,this._sources=void 0,this._nextBatchedEffect=void 0,this._flags=K}X.prototype._callback=function(){let t=this._start();try{if(this._flags&j||this._fn===void 0)return;let e=this._fn();typeof e=="function"&&(this._cleanup=e)}finally{t()}};X.prototype._start=function(){if(this._flags&V)throw c("Z2");this._flags|=V,this._flags&=~j,Ge(this),Ue(this),be();let t=E;return E=this,nn.bind(this,t)};X.prototype._notify=function(){this._flags&G||(this._flags|=G,this._nextBatchedEffect=Y,Y=this)};X.prototype._dispose=function(){this._flags|=j,this._flags&V||Ee(this)};function oe(t){let e=new X(t);try{e._callback()}catch(n){throw e._dispose(),c("Z6",{error:n})}return e._dispose.bind(e)}function Ke(t,e=!1){let n={};for(let r in t)if(t.hasOwnProperty(r)){let i=t[r];if(i instanceof w){if(e&&r.startsWith("_"))continue;n[r]=i.value}else n[r]=Ke(i)}return n}function je(t,e,n=!1){for(let r in e)if(e.hasOwnProperty(r)){let i=e[r];if(i instanceof Object&&!Array.isArray(i))t[r]||(t[r]={}),je(t[r],i,n);else{if(n&&t[r])continue;t[r]=new w(i)}}}function qe(t,e){for(let n in t)if(t.hasOwnProperty(n)){let r=t[n];r instanceof w?e(n,r):qe(r,e)}}function rn(t,...e){let n={};for(let r of e){let i=r.split("."),o=t,s=n;for(let l=0;l<i.length-1;l++){let f=i[l];if(!o[f])return{};s[f]||(s[f]={}),o=o[f],s=s[f]}let a=i[i.length-1];s[a]=o[a]}return n}var se=class{constructor(){this._signals={}}exists(e){return!!this.signal(e)}signal(e){let n=e.split("."),r=this._signals;for(let o=0;o<n.length-1;o++){let s=n[o];if(!r[s])return null;r=r[s]}let i=n[n.length-1];return r[i]}setSignal(e,n){let r=e.split("."),i=this._signals;for(let s=0;s<r.length-1;s++){let a=r[s];i[a]||(i[a]={}),i=i[a]}let o=r[r.length-1];i[o]=n}setComputed(e,n){let r=$e(()=>n());this.setSignal(e,r)}value(e){return this.signal(e)?.value}setValue(e,n){let r=this.upsert(e,n);r.value=n}upsert(e,n){let r=e.split("."),i=this._signals;for(let l=0;l<r.length-1;l++){let f=r[l];i[f]||(i[f]={}),i=i[f]}let o=r[r.length-1],s=i[o];if(s)return s;let a=new w(n);return i[o]=a,a}remove(...e){for(let n of e){let r=n.split("."),i=this._signals;for(let s=0;s<r.length-1;s++){let a=r[s];if(!i[a])return;i=i[a]}let o=r[r.length-1];delete i[o]}}merge(e,n=!1){je(this._signals,e,n)}subset(...e){return rn(this.values(),...e)}walk(e){qe(this._signals,e)}values(e=!1){return Ke(this._signals,e)}JSON(e=!0,n=!1){let r=this.values(n);return e?JSON.stringify(r,null,2):JSON.stringify(r)}toString(){return this.JSON()}};var ae=class{constructor(){this._signals=new se;this.plugins=[];this.macros=[];this.actions={};this.watchers=[];this.removals=new Map}get version(){return Ie}load(...e){e.forEach(n=>{let r;switch(n.type){case 0:this.macros.push(n);break;case 2:let i=n;this.watchers.push(i),r=i.onGlobalInit;break;case 3:this.actions[n.name]=n;break;case 1:let o=n;this.plugins.push(o),r=o.onGlobalInit;break;default:throw c("A2",{name:n.name,type:n.type})}if(r){let i=this;r({get signals(){return i._signals},effect:o=>oe(o),actions:this.actions,apply:this.apply.bind(this),cleanup:this.cleanup.bind(this)})}}),this.apply(document.body)}cleanup(e){let n=this.removals.get(e);if(n){for(let r of n.set)r();this.removals.delete(e)}}apply(e){let n=new Set;this.plugins.forEach((r,i)=>{this.walkDownDOM(e,o=>{i||this.cleanup(o);for(let s in o.dataset){let a=`${o.dataset[s]}`||"",l=a;if(!s.startsWith(r.name))continue;o.id.length||(o.id=Fe(o)),n.clear();let f=s.slice(r.name.length),[u,...m]=f.split(".");u.length&&(u=u[0].toLowerCase()+u.slice(1));let p=new Map;m.forEach(d=>{let[h,..._]=d.split("_");p.set(h,new Set(_))});let T=[...r.macros?.pre||[],...this.macros,...r.macros?.post||[]];for(let d of T)n.has(d)||(n.add(d),l=d.fn(l));let{actions:v,apply:b,cleanup:S}=this,A=this,N;N={get signals(){return A._signals},effect:d=>oe(d),apply:b.bind(this),cleanup:S.bind(this),actions:v,genRX:()=>this.genRX(N,...r.argNames||[]),el:o,rawKey:s,rawValue:a,key:u,value:l,mods:p};let g=r.onLoad(N);g&&(this.removals.has(o)||this.removals.set(o,{id:o.id,set:new Set}),this.removals.get(o).set.add(g)),r?.purge&&delete o.dataset[s]}})})}genRX(e,...n){let r=e.value.split(/;|\n/).map(v=>v.trim()).filter(v=>v!=""),i=r.length-1;r[i].startsWith("return")||(r[i]=`return ${r[i]};`);let s=r.join(`
`),a=/(\w*)\(/gm,l=s.matchAll(a),f=new Set;for(let v of l)f.add(v[1]);let u=Object.keys(this.actions).filter(v=>f.has(v)),p=`${u.map(v=>`const ${v} = ctx.actions.${v}.fn;`).join(`
`)}
${s}`,T=p.trim();u.forEach(v=>{T=T.replaceAll(v+"(",v+"(ctx,")});try{let v=n||[],b=new Function("ctx",...v,T);return(...S)=>b(e,...S)}catch(v){throw c("A3",{error:v,fnContent:p})}}walkDownDOM(e,n){if(!e||!(e instanceof HTMLElement||e instanceof SVGElement))return null;for(n(e),e=e.firstElementChild;e;)this.walkDownDOM(e,n),e=e.nextElementSibling}};var Je=new ae;Je.load(Oe,Ce,De,Ve);var Ye=Je;async function on(t,e){let n=t.getReader(),r;for(;!(r=await n.read()).done;)e(r.value)}function sn(t){let e,n,r,i=!1;return function(s){e===void 0?(e=s,n=0,r=-1):e=ln(e,s);let a=e.length,l=0;for(;n<a;){i&&(e[n]===10&&(l=++n),i=!1);let f=-1;for(;n<a&&f===-1;++n)switch(e[n]){case 58:r===-1&&(r=n-l);break;case 13:i=!0;case 10:f=n;break}if(f===-1)break;t(e.subarray(l,f),r),l=n,r=-1}l===a?e=void 0:l!==0&&(e=e.subarray(l),n-=l)}}function an(t,e,n){let r=ze(),i=new TextDecoder;return function(s,a){if(s.length===0)n?.(r),r=ze();else if(a>0){let l=i.decode(s.subarray(0,a)),f=a+(s[a+1]===32?2:1),u=i.decode(s.subarray(f));switch(l){case"data":r.data=r.data?r.data+`
`+u:u;break;case"event":r.event=u;break;case"id":t(r.id=u);break;case"retry":let m=parseInt(u,10);isNaN(m)||e(r.retry=m);break}}}}function ln(t,e){let n=new Uint8Array(t.length+e.length);return n.set(t),n.set(e,t.length),n}function ze(){return{data:"",event:"",id:"",retry:void 0}}var cn="text/event-stream",un=1e3,Xe="last-event-id";function Ze(t,{signal:e,headers:n,onopen:r,onmessage:i,onclose:o,onerror:s,openWhenHidden:a,fetch:l,retryScaler:f=2,retryMaxWaitMs:u=3e4,retryMaxCount:m=10,...p}){return new Promise((T,v)=>{let b=0,S={...n};S.accept||(S.accept=cn);let A;function N(){A.abort(),document.hidden||k()}a||document.addEventListener("visibilitychange",N);let g=un,d=0;function h(){document.removeEventListener("visibilitychange",N),window.clearTimeout(d),A.abort()}e?.addEventListener("abort",()=>{h(),T()});let _=l??window.fetch,x=r??function(){};async function k(){A=new AbortController;try{let O=await _(t,{...p,headers:S,signal:A.signal});await x(O),await on(O.body,sn(an(L=>{L?S[Xe]=L:delete S[Xe]},L=>{g=L},i))),o?.(),h(),T()}catch(O){if(!A.signal.aborted)try{let L=s?.(O)??g;window.clearTimeout(d),d=window.setTimeout(k,L),g*=f,g=Math.min(g,u),b++,b>=m?(h(),v(c("SSE_MAX_RETRIES",{retryInterval:g,retryMaxCount:m,...p}))):console.error(`Datastar failed to reach ${p.method}:${t.toString()} retry in ${L}ms`)}catch(L){h(),v(L)}}}k()})}var q=`${M}-sse`,Se=`${M}-settling`,U=`${M}-swapping`,le="started",ce="finished";function D(t,e){document.addEventListener(q,n=>{if(n.detail.type!=t)return;let{argsRaw:r}=n.detail;e(r)})}function Ae(t,e){document.dispatchEvent(new CustomEvent(q,{detail:{type:t,argsRaw:e}}))}var Qe=t=>`${t}`.includes("text/event-stream"),et={type:3,name:"sse",fn:async(t,e,n={method:"GET",headers:{},onlyRemote:!0})=>{let{el:{id:r},signals:i}=t,{headers:o,onlyRemote:s}=n,a=n.method.toUpperCase();try{if(Ae(le,{elId:r}),!e?.length)throw c("B1");let l=Object.assign({"Content-Type":"application/json",[Me]:!0},o),f={method:a,headers:l,onmessage:p=>{if(!p.event.startsWith(M))return;let T=p.event,v={},b=p.data.split(`
`);for(let A of b){let N=A.indexOf(" "),g=A.slice(0,N),d=v[g];d||(d=[],v[g]=d);let h=A.slice(N+1).trim();d.push(h)}let S={};for(let[A,N]of Object.entries(v))S[A]=N.join(`
`);Ae(T,S)},onerror:p=>{if(Qe(p))throw c("B2",{url:e,error:p});p&&console.error(p.message)}},u=new URL(e,window.location.origin),m=i.JSON(!1,s);if(a==="GET"){let p=new URLSearchParams(u.search);p.set(M,m),u.search=p.toString()}else f.body=m;try{await Ze(u.toString(),f)}catch(p){if(!Qe(p))throw c("B3",{method:a,url:e,error:p})}}finally{Ae(ce,{elId:r})}}};var fn=`${M}-indicator`,Qr=`${fn}-loading`,tt={type:1,name:"indicator",onLoad:({value:t,signals:e,el:n,key:r})=>{if(r.length)throw c("C1");if(!t.length)throw c("C2");let i=e.upsert(t,!1),o=s=>{let{type:a,argsRaw:{elId:l}}=s.detail;if(l===n.id)switch(a){case le:i.value=!0;break;case ce:i.value=!1;break}};return document.addEventListener(q,o),()=>{document.removeEventListener(q,o)}}};var nt={type:2,name:R.ExecuteScript,onGlobalInit:async()=>{D(R.ExecuteScript,({autoRemove:t=`${!0}`,attributes:e=Le,script:n})=>{let r=C(t);if(!n?.length)throw c("D1");let i=document.createElement("script");e.split(`
`).forEach(o=>{let s=o.indexOf(" "),a=s?o.slice(0,s):o,l=s?o.slice(s):"";i.setAttribute(a.trim(),l.trim())}),i.text=n,document.head.appendChild(i),r&&i.remove()})}};var Z=document,J=!!Z.startViewTransition;var fe=new WeakSet;function st(t,e,n={}){t instanceof Document&&(t=t.documentElement);let r;typeof e=="string"?r=vn(e):r=e;let i=bn(r),o=mn(t,i,n);return at(t,i,o)}function at(t,e,n){if(n.head.block){let r=t.querySelector("head"),i=e.querySelector("head");if(r&&i){let o=ct(i,r,n);Promise.all(o).then(()=>{at(t,e,Object.assign(n,{head:{block:!1,ignore:!0}}))});return}}if(n.morphStyle==="innerHTML")return lt(e,t,n),t.children;if(n.morphStyle==="outerHTML"||n.morphStyle==null){let r=En(e,t,n);if(!r)throw c("Y1",{old:t,new:e});let i=r?.previousSibling,o=r?.nextSibling,s=de(t,r,n);return r?yn(i,s,o):[]}else throw c("Y2",{style:n.morphStyle})}function de(t,e,n){if(!(n.ignoreActive&&t===document.activeElement))if(e==null){if(n.callbacks.beforeNodeRemoved(t)===!1)return;t.remove(),n.callbacks.afterNodeRemoved(t);return}else{if(pe(t,e))return n.callbacks.beforeNodeMorphed(t,e)===!1?void 0:(t instanceof HTMLHeadElement&&n.head.ignore||(e instanceof HTMLHeadElement&&t instanceof HTMLHeadElement&&n.head.style!==I.Morph?ct(e,t,n):(pn(e,t),lt(e,t,n))),n.callbacks.afterNodeMorphed(t,e),t);if(n.callbacks.beforeNodeRemoved(t)===!1||n.callbacks.beforeNodeAdded(e)===!1)return;if(!t.parentElement)throw c("Y3",{oldNode:t});return t.parentElement.replaceChild(e,t),n.callbacks.afterNodeAdded(e),n.callbacks.afterNodeRemoved(t),e}}function lt(t,e,n){let r=t.firstChild,i=e.firstChild,o;for(;r;){if(o=r,r=o.nextSibling,i==null){if(n.callbacks.beforeNodeAdded(o)===!1)return;e.appendChild(o),n.callbacks.afterNodeAdded(o),B(n,o);continue}if(ut(o,i,n)){de(i,o,n),i=i.nextSibling,B(n,o);continue}let s=gn(t,e,o,i,n);if(s){i=rt(i,s,n),de(s,o,n),B(n,o);continue}let a=hn(t,o,i,n);if(a){i=rt(i,a,n),de(a,o,n),B(n,o);continue}if(n.callbacks.beforeNodeAdded(o)===!1)return;e.insertBefore(o,i),n.callbacks.afterNodeAdded(o),B(n,o)}for(;i!==null;){let s=i;i=i.nextSibling,ft(s,n)}}function pn(t,e){let n=t.nodeType;if(n===1){for(let r of t.attributes)e.getAttribute(r.name)!==r.value&&e.setAttribute(r.name,r.value);for(let r of e.attributes)t.hasAttribute(r.name)||e.removeAttribute(r.name)}if((n===Node.COMMENT_NODE||n===Node.TEXT_NODE)&&e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue),t instanceof HTMLInputElement&&e instanceof HTMLInputElement&&t.type!=="file")e.value=t.value||"",ue(t,e,"value"),ue(t,e,"checked"),ue(t,e,"disabled");else if(t instanceof HTMLOptionElement)ue(t,e,"selected");else if(t instanceof HTMLTextAreaElement&&e instanceof HTMLTextAreaElement){let r=t.value,i=e.value;r!==i&&(e.value=r),e.firstChild&&e.firstChild.nodeValue!==r&&(e.firstChild.nodeValue=r)}}function ue(t,e,n){let r=t.getAttribute(n),i=e.getAttribute(n);r!==i&&(r?e.setAttribute(n,r):e.removeAttribute(n))}function ct(t,e,n){let r=[],i=[],o=[],s=[],a=n.head.style,l=new Map;for(let u of t.children)l.set(u.outerHTML,u);for(let u of e.children){let m=l.has(u.outerHTML),p=n.head.shouldReAppend(u),T=n.head.shouldPreserve(u);m||T?p?i.push(u):(l.delete(u.outerHTML),o.push(u)):a===I.Append?p&&(i.push(u),s.push(u)):n.head.shouldRemove(u)!==!1&&i.push(u)}s.push(...l.values());let f=[];for(let u of s){let m=document.createRange().createContextualFragment(u.outerHTML).firstChild;if(!m)throw c("Y4",{newNode:u});if(n.callbacks.beforeNodeAdded(m)){if(m.hasAttribute("href")||m.hasAttribute("src")){let p,T=new Promise(v=>{p=v});m.addEventListener("load",function(){p(void 0)}),f.push(T)}e.appendChild(m),n.callbacks.afterNodeAdded(m),r.push(m)}}for(let u of i)n.callbacks.beforeNodeRemoved(u)!==!1&&(e.removeChild(u),n.callbacks.afterNodeRemoved(u));return n.head.afterHeadMorphed(e,{added:r,kept:o,removed:i}),f}function F(){}function mn(t,e,n){return{target:t,newContent:e,config:n,morphStyle:n.morphStyle,ignoreActive:n.ignoreActive,idMap:_n(t,e),deadIds:new Set,callbacks:Object.assign({beforeNodeAdded:F,afterNodeAdded:F,beforeNodeMorphed:F,afterNodeMorphed:F,beforeNodeRemoved:F,afterNodeRemoved:F},n.callbacks),head:Object.assign({style:"merge",shouldPreserve:r=>r.getAttribute("im-preserve")==="true",shouldReAppend:r=>r.getAttribute("im-re-append")==="true",shouldRemove:F,afterHeadMorphed:F},n.head)}}function ut(t,e,n){return!t||!e?!1:t.nodeType===e.nodeType&&t.tagName===e.tagName?t?.id?.length&&t.id===e.id?!0:Q(n,t,e)>0:!1}function pe(t,e){return!t||!e?!1:t.nodeType===e.nodeType&&t.tagName===e.tagName}function rt(t,e,n){for(;t!==e;){let r=t;if(t=t?.nextSibling,!r)throw c("Y5",{startInclusive:t,endExclusive:e});ft(r,n)}return B(n,e),e.nextSibling}function gn(t,e,n,r,i){let o=Q(i,n,e),s=null;if(o>0){s=r;let a=0;for(;s!=null;){if(ut(n,s,i))return s;if(a+=Q(i,s,t),a>o)return null;s=s.nextSibling}}return s}function hn(t,e,n,r){let i=n,o=e.nextSibling,s=0;for(;i&&o;){if(Q(r,i,t)>0)return null;if(pe(e,i))return i;if(pe(o,i)&&(s++,o=o.nextSibling,s>=2))return null;i=i.nextSibling}return i}var it=new DOMParser;function vn(t){let e=t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,"");if(e.match(/<\/html>/)||e.match(/<\/head>/)||e.match(/<\/body>/)){let n=it.parseFromString(t,"text/html");if(e.match(/<\/html>/))return fe.add(n),n;{let r=n.firstChild;return r?(fe.add(r),r):null}}else{let r=it.parseFromString(`<body><template>${t}</template></body>`,"text/html").body.querySelector("template")?.content;if(!r)throw c("Y6",{newContent:t});return fe.add(r),r}}function bn(t){if(t==null)return document.createElement("div");if(fe.has(t))return t;if(t instanceof Node){let e=document.createElement("div");return e.append(t),e}else{let e=document.createElement("div");for(let n of[...t])e.append(n);return e}}function yn(t,e,n){let r=[],i=[];for(;t;)r.push(t),t=t.previousSibling;for(;r.length>0;){let o=r.pop();i.push(o),e?.parentElement?.insertBefore(o,e)}for(i.push(e);n;)r.push(n),i.push(n),n=n.nextSibling;for(;r.length;)e?.parentElement?.insertBefore(r.pop(),e.nextSibling);return i}function En(t,e,n){let r=t.firstChild,i=r,o=0;for(;r;){let s=Sn(r,e,n);s>o&&(i=r,o=s),r=r.nextSibling}return i}function Sn(t,e,n){return pe(t,e)?.5+Q(n,t,e):0}function ft(t,e){B(e,t),e.callbacks.beforeNodeRemoved(t)!==!1&&(t.remove(),e.callbacks.afterNodeRemoved(t))}function An(t,e){return!t.deadIds.has(e)}function Tn(t,e,n){return t.idMap.get(n)?.has(e)||!1}function B(t,e){let n=t.idMap.get(e);if(n)for(let r of n)t.deadIds.add(r)}function Q(t,e,n){let r=t.idMap.get(e);if(!r)return 0;let i=0;for(let o of r)An(t,o)&&Tn(t,o,n)&&++i;return i}function ot(t,e){let n=t.parentElement,r=t.querySelectorAll("[id]");for(let i of r){let o=i;for(;o!==n&&o;){let s=e.get(o);s==null&&(s=new Set,e.set(o,s)),s.add(i.id),o=o.parentElement}}}function _n(t,e){let n=new Map;return ot(t,n),ot(e,n),n}var pt={type:2,name:R.MergeFragments,onGlobalInit:async t=>{let e=document.createElement("template");D(R.MergeFragments,({fragments:n="<div></div>",selector:r="",mergeMode:i=ke,settleDuration:o=`${300}`,useViewTransition:s=`${!1}`})=>{let a=parseInt(o),l=C(s);e.innerHTML=n.trim(),[...e.content.children].forEach(u=>{if(!(u instanceof Element))throw c("E1");let m=r||`#${u.getAttribute("id")}`,p=[...document.querySelectorAll(m)||[]];if(!p.length)throw c("E2",{selectorOrID:m});J&&l?Z.startViewTransition(()=>dt(t,i,a,u,p)):dt(t,i,a,u,p)})})}};function dt(t,e,n,r,i){for(let o of i){o.classList.add(U);let s=o.outerHTML,a=o;switch(e){case I.Morph:let u=st(a,r,{callbacks:{beforeNodeRemoved:(m,p)=>(t.cleanup(m),!0)}});if(!u?.length)throw c("E3");a=u[0];break;case I.Inner:a.innerHTML=r.innerHTML;break;case I.Outer:a.replaceWith(r);break;case I.Prepend:a.prepend(r);break;case I.Append:a.append(r);break;case I.Before:a.before(r);break;case I.After:a.after(r);break;case I.UpsertAttributes:r.getAttributeNames().forEach(m=>{let p=r.getAttribute(m);a.setAttribute(m,p)});break;default:throw c("E4",{mergeMode:e})}t.cleanup(a);let l=a.classList;l.add(U),t.apply(document.body),setTimeout(()=>{o.classList.remove(U),l.remove(U)},n);let f=a.outerHTML;s!==f&&(l.add(Se),setTimeout(()=>{l.remove(Se)},n))}}var mt={type:2,name:R.MergeSignals,onGlobalInit:async t=>{D(R.MergeSignals,({signals:e="{}",onlyIfMissing:n=`${!1}`})=>{let{signals:r}=t,i=C(n);r.merge(te(e),i),t.apply(document.body)})}};var gt={type:2,name:R.RemoveFragments,onGlobalInit:async()=>{D(R.RemoveFragments,({selector:t,settleDuration:e=`${300}`,useViewTransition:n=`${!1}`})=>{if(!t.length)throw c("F1");let r=parseInt(e),i=C(n),o=document.querySelectorAll(t),s=()=>{for(let a of o)a.classList.add(U);setTimeout(()=>{for(let a of o)a.remove()},r)};J&&i?Z.startViewTransition(()=>s()):s()})}};var ht={type:2,name:R.RemoveSignals,onGlobalInit:async t=>{D(R.RemoveSignals,({paths:e=""})=>{let n=e.split(`
`).map(r=>r.trim());if(!n?.length)throw c("G1");t.signals.remove(...n),t.apply(document.body)})}};var vt={type:3,name:"clipboard",fn:(t,e)=>{if(!navigator.clipboard)throw c("H1");navigator.clipboard.writeText(e)}};var bt="once",yt="half",Et="full",St={type:1,name:"intersects",mods:new Set([bt,yt,Et]),onLoad:({el:t,key:e,rawKey:n,mods:r,genRX:i})=>{if(e.length)throw c("J1");let o={threshold:0};r.has(Et)?o.threshold=1:r.has(yt)&&(o.threshold=.5);let s=i(),a=new IntersectionObserver(l=>{l.forEach(f=>{f.isIntersecting&&(s(),r.has(bt)&&(a.disconnect(),delete t.dataset[n]))})},o);return a.observe(t),()=>a.disconnect()}};var Nn="session",xn="local",Pn="remote",At={type:1,name:"persist",mods:new Set([xn,Nn,Pn]),onLoad:()=>{throw c("K1")}};var Tt={type:1,name:"replaceUrl",onLoad:({key:t,value:e,effect:n,genRX:r})=>{if(t.length)throw c("L1");if(!e.length)throw c("L2");let i=r();return n(()=>{let o=i(),s=window.location.href,a=new URL(o,s).toString();window.history.replaceState({},"",a)})}};var me="smooth",we="instant",Ne="auto",_t="hstart",wt="hcenter",Nt="hend",xt="hnearest",Pt="vstart",Rt="vcenter",Mt="vend",It="vnearest",Rn="focus",ge="center",Lt="start",kt="end",Vt="nearest",Dt={type:1,name:"scrollIntoView",mods:new Set([me,we,Ne,_t,wt,Nt,xt,Pt,Rt,Mt,It,Rn]),onLoad:({el:t,mods:e,key:n,value:r,rawKey:i})=>{if(n.length)throw c("M1");if(r.length)throw c("M2");t.tabIndex||t.setAttribute("tabindex","0");let o={behavior:me,block:ge,inline:ge};if(e.has(me)&&(o.behavior=me),e.has(we)&&(o.behavior=we),e.has(Ne)&&(o.behavior=Ne),e.has(_t)&&(o.inline=Lt),e.has(wt)&&(o.inline=ge),e.has(Nt)&&(o.inline=kt),e.has(xt)&&(o.inline=Vt),e.has(Pt)&&(o.block=Lt),e.has(Rt)&&(o.block=ge),e.has(Mt)&&(o.block=kt),e.has(It)&&(o.block=Vt),!(t instanceof HTMLElement||t instanceof SVGElement))throw c("M3",t);return t.tabIndex||t.setAttribute("tabindex","0"),t.scrollIntoView(o),e.has("focus")&&t.focus(),delete t.dataset[i],()=>{}}};var Ot="none",Ct="display",Ft={type:1,name:"show",onLoad:({el:{style:t},key:e,value:n,genRX:r,effect:i})=>{if(e.length)throw c("N1");if(!n.length)throw c("N2");let o=r();return i(async()=>{o()?t.display===Ot&&t.removeProperty(Ct):t.setProperty(Ct,Ot)})}};var xe="view-transition",Ht={type:1,name:xe,onGlobalInit(){let t=!1;if(document.head.childNodes.forEach(e=>{e instanceof HTMLMetaElement&&e.name===xe&&(t=!0)}),!t){let e=document.createElement("meta");e.name=xe,e.content="same-origin",document.head.appendChild(e)}},onLoad:({effect:t,el:e,genRX:n})=>{if(!J){console.error("Browser does not support view transitions");return}let r=n();return t(()=>{let i=r();if(!i?.length)return;let o=e.style;o.viewTransitionName=i})}};var Wt={type:1,name:"attributes",onLoad:({el:t,genRX:e,key:n,effect:r})=>{let i=e();return n===""?r(async()=>{let o=i();Object.entries(o).forEach(([s,a])=>{t.setAttribute(s,a)})}):(n=$(n),r(async()=>{let o=!1;try{o=i()}catch{}let s;typeof o=="string"?s=o:s=JSON.stringify(o),!s||s==="false"||s==="null"||s==="undefined"?t.removeAttribute(n):t.setAttribute(n,s)}))}};var Mn=/^data:(?<mime>[^;]+);base64,(?<contents>.*)$/,Ut=["change","input","keydown"],Bt={type:1,name:"bind",onLoad:t=>{let{el:e,value:n,key:r,signals:i,effect:o}=t;if(r.length)throw c("Q1");let s=()=>{},a=()=>{},l=n;if(typeof l!="string")throw c("Q2");let f=e.tagName.toLowerCase(),u="",m=f.includes("input"),p=e.getAttribute("type"),T=f.includes("checkbox")||m&&p==="checkbox";T&&(u=!1),m&&p==="number"&&(u=0);let b=f.includes("select"),S=f.includes("radio")||m&&p==="radio",A=m&&p==="file";S&&(e.getAttribute("name")?.length||e.setAttribute("name",l)),i.upsert(l,u),s=()=>{let g="value"in e,d=i.value(l),h=`${d}`;if(T||S){let _=e;T?_.checked=!!d||d==="true":S&&(_.checked=h===_.value)}else if(!A)if(b){let _=e;_.multiple?Array.from(_.options).forEach(x=>{x?.disabled||(Array.isArray(d)||typeof d=="string"?x.selected=d.includes(x.value):typeof d=="number"?x.selected=d===Number(x.value):x.selected=d)}):_.value=h}else g?e.value=h:e.setAttribute("value",h)},a=async()=>{if(A){let h=[...e?.files||[]],_=[],x=[],k=[];await Promise.all(h.map(Re=>new Promise(Zt=>{let H=new FileReader;H.onload=()=>{if(typeof H.result!="string")throw c("Q3",{type:typeof H.result});let he=H.result.match(Mn);if(!he?.groups)throw c("Q4",{result:H.result});_.push(he.groups.contents),x.push(he.groups.mime),k.push(Re.name)},H.onloadend=()=>Zt(void 0),H.readAsDataURL(Re)}))),i.setValue(l,_);let O=`${l}Mimes`,L=`${l}Names`;O in i&&i.upsert(O,x),L in i&&i.upsert(L,k);return}let g=i.value(l),d=e||e;if(typeof g=="number"){let h=Number(d.value||d.getAttribute("value"));i.setValue(l,h)}else if(typeof g=="string"){let h=d.value||d.getAttribute("value")||"";i.setValue(l,h)}else if(typeof g=="boolean")if(T){let h=d.checked||d.getAttribute("checked")==="true";i.setValue(l,h)}else{let h=!!(d.value||d.getAttribute("value"));i.setValue(l,h)}else if(!(typeof g>"u"))if(Array.isArray(g)){if(b){let x=[...e.selectedOptions].filter(k=>k.selected).map(k=>k.value);i.setValue(l,x)}else{let h=JSON.stringify(d.value.split(","));i.setValue(l,h)}console.log(d.value)}else throw c("Q5",{current:typeof g})},Ut.forEach(g=>e.addEventListener(g,a));let N=o(()=>s());return()=>{N(),Ut.forEach(g=>{e.removeEventListener(g,a)})}}};var $t={type:1,name:"class",onLoad:({key:t,el:e,genRX:n,effect:r})=>{let i=e.classList,o=n();return r(()=>{if(t===""){let s=o();for(let[a,l]of Object.entries(s)){let f=a.split(/\_+/);l?i.add(...f):i.remove(...f)}}else{let s=o(),a=$(t);s?i.add(a):i.remove(a)}})}};function Pe(t){if(!t||t.size<=0)return 0;for(let e of t){if(e.endsWith("ms"))return Number(e.replace("ms",""));if(e.endsWith("s"))return Number(e.replace("s",""))*1e3;try{return parseFloat(e)}catch{}}return 0}function ee(t,e,n=!1){return t?t.has(e):n}function Gt(t,e,n=!1,r=!0){let i=-1,o=()=>i&&clearTimeout(i);return function(...a){o(),n&&!i&&t(...a),i=setTimeout(()=>{r&&t(...a),o()},e)}}function Kt(t,e,n=!0,r=!1){let i=!1;return function(...s){i||(n&&t(...s),i=!0,setTimeout(()=>{i=!1,r&&t(...s)},e))}}var In=new Set(["window","once","passive","capture","debounce","throttle","remote","outside"]),jt={type:1,name:"on",argNames:["evt"],onLoad:({el:t,key:e,genRX:n,mods:r,signals:i,effect:o})=>{let s=n(),a=t;r.has("window")&&(a=window);let l=b=>s(b),f=r.get("debounce");if(f){let b=Pe(f),S=ee(f,"leading",!1),A=!ee(f,"noTrail",!1);l=Gt(l,b,S,A)}let u=r.get("throttle");if(u){let b=Pe(u),S=!ee(u,"noLeading",!1),A=ee(u,"trail",!1);l=Kt(l,b,S,A)}let m={capture:!0,passive:!1,once:!1};r.has("capture")||(m.capture=!1),r.has("passive")&&(m.passive=!0),r.has("once")&&(m.once=!0),[...r.keys()].filter(b=>!In.has(b)).forEach(b=>{let S=r.get(b)||[],A=l;l=()=>{let g=event,d=g[b],h;if(typeof d=="function")h=d(...S);else if(typeof d=="boolean")h=d;else if(typeof d=="string"){let _=d.toLowerCase().trim(),x=[...S].join("").toLowerCase().trim();h=_===x}else throw c("R1",{attrName:b,key:e,el:t});h&&A(g)}});let T="",v=$(e).toLowerCase();switch(v){case"load":return l(),delete t.dataset.onLoad,()=>{};case"raf":let b,S=()=>{l(),b=requestAnimationFrame(S)};return b=requestAnimationFrame(S),()=>{b&&cancelAnimationFrame(b)};case"signals-change":return o(()=>{let N=r.has("remote"),g=i.JSON(!1,N);T!==g&&(T=g,l())});default:if(r.has("outside")){a=document;let N=l,g=!1;l=h=>{let _=h?.target;if(!_)return;let x=t.id===_.id;x&&g&&(g=!1),!x&&!g&&(N(h),g=!0)}}return a.addEventListener(v,l,m),()=>{a.removeEventListener(v,l)}}}};var qt={type:1,name:"ref",onLoad:({el:t,key:e,value:n,signals:r})=>{if(e.length)throw c("S1");if(!n.length)throw c("S2");return r.upsert(n,t),()=>r.remove(n)}};var Jt={type:1,name:"text",onLoad:t=>{let{el:e,genRX:n,effect:r}=t,i=n();return e instanceof HTMLElement||c("Element is not HTMLElement"),r(()=>{let o=i(t);e.textContent=`${o}`})}};var{round:Ln,max:kn,min:Vn}=Math,Yt={type:3,name:"fit",fn:(t,e,n,r,i,o,s=!1,a=!1)=>{let l=(e-n)/(r-n)*(o-i)+i;return a&&(l=Ln(l)),s&&(l=kn(i,Vn(o,l))),l}};var zt={type:3,name:"setAll",fn:(t,e,n)=>{let r=new RegExp(e);t.signals.walk((i,o)=>r.test(i)&&(o.value=n))}};var Xt={type:3,name:"toggleAll",fn:(t,e)=>{let n=new RegExp(e);t.signals.walk((r,i)=>n.test(r)&&(i.value=!i.value))}};Ye.load(Wt,Bt,tt,qt,$t,jt,Ft,Jt,et,pt,mt,gt,ht,nt,vt,St,At,Tt,Dt,Ht,Yt,zt,Xt);})();
//# sourceMappingURL=datastar.js.map
