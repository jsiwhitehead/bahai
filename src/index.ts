import webfont from "webfontloader";
import { createBrowserHistory } from "history";

import run, { atom, resolve } from "reactivejs";

import render from "./render";

import categories from "./data/categories.json";
import library from "./data/library.json";
import prayers from "./data/prayers.json";
import documents from "./data/documents.json";
import quotes from "./data/quotes.json";

import "./style.css";

webfont.load({ google: { families: ["Atkinson Hyperlegible"] } });

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

const unique = (x) => [...new Set(x)];
const toUrl = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ ‑]/g, "-")
    .replace(/[^\w-]/g, "")
    .toLowerCase();

run(
  {
    Array,
    unique,
    tick,
    url,
    toUrl,
    collections: categories.reduce(
      (res, { category, reader }, i) => ({
        ...res,
        [toUrl(category)]: {
          name: category,
          items: [
            ...(res[toUrl(category)]?.items || []),
            { ...prayers[i], reader },
          ].sort((a, b) => a.length - b.length),
        },
      }),
      {}
    ),
    library: library.map((group) => ({
      ...group,
      items: group.items.sort(
        (a, b) =>
          documents[typeof a === "string" ? a : a[0]].years[0] +
          documents[typeof a === "string" ? a : a[0]].years[1] -
          (documents[typeof b === "string" ? b : b[0]].years[0] +
            documents[typeof b === "string" ? b : b[0]].years[1])
      ),
    })),
    documents,
    quotes,
    topQuotes: Object.keys(quotes)
      .flatMap((id) =>
        Object.keys(quotes[id]).map((k) => ({
          id,
          paragraph: parseInt(k, 10),
          ...quotes[id][k],
        }))
      )
      .sort((a, b) => {
        const x = a.parts.map((p) => p.count);
        const y = b.parts.map((p) => p.count);
        return (
          Math.max(...y) - Math.max(...x) ||
          y.reduce((res, n) => res + n, 0) - x.reduce((res, n) => res + n, 0)
        );
      })
      .filter((q) => q.parts.some((p) => p.count > 3)),
    fillParts: (parts, text) => {
      const firstChar = /[a-z]/i.exec(text)!.index + 1;
      if (!parts) {
        return [
          { start: 0, end: firstChar, count: 0 },
          { start: firstChar, end: text.length, count: 0 },
        ];
      }
      const indices = [
        ...new Set([
          0,
          firstChar,
          ...parts
            .filter((p) => typeof p !== "string")
            .flatMap((p) => [p.start, p.end]),
          text.length,
        ]),
      ].sort((a, b) => a - b);
      return indices.slice(1).map((end, i) => ({
        start: indices[i],
        end,
        count:
          end === 1 && parts[0].start === 0
            ? parts[0].count
            : parts.find((p) => p.start === indices[i] || p.end === end)
                ?.count || 0,
      }));
    },
    getRef: (paragraphs, index) => {
      const p = paragraphs[index];
      const doc = documents[p.id];
      if (!p.parts) {
        const next = paragraphs[index + 1];
        if (
          next?.id === p.id &&
          !next.parts &&
          doc.paragraphs[next.paragraphs[0]].index ===
            doc.paragraphs[p.paragraphs[0]].index + 1
        ) {
          return "";
        }
        let j = 0;
        while (true) {
          const prev = paragraphs[index + j - 1];
          if (
            prev?.id === p.id &&
            !prev.parts &&
            doc.paragraphs[prev.paragraphs[0]].index ===
              doc.paragraphs[p.paragraphs[0]].index + j - 1
          ) {
            j--;
          } else {
            break;
          }
        }
        return unique(
          [
            doc.author,
            ...doc.path,
            doc.title || (doc.item && "#" + doc.item),
            j === 0
              ? `para ${doc.paragraphs[p.paragraphs[0]].index}`
              : `paras ${doc.paragraphs[p.paragraphs[0]].index + j}-${
                  doc.paragraphs[p.paragraphs[0]].index
                }`,
          ].filter((x) => x)
        ).join(", ");
      }
      const paras = p.paragraphs
        .map((i) => doc.paragraphs[i].index)
        .filter((i) => i !== undefined);
      return unique(
        [
          doc.author,
          ...doc.path,
          doc.title || (doc.item && "#" + doc.item),
          paras.length > 0 &&
            (paras.length === 1 ? "from para " : "from paras ") +
              paras.join(", "),
        ].filter((x) => x)
      ).join(", ");
    },
    type: reactiveFunc((v) =>
      Object.prototype.toString.call(resolve(v)).slice(8, -1).toLowerCase()
    ),
  },
  source,
  render(document.getElementById("app"))
);
