function He(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function Y() {
  throw new Error("Cycle detected");
}
function ze() {
  throw new Error("Computed cannot have side-effects");
}
const Ze = Symbol.for("preact-signals"), T = 1, C = 2, F = 4, H = 8, O = 16, k = 32;
function Q() {
  D++;
}
function ee() {
  if (D > 1) {
    D--;
    return;
  }
  let t, e = !1;
  for (; x !== void 0; ) {
    let n = x;
    for (x = void 0, ie++; n !== void 0; ) {
      const r = n._nextBatchedEffect;
      if (n._nextBatchedEffect = void 0, n._flags &= ~C, !(n._flags & H) && xe(n))
        try {
          n._callback();
        } catch (s) {
          e || (t = s, e = !0);
        }
      n = r;
    }
  }
  if (ie = 0, D--, e)
    throw t;
}
function Xe(t) {
  if (D > 0)
    return t();
  Q();
  try {
    return t();
  } finally {
    ee();
  }
}
let p, x, D = 0, ie = 0, Z = 0;
function Ie(t) {
  if (p === void 0)
    return;
  let e = t._node;
  if (e === void 0 || e._target !== p)
    return e = {
      _version: 0,
      _source: t,
      _prevSource: p._sources,
      _nextSource: void 0,
      _target: p,
      _prevTarget: void 0,
      _nextTarget: void 0,
      _rollbackNode: e
    }, p._sources !== void 0 && (p._sources._nextSource = e), p._sources = e, t._node = e, p._flags & k && t._subscribe(e), e;
  if (e._version === -1)
    return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = p._sources, e._nextSource = void 0, p._sources._nextSource = e, p._sources = e), e;
}
function _(t) {
  this._value = t, this._version = 0, this._node = void 0, this._targets = void 0;
}
_.prototype.brand = Ze;
_.prototype._refresh = function() {
  return !0;
};
_.prototype._subscribe = function(t) {
  this._targets !== t && t._prevTarget === void 0 && (t._nextTarget = this._targets, this._targets !== void 0 && (this._targets._prevTarget = t), this._targets = t);
};
_.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0) {
    const e = t._prevTarget, n = t._nextTarget;
    e !== void 0 && (e._nextTarget = n, t._prevTarget = void 0), n !== void 0 && (n._prevTarget = e, t._nextTarget = void 0), t === this._targets && (this._targets = n);
  }
};
_.prototype.subscribe = function(t) {
  const e = this;
  return fe(function() {
    const n = e.value, r = this._flags & k;
    this._flags &= ~k;
    try {
      t(n);
    } finally {
      this._flags |= r;
    }
  });
};
_.prototype.valueOf = function() {
  return this.value;
};
_.prototype.toString = function() {
  return this.value + "";
};
_.prototype.toJSON = function() {
  return this.value;
};
_.prototype.peek = function() {
  return this._value;
};
Object.defineProperty(_.prototype, "value", {
  get() {
    const t = Ie(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (p instanceof A && ze(), t !== this._value) {
      ie > 100 && Y(), this._value = t, this._version++, Z++, Q();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        ee();
      }
    }
  }
});
function Oe(t) {
  return new _(t);
}
function xe(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    if (e._source._version !== e._version || !e._source._refresh() || e._source._version !== e._version)
      return !0;
  return !1;
}
function De(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource) {
    const n = e._source._node;
    if (n !== void 0 && (e._rollbackNode = n), e._source._node = e, e._version = -1, e._nextSource === void 0) {
      t._sources = e;
      break;
    }
  }
}
function Fe(t) {
  let e = t._sources, n;
  for (; e !== void 0; ) {
    const r = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), r !== void 0 && (r._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = r)) : n = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = r;
  }
  t._sources = n;
}
function A(t) {
  _.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = Z - 1, this._flags = F;
}
A.prototype = new _();
A.prototype._refresh = function() {
  if (this._flags &= ~C, this._flags & T)
    return !1;
  if ((this._flags & (F | k)) === k || (this._flags &= ~F, this._globalVersion === Z))
    return !0;
  if (this._globalVersion = Z, this._flags |= T, this._version > 0 && !xe(this))
    return this._flags &= ~T, !0;
  const t = p;
  try {
    De(this), p = this;
    const e = this._compute();
    (this._flags & O || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~O, this._version++);
  } catch (e) {
    this._value = e, this._flags |= O, this._version++;
  }
  return p = t, Fe(this), this._flags &= ~T, !0;
};
A.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= F | k;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  _.prototype._subscribe.call(this, t);
};
A.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (_.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~k;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
A.prototype._notify = function() {
  if (!(this._flags & C)) {
    this._flags |= F | C;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
A.prototype.peek = function() {
  if (this._refresh() || Y(), this._flags & O)
    throw this._value;
  return this._value;
};
Object.defineProperty(A.prototype, "value", {
  get() {
    this._flags & T && Y();
    const t = Ie(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & O)
      throw this._value;
    return this._value;
  }
});
function Ye(t) {
  return new A(t);
}
function Ue(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    Q();
    const n = p;
    p = void 0;
    try {
      e();
    } catch (r) {
      throw t._flags &= ~T, t._flags |= H, ue(t), r;
    } finally {
      p = n, ee();
    }
  }
}
function ue(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Ue(t);
}
function Qe(t) {
  if (p !== this)
    throw new Error("Out-of-order effect");
  Fe(this), p = t, this._flags &= ~T, this._flags & H && ue(this), ee();
}
function B(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = k;
}
B.prototype._callback = function() {
  const t = this._start();
  try {
    if (this._flags & H || this._compute === void 0)
      return;
    const e = this._compute();
    typeof e == "function" && (this._cleanup = e);
  } finally {
    t();
  }
};
B.prototype._start = function() {
  this._flags & T && Y(), this._flags |= T, this._flags &= ~H, Ue(this), De(this), Q();
  const t = p;
  return p = this, Qe.bind(this, t);
};
B.prototype._notify = function() {
  this._flags & C || (this._flags |= C, this._nextBatchedEffect = x, x = this);
};
B.prototype._dispose = function() {
  this._flags |= H, this._flags & T || ue(this);
};
function fe(t) {
  const e = new B(t);
  try {
    e._callback();
  } catch (n) {
    throw e._dispose(), n;
  }
  return e._dispose.bind(e);
}
class Ve {
  get value() {
    return le(this);
  }
  set value(e) {
    Xe(() => et(this, e));
  }
  peek() {
    return le(this, { peek: !0 });
  }
}
const ae = (t) => Object.assign(
  new Ve(),
  Object.entries(t).reduce(
    (e, [n, r]) => {
      if (["value", "peek"].some((s) => s === n))
        throw new Error(`${n} is a reserved property name`);
      return typeof r != "object" || r === null || Array.isArray(r) ? e[n] = Oe(r) : e[n] = ae(r), e;
    },
    {}
  )
), et = (t, e) => Object.keys(e).forEach((n) => t[n].value = e[n]), le = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (n, [r, s]) => (s instanceof _ ? n[r] = e ? s.peek() : s.value : s instanceof Ve && (n[r] = le(s, { peek: e })), n),
  {}
);
function je(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return JSON.parse(JSON.stringify(e));
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let n = t;
  return typeof t != "object" && (n = { ...e }), Object.keys(e).forEach((r) => {
    n.hasOwnProperty(r) || (n[r] = e[r]), e[r] === null ? delete n[r] : n[r] = je(n[r], e[r]);
  }), n;
}
const tt = "[a-zA-Z_$][0-9a-zA-Z_$]*";
function de(t, e, n) {
  return new RegExp(`(?<whole>\\${t}(?<${e}>${tt})${n})`, "g");
}
const nt = {
  name: "SignalProcessor",
  description: "Replacing $signal with ctx.store.signal.value",
  regexp: de("$", "signal", ""),
  replacer: (t) => {
    const { signal: e } = t;
    return `ctx.store.${e}.value`;
  }
}, rt = {
  name: "ActionProcessor",
  description: "Replacing $$action(args) with ctx.actions.action(ctx, args)",
  regexp: de("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => {
    const n = ["ctx"];
    e && n.push(...e.split(",").map((s) => s.trim()));
    const r = n.join(",");
    return `ctx.actions.${t}(${r})`;
  }
}, st = {
  name: "RefProcessor",
  description: "Replacing #foo with ctx.refs.foo",
  regexp: de("~", "ref", ""),
  replacer({ ref: t }) {
    return `data.refs.${t}`;
  }
}, ot = [rt, nt, st], it = {
  prefix: "mergeStore",
  description: "Setup the global store",
  onLoad: (t) => {
    const e = t.expressionFn(t);
    t.mergeStore(e);
  }
}, at = {
  prefix: "ref",
  description: "Sets the value of the element",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  bypassExpressionFunctionCreation: () => !0,
  preprocessors: /* @__PURE__ */ new Set([]),
  onLoad: (t) => {
    const { el: e, expression: n } = t;
    return t.refs[n] = e, () => delete t.refs[n];
  }
}, lt = [it, at];
class ct {
  plugins = [];
  store = ae({});
  actions = {};
  refs = {};
  reactivity = {
    signal: Oe,
    computed: Ye,
    effect: fe
  };
  parentID = "";
  missingIDNext = 0;
  removals = /* @__PURE__ */ new Map();
  constructor(e = {}, ...n) {
    if (this.actions = Object.assign(this.actions, e), n = [...lt, ...n], !n.length)
      throw new Error("No plugins provided");
    const r = /* @__PURE__ */ new Set();
    for (const s of n) {
      if (s.requiredPluginPrefixes) {
        for (const o of s.requiredPluginPrefixes)
          if (!r.has(o))
            throw new Error(`Plugin ${s.prefix} requires plugin ${o}`);
      }
      this.plugins.push(s), r.add(s.prefix);
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
    const n = this.removals.get(e);
    if (n) {
      for (const r of n)
        r();
      this.removals.delete(e);
    }
  }
  mergeStore(e) {
    const n = je(this.store.value, e);
    this.store = ae(n);
  }
  signalByName(e) {
    return this.store[e];
  }
  applyPlugins(e) {
    const n = /* @__PURE__ */ new Set();
    this.plugins.forEach((r, s) => {
      this.walkDownDOM(e, (o) => {
        s === 0 && this.cleanupElementRemovals(o);
        for (const i in o.dataset) {
          let a = o.dataset[i] || "";
          if (!i.startsWith(r.prefix))
            continue;
          if (o.id.length === 0 && (o.id = `ds-${this.parentID}-${this.missingIDNext++}`), n.clear(), r.allowedTagRegexps) {
            const d = o.tagName.toLowerCase();
            if (![...r.allowedTagRegexps].some((v) => d.match(v)))
              throw new Error(
                `Tag '${o.tagName}' is not allowed for plugin '${i}', allowed tags are: ${[
                  [...r.allowedTagRegexps].map((v) => `'${v}'`)
                ].join(", ")}`
              );
          }
          let f = i.slice(r.prefix.length), [u, ...c] = f.split(".");
          if (r.mustHaveEmptyKey && u.length > 0)
            throw new Error(`Attribute '${i}' must have empty key`);
          if (r.mustNotEmptyKey && u.length === 0)
            throw new Error(`Attribute '${i}' must have non-empty key`);
          u.length && (u = u[0].toLowerCase() + u.slice(1));
          const l = c.map((d) => {
            const [b, ...v] = d.split("_");
            return { label: b, args: v };
          });
          if (r.allowedModifiers) {
            for (const d of l)
              if (!r.allowedModifiers.has(d.label))
                throw new Error(`Modifier '${d.label}' is not allowed`);
          }
          const y = /* @__PURE__ */ new Map();
          for (const d of l)
            y.set(d.label, d.args);
          if (r.mustHaveEmptyExpression && a.length)
            throw new Error(`Attribute '${i}' must have empty expression`);
          if (r.mustNotEmptyExpression && !a.length)
            throw new Error(`Attribute '${i}' must have non-empty expression`);
          const w = [...ot, ...r.preprocessors || []];
          for (const d of w) {
            if (n.has(d))
              continue;
            n.add(d);
            const b = [...a.matchAll(d.regexp)];
            if (b.length)
              for (const v of b) {
                if (!v.groups)
                  continue;
                const { groups: I } = v, { whole: q } = I;
                a = a.replace(q, d.replacer(I));
              }
          }
          const { store: m, reactivity: g, actions: h, refs: L } = this, E = {
            store: m,
            mergeStore: this.mergeStore.bind(this),
            applyPlugins: this.applyPlugins.bind(this),
            cleanupElementRemovals: this.cleanupElementRemovals.bind(this),
            actions: h,
            refs: L,
            reactivity: g,
            el: o,
            key: u,
            expression: a,
            expressionFn: () => {
              throw new Error("Expression function not created");
            },
            modifiers: y
          };
          if (!r.bypassExpressionFunctionCreation?.(E) && !r.mustHaveEmptyExpression && a.length) {
            const d = a.split(";");
            d[d.length - 1] = `return ${d[d.length - 1]}`;
            const b = d.join(";");
            try {
              const v = new Function("ctx", b);
              E.expressionFn = v;
            } catch (v) {
              console.error(v), console.error(`Error evaluating expression '${b}' on ${o.id ? `#${o.id}` : o.tagName}`);
              return;
            }
          }
          const P = r.onLoad(E);
          P && (this.removals.has(o) || this.removals.set(o, /* @__PURE__ */ new Set()), this.removals.get(o).add(P));
        }
      });
    });
  }
  walkDownDOM(e, n, r = 0) {
    if (!e)
      return;
    const s = He(e);
    if (s)
      for (n(s), r = 0, e = e.firstElementChild; e; )
        this.walkDownDOM(e, n, r++), e = e.nextElementSibling;
  }
}
const ut = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, n) => (n ? "-" : "") + e.toLowerCase()), ft = {
  prefix: "bind",
  description: "Sets the value of the element",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(() => {
    const e = ut(t.key), r = `${t.expressionFn(t)}`;
    !r || r === "false" || r === "null" || r === "undefined" ? t.el.removeAttribute(e) : t.el.setAttribute(e, r);
  })
}, dt = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/, _e = ["change", "input", "keydown"], pt = {
  prefix: "model",
  description: "Sets the value of the element",
  mustHaveEmptyKey: !0,
  allowedTagRegexps: /* @__PURE__ */ new Set(["input", "textarea", "select", "checkbox"]),
  bypassExpressionFunctionCreation: () => !0,
  onLoad: (t) => {
    const { store: e, el: n, expression: r } = t, s = e[r], o = n.tagName.toLowerCase().includes("input"), i = n.tagName.toLowerCase().includes("select"), a = n.tagName.toLowerCase().includes("textarea"), f = n.getAttribute("type"), u = o && f === "checkbox", c = o && f === "file";
    if (!o && !i && !a)
      throw new Error("Element must be input, select or textarea");
    const l = () => {
      const m = s.value;
      if (!s)
        throw new Error(`Signal ${r} not found`);
      if (u) {
        const g = n;
        g.checked = m;
      } else
        c || n.setAttribute("value", `${s.value}`);
    }, y = t.reactivity.effect(l), w = () => {
      const m = n.value;
      if (!(typeof m > "u"))
        if (c) {
          const [g] = n?.files || [];
          if (!g) {
            s.value = "";
            return;
          }
          const h = new FileReader();
          h.onload = () => {
            if (typeof h.result != "string")
              throw new Error("Unsupported type");
            const E = h.result.match(dt);
            if (!E?.groups)
              throw new Error("Invalid data URI");
            const { mime: P, contents: d } = E.groups;
            s.value = d;
            const b = `${r}Mime`;
            if (b in e) {
              const v = e[`${b}`];
              v.value = P;
            }
          }, h.readAsDataURL(g);
          const L = `${r}Name`;
          if (L in e) {
            const E = e[`${L}`];
            E.value = g.name;
          }
          return;
        } else {
          const g = s.value;
          if (typeof g == "number")
            s.value = Number(m);
          else if (typeof g == "string")
            s.value = m;
          else if (typeof g == "boolean")
            if (u) {
              const { checked: h } = n;
              s.value = h;
            } else
              s.value = !!m;
          else if (!(typeof g > "u"))
            throw console.log(typeof g), new Error("Unsupported type");
        }
    };
    return _e.forEach((m) => {
      n.addEventListener(m, w);
    }), () => {
      y(), _e.forEach((m) => {
        n.removeEventListener(m, w);
      });
    };
  }
}, ht = {
  prefix: "text",
  description: "Sets the textContent of the element",
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { el: e, expressionFn: n } = t;
    if (!(e instanceof HTMLElement))
      throw new Error("Element is not HTMLElement");
    return t.reactivity.effect(() => {
      e.textContent = `${n(t)}`;
    });
  }
}, mt = {
  prefix: "on",
  description: "Sets the event listener of the element",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  allowedModifiers: /* @__PURE__ */ new Set(["once", "passive", "capture", "debounce", "throttle"]),
  onLoad: (t) => {
    const { el: e, key: n, expressionFn: r } = t;
    let s = () => {
      r(t);
    };
    const o = t.modifiers.get("debounce");
    if (o) {
      const u = ye(o), c = G(o, "leading", !1), l = G(o, "noTrail", !0);
      s = _t(s, u, c, l);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const u = ye(i), c = G(i, "noLead", !0), l = G(i, "noTrail", !0);
      s = yt(s, u, c, l);
    }
    const a = {
      capture: !0,
      passive: !1,
      once: !1
    };
    if (t.modifiers.has("capture") || (a.capture = !1), t.modifiers.has("passive") && (a.passive = !0), t.modifiers.has("once") && (a.once = !0), n === "load")
      return s(), () => {
      };
    const f = n.toLowerCase();
    return e.addEventListener(f, s, a), () => {
      e.removeEventListener(f, s);
    };
  }
}, gt = {
  prefix: "focus",
  description: "Sets the focus of the element",
  mustHaveEmptyKey: !0,
  mustHaveEmptyExpression: !0,
  onLoad: (t) => (t.el.tabIndex || t.el.setAttribute("tabindex", "0"), t.el.focus(), t.el.scrollIntoView({ block: "center", inline: "center" }), () => t.el.blur())
}, vt = [
  ft,
  pt,
  ht,
  gt,
  // PromptPlugin,
  mt
];
function ye(t) {
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
function G(t, e, n = !1) {
  return t ? t.includes(e) || n : !1;
}
function _t(t, e, n = !1, r = !0) {
  let s;
  const o = () => s && clearTimeout(s);
  return function(...a) {
    o(), n && !s && t(...a), s = setTimeout(() => {
      r && t(...a), o();
    }, e);
  };
}
function yt(t, e, n = !0, r = !1) {
  let s = !1, o = null;
  return function(...a) {
    s ? o = a : (s = !0, n ? t(...a) : o = a, setTimeout(() => {
      r && o && (t(...o), o = null), s = !1;
    }, e));
  };
}
const J = /* @__PURE__ */ new WeakSet();
function wt(t, e, n = {}) {
  t instanceof Document && (t = t.documentElement);
  let r;
  typeof e == "string" ? r = At(e) : r = e;
  const s = Lt(r), o = Et(t, s, n);
  return Be(t, s, o);
}
function Be(t, e, n) {
  if (n.head.block) {
    const r = t.querySelector("head"), s = e.querySelector("head");
    if (r && s) {
      const o = Ge(s, r, n);
      Promise.all(o).then(() => {
        Be(
          t,
          e,
          Object.assign(n, {
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
  if (n.morphStyle === "innerHTML")
    return qe(e, t, n), t.children;
  if (n.morphStyle === "outerHTML" || n.morphStyle == null) {
    const r = Nt(e, t, n);
    if (!r)
      throw new Error("Could not find best match");
    const s = r?.previousSibling, o = r?.nextSibling, i = z(t, r, n);
    return r ? Mt(s, i, o) : [];
  } else
    throw "Do not understand how to morph style " + n.morphStyle;
}
function z(t, e, n) {
  if (!(n.ignoreActive && t === document.activeElement))
    if (e == null) {
      if (n.callbacks.beforeNodeRemoved(t) === !1)
        return;
      t.remove(), n.callbacks.afterNodeRemoved(t);
      return;
    } else {
      if (X(t, e))
        return n.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && n.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && n.head.style !== "morph" ? Ge(e, t, n) : (bt(e, t), qe(e, t, n))), n.callbacks.afterNodeMorphed(t, e), t);
      if (n.callbacks.beforeNodeRemoved(t) === !1 || n.callbacks.beforeNodeAdded(e) === !1)
        return;
      if (!t.parentElement)
        throw new Error("oldNode has no parentElement");
      return t.parentElement.replaceChild(e, t), n.callbacks.afterNodeAdded(e), n.callbacks.afterNodeRemoved(t), e;
    }
}
function qe(t, e, n) {
  let r = t.firstChild, s = e.firstChild, o;
  for (; r; ) {
    if (o = r, r = o.nextSibling, s == null) {
      if (n.callbacks.beforeNodeAdded(o) === !1)
        return;
      e.appendChild(o), n.callbacks.afterNodeAdded(o), R(n, o);
      continue;
    }
    if (Ke(o, s, n)) {
      z(s, o, n), s = s.nextSibling, R(n, o);
      continue;
    }
    let i = St(t, e, o, s, n);
    if (i) {
      s = we(s, i, n), z(i, o, n), R(n, o);
      continue;
    }
    let a = Tt(t, o, s, n);
    if (a) {
      s = we(s, a, n), z(a, o, n), R(n, o);
      continue;
    }
    if (n.callbacks.beforeNodeAdded(o) === !1)
      return;
    e.insertBefore(o, s), n.callbacks.afterNodeAdded(o), R(n, o);
  }
  for (; s !== null; ) {
    let i = s;
    s = s.nextSibling, We(i, n);
  }
}
function bt(t, e) {
  let n = t.nodeType;
  if (n === 1) {
    for (const r of t.attributes)
      e.getAttribute(r.name) !== r.value && e.setAttribute(r.name, r.value);
    for (const r of e.attributes)
      t.hasAttribute(r.name) || e.removeAttribute(r.name);
  }
  if ((n === Node.COMMENT_NODE || n === Node.TEXT_NODE) && e.nodeValue !== t.nodeValue && (e.nodeValue = t.nodeValue), t instanceof HTMLInputElement && e instanceof HTMLInputElement && t.type !== "file")
    e.value = t.value || "", K(t, e, "value"), K(t, e, "checked"), K(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    K(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const r = t.value, s = e.value;
    r !== s && (e.value = r), e.firstChild && e.firstChild.nodeValue !== r && (e.firstChild.nodeValue = r);
  }
}
function K(t, e, n) {
  const r = t.getAttribute(n), s = e.getAttribute(n);
  r !== s && (r ? e.setAttribute(n, r) : e.removeAttribute(n));
}
function Ge(t, e, n) {
  const r = [], s = [], o = [], i = [], a = n.head.style, f = /* @__PURE__ */ new Map();
  for (const c of t.children)
    f.set(c.outerHTML, c);
  for (const c of e.children) {
    let l = f.has(c.outerHTML), y = n.head.shouldReAppend(c), w = n.head.shouldPreserve(c);
    l || w ? y ? s.push(c) : (f.delete(c.outerHTML), o.push(c)) : a === "append" ? y && (s.push(c), i.push(c)) : n.head.shouldRemove(c) !== !1 && s.push(c);
  }
  i.push(...f.values()), console.log("to append: ", i);
  const u = [];
  for (const c of i) {
    console.log("adding: ", c);
    const l = document.createRange().createContextualFragment(c.outerHTML).firstChild;
    if (!l)
      throw new Error("could not create new element from: " + c.outerHTML);
    if (console.log(l), n.callbacks.beforeNodeAdded(l)) {
      if (l.hasAttribute("href") || l.hasAttribute("src")) {
        let y;
        const w = new Promise((m) => {
          y = m;
        });
        l.addEventListener("load", function() {
          y(void 0);
        }), u.push(w);
      }
      e.appendChild(l), n.callbacks.afterNodeAdded(l), r.push(l);
    }
  }
  for (const c of s)
    n.callbacks.beforeNodeRemoved(c) !== !1 && (e.removeChild(c), n.callbacks.afterNodeRemoved(c));
  return n.head.afterHeadMorphed(e, {
    added: r,
    kept: o,
    removed: s
  }), u;
}
function N() {
}
function Et(t, e, n) {
  return {
    target: t,
    newContent: e,
    config: n,
    morphStyle: n.morphStyle,
    ignoreActive: n.ignoreActive,
    idMap: $t(t, e),
    deadIds: /* @__PURE__ */ new Set(),
    callbacks: Object.assign(
      {
        beforeNodeAdded: N,
        afterNodeAdded: N,
        beforeNodeMorphed: N,
        afterNodeMorphed: N,
        beforeNodeRemoved: N,
        afterNodeRemoved: N
      },
      n.callbacks
    ),
    head: Object.assign(
      {
        style: "merge",
        shouldPreserve: (r) => r.getAttribute("im-preserve") === "true",
        shouldReAppend: (r) => r.getAttribute("im-re-append") === "true",
        shouldRemove: N,
        afterHeadMorphed: N
      },
      n.head
    )
  };
}
function Ke(t, e, n) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : U(n, t, e) > 0 : !1;
}
function X(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function we(t, e, n) {
  for (; t !== e; ) {
    const r = t;
    if (t = t?.nextSibling, !r)
      throw new Error("tempNode is null");
    We(r, n);
  }
  return R(n, e), e.nextSibling;
}
function St(t, e, n, r, s) {
  const o = U(s, n, e);
  let i = null;
  if (o > 0) {
    i = r;
    let a = 0;
    for (; i != null; ) {
      if (Ke(n, i, s))
        return i;
      if (a += U(s, i, t), a > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function Tt(t, e, n, r) {
  let s = n, o = e.nextSibling, i = 0;
  for (; s && o; ) {
    if (U(r, s, t) > 0)
      return null;
    if (X(e, s))
      return s;
    if (X(o, s) && (i++, o = o.nextSibling, i >= 2))
      return null;
    s = s.nextSibling;
  }
  return s;
}
const be = new DOMParser();
function At(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const n = be.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return J.add(n), n;
    {
      let r = n.firstChild;
      return r ? (J.add(r), r) : null;
    }
  } else {
    const r = be.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!r)
      throw new Error("content is null");
    return J.add(r), r;
  }
}
function Lt(t) {
  if (t == null)
    return document.createElement("div");
  if (J.has(t))
    return t;
  if (t instanceof Node) {
    const e = document.createElement("div");
    return e.append(t), e;
  } else {
    const e = document.createElement("div");
    for (const n of [...t])
      e.append(n);
    return e;
  }
}
function Mt(t, e, n) {
  const r = [], s = [];
  for (; t; )
    r.push(t), t = t.previousSibling;
  for (; r.length > 0; ) {
    const o = r.pop();
    s.push(o), e?.parentElement?.insertBefore(o, e);
  }
  for (s.push(e); n; )
    r.push(n), s.push(n), n = n.nextSibling;
  for (; r.length; )
    e?.parentElement?.insertBefore(r.pop(), e.nextSibling);
  return s;
}
function Nt(t, e, n) {
  let r = t.firstChild, s = r, o = 0;
  for (; r; ) {
    let i = kt(r, e, n);
    i > o && (s = r, o = i), r = r.nextSibling;
  }
  return s;
}
function kt(t, e, n) {
  return X(t, e) ? 0.5 + U(n, t, e) : 0;
}
function We(t, e) {
  R(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function Pt(t, e) {
  return !t.deadIds.has(e);
}
function Rt(t, e, n) {
  return t.idMap.get(n)?.has(e) || !1;
}
function R(t, e) {
  const n = t.idMap.get(e);
  if (n)
    for (const r of n)
      t.deadIds.add(r);
}
function U(t, e, n) {
  const r = t.idMap.get(e);
  if (!r)
    return 0;
  let s = 0;
  for (const o of r)
    Pt(t, o) && Rt(t, o, n) && ++s;
  return s;
}
function Ee(t, e) {
  const n = t.parentElement, r = t.querySelectorAll("[id]");
  for (const s of r) {
    let o = s;
    for (; o !== n && o; ) {
      let i = e.get(o);
      i == null && (i = /* @__PURE__ */ new Set(), e.set(o, i)), i.add(s.id), o = o.parentElement;
    }
  }
}
function $t(t, e) {
  const n = /* @__PURE__ */ new Map();
  return Ee(t, n), Ee(e, n), n;
}
const Ct = "get", Ht = "post", It = "put", Ot = "patch", xt = "delete", Dt = [Ct, Ht, It, Ot, xt], Ft = Dt.reduce((t, e) => (t[e] = async (n) => {
  const r = Document;
  if (!r.startViewTransition) {
    await Te(e, n);
    return;
  }
  return new Promise((s) => {
    r.startViewTransition(async () => {
      await Te(e, n), s();
    });
  });
}, t), {}), Ut = "Accept", Vt = "Content-Type", jt = "datastar-request", Bt = "application/json", qt = "text/event-stream", Gt = "true", V = "datastar-", j = `${V}indicator`, ce = `${j}-loading`, Se = `${V}settling`, W = `${V}swapping`, Kt = "self", S = {
  MorphElement: "morph_element",
  InnerElement: "inner_element",
  OuterElement: "outer_element",
  PrependElement: "prepend_element",
  AppendElement: "append_element",
  BeforeElement: "before_element",
  AfterElement: "after_element",
  DeleteElement: "delete_element",
  UpsertAttributes: "upsert_attributes"
}, Wt = {
  prefix: "header",
  description: "Sets the header of the fetch request",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => {
    const e = t.store.fetch.headers, n = t.key[0].toUpperCase() + t.key.slice(1);
    return e[n] = t.reactivity.computed(() => t.expressionFn(t)), () => {
      delete e[n];
    };
  }
}, Jt = {
  prefix: "fetchUrl",
  description: "Sets the fetch url",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onGlobalInit: ({ mergeStore: t }) => {
    t({
      fetch: {
        headers: {},
        elementURLs: {},
        indicatorSelectors: {}
      }
    });
  },
  onLoad: (t) => t.reactivity.effect(() => {
    const e = t.reactivity.computed(() => `${t.expressionFn(t)}`);
    return t.store.fetch.elementURLs[t.el.id] = e, () => {
      delete t.store.fetch.elementURLs[t.el.id];
    };
  })
}, zt = {
  prefix: "fetchIndicator",
  description: "Sets the fetch indicator selector",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onGlobalInit: () => {
    const t = document.createElement("style");
    t.innerHTML = `
.${j}{
 opacity:0;
 transition: opacity 300ms ease-out;
}
.${ce} {
 opacity:1;
 transition: opacity 300ms ease-in;
}
`, document.head.appendChild(t);
  },
  onLoad: (t) => t.reactivity.effect(() => {
    const e = t.reactivity.computed(() => `${t.expressionFn(t)}`);
    t.store.fetch.indicatorSelectors[t.el.id] = e;
    const n = document.querySelector(e.value);
    if (!n)
      throw new Error(`No indicator found for ${e.value}`);
    return n.classList.add(j), () => {
      delete t.store.fetch.indicatorSelectors[t.el.id];
    };
  })
}, Zt = [Wt, Jt, zt], Xt = /(?<key>\w*): (?<value>.*)/gm;
async function Te(t, e) {
  const { el: n, store: r } = e, s = r.fetch.elementURLs[n.id];
  if (!s)
    return;
  let o = n, i = !1;
  const a = r.fetch.indicatorSelectors[n.id];
  if (a) {
    const h = document.querySelector(a);
    h && (o = h, o.classList.remove(j), o.classList.add(ce), i = !0);
  }
  const f = new URL(s.value, window.location.origin), u = new Headers();
  u.append(Ut, qt), u.append(Vt, Bt), u.append(jt, Gt);
  const c = r.fetch.headers.value;
  if (c)
    for (const h in c) {
      const L = c[h];
      u.append(h, L);
    }
  const l = { ...r };
  delete l.fetch;
  const y = JSON.stringify(l);
  t = t.toUpperCase();
  const w = { method: t, headers: u };
  if (t === "GET") {
    const h = new URLSearchParams(f.search);
    h.append("datastar", y), f.search = h.toString();
  } else
    w.body = y;
  const m = await fetch(f, w);
  if (!m.ok)
    throw new Error(`Response was not ok, url: ${f}, status: ${m.status}`);
  if (!m.body)
    throw new Error("No response body");
  const g = m.body.pipeThrough(new TextDecoderStream()).getReader();
  for (; ; ) {
    const { done: h, value: L } = await g.read();
    if (h)
      break;
    L.split(`

`).forEach((E) => {
      const P = [...E.matchAll(Xt)];
      if (P.length) {
        let d = "", b = "morph_element", v = "", I = 0, q = !1, te = "", ne, pe = !1, he = !1;
        for (const me of P) {
          if (!me.groups)
            continue;
          const { key: Je, value: M } = me.groups;
          switch (Je) {
            case "event":
              if (!M.startsWith(V))
                throw new Error(`Unknown event: ${M}`);
              switch (M.slice(V.length)) {
                case "redirect":
                  q = !0;
                  break;
                case "fragment":
                  he = !0;
                  break;
                case "error":
                  pe = !0;
                  break;
                default:
                  throw new Error(`Unknown event: ${M}`);
              }
              break;
            case "data":
              const re = M.indexOf(" ");
              if (re === -1)
                throw new Error("Missing space in data");
              const ge = M.slice(0, re), $ = M.slice(re + 1);
              switch (ge) {
                case "selector":
                  v = $;
                  break;
                case "merge":
                  const ve = $;
                  if (!Object.values(S).includes(ve))
                    throw new Error(`Unknown merge option: ${M}`);
                  b = ve;
                  break;
                case "settle":
                  I = parseInt($);
                  break;
                case "fragment":
                case "html":
                  d = $;
                  break;
                case "redirect":
                  te = $;
                  break;
                case "error":
                  ne = new Error($);
                  break;
                default:
                  throw new Error(`Unknown data type: ${ge}`);
              }
          }
        }
        if (pe && ne)
          throw ne;
        if (q && te)
          window.location.href = te;
        else if (he && d)
          Yt(e, v, b, d, I);
        else
          throw new Error(`Unknown event block: ${E}`);
      }
    });
  }
  i && (o.classList.remove(ce), o.classList.add(j));
}
const Ae = document.createElement("template");
function Yt(t, e, n, r, s) {
  const { el: o } = t;
  Ae.innerHTML = r;
  const i = Ae.content.firstChild;
  if (!(i instanceof Element))
    throw new Error(`Fragment is not an element, source '${r}'`);
  const a = e === Kt;
  let f;
  if (a)
    f = [o];
  else {
    const u = e || `#${i.getAttribute("id")}`;
    if (f = document.querySelectorAll(u) || [], !f)
      throw new Error(`No target elements, selector: ${e}`);
  }
  for (const u of f) {
    u.classList.add(W);
    const c = u.outerHTML;
    let l = u;
    switch (n) {
      case S.MorphElement:
        const w = wt(l, i);
        if (!w?.length)
          throw new Error("Failed to morph element");
        l = w[0];
        break;
      case S.InnerElement:
        l.innerHTML = i.innerHTML;
        break;
      case S.OuterElement:
        l.replaceWith(i);
        break;
      case S.PrependElement:
        l.prepend(i);
        break;
      case S.AppendElement:
        l.append(i);
        break;
      case S.BeforeElement:
        l.before(i);
        break;
      case S.AfterElement:
        l.after(i);
        break;
      case S.DeleteElement:
        setTimeout(() => l.remove(), s);
        break;
      case S.UpsertAttributes:
        i.getAttributeNames().forEach((g) => {
          const h = i.getAttribute(g);
          l.setAttribute(g, h);
        });
        break;
      default:
        throw new Error(`Unknown merge type: ${n}`);
    }
    l.classList.add(W), t.cleanupElementRemovals(u), t.applyPlugins(l), u.classList.remove(W), l.classList.remove(W);
    const y = l.outerHTML;
    c !== y && (l.classList.add(Se), setTimeout(() => {
      l.classList.remove(Se);
    }, s));
  }
}
const Qt = {
  setAll: async (t, e, n) => {
    const r = new RegExp(e);
    Object.keys(t.store).filter((s) => r.test(s)).forEach((s) => {
      t.store[s].value = n;
    });
  },
  toggleAll: async (t, e) => {
    const n = new RegExp(e);
    Object.keys(t.store).filter((r) => n.test(r)).forEach((r) => {
      t.store[r].value = !t.store[r].value;
    });
  }
}, se = "display", Le = "none", oe = "important", en = {
  prefix: "show",
  description: "Sets the display of the element",
  allowedModifiers: /* @__PURE__ */ new Set([oe]),
  onLoad: (t) => {
    const { el: e, modifiers: n, expressionFn: r } = t;
    return fe(() => {
      const o = !!r(t), a = n.has(oe) ? oe : void 0;
      o ? e.style.length === 1 && e.style.display === Le ? e.style.removeProperty(se) : e.style.setProperty(se, "", a) : e.style.setProperty(se, Le, a);
    });
  }
}, tn = "intersects", Me = "once", Ne = "half", ke = "full", nn = {
  prefix: tn,
  description: "Run expression when element intersects with viewport",
  allowedModifiers: /* @__PURE__ */ new Set([Me, Ne, ke]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, n = { threshold: 0 };
    e.has(ke) ? n.threshold = 1 : e.has(Ne) && (n.threshold = 0.5);
    const r = new IntersectionObserver((s) => {
      s.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(Me) && r.disconnect());
      });
    }, n);
    return r.observe(t.el), () => r.disconnect();
  }
}, Pe = "prepend", Re = "append", $e = new Error("Target element must have a parent if using prepend or append"), rn = {
  prefix: "teleport",
  description: "Teleports the element to another element",
  allowedModifiers: /* @__PURE__ */ new Set([Pe, Re]),
  allowedTagRegexps: /* @__PURE__ */ new Set(["template"]),
  bypassExpressionFunctionCreation: () => !0,
  onLoad: (t) => {
    const { el: e, modifiers: n, expression: r } = t;
    if (!(e instanceof HTMLTemplateElement))
      throw new Error();
    const s = document.querySelector(r);
    if (!s)
      throw new Error(`Target element not found: ${r}`);
    if (!e.content)
      throw new Error("Template element must have content");
    const o = e.content.cloneNode(!0);
    if (He(o)?.firstElementChild)
      throw new Error("Empty template");
    if (n.has(Pe)) {
      if (!s.parentNode)
        throw $e;
      s.parentNode.insertBefore(o, s);
    } else if (n.has(Re)) {
      if (!s.parentNode)
        throw $e;
      s.parentNode.insertBefore(o, s.nextSibling);
    } else
      s.appendChild(o);
  }
}, sn = {
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
}, Ce = "ds-view-transition-stylesheet", on = {
  prefix: "viewTransition",
  description: "Setup view transition api",
  onGlobalInit(t) {
    const e = document.createElement("style");
    e.id = Ce, document.head.appendChild(e);
    let n = !1;
    if (document.head.childNodes.forEach((r) => {
      r instanceof HTMLMetaElement && r.name === "view-transition" && (n = !0);
    }), !n) {
      const r = document.createElement("meta");
      r.name = "view-transition", r.content = "same-origin", document.head.appendChild(r);
    }
    t.mergeStore({
      viewTransitions: {}
    });
  },
  onLoad: (t) => {
    const { el: e, expressionFn: n, store: r } = t;
    let s = n(t);
    if (!s) {
      if (!e.id)
        throw new Error("Element must have an id if no name is provided");
      s = e.id;
    }
    const o = document.getElementById(Ce);
    if (!o)
      throw new Error("View transition stylesheet not found");
    const i = `ds-vt-${s}`, a = `
.${i} {
  view-transition: ${s};
}

`;
    o.innerHTML += a;
    let f = r.viewTransitions[s];
    return f || (f = t.reactivity.signal(0), r.viewTransitions[s] = f), f.value++, e.classList.add(i), () => {
      f.value--, f.value === 0 && (delete r.viewTransitions[s], o.innerHTML = o.innerHTML.replace(a, ""));
    };
  }
}, an = [
  en,
  nn,
  rn,
  sn,
  on
];
function ln(t = {}, ...e) {
  const n = performance.now(), r = new ct(t, ...e);
  r.run();
  const s = performance.now();
  return console.log(`Datastar loaded and attached to all DOM elements in ${s - n}ms`), r;
}
function fn(t = {}, ...e) {
  const n = Object.assign({}, Qt, Ft, t), r = [...Zt, ...an, ...vt, ...e];
  return ln(n, ...r);
}
export {
  ct as Datastar,
  ln as runDatastarWith,
  fn as runDatastarWithAllPlugins,
  He as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
