import lunr from "lunr";

import stem from "../data/porter2";

import documents from "./data/documents.json";
import quotes from "./data/quotes.json";
import searchIndexJSON from "./data/search.json";

const normaliseString = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w‑]/g, "");

const simplifyText = (s = "") =>
  s &&
  s
    .replace(/\([^\)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\W/g, "")
    .toLowerCase();

const porter2Stemmer = (token) => token.update(() => stem(token.toString()));
lunr.Pipeline.registerFunction(porter2Stemmer, "porter2Stemmer");
const addSynonyms = (token) =>
  ["gather", "meet"].includes(token.toString())
    ? ["gather", "meet"].map((s) => token.clone().update(() => s))
    : token;
lunr.Pipeline.registerFunction(addSynonyms, "addSynonyms");

const searchIndex = lunr.Index.load(searchIndexJSON);

const getText = (p) => {
  if (p.section) return p.title || "* * *";
  if (p.id) {
    const doc = documents[p.id];
    if (!p.parts) return doc.paragraphs[p.paragraphs[0] - 1].text;
    return p.parts
      .map((x) =>
        typeof x === "string"
          ? x
          : doc.paragraphs[x.paragraph - 1].text.slice(x.start, x.end)
      )
      .join("");
  }
  return p.text;
};

const getTime = (words) => {
  const time = words / 238;
  if (time < 2.5) return "1‑2 mins";
  if (time < 60) return `${Math.round(time / 5) * 5} mins`;
  return `${Math.round(time / 6) / 10} hours`;
};

const compare = (sort, a, b) => {
  if (sort === "Relevance") {
    const x = (a.quotes?.parts || []).map((q) => q.count);
    const y = (b.quotes?.parts || []).map((q) => q.count);
    return (
      Math.max(...y) - Math.max(...x) ||
      b.score - a.score ||
      y.reduce((res, n) => res + n, 0) - x.reduce((res, n) => res + n, 0)
    );
  }
  if (sort.startsWith("cited-")) {
    return sort === "cited-desc" ? b.score - a.score : a.score - b.score;
  }
  if (sort === "Date") {
    return a.years[0] + a.years[1] - (b.years[0] + b.years[1]);
  }
  if (sort.startsWith("year-")) {
    const x = a.years[0] + a.years[1];
    const y = b.years[0] + b.years[1];
    return sort === "year-desc" ? y - x : x - y;
  }
  if (sort === "Length") {
    return b.words - a.words;
  }
  if (sort.startsWith("length-")) {
    return sort === "length-desc" ? b.words - a.words : a.words - b.words;
  }
  return 0;
};

const unique = (x) => [...new Set<any>(x)];

const getFirstChar = (index, text) => {
  if (index !== 1) return undefined;
  const result = /[a-z]/i.exec(
    text
      .normalize("NFD")
      .replace(/\u0323/g, "")
      .normalize("NFC")
  )?.index;
  return result === undefined ? result : result + 1;
};
const paragraphParts = (p, quotes) => {
  if (p.section && !p.title) {
    return ["* * *"];
  }
  if (p.section && p.title) {
    const level = p.section.length;
    return [
      level < 4
        ? `${p.section.join(".")}${p.section.length === 1 ? "." : ""} ${
            p.title
          }`
        : p.title,
    ];
  }
  if (p.id && p.parts) {
    return p.parts.map((a) =>
      typeof a === "string"
        ? a
        : {
            quote: "true",
            text: documents[p.id].paragraphs[a.paragraph - 1].text.slice(
              a.start,
              a.end
            ),
          }
    );
  }
  if (p.id) {
    return [
      {
        quote: "true",
        text: documents[p.id].paragraphs[p.paragraphs[0] - 1].text,
      },
    ];
  }
  const firstChar = getFirstChar(p.index, p.text);
  const indices = unique([
    0,
    ...(firstChar === undefined ? [] : [firstChar]),
    ...(quotes?.parts || [])
      .filter((q) => typeof q !== "string")
      .flatMap((q) => [q.start, q.end]),
    ...(p.lines || []),
    ...(p.quotes || []).flatMap((q) => [q.start, q.end]),
    p.text.length,
  ]).sort((a, b) => a - b);
  const result = indices.slice(1).map((end, i) => {
    const start = indices[i];
    return {
      start,
      end,
      text: p.text.slice(start, end),
      first: firstChar !== undefined && end <= firstChar,
      count:
        (quotes?.parts || []).find((q) => q.start <= start && q.end >= end)
          ?.count || 0,
      quote: !!(p.quotes || []).find((q) => q.start <= start && q.end >= end),
    };
  });
  if (p.lines) {
    return p.lines
      .slice(0, -1)
      .map((start, i) =>
        result.filter((a) => a.start >= start && a.end <= p.lines[i + 1])
      );
  }
  return result;
};

const paragraphsMap = {};
const paragraphsList = Object.keys(documents)
  .filter((id) => !["bible", "quran"].some((s) => id.startsWith(s)))
  .flatMap((id) => {
    const { paragraphs, ...doc } = documents[id];
    return paragraphs.map((p, i) => {
      const text = getText(p);
      const result = {
        id,
        ...doc,
        refPath: unique(
          [
            doc.author,
            ...(doc.path || []).filter(
              (p) =>
                ![
                  "Selections from the Writings of the Báb",
                  "Part Two: Letters from Shoghi Effendi",
                  "Selected Messages of the Universal House of Justice",
                  "Additional",
                ].includes(p)
            ),
            doc.title || (doc.item && `#${doc.item}`),
            p.index && `para ${p.index}`,
          ]
            .filter((x) => x)
            .map((s) => (s.length > 50 ? s : s.replace(/ /g, " ")))
        ),
        quotes: quotes[id]?.[i + 1],
        maxQuote: Math.max(
          0,
          ...(quotes[id]?.[i + 1]?.parts || []).map((x) => x.count)
        ),
        text,
        words: text.split(" ").length,
        para: i + 1,
        paragraph: p,
        parts: paragraphParts(p, quotes[id]?.[i + 1]),
      };
      paragraphsMap[`${id}#${i + 1}`] = result;
      return result;
    });
  });

const documentsList = Object.keys(documents).map((id) => {
  const { paragraphs, ...doc } = documents[id];
  const words = paragraphs
    .map((p) => getText(p).split(" ").length)
    .reduce((res, n) => res + n, 0);
  const path =
    doc.path &&
    unique(
      doc.path
        .filter(
          (p) =>
            ![
              "Selections from the Writings of the Báb",
              "Part Two: Letters from Shoghi Effendi",
            ].includes(p)
        )
        .filter((x) => x)
    );
  return {
    ...doc,
    path,
    searchPath: [...path, doc.title]
      .filter((x) => x)
      .map((s) => simplifyText(s))
      .join(""),
    words,
    time: getTime(words),
    score:
      Object.keys(quotes[id] || {})
        .flatMap((k) =>
          quotes[id][k].parts.map(
            (p) =>
              paragraphs[parseInt(k) - 1].text
                .slice(p.start, p.end)
                .trim()
                .split(" ").length * Math.pow(p.count, 2)
          )
        )
        .reduce((res, n) => res + n, 0) /
      Math.sqrt(words) /
      500,
  };
});

const authorGroups = {
  "Bahá’í Era": [
    "The Báb",
    "Bahá’u’lláh",
    "‘Abdu’l‑Bahá",
    "First Epoch",
    "Second Epoch",
    "Third Epoch",
    "Fourth Epoch",
    "Fifth Epoch",
    "Sixth Epoch",
  ],
  "Heroic Age": ["The Báb", "Bahá’u’lláh", "‘Abdu’l‑Bahá"],
  "Word of God": ["The Báb", "Bahá’u’lláh"],
  "Formative Age": [
    "First Epoch",
    "Second Epoch",
    "Third Epoch",
    "Fourth Epoch",
    "Fifth Epoch",
    "Sixth Epoch",
  ],
  "Shoghi Effendi": ["First Epoch", "Second Epoch"],
  "The Universal House of Justice": [
    "Third Epoch",
    "Fourth Epoch",
    "Fifth Epoch",
    "Sixth Epoch",
  ],
};

export const getParagraph = (id, para) => documents[id].paragraphs[para - 1];

const getSearchParas = (search) => {
  if (/title\s*=/.test(search)) {
    const title = simplifyText(search.split("=")[1]);
    return paragraphsList.filter((p) => simplifyText(p.title).includes(title));
  }
  const searchTerms = (search || "")
    .split(/[\s‑]+/g)
    .map((a) => normaliseString(a))
    .filter((a) => a.length > 1 && !stopWords.includes(a));
  if (searchTerms.length === 0) return paragraphsList;
  return searchIndex
    .search(searchTerms.map((a) => `+${a}`).join(" "))
    .map(({ ref, score }) => ({
      ...paragraphsMap[ref],
      score,
    }));
};

export const getDocuments = (author, search, sort) => {
  const allAuthors = authorGroups[author] || [author];
  const simplifySearch = search.split(/\s+/g).map((s) => simplifyText(s));
  return documentsList
    .filter(
      (d) =>
        (allAuthors.includes(d.author) || allAuthors.includes(d.epoch)) &&
        simplifySearch.every((s) => d.searchPath.includes(s))
    )
    .sort((a, b) => compare(sort, a, b) || a.id.localeCompare(b.id))
    .slice(0, 50);
};

export const runSearch = (author, docId, search, view, sort) => {
  const allAuthors = authorGroups[author] || [author];
  const searchResult = getSearchParas(search || "");
  const authorResult = searchResult.filter(
    (p) => allAuthors.includes(p.author) || allAuthors.includes(p.epoch)
  );
  const sortResult = authorResult.sort(
    (a, b) => compare(sort, a, b) || a.id.localeCompare(b.id) || a.para - b.para
  );
  return sortResult.slice(0, 50);
};

// para.text.slice(start, end).trim().split(" ").length,
// quoteParts.reduce(
//   (res, p) => res + p.words * Math.pow(p.count, 2),
//   0
// ) / Math.sqrt(quoteParts.reduce((res, p) => res + p.words, 0)),

//     findDocuments: (section, ignore) => {
//       const sliceNum = 100;
//       if (section === "Collections") {
//         return documentsList
//           .filter(
//             (d) =>
//               ["The World Centre", "The Research Department"].includes(
//                 d.author
//               ) || d.id.startsWith("compilation")
//           )
//           .slice(0, sliceNum);
//       }
//       if (section === "Prayers") {
//         return documentsList
//           .filter((d) => !d.paragraphs.every((p) => p.id || p.section))
//           .filter((d) => d.type === "Prayer")
//           .slice(0, sliceNum);
//       }

// getRef: (paragraphs, index) => {
//   const p = paragraphs[index - 1];
//   const doc = documents[p.id];
//   const next = paragraphs[index];
//   if (
//     next?.id === p.id &&
//     Math.abs(
//       doc.paragraphs[next.paragraphs[0] - 1].index -
//         doc.paragraphs[p.paragraphs[0] - 1].index
//     ) <= 1
//   ) {
//     return "";
//   }
//   let j = 0;
//   while (true) {
//     const prev = paragraphs[index - j - 2];
//     if (
//       prev?.id === p.id &&
//       Math.abs(
//         doc.paragraphs[p.paragraphs[0] - 1].index -
//           doc.paragraphs[prev.paragraphs[0] - 1].index
//       ) <=
//         j + 1
//     ) {
//       j++;
//     } else {
//       break;
//     }
//   }
//   const paras = unique(
//     Array.from({ length: j + 1 })
//       .map(
//         (_, k) =>
//           doc.paragraphs[paragraphs[index - k - 1].paragraphs[0] - 1].index
//       )
//       .filter((x) => x)
//   );
//   return {
//     text: unique(
//       [
//         doc.author,
//         ...doc.path,
//         doc.title || (doc.item && "#" + doc.item),
//         paras.length > 0 &&
//           (paras.length === 1
//             ? `para ${paras[0]}`
//             : `paras ${Math.min(...paras)}‑${Math.max(...paras)}`),
//       ].filter((x) => x)
//     ).join(", "),
//     link: Math.min(
//       ...Array.from({ length: j + 1 }).map(
//         (_, k) => paragraphs[index - k - 1].paragraphs[0]
//       )
//     ),
//   };
// },

// 'allLines': doc.'paragraphs'->every.[p: p.'type' | p.'lines'],
// : [
//   'stack': { ? index: 35, : 60 },
//   'style': ['max-width': '620px', 'margin': '0 auto'],
//   [
//     'size': { ? index: 26, : 34 },
//     'bold': 'true',
//     'underline': !index,
//     'align': 'center',
//     'stack': 15,
//     ...{
//       ? doc.'title': [[doc.'title']],
//       ? !index : [[doc.'path'.1], ['#{doc.'item'}']],
//       : [],
//     }
//   ],
//   [
//     'stack': 25,
//     'align': 'justify',
//     doc.'reader' & [
//       'size': 16,
//       'italic': 'true',
//       'pad': [0, 60],
//       'color': '#999',
//       'style': ['text-align-last': 'center'],
//       doc.'reader',
//     ],

// ...showCitations & (quotesMap.(doc.'id')?.(i)?.'refs' | [])->map.[
//   r: [
//     'size': 16,
//     'italic': 'true',
//     'align': 'left',
//     'color':
//       colors.'link'.(documents.(r.'id').'author') |
//       colors.'link'.'The World Centre',
//     'underline': hover,
//     'link': ['doc', r.'id', : r.'paragraph'],
//     'width': 0.75,
//     'style': ['margin': '0 auto 0 0'],
//     [
//       documents.(r.'id').'author',
//       ...documents.(r.'id').'path',
//       documents.(r.'id').'title' |
//         (documents.(r.'id').'item' & '#{documents.(r.'id').'item'}'),
//     ]
//       ->filter()
//       ->unique()
//       ->join(', ')
//   ]
// ],
// ...showCitations & (p.'quotes' | [])->map.[
//   r: [
//     'size': 16,
//     'italic': 'true',
//     'align': 'left',
//     'color':
//       colors.'link'.(documents.(r.'id').'author') |
//       colors.'link'.'The World Centre',
//     'underline': hover,
//     'link': ['doc', r.'id', : r.'paragraph'],
//     'width': 0.75,
//     'style': ['margin': '0 auto 0 0'],
//     [
//       documents.(r.'id').'author',
//       ...documents.(r.'id').'path',
//       documents.(r.'id').'title' |
//         (documents.(r.'id').'item' & '#{documents.(r.'id').'item'}'),
//     ]
//       ->filter()
//       ->unique()
//       ->join(', ')
//   ]
// ],

// doc.'type' = 'Prayer' & [
//   'align': 'right',
//   'italic': 'true',
//   'color': color,
//   'style': ['clear': 'both'],
//   '— {doc.'author'}',
// ],

const stopWords = [
  "a",
  "able",
  "about",
  "across",
  "after",
  "all",
  "almost",
  "also",
  "am",
  "among",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "but",
  "by",
  "can",
  "cannot",
  "could",
  "dear",
  "did",
  "do",
  "does",
  "either",
  "else",
  "ever",
  "every",
  "for",
  "from",
  "get",
  "got",
  "had",
  "has",
  "have",
  "he",
  "her",
  "hers",
  "him",
  "his",
  "how",
  "however",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "just",
  "least",
  "let",
  "like",
  "likely",
  "may",
  "me",
  "might",
  "most",
  "must",
  "my",
  "neither",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "often",
  "on",
  "only",
  "or",
  "other",
  "our",
  "own",
  "rather",
  "said",
  "say",
  "says",
  "she",
  "should",
  "since",
  "so",
  "some",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "tis",
  "to",
  "too",
  "twas",
  "us",
  "wants",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "will",
  "with",
  "would",
  "yet",
  "you",
  "your",
];
