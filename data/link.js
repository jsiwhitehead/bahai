import fs from "fs-extra";

import { mapObject, prettify, readJSON, simplifyText } from "./utils.js";

const getMappedIndices = (s) => {
  const result = {};
  for (let i = 0; i <= s.length; i++) {
    const l = simplifyText(s.slice(0, i)).length;
    result[l] = [...(result[l] || []), i];
  }
  return result;
};

(async () => {
  const documents = (
    await Promise.all(
      fs
        .readdirSync("./data/process")
        .map((s) => s.slice(0, -5))
        .map(async (id) =>
          (
            await readJSON("process", id)
          ).map((d, i) => ({ id: id + "-" + `${i}`.padStart(3, "0"), ...d }))
        )
    )
  )
    .flat()
    .map((d) => ({
      ...d,
      paragraphs: d.paragraphs.map((base) => {
        const parts = (base.text || "").split(/\s*(\. \. \.|\[[^\]]*\])\s*/g);
        return {
          base,
          text: base.text || "",
          parts,
          simplified: parts.map((s) => simplifyText(s)),
        };
      }),
    }))
    .sort((a, b) => a.years[0] - b.years[0] || a.id.localeCompare(b.id));

  const quotes = {};
  for (const doc of documents) {
    doc.paragraphs = doc.paragraphs.map((paragraph, i) => {
      const { simplified, parts } = paragraph;
      const source =
        simplified.join("").length >= 80 &&
        documents.find(
          (d) =>
            d.id !== doc.id &&
            (d.author !== doc.author ||
              doc.author === "The Universal House of Justice") &&
            d.years[0] <= doc.years[1] &&
            simplified.every((s) =>
              d.paragraphs.some((p) => p.simplified.some((t) => t.includes(s)))
            )
        );
      if (!source) return paragraph;
      const allPara = source.paragraphs.findIndex((p) =>
        simplified.every((s) => p.simplified.some((t) => t.includes(s)))
      );
      const quoteParts = simplified
        .map((s, i) => {
          if (i % 2 === 1) return parts[i];
          if (s === "") return "";
          const para =
            allPara !== -1
              ? allPara
              : source.paragraphs.findIndex((p) =>
                  p.simplified.some((t) => t.includes(s))
                );
          const sourcePara = source.paragraphs[para];
          if (sourcePara.text.includes(parts[i])) {
            const start = sourcePara.text.indexOf(parts[i]);
            return {
              paragraph: para,
              start,
              end: start + parts[i].length,
            };
          }
          if (s === sourcePara.simplified.join("")) {
            return {
              paragraph: para,
              start: 0,
              end: sourcePara.text.length,
            };
          }
          sourcePara.indices =
            sourcePara.indices || getMappedIndices(sourcePara.text);
          const start = sourcePara.simplified.join("").indexOf(s);
          const startIndices = sourcePara.indices[start];
          const endIndices = [
            ...sourcePara.indices[start + s.length],
          ].reverse();
          return {
            paragraph: para,
            start:
              startIndices.find((j) => sourcePara.text[j] === parts[i][0]) ??
              startIndices.find((j) => !/^\W+ /.test(sourcePara.text.slice(j))),
            end:
              endIndices.find(
                (j) => sourcePara.text[j - 1] === last(parts[i])
              ) ??
              endIndices.find(
                (j) => !/ \W+$/.test(sourcePara.text.slice(0, j))
              ),
          };
        })
        .filter((s) => s);
      quotes[source.id] = quotes[source.id] || {};
      for (const { paragraph, start, end } of quoteParts.filter(
        (s) => typeof s !== "string"
      )) {
        quotes[source.id][paragraph] = quotes[source.id][paragraph] || [];
        quotes[source.id][paragraph].push({
          ref: { id: doc.id, paragraph: i },
          start,
          end,
        });
      }
      return {
        base: {
          id: source.id,
          paragraphs: [
            ...new Set(
              quoteParts
                .filter((s) => typeof s !== "string")
                .map((c) => c.paragraph)
            ),
          ].sort((a, b) => a - b),
          parts: quoteParts,
        },
        simplified: [],
      };
    });
  }

  const documentMap = documents.reduce((res, { paragraphs, ...d }) => {
    let counter = 1;
    const paras = paragraphs.map((p) => p.base);
    const allLines = paras.every((p) => p.type || p.lines);
    return {
      ...res,
      [d.id]: {
        ...d,
        paragraphs: paras.map((p) =>
          !p.text || p.type || (p.lines && !allLines)
            ? p
            : { index: counter++, ...p }
        ),
      },
    };
  }, {});
  await fs.promises.writeFile(
    `./src/data/documents.json`,
    prettify(JSON.stringify(documentMap, null, 2), "json"),
    "utf-8"
  );

  const quoteMap = mapObject(quotes, (docQuotes) =>
    mapObject(docQuotes, (parts) => {
      const splits = [...new Set(parts.flatMap((p) => [p.start, p.end]))].sort(
        (a, b) => a - b
      );
      return {
        refs: [...new Set(parts.map((p) => JSON.stringify(p.ref)))].map((s) =>
          JSON.parse(s)
        ),
        parts: splits
          .slice(0, -1)
          .map((start, i) => {
            const end = splits[i + 1];
            const count = parts.filter(
              (p) => p.start <= start && p.end >= end
            ).length;
            return { start, end, count };
          })
          .filter((x) => x.count),
      };
    })
  );
  await fs.promises.writeFile(
    `./src/data/quotes.json`,
    prettify(JSON.stringify(quoteMap, null, 2), "json"),
    "utf-8"
  );
})();

