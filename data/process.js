import fs from "fs-extra";

import { files } from "./sources.js";
import {
  getMessageTo,
  getYearsFromId,
  readJSON,
  replaceInText,
  simplifyText,
  writeData,
} from "./utils.js";

const test = (options, value, index) =>
  options.some((x) => {
    if (typeof x === "string") return x === value;
    if (typeof x === "number") return x === index;
    if (typeof x === "function") return x(value, index);
    return x.test(value);
  });

const authors = {
  "the-bab": "The Báb",
  bahaullah: "Bahá’u’lláh",
  "abdul-baha": "‘Abdu’l‑Bahá",
  "shoghi-effendi": "Shoghi Effendi",
  "the-universal-house-of-justice": "The Universal House of Justice",
  "official-statements-commentaries": "The Universal House of Justice",
};

// "Words of Wisdom": [1857, 1863]
// "The Dawn‑Breakers": [1887, 1888]
// "The Constitution of the Universal House of Justice": [1972, 1972]
const authorYears = {
  "The Báb": [1844, 1850],
  "Bahá’u’lláh": [1844, 1850],
  "‘Abdu’l‑Bahá": [1875, 1921],
  "Shoghi Effendi": [1922, 1957],
};

const sliceParas = (
  paras,
  start,
  end = "This document has been downloaded from the . You are free to use its content subject to the terms of use found at"
) => {
  const startIndex = start ? paras.findIndex((p) => p === start) : 0;
  const endIndex = end ? paras.findIndex((p) => p === end) : undefined;
  return paras.slice(startIndex, endIndex);
};

const process = (
  paras,
  {
    years,
    title,
    author,
    type,
    replace,
    splitBefore = [],
    splitAfter = [],
    ignore = [],
    lines,
    sections: sectionsInfo = {},
    collections = [],
  }
) => {
  const items = [[]];
  const addItem = () => {
    if (items[items.length - 1].length > 0) items.push([]);
    if (sectionsInfo[""]) {
      for (const s of sections) {
        if (!s.end && s.level >= sectionsInfo[""]) s.end = items.length - 1;
      }
    }
  };
  const replaced = paras.map((p) => replaceInText(p, replace || {}));
  const sections = [{ title: title ? title : replaced[0], level: 0, start: 0 }];
  replaced.slice(title ? 0 : 1).forEach((p, i) => {
    if (
      (sectionsInfo[p] === null || p === sections[sections.length - 1].title) &&
      items[items.length - 1].length === 0 &&
      sections[sections.length - 1].start === items.length - 1
    ) {
      if (sectionsInfo[p] === null) {
        const prev = sections[sections.length - 1].title;
        sections[sections.length - 1].title +=
          (p[0] === "(" || prev[prev.length - 1] === ":" ? " " : ": ") + p;
      }
    } else if (sectionsInfo[p]) {
      addItem();
      for (const s of sections) {
        if (!s.end && s.level >= sectionsInfo[p]) s.end = items.length - 1;
      }
      sections.push({
        title: p,
        level: sectionsInfo[p],
        start: items.length - 1,
      });
    } else {
      if (test(splitBefore, p, i)) addItem();
      if (!test(ignore, p, i)) items[items.length - 1].push(p);
      if (test(splitAfter, p, i)) addItem();
    }
  });
  if (items[items.length - 1].length === 0) items.pop();
  for (const s of sections) {
    if (!s.end) s.end = items.length;
  }

  let path = [];
  let j = 0;
  let base = 0;
  const documents = [];
  items.forEach((item, i) => {
    if (sections[j]?.start !== i) {
      if (
        !documents[documents.length - 1].title ||
        sectionsInfo[""] === path.length
      ) {
        documents.push({ path, sections: [], items: [] });
        base = i;
      }
    }
    while (sections[j]?.start === i) {
      const s = sections[j];
      if (s.level < path.length) path = path.slice(0, s.level);
      if (collections.includes(s.title)) {
        collections.shift();
        path = [...path, s.title];
        documents.push({ path, sections: [], items: [] });
        base = i;
      } else if (s.level === path.length) {
        documents.push({ path, title: s.title, sections: [], items: [] });
        base = i;
      } else {
        documents[documents.length - 1].sections.push({
          title: s.title,
          level: s.level,
          start: s.start - base,
          end: s.end - base,
        });
      }
      j++;
    }
    documents[documents.length - 1].items.push(item);
  });

  return documents
    .filter((d) => d.items.length > 0)
    .map((d, i) => {
      const docLines = typeof lines === "function" ? lines(i) : lines?.[i];
      return {
        years: years || authorYears[author] || [0, 5000],
        author,
        type: typeof type === "string" ? type : type(i),
        ...d,
        items: d.items.map((paras, j) => {
          const author = paras[paras.length - 1].startsWith("—")
            ? paras.pop()
            : undefined;
          const itemLines =
            typeof docLines === "function" ? docLines(j) : docLines?.[j];
          const paraLines =
            typeof itemLines === "function"
              ? paras.reduce(
                  (res, _, k) => ({ ...res, [k]: itemLines(k) || undefined }),
                  {}
                )
              : itemLines;
          return {
            author: author
              ?.replace(/^—/, "")
              .replace(/\[\d+\]$/, "")
              .trim(),
            lines: paraLines || undefined,
            paragraphs: paras,
          };
        }),
      };
    });
};

