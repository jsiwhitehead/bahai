import Koa from "koa";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";

import documentsBase from "./data/documents.json" assert { type: "json" };
import quotes from "./data/quotes.json" assert { type: "json" };

const unique = (x) => [...new Set(x)];

const getTime = (words) => {
  const time = words / 238;
  const scale = Math.min(Math.max(Math.round(Math.log(time + 1)), 1), 5);
  return Array.from({ length: scale })
    .map(() => "●")
    .join("");
  // if (time < 2.5) return "1‑2 mins";
  // if (time < 60) return `${Math.round(time / 5) * 5} mins`;
  // return `${Math.round(time / 6) / 10} hours`;
};

const getFirstChar = (index, text) => {
  if (index !== 1) return undefined;
  const result = /[a-z]/i.exec(text)?.index;
  return result === undefined ? result : result + 1;
};

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
      paras &&
        (paras.length === 1
          ? doc.paragraphs[paras[0]].index &&
            `para ${doc.paragraphs[paras[0]].index}`
          : `paras ${Math.min(
              ...paras.map((p) => doc.paragraphs[p].index).filter((x) => x)
            )}‑${Math.max(
              ...paras.map((p) => doc.paragraphs[p].index).filter((x) => x)
            )}`),
    ]
      .filter((x) => x)
      .map((s) => (s.length > 50 ? s : s.replace(/ /g, " ")))
  ).join(", ");

const allParagraphs = [];

const documents = Object.keys(documentsBase).map((id) => {
  const { paragraphs, path, ...info } = documentsBase[id];

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

  const texts = paragraphs
    .map((p) => {
      if (p.section) return p.title || "";
      if (p.id) {
        const doc = documentsBase[p.id];
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
    })
    .map((t) =>
      t
        .normalize("NFD")
        .replace(/\u0323/g, "")
        .normalize("NFC")
    );
  const words = texts.map((t) => t.split(" ").length);

  const paras = paragraphs
    .map((p, i) => {
      const text = texts[i];
      if (p.id) {
        return {
          type: "quote",
          text,
          author: documentsBase[p.id].author,
          ref: getRef(documentsBase[p.id], p.paragraphs),
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
    })
    .map((p, i) => ({
      id,
      author: p.author || info.author,
      epoch: info.epoch,
      ref: getRef(documentsBase[id], [i]),
      score:
        (p.type === "quote" ? [] : p.type === "lines" ? p.lines.flat() : p.text)
          .map((t) => Math.pow(t.count, 2) * t.text.split(" ").length)
          .reduce((res, n) => res + n, 0) / words[i],
      // score: Math.max(
      //   ...(p.type === "quote"
      //     ? []
      //     : p.type === "lines"
      //     ? p.lines.flat()
      //     : p.text
      //   ).map((t) => t.count)
      // ),
      ...p,
    }));
  allParagraphs.push(...paras);

  const fullWords = words.reduce((res, n) => res + n, 0);
  return {
    ...info,
    ...(titlePath.length > 0 ? { path: titlePath } : {}),
    fullPath: cleanPath,
    time: getTime(fullWords),
    score:
      paras.map((p) => p.score).reduce((res, n) => res + n, 0) /
      Math.sqrt(paras.length),
    // score: Math.max(...paras.map((p) => p.score)),
    allType: paras.every((p) => p.lines || p.type),
    paragraphs: paras,
  };
});

// const collectionsObj = docsInfo.reduce((res, d) => {
//   const k = `${d.author}-${d.fullPath[0]}`;
//   return { ...res, [k]: [...(res[k] || []), d] };
// }, {});
// const collections = Object.keys(collectionsObj)
//   .map((k) => collectionsObj[k])
//   .filter((c) => c[0].fullPath[0] !== "Additional")
//   .map((c) => {
//     const words = c.reduce((res, d) => res + d.words, 0);
//     return {
//       id: c[0].id.slice(0, -4),
//       author: c[0].author,
//       title: c[0].fullPath[0] || c[0].title,
//       words,
//       time: getTime(words),
//       documents: c.sort((a, b) => a.item - b.item),
//     };
//   });

const app = new Koa();
app.use(cors());
app.use(bodyParser());

const authors = {
  "Bahá’í Era": [
    "The Báb",
    "Bahá’u’lláh",
    "‘Abdu’l‑Bahá",
    "Shoghi Effendi",
    "The Universal House of Justice",
  ],
  "Heroic Age": ["The Báb", "Bahá’u’lláh", "‘Abdu’l‑Bahá"],
  "Formative Age": ["Shoghi Effendi", "The Universal House of Justice"],
  "Word of God": ["The Báb", "Bahá’u’lláh"],
};

const router = new Router();
router
  // .get("/", (ctx) => {
  //   ctx.body = "Hello World!";
  // })
  // .post("/collections", (ctx) => {
  //   const { author } = ctx.request.body;
  //   ctx.body = collections
  //     .filter((c) => !author || author.includes(c.author))
  //     .sort((a, b) => b.words - a.words || a.id.localeCompare(b.id));
  // })
  .post("/paragraphs", (ctx) => {
    const { author } = ctx.request.body;
    const allAuthors = authors[author] || (author && [author]);
    ctx.body = allParagraphs
      .filter((d) => d.score > 0)
      .filter(
        (d) =>
          ![
            "The Ruhi Institute",
            "Compilation",
            "The Bible",
            "Muḥammad",
          ].includes(d.author) && d.type !== "Prayer"
      )
      .filter(
        (d) =>
          !author ||
          allAuthors.includes(d.author) ||
          allAuthors.includes(d.epoch)
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 250);
  })
  .post("/documents", (ctx) => {
    const { author } = ctx.request.body;
    const allAuthors = authors[author] || (author && [author]);
    ctx.body = documents
      .filter(
        (d) =>
          ![
            "The Ruhi Institute",
            "Compilation",
            "The Bible",
            "Muḥammad",
          ].includes(d.author) &&
          d.path?.[0] !== "Additional" &&
          d.type !== "Prayer"
      )
      .filter(
        (d) =>
          !author ||
          allAuthors.includes(d.author) ||
          allAuthors.includes(d.epoch)
      )
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
      .map(({ paragraphs, ...info }) => info)
      .slice(0, 500);
  })
  .post("/prayers", (ctx) => {
    const { author } = ctx.request.body;
    const allAuthors = authors[author] || (author && [author]);
    ctx.body = documents
      .filter((d) => d.type === "Prayer")
      .filter((d) => !author || allAuthors.includes(d.author))
      .sort((a, b) => a.length - b.length || a.id.localeCompare(b.id));
  })
  .post("/documentById", (ctx) => {
    const { id } = ctx.request.body;
    ctx.body = documents.find((d) => d.id === id);
  });
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
