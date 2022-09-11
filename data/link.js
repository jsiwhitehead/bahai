import fs from "fs-extra";

import { files } from "./sources.js";
import { last, notEmpty, prettify, readJSON, simplifyText } from "./utils.js";

const flatten = (arr) => arr.reduce((res, x) => [...res, ...x], []);

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
    await readJSON("process", "the-universal-house-of-justice-messages")
  ).map((d, i) => ({
    id: "the-universal-house-of-justice-messages-" + `${i}`.padStart(3, "0"),
    ...d,
    paragraphs: d.paragraphs.map((text) => {
      const parts = text.split(/\s*(\. \. \.|\[[^\]]*\])\s*/g);
      return { text, parts, simplified: parts.map((s) => simplifyText(s)) };
    }),
  }));
  const gleanings = [];
  const selections = [];
  for (const author of Object.keys(files)) {
    await Promise.all(
      Object.keys(files[author]).map(async (file) => {
        const id = `${author}-${file}`;
        const docs = ((await readJSON("process", id)) || []).map((d, i) => ({
          id: id + "-" + `${i}`.padStart(3, "0"),
          ...d,
          paragraphs: d.paragraphs.map((text) => {
            const parts = text.split(/\s*(\. \. \.|\[[^\]]*\])\s*/g);
            return {
              text,
              parts,
              simplified: parts.map((s) => simplifyText(s)),
            };
          }),
        }));
        if (id === "bahaullah-gleanings-writings-bahaullah") {
          gleanings.push(...docs);
        } else if (id === "abdul-baha-selections-writings-abdul-baha") {
          selections.push(...docs);
        } else {
          documents.push(
            ...docs.filter(
              (d) =>
                ![
                  "Some Texts Revealed by Bahá’u’lláh Supplementary to the Kitáb‑i‑Aqdas",
                  "Part One: Excerpts from the Will and Testament of ‘Abdu’l‑Bahá",
                ].some((x) => d.path?.includes(x)) &&
                ![
                  "bahaullah-days-remembrance-032",
                  "bahaullah-days-remembrance-036",
                  "bahaullah-tablets-bahaullah-017",
                ].includes(d.id)
            )
          );
        }
      })
    );
  }

  const bahaullahDocs = documents
    .filter((d) => d.author === "Bahá’u’lláh")
    .map((doc) => flatten(doc.paragraphs.map((p) => p.simplified)).join(""));
  for (const doc of gleanings) {
    const source = bahaullahDocs.some((full) =>
      doc.paragraphs.every((p) => p.simplified.every((s) => full.includes(s)))
    );
    if (!source) documents.push(doc);
  }
  const abdulbahaDocs = documents
    .filter((d) => d.author === "‘Abdu’l‑Bahá")
    .map((doc) => flatten(doc.paragraphs.map((p) => p.simplified)).join(""));
  for (const doc of selections) {
    const source = abdulbahaDocs.some((full) =>
      doc.paragraphs.every((p) => p.simplified.every((s) => full.includes(s)))
    );
    if (!source) documents.push(doc);
  }

  documents.sort(
    (a, b) => (a.years[0] || 0) - (b.years[0] || 0) || a.id.localeCompare(b.id)
  );
  //     ...flatten(
  //       Object.keys(doc.lines || {}).map((k) =>
  //         doc.lines[k].map((line) => ({
  //           author: doc.author,
  //           years: doc.years,
  //           id: doc.id,
  //           text: line.text,
  //           simplified: simplifyText(line.text),
  //         }))
  //       )

  for (const doc of documents) {
    const quotes = [];
    let counter = -1;
    doc.paragraphs = doc.paragraphs.filter((paragraph) => {
      if (paragraph.simplified.join("").length >= 80) {
        const source = documents.find(
          (d) =>
            d.id !== doc.id &&
            (d.author !== doc.author ||
              doc.author === "The Universal House of Justice") &&
            d.years[0] <= doc.years[1] &&
            paragraph.simplified.every((s) =>
              d.paragraphs.some((p) => p.simplified.some((t) => t.includes(s)))
            )
        );
        if (source) {
          quotes.push({ index: counter, source, ...paragraph });
          return false;
        }
      }
      counter++;
      return true;
    });
    doc.quotes = quotes;
  }

  for (const doc of documents) {
    const result = {};
    for (const { index, source, simplified, parts } of doc.quotes) {
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
      result[index] = [
        ...(result[index] || []),
        {
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
      ];
    }
    doc.quotes = notEmpty(result);
  }

  await fs.promises.writeFile(
    `./src/data/documents.json`,
    prettify(
      JSON.stringify(
        documents.reduce(
          (res, { id, paragraphs, ...d }) => ({
            ...res,
            [id]: { ...d, paragraphs: paragraphs.map((p) => p.text) },
          }),
          {}
        ),
        null,
        2
      ),
      "json"
    ),
    "utf-8"
  );

  await fs.promises.copyFile(
    "./data/process/prayers.json",
    "./src/data/prayers.json"
  );
})();
