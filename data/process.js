import fs from "fs-extra";

import { readText, writeJSON } from "./utils.js";

const getItem = (s) => {
  if (s.startsWith("^")) {
    return { type: "call", text: s.slice(2) };
  }
  if (s.startsWith("*")) {
    return { type: "info", text: s.slice(2) };
  }
  if (s.startsWith(">")) {
    const lines = s.split("\n").map((t) => t.slice(2));
    return {
      text: lines.join(" "),
      lines: lines
        .map((l) => l.length + 1)
        .reduce((res, i) => [...res, res[res.length - 1] + i], [0]),
    };
  }
  return { text: s };
};

const process = (source) => {
  const documents = [];
  let collectionLevel = 0;
  let titlePath = [];
  let configPath = [];
  let indexPath = [];
  let sectionPath = [];
  source.split("\n\n").forEach((s, i) => {
    if (i === 0 || s.startsWith("#") || s === "***") {
      const [titleLine, ...configLines] = s.split("\n");
      const level =
        i === 0
          ? 0
          : titleLine === "#"
          ? collectionLevel
          : titleLine === "***"
          ? collectionLevel + 1
          : titleLine.indexOf(" ");
      const title =
        i === 0 ? titleLine : titleLine.slice(level + 1) || undefined;
      const { collection, translated, ...config } = configLines.reduce(
        (res, c) => {
          const [key, value = "true"] = c.split("=");
          return { ...res, [key]: JSON.parse(value) };
        },
        {}
      );

      titlePath = titlePath.slice(0, level);
      configPath = configPath.slice(0, level);
      indexPath = indexPath.slice(0, level + 1);
      configPath[level] = config;

      if (collection) {
        collectionLevel = level + 1;
        indexPath[level + 1] = 1;
      } else if (level < collectionLevel) {
        collectionLevel = level;
      }
      if (level === collectionLevel) {
        documents.push({
          path: [...titlePath],
          item: indexPath[level]++ || undefined,
          title,
          translated,
          ...configPath.reduce((res, c) => ({ ...res, ...c }), {}),
          paragraphs: [],
        });
      } else if (!collection) {
        const sectionLevel = level - collectionLevel;
        sectionPath = sectionPath.slice(0, sectionLevel);
        sectionPath[sectionLevel - 1] =
          (sectionPath[sectionLevel - 1] || 0) + 1;
        documents[documents.length - 1].paragraphs.push({
          section: [...sectionPath],
          title,
        });
      }

      titlePath[level] = title;
    } else {
      documents[documents.length - 1].paragraphs.push(getItem(s));
    }
  });

  return documents;
};

(async () => {
  fs.emptyDirSync("./data/process");

  await Promise.all([
    ...fs
      .readdirSync("./data/manual")
      .map((s) => s.slice(0, -4))
      .map(
        async (id) =>
          await writeJSON("process", id, process(await readText("manual", id)))
      ),
    ...fs
      .readdirSync("./data/format")
      .map((s) => s.slice(0, -4))
      .map(
        async (id) =>
          await writeJSON("process", id, process(await readText("format", id)))
      ),
  ]);

  // await writeJSON(
  //   "spellings",
  //   "the-universal-house-of-justice-messages",
  //   JSON.parse(
  //     correctSpelling(
  //       await fs.promises.readFile(
  //         `./data/download/the-universal-house-of-justice-messages.json`,
  //         "utf-8"
  //       )
  //     )
  //   )
  // );
})();

// import fs from "fs-extra";

// import { files } from "./sources.js";
// import {
//   getMessageTo,
//   getYearsFromId,
//   last,
//   notEmpty,
//   readJSON,
//   replaceInText,
//   simplifyText,
//   writeJSON,
// } from "./utils.js";

// const authors = {
//   "the-bab": "The Báb",
//   bahaullah: "Bahá’u’lláh",
//   "abdul-baha": "‘Abdu’l‑Bahá",
//   "shoghi-effendi": "Shoghi Effendi",
//   "the-universal-house-of-justice": "The Universal House of Justice",
//   "official-statements-commentaries": "The Universal House of Justice",
// };

