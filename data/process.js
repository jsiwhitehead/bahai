import fs from "fs-extra";

import { files } from "./sources.js";
import { readJSON, writeData } from "./utils.js";

const test = (options, value, index) =>
  options.some((x) => {
    if (typeof x === "string") return x === value;
    if (typeof x === "number") return x === index;
    if (typeof x === "function") return x(value, index);
    return x.test(value);
  });

const authors = {
  bahaullah: "Bahá’u’lláh",
  "the-bab": "The Báb",
  "abdul-baha": "‘Abdu’l‑Bahá",
  "shoghi-effendi": "Shoghi Effendi",
  "the-universal-house-of-justice": "The Universal House of Justice",
  "official-statements-commentaries": "The Universal House of Justice",
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
    author,
    type,
    splitBefore = [],
    splitAfter = [],
    ignore = [],
    lines,
    sections: sectionsInfo = {},
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
  const sections = [{ title: paras[0], level: 0, start: 0 }];
  paras.slice(1).forEach((p, i) => {
    if (sectionsInfo[p] !== undefined) {
      if (
        items[items.length - 1].length === 0 &&
        sections[sections.length - 1].level === sectionsInfo[p] &&
        sections[sections.length - 1].start === items.length - 1
      ) {
        sections[sections.length - 1].title += (p[0] === "(" ? " " : ": ") + p;
      } else {
        addItem();
        for (const s of sections) {
          if (!s.end && s.level >= sectionsInfo[p]) s.end = items.length - 1;
        }
        sections.push({
          title: p,
          level: sectionsInfo[p],
          start: items.length - 1,
        });
      }
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
  return {
    author,
    sections,
    items: items.map((paras, i) => {
      const author = paras[paras.length - 1].startsWith("—")
        ? paras.pop()
        : undefined;
      const itemLines = typeof lines === "function" ? lines(i) : lines?.[i];
      const paraLines =
        typeof itemLines === "function"
          ? paras.reduce(
              (res, _, i) => ({ ...res, [i]: itemLines(i) || undefined }),
              {}
            )
          : itemLines;
      return {
        type: typeof type === "string" ? type : type(i),
        author: author
          ?.replace(/^—/, "")
          .replace(/\[\d+\]$/, "")
          .trim(),
        lines: paraLines || undefined,
        paragraphs: paras,
      };
    }),
  };
};

(async () => {
  fs.emptyDirSync("./data/process");

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
        await writeData("process", id, data);
      })
    );
  }
})();
