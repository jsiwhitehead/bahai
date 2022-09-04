import fs from "fs-extra";

import { files } from "./sources.js";
import { writeJSON } from "./utils.js";

import spellingsBase from "./spellings.json" assert { type: "json" };

const flatten = (arrs) => arrs.reduce((res, a) => [...res, ...a], []);
const merge = (objs) => objs.reduce((res, o) => ({ ...res, ...o }), {});

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const spellings = {
  ...spellingsBase.main,
  ...merge(
    flatten(
      spellingsBase.sets.map(({ changes, roots, adjust = {} }) =>
        roots.map((r) =>
          merge(
            Object.keys(changes).map((original) => {
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
    )
  ),
};
const spellKeys = Object.keys(spellings);
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
    .replace(/ \\"/g, " “")
    .replace(/\\" /g, "” ")
    .replace(/ '/g, " ‘")
    .replace(/“'/g, "“‘")
    .replace(/'/g, "’")
    .replace(/…/g, "...")
    .replace(/\.\.\.\./g, ". . . .")
    .replace(/\.\.\./g, ". . .")
    .replace(/([,!?”’])\. \. \./g, (_, m) => `${m} \. \. \.`)
    .replace(/([,!?”’]) \. \. \. \./g, (_, m) => `${m}\. \. \. \.`)
    .replace(/\. \. \. \./g, ". . . .")
    .replace(/\. \. \./g, ". . .")
    .replace(/ Iráq/g, " ‘Iráq")
    .replace(/ IRÁQ/g, " ‘IRÁQ");

(async () => {
  fs.emptyDirSync("./data/spellings");

  for (const author of Object.keys(files)) {
    await Promise.all(
      Object.keys(files[author]).map(async (file) => {
        const id = `${author}-${file}`;
        await writeJSON(
          "spellings",
          id,
          JSON.parse(
            correctSpelling(
              await fs.promises.readFile(`./data/download/${id}.json`, "utf-8")
            )
          )
        );
      })
    );
  }

  await writeJSON(
    "spellings",
    "the-universal-house-of-justice-messages",
    JSON.parse(
      correctSpelling(
        await fs.promises.readFile(
          `./data/download/the-universal-house-of-justice-messages.json`,
          "utf-8"
        )
      )
    )
  );
})();
