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
  const sections = [{ title: title ? title : paras[0], level: 0, start: 0 }];
  paras.slice(title ? 0 : 1).forEach((p, i) => {
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

const getYearsFromId = (id) => {
  const d = new Date(
    parseInt(id.slice(0, 4), 10),
    parseInt(id.slice(4, 6), 10) - 1,
    parseInt(id.slice(6, 8), 10)
  );
  const v = parseFloat(id.slice(0, 4) + "." + id.slice(4, 6) + id.slice(6, 8));
  return [v, v];
};
const lowerFirstLetter = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const getMessageTo = (addressee) => {
  const lower = addressee.toLowerCase();
  if (lower.includes("local spiritual assembly")) {
    return "to a Local Assembly";
  } else if (lower.includes("spiritual assembly")) {
    return "to a National Assembly";
  } else if (
    lower.includes(
      "continental boards of counsellors and national spiritual assemblies"
    )
  ) {
    return "to the Counsellors and National Assemblies";
  } else if (lower.includes("counsellors")) {
    return "to the Counsellors";
  } else if (lower.includes("national spiritual assemblies")) {
    if (["in", "selected"].some((s) => lower.includes(s))) {
      return "to selected National Assemblies";
    } else {
      return "to all National Assemblies";
    }
  } else if (lower.includes("auxiliary board members")) {
    return "to the Auxiliary Board members";
  } else if (
    ["individuals", "three believers"].some((s) => lower.includes(s))
  ) {
    return "to selected individuals";
  } else if (["individual", "mr"].some((s) => lower.includes(s))) {
    return "to an individual";
  } else if (
    [
      "gathered",
      "assembled",
      "congress",
      "conference",
      "convention",
      "meeting",
      "participants",
    ].some((s) => lower.includes(s))
  ) {
    return "to those gathered";
  } else if (lower.includes("iranian")) {
    return "to Iranian Bahá’ís outside Iran";
  } else if (
    ["iran", "cradle", "lovers of the most great beauty"].some((s) =>
      lower.includes(s)
    )
  ) {
    if (lower.includes("youth")) {
      return "to Bahá’í youth in Iran";
    } else if (lower.includes("students")) {
      return "to Bahá’í students in Iran";
    } else {
      return "to the Bahá’ís of Iran";
    }
  } else if (lower.includes("youth")) {
    return "to Bahá’í Youth";
  } else if (
    lower.includes("followers of bahá’u’lláh in") &&
    !lower.includes("every land")
  ) {
    return "to the Bahá’ís of a Nation";
  } else if (
    lower.includes("followers of bahá’u’lláh") ||
    lower.includes("on the occasion")
  ) {
    return "to the Bahá’ís of the World";
  } else if (["all who", "peoples"].some((s) => lower.includes(s))) {
    return "to the Peoples of the World";
  } else if (lower.includes("bahá’ís of")) {
    if (["world", "east and west"].some((s) => lower.includes(s))) {
      return "to the Bahá’ís of the World";
    } else {
      return "to the Bahá’ís of a Nation";
    }
  }
  return lowerFirstLetter(addressee);
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
