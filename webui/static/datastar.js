function x(e, t) {
  if (e)
    for (t(e), e = e.firstElementChild; e; )
      x(e, t), e = e.nextElementSibling;
}
function Te(e, t) {
  e && (t(e), e = e.parentElement, Te(e, t));
}
function k(e) {
  const t = `return ${e}`;
  return new Function("el", "dataStack", "actions", t);
}
function Ie(e, t, n, s) {
  const r = k(s);
  try {
    return r(e, t, n);
  } catch {
    console.error(`Error evaluating expression: ${s}`);
  }
}
function $e(e) {
  return e.replace(/(?:^\w|[A-Z]|\b\w)/g, (t, n) => n === 0 ? t.toLowerCase() : t.toUpperCase()).replace(/\s+/g, "");
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
    let { html: l, status: u, statusText: f, headers: a } = await i(r);
    return a || (a = new Headers()), a.has("Content-Type") || a.append("Content-Type", "text/html"), u = u || 200, f = f || "OK", new Response(l, { status: u, statusText: f, headers: a });
  };
  window.fetch = t;
}
let M, E = null, m = 0, C = [], X, j = !1;
const H = 0, se = 1, R = 2;
function ee(e, t) {
  const n = new Me(e, t?.effect);
  return t?.equals && (n.equals = t.equals), n;
}
function Oe(e, t) {
  return e === t;
}
class Me {
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
    return M && (!E && M.sources && M.sources[m] == this ? m++ : E ? E.push(this) : E = [this]), this.fn && this.updateIfNecessary(), this._value;
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
    const t = this._value, n = M, s = E, r = m;
    M = this, E = null, m = 0;
    try {
      if (this.cleanups.length && (this.cleanups.forEach((o) => o(this._value)), this.cleanups = []), this._value = this.fn(), E) {
        if (this.removeParentObservers(m), this.sources && m > 0) {
          this.sources.length = m + E.length;
          for (let o = 0; o < E.length; o++)
            this.sources[m + o] = E[o];
        } else
          this.sources = E;
        for (let o = m; o < this.sources.length; o++) {
          const i = this.sources[o];
          i.observers ? i.observers.push(this) : i.observers = [this];
        }
      } else
        this.sources && m < this.sources.length && (this.removeParentObservers(m), this.sources.length = m);
    } finally {
      E = s, M = n, m = r;
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
  M ? M.cleanups.push(e) : console.error("onCleanup must be called from within a @reactive function");
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
function v(e, t) {
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
      const u = l instanceof RegExp ? l : new RegExp(l);
      r.push(u);
    }
  const o = new Set([...t?.allowedTags || []].map((l) => l.toLowerCase()));
  function i(l) {
    x(l, (u) => {
      const f = $(u);
      if (!f)
        return;
      let a = z.get(f);
      if (a || (a = /* @__PURE__ */ new Set(), z.set(f, a)), !a.has(n)) {
        if (a.add(n), o.size) {
          const d = f.tagName.toLowerCase();
          if (!o.has(d))
            return;
        }
        for (var c in f.dataset) {
          if (!c.startsWith(e))
            continue;
          let [d, ...h] = c.split(".");
          const b = e.length, y = b + 1;
          d = d.slice(b, y).toLocaleLowerCase() + d.slice(y);
          const A = h.map((g) => {
            const [p, ...L] = g.split(":");
            if (!r.some((ne) => ne.test(p)))
              throw new Error(`Modifier ${p} is not allowed for ${d}`);
            return { label: p, args: L };
          }), P = je(f);
          let N = f.dataset[c] || "";
          for (const g of oe)
            N = re(g, N);
          if (t?.preprocessExpressions && !t?.isPreprocessGlobal)
            for (const g of t.preprocessExpressions)
              N = re(g, N);
          const S = Y.get(f) || {};
          if (t?.withExpression) {
            const g = t.withExpression({
              name: d,
              expression: N,
              el: f,
              dataStack: P,
              reactivity: {
                signal: Ge,
                computed: ze,
                effect: Be,
                onCleanup: He
              },
              withMod: (p) => Ze(A, p),
              hasMod: (p) => We(A, p),
              applyPlugins: (p) => K.forEach((L) => L(p)),
              actions: Q
            });
            g && Object.assign(S, g);
          }
          Y.set(f, S);
        }
      }
    });
  }
  i(document.body), K.set(n, i), console.info(`Registered data plugin: data-${e}`);
}
function je(e) {
  const t = [];
  Te(e, (s) => {
    const r = Y.get(s);
    r && t.push(r);
  }), t.reverse();
  const n = {};
  for (const s of t)
    for (const r in s)
      n[r] || (n[r] = {}), Object.assign(n[r], s[r]);
  return n;
}
function $(e) {
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
  v(te, {
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
  v(Qe, {
    requiredPlugins: [w],
    withExpression: ({ el: e, name: t, expression: n, dataStack: s, actions: r, reactivity: { effect: o } }) => {
      const i = k(n);
      return {
        bind: {
          [t]: o(() => {
            if (!s?.signals)
              return;
            const u = i(e, s, r);
            e.setAttribute(t, `${u}`);
          })
        }
      };
    }
  });
}
const et = "focus";
function tt() {
  v(et, {
    requiredPlugins: [w],
    withExpression: ({ el: e }) => {
      const t = $(e);
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
  return Ae(e, r, o);
}
function Ae(e, t, n) {
  if (n.head.block) {
    const s = e.querySelector("head"), r = t.querySelector("head");
    if (s && r) {
      const o = Le(r, s, n);
      Promise.all(o).then(() => {
        Ae(
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
    return Pe(t, e, n), e.children;
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
        return n.callbacks.beforeNodeMorphed(e, t) === !1 ? void 0 : (e instanceof HTMLHeadElement && n.head.ignore || (t instanceof HTMLHeadElement && e instanceof HTMLHeadElement && n.head.style !== "morph" ? Le(t, e, n) : (st(t, e), Pe(t, e, n))), n.callbacks.afterNodeMorphed(e, t), e);
      if (n.callbacks.beforeNodeRemoved(e) === !1 || n.callbacks.beforeNodeAdded(t) === !1)
        return;
      if (!e.parentElement)
        throw new Error("oldNode has no parentElement");
      return e.parentElement.replaceChild(t, e), n.callbacks.afterNodeAdded(t), n.callbacks.afterNodeRemoved(e), t;
    }
}
function Pe(e, t, n) {
  let s = e.firstChild, r = t.firstChild, o;
  for (; s; ) {
    if (o = s, s = o.nextSibling, r == null) {
      if (n.callbacks.beforeNodeAdded(o) === !1)
        return;
      t.appendChild(o), n.callbacks.afterNodeAdded(o), D(n, o);
      continue;
    }
    if (De(o, r, n)) {
      G(r, o, n), r = r.nextSibling, D(n, o);
      continue;
    }
    let i = ot(e, t, o, r, n);
    if (i) {
      r = ie(r, i, n), G(i, o, n), D(n, o);
      continue;
    }
    let l = it(e, o, r, n);
    if (l) {
      r = ie(r, l, n), G(l, o, n), D(n, o);
      continue;
    }
    if (n.callbacks.beforeNodeAdded(o) === !1)
      return;
    t.insertBefore(o, r), n.callbacks.afterNodeAdded(o), D(n, o);
  }
  for (; r !== null; ) {
    let i = r;
    r = r.nextSibling, ke(i, n);
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
function Le(e, t, n) {
  const s = [], r = [], o = [], i = [], l = n.head.style, u = /* @__PURE__ */ new Map();
  for (const a of e.children)
    u.set(a.outerHTML, a);
  for (const a of t.children) {
    let c = u.has(a.outerHTML), d = n.head.shouldReAppend(a), h = n.head.shouldPreserve(a);
    c || h ? d ? r.push(a) : (u.delete(a.outerHTML), o.push(a)) : l === "append" ? d && (r.push(a), i.push(a)) : n.head.shouldRemove(a) !== !1 && r.push(a);
  }
  i.push(...u.values()), console.log("to append: ", i);
  const f = [];
  for (const a of i) {
    console.log("adding: ", a);
    const c = document.createRange().createContextualFragment(a.outerHTML).firstChild;
    if (!c)
      throw new Error("could not create new element from: " + a.outerHTML);
    if (console.log(c), n.callbacks.beforeNodeAdded(c)) {
      if (c.hasAttribute("href") || c.hasAttribute("src")) {
        let d;
        const h = new Promise((b) => {
          d = b;
        });
        c.addEventListener("load", function() {
          d(void 0);
        }), f.push(h);
      }
      t.appendChild(c), n.callbacks.afterNodeAdded(c), s.push(c);
    }
  }
  for (const a of r)
    n.callbacks.beforeNodeRemoved(a) !== !1 && (t.removeChild(a), n.callbacks.afterNodeRemoved(a));
  return n.head.afterHeadMorphed(t, {
    added: s,
    kept: o,
    removed: r
  }), f;
}
function T() {
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
        beforeNodeAdded: T,
        afterNodeAdded: T,
        beforeNodeMorphed: T,
        afterNodeMorphed: T,
        beforeNodeRemoved: T,
        afterNodeRemoved: T
      },
      n.callbacks
    ),
    head: Object.assign(
      {
        style: "merge",
        shouldPreserve: (s) => s.getAttribute("im-preserve") === "true",
        shouldReAppend: (s) => s.getAttribute("im-re-append") === "true",
        shouldRemove: T,
        afterHeadMorphed: T
      },
      n.head
    )
  };
}
function De(e, t, n) {
  return !e || !t ? !1 : e.nodeType === t.nodeType && e.tagName === t.tagName ? e?.id?.length && e.id === t.id ? !0 : I(n, e, t) > 0 : !1;
}
function B(e, t) {
  return !e || !t ? !1 : e.nodeType === t.nodeType && e.tagName === t.tagName;
}
function ie(e, t, n) {
  for (; e !== t; ) {
    const s = e;
    if (e = e?.nextSibling, !s)
      throw new Error("tempNode is null");
    ke(s, n);
  }
  return D(n, t), t.nextSibling;
}
function ot(e, t, n, s, r) {
  const o = I(r, n, t);
  let i = null;
  if (o > 0) {
    i = s;
    let l = 0;
    for (; i != null; ) {
      if (De(n, i, r))
        return i;
      if (l += I(r, i, e), l > o)
        return null;
      i = i.nextSibling;
    }
  }
  return i;
}
function it(e, t, n, s) {
  let r = n, o = t.nextSibling, i = 0;
  for (; r && o; ) {
    if (I(s, r, e) > 0)
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
  return B(e, t) ? 0.5 + I(n, e, t) : 0;
}
function ke(e, t) {
  D(t, e), t.callbacks.beforeNodeRemoved(e) !== !1 && (e.remove(), t.callbacks.afterNodeRemoved(e));
}
function dt(e, t) {
  return !e.deadIds.has(t);
}
function ht(e, t, n) {
  return e.idMap.get(n)?.has(t) || !1;
}
function D(e, t) {
  const n = e.idMap.get(t);
  if (n)
    for (const s of n)
      e.deadIds.add(s);
}
function I(e, t, n) {
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
const mt = new DOMParser(), Ne = "datastar", W = `${Ne}-indicator`, U = `${Ne}-request`, gt = "Accept", Re = "text/html", Et = "Content-Type", vt = "application/json", wt = "selector", bt = "swap", Ce = "get", yt = () => O(Ce), St = "post", Tt = () => O(St), Mt = "put", At = () => O(Mt), Pt = "patch", Lt = () => O(Pt), Dt = "delete", kt = () => O(Dt), Nt = () => {
  yt(), Tt(), At(), Lt(), kt();
};
let ce = !1;
function O(e) {
  if (!ce) {
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
    `, document.head.appendChild(t), ce = !0;
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
  const o = $(n);
  if (!o)
    throw new Error("Element must be an HTMLElement or SVGElement");
  o.classList.add(U);
  const i = new URL(r.value, window.location.origin), l = new Headers();
  if (l.append(gt, Re), l.append(Et, vt), s?.headers)
    for (let d in s.headers) {
      const h = s.headers[d];
      l.append(d, h.value);
    }
  const u = JSON.stringify(s, (d, h) => h instanceof Me ? h.isEffect ? void 0 : h.get() : h), f = { method: e, headers: l };
  if (e === Ce) {
    const d = new URLSearchParams(i.search);
    d.append("dataStack", u), i.search = d.toString();
  } else
    f.body = u;
  const a = await fetch(i, f);
  if (!a.ok)
    throw new Error("Network response was not ok.");
  const c = await a.text();
  Ct(o, c), o.classList.remove(U);
}
function Ct(e, t) {
  const n = [...mt.parseFromString(t, Re).body.children];
  for (let s = 0; s < n.length; s++) {
    const r = n[s];
    if (!(r instanceof Element))
      throw new Error("Not an element");
    const o = $(r), i = r.getAttribute("id"), l = s === 0, u = !!i?.length, f = l && !u;
    let a;
    if (f)
      a = [e];
    else {
      if (!u)
        throw new Error("No id");
      const c = o?.dataset?.[wt] || `#${i}`;
      a = document.querySelectorAll(c) || [];
    }
    if (!a)
      throw new Error("No target element");
    for (const c of a) {
      switch (o?.dataset?.[bt] || "morph") {
        case "morph":
          nt(c, r);
          break;
        case "inner":
          c.innerHTML = r.innerHTML;
          break;
        case "outer":
          c.outerHTML = r.outerHTML;
          break;
        case "prepend":
          c.prepend(r.outerHTML);
          break;
        case "append":
          c.append(r.outerHTML);
          break;
        case "before":
          c.before(r);
          break;
        case "after":
          c.after(r);
          break;
        case "delete":
          c.remove();
          break;
        default:
          throw new Error("Invalid merge mode");
      }
      Ve(c);
    }
  }
}
const It = "model", ue = ["change", "input", "keydown"];
function $t() {
  v(It, {
    allowedTags: ["input", "textarea", "select"],
    requiredPlugins: [w],
    withExpression: ({ name: e, el: t, expression: n, dataStack: s, reactivity: { effect: r, onCleanup: o } }) => {
      const i = s.signals[n];
      if (!i)
        throw new Error(`Signal ${n} not found`);
      if (!("value" in t))
        throw new Error("Element must have a value property");
      t.value = i.value;
      const l = () => {
        const u = i.value;
        if (typeof u == "number")
          i.value = Number(t.value);
        else if (typeof u == "string")
          i.value = t.value;
        else if (typeof u == "boolean")
          i.value = !!t.value;
        else
          throw new Error("Unsupported type");
      };
      return {
        model: {
          [`${e}-${Ke()}`]: r(() => {
            t.value = i.value;
            for (const u of ue)
              t.addEventListener(u, l);
            o(() => {
              for (const u of ue)
                t.removeEventListener(u, l);
            });
          })
        }
      };
    }
  });
}
const Ot = "on", fe = "once", de = "throttle", he = "debounce", pe = "leading";
function Ht() {
  v(Ot, {
    requiredPlugins: [w],
    allowedModifiers: [fe, de, he, pe],
    withExpression: ({
      el: e,
      name: t,
      hasMod: n,
      withMod: s,
      expression: r,
      dataStack: o,
      reactivity: { computed: i, effect: l, onCleanup: u },
      actions: f
    }) => {
      const a = k(r), c = n(fe), d = s(de), h = s(he), b = n(pe);
      if (t === "load") {
        document.addEventListener("DOMContentLoaded", () => a(e, o, f), !0);
        return;
      }
      const y = () => a(e, o, f);
      let A = y, P;
      if (c)
        A = () => {
          y(), P && e.removeEventListener(t, P);
        };
      else if (d) {
        const [S] = d.args, g = S ? Number(S) : 1e3;
        let p = 0;
        const L = i(() => {
          const V = Date.now();
          if (V - p >= g)
            return p = V, y();
        });
        A = () => L.value;
      } else if (h) {
        const [S] = h.args, g = S ? Number(S) : 1e3;
        let p;
        const L = i(() => {
          b && !p && y(), clearTimeout(p), p = setTimeout(() => {
            b ? p = void 0 : y();
          }, g);
        });
        A = () => L.value;
      }
      return P = () => A(), e.addEventListener(t, P), {
        on: {
          [t]: l(() => {
            u(() => {
              c || e.removeEventListener(t, P);
            });
          })
        }
      };
    }
  });
}
const qt = "ref";
function Ft() {
  v(qt, {
    requiredPlugins: [w],
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
const Z = "important", J = "display", me = "none", _t = "show";
function Gt() {
  v(_t, {
    requiredPlugins: [w],
    allowedModifiers: [Z],
    withExpression: ({ el: e, name: t, dataStack: n, expression: s, hasMod: r, reactivity: { effect: o }, actions: i }) => {
      const l = k(s);
      if (!(e instanceof HTMLElement || e instanceof SVGElement))
        throw new Error("Element must have a style property");
      const f = r(Z) ? Z : void 0;
      return {
        show: {
          [t]: o(() => {
            !!l(e, n, i) ? e.style.length === 1 && e.style.display === me ? e.style.removeProperty(J) : e.style.setProperty(J, "", f) : e.style.setProperty(J, me, f);
          })
        }
      };
    }
  });
}
const w = "signal", ge = "persist";
function zt() {
  v(w, {
    requiredPlugins: [te],
    preprocessExpressions: [
      {
        name: "signal",
        description: "turns $signal into dataStack.signals.signal.value",
        regexp: new RegExp(/(?<whole>\$(?<signal>[a-zA-Z_$][0-9a-zA-Z_$]*))/g),
        replacer: ({ signal: e }) => `dataStack.${w}s.${e}.value`
      }
    ],
    allowedModifiers: [ge],
    withExpression: ({ name: e, el: t, expression: n, reactivity: s, hasMod: r, actions: o }) => {
      const i = s.signal(Ie(t, {}, o, n));
      if (r(ge)) {
        const l = localStorage.getItem(e);
        if (l) {
          const u = JSON.parse(l);
          i.value = u;
        }
        s.effect(() => {
          const u = JSON.stringify(i.value);
          localStorage.setItem(e, u);
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
const Ee = "prepend", ve = "append", we = "Target element must have a parent if using prepend or append", Bt = "teleport";
function Ut() {
  v(Bt, {
    requiredPlugins: [w],
    allowedModifiers: [Ee, ve],
    withExpression: ({ name: e, el: t, expression: n, dataStack: s, reactivity: { effect: r }, hasMod: o, actions: i }) => {
      if (!(t instanceof HTMLTemplateElement))
        throw new Error("Element must be a template");
      const l = k(n);
      return {
        text: {
          [e]: r(() => {
            const f = l(t, s, i);
            if (typeof f != "string")
              throw new Error("Selector must be a string");
            const a = document.querySelector(f);
            if (!a)
              throw new Error(`Target element not found: ${f}`);
            if (!t.content)
              throw new Error("Template element must have content");
            const c = t.content.cloneNode(!0);
            if ($(c)?.firstElementChild)
              throw new Error("Empty template");
            if (o(Ee)) {
              if (!a.parentNode)
                throw new Error(we);
              a.parentNode.insertBefore(c, a);
            } else if (o(ve)) {
              if (!a.parentNode)
                throw new Error(we);
              a.parentNode.insertBefore(c, a.nextSibling);
            } else
              a.appendChild(c);
            a.appendChild(c);
          })
        }
      };
    }
  });
}
const Vt = "text";
function jt() {
  v(Vt, {
    withExpression: ({ name: e, el: t, expression: n, dataStack: s, actions: r, reactivity: { effect: o } }) => {
      const i = k(n);
      return {
        text: {
          [e]: o(() => {
            if (!s?.signals)
              return;
            const u = i(t, s, r);
            t.textContent = `${u}`;
          })
        }
      };
    }
  });
}
const be = "once", ye = "full", Se = "half", Wt = "intersects";
function Jt() {
  v(Wt, {
    requiredPlugins: [w],
    allowedModifiers: [be, ye, Se],
    withExpression: ({ name: e, el: t, expression: n, dataStack: s, actions: r, hasMod: o, reactivity: { effect: i, onCleanup: l } }) => {
      const u = k(n), f = () => u(t, s, r), a = { threshold: 0 };
      o(ye) ? a.threshold = 1 : o(Se) && (a.threshold = 0.5);
      const c = new IntersectionObserver((h) => {
        h.forEach((b) => {
          b.isIntersecting && (f(), o(be) && c.disconnect());
        });
      }, a);
      return {
        on: {
          [e]: i(() => {
            c.observe(t), l(() => {
              c.disconnect();
            });
          })
        }
      };
    }
  });
}
function Xt() {
  Ye(), zt(), xe(), $t(), tt(), Nt(), Ht(), Ft(), Gt(), Ut(), jt();
}
export {
  Qe as BIND,
  Dt as DELETE,
  et as FOCUS,
  Ce as GET,
  Wt as INTERSECTS,
  Ot as ON,
  Pt as PATCH,
  St as POST,
  Mt as PUT,
  qt as REF,
  _t as SHOW,
  w as SIGNAL,
  Bt as TELEPORT,
  Vt as TEXT,
  Nt as addAllFragmentPlugins,
  Xt as addAllIncludedPlugins,
  xe as addBindDataPlugin,
  kt as addDeletePlugin,
  tt as addFocusDataPlugin,
  yt as addGetPlugin,
  Jt as addIntersectsPlugin,
  Ht as addOnDataPlugin,
  Lt as addPatchPlugin,
  Tt as addPostPlugin,
  At as addPutPlugin,
  Ft as addRefDataPlugin,
  Gt as addShowDataPlugin,
  zt as addSignalDataPlugin,
  Ut as addTeleportDataPlugin,
  jt as addTextDataPlugin,
  $e as camelize,
  Ie as functionEval,
  k as functionGenerator,
  Zt as injectMockFetch,
  Ct as mergeHTMLFragments,
  x as walkDownDOM,
  Te as walkUpDOM
};
//# sourceMappingURL=datastar.js.map
