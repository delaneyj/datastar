function ke(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function X() {
  throw new Error("Cycle detected");
}
function Ke() {
  throw new Error("Computed cannot have side-effects");
}
const Je = Symbol.for("preact-signals"), L = 1, I = 2, H = 4, C = 8, R = 16, P = 32;
function Y() {
  O++;
}
function Q() {
  if (O > 1) {
    O--;
    return;
  }
  let t, e = !1;
  for (; x !== void 0; ) {
    let n = x;
    for (x = void 0, re++; n !== void 0; ) {
      const r = n._nextBatchedEffect;
      if (n._nextBatchedEffect = void 0, n._flags &= ~I, !(n._flags & C) && Pe(n))
        try {
          n._callback();
        } catch (s) {
          e || (t = s, e = !0);
        }
      n = r;
    }
  }
  if (re = 0, O--, e)
    throw t;
}
function ze(t) {
  if (O > 0)
    return t();
  Y();
  try {
    return t();
  } finally {
    Q();
  }
}
let v, x, O = 0, re = 0, J = 0;
function Ne(t) {
  if (v === void 0)
    return;
  let e = t._node;
  if (e === void 0 || e._target !== v)
    return e = {
      _version: 0,
      _source: t,
      _prevSource: v._sources,
      _nextSource: void 0,
      _target: v,
      _prevTarget: void 0,
      _nextTarget: void 0,
      _rollbackNode: e
    }, v._sources !== void 0 && (v._sources._nextSource = e), v._sources = e, t._node = e, v._flags & P && t._subscribe(e), e;
  if (e._version === -1)
    return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = v._sources, e._nextSource = void 0, v._sources._nextSource = e, v._sources = e), e;
}
function E(t) {
  this._value = t, this._version = 0, this._node = void 0, this._targets = void 0;
}
E.prototype.brand = Je;
E.prototype._refresh = function() {
  return !0;
};
E.prototype._subscribe = function(t) {
  this._targets !== t && t._prevTarget === void 0 && (t._nextTarget = this._targets, this._targets !== void 0 && (this._targets._prevTarget = t), this._targets = t);
};
E.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0) {
    const e = t._prevTarget, n = t._nextTarget;
    e !== void 0 && (e._nextTarget = n, t._prevTarget = void 0), n !== void 0 && (n._prevTarget = e, t._nextTarget = void 0), t === this._targets && (this._targets = n);
  }
};
E.prototype.subscribe = function(t) {
  const e = this;
  return Re(function() {
    const n = e.value, r = this._flags & P;
    this._flags &= ~P;
    try {
      t(n);
    } finally {
      this._flags |= r;
    }
  });
};
E.prototype.valueOf = function() {
  return this.value;
};
E.prototype.toString = function() {
  return this.value + "";
};
E.prototype.toJSON = function() {
  return this.value;
};
E.prototype.peek = function() {
  return this._value;
};
Object.defineProperty(E.prototype, "value", {
  get() {
    const t = Ne(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (v instanceof k && Ke(), t !== this._value) {
      re > 100 && X(), this._value = t, this._version++, J++, Y();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        Q();
      }
    }
  }
});
function Me(t) {
  return new E(t);
}
function Pe(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    if (e._source._version !== e._version || !e._source._refresh() || e._source._version !== e._version)
      return !0;
  return !1;
}
function $e(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource) {
    const n = e._source._node;
    if (n !== void 0 && (e._rollbackNode = n), e._source._node = e, e._version = -1, e._nextSource === void 0) {
      t._sources = e;
      break;
    }
  }
}
function Ie(t) {
  let e = t._sources, n;
  for (; e !== void 0; ) {
    const r = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), r !== void 0 && (r._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = r)) : n = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = r;
  }
  t._sources = n;
}
function k(t) {
  E.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = J - 1, this._flags = H;
}
k.prototype = new E();
k.prototype._refresh = function() {
  if (this._flags &= ~I, this._flags & L)
    return !1;
  if ((this._flags & (H | P)) === P || (this._flags &= ~H, this._globalVersion === J))
    return !0;
  if (this._globalVersion = J, this._flags |= L, this._version > 0 && !Pe(this))
    return this._flags &= ~L, !0;
  const t = v;
  try {
    $e(this), v = this;
    const e = this._compute();
    (this._flags & R || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~R, this._version++);
  } catch (e) {
    this._value = e, this._flags |= R, this._version++;
  }
  return v = t, Ie(this), this._flags &= ~L, !0;
};
k.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= H | P;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  E.prototype._subscribe.call(this, t);
};
k.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (E.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~P;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
k.prototype._notify = function() {
  if (!(this._flags & I)) {
    this._flags |= H | I;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
k.prototype.peek = function() {
  if (this._refresh() || X(), this._flags & R)
    throw this._value;
  return this._value;
};
Object.defineProperty(k.prototype, "value", {
  get() {
    this._flags & L && X();
    const t = Ne(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & R)
      throw this._value;
    return this._value;
  }
});
function Ze(t) {
  return new k(t);
}
function Ce(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    Y();
    const n = v;
    v = void 0;
    try {
      e();
    } catch (r) {
      throw t._flags &= ~L, t._flags |= C, ae(t), r;
    } finally {
      v = n, Q();
    }
  }
}
function ae(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Ce(t);
}
function Xe(t) {
  if (v !== this)
    throw new Error("Out-of-order effect");
  Ie(this), v = t, this._flags &= ~L, this._flags & C && ae(this), Q();
}
function V(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = P;
}
V.prototype._callback = function() {
  const t = this._start();
  try {
    if (this._flags & C || this._compute === void 0)
      return;
    const e = this._compute();
    typeof e == "function" && (this._cleanup = e);
  } finally {
    t();
  }
};
V.prototype._start = function() {
  this._flags & L && X(), this._flags |= L, this._flags &= ~C, Ce(this), $e(this), Y();
  const t = v;
  return v = this, Xe.bind(this, t);
};
V.prototype._notify = function() {
  this._flags & I || (this._flags |= I, this._nextBatchedEffect = x, x = this);
};
V.prototype._dispose = function() {
  this._flags |= C, this._flags & L || ae(this);
};
function Re(t) {
  const e = new V(t);
  try {
    e._callback();
  } catch (n) {
    throw e._dispose(), n;
  }
  return e._dispose.bind(e);
}
class xe {
  get value() {
    return oe(this);
  }
  set value(e) {
    ze(() => Ye(this, e));
  }
  peek() {
    return oe(this, { peek: !0 });
  }
}
const se = (t) => Object.assign(
  new xe(),
  Object.entries(t).reduce(
    (e, [n, r]) => {
      if (["value", "peek"].some((s) => s === n))
        throw new Error(`${n} is a reserved property name`);
      return typeof r != "object" || r === null || Array.isArray(r) ? e[n] = Me(r) : e[n] = se(r), e;
    },
    {}
  )
), Ye = (t, e) => Object.keys(e).forEach((n) => t[n].value = e[n]), oe = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (n, [r, s]) => (s instanceof E ? n[r] = e ? s.peek() : s.value : s instanceof xe && (n[r] = oe(s, { peek: e })), n),
  {}
);
function Oe(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return e;
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let n = t;
  return typeof t != "object" && (n = { ...e }), Object.keys(e).forEach((r) => {
    n.hasOwnProperty(r) || (n[r] = e[r]), e[r] === null ? delete n[r] : n[r] = Oe(n[r], e[r]);
  }), n;
}
const Qe = "[a-zA-Z_$][0-9a-zA-Z_$.]+";
function le(t, e, n) {
  return new RegExp(`(?<whole>\\${t}(?<${e}>${Qe})${n})`, "g");
}
const et = {
  regexp: le("$", "signal", "(?<method>\\([^\\)]*\\))?"),
  replacer: (t) => {
    const { signal: e, method: n } = t, r = "ctx.store()";
    if (!n?.length)
      return `${r}.${e}.value`;
    const s = e.split("."), o = s.pop(), i = s.join(".");
    return `${r}.${i}.value.${o}${n}`;
  }
}, tt = {
  regexp: le("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => {
    const n = ["ctx"];
    e && n.push(...e.split(",").map((s) => s.trim()));
    const r = n.join(",");
    return `ctx.actions.${t}(${r})`;
  }
}, nt = {
  regexp: le("~", "ref", ""),
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
  store = se({});
  actions = {};
  refs = {};
  reactivity = {
    signal: Me,
    computed: Ze,
    effect: Re
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
    const n = Oe(this.store.value, e);
    this.store = se(n);
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
            if (![...r.allowedTagRegexps].some((h) => p.match(h)))
              throw new Error(
                `'${o.tagName}' not allowed for '${i}', allowed ${[
                  [...r.allowedTagRegexps].map((h) => `'${h}'`)
                ].join(", ")}`
              );
          }
          let u = i.slice(r.prefix.length), [f, ...l] = u.split(".");
          if (r.mustHaveEmptyKey && f.length > 0)
            throw new Error(`'${i}' must have empty key`);
          if (r.mustNotEmptyKey && f.length === 0)
            throw new Error(`'${i}' must have non-empty key`);
          f.length && (f = f[0].toLowerCase() + f.slice(1));
          const d = l.map((p) => {
            const [m, ...h] = p.split("_");
            return { label: m, args: h };
          });
          if (r.allowedModifiers) {
            for (const p of d)
              if (!r.allowedModifiers.has(p.label))
                throw new Error(`'${p.label}' is not allowed`);
          }
          const c = /* @__PURE__ */ new Map();
          for (const p of d)
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
            const m = a.split(";"), h = [];
            m.forEach((b) => {
              let g = b;
              const _ = [...g.matchAll(p.regexp)];
              if (_.length)
                for (const T of _) {
                  if (!T.groups)
                    continue;
                  const { groups: N } = T, { whole: j } = N;
                  g = g.replace(j, p.replacer(N));
                }
              h.push(g);
            }), a = h.join("; ");
          }
          const w = {
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
          if (!r.bypassExpressionFunctionCreation?.(w) && !r.mustHaveEmptyExpression && a.length) {
            const p = a.split(";").map((h) => h.trim());
            p[p.length - 1] = `return ${p[p.length - 1]}`;
            let m = `
try {
${p.map((h) => `  ${h}`).join(`;
`)}
} catch (e) {
  throw e
}
            `;
            try {
              const h = new Function("ctx", m);
              w.expressionFn = h;
            } catch (h) {
              throw new Error(`Error creating expression function for '${m}', error: ${h}`);
            }
          }
          const S = r.onLoad(w);
          S && (this.removals.has(o) || this.removals.set(o, /* @__PURE__ */ new Set()), this.removals.get(o).add(S));
        }
      });
    });
  }
  walkSignalsStore(e, n) {
    const r = Object.keys(e);
    for (let s = 0; s < r.length; s++) {
      const o = r[s], i = e[o], a = i instanceof E, u = typeof i == "object" && Object.keys(i).length > 0;
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
    const s = ke(e);
    if (s)
      for (n(s), r = 0, e = e.firstElementChild; e; )
        this.walkDownDOM(e, n, r++), e = e.nextElementSibling;
  }
}
const lt = "0.12.4", He = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, n) => (n ? "-" : "") + e.toLowerCase()), ct = {
  prefix: "bind",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(async () => {
    const e = He(t.key), r = `${await t.expressionFn(t)}`;
    !r || r === "false" || r === "null" || r === "undefined" ? t.el.removeAttribute(e) : t.el.setAttribute(e, r);
  })
}, ut = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/, B = ["change", "input", "keydown"], ft = {
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
    const o = s.includes("input"), i = s.includes("select"), a = s.includes("textarea"), u = e.getAttribute("type"), f = s.includes("checkbox") || o && u === "checkbox", l = s.includes("radio") || o && u === "radio", d = o && u === "file";
    if (!o && !i && !a && !f && !l)
      throw new Error("Element must be input, select, textarea, checkbox or radio");
    l && (e.getAttribute("name")?.length || e.setAttribute("name", n));
    const c = () => {
      if (!r)
        throw new Error(`Signal ${n} not found`);
      const m = "value" in e, h = r.value;
      if (f || l) {
        const b = e;
        f ? b.checked = h : l && (b.checked = `${h}` === b.value);
      } else {
        if (d)
          throw new Error("File input reading is not supported yet");
        m ? e.value = `${h}` : e.setAttribute("value", `${h}`);
      }
    }, y = t.reactivity.effect(c), w = () => {
      if (d) {
        const [b] = e?.files || [];
        if (!b) {
          r.value = "";
          return;
        }
        const g = new FileReader(), _ = t.store();
        g.onload = () => {
          if (typeof g.result != "string")
            throw new Error("Unsupported type");
          const N = g.result.match(ut);
          if (!N?.groups)
            throw new Error("Invalid data URI");
          const { mime: j, contents: ce } = N.groups;
          r.value = ce;
          const ue = `${n}Mime`;
          if (ue in _) {
            const Ge = _[`${ue}`];
            Ge.value = j;
          }
        }, g.readAsDataURL(b);
        const T = `${n}Name`;
        if (T in _) {
          const N = _[`${T}`];
          N.value = b.name;
        }
        return;
      }
      const m = r.value, h = e;
      if (typeof m == "number")
        r.value = Number(h.value);
      else if (typeof m == "string")
        r.value = h.value;
      else if (typeof m == "boolean")
        f ? r.value = h.checked : r.value = !!h.value;
      else if (!(typeof m > "u"))
        if (typeof m == "bigint")
          r.value = BigInt(h.value);
        else
          throw console.log(typeof m), new Error("Unsupported type");
    }, S = e.tagName.split("-");
    if (S.length > 1) {
      const m = S[0].toLowerCase();
      B.forEach((h) => {
        B.push(`${m}-${h}`);
      });
    }
    return B.forEach((m) => e.addEventListener(m, w)), () => {
      y(), B.forEach((m) => e.removeEventListener(m, w));
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
      const f = fe(o), l = U(o, "leading", !1), d = U(o, "noTrail", !0);
      s = mt(s, f, l, d);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const f = fe(i), l = U(i, "noLead", !0), d = U(i, "noTrail", !0);
      s = gt(s, f, l, d);
    }
    const a = {
      capture: !0,
      passive: !1,
      once: !1
    };
    t.modifiers.has("capture") || (a.capture = !1), t.modifiers.has("passive") && (a.passive = !0), t.modifiers.has("once") && (a.once = !0);
    const u = He(n).toLowerCase();
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
function fe(t) {
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
function U(t, e, n = !1) {
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
    const d = { ...n };
    d.accept || (d.accept = ie);
    let c;
    function y() {
      c.abort(), document.hidden || h();
    }
    a || document.addEventListener("visibilitychange", y);
    let w = yt, S = 0;
    function p() {
      document.removeEventListener("visibilitychange", y), window.clearTimeout(S), c.abort();
    }
    e?.addEventListener("abort", () => {
      p(), f();
    });
    const m = r ?? wt;
    async function h() {
      c = new AbortController();
      try {
        const b = await fetch(t, {
          ...u,
          headers: d,
          signal: c.signal
        });
        await m(b), await bt(
          b.body,
          _t(
            Et(
              (g) => {
                g ? d[de] = g : delete d[de];
              },
              (g) => {
                w = g;
              },
              s
            )
          )
        ), o?.(), p(), f();
      } catch (b) {
        if (!c.signal.aborted)
          try {
            const g = i?.(b) ?? w;
            window.clearTimeout(S), S = window.setTimeout(h, g);
          } catch (g) {
            p(), l(g);
          }
      }
    }
    h();
  });
}
const ie = "text/event-stream", yt = 1e3, de = "last-event-id";
function wt(t) {
  const e = t.headers.get("content-type");
  if (!e?.startsWith(ie))
    throw new Error(`Expected content-type to be ${ie}, Actual: ${e}`);
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
  let r = he();
  const s = new TextDecoder();
  return function(i, a) {
    if (i.length === 0)
      n?.(r), r = he();
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
          const d = parseInt(l, 10);
          isNaN(d) || e(r.retry = d);
          break;
      }
    }
  };
}
function St(t, e) {
  const n = new Uint8Array(t.length + e.length);
  return n.set(t), n.set(e, t.length), n;
}
function he() {
  return {
    data: "",
    event: "",
    id: "",
    retry: void 0
  };
}
const G = /* @__PURE__ */ new WeakSet();
function Tt(t, e, n = {}) {
  t instanceof Document && (t = t.documentElement);
  let r;
  typeof e == "string" ? r = Mt(e) : r = e;
  const s = Pt(r), o = Lt(t, s, n);
  return De(t, s, o);
}
function De(t, e, n) {
  if (n.head.block) {
    const r = t.querySelector("head"), s = e.querySelector("head");
    if (r && s) {
      const o = Ve(s, r, n);
      Promise.all(o).then(() => {
        De(
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
    return Fe(e, t, n), t.children;
  if (n.morphStyle === "outerHTML" || n.morphStyle == null) {
    const r = It(e, t, n);
    if (!r)
      throw new Error("Could not find best match");
    const s = r?.previousSibling, o = r?.nextSibling, i = K(t, r, n);
    return r ? $t(s, i, o) : [];
  } else
    throw "Do not understand how to morph style " + n.morphStyle;
}
function K(t, e, n) {
  if (!(n.ignoreActive && t === document.activeElement))
    if (e == null) {
      if (n.callbacks.beforeNodeRemoved(t) === !1)
        return;
      t.remove(), n.callbacks.afterNodeRemoved(t);
      return;
    } else {
      if (z(t, e))
        return n.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && n.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && n.head.style !== "morph" ? Ve(e, t, n) : (At(e, t), Fe(e, t, n))), n.callbacks.afterNodeMorphed(t, e), t);
      if (n.callbacks.beforeNodeRemoved(t) === !1 || n.callbacks.beforeNodeAdded(e) === !1)
        return;
      if (!t.parentElement)
        throw new Error("oldNode has no parentElement");
      return t.parentElement.replaceChild(e, t), n.callbacks.afterNodeAdded(e), n.callbacks.afterNodeRemoved(t), e;
    }
}
function Fe(t, e, n) {
  let r = t.firstChild, s = e.firstChild, o;
  for (; r; ) {
    if (o = r, r = o.nextSibling, s == null) {
      if (n.callbacks.beforeNodeAdded(o) === !1)
        return;
      e.appendChild(o), n.callbacks.afterNodeAdded(o), $(n, o);
      continue;
    }
    if (je(o, s, n)) {
      K(s, o, n), s = s.nextSibling, $(n, o);
      continue;
    }
    let i = kt(t, e, o, s, n);
    if (i) {
      s = pe(s, i, n), K(i, o, n), $(n, o);
      continue;
    }
    let a = Nt(t, o, s, n);
    if (a) {
      s = pe(s, a, n), K(a, o, n), $(n, o);
      continue;
    }
    if (n.callbacks.beforeNodeAdded(o) === !1)
      return;
    e.insertBefore(o, s), n.callbacks.afterNodeAdded(o), $(n, o);
  }
  for (; s !== null; ) {
    let i = s;
    s = s.nextSibling, Be(i, n);
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
    e.value = t.value || "", W(t, e, "value"), W(t, e, "checked"), W(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    W(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const r = t.value, s = e.value;
    r !== s && (e.value = r), e.firstChild && e.firstChild.nodeValue !== r && (e.firstChild.nodeValue = r);
  }
}
function W(t, e, n) {
  const r = t.getAttribute(n), s = e.getAttribute(n);
  r !== s && (r ? e.setAttribute(n, r) : e.removeAttribute(n));
}
function Ve(t, e, n) {
  const r = [], s = [], o = [], i = [], a = n.head.style, u = /* @__PURE__ */ new Map();
  for (const l of t.children)
    u.set(l.outerHTML, l);
  for (const l of e.children) {
    let d = u.has(l.outerHTML), c = n.head.shouldReAppend(l), y = n.head.shouldPreserve(l);
    d || y ? c ? s.push(l) : (u.delete(l.outerHTML), o.push(l)) : a === "append" ? c && (s.push(l), i.push(l)) : n.head.shouldRemove(l) !== !1 && s.push(l);
  }
  i.push(...u.values());
  const f = [];
  for (const l of i) {
    const d = document.createRange().createContextualFragment(l.outerHTML).firstChild;
    if (!d)
      throw new Error("could not create new element from: " + l.outerHTML);
    if (n.callbacks.beforeNodeAdded(d)) {
      if (d.hasAttribute("href") || d.hasAttribute("src")) {
        let c;
        const y = new Promise((w) => {
          c = w;
        });
        d.addEventListener("load", function() {
          c(void 0);
        }), f.push(y);
      }
      e.appendChild(d), n.callbacks.afterNodeAdded(d), r.push(d);
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
function Lt(t, e, n) {
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
function je(t, e, n) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : D(n, t, e) > 0 : !1;
}
function z(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function pe(t, e, n) {
  for (; t !== e; ) {
    const r = t;
    if (t = t?.nextSibling, !r)
      throw new Error("tempNode is null");
    Be(r, n);
  }
  return $(n, e), e.nextSibling;
}
function kt(t, e, n, r, s) {
  const o = D(s, n, e);
  let i = null;
  if (o > 0) {
    i = r;
    let a = 0;
    for (; i != null; ) {
      if (je(n, i, s))
        return i;
      if (a += D(s, i, t), a > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function Nt(t, e, n, r) {
  let s = n, o = e.nextSibling, i = 0;
  for (; s && o; ) {
    if (D(r, s, t) > 0)
      return null;
    if (z(e, s))
      return s;
    if (z(o, s) && (i++, o = o.nextSibling, i >= 2))
      return null;
    s = s.nextSibling;
  }
  return s;
}
const me = new DOMParser();
function Mt(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const n = me.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return G.add(n), n;
    {
      let r = n.firstChild;
      return r ? (G.add(r), r) : null;
    }
  } else {
    const r = me.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!r)
      throw new Error("content is null");
    return G.add(r), r;
  }
}
function Pt(t) {
  if (t == null)
    return document.createElement("div");
  if (G.has(t))
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
  return z(t, e) ? 0.5 + D(n, t, e) : 0;
}
function Be(t, e) {
  $(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function Rt(t, e) {
  return !t.deadIds.has(e);
}
function xt(t, e, n) {
  return t.idMap.get(n)?.has(e) || !1;
}
function $(t, e) {
  const n = t.idMap.get(e);
  if (n)
    for (const r of n)
      t.deadIds.add(r);
}
function D(t, e, n) {
  const r = t.idMap.get(e);
  if (!r)
    return 0;
  let s = 0;
  for (const o of r)
    Rt(t, o) && xt(t, o, n) && ++s;
  return s;
}
function ge(t, e) {
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
  return ge(t, n), ge(e, n), n;
}
const te = "display", ve = "none", ne = "important", Ht = {
  prefix: "show",
  allowedModifiers: /* @__PURE__ */ new Set([ne]),
  onLoad: (t) => {
    const { el: e, modifiers: n, expressionFn: r, reactivity: s } = t;
    return s.effect(async () => {
      const i = !!await r(t), u = n.has(ne) ? ne : void 0;
      i ? e.style.length === 1 && e.style.display === ve ? e.style.removeProperty(te) : e.style.setProperty(te, "", u) : e.style.setProperty(te, ve, u);
    });
  }
}, Dt = "intersects", ye = "once", we = "half", be = "full", Ft = {
  prefix: Dt,
  allowedModifiers: /* @__PURE__ */ new Set([ye, we, be]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, n = { threshold: 0 };
    e.has(be) ? n.threshold = 1 : e.has(we) && (n.threshold = 0.5);
    const r = new IntersectionObserver((s) => {
      s.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(ye) && r.disconnect());
      });
    }, n);
    return r.observe(t.el), () => r.disconnect();
  }
}, _e = "prepend", Ee = "append", Se = new Error("Target element must have a parent if using prepend or append"), Vt = {
  prefix: "teleport",
  allowedModifiers: /* @__PURE__ */ new Set([_e, Ee]),
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
    if (ke(o)?.firstElementChild)
      throw new Error("Empty template");
    if (n.has(_e)) {
      if (!s.parentNode)
        throw Se;
      s.parentNode.insertBefore(o, s);
    } else if (n.has(Ee)) {
      if (!s.parentNode)
        throw Se;
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
}, Ue = document, We = !!Ue.startViewTransition, Bt = {
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
], Wt = "Content-Type", qt = "datastar-request", Gt = "application/json", Kt = "true", ee = "datastar-", F = `${ee}indicator`, Z = `${F}-loading`, Te = `${ee}settling`, q = `${ee}swapping`, Jt = "self", zt = "get", Zt = "post", Xt = "put", Yt = "patch", Qt = "delete", en = [zt, Zt, Xt, Yt, Qt].reduce(
  (t, e) => (t[e] = async (n, r) => {
    const s = Document;
    if (!s.startViewTransition) {
      await Ae(e, r, n);
      return;
    }
    new Promise((o) => {
      s.startViewTransition(async () => {
        await Ae(e, r, n), o(void 0);
      });
    });
  }, t),
  {
    isFetching: async (t, e) => {
      const n = document.querySelectorAll(e);
      return Array.from(n).some((r) => {
        r.classList.contains(Z);
      });
    }
  }
), tn = ["selector", "merge", "settle", "fragment", "redirect", "error"], A = {
  MorphElement: "morph_element",
  InnerElement: "inner_element",
  OuterElement: "outer_element",
  PrependElement: "prepend_element",
  AppendElement: "append_element",
  BeforeElement: "before_element",
  AfterElement: "after_element",
  DeleteElement: "delete_element",
  UpsertAttributes: "upsert_attributes"
}, nn = {
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
}, rn = {
  prefix: "fetchIndicator",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onGlobalInit: () => {
    const t = document.createElement("style");
    t.innerHTML = `
.${F}{
 opacity:0;
 transition: opacity 300ms ease-out;
}
.${Z} {
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
    return r.classList.add(F), () => {
      delete n.fetch.indicatorSelectors[t.el.id];
    };
  })
}, sn = {
  prefix: "isLoadingId",
  mustNotEmptyExpression: !0,
  onLoad: (t) => {
    const e = t.expression, n = t.store();
    return n.fetch || (n.fetch = {}), n.fetch.loadingIdentifiers || (n.fetch.loadingIdentifiers = {}), n.fetch.loadingIdentifiers[t.el.id] = e, n.isLoading || (n.isLoading = t.reactivity.signal(/* @__PURE__ */ new Set())), () => {
      delete n.fetch.loadingIdentifiers[t.el.id];
    };
  }
}, on = [nn, rn, sn];
async function Ae(t, e, n) {
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
    c && (a = c, a.classList.remove(F), a.classList.add(Z), i = !0);
  }
  const f = r.fetch?.loadingIdentifiers?.[a.id] || null;
  f && (r.isLoading.value = /* @__PURE__ */ new Set([...r.isLoading.value, f]));
  const l = new URL(e, window.location.origin);
  t = t.toUpperCase();
  const d = {
    method: t,
    headers: {
      [Wt]: Gt,
      [qt]: Kt
    },
    onmessage: (c) => {
      if (!c.event)
        return;
      let y = "", w = "morph_element", S = "", p = 500, m = !1;
      if (!c.event.startsWith(ee))
        throw new Error(`Unknown event: ${c.event}`);
      const h = c.data.trim().split(`
`);
      let b = "";
      for (let g = 0; g < h.length; g++) {
        let _ = h[g];
        if (!_?.length)
          continue;
        const T = _.split(" ", 1)[0];
        if (tn.includes(T) && T !== b)
          switch (b = T, _ = _.slice(T.length + 1), b) {
            case "selector":
              S = _;
              break;
            case "merge":
              if (w = _, !Object.values(A).includes(w))
                throw new Error(`Unknown merge option: ${w}`);
              break;
            case "settle":
              p = parseInt(_);
              break;
            case "fragment":
              m = !0;
              break;
            case "redirect":
              window.location.href = _;
              return;
            case "error":
              throw new Error(_);
            default:
              throw new Error("Unknown data type");
          }
        b === "fragment" && (y += _ + `
`);
      }
      m && (y?.length || (y = "<div></div>"), an(n, S, w, y, p));
    },
    onclose: () => {
      i && setTimeout(() => {
        a.classList.remove(Z), a.classList.add(F);
      }, 300), f && setTimeout(() => {
        const c = r.isLoading.value;
        c.delete(f), r.isLoading.value = new Set(c);
      }, 300);
    }
  };
  if (r.fetch?.headers?.value && d.headers)
    for (const c in r.fetch.headers.value) {
      const y = r.fetch.headers.value[c];
      d.headers[c] = y;
    }
  if (t === "GET") {
    const c = new URLSearchParams(l.search);
    c.append("datastar", o), l.search = c.toString();
  } else
    d.body = o;
  await vt(l, d);
}
const Le = document.createElement("template");
function an(t, e, n, r, s) {
  const { el: o } = t;
  Le.innerHTML = r.trim();
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
      l.classList.add(q);
      const d = l.outerHTML;
      let c = l;
      switch (n) {
        case A.MorphElement:
          const w = Tt(c, i);
          if (!w?.length)
            throw new Error("No morph result");
          c = w[0];
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
      c.classList.add(q), t.cleanupElementRemovals(l), t.applyPlugins(document.body), setTimeout(() => {
        l.classList.remove(q), c.classList.remove(q);
      }, s);
      const y = c.outerHTML;
      d !== y && (c.classList.add(Te), setTimeout(() => {
        c.classList.remove(Te);
      }, s));
    }
  };
  We ? Ue.startViewTransition(() => f()) : f();
}
const ln = {
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
function cn(t = {}, ...e) {
  const n = performance.now(), r = new at(t, ...e);
  r.run();
  const s = performance.now();
  return console.log(`Datastar v${lt} loaded and attached to all DOM elements in ${s - n}ms`), r;
}
function un(t = {}, ...e) {
  const n = Object.assign({}, ln, en, t), r = [...on, ...Ut, ...pt, ...e];
  return cn(n, ...r);
}
const qe = window;
qe.ds = un();
qe.dispatchEvent(new CustomEvent("datastar-ready"));
export {
  at as Datastar,
  cn as runDatastarWith,
  un as runDatastarWithAllPlugins,
  ke as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
