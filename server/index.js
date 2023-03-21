import Koa from "koa";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";

import documents from "./data/documents.json" assert { type: "json" };

const unique = (x) => [...new Set(x)];

const getText = (p) => {
  if (p.section) return p.title || "* * *";
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

const docsInfo = Object.keys(documents).map((id) => {
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
  };
});

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
      // path: c[0].fullPath.length === 0 ? [c[0].title] : c[0].fullPath,
      words,
      time: getTime(words),
      documents: c.sort((a, b) => a.item - b.item),
    };
  });

const app = new Koa();
app.use(cors());
app.use(bodyParser());

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
        ? `para ${paras[0]}`
        : `paras ${Math.min(...paras)}‑${Math.max(...paras)}`,
    ]
      .filter((x) => x)
      .map((s) => (s.length > 50 ? s : s.replace(/ /g, " ")))
  ).join(", ");

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
      .sort((a, b) => b.words - a.words || a.id.localeCompare(b.id));
  })
  .post("/documentById", (ctx) => {
    const { id } = ctx.request.body;
    ctx.body = docsInfo.find((d) => d.id === id);
  })
  .post("/paragraphs", (ctx) => {
    const { id } = ctx.request.body;
    ctx.body = documents[id].paragraphs.map((p) => {
      if (p.id) {
        return {
          type: "quote",
          text: p.paragraphs
            .map((i) => documents[p.id].paragraphs[i].text)
            .join(""),
          author: documents[p.id].author,
          ref: getRef(documents[p.id], p.paragraphs),
        };
      }
      if (p.lines) {
        return {
          type: "lines",
          lines: p.lines
            .slice(0, -1)
            .map((l, i) => p.text.slice(l, p.lines[i + 1] - 1)),
        };
      }
      return p;
    });
  });
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
