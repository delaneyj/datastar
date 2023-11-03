function ee(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function V() {
  throw new Error("Cycle detected");
}
function Be() {
  throw new Error("Computed cannot have side-effects");
}
const Ve = Symbol.for("preact-signals"), _ = 1, L = 2, H = 4, M = 8, P = 16, w = 32;
function U() {
  k++;
}
function q() {
  if (k > 1) {
    k--;
    return;
  }
  let t, e = !1;
  for (; N !== void 0; ) {
    let r = N;
    for (N = void 0, Z++; r !== void 0; ) {
      const n = r._nextBatchedEffect;
      if (r._nextBatchedEffect = void 0, r._flags &= ~L, !(r._flags & M) && Se(r))
        try {
          r._callback();
        } catch (s) {
          e || (t = s, e = !0);
        }
      r = n;
    }
  }
  if (Z = 0, k--, e)
    throw t;
}
function Ue(t) {
  if (k > 0)
    return t();
  U();
  try {
    return t();
  } finally {
    q();
  }
}
let d, N, k = 0, Z = 0, D = 0;
function Ee(t) {
  if (d === void 0)
    return;
  let e = t._node;
  if (e === void 0 || e._target !== d)
    return e = {
      _version: 0,
      _source: t,
      _prevSource: d._sources,
      _nextSource: void 0,
      _target: d,
      _prevTarget: void 0,
      _nextTarget: void 0,
      _rollbackNode: e
    }, d._sources !== void 0 && (d._sources._nextSource = e), d._sources = e, t._node = e, d._flags & w && t._subscribe(e), e;
  if (e._version === -1)
    return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = d._sources, e._nextSource = void 0, d._sources._nextSource = e, d._sources = e), e;
}
function m(t) {
  this._value = t, this._version = 0, this._node = void 0, this._targets = void 0;
}
m.prototype.brand = Ve;
m.prototype._refresh = function() {
  return !0;
};
m.prototype._subscribe = function(t) {
  this._targets !== t && t._prevTarget === void 0 && (t._nextTarget = this._targets, this._targets !== void 0 && (this._targets._prevTarget = t), this._targets = t);
};
m.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0) {
    const e = t._prevTarget, r = t._nextTarget;
    e !== void 0 && (e._nextTarget = r, t._prevTarget = void 0), r !== void 0 && (r._prevTarget = e, t._nextTarget = void 0), t === this._targets && (this._targets = r);
  }
};
m.prototype.subscribe = function(t) {
  const e = this;
  return re(function() {
    const r = e.value, n = this._flags & w;
    this._flags &= ~w;
    try {
      t(r);
    } finally {
      this._flags |= n;
    }
  });
};
m.prototype.valueOf = function() {
  return this.value;
};
m.prototype.toString = function() {
  return this.value + "";
};
m.prototype.toJSON = function() {
  return this.value;
};
m.prototype.peek = function() {
  return this._value;
};
Object.defineProperty(m.prototype, "value", {
  get() {
    const t = Ee(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (d instanceof b && Be(), t !== this._value) {
      Z > 100 && V(), this._value = t, this._version++, D++, U();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        q();
      }
    }
  }
});
function we(t) {
  return new m(t);
}
function Se(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    if (e._source._version !== e._version || !e._source._refresh() || e._source._version !== e._version)
      return !0;
  return !1;
}
function Te(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource) {
    const r = e._source._node;
    if (r !== void 0 && (e._rollbackNode = r), e._source._node = e, e._version = -1, e._nextSource === void 0) {
      t._sources = e;
      break;
    }
  }
}
function Ae(t) {
  let e = t._sources, r;
  for (; e !== void 0; ) {
    const n = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), n !== void 0 && (n._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = n)) : r = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = n;
  }
  t._sources = r;
}
function b(t) {
  m.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = D - 1, this._flags = H;
}
b.prototype = new m();
b.prototype._refresh = function() {
  if (this._flags &= ~L, this._flags & _)
    return !1;
  if ((this._flags & (H | w)) === w || (this._flags &= ~H, this._globalVersion === D))
    return !0;
  if (this._globalVersion = D, this._flags |= _, this._version > 0 && !Se(this))
    return this._flags &= ~_, !0;
  const t = d;
  try {
    Te(this), d = this;
    const e = this._compute();
    (this._flags & P || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~P, this._version++);
  } catch (e) {
    this._value = e, this._flags |= P, this._version++;
  }
  return d = t, Ae(this), this._flags &= ~_, !0;
};
b.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= H | w;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  m.prototype._subscribe.call(this, t);
};
b.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (m.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~w;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
b.prototype._notify = function() {
  if (!(this._flags & L)) {
    this._flags |= H | L;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
b.prototype.peek = function() {
  if (this._refresh() || V(), this._flags & P)
    throw this._value;
  return this._value;
};
Object.defineProperty(b.prototype, "value", {
  get() {
    this._flags & _ && V();
    const t = Ee(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & P)
      throw this._value;
    return this._value;
  }
});
function qe(t) {
  return new b(t);
}
function Le(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    U();
    const r = d;
    d = void 0;
    try {
      e();
    } catch (n) {
      throw t._flags &= ~_, t._flags |= M, te(t), n;
    } finally {
      d = r, q();
    }
  }
}
function te(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Le(t);
}
function Ke(t) {
  if (d !== this)
    throw new Error("Out-of-order effect");
  Ae(this), d = t, this._flags &= ~_, this._flags & M && te(this), q();
}
function C(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = w;
}
C.prototype._callback = function() {
  const t = this._start();
  try {
    if (this._flags & M || this._compute === void 0)
      return;
    const e = this._compute();
    typeof e == "function" && (this._cleanup = e);
  } finally {
    t();
  }
};
C.prototype._start = function() {
  this._flags & _ && V(), this._flags |= _, this._flags &= ~M, Le(this), Te(this), U();
  const t = d;
  return d = this, Ke.bind(this, t);
};
C.prototype._notify = function() {
  this._flags & L || (this._flags |= L, this._nextBatchedEffect = N, N = this);
};
C.prototype._dispose = function() {
  this._flags |= M, this._flags & _ || te(this);
};
function re(t) {
  const e = new C(t);
  try {
    e._callback();
  } catch (r) {
    throw e._dispose(), r;
  }
  return e._dispose.bind(e);
}
class Me {
  get value() {
    return Y(this);
  }
  set value(e) {
    Ue(() => We(this, e));
  }
  peek() {
    return Y(this, { peek: !0 });
  }
}
const X = (t) => Object.assign(
  new Me(),
  Object.entries(t).reduce(
    (e, [r, n]) => {
      if (["value", "peek"].some((s) => s === r))
        throw new Error(`${r} is a reserved property name`);
      return typeof n != "object" || n === null || Array.isArray(n) ? e[r] = we(n) : e[r] = X(n), e;
    },
    {}
  )
), We = (t, e) => Object.keys(e).forEach((r) => t[r].value = e[r]), Y = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (r, [n, s]) => (s instanceof m ? r[n] = e ? s.peek() : s.value : s instanceof Me && (r[n] = Y(s, { peek: e })), r),
  {}
);
function Pe(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return JSON.parse(JSON.stringify(e));
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let r = t;
  return typeof t != "object" && (r = { ...e }), Object.keys(e).forEach((n) => {
    r.hasOwnProperty(n) || (r[n] = e[n]), e[n] === null ? delete r[n] : r[n] = Pe(r[n], e[n]);
  }), r;
}
const Ge = "[a-zA-Z_$][0-9a-zA-Z_$]*", ne = (t, e, r) => new RegExp(`(?<whole>\\${t}(?<${e}>${Ge})${r})`, "g"), Je = {
  name: "SignalProcessor",
  description: "Replacing $signal with ctx.store.signal.value",
  regexp: ne("$", "signal", ""),
  replacer: (t) => {
    const { signal: e } = t;
    return `ctx.store.${e}.value`;
  }
}, ze = {
  name: "ActionProcessor",
  description: "Replacing $$action(args) with ctx.actions.action(ctx, args)",
  regexp: ne("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => {
    const r = ["ctx"];
    e && r.push(...e.split(",").map((s) => s.trim()));
    const n = r.join(",");
    return `ctx.actions.${t}(${n})`;
  }
}, Ze = {
  name: "RefProcessor",
  description: "Replacing #foo with ctx.refs.foo",
  regexp: ne("~", "ref", ""),
  replacer({ ref: t }) {
    return `data.refs.${t}`;
  }
}, Xe = [ze, Je, Ze], Ye = {
  prefix: "mergeStore",
  description: "Setup the global store",
  onLoad: (t) => {
    const e = t.expressionFn(t);
    t.mergeStore(e);
  }
}, Qe = {
  prefix: "ref",
  description: "Sets the value of the element",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  bypassExpressionFunctionCreation: !0,
  preprocessors: /* @__PURE__ */ new Set([]),
  onLoad: (t) => {
    const { el: e, expression: r } = t;
    return t.refs[r] = e, () => delete t.refs[r];
  }
}, et = [Ye, Qe];
class tt {
  plugins = [];
  store = X({});
  actions = {};
  refs = {};
  reactivity = {
    signal: we,
    computed: qe,
    effect: re
  };
  missingIDNext = 0;
  removals = /* @__PURE__ */ new Map();
  constructor(e = {}, ...r) {
    if (this.actions = Object.assign(this.actions, e), r = [...et, ...r], !r.length)
      throw new Error("No plugins provided");
    const n = /* @__PURE__ */ new Set();
    for (const s of r) {
      if (s.requiredPluginPrefixes) {
        for (const o of s.requiredPluginPrefixes)
          if (!n.has(o))
            throw new Error(`Plugin ${s.prefix} requires plugin ${o}`);
      }
      this.plugins.push(s), n.add(s.prefix);
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
    const r = Pe(this.store.value, e);
    this.store = X(r);
  }
  signalByName(e) {
    return this.store[e];
  }
  applyPlugins(e) {
    const r = /* @__PURE__ */ new Set();
    this.plugins.forEach((n, s) => {
      Ne(e, (o) => {
        s === 0 && this.cleanupElementRemovals(o);
        const i = ee(o);
        if (i) {
          if (i.id) {
            const a = i.style;
            a.viewTransitionName = i.id;
          }
          if (!i.id && i.tagName !== "BODY") {
            const a = (this.missingIDNext++).toString(16).padStart(8, "0");
            i.id = `ds${a}`;
          }
          for (const a in i.dataset) {
            let f = i.dataset[a] || "";
            if (!a.startsWith(n.prefix))
              continue;
            if (r.clear(), n.allowedTags && !n.allowedTags.has(i.tagName.toLowerCase()))
              throw new Error(
                `Tag '${i.tagName}' is not allowed for plugin '${a}', allowed tags are: ${[
                  [...n.allowedTags].map((p) => `'${p}'`)
                ].join(", ")}`
              );
            let g = a.slice(n.prefix.length), [l, ...c] = g.split(".");
            if (n.mustHaveEmptyKey && l.length > 0)
              throw new Error(`Attribute '${a}' must have empty key`);
            if (n.mustNotEmptyKey && l.length === 0)
              throw new Error(`Attribute '${a}' must have non-empty key`);
            l.length && (l = l[0].toLowerCase() + l.slice(1));
            const h = c.map((p) => {
              const [S, ...T] = p.split("_");
              return { label: S, args: T };
            });
            if (n.allowedModifiers) {
              for (const p of h)
                if (!n.allowedModifiers.has(p.label))
                  throw new Error(`Modifier '${p.label}' is not allowed`);
            }
            const u = /* @__PURE__ */ new Map();
            for (const p of h)
              u.set(p.label, p.args);
            if (n.mustHaveEmptyExpression && f.length)
              throw new Error(`Attribute '${a}' must have empty expression`);
            if (n.mustNotEmptyExpression && !f.length)
              throw new Error(`Attribute '${a}' must have non-empty expression`);
            const v = [...Xe, ...n.preprocessors || []];
            for (const p of v) {
              if (r.has(p))
                continue;
              r.add(p);
              const S = [...f.matchAll(p.regexp)];
              if (S.length)
                for (const T of S) {
                  if (!T.groups)
                    continue;
                  const { groups: ie } = T, { whole: je } = ie;
                  f = f.replace(je, p.replacer(ie));
                }
            }
            const { store: y, reactivity: Ie, actions: De, refs: Fe } = this, se = {
              store: y,
              mergeStore: this.mergeStore.bind(this),
              applyPlugins: this.applyPlugins.bind(this),
              actions: De,
              refs: Fe,
              reactivity: Ie,
              el: i,
              key: l,
              expression: f,
              expressionFn: () => {
                throw new Error("Expression function not created");
              },
              modifiers: u
            };
            if (!n.bypassExpressionFunctionCreation && !n.mustHaveEmptyExpression && f.length) {
              const p = f.split(";");
              p[p.length - 1] = `return ${p[p.length - 1]}`;
              const S = p.join(";");
              try {
                const T = new Function("ctx", S);
                se.expressionFn = T;
              } catch {
                console.error(`Error evaluating expression '${S}' on ${i.id ? `#${i.id}` : i.tagName}`);
                return;
              }
            }
            const oe = n.onLoad(se);
            oe && (this.removals.has(i) || this.removals.set(i, /* @__PURE__ */ new Set()), this.removals.get(i).add(oe));
          }
        }
      });
    });
  }
}
function Ne(t, e) {
  if (t)
    for (e(t), t = t.firstElementChild; t; )
      Ne(t, e), t = t.nextElementSibling;
}
const rt = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, r) => (r ? "-" : "") + e.toLowerCase()), nt = {
  prefix: "bind",
  description: "Sets the value of the element",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(() => {
    const e = rt(t.key), r = t.expressionFn(t);
    t.el.setAttribute(e, `${r}`);
  })
}, ae = ["change", "input", "keydown"], st = {
  prefix: "model",
  description: "Sets the value of the element",
  mustHaveEmptyKey: !0,
  allowedTags: /* @__PURE__ */ new Set(["input", "textarea", "select", "checkbox"]),
  bypassExpressionFunctionCreation: !0,
  onLoad: (t) => {
    const { store: e, el: r, expression: n } = t, s = e[n];
    return t.reactivity.effect(() => {
      if (!(r instanceof HTMLInputElement))
        throw new Error("Element does not have value or checked");
      const o = r.type === "checkbox";
      o ? r.checked = s.value : r.value = `${s.value}`;
      const i = () => {
        const a = s.value;
        if (typeof a == "number")
          s.value = Number(r.value);
        else if (typeof a == "string")
          s.value = r.value;
        else if (typeof a == "boolean")
          o ? s.value = r.checked : s.value = !!r.value;
        else
          throw new Error("Unsupported type");
      };
      return i(), ae.forEach((a) => {
        r.addEventListener(a, i);
      }), () => {
        ae.forEach((a) => {
          r.removeEventListener(a, i);
        });
      };
    });
  }
}, ot = {
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
}, le = "DOMContentLoaded", it = {
  prefix: "on",
  description: "Sets the event listener of the element",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  allowedModifiers: /* @__PURE__ */ new Set(["once", "passive", "capture", "debounce", "throttle"]),
  onLoad: (t) => {
    const { el: e, key: r, expressionFn: n } = t;
    let s = () => {
      n(t);
    };
    const o = t.modifiers.get("debounce");
    if (o) {
      const g = ce(o), l = $(o, "leading", !1), c = $(o, "noTrail", !0);
      s = ct(s, g, l, c);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const g = ce(i), l = $(i, "noLead", !0), c = $(i, "noTrail", !0);
      s = ut(s, g, l, c);
    }
    const a = {
      capture: !0,
      passive: !1,
      once: !1
    };
    if (t.modifiers.has("capture") || (a.capture = !1), t.modifiers.has("passive") && (a.passive = !0), t.modifiers.has("once") && (a.once = !0), r === "load")
      return document.addEventListener(le, s, a), () => {
        document.removeEventListener(le, s);
      };
    const f = r.toLowerCase();
    return e.addEventListener(f, s, a), () => {
      e.removeEventListener(f, s);
    };
  }
}, at = {
  prefix: "focus",
  description: "Sets the focus of the element",
  mustHaveEmptyKey: !0,
  mustHaveEmptyExpression: !0,
  onLoad: (t) => (t.el.tabIndex || t.el.setAttribute("tabindex", "0"), t.el.focus(), t.el.scrollIntoView({ block: "center", inline: "center" }), () => t.el.blur())
}, lt = [
  nt,
  st,
  ot,
  at,
  it
];
function ce(t) {
  if (!t || t?.length === 0)
    return 0;
  for (const e of t) {
    if (e.endsWith("ms"))
      return Number(e.replace("ms", ""));
    if (e.endsWith("s"))
      return Number(e.replace("s", "")) * 1e3;
    try {
      return parseFloat(e);
    } catch {
    }
  }
  return 0;
}
function $(t, e, r = !1) {
  return t ? t.includes(e) || r : !1;
}
function ct(t, e, r = !1, n = !0) {
  let s;
  const o = () => s && clearTimeout(s);
  return function(...a) {
    o(), r && !s && t(...a), s = setTimeout(() => {
      n && t(...a), o();
    }, e);
  };
}
function ut(t, e, r = !0, n = !1) {
  let s = !1, o = null;
  return function(...a) {
    s ? o = a : (s = !0, r ? t(...a) : o = a, setTimeout(() => {
      n && o && (t(...o), o = null), s = !1;
    }, e));
  };
}
const x = /* @__PURE__ */ new WeakSet();
function ft(t, e, r = {}) {
  t instanceof Document && (t = t.documentElement);
  let n;
  typeof e == "string" ? n = gt(e) : n = e;
  const s = vt(n), o = pt(t, s, r);
  return ke(t, s, o);
}
function ke(t, e, r) {
  if (r.head.block) {
    const n = t.querySelector("head"), s = e.querySelector("head");
    if (n && s) {
      const o = Re(s, n, r);
      Promise.all(o).then(() => {
        ke(
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
    return He(e, t, r), t.children;
  if (r.morphStyle === "outerHTML" || r.morphStyle == null) {
    const n = yt(e, t, r);
    if (!n)
      throw new Error("Could not find best match");
    const s = n?.previousSibling, o = n?.nextSibling, i = I(t, n, r);
    return n ? _t(s, i, o) : [];
  } else
    throw "Do not understand how to morph style " + r.morphStyle;
}
function I(t, e, r) {
  if (!(r.ignoreActive && t === document.activeElement))
    if (e == null) {
      if (r.callbacks.beforeNodeRemoved(t) === !1)
        return;
      t.remove(), r.callbacks.afterNodeRemoved(t);
      return;
    } else {
      if (F(t, e))
        return r.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && r.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && r.head.style !== "morph" ? Re(e, t, r) : (dt(e, t), He(e, t, r))), r.callbacks.afterNodeMorphed(t, e), t);
      if (r.callbacks.beforeNodeRemoved(t) === !1 || r.callbacks.beforeNodeAdded(e) === !1)
        return;
      if (!t.parentElement)
        throw new Error("oldNode has no parentElement");
      return t.parentElement.replaceChild(e, t), r.callbacks.afterNodeAdded(e), r.callbacks.afterNodeRemoved(t), e;
    }
}
function He(t, e, r) {
  let n = t.firstChild, s = e.firstChild, o;
  for (; n; ) {
    if (o = n, n = o.nextSibling, s == null) {
      if (r.callbacks.beforeNodeAdded(o) === !1)
        return;
      e.appendChild(o), r.callbacks.afterNodeAdded(o), A(r, o);
      continue;
    }
    if (Ce(o, s, r)) {
      I(s, o, r), s = s.nextSibling, A(r, o);
      continue;
    }
    let i = ht(t, e, o, s, r);
    if (i) {
      s = ue(s, i, r), I(i, o, r), A(r, o);
      continue;
    }
    let a = mt(t, o, s, r);
    if (a) {
      s = ue(s, a, r), I(a, o, r), A(r, o);
      continue;
    }
    if (r.callbacks.beforeNodeAdded(o) === !1)
      return;
    e.insertBefore(o, s), r.callbacks.afterNodeAdded(o), A(r, o);
  }
  for (; s !== null; ) {
    let i = s;
    s = s.nextSibling, $e(i, r);
  }
}
function dt(t, e) {
  let r = t.nodeType;
  if (r === 1) {
    for (const n of t.attributes)
      e.getAttribute(n.name) !== n.value && e.setAttribute(n.name, n.value);
    for (const n of e.attributes)
      t.hasAttribute(n.name) || e.removeAttribute(n.name);
  }
  if ((r === Node.COMMENT_NODE || r === Node.TEXT_NODE) && e.nodeValue !== t.nodeValue && (e.nodeValue = t.nodeValue), t instanceof HTMLInputElement && e instanceof HTMLInputElement && t.type !== "file")
    e.value = t.value || "", O(t, e, "value"), O(t, e, "checked"), O(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    O(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const n = t.value, s = e.value;
    n !== s && (e.value = n), e.firstChild && e.firstChild.nodeValue !== n && (e.firstChild.nodeValue = n);
  }
}
function O(t, e, r) {
  const n = t.getAttribute(r), s = e.getAttribute(r);
  n !== s && (n ? e.setAttribute(r, n) : e.removeAttribute(r));
}
function Re(t, e, r) {
  const n = [], s = [], o = [], i = [], a = r.head.style, f = /* @__PURE__ */ new Map();
  for (const l of t.children)
    f.set(l.outerHTML, l);
  for (const l of e.children) {
    let c = f.has(l.outerHTML), h = r.head.shouldReAppend(l), u = r.head.shouldPreserve(l);
    c || u ? h ? s.push(l) : (f.delete(l.outerHTML), o.push(l)) : a === "append" ? h && (s.push(l), i.push(l)) : r.head.shouldRemove(l) !== !1 && s.push(l);
  }
  i.push(...f.values()), console.log("to append: ", i);
  const g = [];
  for (const l of i) {
    console.log("adding: ", l);
    const c = document.createRange().createContextualFragment(l.outerHTML).firstChild;
    if (!c)
      throw new Error("could not create new element from: " + l.outerHTML);
    if (console.log(c), r.callbacks.beforeNodeAdded(c)) {
      if (c.hasAttribute("href") || c.hasAttribute("src")) {
        let h;
        const u = new Promise((v) => {
          h = v;
        });
        c.addEventListener("load", function() {
          h(void 0);
        }), g.push(u);
      }
      e.appendChild(c), r.callbacks.afterNodeAdded(c), n.push(c);
    }
  }
  for (const l of s)
    r.callbacks.beforeNodeRemoved(l) !== !1 && (e.removeChild(l), r.callbacks.afterNodeRemoved(l));
  return r.head.afterHeadMorphed(e, {
    added: n,
    kept: o,
    removed: s
  }), g;
}
function E() {
}
function pt(t, e, r) {
  return {
    target: t,
    newContent: e,
    config: r,
    morphStyle: r.morphStyle,
    ignoreActive: r.ignoreActive,
    idMap: St(t, e),
    deadIds: /* @__PURE__ */ new Set(),
    callbacks: Object.assign(
      {
        beforeNodeAdded: E,
        afterNodeAdded: E,
        beforeNodeMorphed: E,
        afterNodeMorphed: E,
        beforeNodeRemoved: E,
        afterNodeRemoved: E
      },
      r.callbacks
    ),
    head: Object.assign(
      {
        style: "merge",
        shouldPreserve: (n) => n.getAttribute("im-preserve") === "true",
        shouldReAppend: (n) => n.getAttribute("im-re-append") === "true",
        shouldRemove: E,
        afterHeadMorphed: E
      },
      r.head
    )
  };
}
function Ce(t, e, r) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : R(r, t, e) > 0 : !1;
}
function F(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function ue(t, e, r) {
  for (; t !== e; ) {
    const n = t;
    if (t = t?.nextSibling, !n)
      throw new Error("tempNode is null");
    $e(n, r);
  }
  return A(r, e), e.nextSibling;
}
function ht(t, e, r, n, s) {
  const o = R(s, r, e);
  let i = null;
  if (o > 0) {
    i = n;
    let a = 0;
    for (; i != null; ) {
      if (Ce(r, i, s))
        return i;
      if (a += R(s, i, t), a > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function mt(t, e, r, n) {
  let s = r, o = e.nextSibling, i = 0;
  for (; s && o; ) {
    if (R(n, s, t) > 0)
      return null;
    if (F(e, s))
      return s;
    if (F(o, s) && (i++, o = o.nextSibling, i >= 2))
      return null;
    s = s.nextSibling;
  }
  return s;
}
const fe = new DOMParser();
function gt(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const r = fe.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return x.add(r), r;
    {
      let n = r.firstChild;
      return n ? (x.add(n), n) : null;
    }
  } else {
    const n = fe.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!n)
      throw new Error("content is null");
    return x.add(n), n;
  }
}
function vt(t) {
  if (t == null)
    return document.createElement("div");
  if (x.has(t))
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
function _t(t, e, r) {
  const n = [], s = [];
  for (; t; )
    n.push(t), t = t.previousSibling;
  for (; n.length > 0; ) {
    const o = n.pop();
    s.push(o), e?.parentElement?.insertBefore(o, e);
  }
  for (s.push(e); r; )
    n.push(r), s.push(r), r = r.nextSibling;
  for (; n.length; )
    e?.parentElement?.insertBefore(n.pop(), e.nextSibling);
  return s;
}
function yt(t, e, r) {
  let n = t.firstChild, s = n, o = 0;
  for (; n; ) {
    let i = bt(n, e, r);
    i > o && (s = n, o = i), n = n.nextSibling;
  }
  return s;
}
function bt(t, e, r) {
  return F(t, e) ? 0.5 + R(r, t, e) : 0;
}
function $e(t, e) {
  A(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function Et(t, e) {
  return !t.deadIds.has(e);
}
function wt(t, e, r) {
  return t.idMap.get(r)?.has(e) || !1;
}
function A(t, e) {
  const r = t.idMap.get(e);
  if (r)
    for (const n of r)
      t.deadIds.add(n);
}
function R(t, e, r) {
  const n = t.idMap.get(e);
  if (!n)
    return 0;
  let s = 0;
  for (const o of n)
    Et(t, o) && wt(t, o, r) && ++s;
  return s;
}
function de(t, e) {
  const r = t.parentElement, n = t.querySelectorAll("[id]");
  for (const s of n) {
    let o = s;
    for (; o !== r && o; ) {
      let i = e.get(o);
      i == null && (i = /* @__PURE__ */ new Set(), e.set(o, i)), i.add(s.id), o = o.parentElement;
    }
  }
}
function St(t, e) {
  const r = /* @__PURE__ */ new Map();
  return de(t, r), de(e, r), r;
}
const Tt = "get", At = "post", Lt = "put", Mt = "patch", Pt = "delete", Nt = [Tt, At, Lt, Mt, Pt], kt = Nt.reduce((t, e) => (t[e] = async (r) => It(e, r), t), {}), Oe = "Accept", Q = "Content-Type", xe = "application/json", K = "datastar", W = `${K}-indicator`, j = `${K}-request`, pe = `${K}-settling`, G = `${K}-swapping`, B = "text/html", Ht = "fragmentSelector", Rt = "fragmentSwap", Ct = {
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
}, $t = {
  prefix: "fetchUrl",
  description: "Sets the fetch url",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onGlobalInit: ({ mergeStore: t }) => {
    const e = document.createElement("style");
    e.innerHTML = `
.${W}{
 opacity:0;
}
.${j} .${W}{
 opacity:1;
 transition: opacity 300ms ease-in;
}
.${j}.${W}{
 opacity:1;
 transition: opacity 300s ease-in;
}
`, document.head.appendChild(e);
    const r = new Headers();
    r.append(Oe, B), r.append(Q, xe), t({
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
}, Ot = {
  prefix: "sse",
  description: "Sets the value of the element",
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    if (typeof t.expressionFn(t) != "string")
      throw new Error("SSE url must be a string");
    return () => {
    };
  }
}, xt = [Ct, $t, Ot];
async function It(t, e) {
  const { el: r, store: n } = e, s = n.fetch.elementURLs[r.id];
  if (!s)
    throw new Error(`No signal for ${t}`);
  r.classList.add(j);
  const o = new URL(s.value, window.location.origin), i = new Headers();
  i.append(Oe, B), i.append(Q, xe);
  const a = n.fetch.headers.value;
  if (a)
    for (const v in a) {
      const y = a[v];
      i.append(v, y);
    }
  const f = { ...n };
  delete f.fetch;
  const g = JSON.stringify(f);
  t = t.toUpperCase();
  const l = { method: t, headers: i };
  if (t === "GET") {
    const v = new URLSearchParams(o.search);
    v.append("datastar", g), o.search = v.toString();
  } else
    l.body = g;
  const c = await fetch(o, l), h = await c.text();
  if (!c.ok) {
    if (!(c.status >= 300 && c.status < 400))
      throw new Error("Response was not ok and wasn't a redirect, can't merge.");
    let y = h;
    y.startsWith("/") && (y = window.location.origin + y), console.log(`Redirecting to ${y}`), window.location.replace(y);
    return;
  }
  if (!(c.headers.get(Q) === B))
    throw new Error("Response is not HTML and wasn't a redirect, can't merge.");
  Ft(e, h), r.classList.remove(j);
}
const Dt = new DOMParser();
function Ft(t, e, r = "morph") {
  const { el: n } = t, s = [...Dt.parseFromString(e, B).body.children];
  for (let o = 0; o < s.length; o++) {
    const i = s[o];
    if (!(i instanceof Element))
      throw new Error("Not an element");
    const a = ee(i), f = i.getAttribute("id"), g = o === 0, l = !!f?.length, c = g && !l;
    let h;
    if (c)
      h = [n];
    else {
      if (!l)
        throw new Error("No id");
      const u = a?.dataset?.[Ht] || `#${f}`;
      h = document.querySelectorAll(u) || [];
    }
    if (!h)
      throw new Error("No target element");
    for (const u of h) {
      const v = a?.dataset?.[Rt];
      switch (v && (r = v), u.classList.add(G), console.log(`Adding ${G} to ${u.id}`), r) {
        case "morph":
          ft(u, i);
          break;
        case "inner":
          u.innerHTML = i.innerHTML;
          break;
        case "outer":
          u.outerHTML = i.outerHTML;
          break;
        case "prepend":
          u.prepend(i);
          break;
        case "append":
          u.append(i);
          break;
        case "before":
          u.before(i);
          break;
        case "after":
          u.after(i);
          break;
        case "delete":
          u.remove();
          break;
        default:
          throw new Error("Invalid merge mode");
      }
      t.applyPlugins(u), u.classList.remove(G), u.classList.add(pe), setTimeout(() => {
        u.classList.remove(pe);
      }, 300);
    }
  }
}
const jt = {
  setAll: async (t, e, r) => {
    const n = new RegExp(e);
    Object.keys(t.store).filter((s) => n.test(s)).forEach((s) => {
      t.store[s].value = r;
    });
  }
}, J = "display", he = "none", z = "important", Bt = {
  prefix: "show",
  description: "Sets the display of the element",
  allowedModifiers: /* @__PURE__ */ new Set([z]),
  onLoad: (t) => {
    const { el: e, modifiers: r, expressionFn: n } = t;
    return re(() => {
      const o = !!n(t), a = r.has(z) ? z : void 0;
      o ? e.style.length === 1 && e.style.display === he ? e.style.removeProperty(J) : e.style.setProperty(J, "", a) : e.style.setProperty(J, he, a);
    });
  }
}, Vt = "intersects", me = "once", ge = "half", ve = "full", Ut = {
  prefix: Vt,
  description: "Run expression when element intersects with viewport",
  allowedModifiers: /* @__PURE__ */ new Set([me, ge, ve]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, r = { threshold: 0 };
    e.has(ve) ? r.threshold = 1 : e.has(ge) && (r.threshold = 0.5);
    const n = new IntersectionObserver((s) => {
      s.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(me) && n.disconnect());
      });
    }, r);
    return n.observe(t.el), () => n.disconnect();
  }
}, _e = "prepend", ye = "append", be = new Error("Target element must have a parent if using prepend or append"), qt = {
  prefix: "teleport",
  description: "Teleports the element to another element",
  allowedModifiers: /* @__PURE__ */ new Set([_e, ye]),
  allowedTags: /* @__PURE__ */ new Set(["template"]),
  bypassExpressionFunctionCreation: !0,
  onLoad: (t) => {
    const { el: e, modifiers: r, expression: n } = t;
    if (!(e instanceof HTMLTemplateElement))
      throw new Error();
    const s = document.querySelector(n);
    if (!s)
      throw new Error(`Target element not found: ${n}`);
    if (!e.content)
      throw new Error("Template element must have content");
    const o = e.content.cloneNode(!0);
    if (ee(o)?.firstElementChild)
      throw new Error("Empty template");
    if (r.has(_e)) {
      if (!s.parentNode)
        throw be;
      s.parentNode.insertBefore(o, s);
    } else if (r.has(ye)) {
      if (!s.parentNode)
        throw be;
      s.parentNode.insertBefore(o, s.nextSibling);
    } else
      s.appendChild(o);
  }
}, Kt = {
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
}, Wt = [
  Bt,
  Ut,
  qt,
  Kt
];
function Gt(t = {}, ...e) {
  const r = performance.now(), n = new tt(t, ...e);
  n.run();
  const s = performance.now();
  return console.log(`Datastar loaded and attached to all DOM elements in ${s - r}ms`), n;
}
function Jt(t = {}, ...e) {
  const r = Object.assign({}, jt, kt, t), n = [...xt, ...Wt, ...lt, ...e];
  return Gt(r, ...n);
}
export {
  tt as Datastar,
  Gt as runDatastarWith,
  Jt as runDatastarWithAllPlugins,
  ee as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