// // "Words of Wisdom": [1857, 1863]
// // "The Dawn‑Breakers": [1887, 1888]
// // "The Constitution of the Universal House of Justice": [1972, 1972]
// const authorYears = {
//   "The Báb": [1844, 1850],
//   "Bahá’u’lláh": [1852, 1892],
//   "‘Abdu’l‑Bahá": [1875, 1921],
//   "Shoghi Effendi": [1922, 1957],
// };

// const titleReplaces = {
//   "Talks ‘Abdu’l‑Bahá Delivered in Boston":
//     "Talks ‘Abdu’l‑Bahá Delivered in Boston: 23‑25 July 1912",
//   "Talks ‘Abdu’l‑Bahá Delivered in Boston and Malden":
//     "Talks ‘Abdu’l‑Bahá Delivered in Boston and Malden: 23‑25 July 1912",
//   "Talk ‘Abdu’l‑Bahá Delivered in Minneapolis":
//     "Talk ‘Abdu’l‑Bahá Delivered in Minneapolis: 20 September 1912",
//   "Talk ‘Abdu’l‑Bahá Delivered in St. Paul":
//     "Talk ‘Abdu’l‑Bahá Delivered in St. Paul: 20 September 1912",
//   "The Promised Day is Come": "The Promised Day Is Come",
//   "THE INSTITUTION OF THE COUNSELLORS": "The Institution of the Counsellors",
//   INTRODUCTION: "Introduction",
//   "INTERNATIONAL AND CONTINENTAL COUNSELLORS AND THE AUXILIARY BOARDS":
//     "International and Continental Counsellors and the Auxiliary Boards",
//   "SOME SPECIFIC ASPECTS OF THE FUNCTIONING OF THE INSTITUTION":
//     "Some Specific Aspects of the Functioning of the Institution",
// };
// const titleTranslations = {

//   "Rashḥ‑i‑‘Amá": "The Clouds of the Realms Above",
//   "Ḥúr‑i‑‘Ujáb": "Tablet of the Wondrous Maiden",
//   "Lawḥ‑i‑‘Áshiq va Ma‘shúq": "Tablet of the Lover and the Beloved",
//   "Súriy‑i‑Qalam": "Tablet of the Pen",
//   "Lawḥ‑i‑Náqús": "Tablet of the Bell",
//   "Lawḥ‑i‑Ghulámu’l‑Khuld": "Tablet of the Immortal Youth",
//   "Súriy‑i‑Ghuṣn": "Tablet of the Branch",
//   "Lawḥ‑i‑Rasúl": "Tablet to Rasúl",
//   "Lawḥ‑i‑Maryam": "Tablet to Maryam",
//   "Kitáb‑i‑‘Ahd": "Book of the Covenant",
//   "Súriy‑i‑Nuṣḥ": "Tablet of Counsel",
//   "Súriy‑i‑Múlúk": "Tablet of the Kings",
//   "Lawḥ‑i‑Salmán I": "Tablet to Salmán I",
//   "Súriy‑i‑Dhikr": "Tablet of Remembrance",
//   "Súriy‑i‑Aḥzán": "Tablet of Sorrows",
//   "Lawḥ‑i‑Mawlúd": "Tablet of the Birth",
//   "Javáhiru’l‑Asrár": "Gems of Divine Mysteries",
//   "Kitáb‑i‑Íqán": "The Book of Certitude",
//   "Súriy‑i‑Haykal": "Tablet of the Temple",
//   "Súriy‑i‑Ra’ís": "Tablet of the Chief",
//   "Lawḥ‑i‑Ra’ís": "Tablet of the Chief",
//   "Lawḥ‑i‑Fu’ád": "Tablet of Fu’ád Páshá",
//   "Súriy‑i‑Múlúk": "Tablet of Kings",
//   "Lawḥ‑i‑Mánikchí‑Ṣáḥib": "Tablet to Mánikchí Ṣáḥib",
//   "Lawḥ‑i‑Haft Pursish": "Tablet of the Seven Questions",
//   "Lawḥ‑i‑Karmil": "Tablet of Carmel",
//   "Lawḥ‑i‑Aqdas": "The Most Holy Tablet",
//   Bishárát: "Glad‑Tidings",
//   Ṭarázát: "Ornaments",
//   Tajallíyát: "Effulgences",
//   "Kalimát‑i‑Firdawsíyyih": "Words of Paradise",
//   "Lawḥ‑i‑Dunyá": "Tablet of the World",
//   Ishráqát: "Splendours",
//   "Lawḥ‑i‑Ḥikmat": "Tablet of Wisdom",
//   "Aṣl‑i‑Kullu’l‑Khayr": "Words of Wisdom",
//   "Lawḥ‑i‑Maqṣúd": "Tablet of Maqṣúd",
//   "Súriy‑i‑Vafá": "Tablet to Vafá",
//   "Lawḥ‑i‑Síyyid‑i‑Mihdíy‑i‑Dahají": "Tablet to Siyyid Mihdíy‑i‑Dahají",
//   "Lawḥ‑i‑Burhán": "Tablet of the Proof",
//   "Kitáb‑i‑‘Ahd": "Book of the Covenant",
//   "Lawḥ‑i‑Arḍ‑i‑Bá": "Tablet of the Land of Bá",
// };

