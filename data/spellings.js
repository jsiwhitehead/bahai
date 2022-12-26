import fs from "fs-extra";

import { files } from "./sources.js";
import { readText, writeText } from "./utils.js";

import spellingsBase from "./spellings.json" assert { type: "json" };

// const mapping = {};
// const addToMapping = (s) => {
//   for (const word of s
//     .toLowerCase()
//     .normalize("NFD")
//     .split(/[^‘’‑-\w\u0300-\u036f]/g)) {
//     const plain = word.replace(/[\u0300-\u036f]/g, "");
//     mapping[plain] = mapping[plain] || new Set();
//     mapping[plain].add(word.normalize("NFC"));
//   }
// };

const spellings = {
  ...spellingsBase.main,
  ...Object.assign(
    ...spellingsBase.sets
      .map(({ changes, roots, adjust = {} }) =>
        roots.map((r) =>
          Object.assign(
            ...Object.keys(changes).map((original) => {
              const changed = changes[original];
              if (!adjust[r]) return { [`${r}${original}`]: `${r}${changed}` };
              return {
                [`${r}${original}`]: `${adjust[r]}${changed}`,
                [`${adjust[r]}${original}`]: `${adjust[r]}${changed}`,
                [`${r}${changed}`]: `${adjust[r]}${changed}`,
              };
            })
          )
        )
      )
      .flat()
  ),
};
const spellKeys = Object.keys(spellings);

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const correctSpelling = (s) =>
  spellKeys
    .reduce(
      (res, k) =>
        res.replace(new RegExp(`\\b${k}\\b`, "ig"), (m) => {
          if ([...m].every((s) => s === s.toUpperCase())) {
            return spellings[k].toUpperCase();
          } else if (m[0] === m[0].toUpperCase()) {
            return capitalise(spellings[k]);
          }
          return spellings[k];
        }),
      s
        .replace(/\u200E/g, "")
        .replace(/\u00AD/g, "")
        .replace(/\u035F/g, "")
        .replace(/á/g, "á")
        .replace(/Á/g, "Á")
        .replace(/í/g, "í")
        .replace(/Í/g, "Í")
    )
    .replace(/-/g, "‑")
    .replace(/–/g, "—")
    .replace(/─/g, "—")
    .replace(/‑‑/g, "—")
    .replace(/ "/g, " “")
    .replace(/" /g, "” ")
    .replace(/ '/g, " ‘")
    .replace(/“'/g, "“‘")
    .replace(/'/g, "’")
    .replace(/…/g, "...")
    .replace(/\.([  ]?\.){3,}/g, ". . . .")
    .replace(/\.\.\./g, ". . .")
    .replace(/([,!?”’])\. \. \./g, (_, m) => `${m} \. \. \.`)
    .replace(/([!?]) \. \. \. \./g, (_, m) => `${m} \. \. \.`)
    .replace(/([”’]) \. \. \. \./g, (_, m) => `${m}\. \. \. \.`)
    .replace(/\. \. \. \./g, ". . . .")
    .replace(/\. \. \./g, ". . .")
    .replace(/(\. \. \.)([a-z])/gi, (_, a, b) => `${a} ${b}`)
    .replace(/([a-z])(\. \. \.)/gi, (_, a, b) => `${a} ${b}`)
    .replace(/ Iráq/g, " ‘Iráq")
    .replace(/ IRÁQ/g, " ‘IRÁQ")
    .replace(/Ataollah/g, "‘Aṭá’u’lláh")
    .replace(/Ruhollah/g, "Rúḥu’lláh")
    .replace(/’i\b/g, "’í")
    .replace(/\bprë/g, "pre")
    .replace(/\bpreë/g, "pree")
    .replace(/\bre‑/g, "re")
    .replace(/\bpre‑/g, "pre")
    .replace(/\bco‑/g, "co")
    .replace(/\bRe‑/g, "Re")
    .replace(/\bPre‑/g, "Pre")
    .replace(/Co‑operation/g, "Cooperation")
    .replace(/PreExistent/g, "Preexistent");

(async () => {
  fs.emptyDirSync("./data/spellings");

  for (const author of Object.keys(files)) {
    await Promise.all(
      Object.keys(files[author]).map(async (file) => {
        const id = `${author}-${file}`;
        await writeText(
          "spellings",
          id,
          correctSpelling(await readText("download", id))
        );
      })
    );
  }

  await Promise.all(
    fs
      .readdirSync("./data/manual")
      .map((s) => s.slice(0, -4))
      .map(
        async (id) =>
          await writeText(
            "manual",
            id,
            correctSpelling(await readText("manual", id))
          )
      )
  );

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

  // fs.emptyDirSync("./data/mapping");
  // const singles = [];
  // const multiples = [];
  // for (const plain of Object.keys(mapping)) {
  //   const values = [...mapping[plain]];
  //   if (values.length === 1 && values[0] !== plain) singles.push(values[0]);
  //   if (values.length > 1) multiples.push(values);
  // }
  // singles.sort();
  // await writeJSON("mapping", "mapping", { multiples, singles });
})();
