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

const findSource = (documents, doc, simplified) =>
  documents.find(
    (d) =>
      d.id !== doc.id &&
      d.id !== "bahaullah-days-remembrance-036" &&
      !d.id.startsWith("prayers") &&
      (d.author !== doc.author ||
        doc.author === "The Universal House of Justice" ||
        doc.id.startsWith("bahaullah-gleanings-writings-bahaullah") ||
        doc.id.startsWith("bahaullah-days-remembrance") ||
        doc.id.startsWith("abdul-baha-selections-writings-abdul-baha") ||
        d.type === "Prayer") &&
      d.years[0] <= doc.years[1] &&
      simplified.every((s) =>
        d.paragraphs.some((p) => p.simplified.join("").includes(s))
      )
  );

const quotes = {};
const getQuotePara = (id, index, simplified, parts, source, allPara) => {
  const quoteParts = simplified
    .map((s, i) => {
      if (i % 2 === 1) return parts[i];
      if (s === "") return "";
      const para =
        allPara !== -1
          ? allPara
          : source.paragraphs.findIndex((p) =>
              p.simplified.join("").includes(s)
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
      const endIndices = [...sourcePara.indices[start + s.length]].reverse();
      const cleanText = sourcePara.text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return {
        paragraph: para,
        start:
          startIndices.find((j) => sourcePara.text[j] === parts[i][0]) ??
          startIndices.find((j) => !/^\W* /.test(cleanText.slice(j))),
        end:
          endIndices.find((j) => sourcePara.text[j - 1] === last(parts[i])) ??
          endIndices.find((j) => !/ \W*$/.test(cleanText.slice(0, j))),
      };
    })
    .filter((s) => s)
    .map((part) => {
      if (typeof part === "string") return part;
      const text = source.paragraphs[part.paragraph].text;
      if (part.start === 0) delete part.start;
      if (part.end === text.length) delete part.end;
      return part;
    });
  quotes[source.id] = quotes[source.id] || {};
  for (const { paragraph, start, end } of quoteParts.filter(
    (s) => typeof s !== "string"
  )) {
    quotes[source.id][paragraph] = quotes[source.id][paragraph] || [];
    quotes[source.id][paragraph].push({
      ref: { id, paragraph: index },
      start,
      end,
    });
  }
  if (quoteParts.length === 1 && !quoteParts[0].start && !quoteParts[0].end) {
    return {
      base: { id: source.id, paragraphs: [quoteParts[0].paragraph] },
      simplified: [],
    };
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

  for (const doc of documents) {
    console.log(doc.id);
    if (
      !["bible", "quran"].some((s) => doc.id.includes(s)) &&
      doc.type !== "Prayer" &&
      !doc.id.startsWith("additional-")
    ) {
      doc.paragraphs = doc.paragraphs.map((paragraph, index) => {
        const { simplified, parts } = paragraph;
        const source =
          (simplified.join("").length >= 80 ||
            ["compilations-", "ruhi-"].some((s) => doc.id.startsWith(s))) &&
          findSource(documents, doc, simplified);
        if (!source) return paragraph;
        const allPara = source.paragraphs.findIndex((p) =>
          simplified.every((s) => p.simplified.join("").includes(s))
        );
        return getQuotePara(doc.id, index, simplified, parts, source, allPara);
      });
      doc.paragraphs.forEach((para, i) => {
        if (para.base.id && para.base.paragraphs.length === 1) {
          const source = documents.find((d) => d.id === para.base.id);
          let j = -1;
          while (i + j >= 0 && doc.paragraphs[i + j].text) {
            const { simplified, parts } = doc.paragraphs[i + j];
            const maybeSource = source.paragraphs[para.base.paragraphs[0] + j];
            if (
              maybeSource &&
              simplified.join("").length < 80 &&
              simplified.every((s) =>
                maybeSource.simplified.join("").includes(s)
              )
            ) {
              doc.paragraphs[i + j] = getQuotePara(
                doc.id,
                i + j,
                simplified,
                parts,
                source,
                para.base.paragraphs[0] + j
              );
              j--;
            } else {
              break;
            }
          }
          j = 1;
          while (i + j < doc.paragraphs.length && doc.paragraphs[i + j].text) {
            const { simplified, parts } = doc.paragraphs[i + j];
            const maybeSource = source.paragraphs[para.base.paragraphs[0] + j];
            if (
              maybeSource &&
              simplified.join("").length < 80 &&
              simplified.every((s) =>
                maybeSource.simplified.join("").includes(s)
              )
            ) {
              doc.paragraphs[i + j] = getQuotePara(
                doc.id,
                i + j,
                simplified,
                parts,
                source,
                para.base.paragraphs[0] + j
              );
              j++;
            } else {
              break;
            }
          }
        }
      });
      doc.paragraphs.forEach((para, index) => {
        if (!para.base.id) {
          for (const text of [
            ...para.text.split(/“([^”]+)”/g).filter((_, i) => i % 2 === 1),
            ...para.text.split(/‘([^’]+)’/g).filter((_, i) => i % 2 === 1),
          ]) {
            const parts = text.split(/\s*(\. \. \.|\[[^\]]*\])\s*/g);
            const simplified = parts.map((s) => simplifyText(s));
            if (simplified.join("").length >= 50) {
              const source = findSource(documents, doc, simplified);
              if (source) {
                const allPara = source.paragraphs.findIndex((p) =>
                  simplified.every((s) => p.simplified.join("").includes(s))
                );
                getQuotePara(doc.id, index, simplified, parts, source, allPara);
              }
            }
          }
        }
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

  const quoteMap = mapObject(quotes, (docQuotes, id) =>
    mapObject(docQuotes, (parts, para) => {
      const fixedParts = parts.map((p) => {
        const text = documentMap[id].paragraphs[para].text;
        return { ref: p.ref, start: p.start || 0, end: p.end || text?.length };
      });
      const splits = [
        ...new Set(
          fixedParts.flatMap((p) =>
            [p.start, p.end].filter((x) => x !== undefined)
          )
        ),
      ].sort((a, b) => a - b);
      return {
        refs: [...new Set(fixedParts.map((p) => JSON.stringify(p.ref)))].map(
          (s) => JSON.parse(s)
        ),
        parts: splits
          .slice(0, -1)
          .map((start, i) => {
            const end = splits[i + 1];
            const count = [
              ...new Set(
                fixedParts
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
