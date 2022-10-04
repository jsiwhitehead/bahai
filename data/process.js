import fs from "fs-extra";

import { readText, simplifyText, writeJSON } from "./utils.js";

const notEmpty = (x) => {
  if (Array.isArray(x)) return x.length > 0 ? x : undefined;
  return Object.keys(x).length > 0 ? x : undefined;
};

const noBlanks = (obj) =>
  Object.keys(obj).reduce(
    (res, k) => (obj[k] ? { ...res, [k]: obj[k] } : res),
    {}
  );

const authorYears = {
  "The Báb": [1844, 1850],
  "Bahá’u’lláh": [1852, 1892],
  "‘Abdu’l‑Bahá": [1875, 1921],
  "Shoghi Effendi": [1922, 1957],
};

const getItem = (s) => {
  if (s.startsWith("^")) {
    return { type: "call", text: s.slice(2) };
  }
  if (s.startsWith("*")) {
    return { type: "info", text: s.slice(2) };
  }
  if (s.startsWith(">")) {
    const lines = s.split("\n").map((t) => t.slice(2));
    return {
      text: lines.join(" "),
      lines: lines
        .map((l) => l.length + 1)
        .reduce((res, i) => [...res, res[res.length - 1] + i], [0]),
    };
  }
  return { text: s };
};

const process = (source) => {
  const documents = [];
  let collectionLevel = 0;
  let titlePath = [];
  let configPath = [];
  let indexPath = [];
  let sectionPath = [];
  source.split("\n\n").forEach((s, i) => {
    if (i === 0 || s.startsWith("#") || s === "***") {
      const [titleLine, ...configLines] = s.split("\n");
      const level =
        i === 0
          ? 0
          : titleLine === "#"
          ? collectionLevel
          : titleLine === "***"
          ? collectionLevel + 1
          : titleLine.indexOf(" ");
      const title = ["#", "***"].includes(titleLine)
        ? undefined
        : titleLine.slice(i === 0 ? 0 : level + 1);
      const { collection, translated, ...config } = configLines.reduce(
        (res, c) => {
          const [key, value = "true"] = c.split("=");
          return { ...res, [key]: JSON.parse(value) };
        },
        {}
      );

      titlePath = titlePath.slice(0, level);
      configPath = configPath.slice(0, level);
      indexPath = indexPath.slice(0, level + 1);
      configPath[level] = config;

      if (collection) {
        collectionLevel = level + 1;
        indexPath[level + 1] = 1;
      } else if (level < collectionLevel) {
        collectionLevel = level;
      }
      if (level === collectionLevel) {
        sectionPath = [];
        documents.push({
          path: [...titlePath],
          item: indexPath[level]++ || undefined,
          title,
          translated,
          ...noBlanks(configPath.reduce((res, c) => ({ ...res, ...c }), {})),
          paragraphs: [],
        });
      } else if (!collection) {
        const sectionLevel = level - collectionLevel;
        sectionPath = sectionPath.slice(0, sectionLevel);
        sectionPath[sectionLevel - 1] =
          (sectionPath[sectionLevel - 1] || 0) + 1;
        documents[documents.length - 1].paragraphs.push({
          section: [...sectionPath],
          title,
        });
      }

      titlePath[level] = title;
    } else {
      documents[documents.length - 1].paragraphs.push(getItem(s));
    }
  });

  return documents;
};

(async () => {
  fs.emptyDirSync("./data/process");

  const processed = await Promise.all([
    ...fs
      .readdirSync("./data/manual")
      .map((s) => s.slice(0, -4))
      .map(async (id) => ({ id, docs: process(await readText("manual", id)) })),
    ...fs
      .readdirSync("./data/format")
      .map((s) => s.slice(0, -4))
      .map(async (id) => ({ id, docs: process(await readText("format", id)) })),
  ]);

  const allPrayers = [];
  await Promise.all(
    processed.map(async ({ id, docs }) => {
      allPrayers.push(
        ...docs
          .filter((d) => d.type === "Prayer")
          .map(({ path, title, author, paragraphs }) => ({
            years: authorYears[author],
            author,
            path: notEmpty(
              path?.[0] === "Bahá’í Prayers"
                ? path.filter(
                    (s) =>
                      ![
                        "Bahá’í Prayers",
                        "General Prayers",
                        "Occasional Prayers",
                        "Special Tablets",
                      ].some((x) => s.includes(x))
                  )
                : []
            ),
            title,
            simplified: simplifyText(
              paragraphs
                .filter((p) => !p.type)
                .map((p) => p.text)
                .join(" ")
            ),
            length: paragraphs
              .filter((p) => !p.type)
              .map((p) => p.text)
              .join(" ").length,
            paragraphs,
          }))
      );
      const nonPrayers = docs.filter((d) => d.type !== "Prayer");
      if (nonPrayers.length > 0) {
        await writeJSON("process", id, nonPrayers);
      }
    })
  );

  allPrayers.sort(
    (a, b) =>
      a.length - b.length ||
      a.paragraphs.length - b.paragraphs.length ||
      a.paragraphs.join(" ").localeCompare(b.paragraphs.join(" "))
  );
  const prayers = allPrayers
    .filter((a, i) => {
      const p = allPrayers
        .slice(i + 1)
        .find((b) => b.simplified.includes(a.simplified));
      if (p) {
        p.path = p.path || a.path;
        p.title = p.title || a.title;
      }
      return !p;
    })
    .map(({ simplified, ...p }, index) => {
      let counter = 1;
      return {
        index,
        ...p,
        paragraphs: p.paragraphs.map((p) =>
          !p.text || p.type || p.lines ? p : { index: counter++, ...p }
        ),
      };
    });
  await writeJSON("process", "prayers", prayers);
})();
