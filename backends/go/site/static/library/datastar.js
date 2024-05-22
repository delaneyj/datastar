function ke(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function Q() {
  throw new Error("Cycle detected");
}
function ze() {
  throw new Error("Computed cannot have side-effects");
}
const Ze = Symbol.for("preact-signals"), L = 1, I = 2, F = 4, C = 8, O = 16, P = 32;
function ee() {
  D++;
}
function te() {
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
  ee();
  try {
    return t();
  } finally {
    te();
  }
}
let v, H, D = 0, se = 0, Z = 0;
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
      se > 100 && Q(), this._value = t, this._version++, Z++, ee();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        te();
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
  _.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = Z - 1, this._flags = F;
}
k.prototype = new _();
k.prototype._refresh = function() {
  if (this._flags &= ~I, this._flags & L)
    return !1;
  if ((this._flags & (F | P)) === P || (this._flags &= ~F, this._globalVersion === Z))
    return !0;
  if (this._globalVersion = Z, this._flags |= L, this._version > 0 && !Pe(this))
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
  if (this._refresh() || Q(), this._flags & O)
    throw this._value;
  return this._value;
};
Object.defineProperty(k.prototype, "value", {
  get() {
    this._flags & L && Q();
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
    ee();
    const n = v;
    v = void 0;
    try {
      e();
    } catch (r) {
      throw t._flags &= ~L, t._flags |= C, le(t), r;
    } finally {
      v = n, te();
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
  Ie(this), v = t, this._flags &= ~L, this._flags & C && le(this), te();
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
  this._flags & L && Q(), this._flags |= L, this._flags &= ~C, Ce(this), $e(this), ee();
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
          let l = o.dataset[i] || "";
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
          let f = i.slice(r.prefix.length), [u, ...a] = f.split(".");
          if (r.mustHaveEmptyKey && u.length > 0)
            throw new Error(`'${i}' must have empty key`);
          if (r.mustNotEmptyKey && u.length === 0)
            throw new Error(`'${i}' must have non-empty key`);
          u.length && (u = u[0].toLowerCase() + u.slice(1));
          const h = a.map((p) => {
            const [E, ...d] = p.split("_");
            return { label: E, args: d };
          });
          if (r.allowedModifiers) {
            for (const p of h)
              if (!r.allowedModifiers.has(p.label))
                throw new Error(`'${p.label}' is not allowed`);
          }
          const c = /* @__PURE__ */ new Map();
          for (const p of h)
            c.set(p.label, p.args);
          if (r.mustHaveEmptyExpression && l.length)
            throw new Error(`'${i}' must have empty expression`);
          if (r.mustNotEmptyExpression && !l.length)
            throw new Error(`'${i}' must have non-empty expression`);
          const y = [...r.preprocessors?.pre || [], ...ot, ...r.preprocessors?.post || []];
          for (const p of y) {
            if (n.has(p))
              continue;
            n.add(p);
            const E = l.split(";"), d = [];
            E.forEach((m) => {
              let g = m;
              const w = [...g.matchAll(p.regexp)];
              if (w.length)
                for (const T of w) {
                  if (!T.groups)
                    continue;
                  const { groups: N } = T, { whole: R } = N;
                  g = g.replace(R, p.replacer(N));
                }
              d.push(g);
            }), l = d.join("; ");
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
            key: u,
            expression: l,
            expressionFn: () => {
              throw new Error("Expression function not created");
            },
            modifiers: c
          };
          if (!r.bypassExpressionFunctionCreation?.(b) && !r.mustHaveEmptyExpression && l.length) {
            const p = l.split(";").map((d) => d.trim());
            p[p.length - 1] = `return ${p[p.length - 1]}`;
            let E = `
try {
${p.map((d) => `  ${d}`).join(`;
`)}
} catch (e) {
  throw e
}
            `;
            try {
              const d = new Function("ctx", E);
              b.expressionFn = d;
            } catch (d) {
              throw new Error(`Error creating expression function for '${E}', error: ${d}`);
            }
          }
          const S = r.onLoad(b);
          S && (this.removals.has(o) || this.removals.set(o, /* @__PURE__ */ new Set()), this.removals.get(o).add(S));
        }
      });
    });
  }
  walkSignalsStore(e, n) {
    const r = Object.keys(e);
    for (let s = 0; s < r.length; s++) {
      const o = r[s], i = e[o], l = i instanceof _, f = typeof i == "object" && Object.keys(i).length > 0;
      if (l) {
        n(o, i);
        continue;
      }
      f && this.walkSignalsStore(i, n);
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
const ut = "0.13.2", He = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, n) => (n ? "-" : "") + e.toLowerCase()), ft = {
  prefix: "bind",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(async () => {
    const e = He(t.key), r = `${await t.expressionFn(t)}`;
    !r || r === "false" || r === "null" || r === "undefined" ? t.el.removeAttribute(e) : t.el.setAttribute(e, r);
  })
}, dt = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/, q = ["change", "input", "keydown"], ht = {
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
    const o = s.includes("input"), i = s.includes("select"), l = s.includes("textarea"), f = e.getAttribute("type"), u = s.includes("checkbox") || o && f === "checkbox", a = s.includes("radio") || o && f === "radio", h = o && f === "file";
    if (!o && !i && !l && !u && !a)
      throw new Error("Element must be input, select, textarea, checkbox or radio");
    const c = n.replaceAll("ctx.store().", "");
    a && (e.getAttribute("name")?.length || e.setAttribute("name", c));
    const y = () => {
      if (!r)
        throw new Error(`Signal ${c} not found`);
      const d = "value" in e, m = r.value;
      if (u || a) {
        const g = e;
        u ? g.checked = m : a && (g.checked = `${m}` === g.value);
      } else
        h || (d ? e.value = `${m}` : e.setAttribute("value", `${m}`));
    }, b = t.reactivity.effect(y), S = async () => {
      if (h)
        return await new Promise((g) => {
          const [w] = e?.files || [];
          if (!w) {
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
          }, T.onloadend = () => g(void 0), T.readAsDataURL(w);
          const R = `${c}Name`;
          if (R in N) {
            const x = N[`${R}`];
            x.value = w.name;
          }
        });
      const d = r.value, m = e;
      if (typeof d == "number")
        r.value = Number(m.value);
      else if (typeof d == "string")
        r.value = m.value;
      else if (typeof d == "boolean")
        u ? r.value = m.checked : r.value = !!m.value;
      else if (!(typeof d > "u"))
        if (typeof d == "bigint")
          r.value = BigInt(m.value);
        else
          throw console.log(typeof d), new Error("Unsupported type");
    }, p = e.tagName.split("-");
    if (p.length > 1) {
      const d = p[0].toLowerCase();
      q.forEach((m) => {
        q.push(`${d}-${m}`);
      });
    }
    return q.forEach((d) => e.addEventListener(d, S)), () => {
      b(), q.forEach((d) => e.removeEventListener(d, S));
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
      const u = fe(o), a = W(o, "leading", !1), h = W(o, "noTrail", !0);
      s = vt(s, u, a, h);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const u = fe(i), a = W(i, "noLead", !0), h = W(i, "noTrail", !0);
      s = yt(s, u, a, h);
    }
    const l = {
      capture: !0,
      passive: !1,
      once: !1
    };
    t.modifiers.has("capture") || (l.capture = !1), t.modifiers.has("passive") && (l.passive = !0), t.modifiers.has("once") && (l.once = !0);
    const f = He(n).toLowerCase();
    switch (f) {
      case "load":
        return s(), delete e.dataset.onLoad, () => {
        };
      case "raf":
        let u;
        const a = () => {
          s(), u = requestAnimationFrame(a);
        };
        return requestAnimationFrame(a), delete e.dataset.onRaf, () => {
          u && cancelAnimationFrame(u);
        };
      default:
        return e.addEventListener(f, s, l), () => {
          e.removeEventListener(f, s);
        };
    }
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
  return function(...l) {
    o(), n && !s && t(...l), s = setTimeout(() => {
      r && t(...l), o();
    }, e);
  };
}
function yt(t, e, n = !0, r = !1) {
  let s = !1, o = null;
  return function(...l) {
    s ? o = l : (s = !0, n ? t(...l) : o = l, setTimeout(() => {
      r && o && (t(...o), o = null), s = !1;
    }, e));
  };
}
function bt(t, {
  signal: e,
  headers: n,
  onopen: r,
  onmessage: s,
  onclose: o,
  onerror: i,
  openWhenHidden: l,
  ...f
}) {
  return new Promise((u, a) => {
    const h = { ...n };
    h.accept || (h.accept = ae);
    let c;
    function y() {
      c.abort(), document.hidden || d();
    }
    l || document.addEventListener("visibilitychange", y);
    let b = wt, S = 0;
    function p() {
      document.removeEventListener("visibilitychange", y), window.clearTimeout(S), c.abort();
    }
    e?.addEventListener("abort", () => {
      p(), u();
    });
    const E = r ?? _t;
    async function d() {
      c = new AbortController();
      try {
        const m = await fetch(t, {
          ...f,
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
                b = g;
              },
              s
            )
          )
        ), o?.(), p(), u();
      } catch (m) {
        if (!c.signal.aborted)
          try {
            const g = i?.(m) ?? b;
            window.clearTimeout(S), S = window.setTimeout(d, g);
          } catch (g) {
            p(), a(g);
          }
      }
    }
    d();
  });
}
const ae = "text/event-stream", wt = 1e3, de = "last-event-id";
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
    const l = e.length;
    let f = 0;
    for (; n < l; ) {
      s && (e[n] === 10 && (f = ++n), s = !1);
      let u = -1;
      for (; n < l && u === -1; ++n)
        switch (e[n]) {
          case 58:
            r === -1 && (r = n - f);
            break;
          case 13:
            s = !0;
          case 10:
            u = n;
            break;
        }
      if (u === -1)
        break;
      t(e.subarray(f, u), r), f = n, r = -1;
    }
    f === l ? e = void 0 : f !== 0 && (e = e.subarray(f), n -= f);
  };
}
function Tt(t, e, n) {
  let r = he();
  const s = new TextDecoder();
  return function(i, l) {
    if (i.length === 0)
      n?.(r), r = he();
    else if (l > 0) {
      const f = s.decode(i.subarray(0, l)), u = l + (i[l + 1] === 32 ? 2 : 1), a = s.decode(i.subarray(u));
      switch (f) {
        case "data":
          r.data = r.data ? r.data + `
` + a : a;
          break;
        case "event":
          r.event = a;
          break;
        case "id":
          t(r.id = a);
          break;
        case "retry":
          const h = parseInt(a, 10);
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
const J = /* @__PURE__ */ new WeakSet();
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
    const s = r?.previousSibling, o = r?.nextSibling, i = z(t, r, n);
    return r ? Ct(s, i, o) : [];
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
      z(s, o, n), s = s.nextSibling, $(n, o);
      continue;
    }
    let i = Mt(t, e, o, s, n);
    if (i) {
      s = pe(s, i, n), z(i, o, n), $(n, o);
      continue;
    }
    let l = Pt(t, o, s, n);
    if (l) {
      s = pe(s, l, n), z(l, o, n), $(n, o);
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
    e.value = t.value || "", G(t, e, "value"), G(t, e, "checked"), G(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    G(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const r = t.value, s = e.value;
    r !== s && (e.value = r), e.firstChild && e.firstChild.nodeValue !== r && (e.firstChild.nodeValue = r);
  }
}
function G(t, e, n) {
  const r = t.getAttribute(n), s = e.getAttribute(n);
  r !== s && (r ? e.setAttribute(n, r) : e.removeAttribute(n));
}
function Ve(t, e, n) {
  const r = [], s = [], o = [], i = [], l = n.head.style, f = /* @__PURE__ */ new Map();
  for (const a of t.children)
    f.set(a.outerHTML, a);
  for (const a of e.children) {
    let h = f.has(a.outerHTML), c = n.head.shouldReAppend(a), y = n.head.shouldPreserve(a);
    h || y ? c ? s.push(a) : (f.delete(a.outerHTML), o.push(a)) : l === "append" ? c && (s.push(a), i.push(a)) : n.head.shouldRemove(a) !== !1 && s.push(a);
  }
  i.push(...f.values());
  const u = [];
  for (const a of i) {
    const h = document.createRange().createContextualFragment(a.outerHTML).firstChild;
    if (!h)
      throw new Error("could not create new element from: " + a.outerHTML);
    if (n.callbacks.beforeNodeAdded(h)) {
      if (h.hasAttribute("href") || h.hasAttribute("src")) {
        let c;
        const y = new Promise((b) => {
          c = b;
        });
        h.addEventListener("load", function() {
          c(void 0);
        }), u.push(y);
      }
      e.appendChild(h), n.callbacks.afterNodeAdded(h), r.push(h);
    }
  }
  for (const a of s)
    n.callbacks.beforeNodeRemoved(a) !== !1 && (e.removeChild(a), n.callbacks.afterNodeRemoved(a));
  return n.head.afterHeadMorphed(e, {
    added: r,
    kept: o,
    removed: s
  }), u;
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
function X(t, e) {
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
    let l = 0;
    for (; i != null; ) {
      if (je(n, i, s))
        return i;
      if (l += V(s, i, t), l > o)
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
    if (X(e, s))
      return s;
    if (X(o, s) && (i++, o = o.nextSibling, i >= 2))
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
      return J.add(n), n;
    {
      let r = n.firstChild;
      return r ? (J.add(r), r) : null;
    }
  } else {
    const r = me.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!r)
      throw new Error("content is null");
    return J.add(r), r;
  }
}
function It(t) {
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
  return X(t, e) ? 0.5 + V(n, t, e) : 0;
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
      const i = !!await r(t), f = n.has(re) ? re : void 0;
      i ? e.style.length === 1 && e.style.display === ve ? e.style.removeProperty(ne) : e.style.setProperty(ne, "", f) : e.style.setProperty(ne, ve, f);
    });
  }
}, Vt = "intersects", ye = "once", be = "half", we = "full", jt = {
  prefix: Vt,
  allowedModifiers: /* @__PURE__ */ new Set([ye, be, we]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, n = { threshold: 0 };
    e.has(we) ? n.threshold = 1 : e.has(be) && (n.threshold = 0.5);
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
}, Ue = document, qe = !!Ue.startViewTransition, qt = {
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
    if (!qe) {
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
}, Wt = [
  Ft,
  jt,
  Bt,
  Ut,
  qt
], Gt = "Content-Type", Kt = "datastar-request", Jt = "application/json", zt = "true", U = "datastar-", Zt = `${U}fragment`, j = `${U}indicator`, Y = `${j}-loading`, Te = `${U}settling`, K = `${U}swapping`, Xt = "self", Yt = "get", Qt = "post", en = "put", tn = "patch", nn = "delete", rn = [Yt, Qt, en, tn, nn].reduce(
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
        r.classList.contains(Y);
      });
    }
  }
), sn = ["selector", "merge", "settle", "fragment", "redirect", "error"], A = {
  MorphElement: "morph_element",
  InnerElement: "inner_element",
  OuterElement: "outer_element",
  PrependElement: "prepend_element",
  AppendElement: "append_element",
  BeforeElement: "before_element",
  AfterElement: "after_element",
  DeleteElement: "delete_element",
  UpsertAttributes: "upsert_attributes"
}, on = {
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
}, an = {
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
.${Y} {
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
}, ln = {
  prefix: "isLoadingId",
  mustNotEmptyExpression: !0,
  onLoad: (t) => {
    const e = t.expression, n = t.store();
    return n.fetch || (n.fetch = {}), n.fetch.loadingIdentifiers || (n.fetch.loadingIdentifiers = {}), n.fetch.loadingIdentifiers[t.el.id] = e, n.isLoading || (n.isLoading = t.reactivity.signal(new Array())), () => {
    };
  }
}, cn = [on, an, ln];
async function Ae(t, e, n) {
  const r = n.store();
  if (!e)
    throw new Error(`No signal for ${t} on ${e}`);
  const s = { ...r.value };
  delete s.fetch;
  const o = JSON.stringify(s);
  let i = !1, l = n.el;
  const f = r.fetch?.indicatorSelectors?.[l.id] || null;
  if (f) {
    const c = document.querySelector(f.value);
    c && (l = c, l.classList.remove(j), l.classList.add(Y), i = !0);
  }
  const u = r.fetch?.loadingIdentifiers?.[l.id] || null;
  u && !r.isLoading.value.includes(u) && (r.isLoading.value = [...r.isLoading.value || [], u]);
  const a = new URL(e, window.location.origin);
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
      let y = "", b = "morph_element", S = "", p = 500;
      if (!c.event.startsWith(U))
        throw new Error(`Unknown event: ${c.event}`);
      const E = c.event === Zt, d = c.data.trim().split(`
`);
      let m = "";
      for (let g = 0; g < d.length; g++) {
        let w = d[g];
        if (!w?.length)
          continue;
        const T = w.split(" ", 1)[0];
        if (sn.includes(T) && T !== m)
          switch (m = T, w = w.slice(T.length + 1), m) {
            case "selector":
              S = w;
              break;
            case "merge":
              if (b = w, !Object.values(A).includes(b))
                throw new Error(`Unknown merge option: ${b}`);
              break;
            case "settle":
              p = parseInt(w);
              break;
            case "fragment":
              break;
            case "redirect":
              window.location.href = w;
              return;
            case "error":
              throw new Error(w);
            default:
              throw new Error("Unknown data type");
          }
        m === "fragment" && (y += w + `
`);
      }
      E && (y?.length || (y = "<div></div>"), un(n, S, b, y, p));
    },
    onclose: () => {
      const c = n.store();
      i && setTimeout(() => {
        l.classList.remove(Y), l.classList.add(j);
      }, 300), c.isLoading && u && (c.isLoading.value = c.isLoading.value.filter((y) => y !== u));
    }
  };
  if (r.fetch?.headers?.value && h.headers)
    for (const c in r.fetch.headers.value) {
      const y = r.fetch.headers.value[c];
      h.headers[c] = y;
    }
  if (t === "GET") {
    const c = new URLSearchParams(a.search);
    c.append("datastar", o), a.search = c.toString();
  } else
    h.body = o;
  await bt(a, h);
}
const Le = document.createElement("template");
function un(t, e, n, r, s) {
  const { el: o } = t;
  Le.innerHTML = r.trim();
  const i = Le.content.firstChild;
  if (!(i instanceof Element))
    throw new Error("No fragment found");
  const l = e === Xt;
  let f;
  if (l)
    f = [o];
  else {
    const a = e || `#${i.getAttribute("id")}`;
    if (f = document.querySelectorAll(a) || [], !f)
      throw new Error(`No targets found for ${a}`);
  }
  const u = () => {
    for (const a of f) {
      a.classList.add(K);
      const h = a.outerHTML;
      let c = a;
      switch (n) {
        case A.MorphElement:
          const b = Lt(c, i);
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
            const E = i.getAttribute(p);
            c.setAttribute(p, E);
          });
          break;
        default:
          throw new Error(`Unknown merge type: ${n}`);
      }
      c.classList.add(K), t.cleanupElementRemovals(a), t.applyPlugins(document.body), setTimeout(() => {
        a.classList.remove(K), c.classList.remove(K);
      }, s);
      const y = c.outerHTML;
      h !== y && (c.classList.add(Te), setTimeout(() => {
        c.classList.remove(Te);
      }, s));
    }
  };
  qe ? Ue.startViewTransition(() => u()) : u();
}
const fn = {
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
function dn(t = {}, ...e) {
  const n = performance.now(), r = new ct(t, ...e);
  r.run();
  const s = performance.now();
  return console.log(`Datastar v${ut} loaded and attached to all DOM elements in ${s - n}ms`), r;
}
function hn(t = {}, ...e) {
  const n = Object.assign({}, fn, rn, t), r = [...cn, ...Wt, ...gt, ...e];
  return dn(n, ...r);
}
const We = window;
We.ds = hn();
We.dispatchEvent(new CustomEvent("datastar-ready"));
export {
  ct as Datastar,
  dn as runDatastarWith,
  hn as runDatastarWithAllPlugins,
  ke as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
