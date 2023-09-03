import fs from "fs-extra";
import * as prettier from "prettier";

export const mapObject = (obj, map) =>
  Object.keys(obj).reduce((res, k) => ({ ...res, [k]: map(obj[k], k) }), {});

export const simplifyText = (s) =>
  s
    .replace(/\([^\)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
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

export const prettify = (s, format) => prettier.format(s, { parser: format });

export const readText = (category, id) =>
  fs.promises.readFile(`./data/${category}/${id}.txt`, "utf-8");
export const readJSON = async (category, id) =>
  JSON.parse(
    await fs.promises.readFile(`./data/${category}/${id}.json`, "utf-8")
  );

export const writeText = (category, id, data) =>
  fs.promises.writeFile(`./data/${category}/${id}.txt`, data, "utf-8");
export const writeJSON = async (category, id, data) =>
  fs.promises.writeFile(
    `./data/${category}/${id}.json`,
    await prettify(JSON.stringify(data, null, 2), "json"),
    "utf-8"
  );
