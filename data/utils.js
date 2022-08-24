import fs from "fs-extra";
import * as prettier from "prettier";
import distance from "js-levenshtein";

import spellingsBase from "./spellings.json" assert { type: "json" };

export const intersects = (a, b) => a.some((x) => b.includes(x));

const mapObject = (obj, value, key = (k) => k) =>
  Object.keys(obj).reduce(
    (res, k) => ({
      ...res,
      [key(k)]: value(obj[k]),
    }),
    {}
  );
const addChanges = (root, changes) =>
  mapObject(
    changes,
    (x) => `${root}${x}`,
    (x) => `${root}${x}`
  );
const flatten = (arrs) => arrs.reduce((res, a) => [...res, ...a], []);
const merge = (objs) => objs.reduce((res, o) => ({ ...res, ...o }), {});

export const last = (x) => x[x.length - 1];

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const spellings = {
  ...spellingsBase.main,
  ...merge(
    flatten(
      spellingsBase.sets.map(({ changes, roots, adjust = {} }) =>
        roots.map((r) => ({
          ...addChanges(r, changes),
          ...(adjust[r] ? addChanges(adjust[r], changes) : {}),
        }))
      )
    )
  ),
};
const spellKeys = Object.keys(spellings);
export const correctSpelling = (s) =>
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
    )
    .replace(/\u200E/g, "")
    .replace(/\u00AD/g, "")
    .replace(/\u035F/g, "")
    .replace(/…/g, "...")
    .replace(/\.\.\.\./g, ". . . .")
    .replace(/\.\.\./g, ". . .")
    .replace(/-/g, "‑")
    .replace(/–/g, "—")
    .replace(/─/g, "—")
    // .replace(/ "/g, " “")
    // .replace(/" /g, "” ")
    // .replace(/"$/g, "”")
    .replace(/ '/g, " ‘")
    .replace(/“'/g, "“‘")
    .replace(/'/g, "’")
    .replace(/á/g, "á")
    .replace(/Á/g, "Á")
    .replace(/í/g, "í")
    .replace(/Í/g, "Í");

// const ignoreTitle = [
//   "the",
//   "and",
//   "upon",
//   "him",
//   "far",
//   "towards",
//   "toward",
//   "for",
//   "without",
//   "between",
//   "before",
//   "after",
//   "across",
//   "against",
//   "through",
//   "near",
//   "about",
//   "but",
//   "within",
//   "into",
//   "unto",
//   "yet",
//   "those",
//   "who",
//   "are",
//   "not",
//   "that",
//   "evening",
//   "morning",
//   "afternoon",
//   "with",
//   "from",
//   "shúq",
//   "its",
//   "lláh",
//   "lláhu",
// ];
// export const titleCase = (str) =>
//   (/[a-z]/.test(str.replace(/\([^)]+\)/g, "")) ? str : str.toLowerCase())
//     .split(/([ \(\)‑—‘’,:])/g)
//     .map((s) => (/^[ivxIVX]+$/.test(s) ? s.toUpperCase() : s))
//     .map((s) =>
//       /[^ \(\)‑—‘’,:]/.test(s) &&
//       !ignoreTitle.includes(s) &&
//       (s.length > 2 || s === "ad")
//         ? capitalise(s)
//         : s
//     )
//     .join("")
//     .split(/([(:—] ?)/g)
//     .map((s) => (/[^(:— ]/.test(s) ? capitalise(s) : s))
//     .join("")
//     .replace(/‑I‑/g, "‑i‑")
//     .replace(/\([IVX]+\)/g, (m) => m.toLowerCase());

const prettify = (s, format) => prettier.format(s, { parser: format });

export const readJSON = async (category, id) =>
  JSON.parse(
    await fs.promises.readFile(`./data/${category}/${id}.json`, "utf-8")
  );

export const writeData = (category, id, data) =>
  fs.promises.writeFile(
    `./data/${category}/${id}.json`,
    prettify(
      typeof data === "string" ? data : JSON.stringify(data, null, 2),
      "json"
    ),
    "utf-8"
  );

export const removeDuplicates = (items, getText, doCompare = () => true) => {
  const data = items
    .map((item) => {
      const text = getText(item)
        .toLowerCase()
        .replace(/(\. \. \. \.|\. \. \.)/g, "…")
        .replace(/\(.+\)/g, "")
        .replace(/[^a-z…]/g, "");
      return {
        item,
        text,
        length: text.length,
        chunks: text
          .split("…")
          .map((s) =>
            Array.from({
              length: Math.ceil(s.length / 20),
            }).map((_, i) => s.slice(i * 20, (i + 1) * 20))
          )
          .reduce((res, x) => [...res, ...x], []),
      };
    })
    .sort((a, b) => {
      const result = b.length - a.length;
      if (result) return result;
      return a.text.localeCompare(b.text);
    });

  data.forEach((a, i) => {
    data.slice(i + 1).forEach((b) => {
      if (
        doCompare(a, b) &&
        Math.abs(a.length - b.length) / (a.length + b.length) < 0.1 &&
        (a.text === b.text ||
          a.text.includes(b.text) ||
          b.text.includes(a.text) ||
          distance(a.text, b.text) / (a.length + b.length) < 0.1)
      ) {
        if (
          a.text === "O God, my God, my Beloved, my heart’s Desire." ||
          (b.text === a.text) ===
            "O God, my God, my Beloved, my heart’s Desire."
        ) {
          console.log(a.text);
          console.log(b.text);
        }
        b.duplicate = true;
      }
    });
  });

  return data.filter((d) => !d.duplicate).map((d) => d.item);
};
