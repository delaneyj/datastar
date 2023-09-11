function Se(e, t) {
  if (e)
    for (t(e), e = e.firstElementChild; e; )
      Se(e, t), e = e.nextElementSibling;
}
function Me(e, t) {
  e && (t(e), e = e.parentElement, Me(e, t));
}
function N(e) {
  const t = `return ${e}`;
  return new Function("el", "dataStack", "actions", t);
}
function xe(e, t, n, s) {
  const r = N(s);
  try {
    return r(e, t, n);
  } catch {
    console.error(`Error evaluating expression: ${s}`);
  }
}
function Oe(e) {
  return e.replace(/(?:^\w|[A-Z]|\b\w)/g, (t, n) => n === 0 ? t.toLowerCase() : t.toUpperCase()).replace(/\s+/g, "");
}
let D, w = null, v = 0, I = [], Z, U = !1;
const $ = 0, te = 1, R = 2;
function Y(e, t) {
  const n = new Te(e, t?.effect);
  return t?.equals && (n.equals = t.equals), n;
}
function Pe(e, t) {
  return e === t;
}
class Te {
  constructor(t, n = !1) {
    this.isEffect = n, typeof t == "function" ? (this.fn = t, this._value = void 0, this.isEffect = n || !1, this.state = R, n && (I.push(this), Z?.(this))) : (this.fn = void 0, this._value = t, this.state = $, this.isEffect = !1);
  }
  _value;
  fn;
  observers = null;
  // nodes that have us as sources (down links)
  sources = null;
  // sources in reference order, not deduplicated (up links)
  state;
  cleanups = [];
  equals = Pe;
  get value() {
    return this.get();
  }
  set value(t) {
    this.set(t);
  }
  get() {
    return D && (!w && D.sources && D.sources[v] == this ? v++ : w ? w.push(this) : w = [this]), this.fn && this.updateIfNecessary(), this._value;
  }
  set(t) {
    if (typeof t == "function") {
      const n = t;
      n !== this.fn && this.stale(R), this.fn = n;
    } else {
      this.fn && (this.removeParentObservers(0), this.sources = null, this.fn = void 0);
      const n = t;
      if (!this.equals(this._value, n)) {
        if (this.observers)
          for (let s = 0; s < this.observers.length; s++)
            this.observers[s].stale(R);
        this._value = n;
      }
    }
  }
  stale(t) {
    if (this.state < t && (this.state === $ && this.isEffect && (I.push(this), Z?.(this)), this.state = t, this.observers))
      for (let n = 0; n < this.observers.length; n++)
        this.observers[n].stale(te);
  }
  /** run the computation fn, updating the cached value */
  update() {
    const t = this._value, n = D, s = w, r = v;
    D = this, w = null, v = 0;
    try {
      if (this.cleanups.length && (this.cleanups.forEach((o) => o(this._value)), this.cleanups = []), this._value = this.fn(), w) {
        if (this.removeParentObservers(v), this.sources && v > 0) {
          this.sources.length = v + w.length;
          for (let o = 0; o < w.length; o++)
            this.sources[v + o] = w[o];
        } else
          this.sources = w;
        for (let o = v; o < this.sources.length; o++) {
          const i = this.sources[o];
          i.observers ? i.observers.push(this) : i.observers = [this];
        }
      } else
        this.sources && v < this.sources.length && (this.removeParentObservers(v), this.sources.length = v);
    } finally {
      w = s, D = n, v = r;
    }
    if (!this.equals(t, this._value) && this.observers)
      for (let o = 0; o < this.observers.length; o++) {
        const i = this.observers[o];
        i.state = R;
      }
    this.state = $;
  }
  /** update() if dirty, or a parent turns out to be dirty. */
  updateIfNecessary() {
    if (this.state === te) {
      for (const t of this.sources)
        if (t.updateIfNecessary(), this.state === R)
          break;
    }
    this.state === R && this.update(), this.state = $;
  }
  removeParentObservers(t) {
    if (this.sources)
      for (let n = t; n < this.sources.length; n++) {
        const s = this.sources[n], r = s.observers.findIndex((o) => o === this);
        s.observers[r] = s.observers[s.observers.length - 1], s.observers.pop();
      }
  }
}
function $e(e) {
  D ? D.cleanups.push(e) : console.error("onCleanup must be called from within a @reactive function");
}
function He() {
  for (let e = 0; e < I.length; e++)
    I[e].get();
  I.length = 0;
}
function qe(e = Fe) {
  Z = e;
}
function Fe() {
  U || (U = !0, queueMicrotask(() => {
    U = !1, He();
  }));
}
qe();
function _e(e) {
  return Y(e);
}
function Ge(e) {
  return Y(e);
}
function ze(e) {
  return Y(e, { effect: !0 });
}
const Be = new MutationObserver((e) => {
  for (const t of e)
    t.removedNodes.forEach((n) => {
      const s = n;
      s && J.delete(s);
    }), t.addedNodes.forEach((n) => {
      const s = n;
      s && Ae.forEach((r) => r(s));
    });
});
Be.observe(document, {
  attributes: !0,
  childList: !0,
  subtree: !0
});
function ne({ regexp: e, replacer: t }, n) {
  const s = [...n.matchAll(e)];
  if (!s.length)
    return n;
  for (const r of s) {
    if (!r.groups)
      continue;
    const { groups: o } = r, { whole: i } = o;
    n = n.replace(i, t(o));
  }
  return n;
}
function Ue(e, t = 0) {
  let n = 3735928559 ^ t, s = 1103547991 ^ t;
  for (let r = 0, o; r < e.length; r++)
    o = e.charCodeAt(r), n = Math.imul(n ^ o, 2654435761), s = Math.imul(s ^ o, 1597334677);
  return n = Math.imul(n ^ n >>> 16, 2246822507), n ^= Math.imul(s ^ s >>> 13, 3266489909), s = Math.imul(s ^ s >>> 16, 2246822507), s ^= Math.imul(n ^ n >>> 13, 3266489909), 4294967296 * (2097151 & s) + (n >>> 0);
}
const q = /* @__PURE__ */ new Map(), Ae = /* @__PURE__ */ new Map(), J = /* @__PURE__ */ new Map(), se = new Array(), X = /* @__PURE__ */ new Map(), K = {};
function b(e, t) {
  if (e.toLowerCase() !== e)
    throw Error(`Data extension 'data-${e}' must be lowercase`);
  if (q.has(e))
    throw new Error(`Data extension 'data-${e}' already registered`);
  const n = Ue(e);
  q.set(e, n), t || (t = {});
  for (const l of t.requiredExtensions || [])
    if (l === e)
      throw new Error(`Data extension 'data-${e}' cannot require itself`);
  const s = new Set(q.keys());
  for (const l of t.requiredExtensions || [])
    if (!s.has(l))
      throw new Error(`Data extension 'data-${e}' can't be a duplicate`);
  typeof t?.isPreprocessGlobal > "u" && (t.isPreprocessGlobal = !0), t?.preprocessExpressions && t.isPreprocessGlobal && se.push(...t.preprocessExpressions);
  const r = [];
  if (t?.allowedModifiers)
    for (const l of t.allowedModifiers) {
      const c = l instanceof RegExp ? l : new RegExp(l);
      r.push(c);
    }
  const o = new Set([...t?.allowedTags || []].map((l) => l.toLowerCase()));
  function i(l) {
    Se(l, (c) => {
      const u = x(c);
      if (!u)
        return;
      let a = J.get(u);
      if (a || (a = /* @__PURE__ */ new Set(), J.set(u, a)), !a.has(n)) {
        if (a.add(n), o.size) {
          const m = u.tagName.toLowerCase();
          if (!o.has(m))
            return;
        }
        for (var f in u.dataset) {
          if (!f.startsWith(e))
            continue;
          let [m, ...p] = f.split(".");
          const d = e.length, g = d + 1;
          m = m.slice(d, g).toLocaleLowerCase() + m.slice(g);
          const y = p.map((E) => {
            const [h, ...C] = E.split(":");
            if (!r.some((ee) => ee.test(h)))
              throw new Error(`Modifier ${h} is not allowed for ${m}`);
            return { label: h, args: C };
          }), T = Ve(u);
          let A = u.dataset[f] || "";
          for (const E of se)
            A = ne(E, A);
          if (t?.preprocessExpressions && !t?.isPreprocessGlobal)
            for (const E of t.preprocessExpressions)
              A = ne(E, A);
          const S = X.get(u) || {};
          if (t?.withExpression) {
            const E = t.withExpression({
              name: m,
              expression: A,
              el: u,
              dataStack: T,
              reactivity: {
                signal: _e,
                computed: Ge,
                effect: ze,
                onCleanup: $e
              },
              withMod: (h) => We(y, h),
              hasMod: (h) => je(y, h),
              actions: K
            });
            E && Object.assign(S, E);
          }
          X.set(u, S);
        }
      }
    });
  }
  i(document.body), Ae.set(n, i);
}
function Ve(e) {
  const t = [];
  Me(e, (s) => {
    const r = X.get(s);
    r && t.push(r);
  }), t.reverse();
  const n = {};
  for (const s of t)
    for (const r in s)
      n[r] || (n[r] = {}), Object.assign(n[r], s[r]);
  return n;
}
function x(e) {
  return e instanceof HTMLElement || e instanceof SVGElement ? e : null;
}
function je(e, t) {
  return e.some((n) => n.label === t);
}
function We(e, t) {
  return e.find((n) => n.label === t);
}
function Ze(e) {
  const { name: t, fn: n, requiredExtensions: s } = e, r = [Q, ...s || []];
  if (t != Oe(t))
    throw new Error("must be camelCase");
  for (const o of r) {
    if (!q.has(o))
      throw new Error(`requires '@${t}' registration`);
    if (t in K)
      throw new Error(`'@${t}' already registered`);
    K[t] = n;
  }
}
let Je = 0;
function Xe() {
  return Je++;
}
const Q = "action";
function Ke() {
  b(Q, {
    preprocessExpressions: [
      {
        name: "action",
        description: "turns @action(args) into actions.action(args)",
        regexp: new RegExp(/(?<whole>@(?<action>[a-zA-Z_$][0-9a-zA-Z_$]*)(?<call>\((?<args>.*)\))?)/g),
        replacer: ({ action: e, args: t }) => `actions.${e}({el,dataStack, actions}, ${t || ""})`
      }
    ]
  });
}
const Ye = "bind";
function Qe() {
  b(Ye, {
    requiredExtensions: [M],
    withExpression: ({ el: e, name: t, expression: n, dataStack: s, actions: r, reactivity: { effect: o } }) => {
      const i = N(n);
      return {
        bind: {
          [t]: o(() => {
            if (!s?.signals)
              return;
            const c = i(e, s, r);
            e.setAttribute(t, `${c}`);
          })
        }
      };
    }
  });
}
const et = "focus";
function tt() {
  b(et, {
    requiredExtensions: [M],
    withExpression: ({ el: e }) => {
      const t = x(e);
      if (!t?.focus)
        throw new Error("Element must have a focus method");
      return t.focus(), {};
    }
  });
}
const F = /* @__PURE__ */ new WeakSet();
function nt(e, t, n = {}) {
  e instanceof Document && (e = e.documentElement);
  let s;
  typeof t == "string" ? s = at(t) : s = t;
  const r = lt(s), o = rt(e, r, n);
  return Le(e, r, o);
}
function Le(e, t, n) {
  if (n.head.block) {
    const s = e.querySelector("head"), r = t.querySelector("head");
    if (s && r) {
      const o = ke(r, s, n);
      Promise.all(o).then(() => {
        Le(
          e,
          t,
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
    return De(t, e, n), e.children;
  if (n.morphStyle === "outerHTML" || n.morphStyle == null) {
    const s = ut(t, e, n);
    if (!s)
      throw new Error("Could not find best match");
    const r = s?.previousSibling, o = s?.nextSibling, i = _(e, s, n);
    return s ? ct(r, i, o) : [];
  } else
    throw "Do not understand how to morph style " + n.morphStyle;
}
function _(e, t, n) {
  if (!(n.ignoreActive && e === document.activeElement))
    if (t == null) {
      if (n.callbacks.beforeNodeRemoved(e) === !1)
        return;
      e.remove(), n.callbacks.afterNodeRemoved(e);
      return;
    } else {
      if (G(e, t))
        return n.callbacks.beforeNodeMorphed(e, t) === !1 ? void 0 : (e instanceof HTMLHeadElement && n.head.ignore || (t instanceof HTMLHeadElement && e instanceof HTMLHeadElement && n.head.style !== "morph" ? ke(t, e, n) : (st(t, e), De(t, e, n))), n.callbacks.afterNodeMorphed(e, t), e);
      if (n.callbacks.beforeNodeRemoved(e) === !1 || n.callbacks.beforeNodeAdded(t) === !1)
        return;
      if (!e.parentElement)
        throw new Error("oldNode has no parentElement");
      return e.parentElement.replaceChild(t, e), n.callbacks.afterNodeAdded(t), n.callbacks.afterNodeRemoved(e), t;
    }
}
function De(e, t, n) {
  let s = e.firstChild, r = t.firstChild, o;
  for (; s; ) {
    if (o = s, s = o.nextSibling, r == null) {
      if (n.callbacks.beforeNodeAdded(o) === !1)
        return;
      t.appendChild(o), n.callbacks.afterNodeAdded(o), k(n, o);
      continue;
    }
    if (Ne(o, r, n)) {
      _(r, o, n), r = r.nextSibling, k(n, o);
      continue;
    }
    let i = ot(e, t, o, r, n);
    if (i) {
      r = re(r, i, n), _(i, o, n), k(n, o);
      continue;
    }
    let l = it(e, o, r, n);
    if (l) {
      r = re(r, l, n), _(l, o, n), k(n, o);
      continue;
    }
    if (n.callbacks.beforeNodeAdded(o) === !1)
      return;
    t.insertBefore(o, r), n.callbacks.afterNodeAdded(o), k(n, o);
  }
  for (; r !== null; ) {
    let i = r;
    r = r.nextSibling, Ce(i, n);
  }
}
function st(e, t) {
  let n = e.nodeType;
  if (n === 1) {
    for (const s of e.attributes)
      t.getAttribute(s.name) !== s.value && t.setAttribute(s.name, s.value);
    for (const s of t.attributes)
      e.hasAttribute(s.name) || t.removeAttribute(s.name);
  }
  if ((n === Node.COMMENT_NODE || n === Node.TEXT_NODE) && t.nodeValue !== e.nodeValue && (t.nodeValue = e.nodeValue), e instanceof HTMLInputElement && t instanceof HTMLInputElement && e.type !== "file")
    t.value = e.value || "", H(e, t, "value"), H(e, t, "checked"), H(e, t, "disabled");
  else if (e instanceof HTMLOptionElement)
    H(e, t, "selected");
  else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) {
    const s = e.value, r = t.value;
    s !== r && (t.value = s), t.firstChild && t.firstChild.nodeValue !== s && (t.firstChild.nodeValue = s);
  }
}
function H(e, t, n) {
  const s = e.getAttribute(n), r = t.getAttribute(n);
  s !== r && (s ? t.setAttribute(n, s) : t.removeAttribute(n));
}
function ke(e, t, n) {
  const s = [], r = [], o = [], i = [], l = n.head.style, c = /* @__PURE__ */ new Map();
  for (const a of e.children)
    c.set(a.outerHTML, a);
  for (const a of t.children) {
    let f = c.has(a.outerHTML), m = n.head.shouldReAppend(a), p = n.head.shouldPreserve(a);
    f || p ? m ? r.push(a) : (c.delete(a.outerHTML), o.push(a)) : l === "append" ? m && (r.push(a), i.push(a)) : n.head.shouldRemove(a) !== !1 && r.push(a);
  }
  i.push(...c.values()), console.log("to append: ", i);
  const u = [];
  for (const a of i) {
    console.log("adding: ", a);
    const f = document.createRange().createContextualFragment(a.outerHTML).firstChild;
    if (!f)
      throw new Error("could not create new element from: " + a.outerHTML);
    if (console.log(f), n.callbacks.beforeNodeAdded(f)) {
      if (f.hasAttribute("href") || f.hasAttribute("src")) {
        let m;
        const p = new Promise((d) => {
          m = d;
        });
        f.addEventListener("load", function() {
          m(void 0);
        }), u.push(p);
      }
      t.appendChild(f), n.callbacks.afterNodeAdded(f), s.push(f);
    }
  }
  for (const a of r)
    n.callbacks.beforeNodeRemoved(a) !== !1 && (t.removeChild(a), n.callbacks.afterNodeRemoved(a));
  return n.head.afterHeadMorphed(t, {
    added: s,
    kept: o,
    removed: r
  }), u;
}
function L() {
}
function rt(e, t, n) {
  return {
    target: e,
    newContent: t,
    config: n,
    morphStyle: n.morphStyle,
    ignoreActive: n.ignoreActive,
    idMap: pt(e, t),
    deadIds: /* @__PURE__ */ new Set(),
    callbacks: Object.assign(
      {
        beforeNodeAdded: L,
        afterNodeAdded: L,
        beforeNodeMorphed: L,
        afterNodeMorphed: L,
        beforeNodeRemoved: L,
        afterNodeRemoved: L
      },
      n.callbacks
    ),
    head: Object.assign(
      {
        style: "merge",
        shouldPreserve: (s) => s.getAttribute("im-preserve") === "true",
        shouldReAppend: (s) => s.getAttribute("im-re-append") === "true",
        shouldRemove: L,
        afterHeadMorphed: L
      },
      n.head
    )
  };
}
function Ne(e, t, n) {
  return !e || !t ? !1 : e.nodeType === t.nodeType && e.tagName === t.tagName ? e?.id?.length && e.id === t.id ? !0 : O(n, e, t) > 0 : !1;
}
function G(e, t) {
  return !e || !t ? !1 : e.nodeType === t.nodeType && e.tagName === t.tagName;
}
function re(e, t, n) {
  for (; e !== t; ) {
    const s = e;
    if (e = e?.nextSibling, !s)
      throw new Error("tempNode is null");
    Ce(s, n);
  }
  return k(n, t), t.nextSibling;
}
function ot(e, t, n, s, r) {
  const o = O(r, n, t);
  let i = null;
  if (o > 0) {
    i = s;
    let l = 0;
    for (; i != null; ) {
      if (Ne(n, i, r))
        return i;
      if (l += O(r, i, e), l > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function it(e, t, n, s) {
  let r = n, o = t.nextSibling, i = 0;
  for (; r && o; ) {
    if (O(s, r, e) > 0)
      return null;
    if (G(t, r))
      return r;
    if (G(o, r) && (i++, o = o.nextSibling, i >= 2))
      return null;
    r = r.nextSibling;
  }
  return r;
}
const oe = new DOMParser();
function at(e) {
  const t = e.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (t.match(/<\/html>/) || t.match(/<\/head>/) || t.match(/<\/body>/)) {
    const n = oe.parseFromString(e, "text/html");
    if (t.match(/<\/html>/))
      return F.add(n), n;
    {
      let s = n.firstChild;
      return s ? (F.add(s), s) : null;
    }
  } else {
    const s = oe.parseFromString(`<body><template>${e}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!s)
      throw new Error("content is null");
    return F.add(s), s;
  }
}
function lt(e) {
  if (e == null)
    return document.createElement("div");
  if (F.has(e))
    return e;
  if (e instanceof Node) {
    const t = document.createElement("div");
    return t.append(e), t;
  } else {
    const t = document.createElement("div");
    for (const n of [...e])
      t.append(n);
    return t;
  }
}
function ct(e, t, n) {
  const s = [], r = [];
  for (; e; )
    s.push(e), e = e.previousSibling;
  for (; s.length > 0; ) {
    const o = s.pop();
    r.push(o), t?.parentElement?.insertBefore(o, t);
  }
  for (r.push(t); n; )
    s.push(n), r.push(n), n = n.nextSibling;
  for (; s.length; )
    t?.parentElement?.insertBefore(s.pop(), t.nextSibling);
  return r;
}
function ut(e, t, n) {
  let s = e.firstChild, r = s, o = 0;
  for (; s; ) {
    let i = ft(s, t, n);
    i > o && (r = s, o = i), s = s.nextSibling;
  }
  return r;
}
function ft(e, t, n) {
  return G(e, t) ? 0.5 + O(n, e, t) : 0;
}
function Ce(e, t) {
  k(t, e), t.callbacks.beforeNodeRemoved(e) !== !1 && (e.remove(), t.callbacks.afterNodeRemoved(e));
}
function dt(e, t) {
  return !e.deadIds.has(t);
}
function ht(e, t, n) {
  return e.idMap.get(n)?.has(t) || !1;
}
function k(e, t) {
  const n = e.idMap.get(t);
  if (n)
    for (const s of n)
      e.deadIds.add(s);
}
function O(e, t, n) {
  const s = e.idMap.get(t);
  if (!s)
    return 0;
  let r = 0;
  for (const o of s)
    dt(e, o) && ht(e, o, n) && ++r;
  return r;
}
function ie(e, t) {
  const n = e.parentElement, s = e.querySelectorAll("[id]");
  for (const r of s) {
    let o = r;
    for (; o !== n && o; ) {
      let i = t.get(o);
      i == null && (i = /* @__PURE__ */ new Set(), t.set(o, i)), i.add(r.id), o = o.parentElement;
    }
  }
}
function pt(e, t) {
  const n = /* @__PURE__ */ new Map();
  return ie(e, n), ie(t, n), n;
}
const mt = new DOMParser(), Re = "datastar", V = `${Re}-indicator`, z = `${Re}-request`, Et = "Accept", ae = "text/html", vt = "Content-Type", wt = "application/json", gt = "selector", bt = "swap", Ie = "get", yt = () => P(Ie), St = "post", Mt = () => P(St), Tt = "put", At = () => P(Tt), Lt = "patch", Dt = () => P(Lt), kt = "delete", Nt = () => P(kt), Ct = () => {
  yt(), Mt(), At(), Dt(), Nt();
};
let le = !1;
function P(e) {
  if (!le) {
    const t = document.createElement("style");
    t.innerHTML = `
.${V}{
  opacity:0;
  transition: opacity 500ms ease-in;
}
.${z} .${V}{
    opacity:1
}
.${z}.${V}{
    opacity:1
}
    `, document.head.appendChild(t), le = !0;
  }
  Ze({
    name: e,
    description: `turns @${e}(args) into fetch(${e}, args)`,
    fn: async (t) => Rt(e, t)
  });
}
async function Rt(e, t) {
  const { el: n, dataStack: s } = t, r = s.signals?.[e];
  if (!r)
    throw new Error(`No signal for ${e}`);
  const o = x(n);
  if (!o)
    throw new Error("Element must be an HTMLElement or SVGElement");
  o.classList.add(z);
  const i = new URL(r.value, window.location.origin), l = new Headers();
  if (l.append(Et, ae), l.append(vt, wt), s?.headers)
    for (let p in s.headers) {
      const d = s.headers[p];
      l.append(p, d.value);
    }
  const c = JSON.stringify(s, (p, d) => d instanceof Te ? d.isEffect ? void 0 : d.get() : d), u = { method: e, headers: l };
  if (e === Ie) {
    const p = new URLSearchParams(i.search);
    p.append("dataStack", c), i.search = p.toString();
  } else
    u.body = c;
  const a = await fetch(i, u);
  if (!a.ok)
    throw new Error("Network response was not ok.");
  const f = await a.text(), m = [...mt.parseFromString(f, ae).body.children];
  for (let p = 0; p < m.length; p++) {
    const d = m[p];
    if (!(d instanceof Element))
      throw new Error("Not an element");
    const g = x(d), y = d.getAttribute("id"), T = p === 0, A = !!y?.length, S = T && !A;
    let E;
    if (S)
      E = [n];
    else {
      if (!A)
        throw new Error("No id");
      const h = g?.dataset?.[gt] || `#${y}`;
      E = document.querySelectorAll(h) || [];
    }
    if (!E)
      throw new Error("No target element");
    for (const h of E)
      switch (g?.dataset?.[bt] || "morph") {
        case "morph":
          nt(h, d);
          break;
        case "inner":
          h.innerHTML = d.innerHTML;
          break;
        case "outer":
          h.outerHTML = d.outerHTML;
          break;
        case "prepend":
          h.prepend(d.outerHTML);
          break;
        case "append":
          h.append(d.outerHTML);
          break;
        case "before":
          h.before(d);
          break;
        case "after":
          h.after(d);
          break;
        case "delete":
          h.remove();
          break;
        default:
          throw new Error("Invalid merge mode");
      }
  }
  o.classList.remove(z);
}
const It = "model", ce = ["change", "input", "keydown"];
function xt() {
  b(It, {
    allowedTags: ["input", "textarea", "select"],
    requiredExtensions: [M],
    withExpression: ({ name: e, el: t, expression: n, dataStack: s, reactivity: { effect: r, onCleanup: o } }) => {
      const i = s.signals[n];
      if (!i)
        throw new Error(`Signal ${n} not found`);
      if (!("value" in t))
        throw new Error("Element must have a value property");
      t.value = i.value;
      const l = () => {
        const c = i.value;
        if (typeof c == "number")
          i.value = Number(t.value);
        else if (typeof c == "string")
          i.value = t.value;
        else if (typeof c == "boolean")
          i.value = !!t.value;
        else
          throw new Error("Unsupported type");
      };
      return {
        model: {
          [`${e}-${Xe()}`]: r(() => {
            t.value = i.value;
            for (const c of ce)
              t.addEventListener(c, l);
            o(() => {
              for (const c of ce)
                t.removeEventListener(c, l);
            });
          })
        }
      };
    }
  });
}
const Ot = "on", ue = "once", fe = "throttle", de = "debounce", he = "leading";
function Pt() {
  b(Ot, {
    requiredExtensions: [M],
    allowedModifiers: [ue, fe, de, he],
    withExpression: ({
      el: e,
      name: t,
      hasMod: n,
      withMod: s,
      expression: r,
      dataStack: o,
      reactivity: { computed: i, effect: l, onCleanup: c },
      actions: u
    }) => {
      const a = N(r), f = n(ue), m = s(fe), p = s(de), d = n(he);
      if (t === "load") {
        document.addEventListener("DOMContentLoaded", () => a(e, o, u), !0);
        return;
      }
      const g = () => a(e, o, u);
      let y = g, T;
      if (f)
        y = () => {
          g(), T && e.removeEventListener(t, T);
        };
      else if (m) {
        const [S] = m.args, E = S ? Number(S) : 1e3;
        let h = 0;
        const C = i(() => {
          const B = Date.now();
          if (B - h >= E)
            return h = B, g();
        });
        y = () => C.value;
      } else if (p) {
        const [S] = p.args, E = S ? Number(S) : 1e3;
        let h;
        const C = i(() => {
          d && !h && g(), clearTimeout(h), h = setTimeout(() => {
            d ? h = void 0 : g();
          }, E);
        });
        y = () => C.value;
      }
      return T = () => y(), e.addEventListener(t, T), {
        on: {
          [t]: l(() => {
            c(() => {
              f || e.removeEventListener(t, T);
            });
          })
        }
      };
    }
  });
}
const $t = "ref";
function Ht() {
  b($t, {
    requiredExtensions: [M],
    preprocessExpressions: [
      {
        name: "ref",
        description: "turns #ref into data.refs.ref.value",
        regexp: new RegExp(/(?<whole>\#(?<ref>[a-zA-Z_$][0-9a-zA-Z_$]*))/g),
        replacer: ({ ref: e }) => `data.refs.${e}.value`
      }
    ],
    withExpression: ({ el: e, name: t, reactivity: { signal: n } }) => ({
      refs: {
        [t]: n(e)
      }
    })
  });
}
const j = "important", W = "display", pe = "none", qt = "show";
function Ft() {
  b(qt, {
    requiredExtensions: [M],
    allowedModifiers: [j],
    withExpression: ({ el: e, name: t, dataStack: n, expression: s, hasMod: r, reactivity: { effect: o }, actions: i }) => {
      const l = N(s);
      if (!(e instanceof HTMLElement || e instanceof SVGElement))
        throw new Error("Element must have a style property");
      const u = r(j) ? j : void 0;
      return {
        show: {
          [t]: o(() => {
            !!l(e, n, i) ? e.style.length === 1 && e.style.display === pe ? e.style.removeProperty(W) : e.style.setProperty(W, "", u) : e.style.setProperty(W, pe, u);
          })
        }
      };
    }
  });
}
const M = "signal", me = "persist";
function _t() {
  b(M, {
    requiredExtensions: [Q],
    preprocessExpressions: [
      {
        name: "signal",
        description: "turns $signal into dataStack.signals.signal.value",
        regexp: new RegExp(/(?<whole>\$(?<signal>[a-zA-Z_$][0-9a-zA-Z_$]*))/g),
        replacer: ({ signal: e }) => `dataStack.${M}s.${e}.value`
      }
    ],
    allowedModifiers: [me],
    withExpression: ({ name: e, el: t, expression: n, reactivity: s, hasMod: r, actions: o }) => {
      const i = s.signal(xe(t, {}, o, n));
      if (r(me)) {
        const l = localStorage.getItem(e);
        if (l) {
          const c = JSON.parse(l);
          i.value = c;
        }
        s.effect(() => {
          const c = JSON.stringify(i.value);
          localStorage.setItem(e, c);
        });
      }
      return {
        signals: {
          [e]: i
        }
      };
    }
  });
}
const Ee = "prepend", ve = "append", we = "Target element must have a parent if using prepend or append", Gt = "teleport";
function zt() {
  b(Gt, {
    requiredExtensions: [M],
    allowedModifiers: [Ee, ve],
    withExpression: ({ name: e, el: t, expression: n, dataStack: s, reactivity: { effect: r }, hasMod: o, actions: i }) => {
      if (!(t instanceof HTMLTemplateElement))
        throw new Error("Element must be a template");
      const l = N(n);
      return {
        text: {
          [e]: r(() => {
            const u = l(t, s, i);
            if (typeof u != "string")
              throw new Error("Selector must be a string");
            const a = document.querySelector(u);
            if (!a)
              throw new Error(`Target element not found: ${u}`);
            if (!t.content)
              throw new Error("Template element must have content");
            const f = t.content.cloneNode(!0);
            if (x(f)?.firstElementChild)
              throw new Error("Empty template");
            if (o(Ee)) {
              if (!a.parentNode)
                throw new Error(we);
              a.parentNode.insertBefore(f, a);
            } else if (o(ve)) {
              if (!a.parentNode)
                throw new Error(we);
              a.parentNode.insertBefore(f, a.nextSibling);
            } else
              a.appendChild(f);
            a.appendChild(f);
          })
        }
      };
    }
  });
}
const Bt = "text";
function Ut() {
  b(Bt, {
    withExpression: ({ name: e, el: t, expression: n, dataStack: s, actions: r, reactivity: { effect: o } }) => {
      const i = N(n);
      return {
        text: {
          [e]: o(() => {
            if (!s?.signals)
              return;
            const c = i(t, s, r);
            t.textContent = `${c}`;
          })
        }
      };
    }
  });
}
const ge = "once", be = "full", ye = "half", Vt = "intersects";
function jt() {
  b(Vt, {
    requiredExtensions: [M],
    allowedModifiers: [ge, be, ye],
    withExpression: ({ name: e, el: t, expression: n, dataStack: s, actions: r, hasMod: o, reactivity: { effect: i, onCleanup: l } }) => {
      const c = N(n), u = () => c(t, s, r), a = { threshold: 0 };
      o(be) ? a.threshold = 1 : o(ye) && (a.threshold = 0.5);
      const f = new IntersectionObserver((p) => {
        p.forEach((d) => {
          d.isIntersecting && (u(), o(ge) && f.disconnect());
        });
      }, a);
      return {
        on: {
          [e]: i(() => {
            f.observe(t), l(() => {
              f.disconnect();
            });
          })
        }
      };
    }
  });
}
function Wt() {
  Ke(), _t(), Qe(), xt(), tt(), Ct(), Pt(), Ht(), Ft(), zt(), Ut();
}
function Zt(e) {
  console.warn("Overriding fetch with mock version, this should only be used in examples.");
  const t = async (n, s) => {
    const r = new Request(n, s);
    if (!(n instanceof URL))
      throw new Error("url must be a URL");
    const o = e[n.pathname];
    if (!o)
      throw new Error(`No mock route found for ${r.url}`);
    const i = o[r.method];
    if (!i)
      throw new Error(`No mock route found for ${r.method} ${r.url}`);
    let { html: l, status: c, statusText: u, headers: a } = await i(r);
    return a || (a = new Headers()), a.has("Content-Type") || a.append("Content-Type", "text/html"), c = c || 200, u = u || "OK", new Response(l, { status: c, statusText: u, headers: a });
  };
  window.fetch = t;
}
export {
  Ye as BIND,
  kt as DELETE,
  et as FOCUS,
  Ie as GET,
  Vt as INTERSECTS,
  Ot as ON,
  Lt as PATCH,
  St as POST,
  Tt as PUT,
  $t as REF,
  qt as SHOW,
  M as SIGNAL,
  Gt as TELEPORT,
  Bt as TEXT,
  Ct as addAllFragmentExtensions,
  Wt as addAllIncludedExtensions,
  Qe as addBindDataExtension,
  Nt as addDeleteExtension,
  tt as addFocusDataExtension,
  yt as addGetExtension,
  jt as addIntersectsExtension,
  Pt as addOnDataExtension,
  Dt as addPatchExtension,
  Mt as addPostExtension,
  At as addPutExtension,
  Ht as addRefDataExtension,
  Ft as addShowDataExtension,
  _t as addSignalDataExtension,
  zt as addTeleportDataExtension,
  Ut as addTextDataExtension,
  Oe as camelize,
  xe as functionEval,
  N as functionGenerator,
  Zt as injectMockFetch,
  Se as walkDownDOM,
  Me as walkUpDOM
};
//# sourceMappingURL=datastar.js.map
