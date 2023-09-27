function Y(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function V() {
  throw new Error("Cycle detected");
}
function De() {
  throw new Error("Computed cannot have side-effects");
}
const Ie = Symbol.for("preact-signals"), _ = 1, A = 2, k = 4, L = 8, M = 16, E = 32;
function j() {
  P++;
}
function q() {
  if (P > 1) {
    P--;
    return;
  }
  let t, e = !1;
  for (; N !== void 0; ) {
    let r = N;
    for (N = void 0, W++; r !== void 0; ) {
      const n = r._nextBatchedEffect;
      if (r._nextBatchedEffect = void 0, r._flags &= ~A, !(r._flags & L) && _e(r))
        try {
          r._callback();
        } catch (o) {
          e || (t = o, e = !0);
        }
      r = n;
    }
  }
  if (W = 0, P--, e)
    throw t;
}
function Fe(t) {
  if (P > 0)
    return t();
  j();
  try {
    return t();
  } finally {
    q();
  }
}
let u, N, P = 0, W = 0, D = 0;
function me(t) {
  if (u === void 0)
    return;
  let e = t._node;
  if (e === void 0 || e._target !== u)
    return e = {
      _version: 0,
      _source: t,
      _prevSource: u._sources,
      _nextSource: void 0,
      _target: u,
      _prevTarget: void 0,
      _nextTarget: void 0,
      _rollbackNode: e
    }, u._sources !== void 0 && (u._sources._nextSource = e), u._sources = e, t._node = e, u._flags & E && t._subscribe(e), e;
  if (e._version === -1)
    return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = u._sources, e._nextSource = void 0, u._sources._nextSource = e, u._sources = e), e;
}
function h(t) {
  this._value = t, this._version = 0, this._node = void 0, this._targets = void 0;
}
h.prototype.brand = Ie;
h.prototype._refresh = function() {
  return !0;
};
h.prototype._subscribe = function(t) {
  this._targets !== t && t._prevTarget === void 0 && (t._nextTarget = this._targets, this._targets !== void 0 && (this._targets._prevTarget = t), this._targets = t);
};
h.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0) {
    const e = t._prevTarget, r = t._nextTarget;
    e !== void 0 && (e._nextTarget = r, t._prevTarget = void 0), r !== void 0 && (r._prevTarget = e, t._nextTarget = void 0), t === this._targets && (this._targets = r);
  }
};
h.prototype.subscribe = function(t) {
  const e = this;
  return ee(function() {
    const r = e.value, n = this._flags & E;
    this._flags &= ~E;
    try {
      t(r);
    } finally {
      this._flags |= n;
    }
  });
};
h.prototype.valueOf = function() {
  return this.value;
};
h.prototype.toString = function() {
  return this.value + "";
};
h.prototype.toJSON = function() {
  return this.value;
};
h.prototype.peek = function() {
  return this._value;
};
Object.defineProperty(h.prototype, "value", {
  get() {
    const t = me(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (u instanceof y && De(), t !== this._value) {
      W > 100 && V(), this._value = t, this._version++, D++, j();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        q();
      }
    }
  }
});
function ve(t) {
  return new h(t);
}
function _e(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    if (e._source._version !== e._version || !e._source._refresh() || e._source._version !== e._version)
      return !0;
  return !1;
}
function ye(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource) {
    const r = e._source._node;
    if (r !== void 0 && (e._rollbackNode = r), e._source._node = e, e._version = -1, e._nextSource === void 0) {
      t._sources = e;
      break;
    }
  }
}
function be(t) {
  let e = t._sources, r;
  for (; e !== void 0; ) {
    const n = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), n !== void 0 && (n._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = n)) : r = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = n;
  }
  t._sources = r;
}
function y(t) {
  h.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = D - 1, this._flags = k;
}
y.prototype = new h();
y.prototype._refresh = function() {
  if (this._flags &= ~A, this._flags & _)
    return !1;
  if ((this._flags & (k | E)) === E || (this._flags &= ~k, this._globalVersion === D))
    return !0;
  if (this._globalVersion = D, this._flags |= _, this._version > 0 && !_e(this))
    return this._flags &= ~_, !0;
  const t = u;
  try {
    ye(this), u = this;
    const e = this._compute();
    (this._flags & M || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~M, this._version++);
  } catch (e) {
    this._value = e, this._flags |= M, this._version++;
  }
  return u = t, be(this), this._flags &= ~_, !0;
};
y.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= k | E;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  h.prototype._subscribe.call(this, t);
};
y.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (h.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~E;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
y.prototype._notify = function() {
  if (!(this._flags & A)) {
    this._flags |= k | A;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
y.prototype.peek = function() {
  if (this._refresh() || V(), this._flags & M)
    throw this._value;
  return this._value;
};
Object.defineProperty(y.prototype, "value", {
  get() {
    this._flags & _ && V();
    const t = me(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & M)
      throw this._value;
    return this._value;
  }
});
function Be(t) {
  return new y(t);
}
function Ee(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    j();
    const r = u;
    u = void 0;
    try {
      e();
    } catch (n) {
      throw t._flags &= ~_, t._flags |= L, Q(t), n;
    } finally {
      u = r, q();
    }
  }
}
function Q(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Ee(t);
}
function Ve(t) {
  if (u !== this)
    throw new Error("Out-of-order effect");
  be(this), u = t, this._flags &= ~_, this._flags & L && Q(this), q();
}
function R(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = E;
}
R.prototype._callback = function() {
  const t = this._start();
  try {
    if (this._flags & L || this._compute === void 0)
      return;
    const e = this._compute();
    typeof e == "function" && (this._cleanup = e);
  } finally {
    t();
  }
};
R.prototype._start = function() {
  this._flags & _ && V(), this._flags |= _, this._flags &= ~L, Ee(this), ye(this), j();
  const t = u;
  return u = this, Ve.bind(this, t);
};
R.prototype._notify = function() {
  this._flags & A || (this._flags |= A, this._nextBatchedEffect = N, N = this);
};
R.prototype._dispose = function() {
  this._flags |= L, this._flags & _ || Q(this);
};
function ee(t) {
  const e = new R(t);
  try {
    e._callback();
  } catch (r) {
    throw e._dispose(), r;
  }
  return e._dispose.bind(e);
}
class we {
  get value() {
    return Z(this);
  }
  set value(e) {
    Fe(() => je(this, e));
  }
  peek() {
    return Z(this, { peek: !0 });
  }
}
const z = (t) => Object.assign(
  new we(),
  Object.entries(t).reduce(
    (e, [r, n]) => {
      if (["value", "peek"].some((o) => o === r))
        throw new Error(`${r} is a reserved property name`);
      return typeof n != "object" || n === null || Array.isArray(n) ? e[r] = ve(n) : e[r] = z(n), e;
    },
    {}
  )
), je = (t, e) => Object.keys(e).forEach((r) => t[r].value = e[r]), Z = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (r, [n, o]) => (o instanceof h ? r[n] = e ? o.peek() : o.value : o instanceof we && (r[n] = Z(o, { peek: e })), r),
  {}
);
function Se(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return JSON.parse(JSON.stringify(e));
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let r = t;
  return typeof t != "object" && (r = { ...e }), Object.keys(e).forEach((n) => {
    r.hasOwnProperty(n) || (r[n] = e[n]), e[n] === null ? delete r[n] : r[n] = Se(r[n], e[n]);
  }), r;
}
const qe = {
  name: "SignalProcessor",
  description: "Replacing $signal with ctx.store.signal.value",
  regexp: new RegExp(/(?<whole>\$(?<signal>[a-zA-Z_$][0-9a-zA-Z_$]*))/g),
  replacer: (t) => {
    const { signal: e } = t;
    return `ctx.store.${e}.value`;
  }
}, Ke = {
  name: "ActionProcessor",
  description: "Replacing @action(args) with ctx.actions.action(ctx, args)",
  regexp: new RegExp(/(?<whole>@(?<action>[a-zA-Z_$][0-9a-zA-Z_$]*)(?<call>\((?<args>.*)\))?)/g),
  replacer: ({ action: t, args: e }) => `ctx.actions.${t}(ctx, ${e || ""})`
}, Ue = {
  name: "RefProcessor",
  description: "Replacing #foo with ctx.refs.foo",
  regexp: new RegExp(/(?<whole>\#(?<ref>[a-zA-Z_$][0-9a-zA-Z_$]*))/g),
  replacer({ ref: t }) {
    return `data.refs.${t}`;
  }
}, Ge = [qe, Ke, Ue], Je = {
  prefix: "store",
  description: "Setup the global store",
  allowedTags: /* @__PURE__ */ new Set(["body"]),
  onLoad: (t) => {
    const e = t.expressionFn(t);
    t.mergeStore(e);
  }
}, We = {
  prefix: "ref",
  description: "Sets the value of the element",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  bypassExpressionFunctionCreation: !0,
  preprocessers: /* @__PURE__ */ new Set([]),
  onLoad: (t) => {
    const { el: e, expression: r } = t;
    return t.refs[r] = e, () => delete t.refs[r];
  }
}, ze = [Je, We];
class Ze {
  plugins = [];
  store = z({});
  actions = {};
  refs = {};
  reactivity = {
    signal: ve,
    computed: Be,
    effect: ee
  };
  missingIDNext = 0;
  removals = /* @__PURE__ */ new Map();
  constructor(e = {}, ...r) {
    if (this.actions = Object.assign(this.actions, e), r = [...ze, ...r], !r.length)
      throw new Error("No plugins provided");
    const n = /* @__PURE__ */ new Set();
    for (const o of r) {
      if (o.requiredPluginPrefixes) {
        for (const s of o.requiredPluginPrefixes)
          if (!n.has(s))
            throw new Error(`Plugin ${o.prefix} requires plugin ${s}`);
      }
      this.plugins.push(o), n.add(o.prefix);
    }
  }
  run() {
    this.plugins.forEach((e) => {
      e.onGlobalInit && e.onGlobalInit({
        actions: this.actions,
        refs: this.refs,
        reactivity: this.reactivity,
        mergeStore: this.mergeStore.bind(this),
        store: this.store
      });
    }), this.applyPlugins(document.body);
  }
  cleanupElementRemovals(e) {
    const r = this.removals.get(e);
    if (r) {
      for (const n of r)
        n();
      this.removals.delete(e);
    }
  }
  mergeStore(e) {
    const r = Se(this.store.value, e);
    this.store = z(r);
  }
  applyPlugins(e) {
    const r = /* @__PURE__ */ new Set();
    Te(e, (n) => {
      this.cleanupElementRemovals(n);
      const o = Y(n);
      if (o) {
        if (o.id) {
          const s = o.style;
          s.viewTransitionName = o.id, console.log(`Setting viewTransitionName on ${o.id}`);
        }
        if (!o.id && o.tagName !== "BODY") {
          const s = (this.missingIDNext++).toString(16).padStart(8, "0");
          o.id = `ds${s}`;
        }
        this.plugins.forEach((s) => {
          for (const i in o.dataset) {
            let l = o.dataset[i] || "";
            if (!i.startsWith(s.prefix))
              continue;
            if (r.clear(), console.info(`Found ${i} on ${o.id ? `#${o.id}` : o.tagName}, applying Datastar plugin '${s.prefix}'`), s.allowedTags && !s.allowedTags.has(o.tagName.toLowerCase()))
              throw new Error(
                `Tag '${o.tagName}' is not allowed for plugin '${i}', allowed tags are: ${[
                  [...s.allowedTags].map((d) => `'${d}'`)
                ].join(", ")}`
              );
            let m = i.slice(s.prefix.length), [g, ...a] = m.split(".");
            if (s.mustHaveEmptyKey && g.length > 0)
              throw new Error(`Attribute '${i}' must have empty key`);
            if (s.mustNotEmptyKey && g.length === 0)
              throw new Error(`Attribute '${i}' must have non-empty key`);
            g.length && (g = g[0].toLowerCase() + g.slice(1));
            const c = a.map((d) => {
              const [S, ...x] = d.split("_");
              return { label: S, args: x };
            });
            if (s.allowedModifiers) {
              for (const d of c)
                if (!s.allowedModifiers.has(d.label))
                  throw new Error(`Modifier '${d.label}' is not allowed`);
            }
            const p = /* @__PURE__ */ new Map();
            for (const d of c)
              p.set(d.label, d.args);
            if (s.mustHaveEmptyExpression && l.length)
              throw new Error(`Attribute '${i}' must have empty expression`);
            if (s.mustNotEmptyExpression && !l.length)
              throw new Error(`Attribute '${i}' must have non-empty expression`);
            const f = [...Ge, ...s.preprocessers || []];
            for (const d of f) {
              if (r.has(d))
                continue;
              r.add(d);
              const S = [...l.matchAll(d.regexp)];
              if (S.length)
                for (const x of S) {
                  if (!x.groups)
                    continue;
                  const { groups: ne } = x, { whole: $e } = ne;
                  l = l.replace($e, d.replacer(ne));
                }
            }
            const { store: w, reactivity: v, actions: K, refs: Oe } = this, te = {
              store: w,
              mergeStore: this.mergeStore.bind(this),
              applyPlugins: this.applyPlugins.bind(this),
              actions: K,
              refs: Oe,
              reactivity: v,
              el: o,
              key: g,
              expression: l,
              expressionFn: () => {
                throw new Error("Expression function not created");
              },
              modifiers: p
            };
            if (!s.bypassExpressionFunctionCreation && !s.mustHaveEmptyExpression && l.length) {
              const d = `return ${l}`;
              try {
                const S = new Function("ctx", d);
                te.expressionFn = S;
              } catch {
                console.error(`Error evaluating expression '${d}' on ${o.id ? `#${o.id}` : o.tagName}`);
                return;
              }
            }
            const re = s.onLoad(te);
            re && (this.removals.has(o) || this.removals.set(o, /* @__PURE__ */ new Set()), this.removals.get(o).add(re));
          }
        });
      }
    });
  }
}
function Te(t, e) {
  if (t)
    for (e(t), t = t.firstElementChild; t; )
      Te(t, e), t = t.nextElementSibling;
}
const Xe = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, r) => (r ? "-" : "") + e.toLowerCase()), Ye = {
  prefix: "bind",
  description: "Sets the value of the element",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(() => {
    const e = Xe(t.key), r = t.expressionFn(t);
    t.el.setAttribute(e, `${r}`);
  })
}, oe = ["change", "input", "keydown"], Qe = {
  prefix: "model",
  description: "Sets the value of the element",
  mustHaveEmptyKey: !0,
  allowedTags: /* @__PURE__ */ new Set(["input", "textarea", "select"]),
  bypassExpressionFunctionCreation: !0,
  onLoad: (t) => {
    const { store: e, el: r, expression: n } = t, o = e[n];
    return t.reactivity.effect(() => {
      if (!("value" in r))
        throw new Error("Element does not have value property");
      r.value = `${o.value}`;
      const s = () => {
        const i = o.value;
        if (typeof i == "number")
          o.value = Number(r.value);
        else if (typeof i == "string")
          o.value = r.value;
        else if (typeof i == "boolean")
          o.value = !!r.value;
        else
          throw new Error("Unsupported type");
      };
      return s(), oe.forEach((i) => {
        r.addEventListener(i, s);
      }), () => {
        oe.forEach((i) => {
          r.removeEventListener(i, s);
        });
      };
    });
  }
}, et = {
  prefix: "text",
  description: "Sets the textContent of the element",
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { el: e, expressionFn: r } = t;
    if (!(e instanceof HTMLElement))
      throw new Error("Element is not HTMLElement");
    return t.reactivity.effect(() => {
      e.textContent = `${r(t)}`;
    });
  }
}, se = "DOMContentLoaded", tt = {
  prefix: "on",
  description: "Sets the event listener of the element",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => {
    const { el: e, key: r, expressionFn: n } = t, o = () => {
      n(t);
    };
    if (r === "load")
      return document.addEventListener(se, o, !0), () => {
        document.removeEventListener(se, o);
      };
    const s = r.toLowerCase();
    return e.addEventListener(s, o), () => {
      e.removeEventListener(s, o);
    };
  }
}, rt = {
  prefix: "focus",
  description: "Sets the focus of the element",
  mustHaveEmptyKey: !0,
  mustHaveEmptyExpression: !0,
  onLoad: (t) => (t.el.tabIndex || t.el.setAttribute("tabindex", "0"), t.el.focus(), t.el.scrollIntoView({ block: "center", inline: "center" }), () => t.el.blur())
}, nt = [
  Ye,
  Qe,
  et,
  rt,
  tt
], O = /* @__PURE__ */ new WeakSet();
function ot(t, e, r = {}) {
  t instanceof Document && (t = t.documentElement);
  let n;
  typeof e == "string" ? n = ct(e) : n = e;
  const o = ut(n), s = it(t, o, r);
  return Ae(t, o, s);
}
function Ae(t, e, r) {
  if (r.head.block) {
    const n = t.querySelector("head"), o = e.querySelector("head");
    if (n && o) {
      const s = Me(o, n, r);
      Promise.all(s).then(() => {
        Ae(
          t,
          e,
          Object.assign(r, {
            head: {
              block: !1,
              ignore: !0
            }
          })
        );
      });
      return;
    }
  }
  if (r.morphStyle === "innerHTML")
    return Le(e, t, r), t.children;
  if (r.morphStyle === "outerHTML" || r.morphStyle == null) {
    const n = dt(e, t, r);
    if (!n)
      throw new Error("Could not find best match");
    const o = n?.previousSibling, s = n?.nextSibling, i = $(t, n, r);
    return n ? ft(o, i, s) : [];
  } else
    throw "Do not understand how to morph style " + r.morphStyle;
}
function $(t, e, r) {
  if (!(r.ignoreActive && t === document.activeElement))
    if (e == null) {
      if (r.callbacks.beforeNodeRemoved(t) === !1)
        return;
      t.remove(), r.callbacks.afterNodeRemoved(t);
      return;
    } else {
      if (I(t, e))
        return r.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && r.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && r.head.style !== "morph" ? Me(e, t, r) : (st(e, t), Le(e, t, r))), r.callbacks.afterNodeMorphed(t, e), t);
      if (r.callbacks.beforeNodeRemoved(t) === !1 || r.callbacks.beforeNodeAdded(e) === !1)
        return;
      if (!t.parentElement)
        throw new Error("oldNode has no parentElement");
      return t.parentElement.replaceChild(e, t), r.callbacks.afterNodeAdded(e), r.callbacks.afterNodeRemoved(t), e;
    }
}
function Le(t, e, r) {
  let n = t.firstChild, o = e.firstChild, s;
  for (; n; ) {
    if (s = n, n = s.nextSibling, o == null) {
      if (r.callbacks.beforeNodeAdded(s) === !1)
        return;
      e.appendChild(s), r.callbacks.afterNodeAdded(s), T(r, s);
      continue;
    }
    if (Ne(s, o, r)) {
      $(o, s, r), o = o.nextSibling, T(r, s);
      continue;
    }
    let i = at(t, e, s, o, r);
    if (i) {
      o = ie(o, i, r), $(i, s, r), T(r, s);
      continue;
    }
    let l = lt(t, s, o, r);
    if (l) {
      o = ie(o, l, r), $(l, s, r), T(r, s);
      continue;
    }
    if (r.callbacks.beforeNodeAdded(s) === !1)
      return;
    e.insertBefore(s, o), r.callbacks.afterNodeAdded(s), T(r, s);
  }
  for (; o !== null; ) {
    let i = o;
    o = o.nextSibling, Pe(i, r);
  }
}
function st(t, e) {
  let r = t.nodeType;
  if (r === 1) {
    for (const n of t.attributes)
      e.getAttribute(n.name) !== n.value && e.setAttribute(n.name, n.value);
    for (const n of e.attributes)
      t.hasAttribute(n.name) || e.removeAttribute(n.name);
  }
  if ((r === Node.COMMENT_NODE || r === Node.TEXT_NODE) && e.nodeValue !== t.nodeValue && (e.nodeValue = t.nodeValue), t instanceof HTMLInputElement && e instanceof HTMLInputElement && t.type !== "file")
    e.value = t.value || "", C(t, e, "value"), C(t, e, "checked"), C(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    C(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const n = t.value, o = e.value;
    n !== o && (e.value = n), e.firstChild && e.firstChild.nodeValue !== n && (e.firstChild.nodeValue = n);
  }
}
function C(t, e, r) {
  const n = t.getAttribute(r), o = e.getAttribute(r);
  n !== o && (n ? e.setAttribute(r, n) : e.removeAttribute(r));
}
function Me(t, e, r) {
  const n = [], o = [], s = [], i = [], l = r.head.style, m = /* @__PURE__ */ new Map();
  for (const a of t.children)
    m.set(a.outerHTML, a);
  for (const a of e.children) {
    let c = m.has(a.outerHTML), p = r.head.shouldReAppend(a), f = r.head.shouldPreserve(a);
    c || f ? p ? o.push(a) : (m.delete(a.outerHTML), s.push(a)) : l === "append" ? p && (o.push(a), i.push(a)) : r.head.shouldRemove(a) !== !1 && o.push(a);
  }
  i.push(...m.values()), console.log("to append: ", i);
  const g = [];
  for (const a of i) {
    console.log("adding: ", a);
    const c = document.createRange().createContextualFragment(a.outerHTML).firstChild;
    if (!c)
      throw new Error("could not create new element from: " + a.outerHTML);
    if (console.log(c), r.callbacks.beforeNodeAdded(c)) {
      if (c.hasAttribute("href") || c.hasAttribute("src")) {
        let p;
        const f = new Promise((w) => {
          p = w;
        });
        c.addEventListener("load", function() {
          p(void 0);
        }), g.push(f);
      }
      e.appendChild(c), r.callbacks.afterNodeAdded(c), n.push(c);
    }
  }
  for (const a of o)
    r.callbacks.beforeNodeRemoved(a) !== !1 && (e.removeChild(a), r.callbacks.afterNodeRemoved(a));
  return r.head.afterHeadMorphed(e, {
    added: n,
    kept: s,
    removed: o
  }), g;
}
function b() {
}
function it(t, e, r) {
  return {
    target: t,
    newContent: e,
    config: r,
    morphStyle: r.morphStyle,
    ignoreActive: r.ignoreActive,
    idMap: mt(t, e),
    deadIds: /* @__PURE__ */ new Set(),
    callbacks: Object.assign(
      {
        beforeNodeAdded: b,
        afterNodeAdded: b,
        beforeNodeMorphed: b,
        afterNodeMorphed: b,
        beforeNodeRemoved: b,
        afterNodeRemoved: b
      },
      r.callbacks
    ),
    head: Object.assign(
      {
        style: "merge",
        shouldPreserve: (n) => n.getAttribute("im-preserve") === "true",
        shouldReAppend: (n) => n.getAttribute("im-re-append") === "true",
        shouldRemove: b,
        afterHeadMorphed: b
      },
      r.head
    )
  };
}
function Ne(t, e, r) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : H(r, t, e) > 0 : !1;
}
function I(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function ie(t, e, r) {
  for (; t !== e; ) {
    const n = t;
    if (t = t?.nextSibling, !n)
      throw new Error("tempNode is null");
    Pe(n, r);
  }
  return T(r, e), e.nextSibling;
}
function at(t, e, r, n, o) {
  const s = H(o, r, e);
  let i = null;
  if (s > 0) {
    i = n;
    let l = 0;
    for (; i != null; ) {
      if (Ne(r, i, o))
        return i;
      if (l += H(o, i, t), l > s)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function lt(t, e, r, n) {
  let o = r, s = e.nextSibling, i = 0;
  for (; o && s; ) {
    if (H(n, o, t) > 0)
      return null;
    if (I(e, o))
      return o;
    if (I(s, o) && (i++, s = s.nextSibling, i >= 2))
      return null;
    o = o.nextSibling;
  }
  return o;
}
const ae = new DOMParser();
function ct(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const r = ae.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return O.add(r), r;
    {
      let n = r.firstChild;
      return n ? (O.add(n), n) : null;
    }
  } else {
    const n = ae.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!n)
      throw new Error("content is null");
    return O.add(n), n;
  }
}
function ut(t) {
  if (t == null)
    return document.createElement("div");
  if (O.has(t))
    return t;
  if (t instanceof Node) {
    const e = document.createElement("div");
    return e.append(t), e;
  } else {
    const e = document.createElement("div");
    for (const r of [...t])
      e.append(r);
    return e;
  }
}
function ft(t, e, r) {
  const n = [], o = [];
  for (; t; )
    n.push(t), t = t.previousSibling;
  for (; n.length > 0; ) {
    const s = n.pop();
    o.push(s), e?.parentElement?.insertBefore(s, e);
  }
  for (o.push(e); r; )
    n.push(r), o.push(r), r = r.nextSibling;
  for (; n.length; )
    e?.parentElement?.insertBefore(n.pop(), e.nextSibling);
  return o;
}
function dt(t, e, r) {
  let n = t.firstChild, o = n, s = 0;
  for (; n; ) {
    let i = pt(n, e, r);
    i > s && (o = n, s = i), n = n.nextSibling;
  }
  return o;
}
function pt(t, e, r) {
  return I(t, e) ? 0.5 + H(r, t, e) : 0;
}
function Pe(t, e) {
  T(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function ht(t, e) {
  return !t.deadIds.has(e);
}
function gt(t, e, r) {
  return t.idMap.get(r)?.has(e) || !1;
}
function T(t, e) {
  const r = t.idMap.get(e);
  if (r)
    for (const n of r)
      t.deadIds.add(n);
}
function H(t, e, r) {
  const n = t.idMap.get(e);
  if (!n)
    return 0;
  let o = 0;
  for (const s of n)
    ht(t, s) && gt(t, s, r) && ++o;
  return o;
}
function le(t, e) {
  const r = t.parentElement, n = t.querySelectorAll("[id]");
  for (const o of n) {
    let s = o;
    for (; s !== r && s; ) {
      let i = e.get(s);
      i == null && (i = /* @__PURE__ */ new Set(), e.set(s, i)), i.add(o.id), s = s.parentElement;
    }
  }
}
function mt(t, e) {
  const r = /* @__PURE__ */ new Map();
  return le(t, r), le(e, r), r;
}
const ke = "get", vt = "post", _t = "put", yt = "patch", bt = "delete", Et = [ke, vt, _t, yt, bt], wt = Et.reduce((t, e) => (t[e] = async (r) => Pt(e, r), t), {}), He = "Accept", X = "Content-Type", Re = "application/json", xe = "datastar", U = `${xe}-indicator`, F = `${xe}-request`, B = "text/html", St = "selector", Tt = "swap", At = {
  prefix: "header",
  description: "Sets the header of the fetch request",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => {
    const e = t.store.fetch.headers, r = t.key[0].toUpperCase() + t.key.slice(1);
    return e[r] = t.reactivity.computed(() => t.expressionFn(t)), () => {
      delete e[r];
    };
  }
}, Lt = {
  prefix: "fetchUrl",
  description: "Sets the fetch url",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onGlobalInit: ({ mergeStore: t }) => {
    const e = document.createElement("style");
    e.innerHTML = `
.${U}{
 opacity:0;
 transition: opacity 500ms ease-in;
}
.${F} .${U}{
 opacity:1
}
.${F}.${U}{
 opacity:1
}
`, document.head.appendChild(e);
    const r = new Headers();
    r.append(He, B), r.append(X, Re), t({
      fetch: {
        headers: {},
        elementURLs: {}
      }
    });
  },
  onLoad: (t) => t.reactivity.effect(() => {
    const e = t.reactivity.computed(() => `${t.expressionFn(t)}`);
    return t.store.fetch.elementURLs[t.el.id] = e, () => {
      delete t.store.fetch.elementURLs[t.el.id];
    };
  })
}, Mt = {
  prefix: "sse",
  description: "Sets the value of the element",
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const e = t.expressionFn(t);
    if (typeof e != "string")
      throw new Error("SSE url must be a string");
    const r = new EventSource(e), n = (s) => {
      Ce(t, s.data, "append");
    };
    r.addEventListener("message", n);
    const o = (s) => console.error(s);
    return r.addEventListener("error", o), () => {
      r.removeEventListener("message", n), r.removeEventListener("error", o), r.close();
    };
  }
}, Nt = [At, Lt, Mt];
async function Pt(t, e) {
  const { el: r, store: n } = e, o = n.fetch.elementURLs[r.id];
  if (!o)
    throw new Error(`No signal for ${t}`);
  r.classList.add(F);
  const s = new URL(o.value, window.location.origin), i = new Headers();
  i.append(He, B), i.append(X, Re);
  const l = n.fetch.headers.value;
  if (l)
    for (const v in l) {
      const K = l[v];
      i.append(v, K);
    }
  const m = { ...n };
  delete m.fetch;
  const g = JSON.stringify(m), a = { method: t, headers: i };
  if (t === ke) {
    const v = new URLSearchParams(s.search);
    v.append("datastar", g), s.search = v.toString();
  } else
    a.body = g;
  const c = await fetch(s, a);
  if (!c.ok)
    throw new Error("Network response was not ok.");
  const p = await c.text();
  if (c.status >= 300 && c.status < 40) {
    let v = p;
    v.startsWith("/") && (v = window.location.origin + v), Response.redirect(v);
  }
  if (!(c.headers.get(X) === B))
    throw new Error("Response is not HTML, can't merge");
  Ce(e, p), r.classList.remove(F);
}
const kt = new DOMParser();
function Ce(t, e, r = "morph") {
  const { el: n } = t, o = [...kt.parseFromString(e, B).body.children];
  for (let s = 0; s < o.length; s++) {
    const i = o[s];
    if (!(i instanceof Element))
      throw new Error("Not an element");
    const l = Y(i), m = i.getAttribute("id"), g = s === 0, a = !!m?.length, c = g && !a;
    let p;
    if (c)
      p = [n];
    else {
      if (!a)
        throw new Error("No id");
      const f = l?.dataset?.[St] || `#${m}`;
      p = document.querySelectorAll(f) || [];
    }
    if (!p)
      throw new Error("No target element");
    for (const f of p) {
      const w = l?.dataset?.[Tt];
      switch (w && (r = w), r) {
        case "morph":
          ot(f, i), t.applyPlugins(f);
          continue;
        case "inner":
          f.innerHTML = i.innerHTML;
          break;
        case "outer":
          f.outerHTML = i.outerHTML;
          break;
        case "prepend":
          f.prepend(i);
          break;
        case "append":
          f.append(i);
          break;
        case "before":
          f.before(i);
          break;
        case "after":
          f.after(i);
          break;
        case "delete":
          f.remove();
          break;
        default:
          throw new Error("Invalid merge mode");
      }
      t.applyPlugins(i);
    }
  }
}
const G = "display", ce = "none", J = "important", Ht = {
  prefix: "show",
  description: "Sets the display of the element",
  allowedModifiers: /* @__PURE__ */ new Set([J]),
  onLoad: (t) => {
    const { el: e, modifiers: r, expressionFn: n } = t;
    return ee(() => {
      const s = !!n(t), l = r.has(J) ? J : void 0;
      s ? e.style.length === 1 && e.style.display === ce ? e.style.removeProperty(G) : e.style.setProperty(G, "", l) : e.style.setProperty(G, ce, l);
    });
  }
}, Rt = "intersects", ue = "once", fe = "half", de = "full", xt = {
  prefix: Rt,
  description: "Run expression when element intersects with viewport",
  allowedModifiers: /* @__PURE__ */ new Set([ue, fe, de]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, r = { threshold: 0 };
    e.has(de) ? r.threshold = 1 : e.has(fe) && (r.threshold = 0.5);
    const n = new IntersectionObserver((o) => {
      o.forEach((s) => {
        s.isIntersecting && (t.expressionFn(t), e.has(ue) && n.disconnect());
      });
    }, r);
    return n.observe(t.el), () => n.disconnect();
  }
}, pe = "prepend", he = "append", ge = new Error("Target element must have a parent if using prepend or append"), Ct = {
  prefix: "teleport",
  description: "Teleports the element to another element",
  allowedModifiers: /* @__PURE__ */ new Set([pe, he]),
  allowedTags: /* @__PURE__ */ new Set(["template"]),
  bypassExpressionFunctionCreation: !0,
  onLoad: (t) => {
    const { el: e, modifiers: r, expression: n } = t;
    if (!(e instanceof HTMLTemplateElement))
      throw new Error();
    const o = document.querySelector(n);
    if (!o)
      throw new Error(`Target element not found: ${n}`);
    if (!e.content)
      throw new Error("Template element must have content");
    const s = e.content.cloneNode(!0);
    if (Y(s)?.firstElementChild)
      throw new Error("Empty template");
    if (r.has(pe)) {
      if (!o.parentNode)
        throw ge;
      o.parentNode.insertBefore(s, o);
    } else if (r.has(he)) {
      if (!o.parentNode)
        throw ge;
      o.parentNode.insertBefore(s, o.nextSibling);
    } else
      o.appendChild(s);
  }
}, Ot = {
  prefix: "scrollIntoView",
  description: "Scrolls the element into view",
  onLoad: (t) => {
    const { el: e } = t;
    e.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  }
}, $t = [
  Ht,
  xt,
  Ct,
  Ot
], Dt = performance.now(), It = Object.assign({}, wt), Ft = [...Nt, ...$t, ...nt], Vt = new Ze(It, ...Ft), Bt = performance.now();
console.log(`Datastar loaded in ${Bt - Dt}ms`);
export {
  Ze as Datastar,
  Vt as datastar,
  Y as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
