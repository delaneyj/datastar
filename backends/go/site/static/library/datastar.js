function Ne(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function ee() {
  throw new Error("Cycle detected");
}
function Ke() {
  throw new Error("Computed cannot have side-effects");
}
const Je = Symbol.for("preact-signals"), k = 1, R = 2, V = 4, x = 8, H = 16, P = 32;
function te() {
  F++;
}
function ne() {
  if (F > 1) {
    F--;
    return;
  }
  let t, e = !1;
  for (; D !== void 0; ) {
    let n = D;
    for (D = void 0, ie++; n !== void 0; ) {
      const r = n._nextBatchedEffect;
      if (n._nextBatchedEffect = void 0, n._flags &= ~R, !(n._flags & x) && $e(n))
        try {
          n._callback();
        } catch (s) {
          e || (t = s, e = !0);
        }
      n = r;
    }
  }
  if (ie = 0, F--, e)
    throw t;
}
function ze(t) {
  if (F > 0)
    return t();
  te();
  try {
    return t();
  } finally {
    ne();
  }
}
let g, D, F = 0, ie = 0, X = 0;
function Me(t) {
  if (g === void 0)
    return;
  let e = t._node;
  if (e === void 0 || e._target !== g)
    return e = {
      _version: 0,
      _source: t,
      _prevSource: g._sources,
      _nextSource: void 0,
      _target: g,
      _prevTarget: void 0,
      _nextTarget: void 0,
      _rollbackNode: e
    }, g._sources !== void 0 && (g._sources._nextSource = e), g._sources = e, t._node = e, g._flags & P && t._subscribe(e), e;
  if (e._version === -1)
    return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = g._sources, e._nextSource = void 0, g._sources._nextSource = e, g._sources = e), e;
}
function _(t) {
  this._value = t, this._version = 0, this._node = void 0, this._targets = void 0;
}
_.prototype.brand = Je;
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
  return xe(function() {
    const n = e.value, r = this._flags & P;
    this._flags &= ~P;
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
    const t = Me(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (g instanceof N && Ke(), t !== this._value) {
      ie > 100 && ee(), this._value = t, this._version++, X++, te();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        ne();
      }
    }
  }
});
function Pe(t) {
  return new _(t);
}
function $e(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    if (e._source._version !== e._version || !e._source._refresh() || e._source._version !== e._version)
      return !0;
  return !1;
}
function Ie(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource) {
    const n = e._source._node;
    if (n !== void 0 && (e._rollbackNode = n), e._source._node = e, e._version = -1, e._nextSource === void 0) {
      t._sources = e;
      break;
    }
  }
}
function Ce(t) {
  let e = t._sources, n;
  for (; e !== void 0; ) {
    const r = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), r !== void 0 && (r._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = r)) : n = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = r;
  }
  t._sources = n;
}
function N(t) {
  _.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = X - 1, this._flags = V;
}
N.prototype = new _();
N.prototype._refresh = function() {
  if (this._flags &= ~R, this._flags & k)
    return !1;
  if ((this._flags & (V | P)) === P || (this._flags &= ~V, this._globalVersion === X))
    return !0;
  if (this._globalVersion = X, this._flags |= k, this._version > 0 && !$e(this))
    return this._flags &= ~k, !0;
  const t = g;
  try {
    Ie(this), g = this;
    const e = this._compute();
    (this._flags & H || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~H, this._version++);
  } catch (e) {
    this._value = e, this._flags |= H, this._version++;
  }
  return g = t, Ce(this), this._flags &= ~k, !0;
};
N.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= V | P;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  _.prototype._subscribe.call(this, t);
};
N.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (_.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~P;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
N.prototype._notify = function() {
  if (!(this._flags & R)) {
    this._flags |= V | R;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
N.prototype.peek = function() {
  if (this._refresh() || ee(), this._flags & H)
    throw this._value;
  return this._value;
};
Object.defineProperty(N.prototype, "value", {
  get() {
    this._flags & k && ee();
    const t = Me(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & H)
      throw this._value;
    return this._value;
  }
});
function Ze(t) {
  return new N(t);
}
function Re(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    te();
    const n = g;
    g = void 0;
    try {
      e();
    } catch (r) {
      throw t._flags &= ~k, t._flags |= x, ue(t), r;
    } finally {
      g = n, ne();
    }
  }
}
function ue(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Re(t);
}
function Xe(t) {
  if (g !== this)
    throw new Error("Out-of-order effect");
  Ce(this), g = t, this._flags &= ~k, this._flags & x && ue(this), ne();
}
function q(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = P;
}
q.prototype._callback = function() {
  const t = this._start();
  try {
    if (this._flags & x || this._compute === void 0)
      return;
    const e = this._compute();
    typeof e == "function" && (this._cleanup = e);
  } finally {
    t();
  }
};
q.prototype._start = function() {
  this._flags & k && ee(), this._flags |= k, this._flags &= ~x, Re(this), Ie(this), te();
  const t = g;
  return g = this, Xe.bind(this, t);
};
q.prototype._notify = function() {
  this._flags & R || (this._flags |= R, this._nextBatchedEffect = D, D = this);
};
q.prototype._dispose = function() {
  this._flags |= x, this._flags & k || ue(this);
};
function xe(t) {
  const e = new q(t);
  try {
    e._callback();
  } catch (n) {
    throw e._dispose(), n;
  }
  return e._dispose.bind(e);
}
class Oe {
  get value() {
    return le(this);
  }
  set value(e) {
    ze(() => Ye(this, e));
  }
  peek() {
    return le(this, { peek: !0 });
  }
}
const ae = (t) => Object.assign(
  new Oe(),
  Object.entries(t).reduce(
    (e, [n, r]) => {
      if (["value", "peek"].some((s) => s === n))
        throw new Error(`${n} is a reserved property name`);
      return typeof r != "object" || r === null || Array.isArray(r) ? e[n] = Pe(r) : e[n] = ae(r), e;
    },
    {}
  )
), Ye = (t, e) => Object.keys(e).forEach((n) => t[n].value = e[n]), le = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (n, [r, s]) => (s instanceof _ ? n[r] = e ? s.peek() : s.value : s instanceof Oe && (n[r] = le(s, { peek: e })), n),
  {}
);
function He(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return e;
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let n = t;
  return typeof t != "object" && (n = { ...e }), Object.keys(e).forEach((r) => {
    n.hasOwnProperty(r) || (n[r] = e[r]), e[r] === null ? delete n[r] : n[r] = He(n[r], e[r]);
  }), n;
}
const Qe = "[a-zA-Z_$][0-9a-zA-Z_$.]+";
function fe(t, e, n) {
  return new RegExp(`(?<whole>\\${t}(?<${e}>${Qe})${n})`, "g");
}
const et = {
  regexp: fe("$", "signal", "(?<method>\\([^\\)]*\\))?"),
  replacer: (t) => {
    const { signal: e, method: n } = t, r = "ctx.store()";
    if (!n?.length)
      return `${r}.${e}.value`;
    const s = e.split("."), o = s.pop(), i = s.join(".");
    return `${r}.${i}.value.${o}${n}`;
  }
}, tt = {
  regexp: fe("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => {
    const n = ["ctx"];
    e && n.push(...e.split(",").map((s) => s.trim()));
    const r = n.join(",");
    return `ctx.actions.${t}(${r})`;
  }
}, nt = {
  regexp: fe("~", "ref", ""),
  replacer({ ref: t }) {
    return `data.refs.${t}`;
  }
}, rt = [tt, et, nt], st = {
  prefix: "store",
  preprocessors: {
    pre: [
      {
        regexp: /(?<whole>.+)/g,
        replacer: (t) => {
          const { whole: e } = t;
          return `Object.assign({...ctx.store()}, ${e})`;
        }
      }
    ]
  },
  onLoad: (t) => {
    const e = t.expressionFn(t);
    t.mergeStore(e), delete t.el.dataset.store;
  }
}, ot = {
  prefix: "ref",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  bypassExpressionFunctionCreation: () => !0,
  onLoad: (t) => {
    const { el: e, expression: n } = t;
    return t.refs[n] = e, () => delete t.refs[n];
  }
}, it = [st, ot];
class at {
  plugins = [];
  store = ae({});
  actions = {};
  refs = {};
  reactivity = {
    signal: Pe,
    computed: Ze,
    effect: xe
  };
  parentID = "";
  missingIDNext = 0;
  removals = /* @__PURE__ */ new Map();
  constructor(e = {}, ...n) {
    if (this.actions = Object.assign(this.actions, e), n = [...it, ...n], !n.length)
      throw new Error("No plugins provided");
    const r = /* @__PURE__ */ new Set();
    for (const s of n) {
      if (s.requiredPluginPrefixes) {
        for (const o of s.requiredPluginPrefixes)
          if (!r.has(o))
            throw new Error(`${s.prefix} requires ${o}`);
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
    const n = He(this.store.value, e);
    this.store = ae(n);
  }
  signalByName(e) {
    return this.store[e];
  }
  applyPlugins(e) {
    const n = /* @__PURE__ */ new Set();
    this.plugins.forEach((r, s) => {
      this.walkDownDOM(e, (o) => {
        s || this.cleanupElementRemovals(o);
        for (const i in o.dataset) {
          let a = o.dataset[i] || "";
          if (!i.startsWith(r.prefix))
            continue;
          if (o.id.length === 0 && (o.id = `ds-${this.parentID}-${this.missingIDNext++}`), n.clear(), r.allowedTagRegexps) {
            const p = o.tagName.toLowerCase();
            if (![...r.allowedTagRegexps].some((d) => p.match(d)))
              throw new Error(
                `'${o.tagName}' not allowed for '${i}', allowed ${[
                  [...r.allowedTagRegexps].map((d) => `'${d}'`)
                ].join(", ")}`
              );
          }
          let u = i.slice(r.prefix.length), [f, ...l] = u.split(".");
          if (r.mustHaveEmptyKey && f.length > 0)
            throw new Error(`'${i}' must have empty key`);
          if (r.mustNotEmptyKey && f.length === 0)
            throw new Error(`'${i}' must have non-empty key`);
          f.length && (f = f[0].toLowerCase() + f.slice(1));
          const h = l.map((p) => {
            const [m, ...d] = p.split("_");
            return { label: m, args: d };
          });
          if (r.allowedModifiers) {
            for (const p of h)
              if (!r.allowedModifiers.has(p.label))
                throw new Error(`'${p.label}' is not allowed`);
          }
          const c = /* @__PURE__ */ new Map();
          for (const p of h)
            c.set(p.label, p.args);
          if (r.mustHaveEmptyExpression && a.length)
            throw new Error(`'${i}' must have empty expression`);
          if (r.mustNotEmptyExpression && !a.length)
            throw new Error(`'${i}' must have non-empty expression`);
          const y = [...r.preprocessors?.pre || [], ...rt, ...r.preprocessors?.post || []];
          for (const p of y) {
            if (n.has(p))
              continue;
            n.add(p);
            const m = a.split(";"), d = [];
            m.forEach((w) => {
              let v = w;
              const T = [...v.matchAll(p.regexp)];
              if (T.length)
                for (const C of T) {
                  if (!C.groups)
                    continue;
                  const { groups: S } = C, { whole: $ } = S;
                  v = v.replace($, p.replacer(S));
                }
              d.push(v);
            }), a = d.join("; ");
          }
          const b = {
            store: () => this.store,
            mergeStore: this.mergeStore.bind(this),
            applyPlugins: this.applyPlugins.bind(this),
            cleanupElementRemovals: this.cleanupElementRemovals.bind(this),
            walkSignals: this.walkSignals.bind(this),
            actions: this.actions,
            refs: this.refs,
            reactivity: this.reactivity,
            el: o,
            key: f,
            expression: a,
            expressionFn: () => {
              throw new Error("Expression function not created");
            },
            modifiers: c
          };
          if (!r.bypassExpressionFunctionCreation?.(b) && !r.mustHaveEmptyExpression && a.length) {
            const p = a.split(";").map((d) => d.trim());
            p[p.length - 1] = `return ${p[p.length - 1]}`;
            let m = `
try {
${p.map((d) => `  ${d}`).join(`;
`)}
} catch (e) {
  throw e
}
            `;
            try {
              const d = new Function("ctx", m);
              b.expressionFn = d;
            } catch (d) {
              throw new Error(`Error creating expression function for '${m}', error: ${d}`);
            }
          }
          const E = r.onLoad(b);
          E && (this.removals.has(o) || this.removals.set(o, /* @__PURE__ */ new Set()), this.removals.get(o).add(E));
        }
      });
    });
  }
  walkSignalsStore(e, n) {
    const r = Object.keys(e);
    for (let s = 0; s < r.length; s++) {
      const o = r[s], i = e[o], a = i instanceof _, u = typeof i == "object" && Object.keys(i).length > 0;
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
    const s = Ne(e);
    if (s)
      for (n(s), r = 0, e = e.firstElementChild; e; )
        this.walkDownDOM(e, n, r++), e = e.nextElementSibling;
  }
}
const lt = "0.12.3", De = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, n) => (n ? "-" : "") + e.toLowerCase()), ct = {
  prefix: "bind",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(async () => {
    const e = De(t.key), r = `${await t.expressionFn(t)}`;
    !r || r === "false" || r === "null" || r === "undefined" ? t.el.removeAttribute(e) : t.el.setAttribute(e, r);
  })
}, ut = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/, W = ["change", "input", "keydown"], ft = {
  prefix: "model",
  mustHaveEmptyKey: !0,
  preprocessors: {
    post: [
      {
        regexp: /(?<whole>.+)/g,
        replacer: (t) => {
          const { whole: e } = t;
          return `ctx.store().${e}`;
        }
      }
    ]
  },
  allowedTagRegexps: /* @__PURE__ */ new Set(["input", "textarea", "select", "checkbox", "radio"]),
  // bypassExpressionFunctionCreation: () => true,
  onLoad: (t) => {
    const { el: e, expression: n } = t, r = t.expressionFn(t), s = e.tagName.toLowerCase();
    if (n.startsWith("ctx.store().ctx.store()"))
      throw new Error(`Model attribute on #${e.id} must have a signal name, you probably prefixed with $ by accident`);
    const o = s.includes("input"), i = s.includes("select"), a = s.includes("textarea"), u = e.getAttribute("type"), f = s.includes("checkbox") || o && u === "checkbox", l = s.includes("radio") || o && u === "radio", h = o && u === "file";
    if (!o && !i && !a && !f && !l)
      throw new Error("Element must be input, select, textarea, checkbox or radio");
    l && (e.getAttribute("name")?.length || e.setAttribute("name", n));
    const c = () => {
      if (!r)
        throw new Error(`Signal ${n} not found`);
      const m = "value" in e, d = r.value;
      if (f || l) {
        const w = e;
        f ? w.checked = d : l && (w.checked = `${d}` === w.value);
      } else {
        if (h)
          throw new Error("File input reading is not supported yet");
        m ? e.value = `${d}` : e.setAttribute("value", `${d}`);
      }
    }, y = t.reactivity.effect(c), b = () => {
      if (h) {
        const [w] = e?.files || [];
        if (!w) {
          r.value = "";
          return;
        }
        const v = new FileReader(), T = t.store();
        v.onload = () => {
          if (typeof v.result != "string")
            throw new Error("Unsupported type");
          const S = v.result.match(ut);
          if (!S?.groups)
            throw new Error("Invalid data URI");
          const { mime: $, contents: re } = S.groups;
          r.value = re;
          const L = `${n}Mime`;
          if (L in T) {
            const O = T[`${L}`];
            O.value = $;
          }
        }, v.readAsDataURL(w);
        const C = `${n}Name`;
        if (C in T) {
          const S = T[`${C}`];
          S.value = w.name;
        }
        return;
      }
      const m = r.value, d = e;
      if (typeof m == "number")
        r.value = Number(d.value);
      else if (typeof m == "string")
        r.value = d.value;
      else if (typeof m == "boolean")
        f ? r.value = d.checked : r.value = !!d.value;
      else if (!(typeof m > "u"))
        if (typeof m == "bigint")
          r.value = BigInt(d.value);
        else
          throw console.log(typeof m), new Error("Unsupported type");
    }, E = e.tagName.split("-");
    if (E.length > 1) {
      const m = E[0].toLowerCase();
      W.forEach((d) => {
        W.push(`${m}-${d}`);
      });
    }
    return W.forEach((m) => e.addEventListener(m, b)), () => {
      y(), W.forEach((m) => e.removeEventListener(m, b));
    };
  }
}, dt = {
  prefix: "text",
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
}, ht = {
  prefix: "on",
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
      const f = de(o), l = G(o, "leading", !1), h = G(o, "noTrail", !0);
      s = mt(s, f, l, h);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const f = de(i), l = G(i, "noLead", !0), h = G(i, "noTrail", !0);
      s = gt(s, f, l, h);
    }
    const a = {
      capture: !0,
      passive: !1,
      once: !1
    };
    t.modifiers.has("capture") || (a.capture = !1), t.modifiers.has("passive") && (a.passive = !0), t.modifiers.has("once") && (a.once = !0);
    const u = De(n).toLowerCase();
    return u === "load" ? (s(), delete e.dataset.onLoad, () => {
    }) : (e.addEventListener(u, s, a), () => {
      e.removeEventListener(u, s);
    });
  }
}, pt = [
  ct,
  ft,
  dt,
  ht
];
function de(t) {
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
function mt(t, e, n = !1, r = !0) {
  let s;
  const o = () => s && clearTimeout(s);
  return function(...a) {
    o(), n && !s && t(...a), s = setTimeout(() => {
      r && t(...a), o();
    }, e);
  };
}
function gt(t, e, n = !0, r = !1) {
  let s = !1, o = null;
  return function(...a) {
    s ? o = a : (s = !0, n ? t(...a) : o = a, setTimeout(() => {
      r && o && (t(...o), o = null), s = !1;
    }, e));
  };
}
function vt(t, {
  signal: e,
  headers: n,
  onopen: r,
  onmessage: s,
  onclose: o,
  onerror: i,
  openWhenHidden: a,
  ...u
}) {
  return new Promise((f, l) => {
    const h = { ...n };
    h.accept || (h.accept = ce);
    let c;
    function y() {
      c.abort(), document.hidden || d();
    }
    a || document.addEventListener("visibilitychange", y);
    let b = yt, E = 0;
    function p() {
      document.removeEventListener("visibilitychange", y), window.clearTimeout(E), c.abort();
    }
    e?.addEventListener("abort", () => {
      p(), f();
    });
    const m = r ?? wt;
    async function d() {
      c = new AbortController();
      try {
        const w = await fetch(t, {
          ...u,
          headers: h,
          signal: c.signal
        });
        await m(w), await bt(
          w.body,
          _t(
            Et(
              (v) => {
                v ? h[he] = v : delete h[he];
              },
              (v) => {
                b = v;
              },
              s
            )
          )
        ), o?.(), p(), f();
      } catch (w) {
        if (!c.signal.aborted)
          try {
            const v = i?.(w) ?? b;
            window.clearTimeout(E), E = window.setTimeout(d, v);
          } catch (v) {
            p(), l(v);
          }
      }
    }
    d();
  });
}
const ce = "text/event-stream", yt = 1e3, he = "last-event-id";
function wt(t) {
  const e = t.headers.get("content-type");
  if (!e?.startsWith(ce))
    throw new Error(`Expected content-type to be ${ce}, Actual: ${e}`);
}
async function bt(t, e) {
  const n = t.getReader();
  for (; ; ) {
    const r = await n.read();
    if (r.done)
      break;
    e(r.value);
  }
}
function _t(t) {
  let e, n, r, s = !1;
  return function(i) {
    e === void 0 ? (e = i, n = 0, r = -1) : e = St(e, i);
    const a = e.length;
    let u = 0;
    for (; n < a; ) {
      s && (e[n] === 10 && (u = ++n), s = !1);
      let f = -1;
      for (; n < a && f === -1; ++n)
        switch (e[n]) {
          case 58:
            r === -1 && (r = n - u);
            break;
          case 13:
            s = !0;
          case 10:
            f = n;
            break;
        }
      if (f === -1)
        break;
      t(e.subarray(u, f), r), u = n, r = -1;
    }
    u === a ? e = void 0 : u !== 0 && (e = e.subarray(u), n -= u);
  };
}
function Et(t, e, n) {
  let r = pe();
  const s = new TextDecoder();
  return function(i, a) {
    if (i.length === 0)
      n?.(r), r = pe();
    else if (a > 0) {
      const u = s.decode(i.subarray(0, a)), f = a + (i[a + 1] === 32 ? 2 : 1), l = s.decode(i.subarray(f));
      switch (u) {
        case "data":
          r.data = r.data ? r.data + `
` + l : l;
          break;
        case "event":
          r.event = l;
          break;
        case "id":
          t(r.id = l);
          break;
        case "retry":
          const h = parseInt(l, 10);
          isNaN(h) || e(r.retry = h);
          break;
      }
    }
  };
}
function St(t, e) {
  const n = new Uint8Array(t.length + e.length);
  return n.set(t), n.set(e, t.length), n;
}
function pe() {
  return {
    data: "",
    event: "",
    id: "",
    retry: void 0
  };
}
const z = /* @__PURE__ */ new WeakSet();
function Tt(t, e, n = {}) {
  t instanceof Document && (t = t.documentElement);
  let r;
  typeof e == "string" ? r = Mt(e) : r = e;
  const s = Pt(r), o = kt(t, s, n);
  return Fe(t, s, o);
}
function Fe(t, e, n) {
  if (n.head.block) {
    const r = t.querySelector("head"), s = e.querySelector("head");
    if (r && s) {
      const o = je(s, r, n);
      Promise.all(o).then(() => {
        Fe(
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
    return Ve(e, t, n), t.children;
  if (n.morphStyle === "outerHTML" || n.morphStyle == null) {
    const r = It(e, t, n);
    if (!r)
      throw new Error("Could not find best match");
    const s = r?.previousSibling, o = r?.nextSibling, i = Z(t, r, n);
    return r ? $t(s, i, o) : [];
  } else
    throw "Do not understand how to morph style " + n.morphStyle;
}
function Z(t, e, n) {
  if (!(n.ignoreActive && t === document.activeElement))
    if (e == null) {
      if (n.callbacks.beforeNodeRemoved(t) === !1)
        return;
      t.remove(), n.callbacks.afterNodeRemoved(t);
      return;
    } else {
      if (Y(t, e))
        return n.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && n.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && n.head.style !== "morph" ? je(e, t, n) : (At(e, t), Ve(e, t, n))), n.callbacks.afterNodeMorphed(t, e), t);
      if (n.callbacks.beforeNodeRemoved(t) === !1 || n.callbacks.beforeNodeAdded(e) === !1)
        return;
      if (!t.parentElement)
        throw new Error("oldNode has no parentElement");
      return t.parentElement.replaceChild(e, t), n.callbacks.afterNodeAdded(e), n.callbacks.afterNodeRemoved(t), e;
    }
}
function Ve(t, e, n) {
  let r = t.firstChild, s = e.firstChild, o;
  for (; r; ) {
    if (o = r, r = o.nextSibling, s == null) {
      if (n.callbacks.beforeNodeAdded(o) === !1)
        return;
      e.appendChild(o), n.callbacks.afterNodeAdded(o), I(n, o);
      continue;
    }
    if (Be(o, s, n)) {
      Z(s, o, n), s = s.nextSibling, I(n, o);
      continue;
    }
    let i = Lt(t, e, o, s, n);
    if (i) {
      s = me(s, i, n), Z(i, o, n), I(n, o);
      continue;
    }
    let a = Nt(t, o, s, n);
    if (a) {
      s = me(s, a, n), Z(a, o, n), I(n, o);
      continue;
    }
    if (n.callbacks.beforeNodeAdded(o) === !1)
      return;
    e.insertBefore(o, s), n.callbacks.afterNodeAdded(o), I(n, o);
  }
  for (; s !== null; ) {
    let i = s;
    s = s.nextSibling, Ue(i, n);
  }
}
function At(t, e) {
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
function je(t, e, n) {
  const r = [], s = [], o = [], i = [], a = n.head.style, u = /* @__PURE__ */ new Map();
  for (const l of t.children)
    u.set(l.outerHTML, l);
  for (const l of e.children) {
    let h = u.has(l.outerHTML), c = n.head.shouldReAppend(l), y = n.head.shouldPreserve(l);
    h || y ? c ? s.push(l) : (u.delete(l.outerHTML), o.push(l)) : a === "append" ? c && (s.push(l), i.push(l)) : n.head.shouldRemove(l) !== !1 && s.push(l);
  }
  i.push(...u.values());
  const f = [];
  for (const l of i) {
    const h = document.createRange().createContextualFragment(l.outerHTML).firstChild;
    if (!h)
      throw new Error("could not create new element from: " + l.outerHTML);
    if (n.callbacks.beforeNodeAdded(h)) {
      if (h.hasAttribute("href") || h.hasAttribute("src")) {
        let c;
        const y = new Promise((b) => {
          c = b;
        });
        h.addEventListener("load", function() {
          c(void 0);
        }), f.push(y);
      }
      e.appendChild(h), n.callbacks.afterNodeAdded(h), r.push(h);
    }
  }
  for (const l of s)
    n.callbacks.beforeNodeRemoved(l) !== !1 && (e.removeChild(l), n.callbacks.afterNodeRemoved(l));
  return n.head.afterHeadMorphed(e, {
    added: r,
    kept: o,
    removed: s
  }), f;
}
function M() {
}
function kt(t, e, n) {
  return {
    target: t,
    newContent: e,
    config: n,
    morphStyle: n.morphStyle,
    ignoreActive: n.ignoreActive,
    idMap: Ot(t, e),
    deadIds: /* @__PURE__ */ new Set(),
    callbacks: Object.assign(
      {
        beforeNodeAdded: M,
        afterNodeAdded: M,
        beforeNodeMorphed: M,
        afterNodeMorphed: M,
        beforeNodeRemoved: M,
        afterNodeRemoved: M
      },
      n.callbacks
    ),
    head: Object.assign(
      {
        style: "merge",
        shouldPreserve: (r) => r.getAttribute("im-preserve") === "true",
        shouldReAppend: (r) => r.getAttribute("im-re-append") === "true",
        shouldRemove: M,
        afterHeadMorphed: M
      },
      n.head
    )
  };
}
function Be(t, e, n) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : j(n, t, e) > 0 : !1;
}
function Y(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function me(t, e, n) {
  for (; t !== e; ) {
    const r = t;
    if (t = t?.nextSibling, !r)
      throw new Error("tempNode is null");
    Ue(r, n);
  }
  return I(n, e), e.nextSibling;
}
function Lt(t, e, n, r, s) {
  const o = j(s, n, e);
  let i = null;
  if (o > 0) {
    i = r;
    let a = 0;
    for (; i != null; ) {
      if (Be(n, i, s))
        return i;
      if (a += j(s, i, t), a > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function Nt(t, e, n, r) {
  let s = n, o = e.nextSibling, i = 0;
  for (; s && o; ) {
    if (j(r, s, t) > 0)
      return null;
    if (Y(e, s))
      return s;
    if (Y(o, s) && (i++, o = o.nextSibling, i >= 2))
      return null;
    s = s.nextSibling;
  }
  return s;
}
const ge = new DOMParser();
function Mt(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const n = ge.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return z.add(n), n;
    {
      let r = n.firstChild;
      return r ? (z.add(r), r) : null;
    }
  } else {
    const r = ge.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!r)
      throw new Error("content is null");
    return z.add(r), r;
  }
}
function Pt(t) {
  if (t == null)
    return document.createElement("div");
  if (z.has(t))
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
function $t(t, e, n) {
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
function It(t, e, n) {
  let r = t.firstChild, s = r, o = 0;
  for (; r; ) {
    let i = Ct(r, e, n);
    i > o && (s = r, o = i), r = r.nextSibling;
  }
  return s;
}
function Ct(t, e, n) {
  return Y(t, e) ? 0.5 + j(n, t, e) : 0;
}
function Ue(t, e) {
  I(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function Rt(t, e) {
  return !t.deadIds.has(e);
}
function xt(t, e, n) {
  return t.idMap.get(n)?.has(e) || !1;
}
function I(t, e) {
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
    Rt(t, o) && xt(t, o, n) && ++s;
  return s;
}
function ve(t, e) {
  const n = t.parentElement, r = t.querySelectorAll("[id]");
  for (const s of r) {
    let o = s;
    for (; o !== n && o; ) {
      let i = e.get(o);
      i == null && (i = /* @__PURE__ */ new Set(), e.set(o, i)), i.add(s.id), o = o.parentElement;
    }
  }
}
function Ot(t, e) {
  const n = /* @__PURE__ */ new Map();
  return ve(t, n), ve(e, n), n;
}
const se = "display", ye = "none", oe = "important", Ht = {
  prefix: "show",
  allowedModifiers: /* @__PURE__ */ new Set([oe]),
  onLoad: (t) => {
    const { el: e, modifiers: n, expressionFn: r, reactivity: s } = t;
    return s.effect(async () => {
      const i = !!await r(t), u = n.has(oe) ? oe : void 0;
      i ? e.style.length === 1 && e.style.display === ye ? e.style.removeProperty(se) : e.style.setProperty(se, "", u) : e.style.setProperty(se, ye, u);
    });
  }
}, Dt = "intersects", we = "once", be = "half", _e = "full", Ft = {
  prefix: Dt,
  allowedModifiers: /* @__PURE__ */ new Set([we, be, _e]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, n = { threshold: 0 };
    e.has(_e) ? n.threshold = 1 : e.has(be) && (n.threshold = 0.5);
    const r = new IntersectionObserver((s) => {
      s.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(we) && r.disconnect());
      });
    }, n);
    return r.observe(t.el), () => r.disconnect();
  }
}, Ee = "prepend", Se = "append", Te = new Error("Target element must have a parent if using prepend or append"), Vt = {
  prefix: "teleport",
  allowedModifiers: /* @__PURE__ */ new Set([Ee, Se]),
  allowedTagRegexps: /* @__PURE__ */ new Set(["template"]),
  bypassExpressionFunctionCreation: () => !0,
  onLoad: (t) => {
    const { el: e, modifiers: n, expression: r } = t;
    if (!(e instanceof HTMLTemplateElement))
      throw new Error("el must be a template element");
    const s = document.querySelector(r);
    if (!s)
      throw new Error(`Target element not found: ${r}`);
    if (!e.content)
      throw new Error("Template element must have content");
    const o = e.content.cloneNode(!0);
    if (Ne(o)?.firstElementChild)
      throw new Error("Empty template");
    if (n.has(Ee)) {
      if (!s.parentNode)
        throw Te;
      s.parentNode.insertBefore(o, s);
    } else if (n.has(Se)) {
      if (!s.parentNode)
        throw Te;
      s.parentNode.insertBefore(o, s.nextSibling);
    } else
      s.appendChild(o);
  }
}, jt = {
  prefix: "scrollIntoView",
  mustHaveEmptyKey: !0,
  mustHaveEmptyExpression: !0,
  allowedModifiers: /* @__PURE__ */ new Set([
    "smooth",
    "instant",
    "auto",
    "hstart",
    "hcenter",
    "hend",
    "hnearest",
    "vstart",
    "vcenter",
    "vend",
    "vnearest",
    "focus"
  ]),
  onLoad: ({ el: t, modifiers: e }) => {
    t.tabIndex || t.setAttribute("tabindex", "0");
    const n = {
      behavior: "smooth",
      block: "center",
      inline: "center"
    };
    return e.has("smooth") && (n.behavior = "smooth"), e.has("instant") && (n.behavior = "instant"), e.has("auto") && (n.behavior = "auto"), e.has("hstart") && (n.inline = "start"), e.has("hcenter") && (n.inline = "center"), e.has("hend") && (n.inline = "end"), e.has("hnearest") && (n.inline = "nearest"), e.has("vstart") && (n.block = "start"), e.has("vcenter") && (n.block = "center"), e.has("vend") && (n.block = "end"), e.has("vnearest") && (n.block = "nearest"), t.scrollIntoView(n), e.has("focus") && t.focus(), delete t.dataset.focus, () => t.blur();
  }
}, qe = document, We = !!qe.startViewTransition, Bt = {
  prefix: "viewTransition",
  onGlobalInit() {
    let t = !1;
    if (document.head.childNodes.forEach((e) => {
      e instanceof HTMLMetaElement && e.name === "view-transition" && (t = !0);
    }), !t) {
      const e = document.createElement("meta");
      e.name = "view-transition", e.content = "same-origin", document.head.appendChild(e);
    }
  },
  onLoad: (t) => {
    if (!We) {
      console.error("Browser does not support view transitions");
      return;
    }
    return t.reactivity.effect(() => {
      const { el: e, expressionFn: n } = t;
      let r = n(t);
      if (!r)
        return;
      const s = e.style;
      s.viewTransitionName = r;
    });
  }
}, Ut = [
  Ht,
  Ft,
  Vt,
  jt,
  Bt
], qt = "Content-Type", Wt = "datastar-request", Gt = "application/json", Kt = "true", B = "datastar-", U = `${B}indicator`, Q = `${U}-loading`, Ae = `${B}settling`, J = `${B}swapping`, Jt = "self", zt = "get", Zt = "post", Xt = "put", Yt = "patch", Qt = "delete", en = [zt, Zt, Xt, Yt, Qt].reduce(
  (t, e) => (t[e] = async (n, r) => {
    const s = Document;
    if (!s.startViewTransition) {
      await ke(e, r, n);
      return;
    }
    new Promise((o) => {
      s.startViewTransition(async () => {
        await ke(e, r, n), o(void 0);
      });
    });
  }, t),
  {
    isFetching: async (t, e) => {
      const n = document.querySelectorAll(e);
      return Array.from(n).some((r) => {
        r.classList.contains(Q);
      });
    }
  }
), A = {
  MorphElement: "morph_element",
  InnerElement: "inner_element",
  OuterElement: "outer_element",
  PrependElement: "prepend_element",
  AppendElement: "append_element",
  BeforeElement: "before_element",
  AfterElement: "after_element",
  DeleteElement: "delete_element",
  UpsertAttributes: "upsert_attributes"
}, tn = {
  prefix: "header",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => {
    const e = t.store();
    e.fetch || (e.fetch = {}), e.fetch.headers || (e.fetch.headers = {});
    const n = e.fetch.headers, r = t.key[0].toUpperCase() + t.key.slice(1);
    return n[r] = t.reactivity.computed(() => t.expressionFn(t)), () => {
      delete n[r];
    };
  }
}, nn = {
  prefix: "fetchIndicator",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onGlobalInit: () => {
    const t = document.createElement("style");
    t.innerHTML = `
.${U}{
 opacity:0;
 transition: opacity 300ms ease-out;
}
.${Q} {
 opacity:1;
 transition: opacity 300ms ease-in;
}
`, document.head.appendChild(t);
  },
  onLoad: (t) => t.reactivity.effect(() => {
    const e = t.reactivity.computed(() => `${t.expressionFn(t)}`), n = t.store();
    n.fetch || (n.fetch = {}), n.fetch.indicatorSelectors || (n.fetch.indicatorSelectors = {}), n.fetch.indicatorSelectors[t.el.id] = e;
    const r = document.querySelector(e.value);
    if (!r)
      throw new Error("No indicator found");
    return r.classList.add(U), () => {
      delete n.fetch.indicatorSelectors[t.el.id];
    };
  })
}, rn = {
  prefix: "isLoadingId",
  mustNotEmptyExpression: !0,
  onLoad: (t) => {
    const e = t.expression, n = t.store();
    return n.fetch || (n.fetch = {}), n.fetch.loadingIdentifiers || (n.fetch.loadingIdentifiers = {}), n.fetch.loadingIdentifiers[t.el.id] = e, n.isLoading || (n.isLoading = t.reactivity.signal(/* @__PURE__ */ new Set())), () => {
      delete n.fetch.loadingIdentifiers[t.el.id];
    };
  }
}, sn = [tn, nn, rn];
async function ke(t, e, n) {
  const r = n.store();
  if (!e)
    throw new Error(`No signal for ${t} on ${e}`);
  const s = { ...r.value };
  delete s.fetch;
  const o = JSON.stringify(s);
  let i = !1, a = n.el;
  const u = r.fetch?.indicatorSelectors?.[a.id] || null;
  if (u) {
    const c = document.querySelector(u.value);
    c && (a = c, a.classList.remove(U), a.classList.add(Q), i = !0);
  }
  const f = r.fetch?.loadingIdentifiers?.[a.id] || null;
  f && (r.isLoading.value = /* @__PURE__ */ new Set([...r.isLoading.value, f]));
  const l = new URL(e, window.location.origin);
  t = t.toUpperCase();
  const h = {
    method: t,
    headers: {
      [qt]: Gt,
      [Wt]: Kt
    },
    onmessage: (c) => {
      if (!c.event)
        return;
      let y = "", b = "morph_element", E = "", p = 500, m = !1, d = "", w, v = !1, T = !1;
      if (!c.event.startsWith(B))
        throw new Error(`Unknown event: ${c.event}`);
      switch (c.event.slice(B.length)) {
        case "redirect":
          m = !0;
          break;
        case "fragment":
          T = !0;
          break;
        case "error":
          v = !0;
          break;
        default:
          throw `Unknown event: ${c}`;
      }
      if (c.data.split(`
`).forEach((S) => {
        const $ = S.indexOf(" ");
        if ($ === -1)
          throw new Error("Missing space in data");
        const re = S.slice(0, $), L = S.slice($ + 1);
        switch (re) {
          case "selector":
            E = L;
            break;
          case "merge":
            const O = L;
            if (!Object.values(A).includes(O))
              throw new Error(`Unknown merge option: ${O}`);
            b = O;
            break;
          case "settle":
            p = parseInt(L);
            break;
          case "fragment":
          case "html":
            y = L;
            break;
          case "redirect":
            d = L;
            break;
          case "error":
            w = new Error(L);
            break;
          default:
            throw new Error("Unknown data type");
        }
      }), v && w)
        throw w;
      if (m && d)
        window.location.href = d;
      else if (T && y)
        on(n, E, b, y, p);
      else
        throw new Error(`Unknown event: ${c}`);
    },
    onclose: () => {
      i && setTimeout(() => {
        a.classList.remove(Q), a.classList.add(U);
      }, 300), f && setTimeout(() => {
        const c = r.isLoading.value;
        c.delete(f), r.isLoading.value = new Set(c);
      }, 300);
    }
  };
  if (r.fetch?.headers?.value && h.headers)
    for (const c in r.fetch.headers.value) {
      const y = r.fetch.headers.value[c];
      h.headers[c] = y;
    }
  if (t === "GET") {
    const c = new URLSearchParams(l.search);
    c.append("datastar", o), l.search = c.toString();
  } else
    h.body = o;
  await vt(l, h);
}
const Le = document.createElement("template");
function on(t, e, n, r, s) {
  const { el: o } = t;
  Le.innerHTML = r;
  const i = Le.content.firstChild;
  if (!(i instanceof Element))
    throw new Error("No fragment found");
  const a = e === Jt;
  let u;
  if (a)
    u = [o];
  else {
    const l = e || `#${i.getAttribute("id")}`;
    if (u = document.querySelectorAll(l) || [], !u)
      throw new Error(`No targets found for ${l}`);
  }
  const f = () => {
    for (const l of u) {
      l.classList.add(J);
      const h = l.outerHTML;
      let c = l;
      switch (n) {
        case A.MorphElement:
          const b = Tt(c, i);
          if (!b?.length)
            throw new Error("No morph result");
          c = b[0];
          break;
        case A.InnerElement:
          c.innerHTML = i.innerHTML;
          break;
        case A.OuterElement:
          c.replaceWith(i);
          break;
        case A.PrependElement:
          c.prepend(i);
          break;
        case A.AppendElement:
          c.append(i);
          break;
        case A.BeforeElement:
          c.before(i);
          break;
        case A.AfterElement:
          c.after(i);
          break;
        case A.DeleteElement:
          setTimeout(() => c.remove(), s);
          break;
        case A.UpsertAttributes:
          i.getAttributeNames().forEach((p) => {
            const m = i.getAttribute(p);
            c.setAttribute(p, m);
          });
          break;
        default:
          throw new Error(`Unknown merge type: ${n}`);
      }
      c.classList.add(J), t.cleanupElementRemovals(l), t.applyPlugins(document.body), setTimeout(() => {
        l.classList.remove(J), c.classList.remove(J);
      }, s);
      const y = c.outerHTML;
      h !== y && (c.classList.add(Ae), setTimeout(() => {
        c.classList.remove(Ae);
      }, s));
    }
  };
  We ? qe.startViewTransition(() => f()) : f();
}
const an = {
  setAll: async (t, e, n) => {
    const r = new RegExp(e);
    t.walkSignals((s, o) => r.test(s) && (o.value = n));
  },
  toggleAll: async (t, e) => {
    const n = new RegExp(e);
    t.walkSignals((r, s) => n.test(r) && (s.value = !s.value));
  },
  clipboard: async (t, e) => {
    if (!navigator.clipboard)
      throw new Error("Clipboard API not available");
    await navigator.clipboard.writeText(e);
  }
};
function ln(t = {}, ...e) {
  const n = performance.now(), r = new at(t, ...e);
  r.run();
  const s = performance.now();
  return console.log(`Datastar v${lt} loaded and attached to all DOM elements in ${s - n}ms`), r;
}
function cn(t = {}, ...e) {
  const n = Object.assign({}, an, en, t), r = [...sn, ...Ut, ...pt, ...e];
  return ln(n, ...r);
}
const Ge = window;
Ge.ds = cn();
Ge.dispatchEvent(new CustomEvent("datastar-ready"));
export {
  at as Datastar,
  ln as runDatastarWith,
  cn as runDatastarWithAllPlugins,
  Ne as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
