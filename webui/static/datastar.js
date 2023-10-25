function Y(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function j() {
  throw new Error("Cycle detected");
}
function Be() {
  throw new Error("Computed cannot have side-effects");
}
const Ve = Symbol.for("preact-signals"), _ = 1, A = 2, H = 4, M = 8, L = 16, w = 32;
function q() {
  N++;
}
function K() {
  if (N > 1) {
    N--;
    return;
  }
  let t, e = !1;
  for (; P !== void 0; ) {
    let r = P;
    for (P = void 0, G++; r !== void 0; ) {
      const n = r._nextBatchedEffect;
      if (r._nextBatchedEffect = void 0, r._flags &= ~A, !(r._flags & M) && be(r))
        try {
          r._callback();
        } catch (o) {
          e || (t = o, e = !0);
        }
      r = n;
    }
  }
  if (G = 0, N--, e)
    throw t;
}
function je(t) {
  if (N > 0)
    return t();
  q();
  try {
    return t();
  } finally {
    K();
  }
}
let f, P, N = 0, G = 0, I = 0;
function _e(t) {
  if (f === void 0)
    return;
  let e = t._node;
  if (e === void 0 || e._target !== f)
    return e = {
      _version: 0,
      _source: t,
      _prevSource: f._sources,
      _nextSource: void 0,
      _target: f,
      _prevTarget: void 0,
      _nextTarget: void 0,
      _rollbackNode: e
    }, f._sources !== void 0 && (f._sources._nextSource = e), f._sources = e, t._node = e, f._flags & w && t._subscribe(e), e;
  if (e._version === -1)
    return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = f._sources, e._nextSource = void 0, f._sources._nextSource = e, f._sources = e), e;
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
  return ee(function() {
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
    const t = _e(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (f instanceof b && Be(), t !== this._value) {
      G > 100 && j(), this._value = t, this._version++, I++, q();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        K();
      }
    }
  }
});
function ye(t) {
  return new m(t);
}
function be(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    if (e._source._version !== e._version || !e._source._refresh() || e._source._version !== e._version)
      return !0;
  return !1;
}
function Ee(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource) {
    const r = e._source._node;
    if (r !== void 0 && (e._rollbackNode = r), e._source._node = e, e._version = -1, e._nextSource === void 0) {
      t._sources = e;
      break;
    }
  }
}
function we(t) {
  let e = t._sources, r;
  for (; e !== void 0; ) {
    const n = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), n !== void 0 && (n._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = n)) : r = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = n;
  }
  t._sources = r;
}
function b(t) {
  m.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = I - 1, this._flags = H;
}
b.prototype = new m();
b.prototype._refresh = function() {
  if (this._flags &= ~A, this._flags & _)
    return !1;
  if ((this._flags & (H | w)) === w || (this._flags &= ~H, this._globalVersion === I))
    return !0;
  if (this._globalVersion = I, this._flags |= _, this._version > 0 && !be(this))
    return this._flags &= ~_, !0;
  const t = f;
  try {
    Ee(this), f = this;
    const e = this._compute();
    (this._flags & L || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~L, this._version++);
  } catch (e) {
    this._value = e, this._flags |= L, this._version++;
  }
  return f = t, we(this), this._flags &= ~_, !0;
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
  if (!(this._flags & A)) {
    this._flags |= H | A;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
b.prototype.peek = function() {
  if (this._refresh() || j(), this._flags & L)
    throw this._value;
  return this._value;
};
Object.defineProperty(b.prototype, "value", {
  get() {
    this._flags & _ && j();
    const t = _e(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & L)
      throw this._value;
    return this._value;
  }
});
function qe(t) {
  return new b(t);
}
function Se(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    q();
    const r = f;
    f = void 0;
    try {
      e();
    } catch (n) {
      throw t._flags &= ~_, t._flags |= M, Q(t), n;
    } finally {
      f = r, K();
    }
  }
}
function Q(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Se(t);
}
function Ke(t) {
  if (f !== this)
    throw new Error("Out-of-order effect");
  we(this), f = t, this._flags &= ~_, this._flags & M && Q(this), K();
}
function R(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = w;
}
R.prototype._callback = function() {
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
R.prototype._start = function() {
  this._flags & _ && j(), this._flags |= _, this._flags &= ~M, Se(this), Ee(this), q();
  const t = f;
  return f = this, Ke.bind(this, t);
};
R.prototype._notify = function() {
  this._flags & A || (this._flags |= A, this._nextBatchedEffect = P, P = this);
};
R.prototype._dispose = function() {
  this._flags |= M, this._flags & _ || Q(this);
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
class Te {
  get value() {
    return Z(this);
  }
  set value(e) {
    je(() => Ue(this, e));
  }
  peek() {
    return Z(this, { peek: !0 });
  }
}
const z = (t) => Object.assign(
  new Te(),
  Object.entries(t).reduce(
    (e, [r, n]) => {
      if (["value", "peek"].some((o) => o === r))
        throw new Error(`${r} is a reserved property name`);
      return typeof n != "object" || n === null || Array.isArray(n) ? e[r] = ye(n) : e[r] = z(n), e;
    },
    {}
  )
), Ue = (t, e) => Object.keys(e).forEach((r) => t[r].value = e[r]), Z = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (r, [n, o]) => (o instanceof m ? r[n] = e ? o.peek() : o.value : o instanceof Te && (r[n] = Z(o, { peek: e })), r),
  {}
);
function Ae(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return JSON.parse(JSON.stringify(e));
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let r = t;
  return typeof t != "object" && (r = { ...e }), Object.keys(e).forEach((n) => {
    r.hasOwnProperty(n) || (r[n] = e[n]), e[n] === null ? delete r[n] : r[n] = Ae(r[n], e[n]);
  }), r;
}
const We = "[a-zA-Z_$][0-9a-zA-Z_$]*", te = (t, e, r) => new RegExp(`(?<whole>\\${t}(?<${e}>${We}))${r}`, "g"), Je = {
  name: "SignalProcessor",
  description: "Replacing $signal with ctx.store.signal.value",
  regexp: te("$", "signal", ""),
  replacer: (t) => {
    const { signal: e } = t;
    return `ctx.store.${e}.value`;
  }
}, Ge = {
  name: "ActionProcessor",
  description: "Replacing @action(args) with ctx.actions.action(ctx, args)",
  regexp: te("@", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => `ctx.actions.${t}(ctx, ${e || ""})`
}, ze = {
  name: "RefProcessor",
  description: "Replacing #foo with ctx.refs.foo",
  regexp: te("~", "ref", ""),
  replacer({ ref: t }) {
    return `data.refs.${t}`;
  }
}, Ze = [Je, Ge, ze], Xe = {
  prefix: "mergeStore",
  description: "Setup the global store",
  onLoad: (t) => {
    const e = t.expressionFn(t);
    t.mergeStore(e);
  }
}, Ye = {
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
}, Qe = [Xe, Ye];
class et {
  plugins = [];
  store = z({});
  actions = {};
  refs = {};
  reactivity = {
    signal: ye,
    computed: qe,
    effect: ee
  };
  missingIDNext = 0;
  removals = /* @__PURE__ */ new Map();
  constructor(e = {}, ...r) {
    if (this.actions = Object.assign(this.actions, e), r = [...Qe, ...r], !r.length)
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
    const r = Ae(this.store.value, e);
    this.store = z(r);
  }
  signalByName(e) {
    return this.store.value[e];
  }
  applyPlugins(e) {
    const r = /* @__PURE__ */ new Set();
    this.plugins.forEach((n, o) => {
      Me(e, (s) => {
        o === 0 && this.cleanupElementRemovals(s);
        const i = Y(s);
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
            let u = i.dataset[a] || "";
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
              const [S, ...O] = p.split("_");
              return { label: S, args: O };
            });
            if (n.allowedModifiers) {
              for (const p of h)
                if (!n.allowedModifiers.has(p.label))
                  throw new Error(`Modifier '${p.label}' is not allowed`);
            }
            const d = /* @__PURE__ */ new Map();
            for (const p of h)
              d.set(p.label, p.args);
            if (n.mustHaveEmptyExpression && u.length)
              throw new Error(`Attribute '${a}' must have empty expression`);
            if (n.mustNotEmptyExpression && !u.length)
              throw new Error(`Attribute '${a}' must have non-empty expression`);
            const v = [...Ze, ...n.preprocessors || []];
            for (const p of v) {
              if (r.has(p))
                continue;
              r.add(p);
              const S = [...u.matchAll(p.regexp)];
              if (S.length)
                for (const O of S) {
                  if (!O.groups)
                    continue;
                  const { groups: oe } = O, { whole: Fe } = oe;
                  u = u.replace(Fe, p.replacer(oe));
                }
            }
            const { store: y, reactivity: xe, actions: De, refs: Ie } = this, re = {
              store: y,
              mergeStore: this.mergeStore.bind(this),
              applyPlugins: this.applyPlugins.bind(this),
              actions: De,
              refs: Ie,
              reactivity: xe,
              el: i,
              key: l,
              expression: u,
              expressionFn: () => {
                throw new Error("Expression function not created");
              },
              modifiers: d
            };
            if (!n.bypassExpressionFunctionCreation && !n.mustHaveEmptyExpression && u.length) {
              const p = `return ${u}`;
              try {
                const S = new Function("ctx", p);
                re.expressionFn = S;
              } catch {
                console.error(`Error evaluating expression '${p}' on ${i.id ? `#${i.id}` : i.tagName}`);
                return;
              }
            }
            const ne = n.onLoad(re);
            ne && (this.removals.has(i) || this.removals.set(i, /* @__PURE__ */ new Set()), this.removals.get(i).add(ne));
          }
        }
      });
    });
  }
}
function Me(t, e) {
  if (t)
    for (e(t), t = t.firstElementChild; t; )
      Me(t, e), t = t.nextElementSibling;
}
const tt = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, r) => (r ? "-" : "") + e.toLowerCase()), rt = {
  prefix: "bind",
  description: "Sets the value of the element",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(() => {
    const e = tt(t.key), r = t.expressionFn(t);
    t.el.setAttribute(e, `${r}`);
  })
}, se = ["change", "input", "keydown"], nt = {
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
      return s(), se.forEach((i) => {
        r.addEventListener(i, s);
      }), () => {
        se.forEach((i) => {
          r.removeEventListener(i, s);
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
}, ie = "DOMContentLoaded", st = {
  prefix: "on",
  description: "Sets the event listener of the element",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  allowedModifiers: /* @__PURE__ */ new Set(["once", "passive", "capture", "debounce", "throttle"]),
  onLoad: (t) => {
    const { el: e, key: r, expressionFn: n } = t;
    let o = () => {
      n(t);
    };
    const s = t.modifiers.get("debounce");
    if (s) {
      const g = ae(s), l = C(s, "leading", !1), c = C(s, "noTrail", !0);
      o = lt(o, g, l, c);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const g = ae(i), l = C(i, "noLead", !0), c = C(i, "noTrail", !0);
      o = ct(o, g, l, c);
    }
    const a = {
      capture: !0,
      passive: !1,
      once: !1
    };
    if (t.modifiers.has("capture") || (a.capture = !1), t.modifiers.has("passive") && (a.passive = !0), t.modifiers.has("once") && (a.once = !0), r === "load")
      return document.addEventListener(ie, o, a), () => {
        document.removeEventListener(ie, o);
      };
    const u = r.toLowerCase();
    return e.addEventListener(u, o, a), () => {
      e.removeEventListener(u, o);
    };
  }
}, it = {
  prefix: "focus",
  description: "Sets the focus of the element",
  mustHaveEmptyKey: !0,
  mustHaveEmptyExpression: !0,
  onLoad: (t) => (t.el.tabIndex || t.el.setAttribute("tabindex", "0"), t.el.focus(), t.el.scrollIntoView({ block: "center", inline: "center" }), () => t.el.blur())
}, at = [
  rt,
  nt,
  ot,
  it,
  st
];
function ae(t) {
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
function C(t, e, r = !1) {
  return t ? t.includes(e) || r : !1;
}
function lt(t, e, r = !1, n = !0) {
  let o;
  const s = () => o && clearTimeout(o);
  return function(...a) {
    s(), r && !o && t(...a), o = setTimeout(() => {
      n && t(...a), s();
    }, e);
  };
}
function ct(t, e, r = !0, n = !1) {
  let o = !1, s = null;
  return function(...a) {
    o ? s = a : (o = !0, r ? t(...a) : s = a, setTimeout(() => {
      n && s && (t(...s), s = null), o = !1;
    }, e));
  };
}
const x = /* @__PURE__ */ new WeakSet();
function ut(t, e, r = {}) {
  t instanceof Document && (t = t.documentElement);
  let n;
  typeof e == "string" ? n = mt(e) : n = e;
  const o = gt(n), s = dt(t, o, r);
  return Le(t, o, s);
}
function Le(t, e, r) {
  if (r.head.block) {
    const n = t.querySelector("head"), o = e.querySelector("head");
    if (n && o) {
      const s = Ne(o, n, r);
      Promise.all(s).then(() => {
        Le(
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
    return Pe(e, t, r), t.children;
  if (r.morphStyle === "outerHTML" || r.morphStyle == null) {
    const n = _t(e, t, r);
    if (!n)
      throw new Error("Could not find best match");
    const o = n?.previousSibling, s = n?.nextSibling, i = D(t, n, r);
    return n ? vt(o, i, s) : [];
  } else
    throw "Do not understand how to morph style " + r.morphStyle;
}
function D(t, e, r) {
  if (!(r.ignoreActive && t === document.activeElement))
    if (e == null) {
      if (r.callbacks.beforeNodeRemoved(t) === !1)
        return;
      t.remove(), r.callbacks.afterNodeRemoved(t);
      return;
    } else {
      if (F(t, e))
        return r.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && r.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && r.head.style !== "morph" ? Ne(e, t, r) : (ft(e, t), Pe(e, t, r))), r.callbacks.afterNodeMorphed(t, e), t);
      if (r.callbacks.beforeNodeRemoved(t) === !1 || r.callbacks.beforeNodeAdded(e) === !1)
        return;
      if (!t.parentElement)
        throw new Error("oldNode has no parentElement");
      return t.parentElement.replaceChild(e, t), r.callbacks.afterNodeAdded(e), r.callbacks.afterNodeRemoved(t), e;
    }
}
function Pe(t, e, r) {
  let n = t.firstChild, o = e.firstChild, s;
  for (; n; ) {
    if (s = n, n = s.nextSibling, o == null) {
      if (r.callbacks.beforeNodeAdded(s) === !1)
        return;
      e.appendChild(s), r.callbacks.afterNodeAdded(s), T(r, s);
      continue;
    }
    if (He(s, o, r)) {
      D(o, s, r), o = o.nextSibling, T(r, s);
      continue;
    }
    let i = pt(t, e, s, o, r);
    if (i) {
      o = le(o, i, r), D(i, s, r), T(r, s);
      continue;
    }
    let a = ht(t, s, o, r);
    if (a) {
      o = le(o, a, r), D(a, s, r), T(r, s);
      continue;
    }
    if (r.callbacks.beforeNodeAdded(s) === !1)
      return;
    e.insertBefore(s, o), r.callbacks.afterNodeAdded(s), T(r, s);
  }
  for (; o !== null; ) {
    let i = o;
    o = o.nextSibling, ke(i, r);
  }
}
function ft(t, e) {
  let r = t.nodeType;
  if (r === 1) {
    for (const n of t.attributes)
      e.getAttribute(n.name) !== n.value && e.setAttribute(n.name, n.value);
    for (const n of e.attributes)
      t.hasAttribute(n.name) || e.removeAttribute(n.name);
  }
  if ((r === Node.COMMENT_NODE || r === Node.TEXT_NODE) && e.nodeValue !== t.nodeValue && (e.nodeValue = t.nodeValue), t instanceof HTMLInputElement && e instanceof HTMLInputElement && t.type !== "file")
    e.value = t.value || "", $(t, e, "value"), $(t, e, "checked"), $(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    $(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const n = t.value, o = e.value;
    n !== o && (e.value = n), e.firstChild && e.firstChild.nodeValue !== n && (e.firstChild.nodeValue = n);
  }
}
function $(t, e, r) {
  const n = t.getAttribute(r), o = e.getAttribute(r);
  n !== o && (n ? e.setAttribute(r, n) : e.removeAttribute(r));
}
function Ne(t, e, r) {
  const n = [], o = [], s = [], i = [], a = r.head.style, u = /* @__PURE__ */ new Map();
  for (const l of t.children)
    u.set(l.outerHTML, l);
  for (const l of e.children) {
    let c = u.has(l.outerHTML), h = r.head.shouldReAppend(l), d = r.head.shouldPreserve(l);
    c || d ? h ? o.push(l) : (u.delete(l.outerHTML), s.push(l)) : a === "append" ? h && (o.push(l), i.push(l)) : r.head.shouldRemove(l) !== !1 && o.push(l);
  }
  i.push(...u.values()), console.log("to append: ", i);
  const g = [];
  for (const l of i) {
    console.log("adding: ", l);
    const c = document.createRange().createContextualFragment(l.outerHTML).firstChild;
    if (!c)
      throw new Error("could not create new element from: " + l.outerHTML);
    if (console.log(c), r.callbacks.beforeNodeAdded(c)) {
      if (c.hasAttribute("href") || c.hasAttribute("src")) {
        let h;
        const d = new Promise((v) => {
          h = v;
        });
        c.addEventListener("load", function() {
          h(void 0);
        }), g.push(d);
      }
      e.appendChild(c), r.callbacks.afterNodeAdded(c), n.push(c);
    }
  }
  for (const l of o)
    r.callbacks.beforeNodeRemoved(l) !== !1 && (e.removeChild(l), r.callbacks.afterNodeRemoved(l));
  return r.head.afterHeadMorphed(e, {
    added: n,
    kept: s,
    removed: o
  }), g;
}
function E() {
}
function dt(t, e, r) {
  return {
    target: t,
    newContent: e,
    config: r,
    morphStyle: r.morphStyle,
    ignoreActive: r.ignoreActive,
    idMap: wt(t, e),
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
function He(t, e, r) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : k(r, t, e) > 0 : !1;
}
function F(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function le(t, e, r) {
  for (; t !== e; ) {
    const n = t;
    if (t = t?.nextSibling, !n)
      throw new Error("tempNode is null");
    ke(n, r);
  }
  return T(r, e), e.nextSibling;
}
function pt(t, e, r, n, o) {
  const s = k(o, r, e);
  let i = null;
  if (s > 0) {
    i = n;
    let a = 0;
    for (; i != null; ) {
      if (He(r, i, o))
        return i;
      if (a += k(o, i, t), a > s)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function ht(t, e, r, n) {
  let o = r, s = e.nextSibling, i = 0;
  for (; o && s; ) {
    if (k(n, o, t) > 0)
      return null;
    if (F(e, o))
      return o;
    if (F(s, o) && (i++, s = s.nextSibling, i >= 2))
      return null;
    o = o.nextSibling;
  }
  return o;
}
const ce = new DOMParser();
function mt(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const r = ce.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return x.add(r), r;
    {
      let n = r.firstChild;
      return n ? (x.add(n), n) : null;
    }
  } else {
    const n = ce.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!n)
      throw new Error("content is null");
    return x.add(n), n;
  }
}
function gt(t) {
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
function vt(t, e, r) {
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
function _t(t, e, r) {
  let n = t.firstChild, o = n, s = 0;
  for (; n; ) {
    let i = yt(n, e, r);
    i > s && (o = n, s = i), n = n.nextSibling;
  }
  return o;
}
function yt(t, e, r) {
  return F(t, e) ? 0.5 + k(r, t, e) : 0;
}
function ke(t, e) {
  T(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function bt(t, e) {
  return !t.deadIds.has(e);
}
function Et(t, e, r) {
  return t.idMap.get(r)?.has(e) || !1;
}
function T(t, e) {
  const r = t.idMap.get(e);
  if (r)
    for (const n of r)
      t.deadIds.add(n);
}
function k(t, e, r) {
  const n = t.idMap.get(e);
  if (!n)
    return 0;
  let o = 0;
  for (const s of n)
    bt(t, s) && Et(t, s, r) && ++o;
  return o;
}
function ue(t, e) {
  const r = t.parentElement, n = t.querySelectorAll("[id]");
  for (const o of n) {
    let s = o;
    for (; s !== r && s; ) {
      let i = e.get(s);
      i == null && (i = /* @__PURE__ */ new Set(), e.set(s, i)), i.add(o.id), s = s.parentElement;
    }
  }
}
function wt(t, e) {
  const r = /* @__PURE__ */ new Map();
  return ue(t, r), ue(e, r), r;
}
const Re = "get", St = "post", Tt = "put", At = "patch", Mt = "delete", Lt = [Re, St, Tt, At, Mt], Pt = Lt.reduce((t, e) => (t[e] = async (r) => $t(e, r), t), {}), Oe = "Accept", X = "Content-Type", Ce = "application/json", $e = "datastar", U = `${$e}-indicator`, B = `${$e}-request`, V = "text/html", Nt = "fragmentSelector", Ht = "fragmentSwap", kt = {
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
}, Rt = {
  prefix: "fetchUrl",
  description: "Sets the fetch url",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onGlobalInit: ({ mergeStore: t }) => {
    const e = document.createElement("style");
    e.innerHTML = `
.${U}{
 opacity:0;
}
.${B} .${U}{
 opacity:1;
 transition: opacity 300ms ease-in;
}
.${B}.${U}{
 opacity:1;
 transition: opacity 300s ease-in;
}
`, document.head.appendChild(e);
    const r = new Headers();
    r.append(Oe, V), r.append(X, Ce), t({
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
}, Ct = [kt, Rt, Ot];
async function $t(t, e) {
  const { el: r, store: n } = e, o = n.fetch.elementURLs[r.id];
  if (!o)
    throw new Error(`No signal for ${t}`);
  r.classList.add(B);
  const s = new URL(o.value, window.location.origin), i = new Headers();
  i.append(Oe, V), i.append(X, Ce);
  const a = n.fetch.headers.value;
  if (a)
    for (const v in a) {
      const y = a[v];
      i.append(v, y);
    }
  const u = { ...n };
  delete u.fetch;
  const g = JSON.stringify(u), l = { method: t, headers: i };
  if (t === Re) {
    const v = new URLSearchParams(s.search);
    v.append("datastar", g), s.search = v.toString();
  } else
    l.body = g;
  const c = await fetch(s, l), h = await c.text();
  if (!c.ok) {
    if (!(c.status >= 300 && c.status < 400))
      throw new Error("Response was not ok and wasn't a redirect, can't merge.");
    let y = h;
    y.startsWith("/") && (y = window.location.origin + y), console.log(`Redirecting to ${y}`), window.location.replace(y);
    return;
  }
  if (!(c.headers.get(X) === V))
    throw new Error("Response is not HTML and wasn't a redirect, can't merge.");
  Dt(e, h), r.classList.remove(B);
}
const xt = new DOMParser();
function Dt(t, e, r = "morph") {
  const { el: n } = t, o = [...xt.parseFromString(e, V).body.children];
  for (let s = 0; s < o.length; s++) {
    const i = o[s];
    if (!(i instanceof Element))
      throw new Error("Not an element");
    const a = Y(i), u = i.getAttribute("id"), g = s === 0, l = !!u?.length, c = g && !l;
    let h;
    if (c)
      h = [n];
    else {
      if (!l)
        throw new Error("No id");
      const d = a?.dataset?.[Nt] || `#${u}`;
      h = document.querySelectorAll(d) || [];
    }
    if (!h)
      throw new Error("No target element");
    for (const d of h) {
      const v = a?.dataset?.[Ht];
      switch (v && (r = v), r) {
        case "morph":
          ut(d, i), t.applyPlugins(d);
          continue;
        case "inner":
          d.innerHTML = i.innerHTML;
          break;
        case "outer":
          d.outerHTML = i.outerHTML;
          break;
        case "prepend":
          d.prepend(i);
          break;
        case "append":
          d.append(i);
          break;
        case "before":
          d.before(i);
          break;
        case "after":
          d.after(i);
          break;
        case "delete":
          d.remove();
          break;
        default:
          throw new Error("Invalid merge mode");
      }
      t.applyPlugins(i);
    }
  }
}
const W = "display", fe = "none", J = "important", It = {
  prefix: "show",
  description: "Sets the display of the element",
  allowedModifiers: /* @__PURE__ */ new Set([J]),
  onLoad: (t) => {
    const { el: e, modifiers: r, expressionFn: n } = t;
    return ee(() => {
      const s = !!n(t), a = r.has(J) ? J : void 0;
      s ? e.style.length === 1 && e.style.display === fe ? e.style.removeProperty(W) : e.style.setProperty(W, "", a) : e.style.setProperty(W, fe, a);
    });
  }
}, Ft = "intersects", de = "once", pe = "half", he = "full", Bt = {
  prefix: Ft,
  description: "Run expression when element intersects with viewport",
  allowedModifiers: /* @__PURE__ */ new Set([de, pe, he]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, r = { threshold: 0 };
    e.has(he) ? r.threshold = 1 : e.has(pe) && (r.threshold = 0.5);
    const n = new IntersectionObserver((o) => {
      o.forEach((s) => {
        s.isIntersecting && (t.expressionFn(t), e.has(de) && n.disconnect());
      });
    }, r);
    return n.observe(t.el), () => n.disconnect();
  }
}, me = "prepend", ge = "append", ve = new Error("Target element must have a parent if using prepend or append"), Vt = {
  prefix: "teleport",
  description: "Teleports the element to another element",
  allowedModifiers: /* @__PURE__ */ new Set([me, ge]),
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
    if (r.has(me)) {
      if (!o.parentNode)
        throw ve;
      o.parentNode.insertBefore(s, o);
    } else if (r.has(ge)) {
      if (!o.parentNode)
        throw ve;
      o.parentNode.insertBefore(s, o.nextSibling);
    } else
      o.appendChild(s);
  }
}, jt = {
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
}, qt = [
  It,
  Bt,
  Vt,
  jt
];
function Kt(t = {}, ...e) {
  const r = performance.now(), n = new et(t, ...e);
  n.run();
  const o = performance.now();
  return console.log(`Datastar loaded and attached to all DOM elements in ${o - r}ms`), n;
}
function Ut(t = {}, ...e) {
  const r = Object.assign({}, Pt, t), n = [...Ct, ...qt, ...at, ...e];
  return Kt(r, ...n);
}
export {
  et as Datastar,
  Kt as runDatastarWith,
  Ut as runDatastarWithAllPlugins,
  Y as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
