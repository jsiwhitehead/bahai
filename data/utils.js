import fs from "fs-extra";
import * as prettier from "prettier";

export const simplifyText = (s) =>
  s
    .replace(/\([^\)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\bye\b/gi, "you")
    .replace(/\byea\b/gi, "yes")
    .replace(/\bnay\b/gi, "no")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\W/g, "")
    .toLowerCase();

export const replaceInText = (text, replace) =>
  Object.keys(replace).reduce(
    (res, original) => res.replace(original, replace[original]),
    text
  );

export const intersects = (a, b) => a.some((x) => b.includes(x));

export const last = (x) => x[x.length - 1];

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

export const prettify = (s, format) => prettier.format(s, { parser: format });

export const readJSON = async (category, id) => {
  try {
    return JSON.parse(
      await fs.promises.readFile(`./data/${category}/${id}.json`, "utf-8")
    );
  } catch {
    return null;
  }
};

export const writeJSON = (category, id, data) =>
  fs.promises.writeFile(
    `./data/${category}/${id}.json`,
    prettify(JSON.stringify(data, null, 2), "json"),
    "utf-8"
  );

export const getYearsFromId = (id) => {
  const v = parseFloat(id.slice(0, 4) + "." + id.slice(4, 6) + id.slice(6, 8));
  return [v, v];
};

const lowerFirstLetter = (s) => s.charAt(0).toLowerCase() + s.slice(1);
export const getMessageTo = (addressee) => {
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
  } else if (lower.includes("íránian")) {
    return "to Íránian Bahá’ís outside Írán";
  } else if (
    ["írán", "cradle", "lovers of the most great beauty"].some((s) =>
      lower.includes(s)
    )
  ) {
    if (lower.includes("youth")) {
      return "to Bahá’í youth in Írán";
    } else if (lower.includes("students")) {
      return "to Bahá’í students in Írán";
    } else {
      return "to the Bahá’ís of Írán";
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
