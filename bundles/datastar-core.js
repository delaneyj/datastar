// Datastar v0.21.3
var ge="computed",U={type:1,name:ge,keyReq:1,valReq:1,onLoad:({key:t,signals:e,genRX:s})=>{let n=s();e.setComputed(t,n)}};var W=t=>t.replace(/(?:^\w|[A-Z]|\b\w)/g,(e,s)=>s===0?e.toLowerCase():e.toUpperCase()).replace(/\s+/g,""),J=t=>new Function(`return Object.assign({}, ${t})`)();var K={type:1,name:"signals",valReq:1,removeOnLoad:!0,onLoad:t=>{let{key:e,genRX:s,signals:n,mods:r}=t,i=r.has("ismissing");if(e!==""&&!i)n.setValue(e,s()());else{let o=J(t.value);t.value=JSON.stringify(o),n.merge(s()(),i)}}};var z={type:1,name:"star",keyReq:2,valReq:2,onLoad:()=>{alert("YOU ARE PROBABLY OVERCOMPLICATING IT")}};var H={name:"signalValue",type:0,fn:t=>{let e=/(?<path>[\w0-9.]*)((\.value))/gm;return t.replaceAll(e,"ctx.signals.signal('$1').value")}};var Y="datastar";var X="0.21.3";var he={Morph:"morph",Inner:"inner",Outer:"outer",Prepend:"prepend",Append:"append",Before:"before",After:"after",UpsertAttributes:"upsertAttributes"},Ce=he.Morph;function Z(t){if(t.id)return t.id;let e=0,s=i=>(e=(e<<5)-e+i,e&e),n=i=>{for(let o of i.split(""))s(o.charCodeAt(0))},r=t;for(;r.parentNode;){if(r.id){n(`${r.id}`);break}if(r===r.ownerDocument.documentElement)n(r.tagName);else{for(let i=1,o=t;o.previousElementSibling;o=o.previousElementSibling,i++)s(i);r=r.parentNode}r=r.parentNode}return Y+e}var _e="https://data-star.dev/errors";var u=(t,e)=>{let s=new Error;t=t.charAt(0).toUpperCase()+t.slice(1),s.name=`error ${t}`;let n=`${_e}/${t}?${new URLSearchParams(e)}`;return s.message=`for more info see ${n}`,s};var me=Symbol.for("preact-signals"),g=1,b=2,w=4,E=8,M=16,x=32;function L(){C++}function B(){if(C>1){C--;return}let t,e=!1;for(;N!==void 0;){let s=N;for(N=void 0,$++;s!==void 0;){let n=s._nextBatchedEffect;if(s._nextBatchedEffect=void 0,s._flags&=~b,!(s._flags&E)&&ee(s))try{s._callback()}catch(r){e||(t=r,e=!0)}s=n}}if($=0,C--,e)throw u("BatchError, error",{error:t})}var a;var N,C=0,$=0,P=0;function Q(t){if(a===void 0)return;let e=t._node;if(e===void 0||e._target!==a)return e={_version:0,_source:t,_prevSource:a._sources,_nextSource:void 0,_target:a,_prevTarget:void 0,_nextTarget:void 0,_rollbackNode:e},a._sources!==void 0&&(a._sources._nextSource=e),a._sources=e,t._node=e,a._flags&x&&t._subscribe(e),e;if(e._version===-1)return e._version=0,e._nextSource!==void 0&&(e._nextSource._prevSource=e._prevSource,e._prevSource!==void 0&&(e._prevSource._nextSource=e._nextSource),e._prevSource=a._sources,e._nextSource=void 0,a._sources._nextSource=e,a._sources=e),e}function c(t){this._value=t,this._version=0,this._node=void 0,this._targets=void 0}c.prototype.brand=me;c.prototype._refresh=()=>!0;c.prototype._subscribe=function(t){this._targets!==t&&t._prevTarget===void 0&&(t._nextTarget=this._targets,this._targets!==void 0&&(this._targets._prevTarget=t),this._targets=t)};c.prototype._unsubscribe=function(t){if(this._targets!==void 0){let e=t._prevTarget,s=t._nextTarget;e!==void 0&&(e._nextTarget=s,t._prevTarget=void 0),s!==void 0&&(s._prevTarget=e,t._nextTarget=void 0),t===this._targets&&(this._targets=s)}};c.prototype.subscribe=function(t){return V(()=>{let e=this.value,s=a;a=void 0;try{t(e)}finally{a=s}})};c.prototype.valueOf=function(){return this.value};c.prototype.toString=function(){return`${this.value}`};c.prototype.toJSON=function(){return this.value};c.prototype.peek=function(){let t=a;a=void 0;try{return this.value}finally{a=t}};Object.defineProperty(c.prototype,"value",{get(){let t=Q(this);return t!==void 0&&(t._version=this._version),this._value},set(t){if(t!==this._value){if($>100)throw u("SignalCycleDetected");this._value=t,this._version++,P++,L();try{for(let e=this._targets;e!==void 0;e=e._nextTarget)e._target._notify()}finally{B()}}}});function ee(t){for(let e=t._sources;e!==void 0;e=e._nextSource)if(e._source._version!==e._version||!e._source._refresh()||e._source._version!==e._version)return!0;return!1}function te(t){for(let e=t._sources;e!==void 0;e=e._nextSource){let s=e._source._node;if(s!==void 0&&(e._rollbackNode=s),e._source._node=e,e._version=-1,e._nextSource===void 0){t._sources=e;break}}}function ne(t){let e=t._sources,s;for(;e!==void 0;){let n=e._prevSource;e._version===-1?(e._source._unsubscribe(e),n!==void 0&&(n._nextSource=e._nextSource),e._nextSource!==void 0&&(e._nextSource._prevSource=n)):s=e,e._source._node=e._rollbackNode,e._rollbackNode!==void 0&&(e._rollbackNode=void 0),e=n}t._sources=s}function v(t){c.call(this,void 0),this._fn=t,this._sources=void 0,this._globalVersion=P-1,this._flags=w}v.prototype=new c;v.prototype._refresh=function(){if(this._flags&=~b,this._flags&g)return!1;if((this._flags&(w|x))===x||(this._flags&=~w,this._globalVersion===P))return!0;if(this._globalVersion=P,this._flags|=g,this._version>0&&!ee(this))return this._flags&=~g,!0;let t=a;try{te(this),a=this;let e=this._fn();(this._flags&M||this._value!==e||this._version===0)&&(this._value=e,this._flags&=~M,this._version++)}catch(e){this._value=e,this._flags|=M,this._version++}return a=t,ne(this),this._flags&=~g,!0};v.prototype._subscribe=function(t){if(this._targets===void 0){this._flags|=w|x;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._subscribe(e)}c.prototype._subscribe.call(this,t)};v.prototype._unsubscribe=function(t){if(this._targets!==void 0&&(c.prototype._unsubscribe.call(this,t),this._targets===void 0)){this._flags&=~x;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e)}};v.prototype._notify=function(){if(!(this._flags&b)){this._flags|=w|b;for(let t=this._targets;t!==void 0;t=t._nextTarget)t._target._notify()}};Object.defineProperty(v.prototype,"value",{get(){if(this._flags&g)throw u("SignalCycleDetected");let t=Q(this);if(this._refresh(),t!==void 0&&(t._version=this._version),this._flags&M)throw u("GetComputedError",{value:this._value});return this._value}});function se(t){return new v(t)}function re(t){let e=t._cleanup;if(t._cleanup=void 0,typeof e=="function"){L();let s=a;a=void 0;try{e()}catch(n){throw t._flags&=~g,t._flags|=E,G(t),u("CleanupEffectError",{error:n})}finally{a=s,B()}}}function G(t){for(let e=t._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e);t._fn=void 0,t._sources=void 0,re(t)}function ye(t){if(a!==this)throw u("EndEffectError");ne(this),a=t,this._flags&=~g,this._flags&E&&G(this),B()}function R(t){this._fn=t,this._cleanup=void 0,this._sources=void 0,this._nextBatchedEffect=void 0,this._flags=x}R.prototype._callback=function(){let t=this._start();try{if(this._flags&E||this._fn===void 0)return;let e=this._fn();typeof e=="function"&&(this._cleanup=e)}finally{t()}};R.prototype._start=function(){if(this._flags&g)throw u("SignalCycleDetected");this._flags|=g,this._flags&=~E,re(this),te(this),L();let t=a;return a=this,ye.bind(this,t)};R.prototype._notify=function(){this._flags&b||(this._flags|=b,this._nextBatchedEffect=N,N=this)};R.prototype._dispose=function(){this._flags|=E,this._flags&g||G(this)};function V(t){let e=new R(t);try{e._callback()}catch(s){throw e._dispose(),s}return e._dispose.bind(e)}function ie(t,e=!1){let s={};for(let n in t)if(Object.hasOwn(t,n)){if(e&&n.startsWith("_"))continue;let r=t[n];r instanceof c?s[n]=r.value:s[n]=ie(r)}return s}function oe(t,e,s=!1){for(let n in e)if(Object.hasOwn(e,n)){if(n.match(/\_\_+/))throw u("InvalidSignalKey",{key:n});let r=e[n];if(r instanceof Object&&!Array.isArray(r))t[n]||(t[n]={}),oe(t[n],r,s);else{if(s&&t[n])continue;t[n]instanceof c?t[n].value=r:t[n]=new c(r)}}}function ae(t,e){for(let s in t)if(Object.hasOwn(t,s)){let n=t[s];n instanceof c?e(s,n):ae(n,(r,i)=>{e(`${s}.${r}`,i)})}}function ve(t,...e){let s={};for(let n of e){let r=n.split("."),i=t,o=s;for(let d=0;d<r.length-1;d++){let p=r[d];if(!i[p])return{};o[p]||(o[p]={}),i=i[p],o=o[p]}let f=r[r.length-1];o[f]=i[f]}return s}var k=class{#e={};exists(e){return!!this.signal(e)}signal(e){let s=e.split("."),n=this.#e;for(let o=0;o<s.length-1;o++){let f=s[o];if(!n[f])return null;n=n[f]}let r=s[s.length-1],i=n[r];if(!i)throw u("SignalNotFound",{path:e});return i}setSignal(e,s){let n=e.split("."),r=this.#e;for(let o=0;o<n.length-1;o++){let f=n[o];r[f]||(r[f]={}),r=r[f]}let i=n[n.length-1];r[i]=s}setComputed(e,s){let n=se(()=>s());this.setSignal(e,n)}value(e){return this.signal(e)?.value}setValue(e,s){let n=this.upsert(e,s);n.value=s}upsert(e,s){let n=e.split("."),r=this.#e;for(let d=0;d<n.length-1;d++){let p=n[d];r[p]||(r[p]={}),r=r[p]}let i=n[n.length-1],o=r[i];if(o)return(o.value===null||o.value===void 0)&&(o.value=s),o;let f=new c(s);return r[i]=f,f}remove(...e){for(let s of e){let n=s.split("."),r=this.#e;for(let o=0;o<n.length-1;o++){let f=n[o];if(!r[f])return;r=r[f]}let i=n[n.length-1];delete r[i]}}merge(e,s=!1){oe(this.#e,e,s)}subset(...e){return ve(this.values(),...e)}walk(e){ae(this.#e,e)}values(e=!1){return ie(this.#e,e)}JSON(e=!0,s=!1){let n=this.values(s);return e?JSON.stringify(n,null,2):JSON.stringify(n)}toString(){return this.JSON()}};var D=class{#e=new k;#r=[];#i=[];#n={};#a=[];#t=new Map;get signals(){return this.#e}get version(){return X}load(...e){for(let s of e){let n;switch(s.type){case 0:{this.#i.push(s);break}case 2:{let r=s;this.#a.push(r),n=r.onGlobalInit;break}case 3:{this.#n[s.name]=s;break}case 1:{let r=s;this.#r.push(r),n=r.onGlobalInit;break}default:throw u("InvalidPluginType",{name:s.name,type:s.type})}if(n){let r=this;n({get signals(){return r.#e},effect:i=>V(i),actions:this.#n,apply:this.apply.bind(this),cleanup:this.#s.bind(this)})}}this.apply(document.body)}apply(e){let s=new Set;this.#r.forEach((n,r)=>{this.#o(e,i=>{if(!("starIgnore"in i.dataset)){r||this.#s(i);for(let o in i.dataset){if(!o.startsWith(n.name))continue;let f=o.slice(n.name.length),[d,...p]=f.split(/\_\_+/),_=d.length>0;_&&(d.startsWith("-_")?d=d.slice(1):d=d[0].toLowerCase()+d.slice(1));let F=`${i.dataset[o]}`||"",h=F,m=h.length>0,l=n.keyReq||0;if(_){if(l===2)throw u(`${n.name}KeyNotAllowed`,{key:d})}else if(l===1)throw u(`${n.name}KeyRequired`);let T=n.valReq||0;if(m){if(T===2)throw u(`${n.name}ValueNotAllowed`,{value:h})}else if(T===1)throw u(`${n.name}ValueRequired`);if(l===3||T===3){if(_&&m)throw u(`${n.name}KeyAndValueProvided`);if(!_&&!m)throw u(`${n.name}KeyOrValueRequired`)}i.id.length||(i.id=Z(i)),s.clear();let A=new Map;for(let y of p){let[fe,...de]=y.split(".");A.set(W(fe),new Set(de.map(pe=>pe.toLowerCase())))}let ce=[...n.macros?.pre||[],...this.#i,...n.macros?.post||[]];for(let y of ce)s.has(y)||(s.add(y),h=y.fn(h));let S=this,j={get signals(){return S.#e},effect:y=>V(y),apply:S.apply.bind(S),cleanup:S.#s.bind(S),actions:S.#n,genRX:()=>this.#l(j,...n.argNames||[]),el:i,rawKey:o,rawValue:F,key:d,value:h,mods:A},q=n.onLoad(j);q&&(this.#t.has(i)||this.#t.set(i,{id:i.id,set:new Set}),this.#t.get(i)?.set.add(q)),n?.removeOnLoad&&delete i.dataset[o]}}})})}#l(e,...s){let n=e.value.split(/;|\n/).map(l=>l.trim()).filter(l=>l!==""),r=n.length-1;n[r].startsWith("return")||(n[r]=`return (${n[r]});`);let o=n.join(`
`),f=/(\w*)\(/gm,d=o.matchAll(f),p=new Set;for(let l of d)p.add(l[1]);let _=Object.keys(this.#n).filter(l=>p.has(l)),h=`${_.map(l=>`const ${l} = ctx.actions.${l}.fn;`).join(`
`)}return (()=> {${o}})()`,m=h.trim();for(let l of _)m=m.replaceAll(`${l}(`,`${l}(ctx,`);try{let l=s||[],T=new Function("ctx",...l,m);return(...A)=>T(e,...A)}catch(l){throw u("GeneratingExpressionFailed",{error:l,fnContent:h})}}#o(e,s){if(!e||!(e instanceof HTMLElement||e instanceof SVGElement))return null;s(e);let n=e.firstElementChild;for(;n;)this.#o(n,s),n=n.nextElementSibling}#s(e){let s=this.#t.get(e);if(s){for(let n of s.set)n();this.#t.delete(e)}}};var le=new D;le.load(z,H,K,U);var ue=le;var nt=ue;export{nt as Datastar};
//# sourceMappingURL=datastar-core.js.map
