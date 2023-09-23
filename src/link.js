import fs from "fs-extra";

import { last, prettify, readJSON, simplifyText } from "./utils.js";

const ignoreStarts = [
  " ",
  ",",
  "‑",
  "”",
  "abá",
  "Ábidín",
  "Abbás",
  "Abdu",
  "Ád",
  "ah",
  "Ahd",
  "Akká",
  "AKKÁ",
  "Alam",
  "Alá",
  "Alí",
  "Álí",
  "ALÍ",
  "ám",
  "Ammú",
  "Amú",
  "Arab",
  "Árif",
  "Áshúrá",
  "ávíyih",
  "áyidih",
  "Ayn",
  "Azíz",
  "AZÍZ",
  "Aṭá",
  "Aẓím",
  "‘áẓ",
  "bán",
  "farán",
  "far‑i",
  "far‑Q",
  "íd",
  "ih",
  "IH",
  "íl",
  "ÍLÍYYIH",
  "Ilm",
  "Imrán",
  "ín",
  "Ináyatí",
  "Iráq",
  "IRÁQ",
  "Ishqábád",
  "Izzat",
  "mán",
  "n,",
  "tamid",
  "timádu",
  "’u",
  "u’",
  "úd",
  "Údí",
  "ulamá",
  "Ulamá",
  "Umar",
  "Urvatu",
  "Uthmán",
  "ẓam",
];

const traverseUpdate = (array, start, func) => {
  for (const dir of [-1, 1]) {
    let j = dir;
    while (true) {
      const update = array[start + j] && func(array[start + j], j);
      if (update) {
        array[start + j] = update;
        j += dir;
      } else {
        break;
      }
    }
  }
};

const getMappedIndices = (s) => {
  const result = {};
  for (let i = 0; i <= s.length; i++) {
    const l = simplifyText(s.slice(0, i)).length;
    result[l] = [...(result[l] || []), i];
  }
  return result;
};
const getQuotePosition = (para, simplified, text) => {
  if (simplified === para.simplified) {
    return { start: 0, end: para.text.length };
  }
  if (para.text.includes(text)) {
    const start = para.text.indexOf(text);
    return { start, end: start + text.length };
  }
  para.indices = para.indices || getMappedIndices(para.text);
  const start = para.simplified.indexOf(simplified);
  const startIndices = para.indices[start];
  const endIndices = [...para.indices[start + simplified.length]].reverse();
  const cleanText = para.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return {
    start:
      startIndices.find(
        (i) => para.text[i].toLowerCase() === text[0].toLowerCase()
      ) ?? startIndices.find((i) => !/^\W* /.test(cleanText.slice(i))),
    end:
      endIndices.find(
        (i) => para.text[i - 1].toLowerCase() === last(text).toLowerCase()
      ) ?? endIndices.find((i) => !/ \W*$/.test(cleanText.slice(0, i))),
  };
};
const getQuoteParts = (doc, paraIndex, source, simplified, parts) => ({
  source,
  parts: parts.map((text, i) => {
    if (i % 2 === 1) return text;
    const pos = getQuotePosition(source.paragraph, simplified[i], text);
    source.paragraph.citations = source.paragraph.citations || [];
    source.paragraph.citations.push({
      doc: doc.id,
      paragraph: paraIndex,
      ...pos,
    });
    return pos;
  }),
});

const documents = (
  await Promise.all(
    fs
      .readdirSync("./data/process")
      .map((s) => s.slice(0, -5))
      .map(async (id) =>
        (await readJSON("process", id)).map((d, i) => ({
          id: id + "-" + `${i + 1}`.padStart(3, "0"),
          ...d,
        }))
      )
  )
)
  .flat()
  .map((d) => ({
    ...d,
    paragraphs: d.paragraphs.map((p) => ({
      ...p,
      text: p.text || "",
      simplified: simplifyText(p.text || ""),
      parts: p.text ? [p.text] : [],
    })),
  }))
  .sort((a, b) => {
    if (
      a.id.startsWith("bahaullah-days") &&
      b.id.startsWith("bahaullah-gleanings")
    ) {
      return 1;
    }
    if (
      a.id.startsWith("bahaullah-gleanings") &&
      b.id.startsWith("bahaullah-days")
    ) {
      return -1;
    }
    return a.years[0] - b.years[0] || a.id.localeCompare(b.id);
  });