(async () => {
  fs.emptyDirSync("./data/process");

  const allPrayers = [];
  for (const author of Object.keys(files)) {
    await Promise.all(
      Object.keys(files[author]).map(async (file) => {
        const id = `${author}-${file}`;
        const { start, end, author: infoAuthor, ...info } = files[author][file];
        const paras = await readJSON("download", id);
        const data = process(sliceParas(paras, start, end), {
          author: infoAuthor || authors[author],
          ...info,
        });
        allPrayers.push(
          ...data
            .filter((d) => d.type === "Prayer")
            .map((prayer) => {
              const { author, lines, paragraphs } = prayer.items[0];
              const path =
                prayer.path?.[0] === "Bahá’í Prayers"
                  ? prayer.path.filter(
                      (s) =>
                        !["Bahá’í Prayers", "General Prayers"].some((x) =>
                          s.includes(x)
                        )
                    )
                  : [];
              return {
                author: author || prayer.author,
                path: path.length > 0 ? path : undefined,
                title: prayer.title,
                lines,
                paragraphs,
                simplified: simplifyText(paragraphs.join(" ")),
                length: paragraphs.join(" ").length,
              };
            })
        );
        const nonPrayers = data.filter((d) => d.type !== "Prayer");
        if (nonPrayers.length > 0) {
          await writeData("process", id, nonPrayers);
        }
      })
    );
  }

  allPrayers.sort(
    (a, b) =>
      a.length - b.length ||
      a.paragraphs.length - b.paragraphs.length ||
      a.paragraphs.join(" ").localeCompare(b.paragraphs.join(" "))
  );
  const prayers = allPrayers
    .filter((a, i) => {
      const p = allPrayers
        .slice(i + 1)
        .find((b) => b.simplified.includes(a.simplified));
      if (p) {
        p.path = p.path || a.path;
        p.title = p.title || a.title;
      }
      return !p;
    })
    .map(({ simplified, ...p }, i) => ({ index: i, ...p }));
  await writeData("process", "prayers", prayers);

  const messages = await readJSON(
    "download",
    "the-universal-house-of-justice-messages"
  );
  await writeData(
    "process",
    "the-universal-house-of-justice-messages",
    messages.map(({ id, title, summary, addressee, paragraphs }) => ({
      years: getYearsFromId(id),
      author: "The Universal House of Justice",
      type: "Letter",
      title: title.startsWith("Riḍván")
        ? `${summary} ${getMessageTo(addressee)}`
        : `Letter dated ${title} ${getMessageTo(addressee)}`,
      summary,
      items: process(sliceParas(paragraphs), {
        type: "Letter",
        title: "Letter",
      })[0].items,
    }))
  );
})();
