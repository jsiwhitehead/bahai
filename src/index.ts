import webfont from "webfontloader";
import { createBrowserHistory } from "history";

import run, { atom, resolve } from "reactivejs";

import render from "./render";

import categories from "./data/categories.json";
import library from "./data/library.json";
import prayers from "./data/prayers.json";
import documents from "./data/documents.json";

import "./style.css";

webfont.load({ google: { families: ["PT Serif"] } });

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
  if (p[p.length - 1].toLowerCase() === "start") p[p.length - 1] = "";
  set(res, p, app[k]);
  return res;
}, {});

const reactiveFunc = (func) => {
  Object.assign(func, { reactiveFunc: true });
  return func;
};

const tick = atom(1);
setInterval(() => {
  tick.update((x) => x + 1);
}, 1000);

const history = createBrowserHistory();
const url = atom(history.location.pathname.split(/\//g).filter((x) => x));
history.listen(({ location }) => {
  url.set(location.pathname.split(/\//g).filter((x) => x));
  if (location.hash) {
    setTimeout(() => {
      document.getElementById(location.hash)!.scrollIntoView();
    });
  }
});

run(
  {
    tick,
    url,
    decodeURIComponent,
    collections: categories.reduce(
      (res, { category, reader }, i) => ({
        ...res,
        [category]: [
          ...(res[category] || []),
          { type: "Prayer", ...prayers[i], reader },
        ].sort((a, b) => a.length - b.length),
      }),
      {}
    ),
    library,
    documents,
    type: reactiveFunc((v) =>
      Object.prototype.toString.call(resolve(v)).slice(8, -1).toLowerCase()
    ),
  },
  source,
  render(document.getElementById("app"))
);
