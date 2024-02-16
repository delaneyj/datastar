function Oe(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function ne() {
  throw new Error("Cycle detected");
}
function Xe() {
  throw new Error("Computed cannot have side-effects");
}
const Ye = Symbol.for("preact-signals"), S = 1, O = 2, B = 4, C = 8, F = 16, k = 32;
function re() {
  V++;
}
function se() {
  if (V > 1) {
    V--;
    return;
  }
  let t, e = !1;
  for (; U !== void 0; ) {
    let n = U;
    for (U = void 0, le++; n !== void 0; ) {
      const r = n._nextBatchedEffect;
      if (n._nextBatchedEffect = void 0, n._flags &= ~O, !(n._flags & C) && He(n))
        try {
          n._callback();
        } catch (s) {
          e || (t = s, e = !0);
        }
      n = r;
    }
  }
  if (le = 0, V--, e)
    throw t;
}
function Qe(t) {
  if (V > 0)
    return t();
  re();
  try {
    return t();
  } finally {
    se();
  }
}
let m, U, V = 0, le = 0, ee = 0;
function Ce(t) {
  if (m === void 0)
    return;
  let e = t._node;
  if (e === void 0 || e._target !== m)
    return e = {
      _version: 0,
      _source: t,
      _prevSource: m._sources,
      _nextSource: void 0,
      _target: m,
      _prevTarget: void 0,
      _nextTarget: void 0,
      _rollbackNode: e
    }, m._sources !== void 0 && (m._sources._nextSource = e), m._sources = e, t._node = e, m._flags & k && t._subscribe(e), e;
  if (e._version === -1)
    return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = m._sources, e._nextSource = void 0, m._sources._nextSource = e, m._sources = e), e;
}
function v(t) {
  this._value = t, this._version = 0, this._node = void 0, this._targets = void 0;
}
v.prototype.brand = Ye;
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
  return pe(function() {
    const n = e.value, r = this._flags & k;
    this._flags &= ~k;
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
    const t = Ce(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (m instanceof A && Xe(), t !== this._value) {
      le > 100 && ne(), this._value = t, this._version++, ee++, re();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        se();
      }
    }
  }
});
function Ie(t) {
  return new v(t);
}
function He(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    if (e._source._version !== e._version || !e._source._refresh() || e._source._version !== e._version)
      return !0;
  return !1;
}
function xe(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource) {
    const n = e._source._node;
    if (n !== void 0 && (e._rollbackNode = n), e._source._node = e, e._version = -1, e._nextSource === void 0) {
      t._sources = e;
      break;
    }
  }
}
function De(t) {
  let e = t._sources, n;
  for (; e !== void 0; ) {
    const r = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), r !== void 0 && (r._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = r)) : n = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = r;
  }
  t._sources = n;
}
function A(t) {
  v.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = ee - 1, this._flags = B;
}
A.prototype = new v();
A.prototype._refresh = function() {
  if (this._flags &= ~O, this._flags & S)
    return !1;
  if ((this._flags & (B | k)) === k || (this._flags &= ~B, this._globalVersion === ee))
    return !0;
  if (this._globalVersion = ee, this._flags |= S, this._version > 0 && !He(this))
    return this._flags &= ~S, !0;
  const t = m;
  try {
    xe(this), m = this;
    const e = this._compute();
    (this._flags & F || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~F, this._version++);
  } catch (e) {
    this._value = e, this._flags |= F, this._version++;
  }
  return m = t, De(this), this._flags &= ~S, !0;
};
A.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= B | k;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  v.prototype._subscribe.call(this, t);
};
A.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (v.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~k;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
A.prototype._notify = function() {
  if (!(this._flags & O)) {
    this._flags |= B | O;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
A.prototype.peek = function() {
  if (this._refresh() || ne(), this._flags & F)
    throw this._value;
  return this._value;
};
Object.defineProperty(A.prototype, "value", {
  get() {
    this._flags & S && ne();
    const t = Ce(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & F)
      throw this._value;
    return this._value;
  }
});
function et(t) {
  return new A(t);
}
function Fe(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    re();
    const n = m;
    m = void 0;
    try {
      e();
    } catch (r) {
      throw t._flags &= ~S, t._flags |= C, de(t), r;
    } finally {
      m = n, se();
    }
  }
}
function de(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Fe(t);
}
function tt(t) {
  if (m !== this)
    throw new Error("Out-of-order effect");
  De(this), m = t, this._flags &= ~S, this._flags & C && de(this), se();
}
function G(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = k;
}
G.prototype._callback = function() {
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
G.prototype._start = function() {
  this._flags & S && ne(), this._flags |= S, this._flags &= ~C, Fe(this), xe(this), re();
  const t = m;
  return m = this, tt.bind(this, t);
};
G.prototype._notify = function() {
  this._flags & O || (this._flags |= O, this._nextBatchedEffect = U, U = this);
};
G.prototype._dispose = function() {
  this._flags |= C, this._flags & S || de(this);
};
function pe(t) {
  const e = new G(t);
  try {
    e._callback();
  } catch (n) {
    throw e._dispose(), n;
  }
  return e._dispose.bind(e);
}
class Ue {
  get value() {
    return ue(this);
  }
  set value(e) {
    Qe(() => nt(this, e));
  }
  peek() {
    return ue(this, { peek: !0 });
  }
}
const ce = (t) => Object.assign(
  new Ue(),
  Object.entries(t).reduce(
    (e, [n, r]) => {
      if (["value", "peek"].some((s) => s === n))
        throw new Error(`${n} is a reserved property name`);
      return typeof r != "object" || r === null || Array.isArray(r) ? e[n] = Ie(r) : e[n] = ce(r), e;
    },
    {}
  )
), nt = (t, e) => Object.keys(e).forEach((n) => t[n].value = e[n]), ue = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (n, [r, s]) => (s instanceof v ? n[r] = e ? s.peek() : s.value : s instanceof Ue && (n[r] = ue(s, { peek: e })), n),
  {}
), rt = /([\[:])?(\d{17,}|(?:[9](?:[1-9]07199254740991|0[1-9]7199254740991|00[8-9]199254740991|007[2-9]99254740991|007199[3-9]54740991|0071992[6-9]4740991|00719925[5-9]740991|007199254[8-9]40991|0071992547[5-9]0991|00719925474[1-9]991|00719925474099[2-9])))([,\}\]])/g;
function Ve(t, e = 2) {
  return JSON.stringify(
    t,
    (r, s) => typeof s == "bigint" ? s.toString() + "n" : s,
    e
  ).replace(/"(-?\d+)n"/g, (r, s) => s);
}
function st(t) {
  const e = t.replace(rt, '$1"$2n"$3');
  return JSON.parse(e, (n, r) => {
    switch (typeof r) {
      case "number":
        return Number.isSafeInteger(r) ? r : BigInt(r);
      case "string":
        return r.match(/(-?\d+)n/g)?.length ? BigInt(r.slice(0, -1)) : r;
      default:
        return r;
    }
  });
}
function Be(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return e;
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let n = t;
  return typeof t != "object" && (n = { ...e }), Object.keys(e).forEach((r) => {
    n.hasOwnProperty(r) || (n[r] = e[r]), e[r] === null ? delete n[r] : n[r] = Be(n[r], e[r]);
  }), n;
}
const ot = "[a-zA-Z_$][0-9a-zA-Z_$.]*";
function he(t, e, n) {
  return new RegExp(`(?<whole>\\${t}(?<${e}>${ot})${n})`, "g");
}
const it = {
  regexp: he("$", "signal", ""),
  replacer: (t) => {
    const { signal: e } = t;
    return `ctx.store().${e}.value`;
  }
}, at = {
  regexp: he("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => {
    const n = ["ctx"];
    e && n.push(...e.split(",").map((s) => s.trim()));
    const r = n.join(",");
    return `ctx.actions.${t}(${r})`;
  }
}, lt = {
  regexp: he("~", "ref", ""),
  replacer({ ref: t }) {
    return `data.refs.${t}`;
  }
}, ct = [at, it, lt], ut = {
  prefix: "mergeStore",
  preprocessors: {
    pre: [
      {
        // Replacing whole with JSONStringify(whole)
        regexp: /(?<whole>.+)/g,
        replacer: (t) => {
          const { whole: e } = t;
          return `ctx.JSONParse('${e.replace(/'/g, "\\'")}')`;
        }
      }
    ]
  },
  onLoad: (t) => {
    const e = t.expressionFn(t);
    t.mergeStore(e);
  }
}, ft = {
  prefix: "ref",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  bypassExpressionFunctionCreation: () => !0,
  onLoad: (t) => {
    const { el: e, expression: n } = t;
    return t.refs[n] = e, () => delete t.refs[n];
  }
}, dt = [ut, ft];
class pt {
  plugins = [];
  store = ce({});
  actions = {};
  refs = {};
  reactivity = {
    signal: Ie,
    computed: et,
    effect: pe
  };
  parentID = "";
  missingIDNext = 0;
  removals = /* @__PURE__ */ new Map();
  constructor(e = {}, ...n) {
    if (this.actions = Object.assign(this.actions, e), n = [...dt, ...n], !n.length)
      throw new Error("no plugins");
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
  JSONStringify(e) {
    return Ve(e);
  }
  JSONParse(e) {
    return st(e);
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
    const n = Be(this.store.value, e);
    this.store = ce(n);
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
            if (![...r.allowedTagRegexps].some((p) => d.match(p)))
              throw new Error(
                `'${o.tagName}' not allowed for '${i}', allowed ${[
                  [...r.allowedTagRegexps].map((p) => `'${p}'`)
                ].join(", ")}`
              );
          }
          let f = i.slice(r.prefix.length), [u, ...c] = f.split(".");
          if (r.mustHaveEmptyKey && u.length > 0)
            throw new Error(`'${i}' must have empty key`);
          if (r.mustNotEmptyKey && u.length === 0)
            throw new Error(`'${i}' must have non-empty key`);
          u.length && (u = u[0].toLowerCase() + u.slice(1));
          const l = c.map((d) => {
            const [h, ...p] = d.split("_");
            return { label: h, args: p };
          });
          if (r.allowedModifiers) {
            for (const d of l)
              if (!r.allowedModifiers.has(d.label))
                throw new Error(`'${d.label}' is not allowed`);
          }
          const y = /* @__PURE__ */ new Map();
          for (const d of l)
            y.set(d.label, d.args);
          if (r.mustHaveEmptyExpression && a.length)
            throw new Error(`'${i}' must have empty expression`);
          if (r.mustNotEmptyExpression && !a.length)
            throw new Error(`'${i}' must have non-empty expression`);
          const _ = [...r.preprocessors?.pre || [], ...ct, ...r.preprocessors?.post || []];
          for (const d of _) {
            if (n.has(d))
              continue;
            n.add(d);
            const h = [...a.matchAll(d.regexp)];
            if (h.length)
              for (const p of h) {
                if (!p.groups)
                  continue;
                const { groups: E } = p, { whole: T } = E;
                a = a.replace(T, d.replacer(E));
              }
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
            key: u,
            expression: a,
            expressionFn: () => {
              throw new Error("Expression function not created");
            },
            JSONParse: this.JSONParse,
            JSONStringify: this.JSONStringify,
            modifiers: y
          };
          if (!r.bypassExpressionFunctionCreation?.(w) && !r.mustHaveEmptyExpression && a.length) {
            const d = a.split(";");
            d[d.length - 1] = `return ${d[d.length - 1]}`;
            const h = `
try {
  ${d.join(";")}
} catch (e) {
  throw e
}
            `;
            try {
              const p = new Function("ctx", h);
              w.expressionFn = p;
            } catch (p) {
              console.error(`Error creating expression function for '${h}'`), console.error(p);
              return;
            }
          }
          const g = r.onLoad(w);
          g && (this.removals.has(o) || this.removals.set(o, /* @__PURE__ */ new Set()), this.removals.get(o).add(g));
        }
      });
    });
  }
  walkSignalsStore(e, n) {
    const r = Object.keys(e);
    for (let s = 0; s < r.length; s++) {
      const o = r[s], i = e[o], a = i instanceof v, f = typeof i == "object" && Object.keys(i).length > 0;
      if (a) {
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
    const s = Oe(e);
    if (s)
      for (n(s), r = 0, e = e.firstElementChild; e; )
        this.walkDownDOM(e, n, r++), e = e.nextElementSibling;
  }
}
const je = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, n) => (n ? "-" : "") + e.toLowerCase()), ht = {
  prefix: "bind",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(() => {
    const e = je(t.key), r = `${t.expressionFn(t)}`;
    !r || r === "false" || r === "null" || r === "undefined" ? t.el.removeAttribute(e) : t.el.setAttribute(e, r);
  })
}, mt = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/, W = ["change", "input", "keydown"], gt = {
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
    const { el: e, expression: n } = t, r = t.expressionFn(t), s = e.tagName.toLowerCase(), o = s.includes("input"), i = s.includes("select"), a = s.includes("textarea"), f = s.includes("radio"), u = e.getAttribute("type"), c = s.includes("checkbox") || o && u === "checkbox", l = o && u === "file";
    if (!o && !i && !a && !c && !f)
      throw new Error("Element must be input, select, textarea, checkbox or radio");
    const y = () => {
      if (!r)
        throw new Error(`Signal ${n} not found`);
      const h = "value" in e, p = r.value;
      c ? e.checked = p : l || (h ? e.value = `${p}` : e.setAttribute("value", `${p}`));
    }, _ = t.reactivity.effect(y), w = () => {
      if (l) {
        const [E] = e?.files || [];
        if (!E) {
          r.value = "";
          return;
        }
        const T = new FileReader(), M = t.store();
        T.onload = () => {
          if (typeof T.result != "string")
            throw new Error("Unsupported type");
          const P = T.result.match(mt);
          if (!P?.groups)
            throw new Error("Invalid data URI");
          const { mime: H, contents: x } = P.groups;
          r.value = x;
          const D = `${n}Mime`;
          if (D in M) {
            const K = M[`${D}`];
            K.value = H;
          }
        }, T.readAsDataURL(E);
        const I = `${n}Name`;
        if (I in M) {
          const P = M[`${I}`];
          P.value = E.name;
        }
        return;
      }
      const h = r.value, p = e;
      if (typeof h == "number")
        r.value = Number(p.value);
      else if (typeof h == "string")
        r.value = p.value;
      else if (typeof h == "boolean")
        c ? r.value = p.checked : r.value = !!p.value;
      else if (!(typeof h > "u"))
        if (typeof h == "bigint")
          r.value = BigInt(p.value);
        else
          throw console.log(typeof h), new Error("Unsupported type");
    }, g = e.tagName.split("-");
    if (g.length > 1) {
      const h = g[0].toLowerCase();
      W.forEach((p) => {
        W.push(`${h}-${p}`);
      });
    }
    return W.forEach((h) => e.addEventListener(h, w)), () => {
      _(), W.forEach((h) => e.removeEventListener(h, w));
    };
  }
}, vt = {
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
}, yt = {
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
      const u = ye(o), c = z(o, "leading", !1), l = z(o, "noTrail", !0);
      s = Et(s, u, c, l);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const u = ye(i), c = z(i, "noLead", !0), l = z(i, "noTrail", !0);
      s = bt(s, u, c, l);
    }
    const a = {
      capture: !0,
      passive: !1,
      once: !1
    };
    t.modifiers.has("capture") || (a.capture = !1), t.modifiers.has("passive") && (a.passive = !0), t.modifiers.has("once") && (a.once = !0);
    const f = je(n).toLowerCase();
    return f === "load" ? (s(), () => {
    }) : (e.addEventListener(f, s, a), () => e.removeEventListener(f, s));
  }
}, _t = {
  prefix: "focus",
  mustHaveEmptyKey: !0,
  mustHaveEmptyExpression: !0,
  onLoad: (t) => (t.el.tabIndex || t.el.setAttribute("tabindex", "0"), t.el.focus(), t.el.scrollIntoView({ block: "center", inline: "center" }), () => t.el.blur())
}, wt = [
  ht,
  gt,
  vt,
  _t,
  yt
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
function z(t, e, n = !1) {
  return t ? t.includes(e) || n : !1;
}
function Et(t, e, n = !1, r = !0) {
  let s;
  const o = () => s && clearTimeout(s);
  return function(...a) {
    o(), n && !s && t(...a), s = setTimeout(() => {
      r && t(...a), o();
    }, e);
  };
}
function bt(t, e, n = !0, r = !1) {
  let s = !1, o = null;
  return function(...a) {
    s ? o = a : (s = !0, n ? t(...a) : o = a, setTimeout(() => {
      r && o && (t(...o), o = null), s = !1;
    }, e));
  };
}
const Y = /* @__PURE__ */ new WeakSet();
function St(t, e, n = {}) {
  t instanceof Document && (t = t.documentElement);
  let r;
  typeof e == "string" ? r = kt(e) : r = e;
  const s = Mt(r), o = At(t, s, n);
  return Je(t, s, o);
}
function Je(t, e, n) {
  if (n.head.block) {
    const r = t.querySelector("head"), s = e.querySelector("head");
    if (r && s) {
      const o = Ge(s, r, n);
      Promise.all(o).then(() => {
        Je(
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
    const r = Rt(e, t, n);
    if (!r)
      throw new Error("Could not find best match");
    const s = r?.previousSibling, o = r?.nextSibling, i = Q(t, r, n);
    return r ? Pt(s, i, o) : [];
  } else
    throw "Do not understand how to morph style " + n.morphStyle;
}
function Q(t, e, n) {
  if (!(n.ignoreActive && t === document.activeElement))
    if (e == null) {
      if (n.callbacks.beforeNodeRemoved(t) === !1)
        return;
      t.remove(), n.callbacks.afterNodeRemoved(t);
      return;
    } else {
      if (te(t, e))
        return n.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && n.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && n.head.style !== "morph" ? Ge(e, t, n) : (Tt(e, t), qe(e, t, n))), n.callbacks.afterNodeMorphed(t, e), t);
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
      Q(s, o, n), s = s.nextSibling, R(n, o);
      continue;
    }
    let i = Lt(t, e, o, s, n);
    if (i) {
      s = _e(s, i, n), Q(i, o, n), R(n, o);
      continue;
    }
    let a = Nt(t, o, s, n);
    if (a) {
      s = _e(s, a, n), Q(a, o, n), R(n, o);
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
function Tt(t, e) {
  let n = t.nodeType;
  if (n === 1) {
    for (const r of t.attributes)
      e.getAttribute(r.name) !== r.value && e.setAttribute(r.name, r.value);
    for (const r of e.attributes)
      t.hasAttribute(r.name) || e.removeAttribute(r.name);
  }
  if ((n === Node.COMMENT_NODE || n === Node.TEXT_NODE) && e.nodeValue !== t.nodeValue && (e.nodeValue = t.nodeValue), t instanceof HTMLInputElement && e instanceof HTMLInputElement && t.type !== "file")
    e.value = t.value || "", Z(t, e, "value"), Z(t, e, "checked"), Z(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    Z(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const r = t.value, s = e.value;
    r !== s && (e.value = r), e.firstChild && e.firstChild.nodeValue !== r && (e.firstChild.nodeValue = r);
  }
}
function Z(t, e, n) {
  const r = t.getAttribute(n), s = e.getAttribute(n);
  r !== s && (r ? e.setAttribute(n, r) : e.removeAttribute(n));
}
function Ge(t, e, n) {
  const r = [], s = [], o = [], i = [], a = n.head.style, f = /* @__PURE__ */ new Map();
  for (const c of t.children)
    f.set(c.outerHTML, c);
  for (const c of e.children) {
    let l = f.has(c.outerHTML), y = n.head.shouldReAppend(c), _ = n.head.shouldPreserve(c);
    l || _ ? y ? s.push(c) : (f.delete(c.outerHTML), o.push(c)) : a === "append" ? y && (s.push(c), i.push(c)) : n.head.shouldRemove(c) !== !1 && s.push(c);
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
        const _ = new Promise((w) => {
          y = w;
        });
        l.addEventListener("load", function() {
          y(void 0);
        }), u.push(_);
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
function At(t, e, n) {
  return {
    target: t,
    newContent: e,
    config: n,
    morphStyle: n.morphStyle,
    ignoreActive: n.ignoreActive,
    idMap: It(t, e),
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
function te(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function _e(t, e, n) {
  for (; t !== e; ) {
    const r = t;
    if (t = t?.nextSibling, !r)
      throw new Error("tempNode is null");
    We(r, n);
  }
  return R(n, e), e.nextSibling;
}
function Lt(t, e, n, r, s) {
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
function Nt(t, e, n, r) {
  let s = n, o = e.nextSibling, i = 0;
  for (; s && o; ) {
    if (j(r, s, t) > 0)
      return null;
    if (te(e, s))
      return s;
    if (te(o, s) && (i++, o = o.nextSibling, i >= 2))
      return null;
    s = s.nextSibling;
  }
  return s;
}
const we = new DOMParser();
function kt(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const n = we.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return Y.add(n), n;
    {
      let r = n.firstChild;
      return r ? (Y.add(r), r) : null;
    }
  } else {
    const r = we.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!r)
      throw new Error("content is null");
    return Y.add(r), r;
  }
}
function Mt(t) {
  if (t == null)
    return document.createElement("div");
  if (Y.has(t))
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
function Pt(t, e, n) {
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
    let i = $t(r, e, n);
    i > o && (s = r, o = i), r = r.nextSibling;
  }
  return s;
}
function $t(t, e, n) {
  return te(t, e) ? 0.5 + j(n, t, e) : 0;
}
function We(t, e) {
  R(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function Ot(t, e) {
  return !t.deadIds.has(e);
}
function Ct(t, e, n) {
  return t.idMap.get(n)?.has(e) || !1;
}
function R(t, e) {
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
    Ot(t, o) && Ct(t, o, n) && ++s;
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
function It(t, e) {
  const n = /* @__PURE__ */ new Map();
  return Ee(t, n), Ee(e, n), n;
}
const Ht = "get", xt = "post", Dt = "put", Ft = "patch", Ut = "delete", Vt = [Ht, xt, Dt, Ft, Ut], Bt = Vt.reduce((t, e) => (t[e] = async (n) => {
  const r = Document;
  if (!r.startViewTransition) {
    await Se(e, n);
    return;
  }
  return new Promise((s) => {
    r.startViewTransition(async () => {
      await Se(e, n), s();
    });
  });
}, t), {}), jt = "Accept", Jt = "Content-Type", qt = "datastar-request", Gt = "application/json", Kt = "text/event-stream", Wt = "true", J = "datastar-", q = `${J}indicator`, fe = `${q}-loading`, be = `${J}settling`, X = `${J}swapping`, zt = "self", b = {
  MorphElement: "morph_element",
  InnerElement: "inner_element",
  OuterElement: "outer_element",
  PrependElement: "prepend_element",
  AppendElement: "append_element",
  BeforeElement: "before_element",
  AfterElement: "after_element",
  DeleteElement: "delete_element",
  UpsertAttributes: "upsert_attributes"
}, Zt = {
  prefix: "header",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => {
    const e = t.store().fetch.headers, n = t.key[0].toUpperCase() + t.key.slice(1);
    return e[n] = t.reactivity.computed(() => t.expressionFn(t)), () => {
      delete e[n];
    };
  }
}, Xt = {
  prefix: "fetchUrl",
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
    const e = t.reactivity.computed(() => `${t.expressionFn(t)}`), n = t.store();
    return n.fetch.elementURLs[t.el.id] = e, () => {
      delete n.fetch.elementURLs[t.el.id];
    };
  })
}, Yt = {
  prefix: "fetchIndicator",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onGlobalInit: () => {
    const t = document.createElement("style");
    t.innerHTML = `
.${q}{
 opacity:0;
 transition: opacity 300ms ease-out;
}
.${fe} {
 opacity:1;
 transition: opacity 300ms ease-in;
}
`, document.head.appendChild(t);
  },
  onLoad: (t) => t.reactivity.effect(() => {
    const e = t.reactivity.computed(() => `${t.expressionFn(t)}`), n = t.store();
    n.fetch.indicatorSelectors[t.el.id] = e;
    const r = document.querySelector(e.value);
    if (!r)
      throw new Error(`No indicator found for ${e.value}`);
    return r.classList.add(q), () => {
      delete n.fetch.indicatorSelectors[t.el.id];
    };
  })
}, Qt = [Zt, Xt, Yt], en = /(?<key>\w*): (?<value>.*)/gm;
async function Se(t, e) {
  const n = e.store(), r = n.fetch.elementURLs[e.el.id];
  if (!r)
    return;
  const s = { ...n.value };
  delete s.fetch;
  const o = Ve(s);
  let i = e.el, a = !1;
  const f = n.fetch.indicatorSelectors[i.id];
  if (f) {
    const g = document.querySelector(f);
    g && (i = g, i.classList.remove(q), i.classList.add(fe), a = !0);
  }
  const u = new URL(r.value, window.location.origin), c = new Headers();
  c.append(jt, Kt), c.append(Jt, Gt), c.append(qt, Wt);
  const l = n.fetch.headers.value;
  if (l)
    for (const g in l) {
      const d = l[g];
      c.append(g, d);
    }
  t = t.toUpperCase();
  const y = { method: t, headers: c };
  if (t === "GET") {
    const g = new URLSearchParams(u.search);
    g.append("datastar", o), u.search = g.toString();
  } else
    y.body = o;
  const _ = await fetch(u, y);
  if (!_.ok)
    throw new Error(`Response was not ok, url: ${u}, status: ${_.status}`);
  if (!_.body)
    throw new Error("No response body");
  const w = _.body.pipeThrough(new TextDecoderStream()).getReader();
  for (; ; ) {
    const { done: g, value: d } = await w.read();
    if (g)
      break;
    d.split(`

`).forEach((h) => {
      const p = [...h.matchAll(en)];
      if (p.length) {
        let E = "", T = "morph_element", M = "", I = 0, P = !1, H = "", x, D = !1, K = !1;
        for (const me of p) {
          if (!me.groups)
            continue;
          const { key: Ze, value: L } = me.groups;
          switch (Ze) {
            case "event":
              if (!L.startsWith(J))
                throw new Error(`Unknown event: ${L}`);
              switch (L.slice(J.length)) {
                case "redirect":
                  P = !0;
                  break;
                case "fragment":
                  K = !0;
                  break;
                case "error":
                  D = !0;
                  break;
                default:
                  throw new Error(`Unknown event: ${L}`);
              }
              break;
            case "data":
              const oe = L.indexOf(" ");
              if (oe === -1)
                throw new Error("Missing space in data");
              const ge = L.slice(0, oe), $ = L.slice(oe + 1);
              switch (ge) {
                case "selector":
                  M = $;
                  break;
                case "merge":
                  const ve = $;
                  if (!Object.values(b).includes(ve))
                    throw new Error(`Unknown merge option: ${L}`);
                  T = ve;
                  break;
                case "settle":
                  I = parseInt($);
                  break;
                case "fragment":
                case "html":
                  E = $;
                  break;
                case "redirect":
                  H = $;
                  break;
                case "error":
                  x = new Error($);
                  break;
                default:
                  throw new Error(`Unknown data type: ${ge}`);
              }
          }
        }
        if (D && x)
          throw x;
        if (P && H)
          window.location.href = H;
        else if (K && E)
          tn(e, M, T, E, I);
        else
          throw new Error(`Unknown event block: ${h}`);
      }
    });
  }
  a && (i.classList.remove(fe), i.classList.add(q));
}
const Te = document.createElement("template");
function tn(t, e, n, r, s) {
  const { el: o } = t;
  Te.innerHTML = r;
  const i = Te.content.firstChild;
  if (!(i instanceof Element))
    throw new Error(`Fragment is not an element, source '${r}'`);
  const a = e === zt;
  let f;
  if (a)
    f = [o];
  else {
    const u = e || `#${i.getAttribute("id")}`;
    if (f = document.querySelectorAll(u) || [], !f)
      throw new Error(`No target elements, selector: ${e}`);
  }
  for (const u of f) {
    u.classList.add(X);
    const c = u.outerHTML;
    let l = u;
    switch (n) {
      case b.MorphElement:
        const _ = St(l, i);
        if (!_?.length)
          throw new Error("Failed to morph element");
        l = _[0];
        break;
      case b.InnerElement:
        l.innerHTML = i.innerHTML;
        break;
      case b.OuterElement:
        l.replaceWith(i);
        break;
      case b.PrependElement:
        l.prepend(i);
        break;
      case b.AppendElement:
        l.append(i);
        break;
      case b.BeforeElement:
        l.before(i);
        break;
      case b.AfterElement:
        l.after(i);
        break;
      case b.DeleteElement:
        setTimeout(() => l.remove(), s);
        break;
      case b.UpsertAttributes:
        i.getAttributeNames().forEach((g) => {
          const d = i.getAttribute(g);
          l.setAttribute(g, d);
        });
        break;
      default:
        throw new Error(`Unknown merge type: ${n}`);
    }
    l.classList.add(X), t.cleanupElementRemovals(u), t.applyPlugins(l), u.classList.remove(X), l.classList.remove(X);
    const y = l.outerHTML;
    c !== y && (l.classList.add(be), setTimeout(() => {
      l.classList.remove(be);
    }, s));
  }
}
const ie = "display", Ae = "none", ae = "important", nn = {
  prefix: "show",
  allowedModifiers: /* @__PURE__ */ new Set([ae]),
  onLoad: (t) => {
    const { el: e, modifiers: n, expressionFn: r } = t;
    return pe(() => {
      const o = !!r(t), a = n.has(ae) ? ae : void 0;
      o ? e.style.length === 1 && e.style.display === Ae ? e.style.removeProperty(ie) : e.style.setProperty(ie, "", a) : e.style.setProperty(ie, Ae, a);
    });
  }
}, rn = "intersects", Le = "once", Ne = "half", ke = "full", sn = {
  prefix: rn,
  allowedModifiers: /* @__PURE__ */ new Set([Le, Ne, ke]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, n = { threshold: 0 };
    e.has(ke) ? n.threshold = 1 : e.has(Ne) && (n.threshold = 0.5);
    const r = new IntersectionObserver((s) => {
      s.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(Le) && r.disconnect());
      });
    }, n);
    return r.observe(t.el), () => r.disconnect();
  }
}, Me = "prepend", Pe = "append", Re = new Error("Target element must have a parent if using prepend or append"), on = {
  prefix: "teleport",
  allowedModifiers: /* @__PURE__ */ new Set([Me, Pe]),
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
    if (Oe(o)?.firstElementChild)
      throw new Error("Empty template");
    if (n.has(Me)) {
      if (!s.parentNode)
        throw Re;
      s.parentNode.insertBefore(o, s);
    } else if (n.has(Pe)) {
      if (!s.parentNode)
        throw Re;
      s.parentNode.insertBefore(o, s.nextSibling);
    } else
      s.appendChild(o);
  }
}, an = {
  prefix: "scrollIntoView",
  onLoad: (t) => {
    const { el: e } = t;
    e.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  }
}, $e = "ds-view-transition-stylesheet", ln = {
  prefix: "viewTransition",
  onGlobalInit(t) {
    const e = document.createElement("style");
    e.id = $e, document.head.appendChild(e);
    let n = !1;
    if (document.head.childNodes.forEach((r) => {
      r instanceof HTMLMetaElement && r.name === "view-transition" && (n = !0);
    }), !n) {
      const r = document.createElement("meta");
      r.name = "view-transition", r.content = "same-origin", document.head.appendChild(r);
    }
    t.mergeStore({
      viewTransitionRefCounts: {}
    });
  },
  onLoad: (t) => {
    const { el: e, expressionFn: n } = t;
    let r = n(t);
    if (!r) {
      if (!e.id)
        throw new Error("Element must have an id if no name is provided");
      r = e.id;
    }
    const s = document.getElementById($e);
    if (!s)
      throw new Error("View transition stylesheet not found");
    const o = `ds-vt-${r}`, i = `
.${o} {
  view-transition: ${r};
}

`;
    s.innerHTML += i;
    const a = t.store();
    let f = a.viewTransitionRefCounts[r];
    return f || (f = t.reactivity.signal(0), a.viewTransitionRefCounts[r] = f), f.value++, e.classList.add(o), () => {
      f.value--, f.value === 0 && (delete a.viewTransitionRefCounts[r], s.innerHTML = s.innerHTML.replace(i, ""));
    };
  }
}, cn = [
  nn,
  sn,
  on,
  an,
  ln
], un = {
  setAll: async (t, e, n) => {
    const r = new RegExp(e);
    t.walkSignals((s, o) => r.test(s) && (o.value = n));
  },
  toggleAll: async (t, e) => {
    const n = new RegExp(e);
    t.walkSignals((r, s) => n.test(r) && (s.value = !s.value));
  }
};
function fn(t = {}, ...e) {
  const n = performance.now(), r = new pt(t, ...e);
  r.run();
  const s = performance.now();
  return console.log(`Datastar loaded and attached to all DOM elements in ${s - n}ms`), r;
}
function dn(t = {}, ...e) {
  const n = Object.assign({}, un, Bt, t), r = [...Qt, ...cn, ...wt, ...e];
  return fn(n, ...r);
}
const ze = window;
ze.ds = dn();
ze.dispatchEvent(new CustomEvent("datastar-ready"));
export {
  pt as Datastar,
  fn as runDatastarWith,
  dn as runDatastarWithAllPlugins,
  Oe as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
