import fs from "fs-extra";
import fetch from "node-fetch";
import { parse } from "parse5";

import { files } from "./sources.js";
import { correctSpelling, writeData } from "./utils.js";

const findNode = (node, test) => {
  if (test(node)) return node;
  for (const n of node.childNodes || []) {
    const res = findNode(n, test);
    if (res) return res;
  }
};

const inline = [
  "span",
  "wbr",
  "u",
  "b",
  "i",
  "em",
  "strong",
  "sup",
  "sub",
  "cite",
];

const fetchHtml = async (url) => {
  while (true) {
    try {
      return parse(await (await fetch(url)).text());
    } catch {}
  }
};

const getParagraphs = (
  html,
  splitBr,
  rootNodeTest = (n) => n.tagName === "body"
) => {
  const paras = [""];
  const walk = (node) => {
    if (node.nodeName === "#text") {
      paras[paras.length - 1] = paras[paras.length - 1] + node.value;
    } else if (node.tagName && !["a", "script"].includes(node.tagName)) {
      if (
        !(inline.includes(node.tagName) || (node.tagName === "br" && !splitBr))
      ) {
        paras.push("");
      }
      node.childNodes.forEach((n) => walk(n));
    }
  };
  walk(findNode(html, rootNodeTest));
  return correctSpelling(
    JSON.stringify(
      paras.map((p) => p.replace(/\s+/g, " ").trim()).filter((p) => p)
    )
  );
};

(async () => {
  fs.emptyDirSync("./data/download");

  for (const author of Object.keys(files)) {
    await Promise.all(
      Object.keys(files[author]).map(async (file) => {
        const { splitBr } = files[author][file];
        const html = await fetchHtml(
          `https://www.bahai.org/library/${
            [
              "official-statements-commentaries",
              "publications-individual-authors",
            ].includes(author)
              ? "other-literature"
              : "authoritative-texts"
          }/${author}/${file}/${file}.xhtml`
        );
        await writeData(
          "download",
          `${author}-${file}`,
          getParagraphs(html, splitBr)
        );
      })
    );
  }
})();
