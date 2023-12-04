function Re(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function Y() {
  throw new Error("Cycle detected");
}
function Ke() {
  throw new Error("Computed cannot have side-effects");
}
const We = Symbol.for("preact-signals"), T = 1, C = 2, F = 4, O = 8, I = 16, k = 32;
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
    let r = x;
    for (x = void 0, oe++; r !== void 0; ) {
      const n = r._nextBatchedEffect;
      if (r._nextBatchedEffect = void 0, r._flags &= ~C, !(r._flags & O) && Oe(r))
        try {
          r._callback();
        } catch (s) {
          e || (t = s, e = !0);
        }
      r = n;
    }
  }
  if (oe = 0, D--, e)
    throw t;
}
function Je(t) {
  if (D > 0)
    return t();
  Q();
  try {
    return t();
  } finally {
    ee();
  }
}
let p, x, D = 0, oe = 0, Z = 0;
function $e(t) {
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
_.prototype.brand = We;
_.prototype._refresh = function() {
  return !0;
};
_.prototype._subscribe = function(t) {
  this._targets !== t && t._prevTarget === void 0 && (t._nextTarget = this._targets, this._targets !== void 0 && (this._targets._prevTarget = t), this._targets = t);
};
_.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0) {
    const e = t._prevTarget, r = t._nextTarget;
    e !== void 0 && (e._nextTarget = r, t._prevTarget = void 0), r !== void 0 && (r._prevTarget = e, t._nextTarget = void 0), t === this._targets && (this._targets = r);
  }
};
_.prototype.subscribe = function(t) {
  const e = this;
  return ue(function() {
    const r = e.value, n = this._flags & k;
    this._flags &= ~k;
    try {
      t(r);
    } finally {
      this._flags |= n;
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
    const t = $e(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (p instanceof A && Ke(), t !== this._value) {
      oe > 100 && Y(), this._value = t, this._version++, Z++, Q();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        ee();
      }
    }
  }
});
function Ce(t) {
  return new _(t);
}
function Oe(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    if (e._source._version !== e._version || !e._source._refresh() || e._source._version !== e._version)
      return !0;
  return !1;
}
function He(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource) {
    const r = e._source._node;
    if (r !== void 0 && (e._rollbackNode = r), e._source._node = e, e._version = -1, e._nextSource === void 0) {
      t._sources = e;
      break;
    }
  }
}
function Ie(t) {
  let e = t._sources, r;
  for (; e !== void 0; ) {
    const n = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), n !== void 0 && (n._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = n)) : r = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = n;
  }
  t._sources = r;
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
  if (this._globalVersion = Z, this._flags |= T, this._version > 0 && !Oe(this))
    return this._flags &= ~T, !0;
  const t = p;
  try {
    He(this), p = this;
    const e = this._compute();
    (this._flags & I || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~I, this._version++);
  } catch (e) {
    this._value = e, this._flags |= I, this._version++;
  }
  return p = t, Ie(this), this._flags &= ~T, !0;
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
  if (this._refresh() || Y(), this._flags & I)
    throw this._value;
  return this._value;
};
Object.defineProperty(A.prototype, "value", {
  get() {
    this._flags & T && Y();
    const t = $e(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & I)
      throw this._value;
    return this._value;
  }
});
function ze(t) {
  return new A(t);
}
function xe(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    Q();
    const r = p;
    p = void 0;
    try {
      e();
    } catch (n) {
      throw t._flags &= ~T, t._flags |= O, ce(t), n;
    } finally {
      p = r, ee();
    }
  }
}
function ce(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, xe(t);
}
function Ze(t) {
  if (p !== this)
    throw new Error("Out-of-order effect");
  Ie(this), p = t, this._flags &= ~T, this._flags & O && ce(this), ee();
}
function B(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = k;
}
B.prototype._callback = function() {
  const t = this._start();
  try {
    if (this._flags & O || this._compute === void 0)
      return;
    const e = this._compute();
    typeof e == "function" && (this._cleanup = e);
  } finally {
    t();
  }
};
B.prototype._start = function() {
  this._flags & T && Y(), this._flags |= T, this._flags &= ~O, xe(this), He(this), Q();
  const t = p;
  return p = this, Ze.bind(this, t);
};
B.prototype._notify = function() {
  this._flags & C || (this._flags |= C, this._nextBatchedEffect = x, x = this);
};
B.prototype._dispose = function() {
  this._flags |= O, this._flags & T || ce(this);
};
function ue(t) {
  const e = new B(t);
  try {
    e._callback();
  } catch (r) {
    throw e._dispose(), r;
  }
  return e._dispose.bind(e);
}
class De {
  get value() {
    return ae(this);
  }
  set value(e) {
    Je(() => Xe(this, e));
  }
  peek() {
    return ae(this, { peek: !0 });
  }
}
const ie = (t) => Object.assign(
  new De(),
  Object.entries(t).reduce(
    (e, [r, n]) => {
      if (["value", "peek"].some((s) => s === r))
        throw new Error(`${r} is a reserved property name`);
      return typeof n != "object" || n === null || Array.isArray(n) ? e[r] = Ce(n) : e[r] = ie(n), e;
    },
    {}
  )
), Xe = (t, e) => Object.keys(e).forEach((r) => t[r].value = e[r]), ae = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (r, [n, s]) => (s instanceof _ ? r[n] = e ? s.peek() : s.value : s instanceof De && (r[n] = ae(s, { peek: e })), r),
  {}
);
function Fe(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return JSON.parse(JSON.stringify(e));
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let r = t;
  return typeof t != "object" && (r = { ...e }), Object.keys(e).forEach((n) => {
    r.hasOwnProperty(n) || (r[n] = e[n]), e[n] === null ? delete r[n] : r[n] = Fe(r[n], e[n]);
  }), r;
}
const Ye = "[a-zA-Z_$][0-9a-zA-Z_$]*";
function fe(t, e, r) {
  return new RegExp(`(?<whole>\\${t}(?<${e}>${Ye})${r})`, "g");
}
const Qe = {
  name: "SignalProcessor",
  description: "Replacing $signal with ctx.store.signal.value",
  regexp: fe("$", "signal", ""),
  replacer: (t) => {
    const { signal: e } = t;
    return `ctx.store.${e}.value`;
  }
}, et = {
  name: "ActionProcessor",
  description: "Replacing $$action(args) with ctx.actions.action(ctx, args)",
  regexp: fe("$\\$", "action", "(?<call>\\((?<args>.*)\\))?"),
  replacer: ({ action: t, args: e }) => {
    const r = ["ctx"];
    e && r.push(...e.split(",").map((s) => s.trim()));
    const n = r.join(",");
    return `ctx.actions.${t}(${n})`;
  }
}, tt = {
  name: "RefProcessor",
  description: "Replacing #foo with ctx.refs.foo",
  regexp: fe("~", "ref", ""),
  replacer({ ref: t }) {
    return `data.refs.${t}`;
  }
}, rt = [et, Qe, tt], nt = {
  prefix: "mergeStore",
  description: "Setup the global store",
  onLoad: (t) => {
    const e = t.expressionFn(t);
    t.mergeStore(e);
  }
}, st = {
  prefix: "ref",
  description: "Sets the value of the element",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  bypassExpressionFunctionCreation: () => !0,
  preprocessors: /* @__PURE__ */ new Set([]),
  onLoad: (t) => {
    const { el: e, expression: r } = t;
    return t.refs[r] = e, () => delete t.refs[r];
  }
}, ot = [nt, st];
class it {
  plugins = [];
  store = ie({});
  actions = {};
  refs = {};
  reactivity = {
    signal: Ce,
    computed: ze,
    effect: ue
  };
  parentID = "";
  missingIDNext = 0;
  removals = /* @__PURE__ */ new Map();
  constructor(e = {}, ...r) {
    if (this.actions = Object.assign(this.actions, e), r = [...ot, ...r], !r.length)
      throw new Error("No plugins provided");
    const n = /* @__PURE__ */ new Set();
    for (const s of r) {
      if (s.requiredPluginPrefixes) {
        for (const o of s.requiredPluginPrefixes)
          if (!n.has(o))
            throw new Error(`Plugin ${s.prefix} requires plugin ${o}`);
      }
      this.plugins.push(s), n.add(s.prefix);
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
    const r = this.removals.get(e);
    if (r) {
      for (const n of r)
        n();
      this.removals.delete(e);
    }
  }
  mergeStore(e) {
    const r = Fe(this.store.value, e);
    this.store = ie(r);
  }
  signalByName(e) {
    return this.store[e];
  }
  applyPlugins(e) {
    const r = /* @__PURE__ */ new Set();
    this.plugins.forEach((n, s) => {
      this.walkDownDOM(e, (o) => {
        s === 0 && this.cleanupElementRemovals(o);
        for (const i in o.dataset) {
          let l = o.dataset[i] || "";
          if (!i.startsWith(n.prefix))
            continue;
          if (o.id.length === 0 && (o.id = `ds-${this.parentID}-${this.missingIDNext++}`), r.clear(), n.allowedTagRegexps) {
            const f = o.tagName.toLowerCase();
            if (![...n.allowedTagRegexps].some((v) => f.match(v)))
              throw new Error(
                `Tag '${o.tagName}' is not allowed for plugin '${i}', allowed tags are: ${[
                  [...n.allowedTagRegexps].map((v) => `'${v}'`)
                ].join(", ")}`
              );
          }
          let d = i.slice(n.prefix.length), [u, ...c] = d.split(".");
          if (n.mustHaveEmptyKey && u.length > 0)
            throw new Error(`Attribute '${i}' must have empty key`);
          if (n.mustNotEmptyKey && u.length === 0)
            throw new Error(`Attribute '${i}' must have non-empty key`);
          u.length && (u = u[0].toLowerCase() + u.slice(1));
          const a = c.map((f) => {
            const [E, ...v] = f.split("_");
            return { label: E, args: v };
          });
          if (n.allowedModifiers) {
            for (const f of a)
              if (!n.allowedModifiers.has(f.label))
                throw new Error(`Modifier '${f.label}' is not allowed`);
          }
          const y = /* @__PURE__ */ new Map();
          for (const f of a)
            y.set(f.label, f.args);
          if (n.mustHaveEmptyExpression && l.length)
            throw new Error(`Attribute '${i}' must have empty expression`);
          if (n.mustNotEmptyExpression && !l.length)
            throw new Error(`Attribute '${i}' must have non-empty expression`);
          const b = [...rt, ...n.preprocessors || []];
          for (const f of b) {
            if (r.has(f))
              continue;
            r.add(f);
            const E = [...l.matchAll(f.regexp)];
            if (E.length)
              for (const v of E) {
                if (!v.groups)
                  continue;
                const { groups: H } = v, { whole: q } = H;
                l = l.replace(q, f.replacer(H));
              }
          }
          const { store: m, reactivity: g, actions: h, refs: L } = this, w = {
            store: m,
            mergeStore: this.mergeStore.bind(this),
            applyPlugins: this.applyPlugins.bind(this),
            cleanupElementRemovals: this.cleanupElementRemovals.bind(this),
            actions: h,
            refs: L,
            reactivity: g,
            el: o,
            key: u,
            expression: l,
            expressionFn: () => {
              throw new Error("Expression function not created");
            },
            modifiers: y
          };
          if (!n.bypassExpressionFunctionCreation?.(w) && !n.mustHaveEmptyExpression && l.length) {
            const f = l.split(";");
            f[f.length - 1] = `return ${f[f.length - 1]}`;
            const E = f.join(";");
            try {
              const v = new Function("ctx", E);
              w.expressionFn = v;
            } catch (v) {
              console.error(v), console.error(`Error evaluating expression '${E}' on ${o.id ? `#${o.id}` : o.tagName}`);
              return;
            }
          }
          const P = n.onLoad(w);
          P && (this.removals.has(o) || this.removals.set(o, /* @__PURE__ */ new Set()), this.removals.get(o).add(P));
        }
      });
    });
  }
  walkDownDOM(e, r, n = 0) {
    if (!e)
      return;
    const s = Re(e);
    if (s) {
      if (s?.id?.length) {
        const o = s.style;
        o?.viewTransitionName?.length || (o.viewTransitionName = s.id);
      }
      for (r(s), n = 0, e = e.firstElementChild; e; )
        this.walkDownDOM(e, r, n++), e = e.nextElementSibling;
    }
  }
}
const at = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, r) => (r ? "-" : "") + e.toLowerCase()), lt = {
  prefix: "bind",
  description: "Sets the value of the element",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(() => {
    const e = at(t.key), n = `${t.expressionFn(t)}`;
    !n || n === "false" || n === "null" || n === "undefined" ? t.el.removeAttribute(e) : t.el.setAttribute(e, n);
  })
}, ct = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/, ge = ["change", "input", "keydown"], ut = {
  prefix: "model",
  description: "Sets the value of the element",
  mustHaveEmptyKey: !0,
  allowedTagRegexps: /* @__PURE__ */ new Set(["input", "textarea", "select", "checkbox"]),
  bypassExpressionFunctionCreation: () => !0,
  onLoad: (t) => {
    const { store: e, el: r, expression: n } = t, s = e[n], o = r.tagName.toLowerCase().includes("input"), i = r.tagName.toLowerCase().includes("select"), l = r.tagName.toLowerCase().includes("textarea"), d = r.getAttribute("type"), u = o && d === "checkbox", c = o && d === "file";
    if (!o && !i && !l)
      throw new Error("Element must be input, select or textarea");
    const a = () => {
      const m = s.value;
      if (!s)
        throw new Error(`Signal ${n} not found`);
      if (u) {
        const g = r;
        g.checked = m;
      } else
        c || r.setAttribute("value", `${s.value}`);
    }, y = t.reactivity.effect(a), b = () => {
      const m = r.value;
      if (!(typeof m > "u"))
        if (c) {
          const [g] = r?.files || [];
          if (!g) {
            s.value = "";
            return;
          }
          const h = new FileReader();
          h.onload = () => {
            if (typeof h.result != "string")
              throw new Error("Unsupported type");
            const w = h.result.match(ct);
            if (!w?.groups)
              throw new Error("Invalid data URI");
            const { mime: P, contents: f } = w.groups;
            s.value = f;
            const E = `${n}Mime`;
            if (E in e) {
              const v = e[`${E}`];
              v.value = P;
            }
          }, h.readAsDataURL(g);
          const L = `${n}Name`;
          if (L in e) {
            const w = e[`${L}`];
            w.value = g.name;
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
              const { checked: h } = r;
              s.value = h;
            } else
              s.value = !!m;
          else if (!(typeof g > "u"))
            throw console.log(typeof g), new Error("Unsupported type");
        }
    };
    return ge.forEach((m) => {
      r.addEventListener(m, b);
    }), () => {
      y(), ge.forEach((m) => {
        r.removeEventListener(m, b);
      });
    };
  }
}, ft = {
  prefix: "text",
  description: "Sets the textContent of the element",
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { el: e, expressionFn: r } = t;
    if (!(e instanceof HTMLElement))
      throw new Error("Element is not HTMLElement");
    return t.reactivity.effect(() => {
      e.textContent = `${r(t)}`;
    });
  }
}, dt = {
  prefix: "on",
  description: "Sets the event listener of the element",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  allowedModifiers: /* @__PURE__ */ new Set(["once", "passive", "capture", "debounce", "throttle"]),
  onLoad: (t) => {
    const { el: e, key: r, expressionFn: n } = t;
    let s = () => {
      n(t);
    };
    const o = t.modifiers.get("debounce");
    if (o) {
      const u = ve(o), c = G(o, "leading", !1), a = G(o, "noTrail", !0);
      s = mt(s, u, c, a);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const u = ve(i), c = G(i, "noLead", !0), a = G(i, "noTrail", !0);
      s = gt(s, u, c, a);
    }
    const l = {
      capture: !0,
      passive: !1,
      once: !1
    };
    if (t.modifiers.has("capture") || (l.capture = !1), t.modifiers.has("passive") && (l.passive = !0), t.modifiers.has("once") && (l.once = !0), r === "load")
      return s(), () => {
      };
    const d = r.toLowerCase();
    return e.addEventListener(d, s, l), () => {
      e.removeEventListener(d, s);
    };
  }
}, pt = {
  prefix: "focus",
  description: "Sets the focus of the element",
  mustHaveEmptyKey: !0,
  mustHaveEmptyExpression: !0,
  onLoad: (t) => (t.el.tabIndex || t.el.setAttribute("tabindex", "0"), t.el.focus(), t.el.scrollIntoView({ block: "center", inline: "center" }), () => t.el.blur())
}, ht = [
  lt,
  ut,
  ft,
  pt,
  // PromptPlugin,
  dt
];
function ve(t) {
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
function G(t, e, r = !1) {
  return t ? t.includes(e) || r : !1;
}
function mt(t, e, r = !1, n = !0) {
  let s;
  const o = () => s && clearTimeout(s);
  return function(...l) {
    o(), r && !s && t(...l), s = setTimeout(() => {
      n && t(...l), o();
    }, e);
  };
}
function gt(t, e, r = !0, n = !1) {
  let s = !1, o = null;
  return function(...l) {
    s ? o = l : (s = !0, r ? t(...l) : o = l, setTimeout(() => {
      n && o && (t(...o), o = null), s = !1;
    }, e));
  };
}
const J = /* @__PURE__ */ new WeakSet();
function vt(t, e, r = {}) {
  t instanceof Document && (t = t.documentElement);
  let n;
  typeof e == "string" ? n = wt(e) : n = e;
  const s = St(n), o = yt(t, s, r);
  return Ue(t, s, o);
}
function Ue(t, e, r) {
  if (r.head.block) {
    const n = t.querySelector("head"), s = e.querySelector("head");
    if (n && s) {
      const o = je(s, n, r);
      Promise.all(o).then(() => {
        Ue(
          t,
          e,
          Object.assign(r, {
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
  if (r.morphStyle === "innerHTML")
    return Ve(e, t, r), t.children;
  if (r.morphStyle === "outerHTML" || r.morphStyle == null) {
    const n = At(e, t, r);
    if (!n)
      throw new Error("Could not find best match");
    const s = n?.previousSibling, o = n?.nextSibling, i = z(t, n, r);
    return n ? Tt(s, i, o) : [];
  } else
    throw "Do not understand how to morph style " + r.morphStyle;
}
function z(t, e, r) {
  if (!(r.ignoreActive && t === document.activeElement))
    if (e == null) {
      if (r.callbacks.beforeNodeRemoved(t) === !1)
        return;
      t.remove(), r.callbacks.afterNodeRemoved(t);
      return;
    } else {
      if (X(t, e))
        return r.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && r.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && r.head.style !== "morph" ? je(e, t, r) : (_t(e, t), Ve(e, t, r))), r.callbacks.afterNodeMorphed(t, e), t);
      if (r.callbacks.beforeNodeRemoved(t) === !1 || r.callbacks.beforeNodeAdded(e) === !1)
        return;
      if (!t.parentElement)
        throw new Error("oldNode has no parentElement");
      return t.parentElement.replaceChild(e, t), r.callbacks.afterNodeAdded(e), r.callbacks.afterNodeRemoved(t), e;
    }
}
function Ve(t, e, r) {
  let n = t.firstChild, s = e.firstChild, o;
  for (; n; ) {
    if (o = n, n = o.nextSibling, s == null) {
      if (r.callbacks.beforeNodeAdded(o) === !1)
        return;
      e.appendChild(o), r.callbacks.afterNodeAdded(o), R(r, o);
      continue;
    }
    if (Be(o, s, r)) {
      z(s, o, r), s = s.nextSibling, R(r, o);
      continue;
    }
    let i = bt(t, e, o, s, r);
    if (i) {
      s = _e(s, i, r), z(i, o, r), R(r, o);
      continue;
    }
    let l = Et(t, o, s, r);
    if (l) {
      s = _e(s, l, r), z(l, o, r), R(r, o);
      continue;
    }
    if (r.callbacks.beforeNodeAdded(o) === !1)
      return;
    e.insertBefore(o, s), r.callbacks.afterNodeAdded(o), R(r, o);
  }
  for (; s !== null; ) {
    let i = s;
    s = s.nextSibling, qe(i, r);
  }
}
function _t(t, e) {
  let r = t.nodeType;
  if (r === 1) {
    for (const n of t.attributes)
      e.getAttribute(n.name) !== n.value && e.setAttribute(n.name, n.value);
    for (const n of e.attributes)
      t.hasAttribute(n.name) || e.removeAttribute(n.name);
  }
  if ((r === Node.COMMENT_NODE || r === Node.TEXT_NODE) && e.nodeValue !== t.nodeValue && (e.nodeValue = t.nodeValue), t instanceof HTMLInputElement && e instanceof HTMLInputElement && t.type !== "file")
    e.value = t.value || "", K(t, e, "value"), K(t, e, "checked"), K(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    K(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const n = t.value, s = e.value;
    n !== s && (e.value = n), e.firstChild && e.firstChild.nodeValue !== n && (e.firstChild.nodeValue = n);
  }
}
function K(t, e, r) {
  const n = t.getAttribute(r), s = e.getAttribute(r);
  n !== s && (n ? e.setAttribute(r, n) : e.removeAttribute(r));
}
function je(t, e, r) {
  const n = [], s = [], o = [], i = [], l = r.head.style, d = /* @__PURE__ */ new Map();
  for (const c of t.children)
    d.set(c.outerHTML, c);
  for (const c of e.children) {
    let a = d.has(c.outerHTML), y = r.head.shouldReAppend(c), b = r.head.shouldPreserve(c);
    a || b ? y ? s.push(c) : (d.delete(c.outerHTML), o.push(c)) : l === "append" ? y && (s.push(c), i.push(c)) : r.head.shouldRemove(c) !== !1 && s.push(c);
  }
  i.push(...d.values()), console.log("to append: ", i);
  const u = [];
  for (const c of i) {
    console.log("adding: ", c);
    const a = document.createRange().createContextualFragment(c.outerHTML).firstChild;
    if (!a)
      throw new Error("could not create new element from: " + c.outerHTML);
    if (console.log(a), r.callbacks.beforeNodeAdded(a)) {
      if (a.hasAttribute("href") || a.hasAttribute("src")) {
        let y;
        const b = new Promise((m) => {
          y = m;
        });
        a.addEventListener("load", function() {
          y(void 0);
        }), u.push(b);
      }
      e.appendChild(a), r.callbacks.afterNodeAdded(a), n.push(a);
    }
  }
  for (const c of s)
    r.callbacks.beforeNodeRemoved(c) !== !1 && (e.removeChild(c), r.callbacks.afterNodeRemoved(c));
  return r.head.afterHeadMorphed(e, {
    added: n,
    kept: o,
    removed: s
  }), u;
}
function M() {
}
function yt(t, e, r) {
  return {
    target: t,
    newContent: e,
    config: r,
    morphStyle: r.morphStyle,
    ignoreActive: r.ignoreActive,
    idMap: kt(t, e),
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
      r.callbacks
    ),
    head: Object.assign(
      {
        style: "merge",
        shouldPreserve: (n) => n.getAttribute("im-preserve") === "true",
        shouldReAppend: (n) => n.getAttribute("im-re-append") === "true",
        shouldRemove: M,
        afterHeadMorphed: M
      },
      r.head
    )
  };
}
function Be(t, e, r) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : U(r, t, e) > 0 : !1;
}
function X(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function _e(t, e, r) {
  for (; t !== e; ) {
    const n = t;
    if (t = t?.nextSibling, !n)
      throw new Error("tempNode is null");
    qe(n, r);
  }
  return R(r, e), e.nextSibling;
}
function bt(t, e, r, n, s) {
  const o = U(s, r, e);
  let i = null;
  if (o > 0) {
    i = n;
    let l = 0;
    for (; i != null; ) {
      if (Be(r, i, s))
        return i;
      if (l += U(s, i, t), l > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function Et(t, e, r, n) {
  let s = r, o = e.nextSibling, i = 0;
  for (; s && o; ) {
    if (U(n, s, t) > 0)
      return null;
    if (X(e, s))
      return s;
    if (X(o, s) && (i++, o = o.nextSibling, i >= 2))
      return null;
    s = s.nextSibling;
  }
  return s;
}
const ye = new DOMParser();
function wt(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const r = ye.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return J.add(r), r;
    {
      let n = r.firstChild;
      return n ? (J.add(n), n) : null;
    }
  } else {
    const n = ye.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!n)
      throw new Error("content is null");
    return J.add(n), n;
  }
}
function St(t) {
  if (t == null)
    return document.createElement("div");
  if (J.has(t))
    return t;
  if (t instanceof Node) {
    const e = document.createElement("div");
    return e.append(t), e;
  } else {
    const e = document.createElement("div");
    for (const r of [...t])
      e.append(r);
    return e;
  }
}
function Tt(t, e, r) {
  const n = [], s = [];
  for (; t; )
    n.push(t), t = t.previousSibling;
  for (; n.length > 0; ) {
    const o = n.pop();
    s.push(o), e?.parentElement?.insertBefore(o, e);
  }
  for (s.push(e); r; )
    n.push(r), s.push(r), r = r.nextSibling;
  for (; n.length; )
    e?.parentElement?.insertBefore(n.pop(), e.nextSibling);
  return s;
}
function At(t, e, r) {
  let n = t.firstChild, s = n, o = 0;
  for (; n; ) {
    let i = Lt(n, e, r);
    i > o && (s = n, o = i), n = n.nextSibling;
  }
  return s;
}
function Lt(t, e, r) {
  return X(t, e) ? 0.5 + U(r, t, e) : 0;
}
function qe(t, e) {
  R(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function Nt(t, e) {
  return !t.deadIds.has(e);
}
function Mt(t, e, r) {
  return t.idMap.get(r)?.has(e) || !1;
}
function R(t, e) {
  const r = t.idMap.get(e);
  if (r)
    for (const n of r)
      t.deadIds.add(n);
}
function U(t, e, r) {
  const n = t.idMap.get(e);
  if (!n)
    return 0;
  let s = 0;
  for (const o of n)
    Nt(t, o) && Mt(t, o, r) && ++s;
  return s;
}
function be(t, e) {
  const r = t.parentElement, n = t.querySelectorAll("[id]");
  for (const s of n) {
    let o = s;
    for (; o !== r && o; ) {
      let i = e.get(o);
      i == null && (i = /* @__PURE__ */ new Set(), e.set(o, i)), i.add(s.id), o = o.parentElement;
    }
  }
}
function kt(t, e) {
  const r = /* @__PURE__ */ new Map();
  return be(t, r), be(e, r), r;
}
const Pt = "get", Rt = "post", $t = "put", Ct = "patch", Ot = "delete", Ht = [Pt, Rt, $t, Ct, Ot], It = Ht.reduce((t, e) => (t[e] = async (r) => {
  const n = Document;
  if (!n.startViewTransition) {
    await we(e, r);
    return;
  }
  return new Promise((s) => {
    n.startViewTransition(async () => {
      await we(e, r), s();
    });
  });
}, t), {}), xt = "Accept", Dt = "Content-Type", Ft = "datastar-request", Ut = "application/json", Vt = "text/event-stream", jt = "true", V = "datastar-", j = `${V}indicator`, le = `${j}-loading`, Ee = `${V}settling`, W = `${V}swapping`, Bt = "self", S = {
  MorphElement: "morph_element",
  InnerElement: "inner_element",
  OuterElement: "outer_element",
  PrependElement: "prepend_element",
  AppendElement: "append_element",
  BeforeElement: "before_element",
  AfterElement: "after_element",
  DeleteElement: "delete_element",
  UpsertAttributes: "upsert_attributes"
}, qt = {
  prefix: "header",
  description: "Sets the header of the fetch request",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => {
    const e = t.store.fetch.headers, r = t.key[0].toUpperCase() + t.key.slice(1);
    return e[r] = t.reactivity.computed(() => t.expressionFn(t)), () => {
      delete e[r];
    };
  }
}, Gt = {
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
}, Kt = {
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
.${le} {
 opacity:1;
 transition: opacity 300ms ease-in;
}
`, document.head.appendChild(t);
  },
  onLoad: (t) => t.reactivity.effect(() => {
    const e = t.reactivity.computed(() => `${t.expressionFn(t)}`);
    t.store.fetch.indicatorSelectors[t.el.id] = e;
    const r = document.querySelector(e.value);
    if (!r)
      throw new Error(`No indicator found for ${e.value}`);
    return r.classList.add(j), () => {
      delete t.store.fetch.indicatorSelectors[t.el.id];
    };
  })
}, Wt = [qt, Gt, Kt], Jt = /(?<key>\w*): (?<value>.*)/gm;
async function we(t, e) {
  const { el: r, store: n } = e, s = n.fetch.elementURLs[r.id];
  if (!s)
    return;
  let o = r, i = !1;
  const l = n.fetch.indicatorSelectors[r.id];
  if (l) {
    const h = document.querySelector(l);
    h && (o = h, o.classList.remove(j), o.classList.add(le), i = !0);
  }
  const d = new URL(s.value, window.location.origin), u = new Headers();
  u.append(xt, Vt), u.append(Dt, Ut), u.append(Ft, jt);
  const c = n.fetch.headers.value;
  if (c)
    for (const h in c) {
      const L = c[h];
      u.append(h, L);
    }
  const a = { ...n };
  delete a.fetch;
  const y = JSON.stringify(a);
  t = t.toUpperCase();
  const b = { method: t, headers: u };
  if (t === "GET") {
    const h = new URLSearchParams(d.search);
    h.append("datastar", y), d.search = h.toString();
  } else
    b.body = y;
  const m = await fetch(d, b);
  if (!m.ok)
    throw new Error(`Response was not ok, url: ${d}, status: ${m.status}`);
  if (!m.body)
    throw new Error("No response body");
  const g = m.body.pipeThrough(new TextDecoderStream()).getReader();
  for (; ; ) {
    const { done: h, value: L } = await g.read();
    if (h)
      break;
    L.split(`

`).forEach((w) => {
      const P = [...w.matchAll(Jt)];
      if (P.length) {
        let f = "", E = "morph_element", v = "", H = 0, q = !1, de = !1, te = "";
        for (const pe of P) {
          if (!pe.groups)
            continue;
          const { key: Ge, value: N } = pe.groups;
          switch (Ge) {
            case "event":
              if (!N.startsWith(V))
                throw new Error(`Unknown event: ${N}`);
              switch (N.slice(V.length)) {
                case "redirect":
                  q = !0;
                  break;
                case "fragment":
                  de = !0;
                  break;
                case "error":
                  break;
                default:
                  throw new Error(`Unknown event: ${N}`);
              }
              break;
            case "data":
              const re = N.indexOf(" ");
              if (re === -1)
                throw new Error("Missing space in data");
              const he = N.slice(0, re), $ = N.slice(re + 1);
              switch (he) {
                case "selector":
                  v = $;
                  break;
                case "merge":
                  const me = $;
                  if (!Object.values(S).includes(me))
                    throw new Error(`Unknown merge option: ${N}`);
                  E = me;
                  break;
                case "settle":
                  H = parseInt($);
                  break;
                case "fragment":
                case "html":
                  f = $;
                  break;
                case "redirect":
                  te = $;
                  break;
                case "error":
                  throw new Error($);
                default:
                  throw new Error(`Unknown data type: ${he}`);
              }
          }
        }
        if (q && te)
          window.location.href = te;
        else if (de && f)
          zt(e, v, E, f, H);
        else
          throw new Error("Unknown event");
      }
    });
  }
  i && (o.classList.remove(le), o.classList.add(j));
}
const Se = document.createElement("template");
function zt(t, e, r, n, s) {
  const { el: o } = t;
  Se.innerHTML = n;
  const i = Se.content.firstChild;
  if (!(i instanceof Element))
    throw new Error(`Fragment is not an element, source '${n}'`);
  const l = e === Bt;
  let d;
  if (l)
    d = [o];
  else {
    const u = e || `#${i.getAttribute("id")}`;
    if (d = document.querySelectorAll(u) || [], !d)
      throw new Error(`No target elements, selector: ${e}`);
  }
  for (const u of d) {
    u.classList.add(W);
    const c = u.outerHTML;
    let a = u;
    switch (r) {
      case S.MorphElement:
        const b = vt(a, i);
        if (!b?.length)
          throw new Error("Failed to morph element");
        a = b[0];
        break;
      case S.InnerElement:
        a.innerHTML = i.innerHTML;
        break;
      case S.OuterElement:
        a.replaceWith(i);
        break;
      case S.PrependElement:
        a.prepend(i);
        break;
      case S.AppendElement:
        a.append(i);
        break;
      case S.BeforeElement:
        a.before(i);
        break;
      case S.AfterElement:
        a.after(i);
        break;
      case S.DeleteElement:
        setTimeout(() => a.remove(), s);
        break;
      case S.UpsertAttributes:
        i.getAttributeNames().forEach((g) => {
          const h = i.getAttribute(g);
          a.setAttribute(g, h);
        });
        break;
      default:
        throw new Error(`Unknown merge type: ${r}`);
    }
    a.classList.add(W), t.cleanupElementRemovals(u), t.applyPlugins(a), u.classList.remove(W), a.classList.remove(W);
    const y = a.outerHTML;
    c !== y && (a.classList.add(Ee), setTimeout(() => {
      a.classList.remove(Ee);
    }, s));
  }
}
const Zt = {
  setAll: async (t, e, r) => {
    const n = new RegExp(e);
    Object.keys(t.store).filter((s) => n.test(s)).forEach((s) => {
      t.store[s].value = r;
    });
  },
  toggleAll: async (t, e) => {
    const r = new RegExp(e);
    Object.keys(t.store).filter((n) => r.test(n)).forEach((n) => {
      t.store[n].value = !t.store[n].value;
    });
  }
}, ne = "display", Te = "none", se = "important", Xt = {
  prefix: "show",
  description: "Sets the display of the element",
  allowedModifiers: /* @__PURE__ */ new Set([se]),
  onLoad: (t) => {
    const { el: e, modifiers: r, expressionFn: n } = t;
    return ue(() => {
      const o = !!n(t), l = r.has(se) ? se : void 0;
      o ? e.style.length === 1 && e.style.display === Te ? e.style.removeProperty(ne) : e.style.setProperty(ne, "", l) : e.style.setProperty(ne, Te, l);
    });
  }
}, Yt = "intersects", Ae = "once", Le = "half", Ne = "full", Qt = {
  prefix: Yt,
  description: "Run expression when element intersects with viewport",
  allowedModifiers: /* @__PURE__ */ new Set([Ae, Le, Ne]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, r = { threshold: 0 };
    e.has(Ne) ? r.threshold = 1 : e.has(Le) && (r.threshold = 0.5);
    const n = new IntersectionObserver((s) => {
      s.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(Ae) && n.disconnect());
      });
    }, r);
    return n.observe(t.el), () => n.disconnect();
  }
}, Me = "prepend", ke = "append", Pe = new Error("Target element must have a parent if using prepend or append"), er = {
  prefix: "teleport",
  description: "Teleports the element to another element",
  allowedModifiers: /* @__PURE__ */ new Set([Me, ke]),
  allowedTagRegexps: /* @__PURE__ */ new Set(["template"]),
  bypassExpressionFunctionCreation: () => !0,
  onLoad: (t) => {
    const { el: e, modifiers: r, expression: n } = t;
    if (!(e instanceof HTMLTemplateElement))
      throw new Error();
    const s = document.querySelector(n);
    if (!s)
      throw new Error(`Target element not found: ${n}`);
    if (!e.content)
      throw new Error("Template element must have content");
    const o = e.content.cloneNode(!0);
    if (Re(o)?.firstElementChild)
      throw new Error("Empty template");
    if (r.has(Me)) {
      if (!s.parentNode)
        throw Pe;
      s.parentNode.insertBefore(o, s);
    } else if (r.has(ke)) {
      if (!s.parentNode)
        throw Pe;
      s.parentNode.insertBefore(o, s.nextSibling);
    } else
      s.appendChild(o);
  }
}, tr = {
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
}, rr = [
  Xt,
  Qt,
  er,
  tr
];
function nr(t = {}, ...e) {
  const r = performance.now(), n = new it(t, ...e);
  n.run();
  const s = performance.now();
  return console.log(`Datastar loaded and attached to all DOM elements in ${s - r}ms`), n;
}
function ir(t = {}, ...e) {
  const r = Object.assign({}, Zt, It, t), n = [...Wt, ...rr, ...ht, ...e];
  return nr(r, ...n);
}
export {
  it as Datastar,
  nr as runDatastarWith,
  ir as runDatastarWithAllPlugins,
  Re as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
