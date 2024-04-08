function Me(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function Q() {
  throw f;
}
function Ke() {
  throw f;
}
const Je = Symbol.for("preact-signals"), k = 1, I = 2, F = 4, H = 8, D = 16, C = 32;
function ee() {
  x++;
}
function te() {
  if (x > 1) {
    x--;
    return;
  }
  let t, e = !1;
  for (; $ !== void 0; ) {
    let n = $;
    for ($ = void 0, oe++; n !== void 0; ) {
      const s = n._nextBatchedEffect;
      if (n._nextBatchedEffect = void 0, n._flags &= ~I, !(n._flags & H) && Re(n))
        try {
          n._callback();
        } catch (r) {
          e || (t = r, e = !0);
        }
      n = s;
    }
  }
  if (oe = 0, x--, e)
    throw t;
}
function ze(t) {
  if (x > 0)
    return t();
  ee();
  try {
    return t();
  } finally {
    te();
  }
}
let g, $, x = 0, oe = 0, X = 0;
function Ne(t) {
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
    }, g._sources !== void 0 && (g._sources._nextSource = e), g._sources = e, t._node = e, g._flags & C && t._subscribe(e), e;
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
  return He(function() {
    const n = e.value, s = this._flags & C;
    this._flags &= ~C;
    try {
      t(n);
    } finally {
      this._flags |= s;
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
    if (g instanceof P && Ke(), t !== this._value) {
      oe > 100 && Q(), this._value = t, this._version++, X++, ee();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        te();
      }
    }
  }
});
function Pe(t) {
  return new _(t);
}
function Re(t) {
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
function Oe(t) {
  let e = t._sources, n;
  for (; e !== void 0; ) {
    const s = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), s !== void 0 && (s._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = s)) : n = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = s;
  }
  t._sources = n;
}
function P(t) {
  _.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = X - 1, this._flags = F;
}
P.prototype = new _();
P.prototype._refresh = function() {
  if (this._flags &= ~I, this._flags & k)
    return !1;
  if ((this._flags & (F | C)) === C || (this._flags &= ~F, this._globalVersion === X))
    return !0;
  if (this._globalVersion = X, this._flags |= k, this._version > 0 && !Re(this))
    return this._flags &= ~k, !0;
  const t = g;
  try {
    Ce(this), g = this;
    const e = this._compute();
    (this._flags & D || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~D, this._version++);
  } catch (e) {
    this._value = e, this._flags |= D, this._version++;
  }
  return g = t, Oe(this), this._flags &= ~k, !0;
};
P.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= F | C;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  _.prototype._subscribe.call(this, t);
};
P.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (_.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~C;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
P.prototype._notify = function() {
  if (!(this._flags & I)) {
    this._flags |= F | I;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
P.prototype.peek = function() {
  if (this._refresh() || Q(), this._flags & D)
    throw this._value;
  return this._value;
};
Object.defineProperty(P.prototype, "value", {
  get() {
    this._flags & k && Q();
    const t = Ne(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & D)
      throw this._value;
    return this._value;
  }
});
function Ze(t) {
  return new P(t);
}
function Ie(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    ee();
    const n = g;
    g = void 0;
    try {
      e();
    } catch (s) {
      throw t._flags &= ~k, t._flags |= H, ce(t), s;
    } finally {
      g = n, te();
    }
  }
}
function ce(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Ie(t);
}
function Xe(t) {
  if (g !== this)
    throw new Error("Out-of-order effect");
  Oe(this), g = t, this._flags &= ~k, this._flags & H && ce(this), te();
}
function U(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = C;
}
U.prototype._callback = function() {
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
U.prototype._start = function() {
  this._flags & k && Q(), this._flags |= k, this._flags &= ~H, Ie(this), Ce(this), ee();
  const t = g;
  return g = this, Xe.bind(this, t);
};
U.prototype._notify = function() {
  this._flags & I || (this._flags |= I, this._nextBatchedEffect = $, $ = this);
};
U.prototype._dispose = function() {
  this._flags |= H, this._flags & k || ce(this);
};
function He(t) {
  const e = new U(t);
  try {
    e._callback();
  } catch (n) {
    throw e._dispose(), n;
  }
  return e._dispose.bind(e);
}
class De {
  get value() {
    return ae(this);
  }
  set value(e) {
    ze(() => Ye(this, e));
  }
  peek() {
    return ae(this, { peek: !0 });
  }
}
const ie = (t) => Object.assign(
  new De(),
  Object.entries(t).reduce(
    (e, [n, s]) => {
      if (["value", "peek"].some((r) => r === n))
        throw f;
      return typeof s != "object" || s === null || Array.isArray(s) ? e[n] = Pe(s) : e[n] = ie(s), e;
    },
    {}
  )
), Ye = (t, e) => Object.keys(e).forEach((n) => t[n].value = e[n]), ae = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (n, [s, r]) => (r instanceof _ ? n[s] = e ? r.peek() : r.value : r instanceof De && (n[s] = ae(r, { peek: e })), n),
  {}
);
function $e(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return e;
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let n = t;
  return typeof t != "object" && (n = { ...e }), Object.keys(e).forEach((s) => {
    n.hasOwnProperty(s) || (n[s] = e[s]), e[s] === null ? delete n[s] : n[s] = $e(n[s], e[s]);
  }), n;
}
const Qe = "[a-zA-Z_$][0-9a-zA-Z_$.]*";
function ue(t, e, n) {
  return new RegExp(`(?<whole>\\${t}(?<${e}>${Qe})${n})`, "g");
}
const et = {
  regexp: ue("$", "signal", ""),
  replacer: (t) => {
    const { signal: e } = t;
    return `ctx.store().${e}.value`;
  }
}, tt = {
  regexp: ue("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => {
    const n = ["ctx"];
    e && n.push(...e.split(",").map((r) => r.trim()));
    const s = n.join(",");
    return `ctx.actions.${t}(${s})`;
  }
}, nt = {
  regexp: ue("~", "ref", ""),
  replacer({ ref: t }) {
    return `data.refs.${t}`;
  }
}, st = [tt, et, nt], rt = {
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
    t.mergeStore(e), t.el.removeAttribute("data-store");
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
}, it = [rt, ot], f = new Error("Datastar error");
class at {
  plugins = [];
  store = ie({});
  actions = {};
  refs = {};
  reactivity = {
    signal: Pe,
    computed: Ze,
    effect: He
  };
  parentID = "";
  missingIDNext = 0;
  removals = /* @__PURE__ */ new Map();
  constructor(e = {}, ...n) {
    if (this.actions = Object.assign(this.actions, e), n = [...it, ...n], !n.length)
      throw f;
    const s = /* @__PURE__ */ new Set();
    for (const r of n) {
      if (r.requiredPluginPrefixes) {
        for (const o of r.requiredPluginPrefixes)
          if (!s.has(o))
            throw f;
      }
      this.plugins.push(r), s.add(r.prefix);
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
      for (const s of n)
        s();
      this.removals.delete(e);
    }
  }
  mergeStore(e) {
    const n = $e(this.store.value, e);
    this.store = ie(n);
  }
  signalByName(e) {
    return this.store[e];
  }
  applyPlugins(e) {
    const n = /* @__PURE__ */ new Set();
    this.plugins.forEach((s, r) => {
      this.walkDownDOM(e, (o) => {
        r || this.cleanupElementRemovals(o);
        for (const i in o.dataset) {
          let a = o.dataset[i] || "";
          if (!i.startsWith(s.prefix))
            continue;
          if (o.id.length === 0 && (o.id = `ds-${this.parentID}-${this.missingIDNext++}`), n.clear(), s.allowedTagRegexps) {
            const p = o.tagName.toLowerCase();
            if (![...s.allowedTagRegexps].some((h) => p.match(h)))
              throw new Error(
                `'${o.tagName}' not allowed for '${i}', allowed ${[
                  [...s.allowedTagRegexps].map((h) => `'${h}'`)
                ].join(", ")}`
              );
          }
          let u = i.slice(s.prefix.length), [d, ...l] = u.split(".");
          if (s.mustHaveEmptyKey && d.length > 0 || s.mustNotEmptyKey && d.length === 0)
            throw f;
          d.length && (d = d[0].toLowerCase() + d.slice(1));
          const c = l.map((p) => {
            const [m, ...h] = p.split("_");
            return { label: m, args: h };
          });
          if (s.allowedModifiers) {
            for (const p of c)
              if (!s.allowedModifiers.has(p.label))
                throw f;
          }
          const v = /* @__PURE__ */ new Map();
          for (const p of c)
            v.set(p.label, p.args);
          if (s.mustHaveEmptyExpression && a.length || s.mustNotEmptyExpression && !a.length)
            throw f;
          const b = [...s.preprocessors?.pre || [], ...st, ...s.preprocessors?.post || []];
          for (const p of b) {
            if (n.has(p))
              continue;
            n.add(p);
            const m = a.split(";"), h = [];
            m.forEach((S) => {
              let y = S;
              const T = [...y.matchAll(p.regexp)];
              if (T.length)
                for (const M of T) {
                  if (!M.groups)
                    continue;
                  const { groups: N } = M, { whole: A } = N;
                  y = y.replace(A, p.replacer(N));
                }
              h.push(y);
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
            key: d,
            expression: a,
            expressionFn: () => {
              throw f;
            },
            modifiers: v
          };
          if (!s.bypassExpressionFunctionCreation?.(w) && !s.mustHaveEmptyExpression && a.length) {
            const p = a.split(";").map((h) => h.trim());
            p[p.length - 1] = `return ${p[p.length - 1]}`;
            const m = `
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
            } catch {
              throw f;
            }
          }
          const E = s.onLoad(w);
          E && (this.removals.has(o) || this.removals.set(o, /* @__PURE__ */ new Set()), this.removals.get(o).add(E));
        }
      });
    });
  }
  walkSignalsStore(e, n) {
    const s = Object.keys(e);
    for (let r = 0; r < s.length; r++) {
      const o = s[r], i = e[o], a = i instanceof _, u = typeof i == "object" && Object.keys(i).length > 0;
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
  walkDownDOM(e, n, s = 0) {
    if (!e)
      return;
    const r = Me(e);
    if (r)
      for (n(r), s = 0, e = e.firstElementChild; e; )
        this.walkDownDOM(e, n, s++), e = e.nextElementSibling;
  }
}
const lt = "0.11.2", xe = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, n) => (n ? "-" : "") + e.toLowerCase()), ct = {
  prefix: "bind",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(() => {
    const e = xe(t.key), s = `${t.expressionFn(t)}`;
    !s || s === "false" || s === "null" || s === "undefined" ? t.el.removeAttribute(e) : t.el.setAttribute(e, s);
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
    const { el: e, expression: n } = t, s = t.expressionFn(t), r = e.tagName.toLowerCase(), o = r.includes("input"), i = r.includes("select"), a = r.includes("textarea"), u = r.includes("radio"), d = e.getAttribute("type"), l = r.includes("checkbox") || o && d === "checkbox", c = o && d === "file";
    if (!o && !i && !a && !l && !u)
      throw f;
    const v = () => {
      if (!s)
        throw f;
      const m = "value" in e, h = s.value;
      l ? e.checked = h : c || (m ? e.value = `${h}` : e.setAttribute("value", `${h}`));
    }, b = t.reactivity.effect(v), w = () => {
      if (c) {
        const [S] = e?.files || [];
        if (!S) {
          s.value = "";
          return;
        }
        const y = new FileReader(), T = t.store();
        y.onload = () => {
          if (typeof y.result != "string")
            throw f;
          const N = y.result.match(ut);
          if (!N?.groups)
            throw f;
          const { mime: A, contents: q } = N.groups;
          s.value = q;
          const ne = `${n}Mime`;
          if (ne in T) {
            const Ge = T[`${ne}`];
            Ge.value = A;
          }
        }, y.readAsDataURL(S);
        const M = `${n}Name`;
        if (M in T) {
          const N = T[`${M}`];
          N.value = S.name;
        }
        return;
      }
      const m = s.value, h = e;
      if (typeof m == "number")
        s.value = Number(h.value);
      else if (typeof m == "string")
        s.value = h.value;
      else if (typeof m == "boolean")
        l ? s.value = h.checked : s.value = !!h.value;
      else if (!(typeof m > "u"))
        if (typeof m == "bigint")
          s.value = BigInt(h.value);
        else
          throw console.log(typeof m), f;
    }, E = e.tagName.split("-");
    if (E.length > 1) {
      const m = E[0].toLowerCase();
      W.forEach((h) => {
        W.push(`${m}-${h}`);
      });
    }
    return W.forEach((m) => e.addEventListener(m, w)), () => {
      b(), W.forEach((m) => e.removeEventListener(m, w));
    };
  }
}, dt = {
  prefix: "text",
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { el: e, expressionFn: n } = t;
    if (!(e instanceof HTMLElement))
      throw f;
    return t.reactivity.effect(() => {
      const s = n(t);
      e.textContent = `${s}`;
    });
  }
}, ht = {
  prefix: "on",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  allowedModifiers: /* @__PURE__ */ new Set(["once", "passive", "capture", "debounce", "throttle"]),
  onLoad: (t) => {
    const { el: e, key: n, expressionFn: s } = t;
    let r = () => {
      s(t);
    };
    const o = t.modifiers.get("debounce");
    if (o) {
      const d = fe(o), l = G(o, "leading", !1), c = G(o, "noTrail", !0);
      r = gt(r, d, l, c);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const d = fe(i), l = G(i, "noLead", !0), c = G(i, "noTrail", !0);
      r = vt(r, d, l, c);
    }
    const a = {
      capture: !0,
      passive: !1,
      once: !1
    };
    t.modifiers.has("capture") || (a.capture = !1), t.modifiers.has("passive") && (a.passive = !0), t.modifiers.has("once") && (a.once = !0);
    const u = xe(n).toLowerCase();
    return u === "load" ? (r(), () => {
    }) : (e.addEventListener(u, r, a), () => e.removeEventListener(u, r));
  }
}, pt = {
  prefix: "focus",
  mustHaveEmptyKey: !0,
  mustHaveEmptyExpression: !0,
  onLoad: (t) => (t.el.tabIndex || t.el.setAttribute("tabindex", "0"), t.el.focus(), t.el.scrollIntoView({ block: "center", inline: "center" }), () => t.el.blur())
}, mt = [
  ct,
  ft,
  dt,
  pt,
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
function G(t, e, n = !1) {
  return t ? t.includes(e) || n : !1;
}
function gt(t, e, n = !1, s = !0) {
  let r;
  const o = () => r && clearTimeout(r);
  return function(...a) {
    o(), n && !r && t(...a), r = setTimeout(() => {
      s && t(...a), o();
    }, e);
  };
}
function vt(t, e, n = !0, s = !1) {
  let r = !1, o = null;
  return function(...a) {
    r ? o = a : (r = !0, n ? t(...a) : o = a, setTimeout(() => {
      s && o && (t(...o), o = null), r = !1;
    }, e));
  };
}
function yt(t, {
  signal: e,
  headers: n,
  onopen: s,
  onmessage: r,
  onclose: o,
  onerror: i,
  openWhenHidden: a,
  ...u
}) {
  return new Promise((d, l) => {
    const c = { ...n };
    c.accept || (c.accept = Fe);
    let v;
    function b() {
      v.abort(), document.hidden || h();
    }
    a || document.addEventListener("visibilitychange", b);
    let w = _t, E = 0;
    function p() {
      document.removeEventListener("visibilitychange", b), window.clearTimeout(E), v.abort();
    }
    e?.addEventListener("abort", () => {
      p(), d();
    });
    const m = s ?? bt;
    async function h() {
      v = new AbortController();
      try {
        const S = await fetch(t, {
          ...u,
          headers: c,
          signal: v.signal
        });
        await m(S), await wt(
          S.body,
          Et(
            St(
              (y) => {
                y ? c[de] = y : delete c[de];
              },
              (y) => {
                w = y;
              },
              r
            )
          )
        ), o?.(), p(), d();
      } catch (S) {
        if (!v.signal.aborted)
          try {
            const y = i?.(S) ?? w;
            window.clearTimeout(E), E = window.setTimeout(h, y);
          } catch (y) {
            p(), l(y);
          }
      }
    }
    h();
  });
}
const Fe = "text/event-stream", _t = 1e3, de = "last-event-id";
function bt(t) {
  if (!t.headers.get("content-type")?.startsWith(Fe))
    throw f;
}
async function wt(t, e) {
  const n = t.getReader();
  for (; ; ) {
    const s = await n.read();
    if (s.done)
      break;
    e(s.value);
  }
}
function Et(t) {
  let e, n, s, r = !1;
  return function(i) {
    e === void 0 ? (e = i, n = 0, s = -1) : e = Tt(e, i);
    const a = e.length;
    let u = 0;
    for (; n < a; ) {
      r && (e[n] === 10 && (u = ++n), r = !1);
      let d = -1;
      for (; n < a && d === -1; ++n)
        switch (e[n]) {
          case 58:
            s === -1 && (s = n - u);
            break;
          case 13:
            r = !0;
          case 10:
            d = n;
            break;
        }
      if (d === -1)
        break;
      t(e.subarray(u, d), s), u = n, s = -1;
    }
    u === a ? e = void 0 : u !== 0 && (e = e.subarray(u), n -= u);
  };
}
function St(t, e, n) {
  let s = he();
  const r = new TextDecoder();
  return function(i, a) {
    if (i.length === 0)
      n?.(s), s = he();
    else if (a > 0) {
      const u = r.decode(i.subarray(0, a)), d = a + (i[a + 1] === 32 ? 2 : 1), l = r.decode(i.subarray(d));
      switch (u) {
        case "data":
          s.data = s.data ? s.data + `
` + l : l;
          break;
        case "event":
          s.event = l;
          break;
        case "id":
          t(s.id = l);
          break;
        case "retry":
          const c = parseInt(l, 10);
          isNaN(c) || e(s.retry = c);
          break;
      }
    }
  };
}
function Tt(t, e) {
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
const z = /* @__PURE__ */ new WeakSet();
function At(t, e, n = {}) {
  t instanceof Document && (t = t.documentElement);
  let s;
  typeof e == "string" ? s = Pt(e) : s = e;
  const r = Rt(s), o = kt(t, r, n);
  return Ve(t, r, o);
}
function Ve(t, e, n) {
  if (n.head.block) {
    const s = t.querySelector("head"), r = e.querySelector("head");
    if (s && r) {
      const o = Be(r, s, n);
      Promise.all(o).then(() => {
        Ve(
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
    return je(e, t, n), t.children;
  if (n.morphStyle === "outerHTML" || n.morphStyle == null) {
    const s = Ot(e, t, n);
    if (!s)
      throw f;
    const r = s?.previousSibling, o = s?.nextSibling, i = Z(t, s, n);
    return s ? Ct(r, i, o) : [];
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
        return n.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && n.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && n.head.style !== "morph" ? Be(e, t, n) : (Lt(e, t), je(e, t, n))), n.callbacks.afterNodeMorphed(t, e), t);
      if (n.callbacks.beforeNodeRemoved(t) === !1 || n.callbacks.beforeNodeAdded(e) === !1)
        return;
      if (!t.parentElement)
        throw f;
      return t.parentElement.replaceChild(e, t), n.callbacks.afterNodeAdded(e), n.callbacks.afterNodeRemoved(t), e;
    }
}
function je(t, e, n) {
  let s = t.firstChild, r = e.firstChild, o;
  for (; s; ) {
    if (o = s, s = o.nextSibling, r == null) {
      if (n.callbacks.beforeNodeAdded(o) === !1)
        return;
      e.appendChild(o), n.callbacks.afterNodeAdded(o), O(n, o);
      continue;
    }
    if (Ue(o, r, n)) {
      Z(r, o, n), r = r.nextSibling, O(n, o);
      continue;
    }
    let i = Mt(t, e, o, r, n);
    if (i) {
      r = pe(r, i, n), Z(i, o, n), O(n, o);
      continue;
    }
    let a = Nt(t, o, r, n);
    if (a) {
      r = pe(r, a, n), Z(a, o, n), O(n, o);
      continue;
    }
    if (n.callbacks.beforeNodeAdded(o) === !1)
      return;
    e.insertBefore(o, r), n.callbacks.afterNodeAdded(o), O(n, o);
  }
  for (; r !== null; ) {
    let i = r;
    r = r.nextSibling, qe(i, n);
  }
}
function Lt(t, e) {
  let n = t.nodeType;
  if (n === 1) {
    for (const s of t.attributes)
      e.getAttribute(s.name) !== s.value && e.setAttribute(s.name, s.value);
    for (const s of e.attributes)
      t.hasAttribute(s.name) || e.removeAttribute(s.name);
  }
  if ((n === Node.COMMENT_NODE || n === Node.TEXT_NODE) && e.nodeValue !== t.nodeValue && (e.nodeValue = t.nodeValue), t instanceof HTMLInputElement && e instanceof HTMLInputElement && t.type !== "file")
    e.value = t.value || "", K(t, e, "value"), K(t, e, "checked"), K(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    K(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const s = t.value, r = e.value;
    s !== r && (e.value = s), e.firstChild && e.firstChild.nodeValue !== s && (e.firstChild.nodeValue = s);
  }
}
function K(t, e, n) {
  const s = t.getAttribute(n), r = e.getAttribute(n);
  s !== r && (s ? e.setAttribute(n, s) : e.removeAttribute(n));
}
function Be(t, e, n) {
  const s = [], r = [], o = [], i = [], a = n.head.style, u = /* @__PURE__ */ new Map();
  for (const l of t.children)
    u.set(l.outerHTML, l);
  for (const l of e.children) {
    let c = u.has(l.outerHTML), v = n.head.shouldReAppend(l), b = n.head.shouldPreserve(l);
    c || b ? v ? r.push(l) : (u.delete(l.outerHTML), o.push(l)) : a === "append" ? v && (r.push(l), i.push(l)) : n.head.shouldRemove(l) !== !1 && r.push(l);
  }
  i.push(...u.values());
  const d = [];
  for (const l of i) {
    const c = document.createRange().createContextualFragment(l.outerHTML).firstChild;
    if (!c)
      throw f;
    if (n.callbacks.beforeNodeAdded(c)) {
      if (c.hasAttribute("href") || c.hasAttribute("src")) {
        let v;
        const b = new Promise((w) => {
          v = w;
        });
        c.addEventListener("load", function() {
          v(void 0);
        }), d.push(b);
      }
      e.appendChild(c), n.callbacks.afterNodeAdded(c), s.push(c);
    }
  }
  for (const l of r)
    n.callbacks.beforeNodeRemoved(l) !== !1 && (e.removeChild(l), n.callbacks.afterNodeRemoved(l));
  return n.head.afterHeadMorphed(e, {
    added: s,
    kept: o,
    removed: r
  }), d;
}
function R() {
}
function kt(t, e, n) {
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
        beforeNodeAdded: R,
        afterNodeAdded: R,
        beforeNodeMorphed: R,
        afterNodeMorphed: R,
        beforeNodeRemoved: R,
        afterNodeRemoved: R
      },
      n.callbacks
    ),
    head: Object.assign(
      {
        style: "merge",
        shouldPreserve: (s) => s.getAttribute("im-preserve") === "true",
        shouldReAppend: (s) => s.getAttribute("im-re-append") === "true",
        shouldRemove: R,
        afterHeadMorphed: R
      },
      n.head
    )
  };
}
function Ue(t, e, n) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : V(n, t, e) > 0 : !1;
}
function Y(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function pe(t, e, n) {
  for (; t !== e; ) {
    const s = t;
    if (t = t?.nextSibling, !s)
      throw f;
    qe(s, n);
  }
  return O(n, e), e.nextSibling;
}
function Mt(t, e, n, s, r) {
  const o = V(r, n, e);
  let i = null;
  if (o > 0) {
    i = s;
    let a = 0;
    for (; i != null; ) {
      if (Ue(n, i, r))
        return i;
      if (a += V(r, i, t), a > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function Nt(t, e, n, s) {
  let r = n, o = e.nextSibling, i = 0;
  for (; r && o; ) {
    if (V(s, r, t) > 0)
      return null;
    if (Y(e, r))
      return r;
    if (Y(o, r) && (i++, o = o.nextSibling, i >= 2))
      return null;
    r = r.nextSibling;
  }
  return r;
}
const me = new DOMParser();
function Pt(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const n = me.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return z.add(n), n;
    {
      let s = n.firstChild;
      return s ? (z.add(s), s) : null;
    }
  } else {
    const s = me.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!s)
      throw f;
    return z.add(s), s;
  }
}
function Rt(t) {
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
function Ct(t, e, n) {
  const s = [], r = [];
  for (; t; )
    s.push(t), t = t.previousSibling;
  for (; s.length > 0; ) {
    const o = s.pop();
    r.push(o), e?.parentElement?.insertBefore(o, e);
  }
  for (r.push(e); n; )
    s.push(n), r.push(n), n = n.nextSibling;
  for (; s.length; )
    e?.parentElement?.insertBefore(s.pop(), e.nextSibling);
  return r;
}
function Ot(t, e, n) {
  let s = t.firstChild, r = s, o = 0;
  for (; s; ) {
    let i = It(s, e, n);
    i > o && (r = s, o = i), s = s.nextSibling;
  }
  return r;
}
function It(t, e, n) {
  return Y(t, e) ? 0.5 + V(n, t, e) : 0;
}
function qe(t, e) {
  O(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function Ht(t, e) {
  return !t.deadIds.has(e);
}
function Dt(t, e, n) {
  return t.idMap.get(n)?.has(e) || !1;
}
function O(t, e) {
  const n = t.idMap.get(e);
  if (n)
    for (const s of n)
      t.deadIds.add(s);
}
function V(t, e, n) {
  const s = t.idMap.get(e);
  if (!s)
    return 0;
  let r = 0;
  for (const o of s)
    Ht(t, o) && Dt(t, o, n) && ++r;
  return r;
}
function ge(t, e) {
  const n = t.parentElement, s = t.querySelectorAll("[id]");
  for (const r of s) {
    let o = r;
    for (; o !== n && o; ) {
      let i = e.get(o);
      i == null && (i = /* @__PURE__ */ new Set(), e.set(o, i)), i.add(r.id), o = o.parentElement;
    }
  }
}
function $t(t, e) {
  const n = /* @__PURE__ */ new Map();
  return ge(t, n), ge(e, n), n;
}
const xt = "get", Ft = "post", Vt = "put", jt = "patch", Bt = "delete", Ut = [xt, Ft, Vt, jt, Bt].reduce((t, e) => (t[e] = async (n, s) => {
  const r = Document;
  if (!r.startViewTransition) {
    await ye(e, s, n);
    return;
  }
  new Promise((o) => {
    r.startViewTransition(async () => {
      await ye(e, s, n), o(void 0);
    });
  });
}, t), {}), qt = "Content-Type", Wt = "datastar-request", Gt = "application/json", Kt = "true", j = "datastar-", B = `${j}indicator`, le = `${B}-loading`, ve = `${j}settling`, J = `${j}swapping`, Jt = "self", L = {
  MorphElement: "morph_element",
  InnerElement: "inner_element",
  OuterElement: "outer_element",
  PrependElement: "prepend_element",
  AppendElement: "append_element",
  BeforeElement: "before_element",
  AfterElement: "after_element",
  DeleteElement: "delete_element",
  UpsertAttributes: "upsert_attributes"
}, zt = {
  prefix: "header",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => {
    const e = t.store();
    e.fetch || (e.fetch = {}), e.fetch.headers || (e.fetch.headers = {});
    const n = e.fetch.headers, s = t.key[0].toUpperCase() + t.key.slice(1);
    return n[s] = t.reactivity.computed(() => t.expressionFn(t)), () => {
      delete n[s];
    };
  }
}, Zt = {
  prefix: "fetchIndicator",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onGlobalInit: () => {
    const t = document.createElement("style");
    t.innerHTML = `
.${B}{
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
    n.fetch || (n.fetch = {}), n.fetch.indicatorSelectors || (n.fetch.indicatorSelectors = {}), n.fetch.indicatorSelectors[t.el.id] = e;
    const s = document.querySelector(e.value);
    if (!s)
      throw f;
    return s.classList.add(B), () => {
      delete n.fetch.indicatorSelectors[t.el.id];
    };
  })
}, Xt = [zt, Zt];
async function ye(t, e, n) {
  const s = n.store();
  if (!e)
    throw f;
  const r = { ...s.value };
  delete r.fetch;
  const o = JSON.stringify(r);
  let i = !1, a = n.el;
  const u = new URL(e, window.location.origin);
  t = t.toUpperCase();
  const d = {
    method: t,
    headers: {
      [qt]: Gt,
      [Wt]: Kt
    },
    onopen: async () => {
      const l = s.fetch?.indicatorSelectors?.[a.id] || null;
      if (l) {
        const c = document.querySelector(l.value);
        c && (a = c, a.classList.remove(B), a.classList.add(le), i = !0);
      }
    },
    onmessage: (l) => {
      if (!l.event)
        return;
      let c = "", v = "morph_element", b = "", w = 500, E = !1, p = "", m, h = !1, S = !1;
      if (!l.event.startsWith(j))
        throw f;
      switch (l.event.slice(j.length)) {
        case "redirect":
          E = !0;
          break;
        case "fragment":
          S = !0;
          break;
        case "error":
          h = !0;
          break;
        default:
          throw `Unknown event: ${l}`;
      }
      if (l.data.split(`
`).forEach((T) => {
        const M = T.indexOf(" ");
        if (M === -1)
          throw f;
        const N = T.slice(0, M), A = T.slice(M + 1);
        switch (N) {
          case "selector":
            b = A;
            break;
          case "merge":
            const q = A;
            if (!Object.values(L).includes(q))
              throw f;
            v = q;
            break;
          case "settle":
            w = parseInt(A);
            break;
          case "fragment":
          case "html":
            c = A;
            break;
          case "redirect":
            p = A;
            break;
          case "error":
            m = new Error(A);
            break;
          default:
            throw f;
        }
      }), h && m)
        throw m;
      if (E && p)
        window.location.href = p;
      else if (S && c)
        Yt(n, b, v, c, w);
      else
        throw f;
    },
    onclose: () => {
      i && setTimeout(() => {
        a.classList.remove(le), a.classList.add(B);
      }, 300);
    }
  };
  if (s.fetch?.headers?.value && d.headers)
    for (const l in s.fetch.headers.value) {
      const c = s.fetch.headers.value[l];
      d.headers[l] = c;
    }
  if (t === "GET") {
    const l = new URLSearchParams(u.search);
    l.append("datastar", o), u.search = l.toString();
  } else
    d.body = o;
  await yt(u, d);
}
const _e = document.createElement("template");
function Yt(t, e, n, s, r) {
  const { el: o } = t;
  _e.innerHTML = s;
  const i = _e.content.firstChild;
  if (!(i instanceof Element))
    throw f;
  const a = e === Jt;
  let u;
  if (a)
    u = [o];
  else {
    const d = e || `#${i.getAttribute("id")}`;
    if (u = document.querySelectorAll(d) || [], !u)
      throw f;
  }
  for (const d of u) {
    d.classList.add(J);
    const l = d.outerHTML;
    let c = d;
    switch (n) {
      case L.MorphElement:
        const b = At(c, i);
        if (!b?.length)
          throw f;
        c = b[0];
        break;
      case L.InnerElement:
        c.innerHTML = i.innerHTML;
        break;
      case L.OuterElement:
        c.replaceWith(i);
        break;
      case L.PrependElement:
        c.prepend(i);
        break;
      case L.AppendElement:
        c.append(i);
        break;
      case L.BeforeElement:
        c.before(i);
        break;
      case L.AfterElement:
        c.after(i);
        break;
      case L.DeleteElement:
        setTimeout(() => c.remove(), r);
        break;
      case L.UpsertAttributes:
        i.getAttributeNames().forEach((E) => {
          const p = i.getAttribute(E);
          c.setAttribute(E, p);
        });
        break;
      default:
        throw f;
    }
    c.classList.add(J), t.cleanupElementRemovals(d), t.applyPlugins(document.body), setTimeout(() => {
      d.classList.remove(J), c.classList.remove(J);
    }, 1e3);
    const v = c.outerHTML;
    l !== v && (c.classList.add(ve), setTimeout(() => {
      c.classList.remove(ve);
    }, r));
  }
}
const se = "display", be = "none", re = "important", Qt = {
  prefix: "show",
  allowedModifiers: /* @__PURE__ */ new Set([re]),
  onLoad: (t) => {
    const { el: e, modifiers: n, expressionFn: s, reactivity: r } = t;
    return r.effect(() => {
      const i = !!s(t), u = n.has(re) ? re : void 0;
      i ? e.style.length === 1 && e.style.display === be ? e.style.removeProperty(se) : e.style.setProperty(se, "", u) : e.style.setProperty(se, be, u);
    });
  }
}, en = "intersects", we = "once", Ee = "half", Se = "full", tn = {
  prefix: en,
  allowedModifiers: /* @__PURE__ */ new Set([we, Ee, Se]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, n = { threshold: 0 };
    e.has(Se) ? n.threshold = 1 : e.has(Ee) && (n.threshold = 0.5);
    const s = new IntersectionObserver((r) => {
      r.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(we) && s.disconnect());
      });
    }, n);
    return s.observe(t.el), () => s.disconnect();
  }
}, Te = "prepend", Ae = "append", Le = new Error("Target element must have a parent if using prepend or append"), nn = {
  prefix: "teleport",
  allowedModifiers: /* @__PURE__ */ new Set([Te, Ae]),
  allowedTagRegexps: /* @__PURE__ */ new Set(["template"]),
  bypassExpressionFunctionCreation: () => !0,
  onLoad: (t) => {
    const { el: e, modifiers: n, expression: s } = t;
    if (!(e instanceof HTMLTemplateElement))
      throw f;
    const r = document.querySelector(s);
    if (!r || !e.content)
      throw f;
    const o = e.content.cloneNode(!0);
    if (Me(o)?.firstElementChild)
      throw f;
    if (n.has(Te)) {
      if (!r.parentNode)
        throw Le;
      r.parentNode.insertBefore(o, r);
    } else if (n.has(Ae)) {
      if (!r.parentNode)
        throw Le;
      r.parentNode.insertBefore(o, r.nextSibling);
    } else
      r.appendChild(o);
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
}, ke = "ds-view-transition-stylesheet", rn = {
  prefix: "viewTransition",
  onGlobalInit(t) {
    const e = document.createElement("style");
    e.id = ke, document.head.appendChild(e);
    let n = !1;
    if (document.head.childNodes.forEach((s) => {
      s instanceof HTMLMetaElement && s.name === "view-transition" && (n = !0);
    }), !n) {
      const s = document.createElement("meta");
      s.name = "view-transition", s.content = "same-origin", document.head.appendChild(s);
    }
    t.mergeStore({
      viewTransitionRefCounts: {}
    });
  },
  onLoad: (t) => {
    const { el: e, expressionFn: n } = t;
    let s = n(t);
    if (!s) {
      if (!e.id)
        throw f;
      s = e.id;
    }
    const r = document.getElementById(ke);
    if (!r)
      throw f;
    const o = `ds-vt-${s}`, i = `
.${o} {
  view-transition: ${s};
}

`;
    r.innerHTML += i;
    const a = t.store();
    let u = a.viewTransitionRefCounts[s];
    return u || (u = t.reactivity.signal(0), a.viewTransitionRefCounts[s] = u), u.value++, e.classList.add(o), () => {
      u.value--, u.value === 0 && (delete a.viewTransitionRefCounts[s], r.innerHTML = r.innerHTML.replace(i, ""));
    };
  }
}, on = [
  Qt,
  tn,
  nn,
  sn,
  rn
], an = {
  setAll: async (t, e, n) => {
    const s = new RegExp(e);
    t.walkSignals((r, o) => s.test(r) && (o.value = n));
  },
  toggleAll: async (t, e) => {
    const n = new RegExp(e);
    t.walkSignals((s, r) => n.test(s) && (r.value = !r.value));
  }
};
function ln(t = {}, ...e) {
  const n = performance.now(), s = new at(t, ...e);
  s.run();
  const r = performance.now();
  return console.log(`Datastar v${lt} loaded and attached to all DOM elements in ${r - n}ms`), s;
}
function cn(t = {}, ...e) {
  const n = Object.assign({}, an, Ut, t), s = [...Xt, ...on, ...mt, ...e];
  return ln(n, ...s);
}
const We = window;
We.ds = cn();
We.dispatchEvent(new CustomEvent("datastar-ready"));
export {
  f as DATASTAR_ERROR,
  at as Datastar,
  ln as runDatastarWith,
  cn as runDatastarWithAllPlugins,
  Me as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
