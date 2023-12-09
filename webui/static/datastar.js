function He(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function ee() {
  throw new Error("Cycle detected");
}
function ze() {
  throw new Error("Computed cannot have side-effects");
}
const Ze = Symbol.for("preact-signals"), A = 1, x = 2, V = 4, I = 8, D = 16, P = 32;
function te() {
  U++;
}
function ne() {
  if (U > 1) {
    U--;
    return;
  }
  let t, e = !1;
  for (; F !== void 0; ) {
    let n = F;
    for (F = void 0, ae++; n !== void 0; ) {
      const r = n._nextBatchedEffect;
      if (n._nextBatchedEffect = void 0, n._flags &= ~x, !(n._flags & I) && Oe(n))
        try {
          n._callback();
        } catch (s) {
          e || (t = s, e = !0);
        }
      n = r;
    }
  }
  if (ae = 0, U--, e)
    throw t;
}
function Xe(t) {
  if (U > 0)
    return t();
  te();
  try {
    return t();
  } finally {
    ne();
  }
}
let p, F, U = 0, ae = 0, Y = 0;
function xe(t) {
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
    }, p._sources !== void 0 && (p._sources._nextSource = e), p._sources = e, t._node = e, p._flags & P && t._subscribe(e), e;
  if (e._version === -1)
    return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = p._sources, e._nextSource = void 0, p._sources._nextSource = e, p._sources = e), e;
}
function v(t) {
  this._value = t, this._version = 0, this._node = void 0, this._targets = void 0;
}
v.prototype.brand = Ze;
v.prototype._refresh = function() {
  return !0;
};
v.prototype._subscribe = function(t) {
  this._targets !== t && t._prevTarget === void 0 && (t._nextTarget = this._targets, this._targets !== void 0 && (this._targets._prevTarget = t), this._targets = t);
};
v.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0) {
    const e = t._prevTarget, n = t._nextTarget;
    e !== void 0 && (e._nextTarget = n, t._prevTarget = void 0), n !== void 0 && (n._prevTarget = e, t._nextTarget = void 0), t === this._targets && (this._targets = n);
  }
};
v.prototype.subscribe = function(t) {
  const e = this;
  return de(function() {
    const n = e.value, r = this._flags & P;
    this._flags &= ~P;
    try {
      t(n);
    } finally {
      this._flags |= r;
    }
  });
};
v.prototype.valueOf = function() {
  return this.value;
};
v.prototype.toString = function() {
  return this.value + "";
};
v.prototype.toJSON = function() {
  return this.value;
};
v.prototype.peek = function() {
  return this._value;
};
Object.defineProperty(v.prototype, "value", {
  get() {
    const t = xe(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (p instanceof k && ze(), t !== this._value) {
      ae > 100 && ee(), this._value = t, this._version++, Y++, te();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        ne();
      }
    }
  }
});
function Ie(t) {
  return new v(t);
}
function Oe(t) {
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
function k(t) {
  v.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = Y - 1, this._flags = V;
}
k.prototype = new v();
k.prototype._refresh = function() {
  if (this._flags &= ~x, this._flags & A)
    return !1;
  if ((this._flags & (V | P)) === P || (this._flags &= ~V, this._globalVersion === Y))
    return !0;
  if (this._globalVersion = Y, this._flags |= A, this._version > 0 && !Oe(this))
    return this._flags &= ~A, !0;
  const t = p;
  try {
    De(this), p = this;
    const e = this._compute();
    (this._flags & D || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~D, this._version++);
  } catch (e) {
    this._value = e, this._flags |= D, this._version++;
  }
  return p = t, Fe(this), this._flags &= ~A, !0;
};
k.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= V | P;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  v.prototype._subscribe.call(this, t);
};
k.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (v.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~P;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
k.prototype._notify = function() {
  if (!(this._flags & x)) {
    this._flags |= V | x;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
k.prototype.peek = function() {
  if (this._refresh() || ee(), this._flags & D)
    throw this._value;
  return this._value;
};
Object.defineProperty(k.prototype, "value", {
  get() {
    this._flags & A && ee();
    const t = xe(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & D)
      throw this._value;
    return this._value;
  }
});
function Ye(t) {
  return new k(t);
}
function Ue(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    te();
    const n = p;
    p = void 0;
    try {
      e();
    } catch (r) {
      throw t._flags &= ~A, t._flags |= I, fe(t), r;
    } finally {
      p = n, ne();
    }
  }
}
function fe(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Ue(t);
}
function Qe(t) {
  if (p !== this)
    throw new Error("Out-of-order effect");
  Fe(this), p = t, this._flags &= ~A, this._flags & I && fe(this), ne();
}
function G(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = P;
}
G.prototype._callback = function() {
  const t = this._start();
  try {
    if (this._flags & I || this._compute === void 0)
      return;
    const e = this._compute();
    typeof e == "function" && (this._cleanup = e);
  } finally {
    t();
  }
};
G.prototype._start = function() {
  this._flags & A && ee(), this._flags |= A, this._flags &= ~I, Ue(this), De(this), te();
  const t = p;
  return p = this, Qe.bind(this, t);
};
G.prototype._notify = function() {
  this._flags & x || (this._flags |= x, this._nextBatchedEffect = F, F = this);
};
G.prototype._dispose = function() {
  this._flags |= I, this._flags & A || fe(this);
};
function de(t) {
  const e = new G(t);
  try {
    e._callback();
  } catch (n) {
    throw e._dispose(), n;
  }
  return e._dispose.bind(e);
}
class Ve {
  get value() {
    return ce(this);
  }
  set value(e) {
    Xe(() => et(this, e));
  }
  peek() {
    return ce(this, { peek: !0 });
  }
}
const le = (t) => Object.assign(
  new Ve(),
  Object.entries(t).reduce(
    (e, [n, r]) => {
      if (["value", "peek"].some((s) => s === n))
        throw new Error(`${n} is a reserved property name`);
      return typeof r != "object" || r === null || Array.isArray(r) ? e[n] = Ie(r) : e[n] = le(r), e;
    },
    {}
  )
), et = (t, e) => Object.keys(e).forEach((n) => t[n].value = e[n]), ce = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (n, [r, s]) => (s instanceof v ? n[r] = e ? s.peek() : s.value : s instanceof Ve && (n[r] = ce(s, { peek: e })), n),
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
const tt = "[a-zA-Z_$][0-9a-zA-Z_$.]*";
function pe(t, e, n) {
  return new RegExp(`(?<whole>\\${t}(?<${e}>${tt})${n})`, "g");
}
const nt = {
  name: "SignalProcessor",
  description: "Replacing $signal with ctx.store.signal.value",
  regexp: pe("$", "signal", ""),
  replacer: (t) => {
    const { signal: e } = t;
    return `ctx.store.${e}.value`;
  }
}, rt = {
  name: "ActionProcessor",
  description: "Replacing $$action(args) with ctx.actions.action(ctx, args)",
  regexp: pe("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => {
    const n = ["ctx"];
    e && n.push(...e.split(",").map((s) => s.trim()));
    const r = n.join(",");
    return `ctx.actions.${t}(${r})`;
  }
}, st = {
  name: "RefProcessor",
  description: "Replacing #foo with ctx.refs.foo",
  regexp: pe("~", "ref", ""),
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
  onLoad: (t) => {
    const { el: e, expression: n } = t;
    return t.refs[n] = e, () => delete t.refs[n];
  }
}, lt = [it, at];
class ct {
  plugins = [];
  store = le({});
  actions = {};
  refs = {};
  reactivity = {
    signal: Ie,
    computed: Ye,
    effect: de
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
    this.store = le(n);
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
            if (![...r.allowedTagRegexps].some((g) => d.match(g)))
              throw new Error(
                `Tag '${o.tagName}' is not allowed for plugin '${i}', allowed tags are: ${[
                  [...r.allowedTagRegexps].map((g) => `'${g}'`)
                ].join(", ")}`
              );
          }
          let u = i.slice(r.prefix.length), [f, ...c] = u.split(".");
          if (r.mustHaveEmptyKey && f.length > 0)
            throw new Error(`Attribute '${i}' must have empty key`);
          if (r.mustNotEmptyKey && f.length === 0)
            throw new Error(`Attribute '${i}' must have non-empty key`);
          f.length && (f = f[0].toLowerCase() + f.slice(1));
          const l = c.map((d) => {
            const [_, ...g] = d.split("_");
            return { label: _, args: g };
          });
          if (r.allowedModifiers) {
            for (const d of l)
              if (!r.allowedModifiers.has(d.label))
                throw new Error(`Modifier '${d.label}' is not allowed`);
          }
          const w = /* @__PURE__ */ new Map();
          for (const d of l)
            w.set(d.label, d.args);
          if (r.mustHaveEmptyExpression && a.length)
            throw new Error(`Attribute '${i}' must have empty expression`);
          if (r.mustNotEmptyExpression && !a.length)
            throw new Error(`Attribute '${i}' must have non-empty expression`);
          const E = [...r.preprocessors?.pre || [], ...ot, ...r.preprocessors?.post || []];
          for (const d of E) {
            if (n.has(d))
              continue;
            n.add(d);
            const _ = [...a.matchAll(d.regexp)];
            if (_.length)
              for (const g of _) {
                if (!g.groups)
                  continue;
                const { groups: R } = g, { whole: $ } = R;
                a = a.replace($, d.replacer(R));
              }
          }
          const { store: b, reactivity: L, actions: y, refs: m } = this, h = {
            store: b,
            mergeStore: this.mergeStore.bind(this),
            applyPlugins: this.applyPlugins.bind(this),
            cleanupElementRemovals: this.cleanupElementRemovals.bind(this),
            walkSignals: this.walkSignals.bind(this),
            actions: y,
            refs: m,
            reactivity: L,
            el: o,
            key: f,
            expression: a,
            expressionFn: () => {
              throw new Error("Expression function not created");
            },
            modifiers: w
          };
          if (!r.bypassExpressionFunctionCreation?.(h) && !r.mustHaveEmptyExpression && a.length) {
            const d = a.split(";");
            d[d.length - 1] = `return ${d[d.length - 1]}`;
            const _ = `
try {
  ${d.join(";")}
} catch (e) {
  throw new Error(\`Error evaluating expression '${a}' on ${o.id}\`)
}
            `;
            try {
              const g = new Function("ctx", _);
              h.expressionFn = g;
            } catch (g) {
              console.error(g), console.error(`Error evaluating expression '${_}' on ${o.id ? `#${o.id}` : o.tagName}`);
              return;
            }
          }
          const S = r.onLoad(h);
          S && (this.removals.has(o) || this.removals.set(o, /* @__PURE__ */ new Set()), this.removals.get(o).add(S));
        }
      });
    });
  }
  walkSignalsStore(e, n) {
    const r = Object.keys(e);
    for (let s = 0; s < r.length; s++) {
      const o = r[s], i = e[o], a = i instanceof v, u = typeof i == "object" && Object.keys(i).length > 0;
      if (a) {
        n(o, i);
        continue;
      }
      u && this.walkSignalsStore(i, n);
    }
  }
  walkSignals(e) {
    this.walkSignalsStore(this.store, e);
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
}, dt = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/, K = ["change", "input", "keydown"], pt = {
  prefix: "model",
  description: "Sets the value of the element",
  mustHaveEmptyKey: !0,
  preprocessors: {
    post: [
      {
        name: "ModelProcessor",
        description: "Replacing model with ctx.store.model",
        regexp: /(?<whole>.+)/g,
        replacer: (t) => {
          const { whole: e } = t;
          return `ctx.store.${e}`;
        }
      }
    ]
  },
  allowedTagRegexps: /* @__PURE__ */ new Set(["input", "textarea", "select", "checkbox", "radio"]),
  // bypassExpressionFunctionCreation: () => true,
  onLoad: (t) => {
    const { store: e, el: n, expression: r } = t, s = t.expressionFn(t), o = n.tagName.toLowerCase().includes("input"), i = n.tagName.toLowerCase().includes("select"), a = n.tagName.toLowerCase().includes("textarea"), u = n.tagName.toLowerCase().includes("radio"), f = n.getAttribute("type"), c = o && f === "checkbox", l = o && f === "file";
    if (!o && !i && !a && !c && !u)
      throw new Error("Element must be input, select, textarea, checkbox or radio");
    const w = () => {
      if (!s)
        throw new Error(`Signal ${r} not found`);
      const m = s.value;
      if (o) {
        const h = n;
        c ? h.checked = m : l || (h.value = `${s.value}`);
      } else
        "value" in n ? n.value = `${s.value}` : n.setAttribute("value", `${s.value}`);
    }, E = t.reactivity.effect(w), b = () => {
      const m = n.value;
      if (!(typeof m > "u"))
        if (l) {
          const [h] = n?.files || [];
          if (!h) {
            s.value = "";
            return;
          }
          const S = new FileReader();
          S.onload = () => {
            if (typeof S.result != "string")
              throw new Error("Unsupported type");
            const _ = S.result.match(dt);
            if (!_?.groups)
              throw new Error("Invalid data URI");
            const { mime: g, contents: R } = _.groups;
            s.value = R;
            const $ = `${r}Mime`;
            if ($ in e) {
              const O = e[`${$}`];
              O.value = g;
            }
          }, S.readAsDataURL(h);
          const d = `${r}Name`;
          if (d in e) {
            const _ = e[`${d}`];
            _.value = h.name;
          }
          return;
        } else {
          const h = s.value;
          if (typeof h == "number")
            s.value = Number(m);
          else if (typeof h == "string")
            s.value = m;
          else if (typeof h == "boolean")
            if (c) {
              const { checked: S } = n;
              s.value = S;
            } else
              s.value = !!m;
          else if (!(typeof h > "u"))
            throw console.log(typeof h), new Error("Unsupported type");
        }
    }, L = n.tagName.split("-");
    if (L.length > 1) {
      const m = L[0].toLowerCase();
      K.forEach((h) => {
        K.push(`${m}-${h}`);
      });
    }
    return K.forEach((m) => n.addEventListener(m, b)), () => {
      E(), K.forEach((m) => n.removeEventListener(m, b));
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
      const r = n(t);
      e.textContent = `${r}`;
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
      const f = _e(o), c = W(o, "leading", !1), l = W(o, "noTrail", !0);
      s = wt(s, f, c, l);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const f = _e(i), c = W(i, "noLead", !0), l = W(i, "noTrail", !0);
      s = _t(s, f, c, l);
    }
    const a = {
      capture: !0,
      passive: !1,
      once: !1
    };
    if (t.modifiers.has("capture") || (a.capture = !1), t.modifiers.has("passive") && (a.passive = !0), t.modifiers.has("once") && (a.once = !0), n === "load")
      return s(), () => {
      };
    const u = n.toLowerCase();
    return e.addEventListener(u, s, a), () => {
      e.removeEventListener(u, s);
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
function _e(t) {
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
function W(t, e, n = !1) {
  return t ? t.includes(e) || n : !1;
}
function wt(t, e, n = !1, r = !0) {
  let s;
  const o = () => s && clearTimeout(s);
  return function(...a) {
    o(), n && !s && t(...a), s = setTimeout(() => {
      r && t(...a), o();
    }, e);
  };
}
function _t(t, e, n = !0, r = !1) {
  let s = !1, o = null;
  return function(...a) {
    s ? o = a : (s = !0, n ? t(...a) : o = a, setTimeout(() => {
      r && o && (t(...o), o = null), s = !1;
    }, e));
  };
}
const Z = /* @__PURE__ */ new WeakSet();
function yt(t, e, n = {}) {
  t instanceof Document && (t = t.documentElement);
  let r;
  typeof e == "string" ? r = At(e) : r = e;
  const s = Lt(r), o = bt(t, s, n);
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
    const r = Mt(e, t, n);
    if (!r)
      throw new Error("Could not find best match");
    const s = r?.previousSibling, o = r?.nextSibling, i = X(t, r, n);
    return r ? kt(s, i, o) : [];
  } else
    throw "Do not understand how to morph style " + n.morphStyle;
}
function X(t, e, n) {
  if (!(n.ignoreActive && t === document.activeElement))
    if (e == null) {
      if (n.callbacks.beforeNodeRemoved(t) === !1)
        return;
      t.remove(), n.callbacks.afterNodeRemoved(t);
      return;
    } else {
      if (Q(t, e))
        return n.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && n.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && n.head.style !== "morph" ? Ge(e, t, n) : (Et(e, t), qe(e, t, n))), n.callbacks.afterNodeMorphed(t, e), t);
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
      e.appendChild(o), n.callbacks.afterNodeAdded(o), C(n, o);
      continue;
    }
    if (Ke(o, s, n)) {
      X(s, o, n), s = s.nextSibling, C(n, o);
      continue;
    }
    let i = St(t, e, o, s, n);
    if (i) {
      s = ye(s, i, n), X(i, o, n), C(n, o);
      continue;
    }
    let a = Tt(t, o, s, n);
    if (a) {
      s = ye(s, a, n), X(a, o, n), C(n, o);
      continue;
    }
    if (n.callbacks.beforeNodeAdded(o) === !1)
      return;
    e.insertBefore(o, s), n.callbacks.afterNodeAdded(o), C(n, o);
  }
  for (; s !== null; ) {
    let i = s;
    s = s.nextSibling, We(i, n);
  }
}
function Et(t, e) {
  let n = t.nodeType;
  if (n === 1) {
    for (const r of t.attributes)
      e.getAttribute(r.name) !== r.value && e.setAttribute(r.name, r.value);
    for (const r of e.attributes)
      t.hasAttribute(r.name) || e.removeAttribute(r.name);
  }
  if ((n === Node.COMMENT_NODE || n === Node.TEXT_NODE) && e.nodeValue !== t.nodeValue && (e.nodeValue = t.nodeValue), t instanceof HTMLInputElement && e instanceof HTMLInputElement && t.type !== "file")
    e.value = t.value || "", J(t, e, "value"), J(t, e, "checked"), J(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    J(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const r = t.value, s = e.value;
    r !== s && (e.value = r), e.firstChild && e.firstChild.nodeValue !== r && (e.firstChild.nodeValue = r);
  }
}
function J(t, e, n) {
  const r = t.getAttribute(n), s = e.getAttribute(n);
  r !== s && (r ? e.setAttribute(n, r) : e.removeAttribute(n));
}
function Ge(t, e, n) {
  const r = [], s = [], o = [], i = [], a = n.head.style, u = /* @__PURE__ */ new Map();
  for (const c of t.children)
    u.set(c.outerHTML, c);
  for (const c of e.children) {
    let l = u.has(c.outerHTML), w = n.head.shouldReAppend(c), E = n.head.shouldPreserve(c);
    l || E ? w ? s.push(c) : (u.delete(c.outerHTML), o.push(c)) : a === "append" ? w && (s.push(c), i.push(c)) : n.head.shouldRemove(c) !== !1 && s.push(c);
  }
  i.push(...u.values()), console.log("to append: ", i);
  const f = [];
  for (const c of i) {
    console.log("adding: ", c);
    const l = document.createRange().createContextualFragment(c.outerHTML).firstChild;
    if (!l)
      throw new Error("could not create new element from: " + c.outerHTML);
    if (console.log(l), n.callbacks.beforeNodeAdded(l)) {
      if (l.hasAttribute("href") || l.hasAttribute("src")) {
        let w;
        const E = new Promise((b) => {
          w = b;
        });
        l.addEventListener("load", function() {
          w(void 0);
        }), f.push(E);
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
  }), f;
}
function N() {
}
function bt(t, e, n) {
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
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : j(n, t, e) > 0 : !1;
}
function Q(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function ye(t, e, n) {
  for (; t !== e; ) {
    const r = t;
    if (t = t?.nextSibling, !r)
      throw new Error("tempNode is null");
    We(r, n);
  }
  return C(n, e), e.nextSibling;
}
function St(t, e, n, r, s) {
  const o = j(s, n, e);
  let i = null;
  if (o > 0) {
    i = r;
    let a = 0;
    for (; i != null; ) {
      if (Ke(n, i, s))
        return i;
      if (a += j(s, i, t), a > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function Tt(t, e, n, r) {
  let s = n, o = e.nextSibling, i = 0;
  for (; s && o; ) {
    if (j(r, s, t) > 0)
      return null;
    if (Q(e, s))
      return s;
    if (Q(o, s) && (i++, o = o.nextSibling, i >= 2))
      return null;
    s = s.nextSibling;
  }
  return s;
}
const Ee = new DOMParser();
function At(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const n = Ee.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return Z.add(n), n;
    {
      let r = n.firstChild;
      return r ? (Z.add(r), r) : null;
    }
  } else {
    const r = Ee.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!r)
      throw new Error("content is null");
    return Z.add(r), r;
  }
}
function Lt(t) {
  if (t == null)
    return document.createElement("div");
  if (Z.has(t))
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
function kt(t, e, n) {
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
function Mt(t, e, n) {
  let r = t.firstChild, s = r, o = 0;
  for (; r; ) {
    let i = Nt(r, e, n);
    i > o && (s = r, o = i), r = r.nextSibling;
  }
  return s;
}
function Nt(t, e, n) {
  return Q(t, e) ? 0.5 + j(n, t, e) : 0;
}
function We(t, e) {
  C(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function Pt(t, e) {
  return !t.deadIds.has(e);
}
function Rt(t, e, n) {
  return t.idMap.get(n)?.has(e) || !1;
}
function C(t, e) {
  const n = t.idMap.get(e);
  if (n)
    for (const r of n)
      t.deadIds.add(r);
}
function j(t, e, n) {
  const r = t.idMap.get(e);
  if (!r)
    return 0;
  let s = 0;
  for (const o of r)
    Pt(t, o) && Rt(t, o, n) && ++s;
  return s;
}
function be(t, e) {
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
  return be(t, n), be(e, n), n;
}
const Ct = "get", Ht = "post", xt = "put", It = "patch", Ot = "delete", Dt = [Ct, Ht, xt, It, Ot], Ft = Dt.reduce((t, e) => (t[e] = async (n) => {
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
}, t), {}), Ut = "Accept", Vt = "Content-Type", jt = "datastar-request", Bt = "application/json", qt = "text/event-stream", Gt = "true", B = "datastar-", q = `${B}indicator`, ue = `${q}-loading`, Se = `${B}settling`, z = `${B}swapping`, Kt = "self", T = {
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
.${q}{
 opacity:0;
 transition: opacity 300ms ease-out;
}
.${ue} {
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
    return n.classList.add(q), () => {
      delete t.store.fetch.indicatorSelectors[t.el.id];
    };
  })
}, Zt = [Wt, Jt, zt], Xt = /(?<key>\w*): (?<value>.*)/gm;
async function Te(t, e) {
  const { el: n, store: r } = e, s = r.fetch.elementURLs[n.id];
  if (!s)
    return;
  const o = { ...r };
  delete o.fetch;
  const i = JSON.stringify(o);
  let a = n, u = !1;
  const f = r.fetch.indicatorSelectors[n.id];
  if (f) {
    const y = document.querySelector(f);
    y && (a = y, a.classList.remove(q), a.classList.add(ue), u = !0);
  }
  const c = new URL(s.value, window.location.origin), l = new Headers();
  l.append(Ut, qt), l.append(Vt, Bt), l.append(jt, Gt);
  const w = r.fetch.headers.value;
  if (w)
    for (const y in w) {
      const m = w[y];
      l.append(y, m);
    }
  t = t.toUpperCase();
  const E = { method: t, headers: l };
  if (t === "GET") {
    const y = new URLSearchParams(c.search);
    y.append("datastar", i), c.search = y.toString();
  } else
    E.body = i;
  const b = await fetch(c, E);
  if (!b.ok)
    throw new Error(`Response was not ok, url: ${c}, status: ${b.status}`);
  if (!b.body)
    throw new Error("No response body");
  const L = b.body.pipeThrough(new TextDecoderStream()).getReader();
  for (; ; ) {
    const { done: y, value: m } = await L.read();
    if (y)
      break;
    m.split(`

`).forEach((h) => {
      const S = [...h.matchAll(Xt)];
      if (S.length) {
        let d = "", _ = "morph_element", g = "", R = 0, $ = !1, O = "", re, he = !1, me = !1;
        for (const ge of S) {
          if (!ge.groups)
            continue;
          const { key: Je, value: M } = ge.groups;
          switch (Je) {
            case "event":
              if (!M.startsWith(B))
                throw new Error(`Unknown event: ${M}`);
              switch (M.slice(B.length)) {
                case "redirect":
                  $ = !0;
                  break;
                case "fragment":
                  me = !0;
                  break;
                case "error":
                  he = !0;
                  break;
                default:
                  throw new Error(`Unknown event: ${M}`);
              }
              break;
            case "data":
              const se = M.indexOf(" ");
              if (se === -1)
                throw new Error("Missing space in data");
              const ve = M.slice(0, se), H = M.slice(se + 1);
              switch (ve) {
                case "selector":
                  g = H;
                  break;
                case "merge":
                  const we = H;
                  if (!Object.values(T).includes(we))
                    throw new Error(`Unknown merge option: ${M}`);
                  _ = we;
                  break;
                case "settle":
                  R = parseInt(H);
                  break;
                case "fragment":
                case "html":
                  d = H;
                  break;
                case "redirect":
                  O = H;
                  break;
                case "error":
                  re = new Error(H);
                  break;
                default:
                  throw new Error(`Unknown data type: ${ve}`);
              }
          }
        }
        if (he && re)
          throw re;
        if ($ && O)
          window.location.href = O;
        else if (me && d)
          Yt(e, g, _, d, R);
        else
          throw new Error(`Unknown event block: ${h}`);
      }
    });
  }
  u && (a.classList.remove(ue), a.classList.add(q));
}
const Ae = document.createElement("template");
function Yt(t, e, n, r, s) {
  const { el: o } = t;
  Ae.innerHTML = r;
  const i = Ae.content.firstChild;
  if (!(i instanceof Element))
    throw new Error(`Fragment is not an element, source '${r}'`);
  const a = e === Kt;
  let u;
  if (a)
    u = [o];
  else {
    const f = e || `#${i.getAttribute("id")}`;
    if (u = document.querySelectorAll(f) || [], !u)
      throw new Error(`No target elements, selector: ${e}`);
  }
  for (const f of u) {
    f.classList.add(z);
    const c = f.outerHTML;
    let l = f;
    switch (n) {
      case T.MorphElement:
        const E = yt(l, i);
        if (!E?.length)
          throw new Error("Failed to morph element");
        l = E[0];
        break;
      case T.InnerElement:
        l.innerHTML = i.innerHTML;
        break;
      case T.OuterElement:
        l.replaceWith(i);
        break;
      case T.PrependElement:
        l.prepend(i);
        break;
      case T.AppendElement:
        l.append(i);
        break;
      case T.BeforeElement:
        l.before(i);
        break;
      case T.AfterElement:
        l.after(i);
        break;
      case T.DeleteElement:
        setTimeout(() => l.remove(), s);
        break;
      case T.UpsertAttributes:
        i.getAttributeNames().forEach((L) => {
          const y = i.getAttribute(L);
          l.setAttribute(L, y);
        });
        break;
      default:
        throw new Error(`Unknown merge type: ${n}`);
    }
    l.classList.add(z), t.cleanupElementRemovals(f), t.applyPlugins(l), f.classList.remove(z), l.classList.remove(z);
    const w = l.outerHTML;
    c !== w && (l.classList.add(Se), setTimeout(() => {
      l.classList.remove(Se);
    }, s));
  }
}
const Qt = {
  setAll: async (t, e, n) => {
    const r = new RegExp(e);
    t.walkSignals((s, o) => r.test(s) && (o.value = n));
  },
  toggleAll: async (t, e) => {
    const n = new RegExp(e);
    t.walkSignals((r, s) => n.test(r) && (s.value = !s.value));
  }
}, oe = "display", Le = "none", ie = "important", en = {
  prefix: "show",
  description: "Sets the display of the element",
  allowedModifiers: /* @__PURE__ */ new Set([ie]),
  onLoad: (t) => {
    const { el: e, modifiers: n, expressionFn: r } = t;
    return de(() => {
      const o = !!r(t), a = n.has(ie) ? ie : void 0;
      o ? e.style.length === 1 && e.style.display === Le ? e.style.removeProperty(oe) : e.style.setProperty(oe, "", a) : e.style.setProperty(oe, Le, a);
    });
  }
}, tn = "intersects", ke = "once", Me = "half", Ne = "full", nn = {
  prefix: tn,
  description: "Run expression when element intersects with viewport",
  allowedModifiers: /* @__PURE__ */ new Set([ke, Me, Ne]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, n = { threshold: 0 };
    e.has(Ne) ? n.threshold = 1 : e.has(Me) && (n.threshold = 0.5);
    const r = new IntersectionObserver((s) => {
      s.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(ke) && r.disconnect());
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
    let u = r.viewTransitions[s];
    return u || (u = t.reactivity.signal(0), r.viewTransitions[s] = u), u.value++, e.classList.add(i), () => {
      u.value--, u.value === 0 && (delete r.viewTransitions[s], o.innerHTML = o.innerHTML.replace(a, ""));
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