// .filter(
//   (d) =>
//     ["‘Abdu’l‑Bahá"].includes(d.author) ||
//     d.id === "the-universal-house-of-justice-messages-484"
// );

const findSource = (doc, simplified, parts) => {
  if (!simplified) return null;
  if (
    parts[0].startsWith(
      "Hallowed be the Lord, the most excellent of all creators"
    )
  ) {
    return null;
  }
  for (const d of documents) {
    if (
      d.id !== doc.id &&
      !["bible", "quran"].some((s) => doc.id.startsWith(s)) &&
      !["bible", "quran"].some((s) => d.id.startsWith(s)) &&
      d.id !== "bahaullah-days-remembrance-037" &&
      !(
        d.id.startsWith("prayers-bahai-prayers-0") &&
        d.type !== "Prayer" &&
        !d.title
      ) &&
      (d.author !== doc.author ||
        doc.epoch ||
        doc.id.startsWith("prayers") ||
        doc.id.startsWith("bahaullah-gleanings-writings-bahaullah") ||
        doc.id.startsWith("bahaullah-days-remembrance") ||
        doc.id.startsWith("bahaullah-epistle-son-wolf") ||
        doc.id === "bahaullah-kitab-i-aqdas-005" ||
        doc.id.startsWith("abdul-baha-selections-writings-abdul-baha") ||
        doc.path.includes(
          "Part One: Excerpts from the Will and Testament of ‘Abdu’l‑Bahá"
        ) ||
        d.type === "Prayer" ||
        d.id.startsWith("bahaullah-hidden-words")) &&
      d.years[0] <= doc.years[1]
    ) {
      for (const [i, p] of d.paragraphs.entries()) {
        if (
          p.simplified.includes(simplified) &&
          (!(
            ["“", "‘"].includes(
              p.text[getQuotePosition(p, simplified, parts[0]).start - 1]
            ) ||
            ["”", "’"].includes(
              p.text[
                getQuotePosition(p, simplified, parts[parts.length - 1]).end
              ]
            )
          ) ||
            (d.id === "bahaullah-tablets-bahaullah-001" && i === 3))
        ) {
          return { doc: d, paragraph: p, index: i };
        }
      }
    }
  }
  return null;
};

const textToChunks = (doc, paraIndex, splitText, min, inline) => {
  const chunks = splitText.map((t) => {
    const parts = t.split(/(\s*(?:\[[^\]]*\])\s*)/g);
    const simplified = parts.map((s) => simplifyText(s));
    // if (inline && doc.author === "The Universal House of Justice") {
    //   console.log(parts);
    // }
    if (simplified.join("").length > 0 && simplified.join("").length < min) {
      return { text: t, parts, simplified };
    }
    const source = findSource(doc, simplified.join(""), parts);
    if (source) {
      if (inline) processInlineQuotes(source.doc);
      return getQuoteParts(doc, paraIndex, source, simplified, parts);
    }
    return t;
  });
  chunks.forEach((c, i) => {
    if (c.source) {
      traverseUpdate(chunks, i, (next) => {
        if (
          next.text &&
          c.source.paragraph.simplified.includes(next.simplified.join(""))
        ) {
          return getQuoteParts(
            doc,
            paraIndex,
            c.source,
            next.simplified,
            next.parts
          );
        }
      });
    }
  });
  return chunks;
};

