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
    title,
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

const idToDate = (id) =>
  new Date(
    parseInt(id.slice(0, 4), 10),
    parseInt(id.slice(4, 6), 10) - 1,
    parseInt(id.slice(6, 8), 10)
  ).getTime();
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
    messages.map(({ id, title, summary, addressee, paragraphs, ...d }) => ({
      date: idToDate(id),
      title: title.startsWith("Riḍván")
        ? `${summary} ${getMessageTo(addressee)}`
        : `Letter dated ${title} ${getMessageTo(addressee)}`,
      summary,
      items: process(sliceParas(paragraphs), {
        author: "The Universal House of Justice",
        type: "Letter",
        title: "Letter",
      }).items,
    }))
  );
})();
