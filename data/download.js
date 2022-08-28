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

const getParagraphs = (root, splitBr) => {
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
      if (node.tagName === "hr") paras[paras.length - 1] = "* * *";
      else node.childNodes.forEach((n) => walk(n));
    }
  };
  walk(root);
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
          getParagraphs(
            findNode(html, (n) => n.tagName === "body"),
            splitBr
          )
        );
      })
    );
  }

  const messageRows = findNode(
    await fetchHtml(
      "https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/"
    ),
    (n) => n.tagName === "tbody"
  ).childNodes.filter(
    (n) => n.tagName === "tr" && n.attrs.find((x) => x.name === "id")
  );
  const messages = await Promise.all(
    messageRows.map(async (node) => {
      const id = node.attrs.find((x) => x.name === "id").value;
      const [title, addressee, summary] = node.childNodes
        .filter((n) => n.tagName === "td")
        .map((n) => n.childNodes[0].childNodes[0].value);
      const html = await fetchHtml(
        `https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/${id}/${id}.xhtml`
      );
      return {
        id,
        title: correctSpelling(
          {
            "Riḍván 150": "Riḍván 1993",
            "Riḍván 151": "Riḍván 1994",
            "Riḍván 152": "Riḍván 1995",
            "Riḍván 153": "Riḍván 1996",
            "Riḍván 154": "Riḍván 1997",
            "Riḍván 155": "Riḍván 1998",
            "Riḍván 156": "Riḍván 1999",
          }[title] || title
        ),
        addressee: correctSpelling(addressee),
        summary: correctSpelling(summary),
        paragraphs: JSON.parse(
          getParagraphs(findNode(html, (n) => n.tagName === "body"))
        ),
      };
    })
  );
  await writeData(
    "download",
    "the-universal-house-of-justice-messages",
    messages
  );
})();
