function Ie(t) {
  return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
}
function ee() {
  throw new Error("Cycle detected");
}
function Xe() {
  throw new Error("Computed cannot have side-effects");
}
const Ye = Symbol.for("preact-signals"), A = 1, I = 2, B = 4, H = 8, D = 16, P = 32;
function te() {
  U++;
}
function ne() {
  if (U > 1) {
    U--;
    return;
  }
  let t, e = !1;
  for (; F !== void 0; ) {
    let n = F;
    for (F = void 0, ae++; n !== void 0; ) {
      const r = n._nextBatchedEffect;
      if (n._nextBatchedEffect = void 0, n._flags &= ~I, !(n._flags & H) && De(n))
        try {
          n._callback();
        } catch (s) {
          e || (t = s, e = !0);
        }
      n = r;
    }
  }
  if (ae = 0, U--, e)
    throw t;
}
function Qe(t) {
  if (U > 0)
    return t();
  te();
  try {
    return t();
  } finally {
    ne();
  }
}
let m, F, U = 0, ae = 0, Y = 0;
function He(t) {
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
    }, m._sources !== void 0 && (m._sources._nextSource = e), m._sources = e, t._node = e, m._flags & P && t._subscribe(e), e;
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
  return de(function() {
    const n = e.value, r = this._flags & P;
    this._flags &= ~P;
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
    const t = He(this);
    return t !== void 0 && (t._version = this._version), this._value;
  },
  set(t) {
    if (m instanceof N && Xe(), t !== this._value) {
      ae > 100 && ee(), this._value = t, this._version++, Y++, te();
      try {
        for (let e = this._targets; e !== void 0; e = e._nextTarget)
          e._target._notify();
      } finally {
        ne();
      }
    }
  }
});
function xe(t) {
  return new v(t);
}
function De(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    if (e._source._version !== e._version || !e._source._refresh() || e._source._version !== e._version)
      return !0;
  return !1;
}
function Fe(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource) {
    const n = e._source._node;
    if (n !== void 0 && (e._rollbackNode = n), e._source._node = e, e._version = -1, e._nextSource === void 0) {
      t._sources = e;
      break;
    }
  }
}
function Ue(t) {
  let e = t._sources, n;
  for (; e !== void 0; ) {
    const r = e._prevSource;
    e._version === -1 ? (e._source._unsubscribe(e), r !== void 0 && (r._nextSource = e._nextSource), e._nextSource !== void 0 && (e._nextSource._prevSource = r)) : n = e, e._source._node = e._rollbackNode, e._rollbackNode !== void 0 && (e._rollbackNode = void 0), e = r;
  }
  t._sources = n;
}
function N(t) {
  v.call(this, void 0), this._compute = t, this._sources = void 0, this._globalVersion = Y - 1, this._flags = B;
}
N.prototype = new v();
N.prototype._refresh = function() {
  if (this._flags &= ~I, this._flags & A)
    return !1;
  if ((this._flags & (B | P)) === P || (this._flags &= ~B, this._globalVersion === Y))
    return !0;
  if (this._globalVersion = Y, this._flags |= A, this._version > 0 && !De(this))
    return this._flags &= ~A, !0;
  const t = m;
  try {
    Fe(this), m = this;
    const e = this._compute();
    (this._flags & D || this._value !== e || this._version === 0) && (this._value = e, this._flags &= ~D, this._version++);
  } catch (e) {
    this._value = e, this._flags |= D, this._version++;
  }
  return m = t, Ue(this), this._flags &= ~A, !0;
};
N.prototype._subscribe = function(t) {
  if (this._targets === void 0) {
    this._flags |= B | P;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._subscribe(e);
  }
  v.prototype._subscribe.call(this, t);
};
N.prototype._unsubscribe = function(t) {
  if (this._targets !== void 0 && (v.prototype._unsubscribe.call(this, t), this._targets === void 0)) {
    this._flags &= ~P;
    for (let e = this._sources; e !== void 0; e = e._nextSource)
      e._source._unsubscribe(e);
  }
};
N.prototype._notify = function() {
  if (!(this._flags & I)) {
    this._flags |= B | I;
    for (let t = this._targets; t !== void 0; t = t._nextTarget)
      t._target._notify();
  }
};
N.prototype.peek = function() {
  if (this._refresh() || ee(), this._flags & D)
    throw this._value;
  return this._value;
};
Object.defineProperty(N.prototype, "value", {
  get() {
    this._flags & A && ee();
    const t = He(this);
    if (this._refresh(), t !== void 0 && (t._version = this._version), this._flags & D)
      throw this._value;
    return this._value;
  }
});
function et(t) {
  return new N(t);
}
function Be(t) {
  const e = t._cleanup;
  if (t._cleanup = void 0, typeof e == "function") {
    te();
    const n = m;
    m = void 0;
    try {
      e();
    } catch (r) {
      throw t._flags &= ~A, t._flags |= H, fe(t), r;
    } finally {
      m = n, ne();
    }
  }
}
function fe(t) {
  for (let e = t._sources; e !== void 0; e = e._nextSource)
    e._source._unsubscribe(e);
  t._compute = void 0, t._sources = void 0, Be(t);
}
function tt(t) {
  if (m !== this)
    throw new Error("Out-of-order effect");
  Ue(this), m = t, this._flags &= ~A, this._flags & H && fe(this), ne();
}
function q(t) {
  this._compute = t, this._cleanup = void 0, this._sources = void 0, this._nextBatchedEffect = void 0, this._flags = P;
}
q.prototype._callback = function() {
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
q.prototype._start = function() {
  this._flags & A && ee(), this._flags |= A, this._flags &= ~H, Be(this), Fe(this), te();
  const t = m;
  return m = this, tt.bind(this, t);
};
q.prototype._notify = function() {
  this._flags & I || (this._flags |= I, this._nextBatchedEffect = F, F = this);
};
q.prototype._dispose = function() {
  this._flags |= H, this._flags & A || fe(this);
};
function de(t) {
  const e = new q(t);
  try {
    e._callback();
  } catch (n) {
    throw e._dispose(), n;
  }
  return e._dispose.bind(e);
}
class Ve {
  get value() {
    return ce(this);
  }
  set value(e) {
    Qe(() => nt(this, e));
  }
  peek() {
    return ce(this, { peek: !0 });
  }
}
const le = (t) => Object.assign(
  new Ve(),
  Object.entries(t).reduce(
    (e, [n, r]) => {
      if (["value", "peek"].some((s) => s === n))
        throw new Error(`${n} is a reserved property name`);
      return typeof r != "object" || r === null || Array.isArray(r) ? e[n] = xe(r) : e[n] = le(r), e;
    },
    {}
  )
), nt = (t, e) => Object.keys(e).forEach((n) => t[n].value = e[n]), ce = (t, { peek: e = !1 } = {}) => Object.entries(t).reduce(
  (n, [r, s]) => (s instanceof v ? n[r] = e ? s.peek() : s.value : s instanceof Ve && (n[r] = ce(s, { peek: e })), n),
  {}
), rt = /([\[:])?"(\d+)n"([,\}\]])/g, st = /([\[:])?(\d{17,}|(?:[9](?:[1-9]07199254740991|0[1-9]7199254740991|00[8-9]199254740991|007[2-9]99254740991|007199[3-9]54740991|0071992[6-9]4740991|00719925[5-9]740991|007199254[8-9]40991|0071992547[5-9]0991|00719925474[1-9]991|00719925474099[2-9])))([,\}\]])/g;
function pe(t, e = 2) {
  return JSON.stringify(
    t,
    (r, s) => typeof s == "bigint" ? s.toString() : s,
    e
  ).replace(rt, "$1$2$3");
}
function je(t) {
  const e = t.replace(st, '$1"$2n"$3');
  return JSON.parse(e, (n, r) => {
    if (typeof r == "string" && r.match(/^\d+n$/))
      return BigInt(r.substring(0, r.length - 1));
    if (typeof r == "number" && !Number.isSafeInteger(r)) {
      const o = BigInt(r);
      return console.log(`Converted ${r} to ${o}`), o;
    }
    return r;
  });
}
function Je(t, e) {
  if (typeof e != "object" || Array.isArray(e) || !e)
    return je(pe(e));
  if (typeof e == "object" && e.toJSON !== void 0 && typeof e.toJSON == "function")
    return e.toJSON();
  let n = t;
  return typeof t != "object" && (n = { ...e }), Object.keys(e).forEach((r) => {
    n.hasOwnProperty(r) || (n[r] = e[r]), e[r] === null ? delete n[r] : n[r] = Je(n[r], e[r]);
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
    return `ctx.store.${e}.value`;
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
  store = le({});
  actions = {};
  refs = {};
  reactivity = {
    signal: xe,
    computed: et,
    effect: de
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
    return pe(e);
  }
  JSONParse(e) {
    return je(e);
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
    const n = Je(this.store.value, e);
    this.store = le(n);
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
            if (![...r.allowedTagRegexps].some((g) => d.match(g)))
              throw new Error(
                `'${o.tagName}' not allowed for '${i}', allowed ${[
                  [...r.allowedTagRegexps].map((g) => `'${g}'`)
                ].join(", ")}`
              );
          }
          let u = i.slice(r.prefix.length), [f, ...c] = u.split(".");
          if (r.mustHaveEmptyKey && f.length > 0)
            throw new Error(`'${i}' must have empty key`);
          if (r.mustNotEmptyKey && f.length === 0)
            throw new Error(`'${i}' must have non-empty key`);
          f.length && (f = f[0].toLowerCase() + f.slice(1));
          const l = c.map((d) => {
            const [w, ...g] = d.split("_");
            return { label: w, args: g };
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
          const b = [...r.preprocessors?.pre || [], ...ct, ...r.preprocessors?.post || []];
          for (const d of b) {
            if (n.has(d))
              continue;
            n.add(d);
            const w = [...a.matchAll(d.regexp)];
            if (w.length)
              for (const g of w) {
                if (!g.groups)
                  continue;
                const { groups: $ } = g, { whole: R } = $;
                a = a.replace(R, d.replacer($));
              }
          }
          const { store: E, reactivity: L, actions: _, refs: p } = this, h = {
            store: E,
            mergeStore: this.mergeStore.bind(this),
            applyPlugins: this.applyPlugins.bind(this),
            cleanupElementRemovals: this.cleanupElementRemovals.bind(this),
            walkSignals: this.walkSignals.bind(this),
            actions: _,
            refs: p,
            reactivity: L,
            el: o,
            key: f,
            expression: a,
            expressionFn: () => {
              throw new Error("Expression function not created");
            },
            JSONParse: this.JSONParse,
            JSONStringify: this.JSONStringify,
            modifiers: y
          };
          if (!r.bypassExpressionFunctionCreation?.(h) && !r.mustHaveEmptyExpression && a.length) {
            const d = a.split(";");
            d[d.length - 1] = `return ${d[d.length - 1]}`;
            const w = `
try {
  ${d.join(";")}
} catch (e) {
  throw new Error(\`Eval '${a}' on ${o.id ? `#${o.id}` : o.tagName}\`)
}
            `;
            try {
              const g = new Function("ctx", w);
              h.expressionFn = g;
            } catch (g) {
              console.error(g);
              return;
            }
          }
          const S = r.onLoad(h);
          S && (this.removals.has(o) || this.removals.set(o, /* @__PURE__ */ new Set()), this.removals.get(o).add(S));
        }
      });
    });
  }
  walkSignalsStore(e, n) {
    const r = Object.keys(e);
    for (let s = 0; s < r.length; s++) {
      const o = r[s], i = e[o], a = i instanceof v, u = typeof i == "object" && Object.keys(i).length > 0;
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
    const s = Ie(e);
    if (s)
      for (n(s), r = 0, e = e.firstElementChild; e; )
        this.walkDownDOM(e, n, r++), e = e.nextElementSibling;
  }
}
const ht = (t) => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, n) => (n ? "-" : "") + e.toLowerCase()), mt = {
  prefix: "bind",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => t.reactivity.effect(() => {
    const e = ht(t.key), r = `${t.expressionFn(t)}`;
    !r || r === "false" || r === "null" || r === "undefined" ? t.el.removeAttribute(e) : t.el.setAttribute(e, r);
  })
}, gt = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/, G = ["change", "input", "keydown"], vt = {
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
    const { store: e, el: n, expression: r } = t, s = t.expressionFn(t), o = n.tagName.toLowerCase().includes("input"), i = n.tagName.toLowerCase().includes("select"), a = n.tagName.toLowerCase().includes("textarea"), u = n.tagName.toLowerCase().includes("radio"), f = n.getAttribute("type"), c = o && f === "checkbox", l = o && f === "file";
    if (!o && !i && !a && !c && !u)
      throw new Error("Element must be input, select, textarea, checkbox or radio");
    const y = () => {
      if (!s)
        throw new Error(`Signal ${r} not found`);
      const p = s.value;
      if (o) {
        const h = n;
        c ? h.checked = p : l || (h.value = `${p}`);
      } else
        "value" in n ? n.value = `${p}` : n.setAttribute("value", `${p}`);
    }, b = t.reactivity.effect(y), E = () => {
      const p = n.value;
      if (!(typeof p > "u"))
        if (l) {
          const [h] = n?.files || [];
          if (!h) {
            s.value = "";
            return;
          }
          const S = new FileReader();
          S.onload = () => {
            if (typeof S.result != "string")
              throw new Error("Unsupported type");
            const w = S.result.match(gt);
            if (!w?.groups)
              throw new Error("Invalid data URI");
            const { mime: g, contents: $ } = w.groups;
            s.value = $;
            const R = `${r}Mime`;
            if (R in e) {
              const x = e[`${R}`];
              x.value = g;
            }
          }, S.readAsDataURL(h);
          const d = `${r}Name`;
          if (d in e) {
            const w = e[`${d}`];
            w.value = h.name;
          }
          return;
        } else {
          const h = s.value;
          if (typeof h == "number")
            s.value = Number(p);
          else if (typeof h == "string")
            s.value = p;
          else if (typeof h == "boolean")
            if (c) {
              const { checked: S } = n;
              s.value = S;
            } else
              s.value = !!p;
          else if (!(typeof h > "u"))
            if (typeof h == "bigint")
              s.value = BigInt(p);
            else
              throw console.log(typeof h), new Error("Unsupported type");
        }
    }, L = n.tagName.split("-");
    if (L.length > 1) {
      const p = L[0].toLowerCase();
      G.forEach((h) => {
        G.push(`${p}-${h}`);
      });
    }
    return G.forEach((p) => n.addEventListener(p, E)), () => {
      b(), G.forEach((p) => n.removeEventListener(p, E));
    };
  }
}, yt = {
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
      const f = we(o), c = K(o, "leading", !1), l = K(o, "noTrail", !0);
      s = Et(s, f, c, l);
    }
    const i = t.modifiers.get("throttle");
    if (i) {
      const f = we(i), c = K(i, "noLead", !0), l = K(i, "noTrail", !0);
      s = St(s, f, c, l);
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
}, wt = {
  prefix: "focus",
  mustHaveEmptyKey: !0,
  mustHaveEmptyExpression: !0,
  onLoad: (t) => (t.el.tabIndex || t.el.setAttribute("tabindex", "0"), t.el.focus(), t.el.scrollIntoView({ block: "center", inline: "center" }), () => t.el.blur())
}, bt = [
  mt,
  vt,
  yt,
  wt,
  // PromptPlugin,
  _t
];
function we(t) {
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
function K(t, e, n = !1) {
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
function St(t, e, n = !0, r = !1) {
  let s = !1, o = null;
  return function(...a) {
    s ? o = a : (s = !0, n ? t(...a) : o = a, setTimeout(() => {
      r && o && (t(...o), o = null), s = !1;
    }, e));
  };
}
const Z = /* @__PURE__ */ new WeakSet();
function Tt(t, e, n = {}) {
  t instanceof Document && (t = t.documentElement);
  let r;
  typeof e == "string" ? r = Mt(e) : r = e;
  const s = Pt(r), o = Lt(t, s, n);
  return qe(t, s, o);
}
function qe(t, e, n) {
  if (n.head.block) {
    const r = t.querySelector("head"), s = e.querySelector("head");
    if (r && s) {
      const o = Ke(s, r, n);
      Promise.all(o).then(() => {
        qe(
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
    return Ge(e, t, n), t.children;
  if (n.morphStyle === "outerHTML" || n.morphStyle == null) {
    const r = Rt(e, t, n);
    if (!r)
      throw new Error("Could not find best match");
    const s = r?.previousSibling, o = r?.nextSibling, i = X(t, r, n);
    return r ? $t(s, i, o) : [];
  } else
    throw "Do not understand how to morph style " + n.morphStyle;
}
function X(t, e, n) {
  if (!(n.ignoreActive && t === document.activeElement))
    if (e == null) {
      if (n.callbacks.beforeNodeRemoved(t) === !1)
        return;
      t.remove(), n.callbacks.afterNodeRemoved(t);
      return;
    } else {
      if (Q(t, e))
        return n.callbacks.beforeNodeMorphed(t, e) === !1 ? void 0 : (t instanceof HTMLHeadElement && n.head.ignore || (e instanceof HTMLHeadElement && t instanceof HTMLHeadElement && n.head.style !== "morph" ? Ke(e, t, n) : (At(e, t), Ge(e, t, n))), n.callbacks.afterNodeMorphed(t, e), t);
      if (n.callbacks.beforeNodeRemoved(t) === !1 || n.callbacks.beforeNodeAdded(e) === !1)
        return;
      if (!t.parentElement)
        throw new Error("oldNode has no parentElement");
      return t.parentElement.replaceChild(e, t), n.callbacks.afterNodeAdded(e), n.callbacks.afterNodeRemoved(t), e;
    }
}
function Ge(t, e, n) {
  let r = t.firstChild, s = e.firstChild, o;
  for (; r; ) {
    if (o = r, r = o.nextSibling, s == null) {
      if (n.callbacks.beforeNodeAdded(o) === !1)
        return;
      e.appendChild(o), n.callbacks.afterNodeAdded(o), C(n, o);
      continue;
    }
    if (We(o, s, n)) {
      X(s, o, n), s = s.nextSibling, C(n, o);
      continue;
    }
    let i = Nt(t, e, o, s, n);
    if (i) {
      s = be(s, i, n), X(i, o, n), C(n, o);
      continue;
    }
    let a = kt(t, o, s, n);
    if (a) {
      s = be(s, a, n), X(a, o, n), C(n, o);
      continue;
    }
    if (n.callbacks.beforeNodeAdded(o) === !1)
      return;
    e.insertBefore(o, s), n.callbacks.afterNodeAdded(o), C(n, o);
  }
  for (; s !== null; ) {
    let i = s;
    s = s.nextSibling, ze(i, n);
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
function Ke(t, e, n) {
  const r = [], s = [], o = [], i = [], a = n.head.style, u = /* @__PURE__ */ new Map();
  for (const c of t.children)
    u.set(c.outerHTML, c);
  for (const c of e.children) {
    let l = u.has(c.outerHTML), y = n.head.shouldReAppend(c), b = n.head.shouldPreserve(c);
    l || b ? y ? s.push(c) : (u.delete(c.outerHTML), o.push(c)) : a === "append" ? y && (s.push(c), i.push(c)) : n.head.shouldRemove(c) !== !1 && s.push(c);
  }
  i.push(...u.values()), console.log("to append: ", i);
  const f = [];
  for (const c of i) {
    console.log("adding: ", c);
    const l = document.createRange().createContextualFragment(c.outerHTML).firstChild;
    if (!l)
      throw new Error("could not create new element from: " + c.outerHTML);
    if (console.log(l), n.callbacks.beforeNodeAdded(l)) {
      if (l.hasAttribute("href") || l.hasAttribute("src")) {
        let y;
        const b = new Promise((E) => {
          y = E;
        });
        l.addEventListener("load", function() {
          y(void 0);
        }), f.push(b);
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
    idMap: Ht(t, e),
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
function We(t, e, n) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName ? t?.id?.length && t.id === e.id ? !0 : V(n, t, e) > 0 : !1;
}
function Q(t, e) {
  return !t || !e ? !1 : t.nodeType === e.nodeType && t.tagName === e.tagName;
}
function be(t, e, n) {
  for (; t !== e; ) {
    const r = t;
    if (t = t?.nextSibling, !r)
      throw new Error("tempNode is null");
    ze(r, n);
  }
  return C(n, e), e.nextSibling;
}
function Nt(t, e, n, r, s) {
  const o = V(s, n, e);
  let i = null;
  if (o > 0) {
    i = r;
    let a = 0;
    for (; i != null; ) {
      if (We(n, i, s))
        return i;
      if (a += V(s, i, t), a > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function kt(t, e, n, r) {
  let s = n, o = e.nextSibling, i = 0;
  for (; s && o; ) {
    if (V(r, s, t) > 0)
      return null;
    if (Q(e, s))
      return s;
    if (Q(o, s) && (i++, o = o.nextSibling, i >= 2))
      return null;
    s = s.nextSibling;
  }
  return s;
}
const Ee = new DOMParser();
function Mt(t) {
  const e = t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (e.match(/<\/html>/) || e.match(/<\/head>/) || e.match(/<\/body>/)) {
    const n = Ee.parseFromString(t, "text/html");
    if (e.match(/<\/html>/))
      return Z.add(n), n;
    {
      let r = n.firstChild;
      return r ? (Z.add(r), r) : null;
    }
  } else {
    const r = Ee.parseFromString(`<body><template>${t}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!r)
      throw new Error("content is null");
    return Z.add(r), r;
  }
}
function Pt(t) {
  if (t == null)
    return document.createElement("div");
  if (Z.has(t))
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
function Rt(t, e, n) {
  let r = t.firstChild, s = r, o = 0;
  for (; r; ) {
    let i = Ct(r, e, n);
    i > o && (s = r, o = i), r = r.nextSibling;
  }
  return s;
}
function Ct(t, e, n) {
  return Q(t, e) ? 0.5 + V(n, t, e) : 0;
}
function ze(t, e) {
  C(e, t), e.callbacks.beforeNodeRemoved(t) !== !1 && (t.remove(), e.callbacks.afterNodeRemoved(t));
}
function Ot(t, e) {
  return !t.deadIds.has(e);
}
function It(t, e, n) {
  return t.idMap.get(n)?.has(e) || !1;
}
function C(t, e) {
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
    Ot(t, o) && It(t, o, n) && ++s;
  return s;
}
function Se(t, e) {
  const n = t.parentElement, r = t.querySelectorAll("[id]");
  for (const s of r) {
    let o = s;
    for (; o !== n && o; ) {
      let i = e.get(o);
      i == null && (i = /* @__PURE__ */ new Set(), e.set(o, i)), i.add(s.id), o = o.parentElement;
    }
  }
}
function Ht(t, e) {
  const n = /* @__PURE__ */ new Map();
  return Se(t, n), Se(e, n), n;
}
const xt = "get", Dt = "post", Ft = "put", Ut = "patch", Bt = "delete", Vt = [xt, Dt, Ft, Ut, Bt], jt = Vt.reduce((t, e) => (t[e] = async (n) => {
  const r = Document;
  if (!r.startViewTransition) {
    await Ae(e, n);
    return;
  }
  return new Promise((s) => {
    r.startViewTransition(async () => {
      await Ae(e, n), s();
    });
  });
}, t), {}), Jt = "Accept", qt = "Content-Type", Gt = "datastar-request", Kt = "application/json", Wt = "text/event-stream", zt = "true", j = "datastar-", J = `${j}indicator`, ue = `${J}-loading`, Te = `${j}settling`, z = `${j}swapping`, Zt = "self", T = {
  MorphElement: "morph_element",
  InnerElement: "inner_element",
  OuterElement: "outer_element",
  PrependElement: "prepend_element",
  AppendElement: "append_element",
  BeforeElement: "before_element",
  AfterElement: "after_element",
  DeleteElement: "delete_element",
  UpsertAttributes: "upsert_attributes"
}, Xt = {
  prefix: "header",
  mustNotEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onLoad: (t) => {
    const e = t.store.fetch.headers, n = t.key[0].toUpperCase() + t.key.slice(1);
    return e[n] = t.reactivity.computed(() => t.expressionFn(t)), () => {
      delete e[n];
    };
  }
}, Yt = {
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
}, Qt = {
  prefix: "fetchIndicator",
  mustHaveEmptyKey: !0,
  mustNotEmptyExpression: !0,
  onGlobalInit: () => {
    const t = document.createElement("style");
    t.innerHTML = `
.${J}{
 opacity:0;
 transition: opacity 300ms ease-out;
}
.${ue} {
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
    return n.classList.add(J), () => {
      delete t.store.fetch.indicatorSelectors[t.el.id];
    };
  })
}, en = [Xt, Yt, Qt], tn = /(?<key>\w*): (?<value>.*)/gm;
async function Ae(t, e) {
  const { el: n, store: r } = e, s = r.fetch.elementURLs[n.id];
  if (!s)
    return;
  const o = { ...r };
  delete o.fetch;
  const i = pe(o);
  let a = n, u = !1;
  const f = r.fetch.indicatorSelectors[n.id];
  if (f) {
    const _ = document.querySelector(f);
    _ && (a = _, a.classList.remove(J), a.classList.add(ue), u = !0);
  }
  const c = new URL(s.value, window.location.origin), l = new Headers();
  l.append(Jt, Wt), l.append(qt, Kt), l.append(Gt, zt);
  const y = r.fetch.headers.value;
  if (y)
    for (const _ in y) {
      const p = y[_];
      l.append(_, p);
    }
  t = t.toUpperCase();
  const b = { method: t, headers: l };
  if (t === "GET") {
    const _ = new URLSearchParams(c.search);
    _.append("datastar", i), c.search = _.toString();
  } else
    b.body = i;
  const E = await fetch(c, b);
  if (!E.ok)
    throw new Error(`Response was not ok, url: ${c}, status: ${E.status}`);
  if (!E.body)
    throw new Error("No response body");
  const L = E.body.pipeThrough(new TextDecoderStream()).getReader();
  for (; ; ) {
    const { done: _, value: p } = await L.read();
    if (_)
      break;
    p.split(`

`).forEach((h) => {
      const S = [...h.matchAll(tn)];
      if (S.length) {
        let d = "", w = "morph_element", g = "", $ = 0, R = !1, x = "", re, me = !1, ge = !1;
        for (const ve of S) {
          if (!ve.groups)
            continue;
          const { key: Ze, value: k } = ve.groups;
          switch (Ze) {
            case "event":
              if (!k.startsWith(j))
                throw new Error(`Unknown event: ${k}`);
              switch (k.slice(j.length)) {
                case "redirect":
                  R = !0;
                  break;
                case "fragment":
                  ge = !0;
                  break;
                case "error":
                  me = !0;
                  break;
                default:
                  throw new Error(`Unknown event: ${k}`);
              }
              break;
            case "data":
              const se = k.indexOf(" ");
              if (se === -1)
                throw new Error("Missing space in data");
              const ye = k.slice(0, se), O = k.slice(se + 1);
              switch (ye) {
                case "selector":
                  g = O;
                  break;
                case "merge":
                  const _e = O;
                  if (!Object.values(T).includes(_e))
                    throw new Error(`Unknown merge option: ${k}`);
                  w = _e;
                  break;
                case "settle":
                  $ = parseInt(O);
                  break;
                case "fragment":
                case "html":
                  d = O;
                  break;
                case "redirect":
                  x = O;
                  break;
                case "error":
                  re = new Error(O);
                  break;
                default:
                  throw new Error(`Unknown data type: ${ye}`);
              }
          }
        }
        if (me && re)
          throw re;
        if (R && x)
          window.location.href = x;
        else if (ge && d)
          nn(e, g, w, d, $);
        else
          throw new Error(`Unknown event block: ${h}`);
      }
    });
  }
  u && (a.classList.remove(ue), a.classList.add(J));
}
const Le = document.createElement("template");
function nn(t, e, n, r, s) {
  const { el: o } = t;
  Le.innerHTML = r;
  const i = Le.content.firstChild;
  if (!(i instanceof Element))
    throw new Error(`Fragment is not an element, source '${r}'`);
  const a = e === Zt;
  let u;
  if (a)
    u = [o];
  else {
    const f = e || `#${i.getAttribute("id")}`;
    if (u = document.querySelectorAll(f) || [], !u)
      throw new Error(`No target elements, selector: ${e}`);
  }
  for (const f of u) {
    f.classList.add(z);
    const c = f.outerHTML;
    let l = f;
    switch (n) {
      case T.MorphElement:
        const b = Tt(l, i);
        if (!b?.length)
          throw new Error("Failed to morph element");
        l = b[0];
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
          const _ = i.getAttribute(L);
          l.setAttribute(L, _);
        });
        break;
      default:
        throw new Error(`Unknown merge type: ${n}`);
    }
    l.classList.add(z), t.cleanupElementRemovals(f), t.applyPlugins(l), f.classList.remove(z), l.classList.remove(z);
    const y = l.outerHTML;
    c !== y && (l.classList.add(Te), setTimeout(() => {
      l.classList.remove(Te);
    }, s));
  }
}
const rn = {
  setAll: async (t, e, n) => {
    const r = new RegExp(e);
    t.walkSignals((s, o) => r.test(s) && (o.value = n));
  },
  toggleAll: async (t, e) => {
    const n = new RegExp(e);
    t.walkSignals((r, s) => n.test(r) && (s.value = !s.value));
  }
}, oe = "display", Ne = "none", ie = "important", sn = {
  prefix: "show",
  allowedModifiers: /* @__PURE__ */ new Set([ie]),
  onLoad: (t) => {
    const { el: e, modifiers: n, expressionFn: r } = t;
    return de(() => {
      const o = !!r(t), a = n.has(ie) ? ie : void 0;
      o ? e.style.length === 1 && e.style.display === Ne ? e.style.removeProperty(oe) : e.style.setProperty(oe, "", a) : e.style.setProperty(oe, Ne, a);
    });
  }
}, on = "intersects", ke = "once", Me = "half", Pe = "full", an = {
  prefix: on,
  allowedModifiers: /* @__PURE__ */ new Set([ke, Me, Pe]),
  mustHaveEmptyKey: !0,
  onLoad: (t) => {
    const { modifiers: e } = t, n = { threshold: 0 };
    e.has(Pe) ? n.threshold = 1 : e.has(Me) && (n.threshold = 0.5);
    const r = new IntersectionObserver((s) => {
      s.forEach((o) => {
        o.isIntersecting && (t.expressionFn(t), e.has(ke) && r.disconnect());
      });
    }, n);
    return r.observe(t.el), () => r.disconnect();
  }
}, $e = "prepend", Re = "append", Ce = new Error("Target element must have a parent if using prepend or append"), ln = {
  prefix: "teleport",
  allowedModifiers: /* @__PURE__ */ new Set([$e, Re]),
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
    if (Ie(o)?.firstElementChild)
      throw new Error("Empty template");
    if (n.has($e)) {
      if (!s.parentNode)
        throw Ce;
      s.parentNode.insertBefore(o, s);
    } else if (n.has(Re)) {
      if (!s.parentNode)
        throw Ce;
      s.parentNode.insertBefore(o, s.nextSibling);
    } else
      s.appendChild(o);
  }
}, cn = {
  prefix: "scrollIntoView",
  onLoad: (t) => {
    const { el: e } = t;
    e.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  }
}, Oe = "ds-view-transition-stylesheet", un = {
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
}, fn = [
  sn,
  an,
  ln,
  cn,
  un
];
function dn(t = {}, ...e) {
  const n = performance.now(), r = new pt(t, ...e);
  r.run();
  const s = performance.now();
  return console.log(`Datastar loaded and attached to all DOM elements in ${s - n}ms`), r;
}
function mn(t = {}, ...e) {
  const n = Object.assign({}, rn, jt, t), r = [...en, ...fn, ...bt, ...e];
  return dn(n, ...r);
}
export {
  pt as Datastar,
  dn as runDatastarWith,
  mn as runDatastarWithAllPlugins,
  Ie as toHTMLorSVGElement
};
//# sourceMappingURL=datastar.js.map
