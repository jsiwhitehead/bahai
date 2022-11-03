import fs from "fs-extra";
import lunr from "lunr";

import stem from "./porter2.js";

const normaliseString = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w‑]/g, "");

(async () => {
  const documents = JSON.parse(
    await fs.promises.readFile(`./src/data/documents.json`, "utf-8")
  );
  const quotes = JSON.parse(
    await fs.promises.readFile(`./src/data/quotes.json`, "utf-8")
  );
  const documentsList = Object.keys(documents)
    .map((k) => documents[k])
    .map((d) => {
      const words = d.paragraphs
        .flatMap((p) => {
          if (p.section) return p.title || "";
          if (p.id) {
            const doc = documents[p.id];
            if (!p.parts) return doc.paragraphs[p.paragraphs[0] - 1].text;
            return p.parts
              .filter((part) => typeof part !== "string")
              .map(({ paragraph, start, end }) =>
                doc.paragraphs[paragraph - 1].text.slice(start, end)
              );
          }
          return p.text;
        })
        .map((s) => s.split(" ").length)
        .reduce((a, b) => a + b, 0);
      const score = Object.keys(quotes[d.id] || {})
        .flatMap((k) =>
          quotes[d.id][k].parts.map(
            (p) =>
              d.paragraphs[parseInt(k) - 1].text
                .slice(p.start, p.end)
                .trim()
                .split(" ").length * Math.pow(p.count, 2)
          )
        )
        .reduce((res, n) => res + n, 0);
      return { ...d, words, score: score / Math.sqrt(d.words) / 500 };
    });

  lunr.tokenizer.separator = /[\s\—]+/;
  const normaliseWords = (token) => {
    const normalised = normaliseString(token.toString());
    if (!normalised.includes("‑")) return token.update(() => normalised);
    return [
      token.update(() => normalised.replace("‑", "")),
      ...normalised.split("‑").map((s) => token.clone().update(() => s)),
    ];
  };
  lunr.Pipeline.registerFunction(normaliseWords, "normaliseWords");
  const porter2Stemmer = (token) => token.update(() => stem(token.toString()));
  lunr.Pipeline.registerFunction(porter2Stemmer, "porter2Stemmer");
  const addSynonyms = (token) =>
    ["gather", "meet"].includes(token.toString())
      ? ["gather", "meet"].map((s) => token.clone().update(() => s))
      : token;
  lunr.Pipeline.registerFunction(addSynonyms, "addSynonyms");

  const searchBuilder = new lunr.Builder();
  searchBuilder.pipeline.add(
    normaliseWords,
    lunr.stopWordFilter,
    porter2Stemmer
  );
  searchBuilder.searchPipeline.add(porter2Stemmer, addSynonyms);
  searchBuilder.ref("ref");
  searchBuilder.field("text");
  // searchBuilder.b(0.5);
  // searchBuilder.k1(0.1);
  documentsList
    .filter((d) => !d.id.startsWith("bible") && !d.id.startsWith("quran"))
    .forEach((doc) => {
      doc.paragraphs.forEach((p, i) => {
        searchBuilder.add(
          { ref: `${doc.id}#${i + 1}`, text: p.text || "" },
          { boost: doc.score }
        );
      });
    });
  const searchIndex = searchBuilder.build();

  await fs.promises.writeFile(
    `./src/data/search.json`,
    JSON.stringify(searchIndex),
    "utf-8"
  );
})();