// import { files } from "./sources.js";
// import {
//   last,
//   mapObject,
//   notEmpty,
//   prettify,
//   readJSON,
//   simplifyText,
// } from "./utils.js";

// (async () => {
//   const documents = (
//     await readJSON("process", "the-universal-house-of-justice-messages")
//   ).map((d, i) => ({
//     id: "the-universal-house-of-justice-messages-" + `${i}`.padStart(3, "0"),
//     ...d,
//     paragraphs: d.paragraphs.map((text) => {
//       const parts = text.split(/\s*(\. \. \.|\[[^\]]*\])\s*/g);
//       return { text, parts, simplified: parts.map((s) => simplifyText(s)) };
//     }),
//   }));
//   const gleanings = [];
//   const selections = [];
//         if (id === "bahaullah-gleanings-writings-bahaullah") {
//           gleanings.push(...docs);
//         } else if (id === "abdul-baha-selections-writings-abdul-baha") {
//           selections.push(...docs);
//         } else {
//           documents.push(
//             ...docs.filter(
//               (d) =>
//                 ![
//                   "Some Texts Revealed by Bahá’u’lláh Supplementary to the Kitáb‑i‑Aqdas",
//                   "Part One: Excerpts from the Will and Testament of ‘Abdu’l‑Bahá",
//                 ].some((x) => d.path?.includes(x)) &&
//                 ![
//                   "bahaullah-days-remembrance-032",
//                   "bahaullah-days-remembrance-036",
//                   "bahaullah-tablets-bahaullah-017",
//                 ].includes(d.id)
//             )
//           );
//         }

//   const bahaullahDocs = documents
//     .filter((d) => d.author === "Bahá’u’lláh")
//     .map((doc) => flatten(doc.paragraphs.map((p) => p.simplified)).join(""));
//   for (const doc of gleanings) {
//     const source = bahaullahDocs.some((full) =>
//       doc.paragraphs.every((p) => p.simplified.every((s) => full.includes(s)))
//     );
//     if (!source) documents.push(doc);
//   }
//   const abdulbahaDocs = documents
//     .filter((d) => d.author === "‘Abdu’l‑Bahá")
//     .map((doc) => flatten(doc.paragraphs.map((p) => p.simplified)).join(""));
//   for (const doc of selections) {
//     const source = abdulbahaDocs.some((full) =>
//       doc.paragraphs.every((p) => p.simplified.every((s) => full.includes(s)))
//     );
//     if (!source) documents.push(doc);
//   }

//   await fs.promises.writeFile(
//     `./src/data/prayers.json`,
//     prettify(
//       JSON.stringify(
//         (
//           await readJSON("process", "prayers")
//         ).map(({ lines, paragraphs, ...d }) => ({
//           ...d,
//           lines: lines?.reduce(
//             (res, { index, lines }) => ({ ...res, [index]: lines }),
//             {}
//           ),
//           paragraphs,
//         })),
//         null,
//         2
//       ),
//       "json"
//     ),
//     "utf-8"
//   );
// })();
