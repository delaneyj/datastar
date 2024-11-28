"use strict";(()=>{var te={pluginType:"attribute",name:"computed",mustNotEmptyKey:!0,onLoad:t=>{let e=t.store();return e[t.key]=t.reactivity.computed(()=>t.expressionFn(t)),()=>{let r=t.store();delete r[t.key]}}};function ne(t,e,r){let n={};if(!r)Object.assign(n,e);else for(let s in e){let o=t[s]?.value;o==null&&(n[s]=e[s])}return n}var re={pluginType:"attribute",name:"mergeSignals",removeNewLines:!0,preprocessors:{pre:[{pluginType:"preprocessor",name:"store",regexp:/(?<whole>.+)/g,replacer:t=>{let{whole:e}=t;return`Object.assign({...ctx.store()}, ${e})`}}]},allowedModifiers:new Set(["ifmissing"]),onLoad:t=>{let e=t.expressionFn(t),r=ne(t.store(),e,t.modifiers.has("ifmissing"));t.mergeSignals(r),delete t.el.dataset[t.rawKey]}};var se={pluginType:"attribute",name:"star",onLoad:()=>{alert("YOU ARE PROBABLY OVERCOMPLICATING IT")}};var oe="[a-zA-Z_$]+",Te=oe+"[0-9a-zA-Z_$.]*";function L(t,e,r,n=!0){let s=n?Te:oe;return new RegExp(`(?<whole>${t}(?<${e}>${s})${r})`,"g")}var ie={name:"action",pluginType:"preprocessor",regexp:L("\\$","action","(?<call>\\((?<args>.*)\\))",!1),replacer:({action:t,args:e})=>{let r=["ctx"];e&&r.push(...e.split(",").map(s=>s.trim()));let n=r.join(",");return`ctx.actions.${t}.method(${n})`}};var ae={name:"signal",pluginType:"preprocessor",regexp:L("\\$","signal","(?<method>\\([^\\)]*\\))?"),replacer:t=>{let{signal:e,method:r}=t,n="ctx.store()";if(!r?.length)return`${n}.${e}.value`;let s=e.split("."),o=s.pop(),a=s.join(".");return`${n}.${a}.value.${o}${r}`}};var k="datastar";var Ee={Morph:"morph",Inner:"inner",Outer:"outer",Prepend:"prepend",Append:"append",Before:"before",After:"after",UpsertAttributes:"upsertAttributes"},Be=Ee.Morph;var v=t=>{let e=new Error;return e.name=`${k}${t}`,e},d=v(400),w=v(409),B=v(404),x=v(403),le=v(405),Je=v(503);function ue(t){if(t.id)return t.id;let e=0,r=s=>(e=(e<<5)-e+s,e&e),n=s=>s.split("").forEach(o=>r(o.charCodeAt(0)));for(;t.parentNode;){if(t.id){n(`${t.id}`);break}else if(t===t.ownerDocument.documentElement)n(t.tagName);else{for(let s=1,o=t;o.previousElementSibling;o=o.previousElementSibling,s++)r(s);t=t.parentNode}t=t.parentNode}return k+e}var Re=Symbol.for("preact-signals"),g=1,T=2,O=4,R=8,C=16,E=32;function M(){D++}function I(){if(D>1){D--;return}let t,e=!1;for(;A!==void 0;){let r=A;for(A=void 0,G++;r!==void 0;){let n=r._nextBatchedEffect;if(r._nextBatchedEffect=void 0,r._flags&=~T,!(r._flags&R)&&pe(r))try{r._callback()}catch(s){e||(t=s,e=!0)}r=n}}if(G=0,D--,e)throw t}function ce(t){if(D>0)return t();M();try{return t()}finally{I()}}var i;var A,D=0,G=0,j=0;function fe(t){if(i===void 0)return;let e=t._node;if(e===void 0||e._target!==i)return e={_version:0,_source:t,_prevSource:i._sources,_nextSource:void 0,_target:i,_prevTarget:void 0,_nextTarget:void 0,_rollbackNode:e},i._sources!==void 0&&(i._sources._nextSource=e),i._sources=e,t._node=e,i._flags&E&&t._subscribe(e),e;if(e._version===-1)return e._version=0,e._nextSource!==void 0&&(e._nextSource._prevSource=e._prevSource,e._prevSource!==void 0&&(e._prevSource._nextSource=e._nextSource),e._prevSource=i._sources,e._nextSource=void 0,i._sources._nextSource=e,i._sources=e),e}function c(t){this._value=t,this._version=0,this._node=void 0,this._targets=void 0}c.prototype.brand=Re;c.prototype._refresh=function(){return!0};c.prototype._subscribe=function(t){this._targets!==t&&t._prevTarget===void 0&&(t._nextTarget=this._targets,this._targets!==void 0&&(this._targets._prevTarget=t),this._targets=t)};c.prototype._unsubscribe=function(t){if(this._targets!==void 0){let e=t._prevTarget,r=t._nextTarget;e!==void 0&&(e._nextTarget=r,t._prevTarget=void 0),r!==void 0&&(r._prevTarget=e,t._nextTarget=void 0),t===this._targets&&(this._targets=r)}};c.prototype.subscribe=function(t){return J(()=>{let e=this.value,r=i;i=void 0;try{t(e)}finally{i=r}})};c.prototype.valueOf=function(){return this.value};c.prototype.toString=function(){return this.value+""};c.prototype.toJSON=function(){return this.value};c.prototype.peek=function(){let t=i;i=void 0;try{return this.value}finally{i=t}};Object.defineProperty(c.prototype,"value",{get(){let t=fe(this);return t!==void 0&&(t._version=this._version),this._value},set(t){if(t!==this._value){if(G>100)throw d;this._value=t,this._version++,j++,M();try{for(let e=this._targets;e!==void 0;e=e._nextTarget)e._target._notify()}finally{I()}}}});function F(t){return new c(t)}function pe(t){for(let e=t._sources;e!==void 0;e=e._nextSource)if(e._source._version!==e._version||!e._source._refresh()||e._source._version!==e._version)return!0;return!1}function de(t){for(let e=t._sources;e!==void 0;e=e._nextSource){let r=e._source._node;if(r!==void 0&&(e._rollbackNode=r),e._source._node=e,e._version=-1,e._nextSource===void 0){t._sources=e;break}}}function ge(t){let e=t._sources,r;for(;e!==void 0;){let n=e._prevSource;e._version===-1?(e._source._unsubscribe(e),n!==void 0&&(n._nextSource=e._nextSource),e._nextSource!==void 0&&(e._nextSource._prevSource=n)):r=e,e._source._node=e._rollbackNode,e._rollbackNode!==void 0&&(e._rollbackNode=void 0),e=n}t._sources=r}function b(t){c.call(this,void 0),this._fn=t,this._sources=void 0,this._globalVersion=j-1,this._flags=O}b.prototype=new c;b.prototype._refresh=function(){if(this._flags&=~T,this._flags&g)return!1;if((this._flags&(O|E))===E||(this._flags&=~O,this._globalVersion===j))return!0;if(this._globalVersion=j,this._flags|=g,this._version>0&&!pe(this))return this._flags&=~g,!0;let t=i;try{de(this),i=this;let e=this._fn();(this._flags&C||this._value!==e||this._version===0)&&(this._value=e,this._flags&=~C,this._version++)}catch(e){this._value=e,this._flags|=C,this._version++}return i=t,ge(this),this._flags&=~g,!0};b.prototype._subscribe=function(t){if(this._targets===void 0){this._flags|=O|E;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._subscribe(e)}c.prototype._subscribe.call(this,t)};b.prototype._unsubscribe=function(t){if(this._targets!==void 0&&(c.prototype._unsubscribe.call(this,t),this._targets===void 0)){this._flags&=~E;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e)}};b.prototype._notify=function(){if(!(this._flags&T)){this._flags|=O|T;for(let t=this._targets;t!==void 0;t=t._nextTarget)t._target._notify()}};Object.defineProperty(b.prototype,"value",{get(){if(this._flags&g)throw d;let t=fe(this);if(this._refresh(),t!==void 0&&(t._version=this._version),this._flags&C)throw this._value;return this._value}});function he(t){return new b(t)}function _e(t){let e=t._cleanup;if(t._cleanup=void 0,typeof e=="function"){M();let r=i;i=void 0;try{e()}catch(n){throw t._flags&=~g,t._flags|=R,H(t),n}finally{i=r,I()}}}function H(t){for(let e=t._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e);t._fn=void 0,t._sources=void 0,_e(t)}function we(t){if(i!==this)throw d;ge(this),i=t,this._flags&=~g,this._flags&R&&H(this),I()}function P(t){this._fn=t,this._cleanup=void 0,this._sources=void 0,this._nextBatchedEffect=void 0,this._flags=E}P.prototype._callback=function(){let t=this._start();try{if(this._flags&R||this._fn===void 0)return;let e=this._fn();typeof e=="function"&&(this._cleanup=e)}finally{t()}};P.prototype._start=function(){if(this._flags&g)throw d;this._flags|=g,this._flags&=~R,_e(this),de(this),M();let t=i;return i=this,we.bind(this,t)};P.prototype._notify=function(){this._flags&T||(this._flags|=T,this._nextBatchedEffect=A,A=this)};P.prototype._dispose=function(){this._flags|=R,this._flags&g||H(this)};function J(t){let e=new P(t);try{e._callback()}catch(r){throw e._dispose(),r}return e._dispose.bind(e)}var $=class{get value(){return K(this)}set value(e){ce(()=>Ae(this,e))}peek(){return K(this,{peek:!0})}},N=t=>Object.assign(new $,Object.entries(t).reduce((e,[r,n])=>{if(["value","peek"].some(s=>s===r))throw x;return typeof n!="object"||n===null||Array.isArray(n)?e[r]=F(n):e[r]=N(n),e},{})),Ae=(t,e)=>Object.keys(e).forEach(r=>t[r].value=e[r]),K=(t,{peek:e=!1}={})=>Object.entries(t).reduce((r,[n,s])=>(s instanceof c?r[n]=e?s.peek():s.value:s instanceof $&&(r[n]=K(s,{peek:e})),r),{});function W(t,e){if(typeof e!="object"||Array.isArray(e)||!e)return JSON.parse(JSON.stringify(e));if(typeof e=="object"&&e.toJSON!==void 0&&typeof e.toJSON=="function")return e.toJSON();let r=t;return typeof t!="object"&&(r={...e}),Object.keys(e).forEach(n=>{r.hasOwnProperty(n)||(r[n]=e[n]),e[n]===null?delete r[n]:r[n]=W(r[n],e[n])}),r}var me="0.20.1";var De=t=>t.pluginType==="preprocessor",Oe=t=>t.pluginType==="watcher",Pe=t=>t.pluginType==="attribute",Ne=t=>t.pluginType==="action",V=class{constructor(){this.plugins=[];this.store=N({});this.preprocessors=new Array;this.actions={};this.watchers=new Array;this.refs={};this.reactivity={signal:F,computed:he,effect:J};this.removals=new Map;this.mergeRemovals=new Array;this.lastMarshalledStore=""}get version(){return me}load(...e){let r=new Set(this.plugins);e.forEach(n=>{if(n.requiredPlugins){for(let o of n.requiredPlugins)if(!r.has(o))throw x}let s;if(De(n)){if(this.preprocessors.includes(n))throw w;this.preprocessors.push(n)}else if(Oe(n)){if(this.watchers.includes(n))throw w;this.watchers.push(n),s=n.onGlobalInit}else if(Ne(n)){if(this.actions[n.name])throw w;this.actions[n.name]=n}else if(Pe(n)){if(this.plugins.includes(n))throw w;this.plugins.push(n),s=n.onGlobalInit}else throw B;s&&s({store:()=>this.store,upsertSignal:this.upsertSignal.bind(this),mergeSignals:this.mergeSignals.bind(this),removeSignals:this.removeSignals.bind(this),actions:this.actions,reactivity:this.reactivity,applyPlugins:this.applyPlugins.bind(this),cleanup:this.cleanup.bind(this)}),r.add(n)}),this.applyPlugins(document.body)}cleanup(e){let r=this.removals.get(e);if(r){for(let n of r.set)n();this.removals.delete(e)}}mergeSignals(e){this.mergeRemovals.forEach(s=>s()),this.mergeRemovals=this.mergeRemovals.slice(0);let r=W(this.store.value,e);this.store=N(r),JSON.stringify(this.store.value),this.lastMarshalledStore}removeSignals(...e){let r={...this.store.value},n=!1;for(let s of e){let o=s.split("."),a=o[0],f=r;for(let u=1;u<o.length;u++){let m=o[u];f[a]||(f[a]={}),f=f[a],a=m}delete f[a],n=!0}n&&(this.store=N(r),this.applyPlugins(document.body))}upsertSignal(e,r){let n=e.split("."),s=this.store;for(let u=0;u<n.length-1;u++){let m=n[u];s[m]||(s[m]={}),s=s[m]}let o=n[n.length-1],a=s[o];if(a)return a;let f=this.reactivity.signal(r);return s[o]=f,f}applyPlugins(e){let r=new Set;this.plugins.forEach((n,s)=>{this.walkDownDOM(e,o=>{s||this.cleanup(o);for(let a in o.dataset){let f=`${o.dataset[a]}`||"",u=f;if(!a.startsWith(n.name))continue;if(o.id.length||(o.id=ue(o)),r.clear(),n.allowedTagRegexps){let l=o.tagName.toLowerCase();if(![...n.allowedTagRegexps].some(h=>l.match(h)))throw x}let m=a.slice(n.name.length),[y,...be]=m.split(".");if(n.mustHaveEmptyKey&&y.length>0)throw d;if(n.mustNotEmptyKey&&y.length===0)throw d;y.length&&(y=y[0].toLowerCase()+y.slice(1));let Y=be.map(l=>{let[S,...h]=l.split("_");return{label:S,args:h}});if(n.allowedModifiers){for(let l of Y)if(!n.allowedModifiers.has(l.label))throw x}let q=new Map;for(let l of Y)q.set(l.label,l.args);if(n.mustHaveEmptyExpression&&u.length)throw d;if(n.mustNotEmptyExpression&&!u.length)throw d;let z=/;|\n/;n.removeNewLines&&(u=u.split(`
`).map(l=>l.trim()).join(" "));let ve=[...n.preprocessors?.pre||[],...this.preprocessors,...n.preprocessors?.post||[]];for(let l of ve){if(r.has(l))continue;r.add(l);let S=u.split(z),h=[];S.forEach(p=>{let _=p,Z=[..._.matchAll(l.regexp)];if(Z.length)for(let Q of Z){if(!Q.groups)continue;let{groups:ee}=Q,{whole:xe}=ee;_=_.replace(xe,l.replacer(ee))}h.push(_)}),u=h.join("; ")}let U={store:()=>this.store,mergeSignals:this.mergeSignals.bind(this),upsertSignal:this.upsertSignal.bind(this),removeSignals:this.removeSignals.bind(this),applyPlugins:this.applyPlugins.bind(this),cleanup:this.cleanup.bind(this),walkSignals:this.walkSignals.bind(this),actions:this.actions,reactivity:this.reactivity,el:o,rawKey:a,key:y,rawExpression:f,expression:u,expressionFn:()=>{throw le},modifiers:q};if(!n.bypassExpressionFunctionCreation?.(U)&&!n.mustHaveEmptyExpression&&u.length){let l=u.split(z).map(p=>p.trim()).filter(p=>p.length);l[l.length-1]=`return ${l[l.length-1]}`;let S=l.map(p=>`  ${p}`).join(`;
`),h=`try{${S}}catch(e){console.error(\`Error evaluating Datastar expression:
${S.replaceAll("`","\\`")}

Error: \${e.message}

Check if the expression is valid before raising an issue.\`.trim());debugger}`;try{let p=n.argumentNames||[],_=new Function("ctx",...p,h);U.expressionFn=_}catch(p){let _=new Error(`${p}
with
${h}`);console.error(_);debugger}}let X=n.onLoad(U);X&&(this.removals.has(o)||this.removals.set(o,{id:o.id,set:new Set}),this.removals.get(o).set.add(X))}})})}walkSignalsStore(e,r){let n=Object.keys(e);for(let s=0;s<n.length;s++){let o=n[s],a=e[o],f=a instanceof c,u=typeof a=="object"&&Object.keys(a).length>0;if(f){r(o,a);continue}u&&this.walkSignalsStore(a,r)}}walkSignals(e){this.walkSignalsStore(this.store,e)}walkDownDOM(e,r,n=0){if(!e||!(e instanceof HTMLElement||e instanceof SVGElement))return null;for(r(e),n=0,e=e.firstElementChild;e;)this.walkDownDOM(e,r,n++),e=e.nextElementSibling}};var ye=new V;ye.load(ie,ae,re,te,se);var Se=ye;Se.load();})();
//# sourceMappingURL=datastar-core.js.map
