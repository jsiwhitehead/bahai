import fs from "fs-extra";

import { files } from "./sources.js";
import { prettify, readJSON, simplifyText } from "./utils.js";

const flatten = (arr) => arr.reduce((res, x) => [...res, ...x], []);
const getId = (base, index) => base + "-" + `${index}`.padStart(3, "0");

(async () => {
  const documents = (
    await readJSON("process", "the-universal-house-of-justice-messages")
  ).map((d, i) => ({
    id: getId("the-universal-house-of-justice-messages", i),
    ...d,
  }));
  const gleanings = [];
  for (const author of Object.keys(files)) {
    await Promise.all(
      Object.keys(files[author]).map(async (file) => {
        const id = `${author}-${file}`;
        const docs = (await readJSON("process", id)) || [];
        if (id === "bahaullah-gleanings-writings-bahaullah") {
          gleanings.push(...docs.map((d, i) => ({ id: getId(id, i), ...d })));
        } else {
          documents.push(...docs.map((d, i) => ({ id: getId(id, i), ...d })));
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

  documents.sort(
    (a, b) => (a.years[0] || 0) - (b.years[0] || 0) || a.id.localeCompare(b.id)
  );
  const paragraphs = flatten(
    documents.map((doc) => [
      ...doc.paragraphs.map((text, i) => ({
        years: doc.years,
        id: doc.id,
        para: i + 1,
        text: simplifyText(text),
      })),
      ...flatten(
        Object.keys(doc.lines || {}).map((k) =>
          doc.lines[k].map((line) => ({
            years: doc.years,
            id: doc.id,
            text: simplifyText(line.text),
          }))
        )
      ),
      {
        years: doc.years,
        id: doc.id,
        text: simplifyText(doc.paragraphs.join(" ")),
      },
    ])
  );

  for (const doc of documents) {
    const sources = {};
    doc.paragraphs.forEach((text, i) => {
      const simplified = text.split(/\. \. \./g).map((s) => simplifyText(s));
      if (simplified.join("").length >= 80) {
        const source = paragraphs.find(
          (p) =>
            p.id !== doc.id &&
            p.years[0] <= doc.years[1] &&
            simplified.every((s) => p.text.includes(s))
        );
        if (source) sources[i] = [source.id, source.para].filter((x) => x);
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
