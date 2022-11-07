import webfont from "webfontloader";
import { createBrowserHistory } from "history";

import { atom, reactiveFunc, resolve } from "reactivejs";

import render from "./render";
import { getParagraph, runSearch } from "./getData";

import "./style.css";

import maraca, { createBlock } from "./maraca";

webfont.load({
  google: { families: ["Atkinson Hyperlegible", "Atkinson Hyperlegible:bold"] },
});

const set = (obj, path, value) =>
  path.reduce(
    (res, k, i) => (res[k] = i === path.length - 1 ? value : res[k] || {}),
    obj
  );
// @ts-ignore
const app = import.meta.glob("./app/**", { eager: true, as: "raw" });
const source = Object.keys(app).reduce((res, k) => {
  const p = k
    .slice(2, -3)
    .split(/[\\\\\\/]/)
    .slice(1);
  set(res, p, app[k]);
  return res;
}, {});

const tick = atom(1);
setInterval(() => {
  tick.update((x) => x + 1);
}, 1000);

const history = createBrowserHistory();
const getUrlBlock = (location) => ({
  type: "block",
  items: location.pathname.split(/\//g).filter((x) => x),
  values: Object.fromEntries([
    ...(location.hash ? [["", location.hash.slice(1)]] : []),
    ...new URLSearchParams(location.search),
  ]),
});
const url = atom(getUrlBlock(history.location));
history.listen(({ location }) => {
  url.set(getUrlBlock(location));
  if (location.hash) {
    setTimeout(() => {
      document.getElementById(location.hash.slice(1))!.scrollIntoView();
      window.scrollBy(0, -25);
    });
  } else {
    setTimeout(() => {
      window.scroll(0, 0);
    });
  }
});
document.addEventListener("click", (e: any) => {
  const origin = e.target.closest("a");
  if (origin) {
    e.preventDefault();
    history.push(origin.href);
  }
});

const unique = (x) => [...new Set<any>(createBlock(x).items)];
const toUrl = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ ‑]/g, "-")
    .replace(/[^\w-]/g, "")
    .toLowerCase();

maraca(
  {
    toInt: (s) => parseInt(s, 10),
    Array,
    unique,
    tick,
    url,
    toUrl,
    getParagraph,
    runSearch,
    type: reactiveFunc((v) =>
      Object.prototype.toString.call(resolve(v)).slice(8, -1).toLowerCase()
    ),
    join: (data, connect) => createBlock(data).items.join(connect),
    startsWith: (str, test) => str.startsWith(test),
    padStart: (str, length, pad) => `${str}`.padStart(length, pad),
    length: (x) =>
      typeof x === "string" ? x.length : createBlock(x).items.length,
    slice: (str, start, end) => str.slice(start || undefined, end || undefined),
  },
  source,
  // (data) => console.log(JSON.stringify(resolve(data, true).index, null, 2))
  render(document.getElementById("app"))
);