// (async () => {
//   fs.emptyDirSync("./data/process");

//   const allPrayers = [];
//   for (const author of Object.keys(files)) {
//     await Promise.all(
//       Object.keys(files[author]).map(async (file) => {
//         const id = `${author}-${file}`;
//         const { start, end, ...info } = files[author][file];
//         const paras = await readJSON("spellings", id);
//         const data = process(sliceParas(paras, start, end), {
//           ...info,
//           baseAuthor: authors[author],
//         });
//         allPrayers.push(
//           ...data
//             .filter((d) => d.type === "Prayer")
//             .map(({ author, path, title, lines, paragraphs }) => ({
//               years: authorYears[author],
//               author,
//               path: notEmpty(
//                 path?.[0] === "Bahá’í Prayers"
//                   ? path.filter(
//                       (s) =>
//                         ![
//                           "Bahá’í Prayers",
//                           "General Prayers",
//                           "Occasional Prayers",
//                           "Special Tablets",
//                         ].some((x) => s.includes(x))
//                     )
//                   : []
//               ),
//               title,
//               lines,
//               paragraphs,
//               simplified: simplifyText(paragraphs.join(" ")),
//               length: paragraphs.join(" ").length,
//             }))
//         );
//         const nonPrayers = data.filter((d) => d.type !== "Prayer");
//         if (nonPrayers.length > 0) {
//           await writeJSON("process", id, nonPrayers);
//         }
//       })
//     );
//   }

//   allPrayers.sort(
//     (a, b) =>
//       a.length - b.length ||
//       a.paragraphs.length - b.paragraphs.length ||
//       a.paragraphs.join(" ").localeCompare(b.paragraphs.join(" "))
//   );
//   const prayers = allPrayers
//     .filter((a, i) => {
//       const p = allPrayers
//         .slice(i + 1)
//         .find((b) => b.simplified.includes(a.simplified));
//       if (p) {
//         p.path = p.path || a.path;
//         p.title = p.title || a.title;
//         p.lines =
//           (p.lines || []).reduce((res, x) => res + x.lines.length, 0) >
//           (a.lines || []).reduce((res, x) => res + x.lines.length, 0)
//             ? p.lines
//             : a.lines;
//       }
//       return !p;
//     })
//     .map(({ simplified, ...p }, i) => ({ index: i, ...p }));
//   await writeJSON("process", "prayers", prayers);

//   const messages = await readJSON(
//     "spellings",
//     "the-universal-house-of-justice-messages"
//   );
//   await writeJSON(
//     "process",
//     "the-universal-house-of-justice-messages",
//     messages.map(({ id, title, summary, addressee, paragraphs }) => ({
//       summary,
//       ...process(sliceParas(paragraphs), {
//         years: getYearsFromId(id),
//         type: "Letter",
//         author: "The Universal House of Justice",
//         title: "A",
//       })[0],
//       title: title.startsWith("Riḍván")
//         ? `${summary} ${getMessageTo(addressee)}`
//         : `Letter dated ${title} ${getMessageTo(addressee)}`,
//     }))
//   );
// })();