for (const doc of documents) {
  if (
    !["bible", "quran", "additional-"].some((s) => doc.id.startsWith(s)) &&
    doc.type !== "Prayer" &&
    ![
      "the-universal-house-of-justice-messages-333",
      "the-universal-house-of-justice-messages-341",
      "the-universal-house-of-justice-messages-345",
      "the-universal-house-of-justice-messages-346",
    ].includes(doc.id)
  ) {
    console.log(doc.id);
    doc.paragraphs = doc.paragraphs.map((para, paraIndex) => {
      if (para.section) return para;
      return {
        ...para,
        startDots: para.text.startsWith(". . . "),
        endDots: para.text.endsWith(" . . ."),
        chunks: textToChunks(
          doc,
          paraIndex,
          para.text
            .replace(/^\. \. \. /, "")
            .replace(/ \. \. \.$/, "")
            .split(/(‘(?:’[a-z\u00C0-\u017F]|[^’“])+’|“[^”]+”)/g)
            .reduce(
              (res, t, i) => {
                if (i % 2 === 0) {
                  const [first, ...other] = t.split(/ \. \. \. /g);
                  res[res.length - 1] += first;
                  res.push(...other);
                } else {
                  res[res.length - 1] += t;
                }
                return res;
              },
              [""]
            ),
          80
        ),
      };
    });
    doc.paragraphs.forEach((para, paraIndex) => {
      if (para.chunks && para.chunks.length === 1 && para.chunks[0].source) {
        traverseUpdate(doc.paragraphs, paraIndex, (next, diff) => {
          const source = para.chunks[0].source;
          const index = source.index + diff;
          const paragraph = source.doc.paragraphs[index];
          if (
            next.chunks &&
            next.chunks.length === 1 &&
            next.chunks[0].text &&
            paragraph?.simplified.includes(next.chunks[0].simplified.join(""))
          ) {
            return {
              ...next,
              chunks: [
                getQuoteParts(
                  doc,
                  paraIndex,
                  { doc: source.doc, paragraph, index },
                  next.chunks[0].simplified,
                  next.chunks[0].parts
                ),
              ],
            };
          }
        });
      }
    });
    if (
      ["compilations", "ruhi", "world-centre-bahai-org"].some((s) =>
        doc.id.startsWith(s)
      )
    ) {
      doc.paragraphs = doc.paragraphs.map((para, paraIndex) => {
        if (!para.chunks) return para;
        return {
          ...para,
          chunks: para.chunks.map((c) => {
            if (typeof c === "string" || c.source) return c;
            const source = findSource(doc, c.simplified.join(""), c.parts);
            if (source) {
              return getQuoteParts(
                doc,
                paraIndex,
                source,
                c.simplified,
                c.parts
              );
            }
            return c;
          }),
        };
      });
    }
    doc.paragraphs = doc.paragraphs.map(
      ({ chunks, startDots, endDots, ...para }) => {
        if (!chunks) return para;
        const parts = chunks
          .flatMap((c, i) => (i === 0 ? [c] : [" . . . ", c]))
          .flatMap((c) => {
            if (typeof c === "string") return [c];
            if (c.source) {
              return c.parts.map((p) => {
                if (typeof p === "string") return p;
                return {
                  doc: c.source.doc.id,
                  paragraph: c.source.index,
                  text: c.source.paragraph.text.slice(p.start, p.end),
                  ...p,
                };
              });
            }
            return [c.text];
          });
        if (startDots) parts.unshift(". . . ");
        if (endDots) parts.push(" . . .");
        const joinedParts = parts.reduce((res, p) => {
          if (typeof p === "object") {
            res.push(p);
          } else {
            if (typeof res[res.length - 1] !== "string") res.push("");
            res[res.length - 1] += p;
          }
          return res;
        }, []);
        // if (chunks.some((c) => c.source) && chunks.some((c) => !c.source)) {
        //   console.log(parts);
        // }
        const newText = joinedParts
          .map((p) => (typeof p === "string" ? p : p.text))
          .join("");
        return {
          ...para,
          ...(joinedParts.some((p) => typeof p === "object")
            ? { simplified: "", quote: true }
            : {}),
          text: newText,
          ...(newText !== para.text ? { indices: undefined } : {}),
          parts: joinedParts,
        };
      }
    );
  }
}

