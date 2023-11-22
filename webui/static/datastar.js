function Pe(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function Y() {
  throw new Error("Cycle detected");
}
function Ge() {
  throw new Error("Computed cannot have side-effects");
}
const Ke = Symbol.for("preact-signals"), S = 1, P = 2, F = 4, R = 8, I = 16, N = 32;
function Q() {
  x++;
}
function ee() {
  if (x > 1) {
    x--;
    return;
  }
  let t, e = !1;
  for (; D !== void 0; ) {
    let r = D;
    for (D = void 0, oe++; r !== void 0; ) {
      const n = r._nextBatchedEffect;
      if (r._nextBatchedEffect = void 0, r._flags &= ~P, !(r._flags & R) && Oe(r))
        try {
          r._callback();
        } catch (s) {
          e || (t = s, e = !0);
        }
      r = n;
    }
  }
  if (oe = 0, x--, e)
    throw t;
}
function Je(t) {
  if (x > 0)
    return t();
  Q();
  try {
    return t();
  } finally {
    ee();
  }
}
let p, D, x = 0, oe = 0, Z = 0;
function Re(t) {
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
    }, p._sources !== void 0 && (p._sources._nextSource = e), p._sources = e, t._node = e, p._flags & N && t._subscribe(e), e;
  if (e._version === -1)
    return e._version = 0, e._nextSource !== void 0 && (e._nextSource._prevSource = e._prevSource, e._prevSource !== void 0 && (e._prevSource._nextSource = e._nextSource), e._prevSource = p._sources, e._nextSource = void 0, p._sources._nextSource = e, p._sources = e), e;
}
function v(t) {
  this._value = t, this._version = 0, this._node = void 0, this._targets = void 0;
}
v.prototype.brand = Ke;
v.prototype._refresh = function() {
  return !0;
};
v.prototype._subscribe = function(t) {
  this._targets !== t && t._prevTarget === void 0 && (t._nextTarget = this._targets, this._targets !== void 0 && (this._targets._prevTarget = t), this._targets = t);
};
v.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0) {
    const e = t._prevTarget, r = t._nextTarget;
    e !== void 0 && (e._nextTarget = r, t._prevTarget = void 0), r !== void 0 && (r._prevTarget = e, t._nextTarget = void 0), t === this._targets && (this._targets = r);
  }
};
v.prototype.subscribe = function(t) {
  const e = this;
  return ue(function() {
    const r = e.value, n = this._flags & N;
    this._flags &= ~N;
    try {
      t(r);
    } finally {
      this._flags |= n;
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
    const t = Re(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (p instanceof T && Ge(), t !== this._value) {
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
function $e(t) {
  return new v(t);
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
function Ce(t) {
  let e = t._sources, r;
  for (; e !== void 0; ) {
    const n = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), n !== void 0 && (n._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = n)) : r = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = n;
  }
  t._sources = r;
}
function T(t) {
  v.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = Z - 1, this._flags = F;
}
T.prototype = new v();
T.prototype._refresh = function() {
  if (this._flags &= ~P, this._flags & S)
    return !1;
  if ((this._flags & (F | N)) === N || (this._flags &= ~F, this._globalVersion === Z))
    return !0;
  if (this._globalVersion = Z, this._flags |= S, this._version > 0 && !Oe(this))
    return this._flags &= ~S, !0;
  const t = p;
  try {
    He(this), p = this;
    const e = this._compute();
    (this._flags & I || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~I, this._version++);
  } catch (e) {
    this._value = e, this._flags |= I, this._version++;
  }
  return p = t, Ce(this), this._flags &= ~S, !0;
};
T.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= F | N;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  v.prototype._subscribe.call(this, t);
};
T.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (v.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~N;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
T.prototype._notify = function() {
  if (!(this._flags & P)) {
    this._flags |= F | P;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
T.prototype.peek = function() {
  if (this._refresh() || Y(), this._flags & I)
    throw this._value;
  return this._value;
};
Object.defineProperty(T.prototype, "value", {
  get() {
    this._flags & S && Y();
    const t = Re(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & I)
      throw this._value;
    return this._value;
  }
});
function ze(t) {
  return new T(t);
}
function Ie(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    Q();
    const r = p;
    p = void 0;
    try {
      e();
    } catch (n) {
      throw t._flags &= ~S, t._flags |= R, ce(t), n;
    } finally {
      p = r, ee();
    }
  }
}
function ce(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Ie(t);
}
function Ze(t) {
  if (p !== this)
    throw new Error("Out-of-order effect");
  Ce(this), p = t, this._flags &= ~S, this._flags & R && ce(this), ee();
}
function B(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = N;
}
B.prototype._callback = function() {
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
B.prototype._start = function() {
  this._flags & S && Y(), this._flags |= S, this._flags &= ~R, Ie(this), He(this), Q();
  const t = p;
  return p = this, Ze.bind(this, t);
};
B.prototype._notify = function() {
  this._flags & P || (this._flags |= P, this._nextBatchedEffect = D, D = this);
};
B.prototype._dispose = function() {
  this._flags |= R, this._flags & S || ce(this);
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
      return typeof n != "object" || n === null || Array.isArray(n) ? e[r] = $e(n) : e[r] = ie(n), e;
    },
    {}
  )
), Xe = (t, e) => Object.keys(e).forEach((r) => t[r].value = e[r]), ae = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (r, [n, s]) => (s instanceof v ? r[n] = e ? s.peek() : s.value : s instanceof De && (r[n] = ae(s, { peek: e })), r),
  {}
);
function xe(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return JSON.parse(JSON.stringify(e));
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let r = t;
  return typeof t != "object" && (r = { ...e }), Object.keys(e).forEach((n) => {
    r.hasOwnProperty(n) || (r[n] = e[n]), e[n] === null ? delete r[n] : r[n] = xe(r[n], e[n]);
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
    signal: $e,
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
    const r = xe(this.store.value, e);
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
          let c = o.dataset[i] || "";
          if (!i.startsWith(n.prefix))
            continue;
          if (o.id.length === 0 && (o.id = `ds-${this.parentID}-${this.missingIDNext++}`), r.clear(), n.allowedTags && !n.allowedTags.has(o.tagName.toLowerCase()))
            throw new Error(
              `Tag '${o.tagName}' is not allowed for plugin '${i}', allowed tags are: ${[
                [...n.allowedTags].map((f) => `'${f}'`)
              ].join(", ")}`
            );
          let d = i.slice(n.prefix.length), [u, ...a] = d.split(".");
          if (n.mustHaveEmptyKey && u.length > 0)
            throw new Error(`Attribute '${i}' must have empty key`);
          if (n.mustNotEmptyKey && u.length === 0)
            throw new Error(`Attribute '${i}' must have non-empty key`);
          u.length && (u = u[0].toLowerCase() + u.slice(1));
          const l = a.map((f) => {
            const [E, ...b] = f.split("_");
            return { label: E, args: b };
          });
          if (n.allowedModifiers) {
            for (const f of l)
              if (!n.allowedModifiers.has(f.label))
                throw new Error(`Modifier '${f.label}' is not allowed`);
          }
          const m = /* @__PURE__ */ new Map();
          for (const f of l)
            m.set(f.label, f.args);
          if (n.mustHaveEmptyExpression && c.length)
            throw new Error(`Attribute '${i}' must have empty expression`);
          if (n.mustNotEmptyExpression && !c.length)
            throw new Error(`Attribute '${i}' must have non-empty expression`);
          const g = [...rt, ...n.preprocessors || []];
          for (const f of g) {
            if (r.has(f))
              continue;
            r.add(f);
            const E = [...c.matchAll(f.regexp)];
            if (E.length)
              for (const b of E) {
                if (!b.groups)
                  continue;
                const { groups: H } = b, { whole: q } = H;
                c = c.replace(q, f.replacer(H));
              }
          }
          const { store: _, reactivity: A, actions: h, refs: y } = this, $ = {
            store: _,
            mergeStore: this.mergeStore.bind(this),
            applyPlugins: this.applyPlugins.bind(this),
            cleanupElementRemovals: this.cleanupElementRemovals.bind(this),
            actions: h,
            refs: y,
            reactivity: A,
            el: o,
            key: u,
            expression: c,
            expressionFn: () => {
              throw new Error("Expression function not created");
            },
            modifiers: m
          };
          if (!n.bypassExpressionFunctionCreation?.($) && !n.mustHaveEmptyExpression && c.length) {
            const f = c.split(";");
            f[f.length - 1] = `return ${f[f.length - 1]}`;
            const E = f.join(";");
            try {
              const b = new Function("ctx", E);
              $.expressionFn = b;
            } catch (b) {
              console.error(b), console.error(`Error evaluating expression '${E}' on ${o.id ? `#${o.id}` : o.tagName}`);
              return;
            }
          }
          const O = n.onLoad($);
          O && (this.removals.has(o) || this.removals.set(o, /* @__PURE__ */ new Set()), this.removals.get(o).add(O));
        }
      });
    });
  }
  walkDownDOM(e, r, n = 0) {
    if (!e)
      return;
    const s = Pe(e);
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
}, ct = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/, me = ["change", "input", "keydown"], ut = {
  prefix: "model",
  description: "Sets the value of the element",
  mustHaveEmptyKey: !0,
  // allowedTags: new Set(['input', 'textarea', 'select', 'checkbox']),
  bypassExpressionFunctionCreation: () => !0,
  onLoad: (t) => {
    const { store: e, el: r, expression: n } = t, s = e[n];
    return t.reactivity.effect(() => {
      const o = r instanceof HTMLInputElement, i = r instanceof HTMLSelectElement;
      if (!o && !i)
        throw new Error("Element must be input or select");
      const c = o && r.type === "checkbox", d = o && r.type === "file";
      if (!s)
        throw new Error(`Signal ${n} not found`);
      c ? r.checked = s.value : d || (r.value = `${s.value}`);
      const u = () => {
        if (d) {
          const [a] = r?.files || [];
          if (!a) {
            s.value = "";
            return;
          }
          const l = new FileReader();
          l.onload = () => {
            if (typeof l.result != "string")
              throw new Error("Unsupported type");
            const g = l.result.match(ct);
            if (!g?.groups)
              throw new Error("Invalid data URI");
            const { mime: _, contents: A } = g.groups;
            s.value = A;
            const h = `${n}Mime`;
            if (h in e) {
              const y = e[`${h}`];
              y.value = _;
            }
          }, l.readAsDataURL(a);
          const m = `${n}Name`;
          if (m in e) {
            const g = e[`${m}`];
            g.value = a.name;
          }
          return;
        } else {
          const a = s.value;
          if (typeof a == "number")
            s.value = Number(r.value);
          else if (typeof a == "string")
            s.value = r.value;
          else if (typeof a == "boolean")
            c ? s.value = r.checked : s.value = !!r.value;
          else
            throw new Error("Unsupported type");
        }
      };
      return u(), me.forEach((a) => {
        r.addEventListener(a, u);
      }), () => {
        me.forEach((a) => {
          r.removeEventListener(a, u);
        });
      };
    });
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
      const u = ge(o), a = W(o, "leading", !1), l = W(o, "noTrail", !0);
      s = mt(s, u, a, l);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const u = ge(i), a = W(i, "noLead", !0), l = W(i, "noTrail", !0);
      s = gt(s, u, a, l);
    }
    const c = {
      capture: !0,
      passive: !1,
      once: !1
    };
    if (t.modifiers.has("capture") || (c.capture = !1), t.modifiers.has("passive") && (c.passive = !0), t.modifiers.has("once") && (c.once = !0), r === "load")
      return s(), () => {
      };
    const d = r.toLowerCase();
    return e.addEventListener(d, s, c), () => {
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
function ge(t) {
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
function W(t, e, r = !1) {
  return t ? t.includes(e) || r : !1;
}
function mt(t, e, r = !1, n = !0) {
  let s;
  const o = () => s && clearTimeout(s);
  return function(...c) {
    o(), r && !s && t(...c), s = setTimeout(() => {
      n && t(...c), o();
    }, e);
  };
}
function gt(t, e, r = !0, n = !1) {
  let s = !1, o = null;
  return function(...c) {
    s ? o = c : (s = !0, r ? t(...c) : o = c, setTimeout(() => {
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
  return Fe(t, s, o);
}
function Fe(t, e, r) {
  if (r.head.block) {
    const n = t.querySelector("head"), s = e.querySelector("head");
    if (n && s) {
      const o = Ve(s, n, r);
      Promise.all(o).then(() => {
        Fe(
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
    return Ue(e, t, r), t.children;
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
        return r.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && r.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && r.head.style !== "morph" ? Ve(e, t, r) : (_t(e, t), Ue(e, t, r))), r.callbacks.afterNodeMorphed(t, e), t);
      if (r.callbacks.beforeNodeRemoved(t) === !1 || r.callbacks.beforeNodeAdded(e) === !1)
        return;
      if (!t.parentElement)
        throw new Error("oldNode has no parentElement");
      return t.parentElement.replaceChild(e, t), r.callbacks.afterNodeAdded(e), r.callbacks.afterNodeRemoved(t), e;
    }
}
function Ue(t, e, r) {
  let n = t.firstChild, s = e.firstChild, o;
  for (; n; ) {
    if (o = n, n = o.nextSibling, s == null) {
      if (r.callbacks.beforeNodeAdded(o) === !1)
        return;
      e.appendChild(o), r.callbacks.afterNodeAdded(o), k(r, o);
      continue;
    }
    if (je(o, s, r)) {
      z(s, o, r), s = s.nextSibling, k(r, o);
      continue;
    }
    let i = bt(t, e, o, s, r);
    if (i) {
      s = ve(s, i, r), z(i, o, r), k(r, o);
      continue;
    }
    let c = Et(t, o, s, r);
    if (c) {
      s = ve(s, c, r), z(c, o, r), k(r, o);
      continue;
    }
    if (r.callbacks.beforeNodeAdded(o) === !1)
      return;
    e.insertBefore(o, s), r.callbacks.afterNodeAdded(o), k(r, o);
  }
  for (; s !== null; ) {
    let i = s;
    s = s.nextSibling, Be(i, r);
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
    e.value = t.value || "", G(t, e, "value"), G(t, e, "checked"), G(t, e, "disabled");
  else if (t instanceof HTMLOptionElement)
    G(t, e, "selected");
  else if (t instanceof HTMLTextAreaElement && e instanceof HTMLTextAreaElement) {
    const n = t.value, s = e.value;
    n !== s && (e.value = n), e.firstChild && e.firstChild.nodeValue !== n && (e.firstChild.nodeValue = n);
  }
}
function G(t, e, r) {
  const n = t.getAttribute(r), s = e.getAttribute(r);
  n !== s && (n ? e.setAttribute(r, n) : e.removeAttribute(r));
}
function Ve(t, e, r) {
  const n = [], s = [], o = [], i = [], c = r.head.style, d = /* @__PURE__ */ new Map();
  for (const a of t.children)
    d.set(a.outerHTML, a);
  for (const a of e.children) {
    let l = d.has(a.outerHTML), m = r.head.shouldReAppend(a), g = r.head.shouldPreserve(a);
    l || g ? m ? s.push(a) : (d.delete(a.outerHTML), o.push(a)) : c === "append" ? m && (s.push(a), i.push(a)) : r.head.shouldRemove(a) !== !1 && s.push(a);
  }
  i.push(...d.values()), console.log("to append: ", i);
  const u = [];
  for (const a of i) {
    console.log("adding: ", a);
    const l = document.createRange().createContextualFragment(a.outerHTML).firstChild;
    if (!l)
      throw new Error("could not create new element from: " + a.outerHTML);
    if (console.log(l), r.callbacks.beforeNodeAdded(l)) {
      if (l.hasAttribute("href") || l.hasAttribute("src")) {
        let m;
        const g = new Promise((_) => {
          m = _;
        });
        l.addEventListener("load", function() {
          m(void 0);
        }), u.push(g);
      }
      e.appendChild(l), r.callbacks.afterNodeAdded(l), n.push(l);
    }
  }
  for (const a of s)
    r.callbacks.beforeNodeRemoved(a) !== !1 && (e.removeChild(a), r.callbacks.afterNodeRemoved(a));
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
function je(t, e, r) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : U(r, t, e) > 0 : !1;
}
function X(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function ve(t, e, r) {
  for (; t !== e; ) {
    const n = t;
    if (t = t?.nextSibling, !n)
      throw new Error("tempNode is null");
    Be(n, r);
  }
  return k(r, e), e.nextSibling;
}
function bt(t, e, r, n, s) {
  const o = U(s, r, e);
  let i = null;
  if (o > 0) {
    i = n;
    let c = 0;
    for (; i != null; ) {
      if (je(r, i, s))
        return i;
      if (c += U(s, i, t), c > o)
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
const _e = new DOMParser();
function wt(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const r = _e.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return J.add(r), r;
    {
      let n = r.firstChild;
      return n ? (J.add(n), n) : null;
    }
  } else {
    const n = _e.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
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
function Be(t, e) {
  k(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function Mt(t, e) {
  return !t.deadIds.has(e);
}
function Nt(t, e, r) {
  return t.idMap.get(r)?.has(e) || !1;
}
function k(t, e) {
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
    Mt(t, o) && Nt(t, o, r) && ++s;
  return s;
}
function ye(t, e) {
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
  return ye(t, r), ye(e, r), r;
}
const Pt = "get", Rt = "post", $t = "put", Ot = "patch", Ht = "delete", Ct = [Pt, Rt, $t, Ot, Ht], It = Ct.reduce((t, e) => (t[e] = async (r) => {
  const n = Document;
  if (!n.startViewTransition) {
    await Ee(e, r);
    return;
  }
  return new Promise((s) => {
    n.startViewTransition(async () => {
      await Ee(e, r), s();
    });
  });
}, t), {}), Dt = "Accept", xt = "Content-Type", Ft = "datastar-request", Ut = "application/json", Vt = "text/event-stream", jt = "true", V = "datastar-", j = `${V}indicator`, le = `${j}-loading`, be = `${V}settling`, K = `${V}swapping`, Bt = "self", w = {
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
}, Wt = {
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
}, Gt = {
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
}, Kt = [qt, Wt, Gt], Jt = /(?<key>\w*): (?<value>.*)/gm;
async function Ee(t, e) {
  const { el: r, store: n } = e, s = n.fetch.elementURLs[r.id];
  if (!s)
    return;
  let o = r, i = !1;
  const c = n.fetch.indicatorSelectors[r.id];
  if (c) {
    const h = document.querySelector(c);
    h && (o = h, o.classList.remove(j), o.classList.add(le), i = !0);
  }
  const d = new URL(s.value, window.location.origin), u = new Headers();
  u.append(Dt, Vt), u.append(xt, Ut), u.append(Ft, jt);
  const a = n.fetch.headers.value;
  if (a)
    for (const h in a) {
      const y = a[h];
      u.append(h, y);
    }
  const l = { ...n };
  delete l.fetch;
  const m = JSON.stringify(l);
  t = t.toUpperCase();
  const g = { method: t, headers: u };
  if (t === "GET") {
    const h = new URLSearchParams(d.search);
    h.append("datastar", m), d.search = h.toString();
  } else
    g.body = m;
  const _ = await fetch(d, g);
  if (!_.ok) {
    if (console.log(`Response was not ok, url: ${d}, status: ${_.status}`), !(_.status >= 300 && _.status < 400))
      throw new Error(`Response was not ok and wasn't a redirect, status: ${_}`);
    let y = await _.text();
    y.startsWith("/") && (y = window.location.origin + y), console.log(`Redirecting to ${y}`), window.location.replace(y);
    return;
  }
  if (!_.body)
    throw new Error("No response body");
  const A = _.body.pipeThrough(new TextDecoderStream()).getReader();
  for (; ; ) {
    const { done: h, value: y } = await A.read();
    if (h)
      break;
    y.split(`

`).forEach(($) => {
      const O = [...$.matchAll(Jt)];
      if (O.length) {
        let f = "", E = "morph_element", b = "", H = 0, q = !1, de = !1, te = "";
        for (const pe of O) {
          if (!pe.groups)
            continue;
          const { key: qe, value: L } = pe.groups;
          switch (qe) {
            case "event":
              if (!L.startsWith(V))
                throw new Error(`Unknown event: ${L}`);
              switch (L.slice(V.length)) {
                case "redirect":
                  q = !0;
                  break;
                case "fragment":
                  de = !0;
                  break;
                default:
                  throw new Error(`Unknown event: ${L}`);
              }
              break;
            case "data":
              const re = L.indexOf(" ");
              if (re === -1)
                throw new Error("Missing space in data");
              const We = L.slice(0, re), C = L.slice(re + 1);
              switch (We) {
                case "selector":
                  b = C;
                  break;
                case "merge":
                  const he = C;
                  if (!Object.values(w).includes(he))
                    throw new Error(`Unknown merge option: ${L}`);
                  E = he;
                  break;
                case "settle":
                  H = parseInt(C);
                  break;
                case "fragment":
                case "html":
                  f = C;
                  break;
                case "redirect":
                  te = C;
                  break;
              }
          }
        }
        if (q && te)
          window.location.href = te;
        else if (de && f)
          zt(e, b, E, f, H);
        else
          throw new Error("Unknown event");
      }
    });
  }
  i && (o.classList.remove(le), o.classList.add(j));
}
const we = document.createElement("template");
function zt(t, e, r, n, s) {
  const { el: o } = t;
  we.innerHTML = n;
  const i = we.content.firstChild;
  if (!(i instanceof Element))
    throw new Error(`Fragment is not an element, source '${n}'`);
  const c = e === Bt;
  let d;
  if (c)
    d = [o];
  else {
    const u = e || `#${i.getAttribute("id")}`;
    if (d = document.querySelectorAll(u) || [], !d)
      throw new Error(`No target elements, selector: ${e}`);
  }
  for (const u of d) {
    u.classList.add(K);
    const a = u.outerHTML;
    let l = u;
    switch (r) {
      case w.MorphElement:
        const g = vt(l, i);
        if (!g?.length)
          throw new Error("Failed to morph element");
        l = g[0];
        break;
      case w.InnerElement:
        l.innerHTML = i.innerHTML;
        break;
      case w.OuterElement:
        l.replaceWith(i);
        break;
      case w.PrependElement:
        l.prepend(i);
        break;
      case w.AppendElement:
        l.append(i);
        break;
      case w.BeforeElement:
        l.before(i);
        break;
      case w.AfterElement:
        l.after(i);
        break;
      case w.DeleteElement:
        setTimeout(() => l.remove(), s);
        break;
      case w.UpsertAttributes:
        i.getAttributeNames().forEach((A) => {
          const h = i.getAttribute(A);
          l.setAttribute(A, h);
        });
        break;
      default:
        throw new Error(`Unknown merge type: ${r}`);
    }
    l.classList.add(K), t.cleanupElementRemovals(u), t.applyPlugins(l), u.classList.remove(K), l.classList.remove(K);
    const m = l.outerHTML;
    a !== m && (l.classList.add(be), setTimeout(() => {
      l.classList.remove(be);
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
}, ne = "display", Se = "none", se = "important", Xt = {
  prefix: "show",
  description: "Sets the display of the element",
  allowedModifiers: /* @__PURE__ */ new Set([se]),
  onLoad: (t) => {
    const { el: e, modifiers: r, expressionFn: n } = t;
    return ue(() => {
      const o = !!n(t), c = r.has(se) ? se : void 0;
      o ? e.style.length === 1 && e.style.display === Se ? e.style.removeProperty(ne) : e.style.setProperty(ne, "", c) : e.style.setProperty(ne, Se, c);
    });
  }
}, Yt = "intersects", Te = "once", Ae = "half", Le = "full", Qt = {
  prefix: Yt,
  description: "Run expression when element intersects with viewport",
  allowedModifiers: /* @__PURE__ */ new Set([Te, Ae, Le]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, r = { threshold: 0 };
    e.has(Le) ? r.threshold = 1 : e.has(Ae) && (r.threshold = 0.5);
    const n = new IntersectionObserver((s) => {
      s.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(Te) && n.disconnect());
      });
    }, r);
    return n.observe(t.el), () => n.disconnect();
  }
}, Me = "prepend", Ne = "append", ke = new Error("Target element must have a parent if using prepend or append"), er = {
  prefix: "teleport",
  description: "Teleports the element to another element",
  allowedModifiers: /* @__PURE__ */ new Set([Me, Ne]),
  allowedTags: /* @__PURE__ */ new Set(["template"]),
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
    if (Pe(o)?.firstElementChild)
      throw new Error("Empty template");
    if (r.has(Me)) {
      if (!s.parentNode)
        throw ke;
      s.parentNode.insertBefore(o, s);
    } else if (r.has(Ne)) {
      if (!s.parentNode)
        throw ke;
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
  const r = Object.assign({}, Zt, It, t), n = [...Kt, ...rr, ...ht, ...e];
  return nr(r, ...n);
}
export {
  it as Datastar,
  nr as runDatastarWith,
  ir as runDatastarWithAllPlugins,
  Pe as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
