function Te(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function J() {
  throw new Error("Cycle detected");
}
function Fe() {
  throw new Error("Computed cannot have side-effects");
}
const je = Symbol.for("preact-signals"), y = 1, L = 2, C = 4, M = 8, R = 16, T = 32;
function z() {
  O++;
}
function Z() {
  if (O > 1) {
    O--;
    return;
  }
  let t, e = !1;
  for (; H !== void 0; ) {
    let r = H;
    for (H = void 0, te++; r !== void 0; ) {
      const n = r._nextBatchedEffect;
      if (r._nextBatchedEffect = void 0, r._flags &= ~L, !(r._flags & M) && Me(r))
        try {
          r._callback();
        } catch (s) {
          e || (t = s, e = !0);
        }
      r = n;
    }
  }
  if (te = 0, O--, e)
    throw t;
}
function Be(t) {
  if (O > 0)
    return t();
  z();
  try {
    return t();
  } finally {
    Z();
  }
}
let d, H, O = 0, te = 0, K = 0;
function Ae(t) {
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
    }, d._sources !== void 0 && (d._sources._nextSource = e), d._sources = e, t._node = e, d._flags & T && t._subscribe(e), e;
  if (e._version === -1)
    return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = d._sources, e._nextSource = void 0, d._sources._nextSource = e, d._sources = e), e;
}
function p(t) {
  this._value = t, this._version = 0, this._node = void 0, this._targets = void 0;
}
p.prototype.brand = je;
p.prototype._refresh = function() {
  return !0;
};
p.prototype._subscribe = function(t) {
  this._targets !== t && t._prevTarget === void 0 && (t._nextTarget = this._targets, this._targets !== void 0 && (this._targets._prevTarget = t), this._targets = t);
};
p.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0) {
    const e = t._prevTarget, r = t._nextTarget;
    e !== void 0 && (e._nextTarget = r, t._prevTarget = void 0), r !== void 0 && (r._prevTarget = e, t._nextTarget = void 0), t === this._targets && (this._targets = r);
  }
};
p.prototype.subscribe = function(t) {
  const e = this;
  return oe(function() {
    const r = e.value, n = this._flags & T;
    this._flags &= ~T;
    try {
      t(r);
    } finally {
      this._flags |= n;
    }
  });
};
p.prototype.valueOf = function() {
  return this.value;
};
p.prototype.toString = function() {
  return this.value + "";
};
p.prototype.toJSON = function() {
  return this.value;
};
p.prototype.peek = function() {
  return this._value;
};
Object.defineProperty(p.prototype, "value", {
  get() {
    const t = Ae(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (d instanceof w && Fe(), t !== this._value) {
      te > 100 && J(), this._value = t, this._version++, K++, z();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        Z();
      }
    }
  }
});
function Le(t) {
  return new p(t);
}
function Me(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    if (e._source._version !== e._version || !e._source._refresh() || e._source._version !== e._version)
      return !0;
  return !1;
}
function Ne(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource) {
    const r = e._source._node;
    if (r !== void 0 && (e._rollbackNode = r), e._source._node = e, e._version = -1, e._nextSource === void 0) {
      t._sources = e;
      break;
    }
  }
}
function Pe(t) {
  let e = t._sources, r;
  for (; e !== void 0; ) {
    const n = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), n !== void 0 && (n._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = n)) : r = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = n;
  }
  t._sources = r;
}
function w(t) {
  p.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = K - 1, this._flags = C;
}
w.prototype = new p();
w.prototype._refresh = function() {
  if (this._flags &= ~L, this._flags & y)
    return !1;
  if ((this._flags & (C | T)) === T || (this._flags &= ~C, this._globalVersion === K))
    return !0;
  if (this._globalVersion = K, this._flags |= y, this._version > 0 && !Me(this))
    return this._flags &= ~y, !0;
  const t = d;
  try {
    Ne(this), d = this;
    const e = this._compute();
    (this._flags & R || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~R, this._version++);
  } catch (e) {
    this._value = e, this._flags |= R, this._version++;
  }
  return d = t, Pe(this), this._flags &= ~y, !0;
};
w.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= C | T;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  p.prototype._subscribe.call(this, t);
};
w.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (p.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~T;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
w.prototype._notify = function() {
  if (!(this._flags & L)) {
    this._flags |= C | L;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
w.prototype.peek = function() {
  if (this._refresh() || J(), this._flags & R)
    throw this._value;
  return this._value;
};
Object.defineProperty(w.prototype, "value", {
  get() {
    this._flags & y && J();
    const t = Ae(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & R)
      throw this._value;
    return this._value;
  }
});
function Ve(t) {
  return new w(t);
}
function ke(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    z();
    const r = d;
    d = void 0;
    try {
      e();
    } catch (n) {
      throw t._flags &= ~y, t._flags |= M, se(t), n;
    } finally {
      d = r, Z();
    }
  }
}
function se(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, ke(t);
}
function Ue(t) {
  if (d !== this)
    throw new Error("Out-of-order effect");
  Pe(this), d = t, this._flags &= ~y, this._flags & M && se(this), Z();
}
function x(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = T;
}
x.prototype._callback = function() {
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
x.prototype._start = function() {
  this._flags & y && J(), this._flags |= y, this._flags &= ~M, ke(this), Ne(this), z();
  const t = d;
  return d = this, Ue.bind(this, t);
};
x.prototype._notify = function() {
  this._flags & L || (this._flags |= L, this._nextBatchedEffect = H, H = this);
};
x.prototype._dispose = function() {
  this._flags |= M, this._flags & y || se(this);
};
function oe(t) {
  const e = new x(t);
  try {
    e._callback();
  } catch (r) {
    throw e._dispose(), r;
  }
  return e._dispose.bind(e);
}
class Re {
  get value() {
    return ne(this);
  }
  set value(e) {
    Be(() => qe(this, e));
  }
  peek() {
    return ne(this, { peek: !0 });
  }
}
const re = (t) => Object.assign(
  new Re(),
  Object.entries(t).reduce(
    (e, [r, n]) => {
      if (["value", "peek"].some((s) => s === r))
        throw new Error(`${r} is a reserved property name`);
      return typeof n != "object" || n === null || Array.isArray(n) ? e[r] = Le(n) : e[r] = re(n), e;
    },
    {}
  )
), qe = (t, e) => Object.keys(e).forEach((r) => t[r].value = e[r]), ne = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (r, [n, s]) => (s instanceof p ? r[n] = e ? s.peek() : s.value : s instanceof Re && (r[n] = ne(s, { peek: e })), r),
  {}
);
function He(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return JSON.parse(JSON.stringify(e));
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let r = t;
  return typeof t != "object" && (r = { ...e }), Object.keys(e).forEach((n) => {
    r.hasOwnProperty(n) || (r[n] = e[n]), e[n] === null ? delete r[n] : r[n] = He(r[n], e[n]);
  }), r;
}
const Ke = "[a-zA-Z_$][0-9a-zA-Z_$]*";
function ie(t, e, r) {
  return new RegExp(`(?<whole>\\${t}(?<${e}>${Ke})${r})`, "g");
}
const Ge = {
  name: "SignalProcessor",
  description: "Replacing $signal with ctx.store.signal.value",
  regexp: ie("$", "signal", ""),
  replacer: (t) => {
    const { signal: e } = t;
    return `ctx.store.${e}.value`;
  }
}, We = {
  name: "ActionProcessor",
  description: "Replacing $$action(args) with ctx.actions.action(ctx, args)",
  regexp: ie("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => {
    const r = ["ctx"];
    e && r.push(...e.split(",").map((s) => s.trim()));
    const n = r.join(",");
    return `ctx.actions.${t}(${n})`;
  }
}, Je = {
  name: "RefProcessor",
  description: "Replacing #foo with ctx.refs.foo",
  regexp: ie("~", "ref", ""),
  replacer({ ref: t }) {
    return `data.refs.${t}`;
  }
}, ze = [We, Ge, Je], Ze = {
  prefix: "mergeStore",
  description: "Setup the global store",
  onLoad: (t) => {
    const e = t.expressionFn(t);
    t.mergeStore(e);
  }
}, Xe = {
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
}, Ye = [Ze, Xe];
class Qe {
  plugins = [];
  store = re({});
  actions = {};
  refs = {};
  reactivity = {
    signal: Le,
    computed: Ve,
    effect: oe
  };
  missingIDNext = 0;
  removals = /* @__PURE__ */ new Map();
  constructor(e = {}, ...r) {
    if (this.actions = Object.assign(this.actions, e), r = [...Ye, ...r], !r.length)
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
    const r = He(this.store.value, e);
    this.store = re(r);
  }
  signalByName(e) {
    return this.store[e];
  }
  applyPlugins(e) {
    const r = /* @__PURE__ */ new Set();
    this.plugins.forEach((n, s) => {
      Oe(e, (o) => {
        s === 0 && this.cleanupElementRemovals(o);
        const i = Te(o);
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
            let l = i.dataset[a] || "";
            if (!a.startsWith(n.prefix))
              continue;
            if (r.clear(), n.allowedTags && !n.allowedTags.has(i.tagName.toLowerCase()))
              throw new Error(
                `Tag '${i.tagName}' is not allowed for plugin '${a}', allowed tags are: ${[
                  [...n.allowedTags].map((f) => `'${f}'`)
                ].join(", ")}`
              );
            let m = a.slice(n.prefix.length), [c, ...u] = m.split(".");
            if (n.mustHaveEmptyKey && c.length > 0)
              throw new Error(`Attribute '${a}' must have empty key`);
            if (n.mustNotEmptyKey && c.length === 0)
              throw new Error(`Attribute '${a}' must have non-empty key`);
            c.length && (c = c[0].toLowerCase() + c.slice(1));
            const _ = u.map((f) => {
              const [E, ...v] = f.split("_");
              return { label: E, args: v };
            });
            if (n.allowedModifiers) {
              for (const f of _)
                if (!n.allowedModifiers.has(f.label))
                  throw new Error(`Modifier '${f.label}' is not allowed`);
            }
            const h = /* @__PURE__ */ new Map();
            for (const f of _)
              h.set(f.label, f.args);
            if (n.mustHaveEmptyExpression && l.length)
              throw new Error(`Attribute '${a}' must have empty expression`);
            if (n.mustNotEmptyExpression && !l.length)
              throw new Error(`Attribute '${a}' must have non-empty expression`);
            const g = [...ze, ...n.preprocessors || []];
            for (const f of g) {
              if (r.has(f))
                continue;
              r.add(f);
              const E = [...l.matchAll(f.regexp)];
              if (E.length)
                for (const v of E) {
                  if (!v.groups)
                    continue;
                  const { groups: k } = v, { whole: ae } = k;
                  l = l.replace(ae, f.replacer(k));
                }
            }
            const { store: I, reactivity: D, actions: F, refs: j } = this, N = {
              store: I,
              mergeStore: this.mergeStore.bind(this),
              applyPlugins: this.applyPlugins.bind(this),
              actions: F,
              refs: j,
              reactivity: D,
              el: i,
              key: c,
              expression: l,
              expressionFn: () => {
                throw new Error("Expression function not created");
              },
              modifiers: h
            };
            if (!n.bypassExpressionFunctionCreation && !n.mustHaveEmptyExpression && l.length) {
              const f = l.split(";");
              f[f.length - 1] = `return ${f[f.length - 1]}`;
              const E = f.join(";");
              try {
                const v = new Function("ctx", E);
                N.expressionFn = v;
              } catch {
                console.error(`Error evaluating expression '${E}' on ${i.id ? `#${i.id}` : i.tagName}`);
                return;
              }
            }
            const P = n.onLoad(N);
            P && (this.removals.has(i) || this.removals.set(i, /* @__PURE__ */ new Set()), this.removals.get(i).add(P));
          }
        }
      });
    });
  }
}
function Oe(t, e) {
  if (t)
    for (e(t), t = t.firstElementChild; t; )
      Oe(t, e), t = t.nextElementSibling;
}
const et = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, r) => (r ? "-" : "") + e.toLowerCase()), tt = {
  prefix: "bind",
  description: "Sets the value of the element",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(() => {
    const e = et(t.key), r = t.expressionFn(t);
    t.el.setAttribute(e, `${r}`);
  })
}, le = ["change", "input", "keydown"], rt = {
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
      return i(), le.forEach((a) => {
        r.addEventListener(a, i);
      }), () => {
        le.forEach((a) => {
          r.removeEventListener(a, i);
        });
      };
    });
  }
}, nt = {
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
}, ce = "DOMContentLoaded", st = {
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
      const m = ue(o), c = B(o, "leading", !1), u = B(o, "noTrail", !0);
      s = at(s, m, c, u);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const m = ue(i), c = B(i, "noLead", !0), u = B(i, "noTrail", !0);
      s = lt(s, m, c, u);
    }
    const a = {
      capture: !0,
      passive: !1,
      once: !1
    };
    if (t.modifiers.has("capture") || (a.capture = !1), t.modifiers.has("passive") && (a.passive = !0), t.modifiers.has("once") && (a.once = !0), r === "load")
      return document.addEventListener(ce, s, a), () => {
        document.removeEventListener(ce, s);
      };
    const l = r.toLowerCase();
    return e.addEventListener(l, s, a), () => {
      e.removeEventListener(l, s);
    };
  }
}, ot = {
  prefix: "focus",
  description: "Sets the focus of the element",
  mustHaveEmptyKey: !0,
  mustHaveEmptyExpression: !0,
  onLoad: (t) => (t.el.tabIndex || t.el.setAttribute("tabindex", "0"), t.el.focus(), t.el.scrollIntoView({ block: "center", inline: "center" }), () => t.el.blur())
}, it = [
  tt,
  rt,
  nt,
  ot,
  st
];
function ue(t) {
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
function B(t, e, r = !1) {
  return t ? t.includes(e) || r : !1;
}
function at(t, e, r = !1, n = !0) {
  let s;
  const o = () => s && clearTimeout(s);
  return function(...a) {
    o(), r && !s && t(...a), s = setTimeout(() => {
      n && t(...a), o();
    }, e);
  };
}
function lt(t, e, r = !0, n = !1) {
  let s = !1, o = null;
  return function(...a) {
    s ? o = a : (s = !0, r ? t(...a) : o = a, setTimeout(() => {
      n && o && (t(...o), o = null), s = !1;
    }, e));
  };
}
const U = /* @__PURE__ */ new WeakSet();
function ct(t, e, r = {}) {
  t instanceof Document && (t = t.documentElement);
  let n;
  typeof e == "string" ? n = ht(e) : n = e;
  const s = mt(n), o = ft(t, s, r);
  return Ce(t, s, o);
}
function Ce(t, e, r) {
  if (r.head.block) {
    const n = t.querySelector("head"), s = e.querySelector("head");
    if (n && s) {
      const o = xe(s, n, r);
      Promise.all(o).then(() => {
        Ce(
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
    return $e(e, t, r), t.children;
  if (r.morphStyle === "outerHTML" || r.morphStyle == null) {
    const n = vt(e, t, r);
    if (!n)
      throw new Error("Could not find best match");
    const s = n?.previousSibling, o = n?.nextSibling, i = q(t, n, r);
    return n ? gt(s, i, o) : [];
  } else
    throw "Do not understand how to morph style " + r.morphStyle;
}
function q(t, e, r) {
  if (!(r.ignoreActive && t === document.activeElement))
    if (e == null) {
      if (r.callbacks.beforeNodeRemoved(t) === !1)
        return;
      t.remove(), r.callbacks.afterNodeRemoved(t);
      return;
    } else {
      if (G(t, e))
        return r.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && r.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && r.head.style !== "morph" ? xe(e, t, r) : (ut(e, t), $e(e, t, r))), r.callbacks.afterNodeMorphed(t, e), t);
      if (r.callbacks.beforeNodeRemoved(t) === !1 || r.callbacks.beforeNodeAdded(e) === !1)
        return;
      if (!t.parentElement)
        throw new Error("oldNode has no parentElement");
      return t.parentElement.replaceChild(e, t), r.callbacks.afterNodeAdded(e), r.callbacks.afterNodeRemoved(t), e;
    }
}
function $e(t, e, r) {
  let n = t.firstChild, s = e.firstChild, o;
  for (; n; ) {
    if (o = n, n = o.nextSibling, s == null) {
      if (r.callbacks.beforeNodeAdded(o) === !1)
        return;
      e.appendChild(o), r.callbacks.afterNodeAdded(o), A(r, o);
      continue;
    }
    if (Ie(o, s, r)) {
      q(s, o, r), s = s.nextSibling, A(r, o);
      continue;
    }
    let i = dt(t, e, o, s, r);
    if (i) {
      s = fe(s, i, r), q(i, o, r), A(r, o);
      continue;
    }
    let a = pt(t, o, s, r);
    if (a) {
      s = fe(s, a, r), q(a, o, r), A(r, o);
      continue;
    }
    if (r.callbacks.beforeNodeAdded(o) === !1)
      return;
    e.insertBefore(o, s), r.callbacks.afterNodeAdded(o), A(r, o);
  }
  for (; s !== null; ) {
    let i = s;
    s = s.nextSibling, De(i, r);
  }
}
function ut(t, e) {
  let r = t.nodeType;
  if (r === 1) {
    for (const n of t.attributes)
      e.getAttribute(n.name) !== n.value && e.setAttribute(n.name, n.value);
    for (const n of e.attributes)
      t.hasAttribute(n.name) || e.removeAttribute(n.name);
  }
  if ((r === Node.COMMENT_NODE || r === Node.TEXT_NODE) && e.nodeValue !== t.nodeValue && (e.nodeValue = t.nodeValue), t instanceof HTMLInputElement && e instanceof HTMLInputElement && t.type !== "file")
    e.value = t.value || "", V(t, e, "value"), V(t, e, "checked"), V(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    V(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const n = t.value, s = e.value;
    n !== s && (e.value = n), e.firstChild && e.firstChild.nodeValue !== n && (e.firstChild.nodeValue = n);
  }
}
function V(t, e, r) {
  const n = t.getAttribute(r), s = e.getAttribute(r);
  n !== s && (n ? e.setAttribute(r, n) : e.removeAttribute(r));
}
function xe(t, e, r) {
  const n = [], s = [], o = [], i = [], a = r.head.style, l = /* @__PURE__ */ new Map();
  for (const c of t.children)
    l.set(c.outerHTML, c);
  for (const c of e.children) {
    let u = l.has(c.outerHTML), _ = r.head.shouldReAppend(c), h = r.head.shouldPreserve(c);
    u || h ? _ ? s.push(c) : (l.delete(c.outerHTML), o.push(c)) : a === "append" ? _ && (s.push(c), i.push(c)) : r.head.shouldRemove(c) !== !1 && s.push(c);
  }
  i.push(...l.values()), console.log("to append: ", i);
  const m = [];
  for (const c of i) {
    console.log("adding: ", c);
    const u = document.createRange().createContextualFragment(c.outerHTML).firstChild;
    if (!u)
      throw new Error("could not create new element from: " + c.outerHTML);
    if (console.log(u), r.callbacks.beforeNodeAdded(u)) {
      if (u.hasAttribute("href") || u.hasAttribute("src")) {
        let _;
        const h = new Promise((g) => {
          _ = g;
        });
        u.addEventListener("load", function() {
          _(void 0);
        }), m.push(h);
      }
      e.appendChild(u), r.callbacks.afterNodeAdded(u), n.push(u);
    }
  }
  for (const c of s)
    r.callbacks.beforeNodeRemoved(c) !== !1 && (e.removeChild(c), r.callbacks.afterNodeRemoved(c));
  return r.head.afterHeadMorphed(e, {
    added: n,
    kept: o,
    removed: s
  }), m;
}
function S() {
}
function ft(t, e, r) {
  return {
    target: t,
    newContent: e,
    config: r,
    morphStyle: r.morphStyle,
    ignoreActive: r.ignoreActive,
    idMap: Et(t, e),
    deadIds: /* @__PURE__ */ new Set(),
    callbacks: Object.assign(
      {
        beforeNodeAdded: S,
        afterNodeAdded: S,
        beforeNodeMorphed: S,
        afterNodeMorphed: S,
        beforeNodeRemoved: S,
        afterNodeRemoved: S
      },
      r.callbacks
    ),
    head: Object.assign(
      {
        style: "merge",
        shouldPreserve: (n) => n.getAttribute("im-preserve") === "true",
        shouldReAppend: (n) => n.getAttribute("im-re-append") === "true",
        shouldRemove: S,
        afterHeadMorphed: S
      },
      r.head
    )
  };
}
function Ie(t, e, r) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : $(r, t, e) > 0 : !1;
}
function G(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function fe(t, e, r) {
  for (; t !== e; ) {
    const n = t;
    if (t = t?.nextSibling, !n)
      throw new Error("tempNode is null");
    De(n, r);
  }
  return A(r, e), e.nextSibling;
}
function dt(t, e, r, n, s) {
  const o = $(s, r, e);
  let i = null;
  if (o > 0) {
    i = n;
    let a = 0;
    for (; i != null; ) {
      if (Ie(r, i, s))
        return i;
      if (a += $(s, i, t), a > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function pt(t, e, r, n) {
  let s = r, o = e.nextSibling, i = 0;
  for (; s && o; ) {
    if ($(n, s, t) > 0)
      return null;
    if (G(e, s))
      return s;
    if (G(o, s) && (i++, o = o.nextSibling, i >= 2))
      return null;
    s = s.nextSibling;
  }
  return s;
}
const de = new DOMParser();
function ht(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const r = de.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return U.add(r), r;
    {
      let n = r.firstChild;
      return n ? (U.add(n), n) : null;
    }
  } else {
    const n = de.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!n)
      throw new Error("content is null");
    return U.add(n), n;
  }
}
function mt(t) {
  if (t == null)
    return document.createElement("div");
  if (U.has(t))
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
function gt(t, e, r) {
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
function vt(t, e, r) {
  let n = t.firstChild, s = n, o = 0;
  for (; n; ) {
    let i = _t(n, e, r);
    i > o && (s = n, o = i), n = n.nextSibling;
  }
  return s;
}
function _t(t, e, r) {
  return G(t, e) ? 0.5 + $(r, t, e) : 0;
}
function De(t, e) {
  A(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function bt(t, e) {
  return !t.deadIds.has(e);
}
function yt(t, e, r) {
  return t.idMap.get(r)?.has(e) || !1;
}
function A(t, e) {
  const r = t.idMap.get(e);
  if (r)
    for (const n of r)
      t.deadIds.add(n);
}
function $(t, e, r) {
  const n = t.idMap.get(e);
  if (!n)
    return 0;
  let s = 0;
  for (const o of n)
    bt(t, o) && yt(t, o, r) && ++s;
  return s;
}
function pe(t, e) {
  const r = t.parentElement, n = t.querySelectorAll("[id]");
  for (const s of n) {
    let o = s;
    for (; o !== r && o; ) {
      let i = e.get(o);
      i == null && (i = /* @__PURE__ */ new Set(), e.set(o, i)), i.add(s.id), o = o.parentElement;
    }
  }
}
function Et(t, e) {
  const r = /* @__PURE__ */ new Map();
  return pe(t, r), pe(e, r), r;
}
const wt = "get", St = "post", Tt = "put", At = "patch", Lt = "delete", Mt = [wt, St, Tt, At, Lt], Nt = Mt.reduce((t, e) => (t[e] = async (r) => Bt(e, r), t), {}), Pt = "Accept", kt = "Content-Type", Rt = "datastar-request", Ht = "application/json", Ot = "text/event-stream", Ct = "true", X = "datastar", Y = `${X}-indicator`, W = `${X}-request`, he = `${X}-settling`, me = `${X}-swapping`, $t = "self", b = {
  MorphElement: "morph_element",
  InnerElement: "inner_element",
  OuterElement: "outer_element",
  PrependElement: "prepend_element",
  AppendElement: "append_element",
  BeforeElement: "before_element",
  AfterElement: "after_element",
  DeleteElement: "delete_element",
  UpsertAttributes: "upsert_attributes"
}, xt = {
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
}, It = {
  prefix: "fetchUrl",
  description: "Sets the fetch url",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onGlobalInit: ({ mergeStore: t }) => {
    const e = document.createElement("style");
    e.innerHTML = `
.${Y}{
 opacity:0;
}
.${W} .${Y}{
 opacity:1;
 transition: opacity 300ms ease-in;
}
.${W}.${Y}{
 opacity:1;
 transition: opacity 300s ease-in;
}
`, document.head.appendChild(e), t({
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
}, Dt = {
  prefix: "sse",
  description: "Sets the value of the element",
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    if (typeof t.expressionFn(t) != "string")
      throw new Error("SSE url must be a string");
    return () => {
    };
  }
}, Ft = [xt, It, Dt], jt = /(?<key>\w*): (?<value>.*)/gm;
async function Bt(t, e) {
  const { el: r, store: n } = e, s = n.fetch.elementURLs[r.id];
  if (!s)
    throw new Error(`No signal for ${t}`);
  r.classList.add(W);
  const o = new URL(s.value, window.location.origin), i = new Headers();
  i.append(Pt, Ot), i.append(kt, Ht), i.append(Rt, Ct);
  const a = n.fetch.headers.value;
  if (a)
    for (const h in a) {
      const g = a[h];
      i.append(h, g);
    }
  const l = { ...n };
  delete l.fetch;
  const m = JSON.stringify(l);
  t = t.toUpperCase();
  const c = { method: t, headers: i };
  if (t === "GET") {
    const h = new URLSearchParams(o.search);
    h.append("datastar", m), o.search = h.toString();
  } else
    c.body = m;
  const u = await fetch(o, c);
  if (!u.ok) {
    if (!(u.status >= 300 && u.status < 400))
      throw new Error("Response was not ok and wasn't a redirect, can't merge.");
    let g = await u.text();
    g.startsWith("/") && (g = window.location.origin + g), console.log(`Redirecting to ${g}`), window.location.replace(g);
    return;
  }
  if (!u.body)
    throw new Error("No response body");
  const _ = u.body.pipeThrough(new TextDecoderStream()).getReader();
  for (; ; ) {
    const { done: h, value: g } = await _.read();
    if (h)
      break;
    g.split(`

`).forEach((I) => {
      console.log(I);
      const D = [...I.matchAll(jt)];
      if (D.length) {
        let F = "", j = "morph_element", N = "", P = 0;
        for (const f of D) {
          if (!f.groups)
            continue;
          const { key: E, value: v } = f.groups;
          switch (E) {
            case "event":
              if (v !== "datastar-fragment")
                throw new Error("datastar-fragment event not supported");
              break;
            case "data":
              switch (P) {
                case 0:
                  N = v;
                  break;
                case 1:
                  const k = v;
                  if (!Object.values(b).includes(k))
                    throw new Error(`Unknown merge option: ${v}`);
                  j = k;
                  break;
                case 2:
                  F = v;
                  break;
              }
              P++;
          }
        }
        Vt(e, N, j, F);
      }
    });
  }
  r.classList.remove(W);
}
const ge = document.createElement("template");
function Vt(t, e, r, n) {
  const { el: s } = t;
  ge.innerHTML = n;
  const o = ge.content.firstChild;
  if (!(o instanceof Element))
    throw new Error(`Fragment is not an element, source '${n}'`);
  const i = e === $t;
  let a;
  if (i)
    a = [s];
  else {
    const l = e || `#${o.getAttribute("id")}`;
    if (a = document.querySelectorAll(l) || [], !a)
      throw new Error(`No target elements, selector: ${e}`);
  }
  for (const l of a) {
    l.classList.add(me);
    const m = l.outerHTML;
    switch (r) {
      case b.MorphElement:
        ct(l, o);
        break;
      case b.InnerElement:
        l.innerHTML = o.innerHTML;
        break;
      case b.OuterElement:
        l.outerHTML = o.outerHTML;
        break;
      case b.PrependElement:
        l.prepend(o);
        break;
      case b.AppendElement:
        l.append(o);
        break;
      case b.BeforeElement:
        l.before(o);
        break;
      case b.AfterElement:
        l.after(o);
        break;
      case b.DeleteElement:
        l.remove();
        break;
      case b.UpsertAttributes:
        o.getAttributeNames().forEach((u) => {
          const _ = o.getAttribute(u);
          l.setAttribute(u, _);
        });
        break;
      default:
        throw new Error(`Unknown merge type: ${r}`);
    }
    t.applyPlugins(l), l.classList.remove(me);
    const c = l.outerHTML;
    m !== c && (l.classList.add(he), setTimeout(() => {
      l.classList.remove(he);
    }, 300));
  }
}
const Ut = {
  setAll: async (t, e, r) => {
    const n = new RegExp(e);
    Object.keys(t.store).filter((s) => n.test(s)).forEach((s) => {
      t.store[s].value = r;
    });
  }
}, Q = "display", ve = "none", ee = "important", qt = {
  prefix: "show",
  description: "Sets the display of the element",
  allowedModifiers: /* @__PURE__ */ new Set([ee]),
  onLoad: (t) => {
    const { el: e, modifiers: r, expressionFn: n } = t;
    return oe(() => {
      const o = !!n(t), a = r.has(ee) ? ee : void 0;
      o ? e.style.length === 1 && e.style.display === ve ? e.style.removeProperty(Q) : e.style.setProperty(Q, "", a) : e.style.setProperty(Q, ve, a);
    });
  }
}, Kt = "intersects", _e = "once", be = "half", ye = "full", Gt = {
  prefix: Kt,
  description: "Run expression when element intersects with viewport",
  allowedModifiers: /* @__PURE__ */ new Set([_e, be, ye]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, r = { threshold: 0 };
    e.has(ye) ? r.threshold = 1 : e.has(be) && (r.threshold = 0.5);
    const n = new IntersectionObserver((s) => {
      s.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(_e) && n.disconnect());
      });
    }, r);
    return n.observe(t.el), () => n.disconnect();
  }
}, Ee = "prepend", we = "append", Se = new Error("Target element must have a parent if using prepend or append"), Wt = {
  prefix: "teleport",
  description: "Teleports the element to another element",
  allowedModifiers: /* @__PURE__ */ new Set([Ee, we]),
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
    if (Te(o)?.firstElementChild)
      throw new Error("Empty template");
    if (r.has(Ee)) {
      if (!s.parentNode)
        throw Se;
      s.parentNode.insertBefore(o, s);
    } else if (r.has(we)) {
      if (!s.parentNode)
        throw Se;
      s.parentNode.insertBefore(o, s.nextSibling);
    } else
      s.appendChild(o);
  }
}, Jt = {
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
}, zt = [
  qt,
  Gt,
  Wt,
  Jt
];
function Zt(t = {}, ...e) {
  const r = performance.now(), n = new Qe(t, ...e);
  n.run();
  const s = performance.now();
  return console.log(`Datastar loaded and attached to all DOM elements in ${s - r}ms`), n;
}
function Xt(t = {}, ...e) {
  const r = Object.assign({}, Ut, Nt, t), n = [...Ft, ...zt, ...it, ...e];
  return Zt(r, ...n);
}
export {
  Qe as Datastar,
  Zt as runDatastarWith,
  Xt as runDatastarWithAllPlugins,
  Te as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
