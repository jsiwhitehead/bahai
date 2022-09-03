import fs from "fs-extra";

import { files } from "./sources.js";
import { readJSON, simplifyText, writeData } from "./utils.js";

const flatten = (arr) => arr.reduce((res, x) => [...res, ...x], []);

(async () => {
  fs.emptyDirSync("./data/link");

  const documents = (
    await readJSON("process", "the-universal-house-of-justice-messages")
  ).map((d, i) => ({
    id: `the-universal-house-of-justice-messages-${i}`,
    ...d,
  }));
  const gleanings = [];
  for (const author of Object.keys(files)) {
    await Promise.all(
      Object.keys(files[author]).map(async (file) => {
        const id = `${author}-${file}`;
        const docs = (await readJSON("process", id)) || [];
        if (id === "bahaullah-gleanings-writings-bahaullah") {
          gleanings.push(...docs.map((d, i) => ({ id: `${id}-${i}`, ...d })));
        } else {
          documents.push(...docs.map((d, i) => ({ id: `${id}-${i}`, ...d })));
        }
      })
    );
  }

  const bahaullahDocs = documents
    .filter((d) => d.author === "Bahá’u’lláh")
    .map((doc) =>
      simplifyText(flatten(doc.items.map((item) => item.paragraphs)).join(" "))
    );
  for (const doc of gleanings) {
    const docParas = flatten(
      doc.items[0].paragraphs.map((text) =>
        text.split(/\. \. \./g).map((s) => simplifyText(s))
      )
    );
    const source = bahaullahDocs.some((text) =>
      docParas.every((p) => text.includes(p))
    );
    if (!source) documents.push(doc);
  }

  documents.sort((a, b) => (a.years[0] || 0) - (b.years[0] || 0));
  const paragraphs = documents.reduce(
    (res, doc) => [
      ...res,
      ...doc.items.reduce(
        (res, item, i) => [
          ...res,
          ...item.paragraphs.map((text, j) => ({
            years: doc.years,
            id: doc.id,
            item: i,
            para: j,
            text: simplifyText(text),
          })),
        ],
        []
      ),
    ],
    []
  );

  for (const doc of documents) {
    const sources = {};
    doc.items.forEach((item, i) => {
      item.paragraphs.forEach((para, j) => {
        if (para.length >= 100) {
          const simplified = simplifyText(para);
          const source = paragraphs.find(
            (p) =>
              p.id !== doc.id &&
              p.years[0] <= doc.years[1] &&
              p.text.includes(simplified)
          );
          if (source) {
            sources[j] = [source.id, source.item, source.para];
          }
        }
      });
    });
    if (Object.keys(sources).length > 0) doc.sources = sources;
  }

  await writeData("link", "documents", documents);
})();
