function Ce(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function ne() {
  throw new Error("Cycle detected");
}
function Ze() {
  throw new Error("Computed cannot have side-effects");
}
const Xe = Symbol.for("preact-signals"), A = 1, H = 2, B = 4, x = 8, F = 16, P = 32;
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
      if (n._nextBatchedEffect = void 0, n._flags &= ~H, !(n._flags & x) && xe(n))
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
function Ye(t) {
  if (V > 0)
    return t();
  re();
  try {
    return t();
  } finally {
    se();
  }
}
let h, U, V = 0, le = 0, ee = 0;
function Ie(t) {
  if (h === void 0)
    return;
  let e = t._node;
  if (e === void 0 || e._target !== h)
    return e = {
      _version: 0,
      _source: t,
      _prevSource: h._sources,
      _nextSource: void 0,
      _target: h,
      _prevTarget: void 0,
      _nextTarget: void 0,
      _rollbackNode: e
    }, h._sources !== void 0 && (h._sources._nextSource = e), h._sources = e, t._node = e, h._flags & P && t._subscribe(e), e;
  if (e._version === -1)
    return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = h._sources, e._nextSource = void 0, h._sources._nextSource = e, h._sources = e), e;
}
function _(t) {
  this._value = t, this._version = 0, this._node = void 0, this._targets = void 0;
}
_.prototype.brand = Xe;
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
  return pe(function() {
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
    const t = Ie(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (h instanceof N && Ze(), t !== this._value) {
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
function He(t) {
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
function N(t) {
  _.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = ee - 1, this._flags = B;
}
N.prototype = new _();
N.prototype._refresh = function() {
  if (this._flags &= ~H, this._flags & A)
    return !1;
  if ((this._flags & (B | P)) === P || (this._flags &= ~B, this._globalVersion === ee))
    return !0;
  if (this._globalVersion = ee, this._flags |= A, this._version > 0 && !xe(this))
    return this._flags &= ~A, !0;
  const t = h;
  try {
    De(this), h = this;
    const e = this._compute();
    (this._flags & F || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~F, this._version++);
  } catch (e) {
    this._value = e, this._flags |= F, this._version++;
  }
  return h = t, Fe(this), this._flags &= ~A, !0;
};
N.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= B | P;
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
  if (!(this._flags & H)) {
    this._flags |= B | H;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
N.prototype.peek = function() {
  if (this._refresh() || ne(), this._flags & F)
    throw this._value;
  return this._value;
};
Object.defineProperty(N.prototype, "value", {
  get() {
    this._flags & A && ne();
    const t = Ie(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & F)
      throw this._value;
    return this._value;
  }
});
function Qe(t) {
  return new N(t);
}
function Ue(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    re();
    const n = h;
    h = void 0;
    try {
      e();
    } catch (r) {
      throw t._flags &= ~A, t._flags |= x, de(t), r;
    } finally {
      h = n, se();
    }
  }
}
function de(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Ue(t);
}
function et(t) {
  if (h !== this)
    throw new Error("Out-of-order effect");
  Fe(this), h = t, this._flags &= ~A, this._flags & x && de(this), se();
}
function G(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = P;
}
G.prototype._callback = function() {
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
G.prototype._start = function() {
  this._flags & A && ne(), this._flags |= A, this._flags &= ~x, Ue(this), De(this), re();
  const t = h;
  return h = this, et.bind(this, t);
};
G.prototype._notify = function() {
  this._flags & H || (this._flags |= H, this._nextBatchedEffect = U, U = this);
};
G.prototype._dispose = function() {
  this._flags |= x, this._flags & A || de(this);
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
class Ve {
  get value() {
    return ue(this);
  }
  set value(e) {
    Ye(() => tt(this, e));
  }
  peek() {
    return ue(this, { peek: !0 });
  }
}
const ce = (t) => Object.assign(
  new Ve(),
  Object.entries(t).reduce(
    (e, [n, r]) => {
      if (["value", "peek"].some((s) => s === n))
        throw new Error(`${n} is a reserved property name`);
      return typeof r != "object" || r === null || Array.isArray(r) ? e[n] = He(r) : e[n] = ce(r), e;
    },
    {}
  )
), tt = (t, e) => Object.keys(e).forEach((n) => t[n].value = e[n]), ue = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (n, [r, s]) => (s instanceof _ ? n[r] = e ? s.peek() : s.value : s instanceof Ve && (n[r] = ue(s, { peek: e })), n),
  {}
), nt = /([\[:])?(\d{17,}|(?:[9](?:[1-9]07199254740991|0[1-9]7199254740991|00[8-9]199254740991|007[2-9]99254740991|007199[3-9]54740991|0071992[6-9]4740991|00719925[5-9]740991|007199254[8-9]40991|0071992547[5-9]0991|00719925474[1-9]991|00719925474099[2-9])))([,\}\]])/g;
function Be(t, e = 2) {
  return JSON.stringify(
    t,
    (r, s) => typeof s == "bigint" ? s.toString() + "n" : s,
    e
  ).replace(/"(-?\d+)n"/g, (r, s) => s);
}
function rt(t) {
  const e = t.replace(nt, '$1"$2n"$3');
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
function je(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return e;
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let n = t;
  return typeof t != "object" && (n = { ...e }), Object.keys(e).forEach((r) => {
    n.hasOwnProperty(r) || (n[r] = e[r]), e[r] === null ? delete n[r] : n[r] = je(n[r], e[r]);
  }), n;
}
const st = "[a-zA-Z_$][0-9a-zA-Z_$.]*";
function he(t, e, n) {
  return new RegExp(`(?<whole>\\${t}(?<${e}>${st})${n})`, "g");
}
const ot = {
  regexp: he("$", "signal", ""),
  replacer: (t) => {
    const { signal: e } = t;
    return `ctx.store.${e}.value`;
  }
}, it = {
  regexp: he("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => {
    const n = ["ctx"];
    e && n.push(...e.split(",").map((s) => s.trim()));
    const r = n.join(",");
    return `ctx.actions.${t}(${r})`;
  }
}, at = {
  regexp: he("~", "ref", ""),
  replacer({ ref: t }) {
    return `data.refs.${t}`;
  }
}, lt = [it, ot, at], ct = {
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
}, ut = {
  prefix: "ref",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  bypassExpressionFunctionCreation: () => !0,
  onLoad: (t) => {
    const { el: e, expression: n } = t;
    return t.refs[n] = e, () => delete t.refs[n];
  }
}, ft = [ct, ut];
class dt {
  plugins = [];
  store = ce({});
  actions = {};
  refs = {};
  reactivity = {
    signal: He,
    computed: Qe,
    effect: pe
  };
  parentID = "";
  missingIDNext = 0;
  removals = /* @__PURE__ */ new Map();
  constructor(e = {}, ...n) {
    if (this.actions = Object.assign(this.actions, e), n = [...ft, ...n], !n.length)
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
    return Be(e);
  }
  JSONParse(e) {
    return rt(e);
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
            const f = o.tagName.toLowerCase();
            if (![...r.allowedTagRegexps].some((m) => f.match(m)))
              throw new Error(
                `'${o.tagName}' not allowed for '${i}', allowed ${[
                  [...r.allowedTagRegexps].map((m) => `'${m}'`)
                ].join(", ")}`
              );
          }
          let u = i.slice(r.prefix.length), [d, ...c] = u.split(".");
          if (r.mustHaveEmptyKey && d.length > 0)
            throw new Error(`'${i}' must have empty key`);
          if (r.mustNotEmptyKey && d.length === 0)
            throw new Error(`'${i}' must have non-empty key`);
          d.length && (d = d[0].toLowerCase() + d.slice(1));
          const l = c.map((f) => {
            const [y, ...m] = f.split("_");
            return { label: y, args: m };
          });
          if (r.allowedModifiers) {
            for (const f of l)
              if (!r.allowedModifiers.has(f.label))
                throw new Error(`'${f.label}' is not allowed`);
          }
          const g = /* @__PURE__ */ new Map();
          for (const f of l)
            g.set(f.label, f.args);
          if (r.mustHaveEmptyExpression && a.length)
            throw new Error(`'${i}' must have empty expression`);
          if (r.mustNotEmptyExpression && !a.length)
            throw new Error(`'${i}' must have non-empty expression`);
          const w = [...r.preprocessors?.pre || [], ...lt, ...r.preprocessors?.post || []];
          for (const f of w) {
            if (n.has(f))
              continue;
            n.add(f);
            const y = [...a.matchAll(f.regexp)];
            if (y.length)
              for (const m of y) {
                if (!m.groups)
                  continue;
                const { groups: S } = m, { whole: O } = S;
                a = a.replace(O, f.replacer(S));
              }
          }
          const { store: E, reactivity: L, actions: v, refs: $ } = this, p = {
            store: E,
            mergeStore: this.mergeStore.bind(this),
            applyPlugins: this.applyPlugins.bind(this),
            cleanupElementRemovals: this.cleanupElementRemovals.bind(this),
            walkSignals: this.walkSignals.bind(this),
            actions: v,
            refs: $,
            reactivity: L,
            el: o,
            key: d,
            expression: a,
            expressionFn: () => {
              throw new Error("Expression function not created");
            },
            JSONParse: this.JSONParse,
            JSONStringify: this.JSONStringify,
            modifiers: g
          };
          if (!r.bypassExpressionFunctionCreation?.(p) && !r.mustHaveEmptyExpression && a.length) {
            const f = a.split(";");
            f[f.length - 1] = `return ${f[f.length - 1]}`;
            const y = `
try {
  ${f.join(";")}
} catch (e) {
  throw new Error(\`Eval '${a}' on ${o.id ? `#${o.id}` : o.tagName}\`)
}
            `;
            try {
              const m = new Function("ctx", y);
              p.expressionFn = m;
            } catch (m) {
              console.error(m);
              return;
            }
          }
          const b = r.onLoad(p);
          b && (this.removals.has(o) || this.removals.set(o, /* @__PURE__ */ new Set()), this.removals.get(o).add(b));
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
    const s = Ce(e);
    if (s)
      for (n(s), r = 0, e = e.firstElementChild; e; )
        this.walkDownDOM(e, n, r++), e = e.nextElementSibling;
  }
}
const pt = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, n) => (n ? "-" : "") + e.toLowerCase()), ht = {
  prefix: "bind",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(() => {
    const e = pt(t.key), r = `${t.expressionFn(t)}`;
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
          return `ctx.store.${e}`;
        }
      }
    ]
  },
  allowedTagRegexps: /* @__PURE__ */ new Set(["input", "textarea", "select", "checkbox", "radio"]),
  // bypassExpressionFunctionCreation: () => true,
  onLoad: (t) => {
    const { store: e, el: n, expression: r } = t, s = t.expressionFn(t), o = n.tagName.toLowerCase(), i = o.includes("input"), a = o.includes("select"), u = o.includes("textarea"), d = o.includes("radio"), c = n.getAttribute("type"), l = o.includes("checkbox") || i && c === "checkbox", g = i && c === "file";
    if (!i && !a && !u && !l && !d)
      throw new Error("Element must be input, select, textarea, checkbox or radio");
    const w = () => {
      if (!s)
        throw new Error(`Signal ${r} not found`);
      const p = s.value;
      l ? n.checked = p : i ? g || (n.value = `${p}`) : "value" in n ? n.value = `${p}` : n.setAttribute("value", `${p}`);
    }, E = t.reactivity.effect(w), L = () => {
      if (g) {
        const [f] = n?.files || [];
        if (!f) {
          s.value = "";
          return;
        }
        const y = new FileReader();
        y.onload = () => {
          if (typeof y.result != "string")
            throw new Error("Unsupported type");
          const S = y.result.match(mt);
          if (!S?.groups)
            throw new Error("Invalid data URI");
          const { mime: O, contents: D } = S.groups;
          s.value = D;
          const C = `${r}Mime`;
          if (C in e) {
            const K = e[`${C}`];
            K.value = O;
          }
        }, y.readAsDataURL(f);
        const m = `${r}Name`;
        if (m in e) {
          const S = e[`${m}`];
          S.value = f.name;
        }
        return;
      }
      const p = s.value, b = n;
      if (typeof p == "number")
        s.value = Number(b.value);
      else if (typeof p == "string")
        s.value = b.value;
      else if (typeof p == "boolean")
        l ? s.value = b.checked : s.value = !!b.value;
      else if (!(typeof p > "u"))
        if (typeof p == "bigint")
          s.value = BigInt(b.value);
        else
          throw console.log(typeof p), new Error("Unsupported type");
    }, v = n.tagName.split("-");
    if (v.length > 1) {
      const p = v[0].toLowerCase();
      W.forEach((b) => {
        W.push(`${p}-${b}`);
      });
    }
    return W.forEach((p) => n.addEventListener(p, L)), () => {
      E(), W.forEach((p) => n.removeEventListener(p, L));
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
}, _t = {
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
      const d = ye(o), c = z(o, "leading", !1), l = z(o, "noTrail", !0);
      s = bt(s, d, c, l);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const d = ye(i), c = z(i, "noLead", !0), l = z(i, "noTrail", !0);
      s = Et(s, d, c, l);
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
}, yt = {
  prefix: "focus",
  mustHaveEmptyKey: !0,
  mustHaveEmptyExpression: !0,
  onLoad: (t) => (t.el.tabIndex || t.el.setAttribute("tabindex", "0"), t.el.focus(), t.el.scrollIntoView({ block: "center", inline: "center" }), () => t.el.blur())
}, wt = [
  ht,
  gt,
  vt,
  yt,
  // PromptPlugin,
  _t
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
function bt(t, e, n = !1, r = !0) {
  let s;
  const o = () => s && clearTimeout(s);
  return function(...a) {
    o(), n && !s && t(...a), s = setTimeout(() => {
      r && t(...a), o();
    }, e);
  };
}
function Et(t, e, n = !0, r = !1) {
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
      s = we(s, i, n), Q(i, o, n), R(n, o);
      continue;
    }
    let a = Nt(t, o, s, n);
    if (a) {
      s = we(s, a, n), Q(a, o, n), R(n, o);
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
  const r = [], s = [], o = [], i = [], a = n.head.style, u = /* @__PURE__ */ new Map();
  for (const c of t.children)
    u.set(c.outerHTML, c);
  for (const c of e.children) {
    let l = u.has(c.outerHTML), g = n.head.shouldReAppend(c), w = n.head.shouldPreserve(c);
    l || w ? g ? s.push(c) : (u.delete(c.outerHTML), o.push(c)) : a === "append" ? g && (s.push(c), i.push(c)) : n.head.shouldRemove(c) !== !1 && s.push(c);
  }
  i.push(...u.values()), console.log("to append: ", i);
  const d = [];
  for (const c of i) {
    console.log("adding: ", c);
    const l = document.createRange().createContextualFragment(c.outerHTML).firstChild;
    if (!l)
      throw new Error("could not create new element from: " + c.outerHTML);
    if (console.log(l), n.callbacks.beforeNodeAdded(l)) {
      if (l.hasAttribute("href") || l.hasAttribute("src")) {
        let g;
        const w = new Promise((E) => {
          g = E;
        });
        l.addEventListener("load", function() {
          g(void 0);
        }), d.push(w);
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
  }), d;
}
function M() {
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
function Ke(t, e, n) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : j(n, t, e) > 0 : !1;
}
function te(t, e) {
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
const be = new DOMParser();
function kt(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const n = be.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return Y.add(n), n;
    {
      let r = n.firstChild;
      return r ? (Y.add(r), r) : null;
    }
  } else {
    const r = be.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
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
    await Te(e, n);
    return;
  }
  return new Promise((s) => {
    r.startViewTransition(async () => {
      await Te(e, n), s();
    });
  });
}, t), {}), jt = "Accept", Jt = "Content-Type", qt = "datastar-request", Gt = "application/json", Kt = "text/event-stream", Wt = "true", J = "datastar-", q = `${J}indicator`, fe = `${q}-loading`, Se = `${J}settling`, X = `${J}swapping`, zt = "self", T = {
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
    const e = t.store.fetch.headers, n = t.key[0].toUpperCase() + t.key.slice(1);
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
    const e = t.reactivity.computed(() => `${t.expressionFn(t)}`);
    return t.store.fetch.elementURLs[t.el.id] = e, () => {
      delete t.store.fetch.elementURLs[t.el.id];
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
    const e = t.reactivity.computed(() => `${t.expressionFn(t)}`);
    t.store.fetch.indicatorSelectors[t.el.id] = e;
    const n = document.querySelector(e.value);
    if (!n)
      throw new Error(`No indicator found for ${e.value}`);
    return n.classList.add(q), () => {
      delete t.store.fetch.indicatorSelectors[t.el.id];
    };
  })
}, Qt = [Zt, Xt, Yt], en = /(?<key>\w*): (?<value>.*)/gm;
async function Te(t, e) {
  const { el: n, store: r } = e, s = r.fetch.elementURLs[n.id];
  if (!s)
    return;
  const o = { ...r };
  delete o.fetch;
  const i = Be(o);
  let a = n, u = !1;
  const d = r.fetch.indicatorSelectors[n.id];
  if (d) {
    const v = document.querySelector(d);
    v && (a = v, a.classList.remove(q), a.classList.add(fe), u = !0);
  }
  const c = new URL(s.value, window.location.origin), l = new Headers();
  l.append(jt, Kt), l.append(Jt, Gt), l.append(qt, Wt);
  const g = r.fetch.headers.value;
  if (g)
    for (const v in g) {
      const $ = g[v];
      l.append(v, $);
    }
  t = t.toUpperCase();
  const w = { method: t, headers: l };
  if (t === "GET") {
    const v = new URLSearchParams(c.search);
    v.append("datastar", i), c.search = v.toString();
  } else
    w.body = i;
  const E = await fetch(c, w);
  if (!E.ok)
    throw new Error(`Response was not ok, url: ${c}, status: ${E.status}`);
  if (!E.body)
    throw new Error("No response body");
  const L = E.body.pipeThrough(new TextDecoderStream()).getReader();
  for (; ; ) {
    const { done: v, value: $ } = await L.read();
    if (v)
      break;
    $.split(`

`).forEach((p) => {
      const b = [...p.matchAll(en)];
      if (b.length) {
        let f = "", y = "morph_element", m = "", S = 0, O = !1, D = "", C, K = !1, me = !1;
        for (const ge of b) {
          if (!ge.groups)
            continue;
          const { key: ze, value: k } = ge.groups;
          switch (ze) {
            case "event":
              if (!k.startsWith(J))
                throw new Error(`Unknown event: ${k}`);
              switch (k.slice(J.length)) {
                case "redirect":
                  O = !0;
                  break;
                case "fragment":
                  me = !0;
                  break;
                case "error":
                  K = !0;
                  break;
                default:
                  throw new Error(`Unknown event: ${k}`);
              }
              break;
            case "data":
              const oe = k.indexOf(" ");
              if (oe === -1)
                throw new Error("Missing space in data");
              const ve = k.slice(0, oe), I = k.slice(oe + 1);
              switch (ve) {
                case "selector":
                  m = I;
                  break;
                case "merge":
                  const _e = I;
                  if (!Object.values(T).includes(_e))
                    throw new Error(`Unknown merge option: ${k}`);
                  y = _e;
                  break;
                case "settle":
                  S = parseInt(I);
                  break;
                case "fragment":
                case "html":
                  f = I;
                  break;
                case "redirect":
                  D = I;
                  break;
                case "error":
                  C = new Error(I);
                  break;
                default:
                  throw new Error(`Unknown data type: ${ve}`);
              }
          }
        }
        if (K && C)
          throw C;
        if (O && D)
          window.location.href = D;
        else if (me && f)
          tn(e, m, y, f, S);
        else
          throw new Error(`Unknown event block: ${p}`);
      }
    });
  }
  u && (a.classList.remove(fe), a.classList.add(q));
}
const Ae = document.createElement("template");
function tn(t, e, n, r, s) {
  const { el: o } = t;
  Ae.innerHTML = r;
  const i = Ae.content.firstChild;
  if (!(i instanceof Element))
    throw new Error(`Fragment is not an element, source '${r}'`);
  const a = e === zt;
  let u;
  if (a)
    u = [o];
  else {
    const d = e || `#${i.getAttribute("id")}`;
    if (u = document.querySelectorAll(d) || [], !u)
      throw new Error(`No target elements, selector: ${e}`);
  }
  for (const d of u) {
    d.classList.add(X);
    const c = d.outerHTML;
    let l = d;
    switch (n) {
      case T.MorphElement:
        const w = St(l, i);
        if (!w?.length)
          throw new Error("Failed to morph element");
        l = w[0];
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
          const v = i.getAttribute(L);
          l.setAttribute(L, v);
        });
        break;
      default:
        throw new Error(`Unknown merge type: ${n}`);
    }
    l.classList.add(X), t.cleanupElementRemovals(d), t.applyPlugins(l), d.classList.remove(X), l.classList.remove(X);
    const g = l.outerHTML;
    c !== g && (l.classList.add(Se), setTimeout(() => {
      l.classList.remove(Se);
    }, s));
  }
}
const nn = {
  setAll: async (t, e, n) => {
    const r = new RegExp(e);
    t.walkSignals((s, o) => r.test(s) && (o.value = n));
  },
  toggleAll: async (t, e) => {
    const n = new RegExp(e);
    t.walkSignals((r, s) => n.test(r) && (s.value = !s.value));
  }
}, ie = "display", Le = "none", ae = "important", rn = {
  prefix: "show",
  allowedModifiers: /* @__PURE__ */ new Set([ae]),
  onLoad: (t) => {
    const { el: e, modifiers: n, expressionFn: r } = t;
    return pe(() => {
      const o = !!r(t), a = n.has(ae) ? ae : void 0;
      o ? e.style.length === 1 && e.style.display === Le ? e.style.removeProperty(ie) : e.style.setProperty(ie, "", a) : e.style.setProperty(ie, Le, a);
    });
  }
}, sn = "intersects", Ne = "once", ke = "half", Me = "full", on = {
  prefix: sn,
  allowedModifiers: /* @__PURE__ */ new Set([Ne, ke, Me]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, n = { threshold: 0 };
    e.has(Me) ? n.threshold = 1 : e.has(ke) && (n.threshold = 0.5);
    const r = new IntersectionObserver((s) => {
      s.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(Ne) && r.disconnect());
      });
    }, n);
    return r.observe(t.el), () => r.disconnect();
  }
}, Pe = "prepend", Re = "append", $e = new Error("Target element must have a parent if using prepend or append"), an = {
  prefix: "teleport",
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
    if (Ce(o)?.firstElementChild)
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
}, ln = {
  prefix: "scrollIntoView",
  onLoad: (t) => {
    const { el: e } = t;
    e.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  }
}, Oe = "ds-view-transition-stylesheet", cn = {
  prefix: "viewTransition",
  onGlobalInit(t) {
    const e = document.createElement("style");
    e.id = Oe, document.head.appendChild(e);
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
    const { el: e, expressionFn: n, store: r } = t;
    let s = n(t);
    if (!s) {
      if (!e.id)
        throw new Error("Element must have an id if no name is provided");
      s = e.id;
    }
    const o = document.getElementById(Oe);
    if (!o)
      throw new Error("View transition stylesheet not found");
    const i = `ds-vt-${s}`, a = `
.${i} {
  view-transition: ${s};
}

`;
    o.innerHTML += a;
    let u = r.viewTransitionRefCounts[s];
    return u || (u = t.reactivity.signal(0), r.viewTransitionRefCounts[s] = u), u.value++, e.classList.add(i), () => {
      u.value--, u.value === 0 && (delete r.viewTransitionRefCounts[s], o.innerHTML = o.innerHTML.replace(a, ""));
    };
  }
}, un = [
  rn,
  on,
  an,
  ln,
  cn
];
function fn(t = {}, ...e) {
  const n = performance.now(), r = new dt(t, ...e);
  r.run();
  const s = performance.now();
  return console.log(`Datastar loaded and attached to all DOM elements in ${s - n}ms`), r;
}
function hn(t = {}, ...e) {
  const n = Object.assign({}, nn, Bt, t), r = [...Qt, ...un, ...wt, ...e];
  return fn(n, ...r);
}
export {
  dt as Datastar,
  fn as runDatastarWith,
  hn as runDatastarWithAllPlugins,
  Ce as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
