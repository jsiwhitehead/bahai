import Koa from "koa";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";

import documents from "./data/documents.json" assert { type: "json" };
import quotes from "./data/quotes.json" assert { type: "json" };

const unique = (x) => [...new Set(x)];

const getText = (p) => {
  if (p.section) return p.title || "";
  if (p.id) {
    const doc = documents[p.id];
    if (!p.parts) return doc.paragraphs[p.paragraphs[0]].text;
    return p.parts
      .map((x) =>
        typeof x === "string"
          ? x
          : doc.paragraphs[x.paragraph].text.slice(x.start, x.end)
      )
      .join("");
  }
  return p.text;
};

const getTime = (words) => {
  const time = words / 238;
  if (time < 2.5) return "1‑2 mins";
  if (time < 60) return `${Math.round(time / 5) * 5} mins`;
  return `${Math.round(time / 6) / 10} hours`;
};

const docsInfo = Object.keys(documents)
  .map((id) => {
    const { paragraphs, path, ...info } = documents[id];
    const cleanPath =
      path &&
      unique(
        path.filter(
          (p) =>
            ![
              "Selections from the Writings of the Báb",
              "Part Two: Letters from Shoghi Effendi",
            ].includes(p)
        )
      );
    const titlePath = unique([...cleanPath, info.title]).slice(0, -1);
    const words = paragraphs
      .map((p) => getText(p).split(" ").length)
      .reduce((res, n) => res + n, 0);
    return {
      ...info,
      ...(titlePath.length > 0 ? { path: titlePath } : {}),
      fullPath: cleanPath,
      words,
      time: getTime(words),
      allType: paragraphs.every((p) => p.lines || p.id || p.type),
    };
  })
  .filter(
    (d) =>
      !["The Ruhi Institute", "Compilation", "The Bible", "Muḥammad"].includes(
        d.author
      )
  );

const collectionsObj = docsInfo.reduce((res, d) => {
  const k = `${d.author}-${d.fullPath[0]}`;
  return { ...res, [k]: [...(res[k] || []), d] };
}, {});
const collections = Object.keys(collectionsObj)
  .map((k) => collectionsObj[k])
  .filter((c) => c[0].fullPath[0] !== "Additional")
  .map((c) => {
    const words = c.reduce((res, d) => res + d.words, 0);
    return {
      id: c[0].id.slice(0, -4),
      author: c[0].author,
      title: c[0].fullPath[0] || c[0].title,
      words,
      time: getTime(words),
      documents: c.sort((a, b) => a.item - b.item),
    };
  });

const getRef = (doc, paras) =>
  unique(
    [
      doc.author,
      ...(doc.path || []).filter(
        (p) =>
          ![
            "Selections from the Writings of the Báb",
            "Part Two: Letters from Shoghi Effendi",
            "Selected Messages of the Universal House of Justice",
            "Additional",
          ].includes(p)
      ),
      doc.title || (doc.item && `#${doc.item}`),
      paras && paras.length === 1
        ? doc.paragraphs[paras[0]].index &&
          `para ${doc.paragraphs[paras[0]].index}`
        : `paras ${Math.min(
            ...paras.map((p) => doc.paragraphs[p].index).filter((x) => x)
          )}‑${Math.max(
            ...paras.map((p) => doc.paragraphs[p].index).filter((x) => x)
          )}`,
    ]
      .filter((x) => x)
      .map((s) => (s.length > 50 ? s : s.replace(/ /g, " ")))
  ).join(", ");

const getFirstChar = (index, text) => {
  if (index !== 1) return undefined;
  const result = /[a-z]/i.exec(text)?.index;
  return result === undefined ? result : result + 1;
};

const app = new Koa();
app.use(cors());
app.use(bodyParser());

const router = new Router();
router
  .get("/", (ctx) => {
    ctx.body = "Hello World!";
  })
  .post("/collections", (ctx) => {
    const { author } = ctx.request.body;
    ctx.body = collections
      .filter((c) => !author || author.includes(c.author))
      .sort((a, b) => b.words - a.words || a.id.localeCompare(b.id));
  })
  .post("/documents", (ctx) => {
    const { author } = ctx.request.body;
    ctx.body = docsInfo
      .filter((d) => !author || author.includes(d.author))
      .sort((a, b) => b.words - a.words || a.id.localeCompare(b.id))
      .slice(0, 500);
  })
  .post("/documentById", (ctx) => {
    const { id } = ctx.request.body;
    ctx.body = docsInfo.find((d) => d.id === id);
  })
  .post("/paragraphs", (ctx) => {
    const { id } = ctx.request.body;
    ctx.body = documents[id].paragraphs.map((p, i) => {
      const text = getText(p)
        .normalize("NFD")
        .replace(/\u0323/g, "")
        .normalize("NFC");
      if (p.id) {
        return {
          type: "quote",
          text,
          author: documents[p.id].author,
          ref: getRef(documents[p.id], p.paragraphs),
        };
      }
      const first = getFirstChar(p.index, text);
      const indices = unique([
        0,
        ...(first === undefined ? [] : [first]),
        ...(quotes?.[id]?.[i]?.parts || [])
          .filter((q) => typeof q !== "string")
          .flatMap((q) => [q.start, q.end]),
        ...(p.lines || []).flatMap((l) => [l, l - 1]),
        ...(p.quotes || []).flatMap((q) => [q.start, q.end]),
        text.length,
      ]).sort((a, b) => a - b);
      const parts = indices.slice(1).map((end, j) => {
        const start = indices[j];
        return {
          start,
          end,
          text: text.slice(start, end),
          first: first !== undefined && end <= first,
          count:
            (quotes?.[id]?.[i]?.parts || []).find(
              (q) => q.start <= start && q.end >= end
            )?.count || 0,
          quote: !!(p.quotes || []).find(
            (q) => q.start <= start && q.end >= end
          ),
        };
      });
      if (p.lines) {
        return {
          index: p.index,
          type: "lines",
          lines: p.lines.slice(0, -1).map((start, j) => {
            const end = p.lines[j + 1] - 1;
            return parts.filter((x) => x.start >= start && x.end <= end);
          }),
        };
      }
      return {
        ...p,
        text: parts,
      };
    });
  });
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
