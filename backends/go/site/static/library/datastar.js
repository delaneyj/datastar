function ke(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function Y() {
  throw new Error("Cycle detected");
}
function ze() {
  throw new Error("Computed cannot have side-effects");
}
const Ze = Symbol.for("preact-signals"), L = 1, I = 2, F = 4, C = 8, O = 16, P = 32;
function Q() {
  D++;
}
function ee() {
  if (D > 1) {
    D--;
    return;
  }
  let t, e = !1;
  for (; H !== void 0; ) {
    let n = H;
    for (H = void 0, se++; n !== void 0; ) {
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
  if (se = 0, D--, e)
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
let v, H, D = 0, se = 0, z = 0;
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
    const t = Ne(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (v instanceof k && ze(), t !== this._value) {
      se > 100 && Y(), this._value = t, this._version++, z++, Q();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        ee();
      }
    }
  }
});
function Me(t) {
  return new _(t);
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
  _.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = z - 1, this._flags = F;
}
k.prototype = new _();
k.prototype._refresh = function() {
  if (this._flags &= ~I, this._flags & L)
    return !1;
  if ((this._flags & (F | P)) === P || (this._flags &= ~F, this._globalVersion === z))
    return !0;
  if (this._globalVersion = z, this._flags |= L, this._version > 0 && !Pe(this))
    return this._flags &= ~L, !0;
  const t = v;
  try {
    $e(this), v = this;
    const e = this._compute();
    (this._flags & O || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~O, this._version++);
  } catch (e) {
    this._value = e, this._flags |= O, this._version++;
  }
  return v = t, Ie(this), this._flags &= ~L, !0;
};
k.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= F | P;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  _.prototype._subscribe.call(this, t);
};
k.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (_.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~P;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
k.prototype._notify = function() {
  if (!(this._flags & I)) {
    this._flags |= F | I;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
k.prototype.peek = function() {
  if (this._refresh() || Y(), this._flags & O)
    throw this._value;
  return this._value;
};
Object.defineProperty(k.prototype, "value", {
  get() {
    this._flags & L && Y();
    const t = Ne(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & O)
      throw this._value;
    return this._value;
  }
});
function Ye(t) {
  return new k(t);
}
function Ce(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    Q();
    const n = v;
    v = void 0;
    try {
      e();
    } catch (r) {
      throw t._flags &= ~L, t._flags |= C, le(t), r;
    } finally {
      v = n, ee();
    }
  }
}
function le(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Ce(t);
}
function Qe(t) {
  if (v !== this)
    throw new Error("Out-of-order effect");
  Ie(this), v = t, this._flags &= ~L, this._flags & C && le(this), ee();
}
function B(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = P;
}
B.prototype._callback = function() {
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
B.prototype._start = function() {
  this._flags & L && Y(), this._flags |= L, this._flags &= ~C, Ce(this), $e(this), Q();
  const t = v;
  return v = this, Qe.bind(this, t);
};
B.prototype._notify = function() {
  this._flags & I || (this._flags |= I, this._nextBatchedEffect = H, H = this);
};
B.prototype._dispose = function() {
  this._flags |= C, this._flags & L || le(this);
};
function Re(t) {
  const e = new B(t);
  try {
    e._callback();
  } catch (n) {
    throw e._dispose(), n;
  }
  return e._dispose.bind(e);
}
class xe {
  get value() {
    return ie(this);
  }
  set value(e) {
    Xe(() => et(this, e));
  }
  peek() {
    return ie(this, { peek: !0 });
  }
}
const oe = (t) => Object.assign(
  new xe(),
  Object.entries(t).reduce(
    (e, [n, r]) => {
      if (["value", "peek"].some((s) => s === n))
        throw new Error(`${n} is a reserved property name`);
      return typeof r != "object" || r === null || Array.isArray(r) ? e[n] = Me(r) : e[n] = oe(r), e;
    },
    {}
  )
), et = (t, e) => Object.keys(e).forEach((n) => t[n].value = e[n]), ie = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (n, [r, s]) => (s instanceof _ ? n[r] = e ? s.peek() : s.value : s instanceof xe && (n[r] = ie(s, { peek: e })), n),
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
const tt = "[a-zA-Z_$][0-9a-zA-Z_$.]+";
function ce(t, e, n) {
  return new RegExp(`(?<whole>\\${t}(?<${e}>${tt})${n})`, "g");
}
const nt = {
  regexp: ce("$", "signal", "(?<method>\\([^\\)]*\\))?"),
  replacer: (t) => {
    const { signal: e, method: n } = t, r = "ctx.store()";
    if (!n?.length)
      return `${r}.${e}.value`;
    const s = e.split("."), o = s.pop(), i = s.join(".");
    return `${r}.${i}.value.${o}${n}`;
  }
}, rt = {
  regexp: ce("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => {
    const n = ["ctx"];
    e && n.push(...e.split(",").map((s) => s.trim()));
    const r = n.join(",");
    return `ctx.actions.${t}(${r})`;
  }
}, st = {
  regexp: ce("~", "ref", ""),
  replacer({ ref: t }) {
    return `data.refs.${t}`;
  }
}, ot = [rt, nt, st], it = {
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
}, at = {
  prefix: "ref",
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
  store = oe({});
  actions = {};
  refs = {};
  reactivity = {
    signal: Me,
    computed: Ye,
    effect: Re
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
    this.store = oe(n);
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
            if (![...r.allowedTagRegexps].some((f) => p.match(f)))
              throw new Error(
                `'${o.tagName}' not allowed for '${i}', allowed ${[
                  [...r.allowedTagRegexps].map((f) => `'${f}'`)
                ].join(", ")}`
              );
          }
          let u = i.slice(r.prefix.length), [d, ...l] = u.split(".");
          if (r.mustHaveEmptyKey && d.length > 0)
            throw new Error(`'${i}' must have empty key`);
          if (r.mustNotEmptyKey && d.length === 0)
            throw new Error(`'${i}' must have non-empty key`);
          d.length && (d = d[0].toLowerCase() + d.slice(1));
          const h = l.map((p) => {
            const [E, ...f] = p.split("_");
            return { label: E, args: f };
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
          const y = [...r.preprocessors?.pre || [], ...ot, ...r.preprocessors?.post || []];
          for (const p of y) {
            if (n.has(p))
              continue;
            n.add(p);
            const E = a.split(";"), f = [];
            E.forEach((m) => {
              let g = m;
              const b = [...g.matchAll(p.regexp)];
              if (b.length)
                for (const T of b) {
                  if (!T.groups)
                    continue;
                  const { groups: N } = T, { whole: R } = N;
                  g = g.replace(R, p.replacer(N));
                }
              f.push(g);
            }), a = f.join("; ");
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
            key: d,
            expression: a,
            expressionFn: () => {
              throw new Error("Expression function not created");
            },
            modifiers: c
          };
          if (!r.bypassExpressionFunctionCreation?.(w) && !r.mustHaveEmptyExpression && a.length) {
            const p = a.split(";").map((f) => f.trim());
            p[p.length - 1] = `return ${p[p.length - 1]}`;
            let E = `
try {
${p.map((f) => `  ${f}`).join(`;
`)}
} catch (e) {
  throw e
}
            `;
            try {
              const f = new Function("ctx", E);
              w.expressionFn = f;
            } catch (f) {
              throw new Error(`Error creating expression function for '${E}', error: ${f}`);
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
    const s = ke(e);
    if (s)
      for (n(s), r = 0, e = e.firstElementChild; e; )
        this.walkDownDOM(e, n, r++), e = e.nextElementSibling;
  }
}
const ut = "0.12.6", He = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, n) => (n ? "-" : "") + e.toLowerCase()), ft = {
  prefix: "bind",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(async () => {
    const e = He(t.key), r = `${await t.expressionFn(t)}`;
    !r || r === "false" || r === "null" || r === "undefined" ? t.el.removeAttribute(e) : t.el.setAttribute(e, r);
  })
}, dt = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/, U = ["change", "input", "keydown"], ht = {
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
    const o = s.includes("input"), i = s.includes("select"), a = s.includes("textarea"), u = e.getAttribute("type"), d = s.includes("checkbox") || o && u === "checkbox", l = s.includes("radio") || o && u === "radio", h = o && u === "file";
    if (!o && !i && !a && !d && !l)
      throw new Error("Element must be input, select, textarea, checkbox or radio");
    const c = n.replaceAll("ctx.store().", "");
    l && (e.getAttribute("name")?.length || e.setAttribute("name", c));
    const y = () => {
      if (!r)
        throw new Error(`Signal ${c} not found`);
      const f = "value" in e, m = r.value;
      if (d || l) {
        const g = e;
        d ? g.checked = m : l && (g.checked = `${m}` === g.value);
      } else
        h || (f ? e.value = `${m}` : e.setAttribute("value", `${m}`));
    }, w = t.reactivity.effect(y), S = async () => {
      if (h)
        return await new Promise((g) => {
          const [b] = e?.files || [];
          if (!b) {
            r.value = "";
            return;
          }
          const T = new FileReader(), N = t.store();
          T.onload = () => {
            if (typeof T.result != "string")
              throw new Error("Unsupported type");
            const x = T.result.match(dt);
            if (!x?.groups)
              throw new Error("Invalid data URI");
            const { mime: Ge, contents: Ke } = x.groups;
            r.value = Ke;
            const ue = `${c}Mime`;
            if (ue in N) {
              const Je = N[`${ue}`];
              Je.value = Ge;
            }
          }, T.onloadend = () => g(void 0), T.readAsDataURL(b);
          const R = `${c}Name`;
          if (R in N) {
            const x = N[`${R}`];
            x.value = b.name;
          }
        });
      const f = r.value, m = e;
      if (typeof f == "number")
        r.value = Number(m.value);
      else if (typeof f == "string")
        r.value = m.value;
      else if (typeof f == "boolean")
        d ? r.value = m.checked : r.value = !!m.value;
      else if (!(typeof f > "u"))
        if (typeof f == "bigint")
          r.value = BigInt(m.value);
        else
          throw console.log(typeof f), new Error("Unsupported type");
    }, p = e.tagName.split("-");
    if (p.length > 1) {
      const f = p[0].toLowerCase();
      U.forEach((m) => {
        U.push(`${f}-${m}`);
      });
    }
    return U.forEach((f) => e.addEventListener(f, S)), () => {
      w(), U.forEach((f) => e.removeEventListener(f, S));
    };
  }
}, pt = {
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
}, mt = {
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
      const d = fe(o), l = W(o, "leading", !1), h = W(o, "noTrail", !0);
      s = vt(s, d, l, h);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const d = fe(i), l = W(i, "noLead", !0), h = W(i, "noTrail", !0);
      s = yt(s, d, l, h);
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
}, gt = [
  ft,
  ht,
  pt,
  mt
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
function W(t, e, n = !1) {
  return t ? t.includes(e) || n : !1;
}
function vt(t, e, n = !1, r = !0) {
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
function wt(t, {
  signal: e,
  headers: n,
  onopen: r,
  onmessage: s,
  onclose: o,
  onerror: i,
  openWhenHidden: a,
  ...u
}) {
  return new Promise((d, l) => {
    const h = { ...n };
    h.accept || (h.accept = ae);
    let c;
    function y() {
      c.abort(), document.hidden || f();
    }
    a || document.addEventListener("visibilitychange", y);
    let w = bt, S = 0;
    function p() {
      document.removeEventListener("visibilitychange", y), window.clearTimeout(S), c.abort();
    }
    e?.addEventListener("abort", () => {
      p(), d();
    });
    const E = r ?? _t;
    async function f() {
      c = new AbortController();
      try {
        const m = await fetch(t, {
          ...u,
          headers: h,
          signal: c.signal
        });
        await E(m), await Et(
          m.body,
          St(
            Tt(
              (g) => {
                g ? h[de] = g : delete h[de];
              },
              (g) => {
                w = g;
              },
              s
            )
          )
        ), o?.(), p(), d();
      } catch (m) {
        if (!c.signal.aborted)
          try {
            const g = i?.(m) ?? w;
            window.clearTimeout(S), S = window.setTimeout(f, g);
          } catch (g) {
            p(), l(g);
          }
      }
    }
    f();
  });
}
const ae = "text/event-stream", bt = 1e3, de = "last-event-id";
function _t(t) {
  const e = t.headers.get("content-type");
  if (!e?.startsWith(ae))
    throw new Error(`Expected content-type to be ${ae}, Actual: ${e}`);
}
async function Et(t, e) {
  const n = t.getReader();
  for (; ; ) {
    const r = await n.read();
    if (r.done)
      break;
    e(r.value);
  }
}
function St(t) {
  let e, n, r, s = !1;
  return function(i) {
    e === void 0 ? (e = i, n = 0, r = -1) : e = At(e, i);
    const a = e.length;
    let u = 0;
    for (; n < a; ) {
      s && (e[n] === 10 && (u = ++n), s = !1);
      let d = -1;
      for (; n < a && d === -1; ++n)
        switch (e[n]) {
          case 58:
            r === -1 && (r = n - u);
            break;
          case 13:
            s = !0;
          case 10:
            d = n;
            break;
        }
      if (d === -1)
        break;
      t(e.subarray(u, d), r), u = n, r = -1;
    }
    u === a ? e = void 0 : u !== 0 && (e = e.subarray(u), n -= u);
  };
}
function Tt(t, e, n) {
  let r = he();
  const s = new TextDecoder();
  return function(i, a) {
    if (i.length === 0)
      n?.(r), r = he();
    else if (a > 0) {
      const u = s.decode(i.subarray(0, a)), d = a + (i[a + 1] === 32 ? 2 : 1), l = s.decode(i.subarray(d));
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
function At(t, e) {
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
const K = /* @__PURE__ */ new WeakSet();
function Lt(t, e, n = {}) {
  t instanceof Document && (t = t.documentElement);
  let r;
  typeof e == "string" ? r = $t(e) : r = e;
  const s = It(r), o = Nt(t, s, n);
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
    const r = Rt(e, t, n);
    if (!r)
      throw new Error("Could not find best match");
    const s = r?.previousSibling, o = r?.nextSibling, i = J(t, r, n);
    return r ? Ct(s, i, o) : [];
  } else
    throw "Do not understand how to morph style " + n.morphStyle;
}
function J(t, e, n) {
  if (!(n.ignoreActive && t === document.activeElement))
    if (e == null) {
      if (n.callbacks.beforeNodeRemoved(t) === !1)
        return;
      t.remove(), n.callbacks.afterNodeRemoved(t);
      return;
    } else {
      if (Z(t, e))
        return n.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && n.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && n.head.style !== "morph" ? Ve(e, t, n) : (kt(e, t), Fe(e, t, n))), n.callbacks.afterNodeMorphed(t, e), t);
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
      J(s, o, n), s = s.nextSibling, $(n, o);
      continue;
    }
    let i = Mt(t, e, o, s, n);
    if (i) {
      s = pe(s, i, n), J(i, o, n), $(n, o);
      continue;
    }
    let a = Pt(t, o, s, n);
    if (a) {
      s = pe(s, a, n), J(a, o, n), $(n, o);
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
function kt(t, e) {
  let n = t.nodeType;
  if (n === 1) {
    for (const r of t.attributes)
      e.getAttribute(r.name) !== r.value && e.setAttribute(r.name, r.value);
    for (const r of e.attributes)
      t.hasAttribute(r.name) || e.removeAttribute(r.name);
  }
  if ((n === Node.COMMENT_NODE || n === Node.TEXT_NODE) && e.nodeValue !== t.nodeValue && (e.nodeValue = t.nodeValue), t instanceof HTMLInputElement && e instanceof HTMLInputElement && t.type !== "file")
    e.value = t.value || "", q(t, e, "value"), q(t, e, "checked"), q(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    q(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const r = t.value, s = e.value;
    r !== s && (e.value = r), e.firstChild && e.firstChild.nodeValue !== r && (e.firstChild.nodeValue = r);
  }
}
function q(t, e, n) {
  const r = t.getAttribute(n), s = e.getAttribute(n);
  r !== s && (r ? e.setAttribute(n, r) : e.removeAttribute(n));
}
function Ve(t, e, n) {
  const r = [], s = [], o = [], i = [], a = n.head.style, u = /* @__PURE__ */ new Map();
  for (const l of t.children)
    u.set(l.outerHTML, l);
  for (const l of e.children) {
    let h = u.has(l.outerHTML), c = n.head.shouldReAppend(l), y = n.head.shouldPreserve(l);
    h || y ? c ? s.push(l) : (u.delete(l.outerHTML), o.push(l)) : a === "append" ? c && (s.push(l), i.push(l)) : n.head.shouldRemove(l) !== !1 && s.push(l);
  }
  i.push(...u.values());
  const d = [];
  for (const l of i) {
    const h = document.createRange().createContextualFragment(l.outerHTML).firstChild;
    if (!h)
      throw new Error("could not create new element from: " + l.outerHTML);
    if (n.callbacks.beforeNodeAdded(h)) {
      if (h.hasAttribute("href") || h.hasAttribute("src")) {
        let c;
        const y = new Promise((w) => {
          c = w;
        });
        h.addEventListener("load", function() {
          c(void 0);
        }), d.push(y);
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
  }), d;
}
function M() {
}
function Nt(t, e, n) {
  return {
    target: t,
    newContent: e,
    config: n,
    morphStyle: n.morphStyle,
    ignoreActive: n.ignoreActive,
    idMap: Dt(t, e),
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
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : V(n, t, e) > 0 : !1;
}
function Z(t, e) {
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
function Mt(t, e, n, r, s) {
  const o = V(s, n, e);
  let i = null;
  if (o > 0) {
    i = r;
    let a = 0;
    for (; i != null; ) {
      if (je(n, i, s))
        return i;
      if (a += V(s, i, t), a > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function Pt(t, e, n, r) {
  let s = n, o = e.nextSibling, i = 0;
  for (; s && o; ) {
    if (V(r, s, t) > 0)
      return null;
    if (Z(e, s))
      return s;
    if (Z(o, s) && (i++, o = o.nextSibling, i >= 2))
      return null;
    s = s.nextSibling;
  }
  return s;
}
const me = new DOMParser();
function $t(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const n = me.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return K.add(n), n;
    {
      let r = n.firstChild;
      return r ? (K.add(r), r) : null;
    }
  } else {
    const r = me.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!r)
      throw new Error("content is null");
    return K.add(r), r;
  }
}
function It(t) {
  if (t == null)
    return document.createElement("div");
  if (K.has(t))
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
function Ct(t, e, n) {
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
function Rt(t, e, n) {
  let r = t.firstChild, s = r, o = 0;
  for (; r; ) {
    let i = xt(r, e, n);
    i > o && (s = r, o = i), r = r.nextSibling;
  }
  return s;
}
function xt(t, e, n) {
  return Z(t, e) ? 0.5 + V(n, t, e) : 0;
}
function Be(t, e) {
  $(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function Ot(t, e) {
  return !t.deadIds.has(e);
}
function Ht(t, e, n) {
  return t.idMap.get(n)?.has(e) || !1;
}
function $(t, e) {
  const n = t.idMap.get(e);
  if (n)
    for (const r of n)
      t.deadIds.add(r);
}
function V(t, e, n) {
  const r = t.idMap.get(e);
  if (!r)
    return 0;
  let s = 0;
  for (const o of r)
    Ot(t, o) && Ht(t, o, n) && ++s;
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
function Dt(t, e) {
  const n = /* @__PURE__ */ new Map();
  return ge(t, n), ge(e, n), n;
}
const ne = "display", ve = "none", re = "important", Ft = {
  prefix: "show",
  allowedModifiers: /* @__PURE__ */ new Set([re]),
  onLoad: (t) => {
    const { el: e, modifiers: n, expressionFn: r, reactivity: s } = t;
    return s.effect(async () => {
      const i = !!await r(t), u = n.has(re) ? re : void 0;
      i ? e.style.length === 1 && e.style.display === ve ? e.style.removeProperty(ne) : e.style.setProperty(ne, "", u) : e.style.setProperty(ne, ve, u);
    });
  }
}, Vt = "intersects", ye = "once", we = "half", be = "full", jt = {
  prefix: Vt,
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
}, _e = "prepend", Ee = "append", Se = new Error("Target element must have a parent if using prepend or append"), Bt = {
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
}, Ut = {
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
}, Ue = document, We = !!Ue.startViewTransition, Wt = {
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
}, qt = [
  Ft,
  jt,
  Bt,
  Ut,
  Wt
], Gt = "Content-Type", Kt = "datastar-request", Jt = "application/json", zt = "true", te = "datastar-", j = `${te}indicator`, X = `${j}-loading`, Te = `${te}settling`, G = `${te}swapping`, Zt = "self", Xt = "get", Yt = "post", Qt = "put", en = "patch", tn = "delete", nn = [Xt, Yt, Qt, en, tn].reduce(
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
        r.classList.contains(X);
      });
    }
  }
), rn = ["selector", "merge", "settle", "fragment", "redirect", "error"], A = {
  MorphElement: "morph_element",
  InnerElement: "inner_element",
  OuterElement: "outer_element",
  PrependElement: "prepend_element",
  AppendElement: "append_element",
  BeforeElement: "before_element",
  AfterElement: "after_element",
  DeleteElement: "delete_element",
  UpsertAttributes: "upsert_attributes"
}, sn = {
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
}, on = {
  prefix: "fetchIndicator",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onGlobalInit: () => {
    const t = document.createElement("style");
    t.innerHTML = `
.${j}{
 opacity:0;
 transition: opacity 300ms ease-out;
}
.${X} {
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
    return r.classList.add(j), () => {
      delete n.fetch.indicatorSelectors[t.el.id];
    };
  })
}, an = {
  prefix: "isLoadingId",
  mustNotEmptyExpression: !0,
  onLoad: (t) => {
    const e = t.expression, n = t.store();
    return n.fetch || (n.fetch = {}), n.fetch.loadingIdentifiers || (n.fetch.loadingIdentifiers = {}), n.fetch.loadingIdentifiers[t.el.id] = e, n.isLoading || (n.isLoading = t.reactivity.signal(/* @__PURE__ */ new Set())), () => {
      delete n.fetch.loadingIdentifiers[t.el.id];
    };
  }
}, ln = [sn, on, an];
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
    c && (a = c, a.classList.remove(j), a.classList.add(X), i = !0);
  }
  const d = r.fetch?.loadingIdentifiers?.[a.id] || null;
  d && (r.isLoading.value = /* @__PURE__ */ new Set([...r.isLoading.value, d]));
  const l = new URL(e, window.location.origin);
  t = t.toUpperCase();
  const h = {
    method: t,
    headers: {
      [Gt]: Jt,
      [Kt]: zt
    },
    onmessage: (c) => {
      if (!c.event)
        return;
      let y = "", w = "morph_element", S = "", p = 500, E = !1;
      if (!c.event.startsWith(te))
        throw new Error(`Unknown event: ${c.event}`);
      const f = c.data.trim().split(`
`);
      let m = "";
      for (let g = 0; g < f.length; g++) {
        let b = f[g];
        if (!b?.length)
          continue;
        const T = b.split(" ", 1)[0];
        if (rn.includes(T) && T !== m)
          switch (m = T, b = b.slice(T.length + 1), m) {
            case "selector":
              S = b;
              break;
            case "merge":
              if (w = b, !Object.values(A).includes(w))
                throw new Error(`Unknown merge option: ${w}`);
              break;
            case "settle":
              p = parseInt(b);
              break;
            case "fragment":
              E = !0;
              break;
            case "redirect":
              window.location.href = b;
              return;
            case "error":
              throw new Error(b);
            default:
              throw new Error("Unknown data type");
          }
        m === "fragment" && (y += b + `
`);
      }
      E && (y?.length || (y = "<div></div>"), cn(n, S, w, y, p));
    },
    onclose: () => {
      i && setTimeout(() => {
        a.classList.remove(X), a.classList.add(j);
      }, 300), d && setTimeout(() => {
        const c = r.isLoading.value;
        c.delete(d), r.isLoading.value = new Set(c);
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
  await wt(l, h);
}
const Le = document.createElement("template");
function cn(t, e, n, r, s) {
  const { el: o } = t;
  Le.innerHTML = r.trim();
  const i = Le.content.firstChild;
  if (!(i instanceof Element))
    throw new Error("No fragment found");
  const a = e === Zt;
  let u;
  if (a)
    u = [o];
  else {
    const l = e || `#${i.getAttribute("id")}`;
    if (u = document.querySelectorAll(l) || [], !u)
      throw new Error(`No targets found for ${l}`);
  }
  const d = () => {
    for (const l of u) {
      l.classList.add(G);
      const h = l.outerHTML;
      let c = l;
      switch (n) {
        case A.MorphElement:
          const w = Lt(c, i);
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
            const E = i.getAttribute(p);
            c.setAttribute(p, E);
          });
          break;
        default:
          throw new Error(`Unknown merge type: ${n}`);
      }
      c.classList.add(G), t.cleanupElementRemovals(l), t.applyPlugins(document.body), setTimeout(() => {
        l.classList.remove(G), c.classList.remove(G);
      }, s);
      const y = c.outerHTML;
      h !== y && (c.classList.add(Te), setTimeout(() => {
        c.classList.remove(Te);
      }, s));
    }
  };
  We ? Ue.startViewTransition(() => d()) : d();
}
const un = {
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
function fn(t = {}, ...e) {
  const n = performance.now(), r = new ct(t, ...e);
  r.run();
  const s = performance.now();
  return console.log(`Datastar v${ut} loaded and attached to all DOM elements in ${s - n}ms`), r;
}
function dn(t = {}, ...e) {
  const n = Object.assign({}, un, nn, t), r = [...ln, ...qt, ...gt, ...e];
  return fn(n, ...r);
}
const qe = window;
qe.ds = dn();
qe.dispatchEvent(new CustomEvent("datastar-ready"));
export {
  ct as Datastar,
  fn as runDatastarWith,
  dn as runDatastarWithAllPlugins,
  ke as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
