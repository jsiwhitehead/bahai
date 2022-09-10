import fs from "fs-extra";

import { files } from "./sources.js";
import { last, prettify, readJSON, simplifyText } from "./utils.js";

const flatten = (arr) => arr.reduce((res, x) => [...res, ...x], []);
const getId = (base, index) => base + "-" + `${index}`.padStart(3, "0");

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
    id: getId("the-universal-house-of-justice-messages", i),
    ...d,
  }));
  const gleanings = [];
  const selections = [];
  for (const author of Object.keys(files)) {
    await Promise.all(
      Object.keys(files[author]).map(async (file) => {
        const id = `${author}-${file}`;
        const docs = (await readJSON("process", id)) || [];
        if (id === "bahaullah-gleanings-writings-bahaullah") {
          gleanings.push(...docs.map((d, i) => ({ id: getId(id, i), ...d })));
        } else if (id === "abdul-baha-selections-writings-abdul-baha") {
          selections.push(...docs.map((d, i) => ({ id: getId(id, i), ...d })));
        } else {
          documents.push(
            ...docs
              .map((d, i) => ({ id: getId(id, i), ...d }))
              .filter(
                (d) =>
                  !d.path?.includes(
                    "Some Texts Revealed by Bahá’u’lláh Supplementary to the Kitáb‑i‑Aqdas"
                  ) &&
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
    .map((doc) => simplifyText(doc.paragraphs.join(" ")));
  for (const doc of gleanings) {
    const docParas = flatten(
      doc.paragraphs.map((text) =>
        text.split(/\. \. \./g).map((s) => simplifyText(s))
      )
    );
    const source = bahaullahDocs.some((text) =>
      docParas.every((p) => text.includes(p))
    );
    if (!source) documents.push(doc);
  }

  const abdulbahaDocs = documents
    .filter((d) => d.author === "‘Abdu’l‑Bahá")
    .map((doc) => simplifyText(doc.paragraphs.join(" ")));
  for (const doc of selections) {
    const docParas = flatten(
      doc.paragraphs.map((text) =>
        text.split(/\. \. \./g).map((s) => simplifyText(s))
      )
    );
    const source = abdulbahaDocs.some((text) =>
      docParas.every((p) => text.includes(p))
    );
    if (!source) documents.push(doc);
  }

  documents.sort(
    (a, b) => (a.years[0] || 0) - (b.years[0] || 0) || a.id.localeCompare(b.id)
  );
  const paragraphs = flatten(
    documents.map((doc) => [
      ...doc.paragraphs.map((text, i) => ({
        author: doc.author,
        years: doc.years,
        id: doc.id,
        para: i,
        text,
        simplified: simplifyText(text),
      })),
      ...flatten(
        Object.keys(doc.lines || {}).map((k) =>
          doc.lines[k].map((line) => ({
            author: doc.author,
            years: doc.years,
            id: doc.id,
            text: line.text,
            simplified: simplifyText(line.text),
          }))
        )
      ),
      {
        author: doc.author,
        years: doc.years,
        id: doc.id,
        text: doc.paragraphs.join(" "),
        simplified: simplifyText(doc.paragraphs.join(" ")),
      },
    ])
  );
  let counter = 0;
  for (const doc of documents) {
    const sources = {};
    doc.paragraphs.forEach((text, i) => {
      const chunks = text.split(/\s*\. \. \.\s*/g);
      const simplified = chunks.map((s) => simplifyText(s));
      if (simplified.join("").length >= 80) {
        const source = paragraphs.find(
          (p) =>
            p.id !== doc.id &&
            (p.author !== doc.author ||
              doc.author === "The Universal House of Justice") &&
            p.years[0] <= doc.years[1] &&
            simplified.every((s) => p.simplified.includes(s))
        );
        if (source) {
          sources[i] = {
            source: [source.id, source.para].filter((x) => x !== undefined),
            chunks: simplified.map((s, i) => {
              if (!chunks[i]) return [0, 0];
              if (source.text.includes(chunks[i])) {
                const start = source.text.indexOf(chunks[i]);
                return [start, start + chunks[i].length];
              }
              if (s === source.simplified) {
                return [0, source.text.length];
              }
              if (source.para === undefined) return [];
              console.log(counter++);
              source.indices = source.indices || getMappedIndices(source.text);
              const start = source.simplified.indexOf(s);
              return [
                source.indices[start].find(
                  (j) => source.text[j] === chunks[i][0]
                ) ??
                  source.indices[start].find(
                    (j) => !/^\W+ /.test(source.text.slice(j))
                  ),
                [...source.indices[start + s.length]]
                  .reverse()
                  .find((j) => source.text[j - 1] === last(chunks[i])) ??
                  [...source.indices[start + s.length]]
                    .reverse()
                    .find((j) => !/ \W+$/.test(source.text.slice(0, j))),
              ];
            }),
          };
        }
      }
    });
    if (Object.keys(sources).length > 0) doc.sources = sources;
  }

  await fs.promises.writeFile(
    `./src/data/documents.json`,
    prettify(
      JSON.stringify(
        documents.reduce((res, { id, ...d }) => ({ ...res, [id]: d }), {}),
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
