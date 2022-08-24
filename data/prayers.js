import fs from "fs-extra";

import { files } from "./sources.js";
import { readJSON, removeDuplicates, writeData } from "./utils.js";

(async () => {
  fs.emptyDirSync("./data/prayers");

  const allPrayers = [];
  for (const author of Object.keys(files)) {
    await Promise.all(
      Object.keys(files[author]).map(async (file) => {
        const id = `${author}-${file}`;
        const data = await readJSON("process", id);
        allPrayers.push(
          ...data.items
            .filter((x) => x.type === "Prayer")
            .map((p, i) => ({
              id: `${id}-${i + 1}`,
              author: p.author || data.author,
              paragraphs: p.paragraphs,
              length: p.paragraphs.reduce((res, p) => res + p.length, 0),
            }))
        );
      })
    );
  }

  const prayers = removeDuplicates(
    allPrayers,
    (p) => p.paragraphs.join(" "),
    (a, b) => a.author === b.author
  )
    .sort((a, b) => a.length - b.length)
    .filter(
      (p) =>
        ![
          "abdul-baha-additional-prayers-revealed-abdul-baha-13",
          "prayers-bahai-prayers-115",
          "prayers-bahai-prayers-181",
          "prayers-bahai-prayers-109",
          "prayers-bahai-prayers-214",
          "bahaullah-prayers-meditations-167",
          "prayers-bahai-prayers-196",
        ].includes(p.id)
    );

  await writeData("prayers", "prayers", prayers);
})();
