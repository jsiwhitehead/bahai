import fs from "fs-extra";
import fetch from "node-fetch";
import { parse } from "parse5";

import { files } from "./sources.js";
import { writeJSON, writeText } from "./utils.js";

const bibleBooks = [
  // "Genesis",
  // "Exodus",
  // "Leviticus",
  // "Numbers",
  // "Deuteronomy",
  // "Joshua",
  // "Judges",
  // "Ruth",
  // "1 Samuel",
  // "2 Samuel",
  // "1 Kings",
  // "2 Kings",
  // "1 Chronicles",
  // "2 Chronicles",
  // "Ezra",
  // "Nehemiah",
  // "Esther",
  // "Job",
  // "Psalm",
  // "Proverbs",
  // "Ecclesiastes",
  // "Song of Songs",
  // "Isaiah",
  // "Jeremiah",
  // "Lamentations",
  // "Ezekiel",
  // "Daniel",
  // "Hosea",
  // "Joel",
  // "Amos",
  // "Obadiah",
  // "Jonah",
  // "Micah",
  // "Nahum",
  // "Habakkuk",
  // "Zephaniah",
  // "Haggai",
  // "Zechariah",
  // "Malachi",
  // "Matthew",
  // "Mark",
  // "Luke",
  // "John",
  // "Acts",
  // "Romans",
  // "1 Corinthians",
  // "2 Corinthians",
  // "Galatians",
  // "Ephesians",
  // "Philippians",
  // "Colossians",
  // "1 Thessalonians",
  // "2 Thessalonians",
  // "1 Timothy",
  // "2 Timothy",
  // "Titus",
  // "Philemon",
  // "Hebrews",
  // "James",
  // "1 Peter",
  // "2 Peter",
  // "1 John",
  // "2 John",
  // "3 John",
  // "Jude",
  // "Revelation",
  // "Tobit",
  // "Judith",
  // "Greek Esther",
  // "Wisdom of Solomon",
  // "Sirach",
  // "Baruch",
  // "Letter of Jeremiah",
  // "Prayer of Azariah",
  // "Susanna",
  // "Bel and the Dragon",
  // "1 Maccabees",
  // "2 Maccabees",
  // "1 Esdras",
  // "Prayer of Manasseh",
  // "Psalm 151",
  // "3 Maccabees",
  // "2 Esdras",
  // "4 Maccabees",
];

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
  "sub",
  "cite",
  "br",
];

const fetchHtml = async (url) => {
  while (true) {
    try {
      return parse(await (await fetch(url)).text());
    } catch (error) {
      console.log(error);
    }
  }
};

const getText = (root) => {
  if (!root) return "";
  let result = "";
  const walk = (node) => {
    if (node.nodeName === "#text") {
      result += node.value;
    } else if (node.tagName === "hr") {
      result += "\n***\n";
    } else if (node.tagName && !["a", "script", "sup"].includes(node.tagName)) {
      if (!inline.includes(node.tagName)) result += "\n";
      node.childNodes.forEach((n) => walk(n));
    }
  };
  walk(root);
  return result
    .replace(/[^\S\n]+/g, " ")
    .replace(/\s*\n+\s*/g, "\n\n")
    .trim();
};

(async () => {
  fs.emptyDirSync("./data/download");

  for (const author of Object.keys(files)) {
    await Promise.all(
      Object.keys(files[author]).map(async (file) => {
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
        await writeText(
          "download",
          `${author}-${file}`,
          getText(findNode(html, (n) => n.tagName === "body"))
        );
      })
    );
  }

  // await writeText(
  //   "download",
  //   `bible`,
  //   (
  //     await Promise.all(
  //       bibleBooks.map(
  //         async (book) =>
  //           await Promise.all(
  //             Array.from({ length: 150 })
  //               .map(async (_, i) =>
  //                 getText(
  //                   findNode(
  //                     await fetchHtml(
  //                       `https://www.biblegateway.com/passage/?search=${book}%20${
  //                         i + 1
  //                       }&version=NRSVUE`
  //                     ),
  //                     (n) =>
  //                       n.attrs?.find((a) => a.name === "class")?.value ===
  //                       "passage-text"
  //                   )
  //                 )
  //               )
  //               .filter((x) => x)
  //               .join("\n\n***\n\n")
  //           )
  //       )
  //     )
  //   ).join("\n\n***\n\n")
  // );

  // const messageRows = findNode(
  //   await fetchHtml(
  //     "https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/"
  //   ),
  //   (n) => n.tagName === "tbody"
  // ).childNodes.filter(
  //   (n) => n.tagName === "tr" && n.attrs.find((x) => x.name === "id")
  // );
  // const messages = await Promise.all(
  //   messageRows.map(async (node) => {
  //     const id = node.attrs.find((x) => x.name === "id").value;
  //     const [title, addressee, summary] = node.childNodes
  //       .filter((n) => n.tagName === "td")
  //       .map((n) => n.childNodes[0].childNodes[0].value);
  //     const html = await fetchHtml(
  //       `https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/${id}/${id}.xhtml`
  //     );
  //     return {
  //       id,
  //       title:
  //         {
  //           "Riḍván 150": "Riḍván 1993",
  //           "Riḍván 151": "Riḍván 1994",
  //           "Riḍván 152": "Riḍván 1995",
  //           "Riḍván 153": "Riḍván 1996",
  //           "Riḍván 154": "Riḍván 1997",
  //           "Riḍván 155": "Riḍván 1998",
  //           "Riḍván 156": "Riḍván 1999",
  //           "Bahá 154 B.E.": "1 March 1997",
  //         }[title] || title,
  //       addressee,
  //       summary,
  //       text: getText(findNode(html, (n) => n.tagName === "body")),
  //     };
  //   })
  // );
  // await writeJSON(
  //   "download",
  //   "the-universal-house-of-justice-messages",
  //   messages
  // );
})();
