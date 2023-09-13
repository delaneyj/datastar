function x(e, t) {
  if (e)
    for (t(e), e = e.firstElementChild; e; )
      x(e, t), e = e.nextElementSibling;
}
function Me(e, t) {
  e && (t(e), e = e.parentElement, Me(e, t));
}
function N(e) {
  const t = `return ${e}`;
  return new Function("el", "dataStack", "actions", t);
}
function Ie(e, t, n, s) {
  const r = N(s);
  try {
    return r(e, t, n);
  } catch {
    console.error(`Error evaluating expression: ${s}`);
  }
}
function $e(e) {
  return e.replace(/(?:^\w|[A-Z]|\b\w)/g, (t, n) => n === 0 ? t.toLowerCase() : t.toUpperCase()).replace(/\s+/g, "");
}
function Wt(e) {
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
let D, v = null, E = 0, C = [], X, j = !1;
const H = 0, se = 1, R = 2;
function ee(e, t) {
  const n = new Ae(e, t?.effect);
  return t?.equals && (n.equals = t.equals), n;
}
function Oe(e, t) {
  return e === t;
}
class Ae {
  constructor(t, n = !1) {
    this.isEffect = n, typeof t == "function" ? (this.fn = t, this._value = void 0, this.isEffect = n || !1, this.state = R, n && (C.push(this), X?.(this))) : (this.fn = void 0, this._value = t, this.state = H, this.isEffect = !1);
  }
  _value;
  fn;
  observers = null;
  // nodes that have us as sources (down links)
  sources = null;
  // sources in reference order, not deduplicated (up links)
  state;
  cleanups = [];
  equals = Oe;
  get value() {
    return this.get();
  }
  set value(t) {
    this.set(t);
  }
  get() {
    return D && (!v && D.sources && D.sources[E] == this ? E++ : v ? v.push(this) : v = [this]), this.fn && this.updateIfNecessary(), this._value;
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
    if (this.state < t && (this.state === H && this.isEffect && (C.push(this), X?.(this)), this.state = t, this.observers))
      for (let n = 0; n < this.observers.length; n++)
        this.observers[n].stale(se);
  }
  /** run the computation fn, updating the cached value */
  update() {
    const t = this._value, n = D, s = v, r = E;
    D = this, v = null, E = 0;
    try {
      if (this.cleanups.length && (this.cleanups.forEach((o) => o(this._value)), this.cleanups = []), this._value = this.fn(), v) {
        if (this.removeParentObservers(E), this.sources && E > 0) {
          this.sources.length = E + v.length;
          for (let o = 0; o < v.length; o++)
            this.sources[E + o] = v[o];
        } else
          this.sources = v;
        for (let o = E; o < this.sources.length; o++) {
          const i = this.sources[o];
          i.observers ? i.observers.push(this) : i.observers = [this];
        }
      } else
        this.sources && E < this.sources.length && (this.removeParentObservers(E), this.sources.length = E);
    } finally {
      v = s, D = n, E = r;
    }
    if (!this.equals(t, this._value) && this.observers)
      for (let o = 0; o < this.observers.length; o++) {
        const i = this.observers[o];
        i.state = R;
      }
    this.state = H;
  }
  /** update() if dirty, or a parent turns out to be dirty. */
  updateIfNecessary() {
    if (this.state === se) {
      for (const t of this.sources)
        if (t.updateIfNecessary(), this.state === R)
          break;
    }
    this.state === R && this.update(), this.state = H;
  }
  removeParentObservers(t) {
    if (this.sources)
      for (let n = t; n < this.sources.length; n++) {
        const s = this.sources[n], r = s.observers.findIndex((o) => o === this);
        s.observers[r] = s.observers[s.observers.length - 1], s.observers.pop();
      }
  }
}
function He(e) {
  D ? D.cleanups.push(e) : console.error("onCleanup must be called from within a @reactive function");
}
function qe() {
  for (let e = 0; e < C.length; e++)
    C[e].get();
  C.length = 0;
}
function Fe(e = _e) {
  X = e;
}
function _e() {
  j || (j = !0, queueMicrotask(() => {
    j = !1, qe();
  }));
}
Fe();
function Ge(e) {
  return ee(e);
}
function ze(e) {
  return ee(e);
}
function Be(e) {
  return ee(e, { effect: !0 });
}
const Ue = new MutationObserver((e) => {
  for (const t of e)
    t.removedNodes.forEach((n) => {
      const s = n;
      s && z.delete(s);
    });
});
Ue.observe(document, {
  attributes: !0,
  childList: !0,
  subtree: !0
});
function re({ regexp: e, replacer: t }, n) {
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
const F = /* @__PURE__ */ new Map(), K = /* @__PURE__ */ new Map(), z = /* @__PURE__ */ new Map(), oe = new Array(), Y = /* @__PURE__ */ new Map();
function Ve(e) {
  x(e, (t) => {
    z.delete(t);
  }), K.forEach((t, n) => {
    console.log(`apply ${n} to ${e.id || e.tagName} `), t(e);
  });
}
const Q = {};
function b(e, t) {
  if (e.toLowerCase() !== e)
    throw Error(`Data plugin 'data-${e}' must be lowercase`);
  if (F.has(e))
    throw new Error(`Data plugin 'data-${e}' already registered`);
  const n = e;
  F.set(e, n), t || (t = {});
  for (const l of t.requiredPlugins || [])
    if (l === e)
      throw new Error(`Data plugin 'data-${e}' cannot require itself`);
  const s = new Set(F.keys());
  for (const l of t.requiredPlugins || [])
    if (!s.has(l))
      throw new Error(`Data plugin 'data-${e}' requires 'data-${l}'`);
  typeof t?.isPreprocessGlobal > "u" && (t.isPreprocessGlobal = !0), t?.preprocessExpressions && t.isPreprocessGlobal && oe.push(...t.preprocessExpressions);
  const r = [];
  if (t?.allowedModifiers)
    for (const l of t.allowedModifiers) {
      const c = l instanceof RegExp ? l : new RegExp(l);
      r.push(c);
    }
  const o = new Set([...t?.allowedTags || []].map((l) => l.toLowerCase()));
  function i(l) {
    x(l, (c) => {
      const u = I(c);
      if (!u)
        return;
      let a = z.get(u);
      if (a || (a = /* @__PURE__ */ new Set(), z.set(u, a)), !a.has(n)) {
        if (a.add(n), o.size) {
          const m = u.tagName.toLowerCase();
          if (!o.has(m))
            return;
        }
        for (var f in u.dataset) {
          if (!f.startsWith(e))
            continue;
          let [m, ...p] = f.split(".");
          const h = e.length, w = h + 1;
          m = m.slice(h, w).toLocaleLowerCase() + m.slice(w);
          const y = p.map((g) => {
            const [d, ...P] = g.split(":");
            if (!r.some((ne) => ne.test(d)))
              throw new Error(`Modifier ${d} is not allowed for ${m}`);
            return { label: d, args: P };
          }), M = je(u);
          let A = u.dataset[f] || "";
          for (const g of oe)
            A = re(g, A);
          if (t?.preprocessExpressions && !t?.isPreprocessGlobal)
            for (const g of t.preprocessExpressions)
              A = re(g, A);
          const S = Y.get(u) || {};
          if (t?.withExpression) {
            const g = t.withExpression({
              name: m,
              expression: A,
              el: u,
              dataStack: M,
              reactivity: {
                signal: Ge,
                computed: ze,
                effect: Be,
                onCleanup: He
              },
              withMod: (d) => Ze(y, d),
              hasMod: (d) => We(y, d),
              applyPlugins: (d) => K.forEach((P) => P(d)),
              actions: Q
            });
            g && Object.assign(S, g);
          }
          Y.set(u, S);
        }
      }
    });
  }
  i(document.body), K.set(n, i), console.info(`Registered data plugin: data-${e}`);
}
function je(e) {
  const t = [];
  Me(e, (s) => {
    const r = Y.get(s);
    r && t.push(r);
  }), t.reverse();
  const n = {};
  for (const s of t)
    for (const r in s)
      n[r] || (n[r] = {}), Object.assign(n[r], s[r]);
  return n;
}
function I(e) {
  return e instanceof HTMLElement || e instanceof SVGElement ? e : null;
}
function We(e, t) {
  return e.some((n) => n.label === t);
}
function Ze(e, t) {
  return e.find((n) => n.label === t);
}
function Je(e) {
  const { name: t, fn: n, requiredPlugins: s } = e, r = [te, ...s || []];
  if (t != $e(t))
    throw new Error("must be camelCase");
  for (const o of r) {
    if (!F.has(o))
      throw new Error(`requires '@${t}' registration`);
    if (t in Q)
      throw new Error(`'@${t}' already registered`);
    Q[t] = n;
  }
}
let Xe = 0;
function Ke() {
  return Xe++;
}
const te = "action";
function Ye() {
  b(te, {
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
const Qe = "bind";
function xe() {
  b(Qe, {
    requiredPlugins: [T],
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
    requiredPlugins: [T],
    withExpression: ({ el: e }) => {
      const t = I(e);
      if (!t?.focus)
        throw new Error("Element must have a focus method");
      return t.focus(), {};
    }
  });
}
const _ = /* @__PURE__ */ new WeakSet();
function nt(e, t, n = {}) {
  e instanceof Document && (e = e.documentElement);
  let s;
  typeof t == "string" ? s = at(t) : s = t;
  const r = lt(s), o = rt(e, r, n);
  return Pe(e, r, o);
}
function Pe(e, t, n) {
  if (n.head.block) {
    const s = e.querySelector("head"), r = t.querySelector("head");
    if (s && r) {
      const o = De(r, s, n);
      Promise.all(o).then(() => {
        Pe(
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
    return Le(t, e, n), e.children;
  if (n.morphStyle === "outerHTML" || n.morphStyle == null) {
    const s = ut(t, e, n);
    if (!s)
      throw new Error("Could not find best match");
    const r = s?.previousSibling, o = s?.nextSibling, i = G(e, s, n);
    return s ? ct(r, i, o) : [];
  } else
    throw "Do not understand how to morph style " + n.morphStyle;
}
function G(e, t, n) {
  if (!(n.ignoreActive && e === document.activeElement))
    if (t == null) {
      if (n.callbacks.beforeNodeRemoved(e) === !1)
        return;
      e.remove(), n.callbacks.afterNodeRemoved(e);
      return;
    } else {
      if (B(e, t))
        return n.callbacks.beforeNodeMorphed(e, t) === !1 ? void 0 : (e instanceof HTMLHeadElement && n.head.ignore || (t instanceof HTMLHeadElement && e instanceof HTMLHeadElement && n.head.style !== "morph" ? De(t, e, n) : (st(t, e), Le(t, e, n))), n.callbacks.afterNodeMorphed(e, t), e);
      if (n.callbacks.beforeNodeRemoved(e) === !1 || n.callbacks.beforeNodeAdded(t) === !1)
        return;
      if (!e.parentElement)
        throw new Error("oldNode has no parentElement");
      return e.parentElement.replaceChild(t, e), n.callbacks.afterNodeAdded(t), n.callbacks.afterNodeRemoved(e), t;
    }
}
function Le(e, t, n) {
  let s = e.firstChild, r = t.firstChild, o;
  for (; s; ) {
    if (o = s, s = o.nextSibling, r == null) {
      if (n.callbacks.beforeNodeAdded(o) === !1)
        return;
      t.appendChild(o), n.callbacks.afterNodeAdded(o), k(n, o);
      continue;
    }
    if (ke(o, r, n)) {
      G(r, o, n), r = r.nextSibling, k(n, o);
      continue;
    }
    let i = ot(e, t, o, r, n);
    if (i) {
      r = ie(r, i, n), G(i, o, n), k(n, o);
      continue;
    }
    let l = it(e, o, r, n);
    if (l) {
      r = ie(r, l, n), G(l, o, n), k(n, o);
      continue;
    }
    if (n.callbacks.beforeNodeAdded(o) === !1)
      return;
    t.insertBefore(o, r), n.callbacks.afterNodeAdded(o), k(n, o);
  }
  for (; r !== null; ) {
    let i = r;
    r = r.nextSibling, Ne(i, n);
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
    t.value = e.value || "", q(e, t, "value"), q(e, t, "checked"), q(e, t, "disabled");
  else if (e instanceof HTMLOptionElement)
    q(e, t, "selected");
  else if (e instanceof HTMLTextAreaElement && t instanceof HTMLTextAreaElement) {
    const s = e.value, r = t.value;
    s !== r && (t.value = s), t.firstChild && t.firstChild.nodeValue !== s && (t.firstChild.nodeValue = s);
  }
}
function q(e, t, n) {
  const s = e.getAttribute(n), r = t.getAttribute(n);
  s !== r && (s ? t.setAttribute(n, s) : t.removeAttribute(n));
}
function De(e, t, n) {
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
        const p = new Promise((h) => {
          m = h;
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
function ke(e, t, n) {
  return !e || !t ? !1 : e.nodeType === t.nodeType && e.tagName === t.tagName ? e?.id?.length && e.id === t.id ? !0 : $(n, e, t) > 0 : !1;
}
function B(e, t) {
  return !e || !t ? !1 : e.nodeType === t.nodeType && e.tagName === t.tagName;
}
function ie(e, t, n) {
  for (; e !== t; ) {
    const s = e;
    if (e = e?.nextSibling, !s)
      throw new Error("tempNode is null");
    Ne(s, n);
  }
  return k(n, t), t.nextSibling;
}
function ot(e, t, n, s, r) {
  const o = $(r, n, t);
  let i = null;
  if (o > 0) {
    i = s;
    let l = 0;
    for (; i != null; ) {
      if (ke(n, i, r))
        return i;
      if (l += $(r, i, e), l > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function it(e, t, n, s) {
  let r = n, o = t.nextSibling, i = 0;
  for (; r && o; ) {
    if ($(s, r, e) > 0)
      return null;
    if (B(t, r))
      return r;
    if (B(o, r) && (i++, o = o.nextSibling, i >= 2))
      return null;
    r = r.nextSibling;
  }
  return r;
}
const ae = new DOMParser();
function at(e) {
  const t = e.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (t.match(/<\/html>/) || t.match(/<\/head>/) || t.match(/<\/body>/)) {
    const n = ae.parseFromString(e, "text/html");
    if (t.match(/<\/html>/))
      return _.add(n), n;
    {
      let s = n.firstChild;
      return s ? (_.add(s), s) : null;
    }
  } else {
    const s = ae.parseFromString(`<body><template>${e}</template></body>`, "text/html").body.querySelector("template")?.content;
    if (!s)
      throw new Error("content is null");
    return _.add(s), s;
  }
}
function lt(e) {
  if (e == null)
    return document.createElement("div");
  if (_.has(e))
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
  return B(e, t) ? 0.5 + $(n, e, t) : 0;
}
function Ne(e, t) {
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
function $(e, t, n) {
  const s = e.idMap.get(t);
  if (!s)
    return 0;
  let r = 0;
  for (const o of s)
    dt(e, o) && ht(e, o, n) && ++r;
  return r;
}
function le(e, t) {
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
  return le(e, n), le(t, n), n;
}
const mt = new DOMParser(), Re = "datastar", W = `${Re}-indicator`, U = `${Re}-request`, gt = "Accept", ce = "text/html", Et = "Content-Type", vt = "application/json", wt = "selector", bt = "swap", Ce = "get", yt = () => O(Ce), St = "post", Tt = () => O(St), Mt = "put", At = () => O(Mt), Pt = "patch", Lt = () => O(Pt), Dt = "delete", kt = () => O(Dt), Nt = () => {
  yt(), Tt(), At(), Lt(), kt();
};
let ue = !1;
function O(e) {
  if (!ue) {
    const t = document.createElement("style");
    t.innerHTML = `
.${W}{
  opacity:0;
  transition: opacity 500ms ease-in;
}
.${U} .${W}{
    opacity:1
}
.${U}.${W}{
    opacity:1
}
    `, document.head.appendChild(t), ue = !0;
  }
  Je({
    name: e,
    description: `turns @${e}(args) into fetch(${e}, args)`,
    fn: async (t) => Rt(e, t)
  });
}
async function Rt(e, t) {
  const { el: n, dataStack: s } = t, r = s.signals?.[e];
  if (!r)
    throw new Error(`No signal for ${e}`);
  const o = I(n);
  if (!o)
    throw new Error("Element must be an HTMLElement or SVGElement");
  o.classList.add(U);
  const i = new URL(r.value, window.location.origin), l = new Headers();
  if (l.append(gt, ce), l.append(Et, vt), s?.headers)
    for (let p in s.headers) {
      const h = s.headers[p];
      l.append(p, h.value);
    }
  const c = JSON.stringify(s, (p, h) => h instanceof Ae ? h.isEffect ? void 0 : h.get() : h), u = { method: e, headers: l };
  if (e === Ce) {
    const p = new URLSearchParams(i.search);
    p.append("dataStack", c), i.search = p.toString();
  } else
    u.body = c;
  const a = await fetch(i, u);
  if (!a.ok)
    throw new Error("Network response was not ok.");
  const f = await a.text(), m = [...mt.parseFromString(f, ce).body.children];
  for (let p = 0; p < m.length; p++) {
    const h = m[p];
    if (!(h instanceof Element))
      throw new Error("Not an element");
    const w = I(h), y = h.getAttribute("id"), M = p === 0, A = !!y?.length, S = M && !A;
    let g;
    if (S)
      g = [n];
    else {
      if (!A)
        throw new Error("No id");
      const d = w?.dataset?.[wt] || `#${y}`;
      g = document.querySelectorAll(d) || [];
    }
    if (!g)
      throw new Error("No target element");
    for (const d of g) {
      switch (w?.dataset?.[bt] || "morph") {
        case "morph":
          nt(d, h);
          break;
        case "inner":
          d.innerHTML = h.innerHTML;
          break;
        case "outer":
          d.outerHTML = h.outerHTML;
          break;
        case "prepend":
          d.prepend(h.outerHTML);
          break;
        case "append":
          d.append(h.outerHTML);
          break;
        case "before":
          d.before(h);
          break;
        case "after":
          d.after(h);
          break;
        case "delete":
          d.remove();
          break;
        default:
          throw new Error("Invalid merge mode");
      }
      Ve(d);
    }
  }
  o.classList.remove(U);
}
const Ct = "model", fe = ["change", "input", "keydown"];
function It() {
  b(Ct, {
    allowedTags: ["input", "textarea", "select"],
    requiredPlugins: [T],
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
          [`${e}-${Ke()}`]: r(() => {
            t.value = i.value;
            for (const c of fe)
              t.addEventListener(c, l);
            o(() => {
              for (const c of fe)
                t.removeEventListener(c, l);
            });
          })
        }
      };
    }
  });
}
const $t = "on", de = "once", he = "throttle", pe = "debounce", me = "leading";
function Ot() {
  b($t, {
    requiredPlugins: [T],
    allowedModifiers: [de, he, pe, me],
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
      const a = N(r), f = n(de), m = s(he), p = s(pe), h = n(me);
      if (t === "load") {
        document.addEventListener("DOMContentLoaded", () => a(e, o, u), !0);
        return;
      }
      const w = () => a(e, o, u);
      let y = w, M;
      if (f)
        y = () => {
          w(), M && e.removeEventListener(t, M);
        };
      else if (m) {
        const [S] = m.args, g = S ? Number(S) : 1e3;
        let d = 0;
        const P = i(() => {
          const V = Date.now();
          if (V - d >= g)
            return d = V, w();
        });
        y = () => P.value;
      } else if (p) {
        const [S] = p.args, g = S ? Number(S) : 1e3;
        let d;
        const P = i(() => {
          h && !d && w(), clearTimeout(d), d = setTimeout(() => {
            h ? d = void 0 : w();
          }, g);
        });
        y = () => P.value;
      }
      return M = () => y(), e.addEventListener(t, M), {
        on: {
          [t]: l(() => {
            c(() => {
              f || e.removeEventListener(t, M);
            });
          })
        }
      };
    }
  });
}
const Ht = "ref";
function qt() {
  b(Ht, {
    requiredPlugins: [T],
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
const Z = "important", J = "display", ge = "none", Ft = "show";
function _t() {
  b(Ft, {
    requiredPlugins: [T],
    allowedModifiers: [Z],
    withExpression: ({ el: e, name: t, dataStack: n, expression: s, hasMod: r, reactivity: { effect: o }, actions: i }) => {
      const l = N(s);
      if (!(e instanceof HTMLElement || e instanceof SVGElement))
        throw new Error("Element must have a style property");
      const u = r(Z) ? Z : void 0;
      return {
        show: {
          [t]: o(() => {
            !!l(e, n, i) ? e.style.length === 1 && e.style.display === ge ? e.style.removeProperty(J) : e.style.setProperty(J, "", u) : e.style.setProperty(J, ge, u);
          })
        }
      };
    }
  });
}
const T = "signal", Ee = "persist";
function Gt() {
  b(T, {
    requiredPlugins: [te],
    preprocessExpressions: [
      {
        name: "signal",
        description: "turns $signal into dataStack.signals.signal.value",
        regexp: new RegExp(/(?<whole>\$(?<signal>[a-zA-Z_$][0-9a-zA-Z_$]*))/g),
        replacer: ({ signal: e }) => `dataStack.${T}s.${e}.value`
      }
    ],
    allowedModifiers: [Ee],
    withExpression: ({ name: e, el: t, expression: n, reactivity: s, hasMod: r, actions: o }) => {
      const i = s.signal(Ie(t, {}, o, n));
      if (r(Ee)) {
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
const ve = "prepend", we = "append", be = "Target element must have a parent if using prepend or append", zt = "teleport";
function Bt() {
  b(zt, {
    requiredPlugins: [T],
    allowedModifiers: [ve, we],
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
            if (I(f)?.firstElementChild)
              throw new Error("Empty template");
            if (o(ve)) {
              if (!a.parentNode)
                throw new Error(be);
              a.parentNode.insertBefore(f, a);
            } else if (o(we)) {
              if (!a.parentNode)
                throw new Error(be);
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
const Ut = "text";
function Vt() {
  b(Ut, {
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
const ye = "once", Se = "full", Te = "half", jt = "intersects";
function Zt() {
  b(jt, {
    requiredPlugins: [T],
    allowedModifiers: [ye, Se, Te],
    withExpression: ({ name: e, el: t, expression: n, dataStack: s, actions: r, hasMod: o, reactivity: { effect: i, onCleanup: l } }) => {
      const c = N(n), u = () => c(t, s, r), a = { threshold: 0 };
      o(Se) ? a.threshold = 1 : o(Te) && (a.threshold = 0.5);
      const f = new IntersectionObserver((p) => {
        p.forEach((h) => {
          h.isIntersecting && (u(), o(ye) && f.disconnect());
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
function Jt() {
  Ye(), Gt(), xe(), It(), tt(), Nt(), Ot(), qt(), _t(), Bt(), Vt();
}
export {
  Qe as BIND,
  Dt as DELETE,
  et as FOCUS,
  Ce as GET,
  jt as INTERSECTS,
  $t as ON,
  Pt as PATCH,
  St as POST,
  Mt as PUT,
  Ht as REF,
  Ft as SHOW,
  T as SIGNAL,
  zt as TELEPORT,
  Ut as TEXT,
  Nt as addAllFragmentPlugins,
  Jt as addAllIncludedPlugins,
  xe as addBindDataPlugin,
  kt as addDeletePlugin,
  tt as addFocusDataPlugin,
  yt as addGetPlugin,
  Zt as addIntersectsplugin,
  Ot as addOnDataPlugin,
  Lt as addPatchPlugin,
  Tt as addPostPlugin,
  At as addPutPlugin,
  qt as addRefDataPlugin,
  _t as addShowDataPlugin,
  Gt as addSignalDataPlugin,
  Bt as addTeleportDataPlugin,
  Vt as addTextDataPlugin,
  $e as camelize,
  Ie as functionEval,
  N as functionGenerator,
  Wt as injectMockFetch,
  x as walkDownDOM,
  Me as walkUpDOM
};
//# sourceMappingURL=datastar.js.map
