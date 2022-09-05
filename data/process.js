import fs from "fs-extra";

import { files } from "./sources.js";
import {
  getMessageTo,
  getYearsFromId,
  last,
  readJSON,
  replaceInText,
  simplifyText,
  writeJSON,
} from "./utils.js";

const notEmpty = (x) => {
  if (Array.isArray(x)) return x.length > 0 ? x : undefined;
  return Object.keys(x).length > 0 ? x : undefined;
};

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
    sections = {},
    collections = [],
  }
) => {
  const replaced = paras.map((p) => replaceInText(p, replace || {}));
  const paragraphs = [];
  const parts = [{ level: 0, title: title ? title : replaced[0], start: 0 }];
  const addPart = (level, title) => {
    for (const p of parts) {
      if (p.end === undefined && p.level >= level) p.end = paragraphs.length;
    }
    parts.push({ level, title, start: paragraphs.length });
  };
  const colls = [...collections];
  const checkCollection = () => {
    if (colls.includes(last(parts).title)) {
      colls.shift();
      addPart(last(parts).level + 1);
    }
  };
  checkCollection();
  replaced.slice(title ? 0 : 1).forEach((s, i) => {
    if (sections[s] === null && last(parts).start === paragraphs.length) {
      const prev = last(parts).title;
      last(parts).title +=
        (s[0] === "(" || last(prev || "") === ":" ? " " : ": ") + s;
      checkCollection();
    } else if (sections[s]) {
      addPart(sections[s], s);
      checkCollection();
    } else {
      const splitLevel =
        sections[""] || last(parts).level + (last(parts).title ? 1 : 0);
      if (test(splitBefore, s, i)) addPart(splitLevel);
      if (!test(ignore, s, i)) paragraphs.push(s);
      if (test(splitAfter, s, i)) addPart(splitLevel);
    }
  });
  for (const p of parts) {
    if (p.end === undefined) p.end = paragraphs.length;
  }

  let path = [];
  const documents = [];
  for (const p of parts.filter((p) => p.start < p.end)) {
    if (p.level < path.length) path = path.slice(0, p.level);
    if (collections.includes(p.title)) {
      collections.shift();
      path = [...path, p.title];
    } else if (p.level === path.length) {
      documents.push({ path, ...p, sections: [] });
    } else {
      last(documents).sections.push(p);
    }
  }

  return documents.map(({ path, title, start, end, sections }, i) => {
    const levelBase = Math.min(...sections.map((s) => s.level)) - 1;
    const paras = paragraphs.slice(start, end);
    const docLines = typeof lines === "function" ? lines(i) : lines?.[i];
    const paraLines =
      typeof docLines === "function"
        ? paras.reduce(
            (res, _, j) => ({ ...res, [j]: docLines(j) || undefined }),
            {}
          )
        : docLines;
    return {
      years: years || authorYears[author],
      author: (last(paragraphs).startsWith("—") ? paras.pop() : author)
        .replace(/^—/, "")
        .replace(/\[\d+\]$/, "")
        .trim(),
      type: typeof type === "string" ? type : type(i),
      path: notEmpty([...new Set(path)]),
      title,
      sections: notEmpty(
        sections.reduce((res, s) => {
          const index = s.start - start;
          return {
            ...res,
            [index]: [
              ...(res[index] || []),
              {
                level: s.level - levelBase,
                title: s.title,
                end: Math.min(s.end - start, paras.length),
              },
            ],
          };
        }, {})
      ),
      lines: {
        ...(paraLines || {}),
        ...[{ start: 0 }, ...sections].reduce((res, s) => {
          const first =
            s.start +
            paras.slice(s.start).findIndex((_, i) => !paraLines?.[s.start + i]);
          return { ...res, [first]: "first" };
        }, {}),
      },
      paragraphs: paras,
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
        const paras = await readJSON("spellings", id);
        const data = process(sliceParas(paras, start, end), {
          author: infoAuthor || authors[author],
          ...info,
        });
        allPrayers.push(
          ...data
            .filter((d) => d.type === "Prayer")
            .map(({ author, path, title, lines, paragraphs }) => ({
              years: authorYears[author],
              author,
              path: notEmpty(
                path?.[0] === "Bahá’í Prayers"
                  ? path.filter(
                      (s) =>
                        ![
                          "Bahá’í Prayers",
                          "General Prayers",
                          "Occasional Prayers",
                          "Special Tablets",
                        ].some((x) => s.includes(x))
                    )
                  : []
              ),
              title,
              lines,
              paragraphs,
              simplified: simplifyText(paragraphs.join(" ")),
              length: paragraphs.join(" ").length,
            }))
        );
        const nonPrayers = data.filter((d) => d.type !== "Prayer");
        if (nonPrayers.length > 0) {
          await writeJSON("process", id, nonPrayers);
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
        p.lines =
          Object.keys(p.lines).length >= Object.keys(a.lines).length
            ? p.lines
            : a.lines;
      }
      return !p;
    })
    .map(({ simplified, ...p }, i) => ({ index: i, ...p }));
  await writeJSON("process", "prayers", prayers);

  const messages = await readJSON(
    "spellings",
    "the-universal-house-of-justice-messages"
  );
  await writeJSON(
    "process",
    "the-universal-house-of-justice-messages",
    messages.map(({ id, title, summary, addressee, paragraphs }) => ({
      summary,
      ...process(sliceParas(paragraphs), {
        years: getYearsFromId(id),
        type: "Letter",
        author: "The Universal House of Justice",
        title: title.startsWith("Riḍván")
          ? `${summary} ${getMessageTo(addressee)}`
          : `Letter dated ${title} ${getMessageTo(addressee)}`,
      })[0],
    }))
  );
})();
