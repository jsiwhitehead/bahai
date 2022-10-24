import webfont from "webfontloader";
import { createBrowserHistory } from "history";

import { atom, resolve } from "reactivejs";

import render from "./render";

import categories from "./data/categories.json";
import prayers from "./data/prayers.json";
import documents from "./data/documents.json";
import quotes from "./data/quotes.json";

import "./style.css";

import maraca, { createBlock } from "./maraca";

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

const documentsList = Object.keys(documents)
  .map((k) => documents[k])
  .map((d) => {
    const refCounts = Object.keys(quotes[d.id] || {}).flatMap(
      (k) => unique(quotes[d.id][k].refs.map((r) => r.id)).length
    );
    return {
      ...d,
      score:
        refCounts.reduce((res, n) => res + n, 0) /
        Math.sqrt(d.paragraphs.length),
    };
  })
  .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

maraca(
  {
    sortIds: (ids) =>
      ids.sort((a, b) => {
        const x = typeof a === "string" ? a : a[0];
        const y = typeof b === "string" ? b : b[0];
        return (
          documents[y].years[0] +
            documents[y].years[1] -
            (documents[x].years[0] + documents[x].years[1]) ||
          x.localeCompare(y)
        );
      }),
    toInt: (s) => parseInt(s, 10),
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
    documents,
    findDocuments: (author, ignore) => {
      const ignoreFlat = ignore.flatMap((x) => x);
      return documentsList.filter(
        (d) =>
          d.author === author &&
          d.type !== "Prayer" &&
          !ignoreFlat.includes(d.id)
      );
    },
    documentsList: Object.keys(documents).map((k) => documents[k]),
    quotesMap: quotes,
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
    fillParts: (parts, text, lines) => {
      const firstChar = /[a-z]/i.exec(text)?.index;
      const indices = unique([
        0,
        ...(firstChar === undefined ? [] : [firstChar + 1]),
        ...(parts || ([] as any[]))
          .filter((p) => typeof p !== "string")
          .flatMap((p) => [p.start, p.end]),
        ...(lines || []),
        text.length,
      ]).sort((a, b) => a - b);
      const result = indices.slice(1).map((end, i) => ({
        start: indices[i],
        end,
        count:
          (parts || ([] as any[])).find(
            (p) => p.start <= indices[i] && p.end >= end
          )?.count || 0,
      }));
      if (!lines) return result;
      return lines
        .slice(0, -1)
        .map((start, i) =>
          result.filter((p) => p.start >= start && p.end <= lines[i + 1])
        );
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
