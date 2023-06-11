import fs from "fs-extra";

import { last, prettify, readJSON, simplifyText } from "./utils.js";

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
      startIndices.find((i) => para.text[i] === text[0]) ??
      startIndices.find((i) => !/^\W* /.test(cleanText.slice(i))),
    end:
      endIndices.find((i) => para.text[i - 1] === last(text)) ??
      endIndices.find((i) => !/ \W*$/.test(cleanText.slice(0, i))),
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

(async () => {
  const documents = (
    await Promise.all(
      fs
        .readdirSync("./data/process")
        .map((s) => s.slice(0, -5))
        .map(async (id) =>
          (
            await readJSON("process", id)
          ).map((d, i) => ({
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
    })
    .filter((d) =>
      ["Bahá’u’lláh", "‘Abdu’l‑Bahá", "Shoghi Effendi"].includes(d.author)
    );

  const findSource = (doc, simplified) => {
    if (!simplified) return null;
    const source = documents.find(
      (d) =>
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
        d.years[0] <= doc.years[1] &&
        d.paragraphs.some((p) => p.simplified.includes(simplified))
    );
    if (!source) return null;
    const index = source.paragraphs.findIndex((p) =>
      p.simplified.includes(simplified)
    );
    return {
      doc: source,
      paragraph: source.paragraphs[index],
      index,
    };
  };

  const textToChunks = (doc, paraIndex, splitText, min) => {
    const chunks = splitText.map((t) => {
      const parts = t.split(/(\s*(?:\[[^\]]*\])\s*)/g);
      const simplified = parts.map((s) => simplifyText(s));
      if (simplified.join("").length < min) {
        return { text: t, parts, simplified };
      }
      const source = findSource(doc, simplified.join(""));
      if (source) {
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
    console.log(doc.id);
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
      doc.paragraphs = doc.paragraphs.map((para, paraIndex) => {
        if (para.section) return para;
        return {
          ...para,
          chunks: textToChunks(
            doc,
            paraIndex,
            para.text
              .split(/(‘(?:’[a-z\u00C0-\u017F]|[^’])+’|“[^”]+”)/g)
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
              const source = findSource(doc, c.simplified.join(""));
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
      doc.paragraphs = doc.paragraphs.map(({ chunks, ...para }) => {
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
        // if (chunks.some((c) => c.source) && chunks.some((c) => !c.source)) {
        //   console.log(parts);
        // }
        return {
          ...para,
          ...(parts.some((p) => typeof p === "object")
            ? { simplified: "", quote: true }
            : {}),
          parts,
        };
      });
    }
  }

  for (const doc of documents) {
    console.log(doc.id);
    if (!["bible", "quran", "additional-"].some((s) => doc.id.startsWith(s))) {
      doc.paragraphs = doc.paragraphs.map((para, paraIndex) => {
        if (!para.simplified) return para;
        const joins = [""];
        const quotes = [];
        para.text
          .split(/(‘(?:’[a-z\u00C0-\u017F]|[^’])+’|“[^”]+”)/g)
          .forEach((t, i) => {
            if (
              i % 2 === 0 ||
              ignoreStarts.some((s) => t.slice(1).startsWith(s))
            ) {
              joins[joins.length - 1] += t;
            } else {
              joins[joins.length - 1] += t.slice(0, 1);
              quotes.push(t.slice(1, -1));
              joins.push(t.slice(-1));
            }
          });
        const mapped = quotes.map((text) =>
          textToChunks(doc, paraIndex, text.split(/ \. \. \. /g), 30)
        );
        mapped.forEach((chunks, i) => {
          if (chunks.length === 1 && chunks[0].source) {
            traverseUpdate(mapped, i, (next) => {
              if (
                next.length === 1 &&
                next[0].text &&
                chunks[0].source.paragraph.simplified.includes(
                  next[0].simplified.join("")
                )
              ) {
                return [
                  getQuoteParts(
                    doc,
                    paraIndex,
                    chunks[0].source,
                    next[0].simplified,
                    next[0].parts
                  ),
                ];
              }
            });
          }
        });
        const parts = joins
          .flatMap((t, i) =>
            i === 0
              ? [t]
              : [
                  ...mapped[i - 1].flatMap((c, i) =>
                    i === 0 ? [c] : [" . . . ", c]
                  ),
                  t,
                ]
          )
          .flatMap((c) => {
            if (typeof c === "string") return [c];
            if (c.source) {
              return c.parts.map((p) => {
                if (typeof p === "string") return p;
                return {
                  doc: c.source.doc.id,
                  paragraph: c.source.index,
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
        return {
          ...para,
          parts,
        };
      });
    }
  }

  const documentMap = documents.reduce((res, { paragraphs, ...d }) => {
    let counter = 1;
    const allLines = paragraphs.every((p) => p.type || p.lines);
    return {
      ...res,
      [d.id]: {
        ...d,
        paragraphs: paragraphs.map((p) => ({
          ...(p.quote || p.section || p.type || (p.lines && !allLines)
            ? {}
            : { index: counter++ }),
          ...p,
          indices: undefined,
          text: undefined,
          simplified: undefined,
        })),
      },
    };
  }, {});

  // for (const id of Object.keys(quotes).filter((id) => documentMap[id])) {
  //   for (const para of Object.keys(quotes[id])) {
  //     const fixedParts = quotes[id][para].map((p) => {
  //       const text = documentMap[id].paragraphs[parseInt(para, 10)].text;
  //       if (!text) console.log(p.ref);
  //       return { ref: p.ref, start: p.start || 0, end: p.end || text?.length };
  //     });
  //     const splits = [
  //       ...new Set(fixedParts.flatMap((p) => [p.start, p.end])),
  //     ].sort((a, b) => a - b);
  //     documentMap[id].paragraphs[para].citations = {
  //       refs: [...new Set(fixedParts.map((p) => JSON.stringify(p.ref)))].map(
  //         (s) => JSON.parse(s)
  //       ),
  //       parts: splits
  //         .slice(0, -1)
  //         .map((start, i) => {
  //           const end = splits[i + 1];
  //           const count = [
  //             ...new Set(
  //               fixedParts
  //                 .filter((p) => p.start <= start && p.end >= end)
  //                 .map((p) => p.ref.id)
  //             ),
  //           ].length;
  //           return { start, end, count };
  //         })
  //         .filter((x) => x.count),
  //     };
  //   }
  // }

  await fs.promises.writeFile(
    `./data/data.json`,
    prettify(JSON.stringify(documentMap, null, 2), "json"),
    "utf-8"
  );
})();