const processInlineQuotes = (doc) => {
  if (
    !["bible", "quran"].some((s) => doc.id.startsWith(s)) &&
    doc.type !== "Prayer" &&
    !doc.processed
  ) {
    console.log(doc.id);
    doc.processed = true;
    doc.paragraphs.forEach((para, paraIndex) => {
      if (para.simplified) {
        const joins = [""];
        const quotes = [];
        para.text
          .split(/(‘(?:’[a-z\u00C0-\u017F]|[^’“])+’|“[^”]+”)/g)
          .forEach((t, i) => {
            if (
              i % 2 === 0 ||
              ignoreStarts.some((s) => t.slice(1).startsWith(s))
            ) {
              joins[joins.length - 1] += t;
            } else {
              joins[joins.length - 1] += t.slice(0, 1);
              quotes.push({
                startDots: t.slice(1, -1).startsWith(". . . "),
                endDots: t.slice(1, -1).endsWith(" . . ."),
                chunks: textToChunks(
                  doc,
                  paraIndex,
                  t
                    .slice(1, -1)
                    .replace(/^\. \. \. /, "")
                    .replace(/ \. \. \.$/, "")
                    .split(/ \. \. \. /g),
                  30,
                  true
                ),
              });
              joins.push(t.slice(-1));
            }
          });
        quotes.forEach((q, i) => {
          if (
            q.chunks.every((c) => c.source) &&
            new Set(
              q.chunks.map((c) =>
                JSON.stringify([c.source.doc.id, c.source.index])
              )
            ).size === 1
          ) {
            traverseUpdate(quotes, i, (next) => {
              if (
                next.chunks.length === 1 &&
                next.chunks[0].text &&
                q.chunks[0].source.paragraph.simplified.includes(
                  next.chunks[0].simplified.join("")
                )
              ) {
                return {
                  ...q,
                  chunks: [
                    getQuoteParts(
                      doc,
                      paraIndex,
                      q.chunks[0].source,
                      next.chunks[0].simplified,
                      next.chunks[0].parts
                    ),
                  ],
                };
              }
            });
          }
        });
        const parts = joins
          .flatMap((t, i) => {
            if (i === 0) return [t];
            const quoteParts = quotes[i - 1].chunks.flatMap((c, i) =>
              i === 0 ? [c] : [" . . . ", c]
            );
            if (quotes[i - 1].startDots) quoteParts.unshift(". . . ");
            if (quotes[i - 1].endDots) quoteParts.push(" . . .");
            return [...quoteParts, t];
          })
          .flatMap((c) => {
            if (typeof c === "string") return [c];
            if (c.source) {
              return c.parts.map((p) => {
                if (typeof p === "string") return p;
                return {
                  doc: c.source.doc.id,
                  paragraph: c.source.index,
                  text: c.source.paragraph.text.slice(p.start, p.end),
                  ...p,
                };
              });
            }
            return [c.text];
          })
          .reduce((res, p) => {
            if (typeof p === "object") {
              res.push(p);
            } else {
              if (typeof res[res.length - 1] !== "string") res.push("");
              res[res.length - 1] += p;
            }
            return res;
          }, []);
        const newText = parts
          .map((p) => (typeof p === "string" ? p : p.text))
          .join("");
        if (newText !== para.text) delete para.indices;
        para.text = newText;
        para.parts = parts;
      }
    });
  }
};
for (const doc of documents) processInlineQuotes(doc);

const documentMap = documents.reduce((res, d) => {
  let counter = 1;
  const allLines = d.paragraphs.every((p) => p.type || p.lines);
  return {
    ...res,
    [d.id]: {
      ...d,
      paragraphs: d.paragraphs.map((p) => ({
        ...(p.quote || p.section || p.type || (p.lines && !allLines)
          ? {}
          : { index: counter++ }),
        ...p,
        parts:
          p.parts.length === 0
            ? undefined
            : p.parts.map((part) =>
                typeof part === "string" ? part : { ...part, text: undefined }
              ),
        citations: p.citations?.sort(
          (a, b) =>
            documents.findIndex((x) => x.id === a.doc) -
            documents.findIndex((x) => x.id === b.doc)
        ),
        indices: undefined,
        text: undefined,
        simplified: undefined,
      })),
      processed: undefined,
    },
  };
}, {});

await fs.promises.writeFile(
  `./data/data.json`,
  await prettify(JSON.stringify(documentMap, null, 2), "json"),
  "utf-8"
);
