import fs from "fs-extra";

import { files } from "./sources.js";
import {
  capitalise,
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
  "Bahá’u’lláh": [1852, 1892],
  "‘Abdu’l‑Bahá": [1875, 1921],
  "Shoghi Effendi": [1922, 1957],
};

const titleReplaces = {
  "Talks ‘Abdu’l‑Bahá Delivered in Boston":
    "Talks ‘Abdu’l‑Bahá Delivered in Boston: 23‑25 July 1912",
  "Talks ‘Abdu’l‑Bahá Delivered in Boston and Malden":
    "Talks ‘Abdu’l‑Bahá Delivered in Boston and Malden: 23‑25 July 1912",
  "Talk ‘Abdu’l‑Bahá Delivered in Minneapolis":
    "Talk ‘Abdu’l‑Bahá Delivered in Minneapolis: 20 September 1912",
  "Talk ‘Abdu’l‑Bahá Delivered in St. Paul":
    "Talk ‘Abdu’l‑Bahá Delivered in St. Paul: 20 September 1912",
  "The Promised Day is Come": "The Promised Day Is Come",
  "THE INSTITUTION OF THE COUNSELLORS": "The Institution of the Counsellors",
  INTRODUCTION: "Introduction",
  "INTERNATIONAL AND CONTINENTAL COUNSELLORS AND THE AUXILIARY BOARDS":
    "International and Continental Counsellors and the Auxiliary Boards",
  "SOME SPECIFIC ASPECTS OF THE FUNCTIONING OF THE INSTITUTION":
    "Some Specific Aspects of the Functioning of the Institution",
};
const titleTranslations = {
  "Qayyúmu’l‑Asmá’": "Commentary on the Súrih of Joseph",
  "Persian Bayán": "Persian Utterance",
  "Dalá’il‑i‑Sab‘ih": "Seven Proofs",
  "Kitáb‑i‑Asmá’": "Book of Names",
  "Rashḥ‑i‑‘Amá": "The Clouds of the Realms Above",
  "Ḥúr‑i‑‘Ujáb": "Tablet of the Wondrous Maiden",
  "Lawḥ‑i‑‘Áshiq va Ma‘shúq": "Tablet of the Lover and the Beloved",
  "Súriy‑i‑Qalam": "Tablet of the Pen",
  "Lawḥ‑i‑Náqús": "Tablet of the Bell",
  "Lawḥ‑i‑Ghulámu’l‑Khuld": "Tablet of the Immortal Youth",
  "Súriy‑i‑Ghuṣn": "Tablet of the Branch",
  "Lawḥ‑i‑Rasúl": "Tablet to Rasúl",
  "Lawḥ‑i‑Maryam": "Tablet to Maryam",
  "Kitáb‑i‑‘Ahd": "Book of the Covenant",
  "Súriy‑i‑Nuṣḥ": "Tablet of Counsel",
  "Súriy‑i‑Múlúk": "Tablet of the Kings",
  "Lawḥ‑i‑Salmán I": "Tablet to Salmán I",
  "Súriy‑i‑Dhikr": "Tablet of Remembrance",
  "Súriy‑i‑Aḥzán": "Tablet of Sorrows",
  "Lawḥ‑i‑Mawlúd": "Tablet of the Birth",
  "Javáhiru’l‑Asrár": "Gems of Divine Mysteries",
  "Kitáb‑i‑Íqán": "The Book of Certitude",
  "Súriy‑i‑Haykal": "Tablet of the Temple",
  "Súriy‑i‑Ra’ís": "Tablet of the Chief",
  "Lawḥ‑i‑Ra’ís": "Tablet of the Chief",
  "Lawḥ‑i‑Fu’ád": "Tablet of Fu’ád Páshá",
  "Súriy‑i‑Múlúk": "Tablet of Kings",
  "Lawḥ‑i‑Mánikchí‑Ṣáḥib": "Tablet to Mánikchí Ṣáḥib",
  "Lawḥ‑i‑Haft Pursish": "Tablet of the Seven Questions",
  "Lawḥ‑i‑Karmil": "Tablet of Carmel",
  "Lawḥ‑i‑Aqdas": "The Most Holy Tablet",
  Bishárát: "Glad‑Tidings",
  Ṭarázát: "Ornaments",
  Tajallíyát: "Effulgences",
  "Kalimát‑i‑Firdawsíyyih": "Words of Paradise",
  "Lawḥ‑i‑Dunyá": "Tablet of the World",
  Ishráqát: "Splendours",
  "Lawḥ‑i‑Ḥikmat": "Tablet of Wisdom",
  "Aṣl‑i‑Kullu’l‑Khayr": "Words of Wisdom",
  "Lawḥ‑i‑Maqṣúd": "Tablet of Maqṣúd",
  "Súriy‑i‑Vafá": "Tablet to Vafá",
  "Lawḥ‑i‑Síyyid‑i‑Mihdíy‑i‑Dahají": "Tablet to Siyyid Mihdíy‑i‑Dahají",
  "Lawḥ‑i‑Burhán": "Tablet of the Proof",
  "Kitáb‑i‑‘Ahd": "Book of the Covenant",
  "Lawḥ‑i‑Arḍ‑i‑Bá": "Tablet of the Land of Bá",
};
const getTitle = (title) => {
  if (titleReplaces[title]) return { title: titleReplaces[title] };
  if (title === "The Kitáb‑i‑Aqdas") {
    return { title: "The Most Holy Book", translated: "Kitáb‑i‑Aqdas" };
  }
  for (const translated of Object.keys(titleTranslations)) {
    if (
      title?.includes(translated) ||
      title?.includes(titleTranslations[translated])
    ) {
      if (title.toLowerCase().includes("excerpts")) {
        return {
          title: `Excerpts from the ${titleTranslations[translated]}`,
          translated,
        };
      } else if (title.toLowerCase().includes("excerpt")) {
        return {
          title: `Excerpt from the ${titleTranslations[translated]}`,
          translated,
        };
      } else {
        return {
          title: titleTranslations[translated],
          translated,
        };
      }
    }
  }
  return { title };
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
    baseAuthor,
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
  const parts = [
    { level: 0, title: title ? title : replaced[0], start: 0, lines: {} },
  ];
  const addPart = (level, title) => {
    for (const p of parts) {
      if (p.end === undefined && p.level >= level) p.end = paragraphs.length;
    }
    parts.push({ level, title, start: paragraphs.length, lines: {} });
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
      delete sections[s];
    } else if (sections[s]) {
      addPart(sections[s], s);
      checkCollection();
    } else {
      const splitLevel =
        sections[""] || last(parts).level + (last(parts).title ? 1 : 0);
      if (test(splitBefore, s, i)) addPart(splitLevel);
      if (lines?.[s])
        last(parts).lines[paragraphs.length] = [
          ...(last(parts).lines[paragraphs.length] || []),
          { type: lines[s], text: s },
        ];
      else if (!test(ignore, s, i)) {
        paragraphs.push(s);
      }
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
      const { lines: pLines, ...rest } = p;
      last(documents).sections.push(rest);
      last(documents).lines = { ...last(documents).lines, ...pLines };
    }
  }

  return documents.map(({ path, title, start, end, sections, lines }, i) => {
    const levelBase = Math.min(...sections.map((s) => s.level)) - 1;
    const paras = paragraphs.slice(start, end);
    const docAuthor = last(paras).startsWith("—")
      ? paras
          .pop()
          .replace(/^—/, "")
          .replace(/\[\d+\]$/, "")
          .trim()
      : (typeof author === "function" ? author(i) : author) || baseAuthor;
    const docPath = [...new Set(path)];
    const docTitle =
      docPath?.length === 1 &&
      docPath[0] === "The Kitáb‑i‑Íqán" &&
      paras.length > 1
        ? docPath.pop()
        : title;
    return {
      years:
        (typeof years === "function" ? years(i) : years) ||
        authorYears[docAuthor],
      author: docAuthor,
      type: typeof type === "string" ? type : type(i),
      path: notEmpty(docPath)?.map((t) => getTitle(t).title),
      ...getTitle(docTitle),
      sections: notEmpty(
        sections.reduce((res, s) => {
          const index = s.start - start;
          return {
            ...res,
            [index]: [
              ...(res[index] || []),
              {
                level: s.level - levelBase,
                title:
                  titleReplaces[s.title] ||
                  s.title?.replace("Period\n", "Period: ").replace(/\n/g, " "),
                end: Math.min(s.end - start, paras.length),
              },
            ],
          };
        }, {})
      ),
      lines: notEmpty(
        Object.keys(lines || {})
          .map((k) => parseInt(k, 10))
          .reduce((res, i) => ({ ...res, [i - start]: lines[i] }), {})
      ),
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
        const { start, end, ...info } = files[author][file];
        const paras = await readJSON("spellings", id);
        const data = process(sliceParas(paras, start, end), {
          ...info,
          baseAuthor: authors[author],
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
          Object.keys(p.lines || {}).reduce(
            (res, k) => res + p.lines[k].length,
            0
          ) >
          Object.keys(a.lines || {}).reduce(
            (res, k) => res + a.lines[k].length,
            0
          )
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
        title: "A",
      })[0],
      title: title.startsWith("Riḍván")
        ? `${summary} ${getMessageTo(addressee)}`
        : `Letter dated ${title} ${getMessageTo(addressee)}`,
    }))
  );
})();
