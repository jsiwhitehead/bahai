import fs from "fs-extra";
import fetch from "node-fetch";
import { parse } from "parse5";

import { files } from "./sources.js";
import { writeJSON, writeText } from "./utils.js";

// const bibleBooks = [
//   "Genesis",
//   "Exodus",
//   "Leviticus",
//   "Numbers",
//   "Deuteronomy",
//   "Joshua",
//   "Judges",
//   "Ruth",
//   "1 Samuel",
//   "2 Samuel",
//   "1 Kings",
//   "2 Kings",
//   "1 Chronicles",
//   "2 Chronicles",
//   "Ezra",
//   "Nehemiah",
//   "Esther",
//   "Job",
//   "Psalm",
//   "Proverbs",
//   "Ecclesiastes",
//   "Song of Songs",
//   "Isaiah",
//   "Jeremiah",
//   "Lamentations",
//   "Ezekiel",
//   "Daniel",
//   "Hosea",
//   "Joel",
//   "Amos",
//   "Obadiah",
//   "Jonah",
//   "Micah",
//   "Nahum",
//   "Habakkuk",
//   "Zephaniah",
//   "Haggai",
//   "Zechariah",
//   "Malachi",
//   "Matthew",
//   "Mark",
//   "Luke",
//   "John",
//   "Acts",
//   "Romans",
//   "1 Corinthians",
//   "2 Corinthians",
//   "Galatians",
//   "Ephesians",
//   "Philippians",
//   "Colossians",
//   "1 Thessalonians",
//   "2 Thessalonians",
//   "1 Timothy",
//   "2 Timothy",
//   "Titus",
//   "Philemon",
//   "Hebrews",
//   "James",
//   "1 Peter",
//   "2 Peter",
//   "1 John",
//   "2 John",
//   "3 John",
//   "Jude",
//   "Revelation",
//   "Tobit",
//   "Judith",
//   "Greek Esther",
//   "Wisdom of Solomon",
//   "Sirach",
//   "Baruch",
//   "Letter of Jeremiah",
//   "Prayer of Azariah",
//   "Susanna",
//   "Bel and the Dragon",
//   "1 Maccabees",
//   "2 Maccabees",
//   "1 Esdras",
//   "Prayer of Manasseh",
//   "Psalm 151",
//   "3 Maccabees",
//   "2 Esdras",
//   "4 Maccabees",
// ];

// const quranSurahs = [
//   "The Opener",
//   "The Cow",
//   "Family of Imran",
//   "The Women",
//   "The Table Spread",
//   "The Cattle",
//   "The Heights",
//   "The Spoils of War",
//   "The Repentance",
//   "Jonah",
//   "Hud",
//   "Joseph",
//   "The Thunder",
//   "Abraham",
//   "The Rocky Tract",
//   "The Bee",
//   "The Night Journey",
//   "The Cave",
//   "Mary",
//   "Ta-Ha",
//   "The Prophets",
//   "The Pilgrimage",
//   "The Believers",
//   "The Light",
//   "The Criterion",
//   "The Poets",
//   "The Ant",
//   "The Stories",
//   "The Spider",
//   "The Romans",
//   "Luqman",
//   "The Prostration",
//   "The Combined Forces",
//   "Sheba",
//   "Originator",
//   "Ya Sin",
//   "Those who set the Ranks",
//   "The Letter “Saad”",
//   "The Troops",
//   "The Forgiver",
//   "Explained in Detail",
//   "The Consultation",
//   "The Ornaments of Gold",
//   "The Smoke",
//   "The Crouching",
//   "The Wind-Curved Sandhills",
//   "Muhammad",
//   "The Victory",
//   "The Rooms",
//   "The Letter “Qaf”",
//   "The Winnowing Winds",
//   "The Mount",
//   "The Star",
//   "The Moon",
//   "The Beneficent",
//   "The Inevitable",
//   "The Iron",
//   "The Pleading Woman",
//   "The Exile",
//   "She that is to be examined",
//   "The Ranks",
//   "The Congregation, Friday",
//   "The Hypocrites",
//   "The Mutual Disillusion",
//   "The Divorce",
//   "The Prohibition",
//   "The Sovereignty",
//   "The Pen",
//   "The Reality",
//   "The Ascending Stairways",
//   "Noah",
//   "The Jinn",
//   "The Enshrouded One",
//   "The Cloaked One",
//   "The Resurrection",
//   "The Man",
//   "The Emissaries",
//   "The Tidings",
//   "Those who drag forth",
//   "He Frowned",
//   "The Overthrowing",
//   "The Cleaving",
//   "The Defrauding",
//   "The Sundering",
//   "The Mansions of the Stars",
//   "The Nightcommer",
//   "The Most High",
//   "The Overwhelming",
//   "The Dawn",
//   "The City",
//   "The Sun",
//   "The Night",
//   "The Morning Hours",
//   "The Relief",
//   "The Fig",
//   "The Clot",
//   "The Power",
//   "The Clear Proof",
//   "The Earthquake",
//   "The Courser",
//   "The Calamity",
//   "The Rivalry in world increase",
//   "The Declining Day",
//   "The Traducer",
//   "The Elephant",
//   "Quraysh",
//   "The Small kindnesses",
//   "The Abundance",
//   "The Disbelievers",
//   "The Divine Support",
//   "The Palm Fiber",
//   "The Sincerity",
//   "The Daybreak",
//   "Mankind",
// ];

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
  //   "quran",
  //   (
  //     await Promise.all(
  //       quranSurahs.map(
  //         async (s, i) =>
  //           `# ${s}\n\n` +
  //           (
  //             await (
  //               await fetch(
  //                 `https://api.qurancdn.com/api/qdc/verses/by_chapter/${
  //                   i + 1
  //                 }?words=true&translation_fields=resource_name%2Clanguage_id&per_page=500&fields=text_uthmani%2Cchapter_id%2Chizb_number%2Ctext_imlaei_simple&translations=131&reciter=7&word_translation_language=en&page=1&word_fields=verse_key%2Cverse_id%2Cpage_number%2Clocation%2Ctext_uthmani%2Ccode_v1%2Cqpc_uthmani_hafs&mushaf=2`
  //               )
  //             ).json()
  //           ).verses
  //             .map((v) =>
  //               v.translations[0].text
  //                 .replace(/˹|˺/g, "")
  //                 .replace(/<sup[^>]*>[^<]*<\/sup>/g, "")
  //                 .replace(/\s+/g, " ")
  //                 .trim()
  //             )
  //             .join("\n")
  //       )
  //     )
  //   ).join("\n\n")
  // );

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
