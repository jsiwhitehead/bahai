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
  .map((d) => ({
    ...d,
    path: d.path && [
      ...new Set(
        d.path.filter(
          (p) =>
            ![
              "Selections from the Writings of the Báb",
              "Part Two: Letters from Shoghi Effendi",
            ].includes(p)
        )
      ),
    ],
    words: d.paragraphs
      .flatMap((p) => {
        if (p.section) return p.title || "";
        if (p.id) {
          const doc = documents[p.id];
          if (!p.parts) return doc.paragraphs[p.paragraphs[0] - 1].text;
          return p.parts
            .filter((part) => typeof part !== "string")
            .map(({ paragraph, start, end }) =>
              doc.paragraphs[paragraph - 1].text.slice(start, end)
            );
        }
        return p.text;
      })
      .map((s) => s.split(" ").length)
      .reduce((a, b) => a + b, 0),
    score: Object.keys(quotes[d.id] || {})
      .flatMap((k) =>
        quotes[d.id][k].parts.map(
          (p) =>
            d.paragraphs[parseInt(k) - 1].text
              .slice(p.start, p.end)
              .trim()
              .split(" ").length * p.count
        )
      )
      .reduce((res, n) => res + n, 0),
  }))
  .map((d) => {
    const time = d.words / 238;
    if (time < 2.5) return { ...d, time: "1‑2 mins" };
    if (time < 60) return { ...d, time: `${Math.round(time / 5) * 5} mins` };
    return {
      ...d,
      time: `${Math.round(time / 6) / 10} hours`,
      score: d.score / Math.sqrt(d.words),
    };
  })
  // .sort(
  //   (a, b) =>
  //     b.years[0] + b.years[1] - (a.years[0] + a.years[1]) ||
  //     a.id.localeCompare(b.id)
  // )
  // .sort((a, b) => b.words - a.words || a.id.localeCompare(b.id));
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
    documentsByIds: (ids) =>
      documentsList
        .filter((d) => ids.includes(d.id))
        .sort(
          (a, b) =>
            b.years[0] + b.years[1] - (a.years[0] + a.years[1]) ||
            a.id.localeCompare(b.id)
        ),
    findDocuments: (section, ignore) => {
      if (section === "Compilations") {
        return documentsList.filter(
          (d) =>
            d.id.startsWith("compilation") ||
            d.id.startsWith("ruhi") ||
            d.id === "world-centre-entry-by-troops-002"
        );
        // return documentsList.filter(
        //   (d) =>
        //     d.paragraphs.every((p) => p.id || p.section) &&
        //     unique(d.paragraphs.map((p) => p.id)).filter((x) => x).length > 1
        // );
      }
      if (section === "Other") {
        return documentsList
          .filter((d) => !d.paragraphs.every((p) => p.id || p.section))
          .filter(
            (d) =>
              !["The Báb", "Bahá’u’lláh", "‘Abdu’l‑Bahá"].includes(d.author) &&
              !d.epoch &&
              !d.id.startsWith("bible") &&
              !d.id.startsWith("quran") &&
              !d.id.startsWith("compilations") &&
              !d.id.startsWith("ruhi") &&
              !(ignore || []).includes(d.id)
          );
      }
      if (section.includes("Epoch")) {
        return documentsList
          .filter((d) => !d.paragraphs.every((p) => p.id || p.section))
          .filter((d) => d.epoch === section && !(ignore || []).includes(d.id));
        // .slice(0, 50);
      }
      return documentsList
        .filter((d) => !d.paragraphs.every((p) => p.id || p.section))
        .filter(
          (d) =>
            d.author === section &&
            d.type !== "Prayer" &&
            !(ignore || []).includes(d.id)
        );
      // .slice(0, 50);
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
    fillParts: (parts, text, lines, quotes) => {
      const firstChar = /[a-z]/i.exec(
        text
          .normalize("NFD")
          .replace(/\u0323/g, "")
          .normalize("NFC")
      )?.index;
      const indices = unique([
        0,
        ...(firstChar === undefined ? [] : [firstChar + 1]),
        ...(parts || [])
          .filter((p) => typeof p !== "string")
          .flatMap((p) => [p.start, p.end]),
        ...(lines || []),
        ...(quotes || []).flatMap((q) => [q.start, q.end]),
        text.length,
      ]).sort((a, b) => a - b);
      const result = indices.slice(1).map((end, i) => ({
        start: indices[i],
        end,
        first: firstChar !== undefined && end <= firstChar + 1,
        count:
          (parts || []).find((p) => p.start <= indices[i] && p.end >= end)
            ?.count || 0,
        quote: !!(quotes || []).find(
          (q) => q.start <= indices[i] && q.end >= end
        ),
      }));
      if (!lines) return result;
      return lines
        .slice(0, -1)
        .map((start, i) =>
          result.filter((p) => p.start >= start && p.end <= lines[i + 1])
        );
    },
    getRef: (paragraphs, index) => {
      const p = paragraphs[index - 1];
      const doc = documents[p.id];
      const next = paragraphs[index];
      if (
        next?.id === p.id &&
        Math.abs(
          doc.paragraphs[next.paragraphs[0] - 1].index -
            doc.paragraphs[p.paragraphs[0] - 1].index
        ) <= 1
      ) {
        return "";
      }
      let j = 0;
      while (true) {
        const prev = paragraphs[index - j - 2];
        if (
          prev?.id === p.id &&
          Math.abs(
            doc.paragraphs[p.paragraphs[0] - 1].index -
              doc.paragraphs[prev.paragraphs[0] - 1].index
          ) <=
            j + 1
        ) {
          j++;
        } else {
          break;
        }
      }
      const paras = unique(
        Array.from({ length: j + 1 }).map(
          (_, k) =>
            doc.paragraphs[paragraphs[index - k - 1].paragraphs[0] - 1].index
        )
      );
      return {
        text: unique(
          [
            doc.author,
            ...doc.path,
            doc.title || (doc.item && "#" + doc.item),
            paras.length === 1
              ? `para ${paras[0]}`
              : `paras ${Math.min(...paras)}-${Math.max(...paras)}`,
          ].filter((x) => x)
        ).join(", "),
        link: Math.min(
          ...Array.from({ length: j + 1 }).map(
            (_, k) => paragraphs[index - k - 1].paragraphs[0]
          )
        ),
      };
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
