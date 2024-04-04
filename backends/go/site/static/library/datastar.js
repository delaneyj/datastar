function Me(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function Y() {
  throw new Error("Cycle detected");
}
function Ge() {
  throw new Error("Computed cannot have side-effects");
}
const Ke = Symbol.for("preact-signals"), N = 1, C = 2, F = 4, R = 8, H = 16, O = 32;
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
    for (x = void 0, se++; n !== void 0; ) {
      const r = n._nextBatchedEffect;
      if (n._nextBatchedEffect = void 0, n._flags &= ~C, !(n._flags & R) && $e(n))
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
function ze(t) {
  if (D > 0)
    return t();
  Q();
  try {
    return t();
  } finally {
    ee();
  }
}
let m, x, D = 0, se = 0, Z = 0;
function Pe(t) {
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
    }, m._sources !== void 0 && (m._sources._nextSource = e), m._sources = e, t._node = e, m._flags & O && t._subscribe(e), e;
  if (e._version === -1)
    return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = m._sources, e._nextSource = void 0, m._sources._nextSource = e, m._sources = e), e;
}
function y(t) {
  this._value = t, this._version = 0, this._node = void 0, this._targets = void 0;
}
y.prototype.brand = Ke;
y.prototype._refresh = function() {
  return !0;
};
y.prototype._subscribe = function(t) {
  this._targets !== t && t._prevTarget === void 0 && (t._nextTarget = this._targets, this._targets !== void 0 && (this._targets._prevTarget = t), this._targets = t);
};
y.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0) {
    const e = t._prevTarget, n = t._nextTarget;
    e !== void 0 && (e._nextTarget = n, t._prevTarget = void 0), n !== void 0 && (n._prevTarget = e, t._nextTarget = void 0), t === this._targets && (this._targets = n);
  }
};
y.prototype.subscribe = function(t) {
  const e = this;
  return ue(function() {
    const n = e.value, r = this._flags & O;
    this._flags &= ~O;
    try {
      t(n);
    } finally {
      this._flags |= r;
    }
  });
};
y.prototype.valueOf = function() {
  return this.value;
};
y.prototype.toString = function() {
  return this.value + "";
};
y.prototype.toJSON = function() {
  return this.value;
};
y.prototype.peek = function() {
  return this._value;
};
Object.defineProperty(y.prototype, "value", {
  get() {
    const t = Pe(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (m instanceof M && Ge(), t !== this._value) {
      se > 100 && Y(), this._value = t, this._version++, Z++, Q();
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
  return new y(t);
}
function $e(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    if (e._source._version !== e._version || !e._source._refresh() || e._source._version !== e._version)
      return !0;
  return !1;
}
function Ce(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource) {
    const n = e._source._node;
    if (n !== void 0 && (e._rollbackNode = n), e._source._node = e, e._version = -1, e._nextSource === void 0) {
      t._sources = e;
      break;
    }
  }
}
function Re(t) {
  let e = t._sources, n;
  for (; e !== void 0; ) {
    const r = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), r !== void 0 && (r._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = r)) : n = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = r;
  }
  t._sources = n;
}
function M(t) {
  y.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = Z - 1, this._flags = F;
}
M.prototype = new y();
M.prototype._refresh = function() {
  if (this._flags &= ~C, this._flags & N)
    return !1;
  if ((this._flags & (F | O)) === O || (this._flags &= ~F, this._globalVersion === Z))
    return !0;
  if (this._globalVersion = Z, this._flags |= N, this._version > 0 && !$e(this))
    return this._flags &= ~N, !0;
  const t = m;
  try {
    Ce(this), m = this;
    const e = this._compute();
    (this._flags & H || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~H, this._version++);
  } catch (e) {
    this._value = e, this._flags |= H, this._version++;
  }
  return m = t, Re(this), this._flags &= ~N, !0;
};
M.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= F | O;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  y.prototype._subscribe.call(this, t);
};
M.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (y.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~O;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
M.prototype._notify = function() {
  if (!(this._flags & C)) {
    this._flags |= F | C;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
M.prototype.peek = function() {
  if (this._refresh() || Y(), this._flags & H)
    throw this._value;
  return this._value;
};
Object.defineProperty(M.prototype, "value", {
  get() {
    this._flags & N && Y();
    const t = Pe(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & H)
      throw this._value;
    return this._value;
  }
});
function Ze(t) {
  return new M(t);
}
function Ie(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    Q();
    const n = m;
    m = void 0;
    try {
      e();
    } catch (r) {
      throw t._flags &= ~N, t._flags |= R, ce(t), r;
    } finally {
      m = n, ee();
    }
  }
}
function ce(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Ie(t);
}
function Xe(t) {
  if (m !== this)
    throw new Error("Out-of-order effect");
  Re(this), m = t, this._flags &= ~N, this._flags & R && ce(this), ee();
}
function U(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = O;
}
U.prototype._callback = function() {
  const t = this._start();
  try {
    if (this._flags & R || this._compute === void 0)
      return;
    const e = this._compute();
    typeof e == "function" && (this._cleanup = e);
  } finally {
    t();
  }
};
U.prototype._start = function() {
  this._flags & N && Y(), this._flags |= N, this._flags &= ~R, Ie(this), Ce(this), Q();
  const t = m;
  return m = this, Xe.bind(this, t);
};
U.prototype._notify = function() {
  this._flags & C || (this._flags |= C, this._nextBatchedEffect = x, x = this);
};
U.prototype._dispose = function() {
  this._flags |= R, this._flags & N || ce(this);
};
function ue(t) {
  const e = new U(t);
  try {
    e._callback();
  } catch (n) {
    throw e._dispose(), n;
  }
  return e._dispose.bind(e);
}
class He {
  get value() {
    return ie(this);
  }
  set value(e) {
    ze(() => Ye(this, e));
  }
  peek() {
    return ie(this, { peek: !0 });
  }
}
const oe = (t) => Object.assign(
  new He(),
  Object.entries(t).reduce(
    (e, [n, r]) => {
      if (["value", "peek"].some((s) => s === n))
        throw new Error(`${n} is a reserved property name`);
      return typeof r != "object" || r === null || Array.isArray(r) ? e[n] = Oe(r) : e[n] = oe(r), e;
    },
    {}
  )
), Ye = (t, e) => Object.keys(e).forEach((n) => t[n].value = e[n]), ie = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (n, [r, s]) => (s instanceof y ? n[r] = e ? s.peek() : s.value : s instanceof He && (n[r] = ie(s, { peek: e })), n),
  {}
), Qe = /([\[:])?(\d{17,}|(?:[9](?:[1-9]07199254740991|0[1-9]7199254740991|00[8-9]199254740991|007[2-9]99254740991|007199[3-9]54740991|0071992[6-9]4740991|00719925[5-9]740991|007199254[8-9]40991|0071992547[5-9]0991|00719925474[1-9]991|00719925474099[2-9])))([,\}\]])/g;
function xe(t, e = 2) {
  return JSON.stringify(
    t,
    (r, s) => typeof s == "bigint" ? s.toString() + "n" : s,
    e
  ).replace(/"(-?\d+)n"/g, (r, s) => s);
}
function et(t) {
  const e = t.replace(Qe, '$1"$2n"$3');
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
function De(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return e;
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let n = t;
  return typeof t != "object" && (n = { ...e }), Object.keys(e).forEach((r) => {
    n.hasOwnProperty(r) || (n[r] = e[r]), e[r] === null ? delete n[r] : n[r] = De(n[r], e[r]);
  }), n;
}
const tt = "[a-zA-Z_$][0-9a-zA-Z_$.]*";
function fe(t, e, n) {
  return new RegExp(`(?<whole>\\${t}(?<${e}>${tt})${n})`, "g");
}
const nt = {
  regexp: fe("$", "signal", ""),
  replacer: (t) => {
    const { signal: e } = t;
    return `ctx.store().${e}.value`;
  }
}, rt = {
  regexp: fe("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => {
    const n = ["ctx"];
    e && n.push(...e.split(",").map((s) => s.trim()));
    const r = n.join(",");
    return `ctx.actions.${t}(${r})`;
  }
}, st = {
  regexp: fe("~", "ref", ""),
  replacer({ ref: t }) {
    return `data.refs.${t}`;
  }
}, ot = [rt, nt, st], it = {
  prefix: "store",
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
    signal: Oe,
    computed: Ze,
    effect: ue
  };
  parentID = "";
  missingIDNext = 0;
  removals = /* @__PURE__ */ new Map();
  constructor(e = {}, ...n) {
    if (this.actions = Object.assign(this.actions, e), n = [...lt, ...n], !n.length)
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
    return xe(e);
  }
  JSONParse(e) {
    return et(e);
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
    const n = De(this.store.value, e);
    this.store = oe(n);
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
            const h = o.tagName.toLowerCase();
            if (![...r.allowedTagRegexps].some((d) => h.match(d)))
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
          const c = l.map((h) => {
            const [p, ...d] = h.split("_");
            return { label: p, args: d };
          });
          if (r.allowedModifiers) {
            for (const h of c)
              if (!r.allowedModifiers.has(h.label))
                throw new Error(`'${h.label}' is not allowed`);
          }
          const g = /* @__PURE__ */ new Map();
          for (const h of c)
            g.set(h.label, h.args);
          if (r.mustHaveEmptyExpression && a.length)
            throw new Error(`'${i}' must have empty expression`);
          if (r.mustNotEmptyExpression && !a.length)
            throw new Error(`'${i}' must have non-empty expression`);
          const w = [...r.preprocessors?.pre || [], ...ot, ...r.preprocessors?.post || []];
          for (const h of w) {
            if (n.has(h))
              continue;
            n.add(h);
            const p = a.split(";"), d = [];
            p.forEach((E) => {
              let v = E;
              const S = [...v.matchAll(h.regexp)];
              if (S.length)
                for (const k of S) {
                  if (!k.groups)
                    continue;
                  const { groups: L } = k, { whole: T } = L;
                  v = v.replace(T, h.replacer(L));
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
            JSONParse: this.JSONParse,
            JSONStringify: this.JSONStringify,
            modifiers: g
          };
          if (!r.bypassExpressionFunctionCreation?.(b) && !r.mustHaveEmptyExpression && a.length) {
            const h = a.split(";").map((d) => d.trim());
            h[h.length - 1] = `return ${h[h.length - 1]}`;
            const p = `
try {
${h.map((d) => `  ${d}`).join(`;
`)}
} catch (e) {
  throw e
}
            `;
            try {
              const d = new Function("ctx", p);
              b.expressionFn = d;
            } catch {
              throw new Error(`Error creating expression function for '${p}'`);
            }
          }
          const _ = r.onLoad(b);
          _ && (this.removals.has(o) || this.removals.set(o, /* @__PURE__ */ new Set()), this.removals.get(o).add(_));
        }
      });
    });
  }
  walkSignalsStore(e, n) {
    const r = Object.keys(e);
    for (let s = 0; s < r.length; s++) {
      const o = r[s], i = e[o], a = i instanceof y, u = typeof i == "object" && Object.keys(i).length > 0;
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
    const s = Me(e);
    if (s)
      for (n(s), r = 0, e = e.firstElementChild; e; )
        this.walkDownDOM(e, n, r++), e = e.nextElementSibling;
  }
}
const Fe = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, n) => (n ? "-" : "") + e.toLowerCase()), ut = {
  prefix: "bind",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(() => {
    const e = Fe(t.key), r = `${t.expressionFn(t)}`;
    !r || r === "false" || r === "null" || r === "undefined" ? t.el.removeAttribute(e) : t.el.setAttribute(e, r);
  })
}, ft = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/, J = ["change", "input", "keydown"], dt = {
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
    const { el: e, expression: n } = t, r = t.expressionFn(t), s = e.tagName.toLowerCase(), o = s.includes("input"), i = s.includes("select"), a = s.includes("textarea"), u = s.includes("radio"), f = e.getAttribute("type"), l = s.includes("checkbox") || o && f === "checkbox", c = o && f === "file";
    if (!o && !i && !a && !l && !u)
      throw new Error("Element must be input, select, textarea, checkbox or radio");
    const g = () => {
      if (!r)
        throw new Error(`Signal ${n} not found`);
      const p = "value" in e, d = r.value;
      l ? e.checked = d : c || (p ? e.value = `${d}` : e.setAttribute("value", `${d}`));
    }, w = t.reactivity.effect(g), b = () => {
      if (c) {
        const [E] = e?.files || [];
        if (!E) {
          r.value = "";
          return;
        }
        const v = new FileReader(), S = t.store();
        v.onload = () => {
          if (typeof v.result != "string")
            throw new Error("Unsupported type");
          const L = v.result.match(ft);
          if (!L?.groups)
            throw new Error("Invalid data URI");
          const { mime: T, contents: I } = L.groups;
          r.value = I;
          const te = `${n}Mime`;
          if (te in S) {
            const We = S[`${te}`];
            We.value = T;
          }
        }, v.readAsDataURL(E);
        const k = `${n}Name`;
        if (k in S) {
          const L = S[`${k}`];
          L.value = E.name;
        }
        return;
      }
      const p = r.value, d = e;
      if (typeof p == "number")
        r.value = Number(d.value);
      else if (typeof p == "string")
        r.value = d.value;
      else if (typeof p == "boolean")
        l ? r.value = d.checked : r.value = !!d.value;
      else if (!(typeof p > "u"))
        if (typeof p == "bigint")
          r.value = BigInt(d.value);
        else
          throw console.log(typeof p), new Error("Unsupported type");
    }, _ = e.tagName.split("-");
    if (_.length > 1) {
      const p = _[0].toLowerCase();
      J.forEach((d) => {
        J.push(`${p}-${d}`);
      });
    }
    return J.forEach((p) => e.addEventListener(p, b)), () => {
      w(), J.forEach((p) => e.removeEventListener(p, b));
    };
  }
}, ht = {
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
}, pt = {
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
      const f = de(o), l = q(o, "leading", !1), c = q(o, "noTrail", !0);
      s = vt(s, f, l, c);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const f = de(i), l = q(i, "noLead", !0), c = q(i, "noTrail", !0);
      s = yt(s, f, l, c);
    }
    const a = {
      capture: !0,
      passive: !1,
      once: !1
    };
    t.modifiers.has("capture") || (a.capture = !1), t.modifiers.has("passive") && (a.passive = !0), t.modifiers.has("once") && (a.once = !0);
    const u = Fe(n).toLowerCase();
    return u === "load" ? (s(), () => {
    }) : (e.addEventListener(u, s, a), () => e.removeEventListener(u, s));
  }
}, mt = {
  prefix: "focus",
  mustHaveEmptyKey: !0,
  mustHaveEmptyExpression: !0,
  onLoad: (t) => (t.el.tabIndex || t.el.setAttribute("tabindex", "0"), t.el.focus(), t.el.scrollIntoView({ block: "center", inline: "center" }), () => t.el.blur())
}, gt = [
  ut,
  dt,
  ht,
  mt,
  pt
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
function q(t, e, n = !1) {
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
  return new Promise((f, l) => {
    const c = { ...n };
    c.accept || (c.accept = ae);
    let g;
    function w() {
      g.abort(), document.hidden || d();
    }
    a || document.addEventListener("visibilitychange", w);
    let b = bt, _ = 0;
    function h() {
      document.removeEventListener("visibilitychange", w), window.clearTimeout(_), g.abort();
    }
    e?.addEventListener("abort", () => {
      h(), f();
    });
    const p = r ?? _t;
    async function d() {
      g = new AbortController();
      try {
        const E = await fetch(t, {
          ...u,
          headers: c,
          signal: g.signal
        });
        await p(E), await Et(
          E.body,
          St(
            Tt(
              (v) => {
                v ? c[he] = v : delete c[he];
              },
              (v) => {
                b = v;
              },
              s
            )
          )
        ), o?.(), h(), f();
      } catch (E) {
        if (!g.signal.aborted)
          try {
            const v = i?.(E) ?? b;
            window.clearTimeout(_), _ = window.setTimeout(d, v);
          } catch (v) {
            h(), l(v);
          }
      }
    }
    d();
  });
}
const ae = "text/event-stream", bt = 1e3, he = "last-event-id";
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
function Tt(t, e, n) {
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
          const c = parseInt(l, 10);
          isNaN(c) || e(r.retry = c);
          break;
      }
    }
  };
}
function At(t, e) {
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
const K = /* @__PURE__ */ new WeakSet();
function Nt(t, e, n = {}) {
  t instanceof Document && (t = t.documentElement);
  let r;
  typeof e == "string" ? r = Ot(e) : r = e;
  const s = $t(r), o = Lt(t, s, n);
  return Be(t, s, o);
}
function Be(t, e, n) {
  if (n.head.block) {
    const r = t.querySelector("head"), s = e.querySelector("head");
    if (r && s) {
      const o = je(s, r, n);
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
    return Ve(e, t, n), t.children;
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
        return n.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && n.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && n.head.style !== "morph" ? je(e, t, n) : (kt(e, t), Ve(e, t, n))), n.callbacks.afterNodeMorphed(t, e), t);
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
      e.appendChild(o), n.callbacks.afterNodeAdded(o), $(n, o);
      continue;
    }
    if (Ue(o, s, n)) {
      z(s, o, n), s = s.nextSibling, $(n, o);
      continue;
    }
    let i = Mt(t, e, o, s, n);
    if (i) {
      s = me(s, i, n), z(i, o, n), $(n, o);
      continue;
    }
    let a = Pt(t, o, s, n);
    if (a) {
      s = me(s, a, n), z(a, o, n), $(n, o);
      continue;
    }
    if (n.callbacks.beforeNodeAdded(o) === !1)
      return;
    e.insertBefore(o, s), n.callbacks.afterNodeAdded(o), $(n, o);
  }
  for (; s !== null; ) {
    let i = s;
    s = s.nextSibling, Je(i, n);
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
function je(t, e, n) {
  const r = [], s = [], o = [], i = [], a = n.head.style, u = /* @__PURE__ */ new Map();
  for (const l of t.children)
    u.set(l.outerHTML, l);
  for (const l of e.children) {
    let c = u.has(l.outerHTML), g = n.head.shouldReAppend(l), w = n.head.shouldPreserve(l);
    c || w ? g ? s.push(l) : (u.delete(l.outerHTML), o.push(l)) : a === "append" ? g && (s.push(l), i.push(l)) : n.head.shouldRemove(l) !== !1 && s.push(l);
  }
  i.push(...u.values());
  const f = [];
  for (const l of i) {
    const c = document.createRange().createContextualFragment(l.outerHTML).firstChild;
    if (!c)
      throw new Error("could not create new element from: " + l.outerHTML);
    if (n.callbacks.beforeNodeAdded(c)) {
      if (c.hasAttribute("href") || c.hasAttribute("src")) {
        let g;
        const w = new Promise((b) => {
          g = b;
        });
        c.addEventListener("load", function() {
          g(void 0);
        }), f.push(w);
      }
      e.appendChild(c), n.callbacks.afterNodeAdded(c), r.push(c);
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
function P() {
}
function Lt(t, e, n) {
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
        beforeNodeAdded: P,
        afterNodeAdded: P,
        beforeNodeMorphed: P,
        afterNodeMorphed: P,
        beforeNodeRemoved: P,
        afterNodeRemoved: P
      },
      n.callbacks
    ),
    head: Object.assign(
      {
        style: "merge",
        shouldPreserve: (r) => r.getAttribute("im-preserve") === "true",
        shouldReAppend: (r) => r.getAttribute("im-re-append") === "true",
        shouldRemove: P,
        afterHeadMorphed: P
      },
      n.head
    )
  };
}
function Ue(t, e, n) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : B(n, t, e) > 0 : !1;
}
function X(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function me(t, e, n) {
  for (; t !== e; ) {
    const r = t;
    if (t = t?.nextSibling, !r)
      throw new Error("tempNode is null");
    Je(r, n);
  }
  return $(n, e), e.nextSibling;
}
function Mt(t, e, n, r, s) {
  const o = B(s, n, e);
  let i = null;
  if (o > 0) {
    i = r;
    let a = 0;
    for (; i != null; ) {
      if (Ue(n, i, s))
        return i;
      if (a += B(s, i, t), a > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function Pt(t, e, n, r) {
  let s = n, o = e.nextSibling, i = 0;
  for (; s && o; ) {
    if (B(r, s, t) > 0)
      return null;
    if (X(e, s))
      return s;
    if (X(o, s) && (i++, o = o.nextSibling, i >= 2))
      return null;
    s = s.nextSibling;
  }
  return s;
}
const ge = new DOMParser();
function Ot(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const n = ge.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return K.add(n), n;
    {
      let r = n.firstChild;
      return r ? (K.add(r), r) : null;
    }
  } else {
    const r = ge.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!r)
      throw new Error("content is null");
    return K.add(r), r;
  }
}
function $t(t) {
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
    let i = It(r, e, n);
    i > o && (s = r, o = i), r = r.nextSibling;
  }
  return s;
}
function It(t, e, n) {
  return X(t, e) ? 0.5 + B(n, t, e) : 0;
}
function Je(t, e) {
  $(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function Ht(t, e) {
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
function B(t, e, n) {
  const r = t.idMap.get(e);
  if (!r)
    return 0;
  let s = 0;
  for (const o of r)
    Ht(t, o) && xt(t, o, n) && ++s;
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
function Dt(t, e) {
  const n = /* @__PURE__ */ new Map();
  return ve(t, n), ve(e, n), n;
}
const Ft = "get", Bt = "post", Vt = "put", jt = "patch", Ut = "delete", Jt = [Ft, Bt, Vt, jt, Ut].reduce((t, e) => (t[e] = async (n, r) => {
  const s = Document;
  if (!s.startViewTransition) {
    await we(e, r, n);
    return;
  }
  new Promise((o) => {
    s.startViewTransition(async () => {
      await we(e, r, n), o(void 0);
    });
  });
}, t), {}), qt = "Content-Type", Wt = "datastar-request", Gt = "application/json", Kt = "true", V = "datastar-", j = `${V}indicator`, le = `${j}-loading`, ye = `${V}settling`, G = `${V}swapping`, zt = "self", A = {
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
.${le} {
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
      throw new Error("No indicator found");
    return r.classList.add(j), () => {
      delete n.fetch.indicatorSelectors[t.el.id];
    };
  })
}, Yt = [Zt, Xt];
async function we(t, e, n) {
  const r = n.store();
  if (!e)
    throw new Error(`No signal for ${t} on ${e}`);
  const s = { ...r.value };
  delete s.fetch;
  const o = xe(s);
  let i = !1, a = n.el;
  const u = new URL(e, window.location.origin);
  t = t.toUpperCase();
  const f = {
    method: t,
    headers: {
      [qt]: Gt,
      [Wt]: Kt
    },
    onopen: async () => {
      const l = r.fetch?.indicatorSelectors?.[a.id] || null;
      if (l) {
        const c = document.querySelector(l.value);
        c && (a = c, a.classList.remove(j), a.classList.add(le), i = !0);
      }
    },
    onmessage: (l) => {
      if (!l.event)
        return;
      let c = "", g = "morph_element", w = "", b = 500, _ = !1, h = "", p, d = !1, E = !1;
      if (!l.event.startsWith(V))
        throw new Error(`Unknown event: ${l.event}`);
      switch (l.event.slice(V.length)) {
        case "redirect":
          _ = !0;
          break;
        case "fragment":
          E = !0;
          break;
        case "error":
          d = !0;
          break;
        default:
          throw `Unknown event: ${l}`;
      }
      if (l.data.split(`
`).forEach((S) => {
        const k = S.indexOf(" ");
        if (k === -1)
          throw new Error("Missing space in data");
        const L = S.slice(0, k), T = S.slice(k + 1);
        switch (L) {
          case "selector":
            w = T;
            break;
          case "merge":
            const I = T;
            if (!Object.values(A).includes(I))
              throw new Error(`Unknown merge option: ${I}`);
            g = I;
            break;
          case "settle":
            b = parseInt(T);
            break;
          case "fragment":
          case "html":
            c = T;
            break;
          case "redirect":
            h = T;
            break;
          case "error":
            p = new Error(T);
            break;
          default:
            throw new Error("Unknown data type");
        }
      }), d && p)
        throw p;
      if (_ && h)
        window.location.href = h;
      else if (E && c)
        Qt(n, w, g, c, b);
      else
        throw new Error(`Unknown event: ${l}`);
    },
    onclose: () => {
      i && (a.classList.remove(le), a.classList.add(j));
    }
  };
  if (r.fetch?.headers.value && f.headers)
    for (const l in r.fetch.headers.value) {
      const c = r.fetch.headers.value[l];
      f.headers[l] = c;
    }
  if (t === "GET") {
    const l = new URLSearchParams(u.search);
    l.append("datastar", o), u.search = l.toString();
  } else
    f.body = o;
  await wt(u, f);
}
const be = document.createElement("template");
function Qt(t, e, n, r, s) {
  const { el: o } = t;
  be.innerHTML = r;
  const i = be.content.firstChild;
  if (!(i instanceof Element))
    throw new Error("No fragment found");
  const a = e === zt;
  let u;
  if (a)
    u = [o];
  else {
    const f = e || `#${i.getAttribute("id")}`;
    if (u = document.querySelectorAll(f) || [], !u)
      throw new Error(`No targets found for ${f}`);
  }
  for (const f of u) {
    f.classList.add(G);
    const l = f.outerHTML;
    let c = f;
    switch (n) {
      case A.MorphElement:
        const w = Nt(c, i);
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
        i.getAttributeNames().forEach((_) => {
          const h = i.getAttribute(_);
          c.setAttribute(_, h);
        });
        break;
      default:
        throw new Error(`Unknown merge type: ${n}`);
    }
    c.classList.add(G), t.cleanupElementRemovals(f), t.applyPlugins(c), setTimeout(() => {
      f.classList.remove(G), c.classList.remove(G);
    }, 1e3);
    const g = c.outerHTML;
    l !== g && (c.classList.add(ye), setTimeout(() => {
      c.classList.remove(ye);
    }, s));
  }
}
const ne = "display", _e = "none", re = "important", en = {
  prefix: "show",
  allowedModifiers: /* @__PURE__ */ new Set([re]),
  onLoad: (t) => {
    const { el: e, modifiers: n, expressionFn: r } = t;
    return ue(() => {
      const o = !!r(t), a = n.has(re) ? re : void 0;
      o ? e.style.length === 1 && e.style.display === _e ? e.style.removeProperty(ne) : e.style.setProperty(ne, "", a) : e.style.setProperty(ne, _e, a);
    });
  }
}, tn = "intersects", Ee = "once", Se = "half", Te = "full", nn = {
  prefix: tn,
  allowedModifiers: /* @__PURE__ */ new Set([Ee, Se, Te]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, n = { threshold: 0 };
    e.has(Te) ? n.threshold = 1 : e.has(Se) && (n.threshold = 0.5);
    const r = new IntersectionObserver((s) => {
      s.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(Ee) && r.disconnect());
      });
    }, n);
    return r.observe(t.el), () => r.disconnect();
  }
}, Ae = "prepend", Ne = "append", ke = new Error("Target element must have a parent if using prepend or append"), rn = {
  prefix: "teleport",
  allowedModifiers: /* @__PURE__ */ new Set([Ae, Ne]),
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
    if (Me(o)?.firstElementChild)
      throw new Error("Empty template");
    if (n.has(Ae)) {
      if (!s.parentNode)
        throw ke;
      s.parentNode.insertBefore(o, s);
    } else if (n.has(Ne)) {
      if (!s.parentNode)
        throw ke;
      s.parentNode.insertBefore(o, s.nextSibling);
    } else
      s.appendChild(o);
  }
}, sn = {
  prefix: "scrollIntoView",
  onLoad: (t) => {
    const { el: e } = t;
    e.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  }
}, Le = "ds-view-transition-stylesheet", on = {
  prefix: "viewTransition",
  onGlobalInit(t) {
    const e = document.createElement("style");
    e.id = Le, document.head.appendChild(e);
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
    const s = document.getElementById(Le);
    if (!s)
      throw new Error("View transition stylesheet not found");
    const o = `ds-vt-${r}`, i = `
.${o} {
  view-transition: ${r};
}

`;
    s.innerHTML += i;
    const a = t.store();
    let u = a.viewTransitionRefCounts[r];
    return u || (u = t.reactivity.signal(0), a.viewTransitionRefCounts[r] = u), u.value++, e.classList.add(o), () => {
      u.value--, u.value === 0 && (delete a.viewTransitionRefCounts[r], s.innerHTML = s.innerHTML.replace(i, ""));
    };
  }
}, an = [
  en,
  nn,
  rn,
  sn,
  on
], ln = {
  setAll: async (t, e, n) => {
    const r = new RegExp(e);
    t.walkSignals((s, o) => r.test(s) && (o.value = n));
  },
  toggleAll: async (t, e) => {
    const n = new RegExp(e);
    t.walkSignals((r, s) => n.test(r) && (s.value = !s.value));
  }
};
function cn(t = {}, ...e) {
  const n = performance.now(), r = new ct(t, ...e);
  r.run();
  const s = performance.now();
  return console.log(`Datastar loaded and attached to all DOM elements in ${s - n}ms`), r;
}
function un(t = {}, ...e) {
  const n = Object.assign({}, ln, Jt, t), r = [...Yt, ...an, ...gt, ...e];
  return cn(n, ...r);
}
const qe = window;
qe.ds = un();
qe.dispatchEvent(new CustomEvent("datastar-ready"));
export {
  ct as Datastar,
  cn as runDatastarWith,
  un as runDatastarWithAllPlugins,
  Me as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
