import fs from "fs-extra";

import { last, mapObject, prettify, readJSON, simplifyText } from "./utils.js";

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
    .sort((a, b) => {
      if (
        ["bahaullah-days", "bahaullah-gleanings"].every(
          (s) => a.id.startsWith(s) || b.id.startsWith(s)
        )
      ) {
        return a.id.startsWith("bahaullah-gleanings") ? -1 : 1;
      }
      return a.years[0] - b.years[0] || a.id.localeCompare(b.id);
    });

  const quotes = {};
  for (const doc of documents) {
    if (
      !["prayers", "bible", "quran"].some((s) => doc.id.includes(s)) &&
      !doc.id.startsWith("additional-")
    ) {
      doc.paragraphs = doc.paragraphs.map((paragraph, i) => {
        const { simplified, parts } = paragraph;
        const source =
          simplified.join("").length >= 80 &&
          documents.find(
            (d) =>
              d.id !== doc.id &&
              d.id !== "bahaullah-days-remembrance-036" &&
              (d.author !== doc.author ||
                doc.author === "The Universal House of Justice" ||
                doc.id.startsWith("bahaullah-gleanings-writings-bahaullah") ||
                doc.id.startsWith("bahaullah-days-remembrance") ||
                doc.id.startsWith(
                  "abdul-baha-selections-writings-abdul-baha"
                ) ||
                d.type === "Prayer") &&
              d.years[0] <= doc.years[1] &&
              simplified.every((s) =>
                d.paragraphs.some((p) =>
                  p.simplified.some((t) => t.includes(s))
                )
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
                startIndices.find(
                  (j) => !/^\W+ /.test(sourcePara.text.slice(j))
                ),
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
            const count = [
              ...new Set(
                parts
                  .filter((p) => p.start <= start && p.end >= end)
                  .map((p) => p.ref.id)
              ),
            ].length;
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

  await fs.promises.copyFile(
    "./data/process/prayers.json",
    "./src/data/prayers.json"
  );
})();
