import fs from "fs-extra";

import { files } from "./sources.js";
import { readJSON, simplifyText, writeData } from "./utils.js";

(async () => {
  fs.emptyDirSync("./data/link");

  const allDocuments = (
    await readJSON("process", "the-universal-house-of-justice-messages")
  ).map((d, i) => ({
    id: `the-universal-house-of-justice-messages-${i}`,
    ...d,
  }));
  for (const author of Object.keys(files)) {
    await Promise.all(
      Object.keys(files[author]).map(async (file) => {
        const id = `${author}-${file}`;
        const docs = await readJSON("process", id);
        allDocuments.push(...docs.map((d, i) => ({ id: `${id}-${i}`, ...d })));
      })
    );
  }
  const documents = allDocuments
    .filter((d) => d.type !== "Prayer")
    .sort((a, b) => a.years[0] - b.years[0]);
  const allParagraphs = documents.reduce(
    (res, doc) => [
      ...res,
      ...doc.items.reduce(
        (res, item, i) => [
          ...res,
          ...item.paragraphs.map((text, j) => ({
            years: doc.years,
            id: doc.id,
            item: i,
            paragraph: j,
            text: simplifyText(text),
          })),
        ],
        []
      ),
    ],
    []
  );

  for (const d of documents) {
    d.items = d.items.map((item) => ({
      ...item,
      paragraphs: item.paragraphs.map((para) => {
        if (para.length < 100) return para;
        const simplified = simplifyText(para);
        const source = allParagraphs.find(
          (p) =>
            p.id !== d.id &&
            p.years[0] <= d.years[1] &&
            p.text.includes(simplified)
        );
        if (source) {
          return {
            id: source.id,
            item: source.item,
            paragraph: source.paragraph,
          };
        }
        return para;
      }),
    }));
  }

  await writeData("link", "documents", documents);
})();
