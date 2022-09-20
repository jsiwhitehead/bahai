import fs from "fs-extra";

import { files } from "./sources.js";
import { readText, writeText } from "./utils.js";

(async () => {
  fs.emptyDirSync("./data/format");

  for (const author of Object.keys(files)) {
    await Promise.all(
      Object.keys(files[author]).map(async (file) => {
        const id = `${author}-${file}`;
        const replace = files[author][file];
        await writeText(
          "format",
          id,
          replace
            .reduce(
              (res, [a, b]) => res.replace(a, b),
              await readText("spellings", id)
            )
            .replace(/(#\n+)+#/g, "#")
            .replace(/[^\S\n]+/g, " ")
            .replace(/(\s*\n){2,}/g, "\n\n")
            .split("\n")
            .map((s) => s.trim())
            .join("\n")
            .trim()
        );
      })
    );
  }

  // await writeJSON(
  //   "spellings",
  //   "the-universal-house-of-justice-messages",
  //   JSON.parse(
  //     correctSpelling(
  //       await fs.promises.readFile(
  //         `./data/download/the-universal-house-of-justice-messages.json`,
  //         "utf-8"
  //       )
  //     )
  //   )
  // );
})();
