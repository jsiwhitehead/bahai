// "Words of Wisdom": [1857, 1863]
// "The Dawn‑Breakers": [1887, 1888]
// "The Constitution of the Universal House of Justice": [1972, 1972]

const authorYears = {
  "The Báb": [1844, 1850],
  "Bahá’u’lláh": [1852, 1892],
  "‘Abdu’l‑Bahá": [1875, 1921],
  "Shoghi Effendi": [1922, 1957],
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const prefix = (line, pre) => [line, (s) => `${pre}${s}`];
const getTitle = (s, t, translated) => {
  if (!translated) return s;
  if (s.toLowerCase().includes("excerpts")) return `Excerpts from the ${t}`;
  if (s.toLowerCase().includes("excerpt")) return `Excerpt from the ${t}`;
  return t;
};
const title = (level, title, { collection, translated, ...config } = {}) => [
  new RegExp(
    `(${[title, translated]
      .filter((x) => x)
      .map((x) => `^(Excerpt.*|)${escapeRegex(x)}.*$`)
      .join("|")})(\n\n^\\(.*\\)$)?`,
    "m"
  ),
  (s) =>
    [
      `${level ? level + " " : ""}${getTitle(s, title, translated)}`,
      ...Object.keys(config).map((k) => `${k}=${JSON.stringify(config[k])}`),
      translated && `translated="${translated}"`,
      collection && "collection\n\n#",
    ]
      .filter((x) => x)
      .join("\n"),
];
const removeAfter = (s) => [new RegExp(`^${escapeRegex(s)}[\\s\\S]+`, "m"), ""];
const splitLines = (line, ...indices) => [
  line,
  (s) => {
    const alternate =
      indices[indices.length - 1] === true ? indices.pop() : false;
    const allIndices = [
      0,
      ...indices.map((x) => (typeof x === "string" ? s.indexOf(x) : x)),
      s.length,
    ];
    return (
      "\n" +
      allIndices
        .slice(0, -1)
        .map(
          (num, i) =>
            `${alternate && i % 2 === 0 ? "\n\n" : "\n"}> ${s
              .slice(num, allIndices[i + 1])
              .trim()}`
        )
        .join("")
    );
  },
];

const obligatory = [
  prefix(/^To be recited once in twenty‑four/gm, "* "),
  prefix(/^To be recited daily, in the morning/m, "* "),
  prefix(/^Whoso wisheth to pray, let him wash/m, "* "),
  prefix(/^And while washing his face, let/m, "* "),
  prefix(/^Then let him stand up, and facing the/m, "* "),
  prefix(/^Let him, then/gm, "* "),
  prefix(/^Then, standing with open hands, palms/m, "* "),
  prefix(/^\(If anyone choose to recite instead/m, "* "),
  prefix(/^Whoso wisheth to recite this prayer/m, "* "),
  prefix(/^Let him then/gm, "* "),
  prefix(/^Let him again raise his hands/m, "* "),
  prefix(/^\(If the dead be a woman, let him say/m, "* "),
];

const getYearsFromId = (id) => {
  const v = parseFloat(id.slice(0, 4) + "." + id.slice(4, 6) + id.slice(6, 8));
  return [v, v];
};

const lowerFirstLetter = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const getMessageTo = (addressee) => {
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

export const files = {
  "the-bab": {
    "selections-writings-bab": [
      title("", "Selections from the Writings of the Báb", {
        author: "The Báb",
        years: authorYears["The Báb"],
        collection: true,
      }),
      removeAfter("Key to Passages Translated by Shoghi Effendi"),
      [/^\d+$/gm, ""],
      [
        "Compiled by the Research Department of the Universal House of Justice and translated by Ḥabíb Taherzadeh with the assistance of a Committee at the Bahá’í World Centre",
        "",
      ],
      ["References to the Qur’án", ""],
      [
        "In footnotes referring to the Qur’án the súrihs have been numbered according to the original, whereas the verse numbers are those in Rodwell’s translation which differ sometimes from those of the Arabic.",
        "",
      ],
      title("#", "Tablets and Addresses", { collection: true }),
      title("##", "A Tablet Addressed to “Him Who Will Be Made Manifest”"),
      title("##", "Tablet to the First Letter of the Living"),
      title("##", "Extracts from an Epistle to Muḥammad Sháh"),
      title("##", "Extracts from Another Epistle to Muḥammad Sháh"),
      title("##", "Extracts from a Further Epistle to Muḥammad Sháh"),
      title(
        "##",
        "Extracts from a Tablet Containing Words Addressed to the Sherif of Mecca"
      ),
      title("##", "Address to a Muslim Divine"),
      title(
        "##",
        "Address to Sulaymán, One of the Muslim Divines in the Land of Masqaṭ"
      ),
      title("#", "Commentary on the Súrih of Joseph", {
        translated: "Qayyúmu’l‑Asmá’",
        collection: true,
      }),
      title("#", "Persian Utterance", {
        translated: "Persian Bayán",
        collection: true,
      }),
      title("#", "Seven Proofs", {
        translated: "Dalá’il‑i‑Sab‘ih",
        collection: true,
      }),
      title("#", "Book of Names", {
        translated: "Kitáb‑i‑Asmá’",
        collection: true,
      }),
      title("#", "Excerpts from Various Writings", { collection: true }),
      title("#", "Prayers and Meditations", {
        type: "Prayer",
        collection: true,
      }),
      [/Chapter [A-Z]+.$/gm, (s) => `${s}\n\n#\n\n`],
      [/[A-Z]+, \d+.$/gm, (s) => `${s}\n\n#\n\n`],
      prefix(/^Gracious God! Within the domains/m, "\n\n#\n\n"),
      prefix(/^Ponder likewise the Dispensation/m, "\n\n#\n\n"),
      prefix(/^Consider the manifold favours/m, "\n\n#\n\n"),
      prefix(/^Let Me set forth some rational/m, "\n\n#\n\n"),
      prefix(/^The recognition of Him Who is/m, "\n\n#\n\n"),
      prefix(/^The evidences which the people/m, "\n\n#\n\n"),
      prefix(/^Rid thou thyself of all attachments/m, "\n\n#\n\n"),
      prefix(/^It is recorded in a tradition/m, "\n\n#\n\n"),
      prefix(/^Thy letter hath been perused/m, "\n\n#\n\n"),
      prefix(/^Say, verily any one follower of/m, "\n\n#\n\n"),
      prefix(/^God testifieth that there is none other God/gm, "\n\n#\n\n"),
      prefix(/^From the beginning that hath no/m, "\n\n#\n\n"),
      prefix(/^Consecrate Thou, O my God, the/m, "\n\n#\n\n"),
      prefix(/^He—glorified be His mention—resembleth/m, "\n\n#\n\n"),
      prefix(/^The glory of Him Whom God shall/m, "\n\n#\n\n"),
      prefix(/^All men have proceeded from God/m, "\n\n#\n\n"),
      prefix(/^In the Name of God, the Most Exalted/gm, "\n\n#\n\n"),
      prefix(/^He is God, the Sovereign Lord/m, "\n\n#\n\n"),
      prefix(/^He is God, the Supreme Ruler/m, "\n\n#\n\n"),
      prefix(/^O thou who art the chosen one/m, "\n\n#\n\n"),
      prefix(/^When the Daystar of Bahá will/m, "\n\n#\n\n"),
      prefix(/^He is the Almighty./m, "\n\n#\n\n"),
      prefix(/^It behoveth you to await the Day/m, "\n\n#\n\n"),
      prefix(/^Send down Thy blessings, O my God/m, "\n\n#\n\n"),
      prefix(/^Immeasurably glorified and exalted art Thou./m, "\n\n#\n\n"),
      prefix(/^Verily I am Thy servant, O my God/m, "\n\n#\n\n"),
      prefix(/^Magnified be Thy Name, O God./m, "\n\n#\n\n"),
      prefix(/^Lauded be Thy Name, O God./m, "\n\n#\n\n"),
      prefix(/^Glory be unto Thee, O God. How/m, "\n\n#\n\n"),
      prefix(/^Praise be unto Thee, O Lord. Forgive/m, "\n\n#\n\n"),
      prefix(/^O God our Lord! Protect us through Thy/m, "\n\n#\n\n"),
      prefix(/^Glory be unto Thee, O Lord my God!/gm, "\n\n#\n\n"),
      prefix(/^Glorified be Thy Name, O Lord!/gm, "\n\n#\n\n"),
      prefix(/^Thou art aware, O My God, that/gm, "\n\n#\n\n"),
      prefix(/^I am aware, O Lord, that my/gm, "\n\n#\n\n"),
      prefix(/^I beg Thee to forgive me, O my/gm, "\n\n#\n\n"),
      prefix(/^How can I praise Thee, O Lord/gm, "\n\n#\n\n"),
      prefix(/^Glory be to Thee, O God! Thou/gm, "\n\n#\n\n"),
      prefix(/^I implore Thee by the splendour/gm, "\n\n#\n\n"),
      prefix(/^Do Thou ordain for me, O Lord/gm, "\n\n#\n\n"),
      prefix(/^How numerous the souls raised/gm, "\n\n#\n\n"),
      prefix(/^Glory be unto Thee, O Lord!/gm, "\n\n#\n\n"),
      prefix(/^O Lord! Enable all the peoples/gm, "\n\n#\n\n"),
      prefix(/^Vouchsafe unto me, O my God/gm, "\n\n#\n\n"),
      prefix(/^Glory be unto Thee, O Lord, Thou/gm, "\n\n#\n\n"),
      prefix(/^O Lord! Unto Thee I repair for/gm, "\n\n#\n\n"),
      prefix(/^O Lord! Thou art the Remover of/gm, "\n\n#\n\n"),
      prefix(/^Throughout eternity Thou hast/gm, "\n\n#\n\n"),
      prefix(/^The glory of glories and the most/gm, "\n\n#\n\n"),
      prefix(/^In the Name of God, the Compassionate/gm, "\n\n#\n\n"),
      prefix(/^Thou art God, no God is there but Thee./gm, "\n\n#\n\n"),
      prefix(/^Immeasurably exalted art Thou, O my/gm, "\n\n#\n\n"),
      prefix(/^All majesty and glory, O my God/gm, "\n\n#\n\n"),
      prefix(/^O my God! There is no one but Thee/gm, "\n\n#\n\n"),
      prefix(/^O my God! I have failed to know/gm, "\n\n#\n\n"),
      prefix(/^He is God, the Sovereign Ruler/gm, "\n\n#\n\n"),
      prefix(/^O my God, my Lord and my Master! I have/gm, "\n\n#\n\n"),
      prefix(/^I adjure Thee by Thy might/gm, "\n\n#\n\n"),
      prefix(/^I beg Thy forgiveness, O/gm, "\n\n#\n\n"),
      prefix(/^Lauded be Thy Name, O Lord our/gm, "\n\n#\n\n"),
      prefix(/^Through Thy revelation, O my/gm, "\n\n#\n\n"),
      prefix(/^In the Name of thy Lord, the/gm, "\n\n#\n\n"),
      prefix(/^Glorified art Thou, O Lord my/gm, "\n\n#\n\n"),
      prefix(/^Praised and glorified art Thou, O/gm, "\n\n#\n\n"),
      prefix(/^Thou knowest full well, O my/gm, "\n\n#\n\n"),
      prefix(/^Praise be to Thee, O Lord, my/gm, "\n\n#\n\n"),
      prefix(/^O my God, O my Lord, O my Master!/gm, "\n\n#\n\n"),
      prefix(/^Thou seest, O my Lord, my/gm, "\n\n#\n\n"),
      prefix(/^Is there any Remover of difficulties/gm, "\n\n#\n\n"),
    ],
  },
  bahaullah: {
    "call-divine-beloved": [
      [/^\d+$/gm, "#"],
      removeAfter("Notes"),
      ["Selected Mystical Works of Bahá’u’lláh", ""],
      title("", "The Call of the Divine Beloved", {
        author: "Bahá’u’lláh",
        years: [1852, 1863],
        collection: true,
      }),
      title("#", "Preface", {
        author: "The Universal House of Justice",
        years: [2019, 2019],
      }),
      title("#", "The Clouds of the Realms Above", {
        translated: "Rashḥ‑i‑‘Amá",
      }),
      title("#", "The Seven Valleys"),
      title("#", "From the Letter Bá’ to the Letter Há’"),
      title("#", "Three Other Tablets", { collection: true }),
      title("#", "The Four Valleys"),
      splitLines(/^’Tis from Our rapture.*/m, "’Tis from Our anthem"),
      splitLines(/^Upon the Eastern wind.*/m, "This sweetly scented"),
      splitLines(/^The day‑star of adornment.*/m, "Behold that mystic"),
      splitLines(/^The sea of purity.*/m, "This precious, rare"),
      splitLines(/^The treasuries of love.*/m, "From out this treasure"),
      splitLines(/^The splendour of the.*/m, "This subtle music from"),
      splitLines(/^The trumpet‑blast of.*/m, "Both at a single breath"),
      splitLines(/^The Day of “I am He”.*/m, "The Age of “He is He”"),
      splitLines(/^From out the fountain.*/m, "This cup of honeyed"),
      splitLines(/^The Day of God hath.*/m, "This wondrous message"),
      splitLines(/^Behold Bahá’s outpouring.*/m, "Which, merged into"),
      splitLines(/^Behold the Lord’s leviathan.*/m, "Behold the blessings"),
      splitLines(/^Behold the Palm of.*/m, "Behold the glorious hymns"),
      splitLines(/^Behold the soul‑entrancing.*/m, "Behold the sacred"),
      splitLines(/^Behold the Countenance.*/m, "Behold the grace upon"),
      splitLines(/^Behold the everlasting.*/m, "Behold the crystal"),
      splitLines(/^Behold the fire of Moses.*/m, "Behold the heart"),
      splitLines(/^Hear ye the sotted.*/m, "Behold the bliss that"),
      splitLines(/^Behold the radiant face.*/m, "Behold the Lordly grace"),
      splitLines(/^The vessel of the Advent.*/m, "The trill of songbirds"),
      splitLines(/For the infidel, error—for.*/m, "For ‘Aṭṭár’s heart"),
      splitLines(/A lover is he who is chill.*/m, "A knower is he who"),
      splitLines(/Ne’er will love allow a.*/m, "Ne’er will the falcon"),
      splitLines(/Love’s a stranger to earth.*/m, "In him are lunacies"),
      splitLines(/Kindle the fire of love.*/m, "Then set thy foot"),
      splitLines(/Split the atom’s heart.*/m, "Within it thou wilt"),
      splitLines(
        /Veiled from this was Moses.*/m,
        "Despite His virtue",
        "Then thou who hast",
        "Abandon any hope"
      ),
      splitLines(/Cleanse thou the rheum.*/m, "And breathe the breath"),
      splitLines(/How can a curtain part.*/m, "When Alexander’s wall"),
      splitLines(/If Khiḍr did wreck the.*/m, "A thousand rights are"),
      splitLines(/In thy soul, of love.*/m, "And burn all thoughts"),
      splitLines(/If I speak forth, many.*/m, "And if I write, many"),
      splitLines(/The bliss of mystic knowers.*/m, "A bliss no"),
      splitLines(/How many are the matters I.*/m, "For my words would"),
      splitLines(/How can feeble reason.*/m, "Or the spider snare"),
      splitLines(/Dost thou deem thyself.*/m, "When thou foldest within"),
      splitLines(/The tale remaineth yet.*/m, "Forgive me, then, for"),
      splitLines(
        /When once shone forth.*/m,
        "Of Him Who is the",
        "All mention Moses",
        "Of every fleeting"
      ),
      splitLines(/The Friend, unveiled, doth.*/m, "Through every door"),
      splitLines(
        /Even as the noontide sun.*/m,
        "Hath the True One",
        "But alas that He",
        "To the city of"
      ),
      splitLines(
        /Shattered was the pen at once.*/m,
        "Rent and torn in",
        "When the pen did",
        "Of depicting such"
      ),
      ["loss and death. Peace be upon", "loss and death.\n\nPeace be upon"],
      splitLines(
        /Live free of love, for.*/m,
        "Is grief and sorrow",
        "It starteth but with",
        "It endeth but with"
      ),
      splitLines(
        /^O thou lion‑hearted soul.*/m,
        "Even as a lion",
        "That thy roaring",
        "To the seventh"
      ),
      splitLines(
        /Thy faithlessness I cherish.*/m,
        "Than every gift",
        "To suffer at thy",
        "How much dearer"
      ),
      splitLines(/“O for a drop to drink!”.*/m, "“O for a thirsty"),
      splitLines(
        /^O light of truth and sword.*/m,
        "And soul of generosity",
        "No prince hath sky",
        "Who fain could hope"
      ),
      splitLines(
        /What fault didst thou observe.*/m,
        "That made thee cease",
        "Is it that poverty’s",
        "And wealth and pageantry"
      ),
      splitLines(/I do as bidden and convey.*/m, "Whether it give thee"),
      splitLines(
        /Tell us not the tale of Laylí.*/m,
        "Thy love hath made",
        "When once thy name",
        "And set the speakers"
      ),
      splitLines(
        /Each moon, O my belov’d.*/m,
        "For three days",
        "Today’s the first",
        "’Tis why thou"
      ),
      prefix("that after death the mystery", "\n\n"),
      splitLines(/O Abraham of the Spirit.*/m, "Slay! Slay these four"),
      splitLines(/With renunciation, not.*/m, "Be nothing, then, and"),
      splitLines(
        /How can meagre reason comprehend.*/m,
        "Or the spider trap",
        "Wouldst thou that",
        "Seize it and enrol"
      ),
      splitLines(
        /Love shunneth this world.*/m,
        "In him are lunacies",
        "The minstrel of love",
        "Servitude enslaveth"
      ),
      splitLines(
        /The story of Thy beauty.*/m,
        "Crazed, he sought",
        "The love of Thee",
        "The pain of Thee"
      ),
      splitLines(
        /The lovers’ teacher is.*/m,
        "His face their lesson",
        "Learning of wonderment",
        "Not on learned chapters",
        "The chains that bind",
        "The Cyclic Scheme"
      ),
      splitLines(
        /O Lord, O Thou Whose grace.*/m,
        "To mention aught before",
        "Allow this mote of",
        "To free itself of lowly",
        "And grant this drop",
        "To be at last united"
      ),
      splitLines(/Speak the Persian tongue.*/m, "Love indeed doth"),
      splitLines(
        /Our hearts will be as open.*/m,
        "Should He the pearls",
        "Our lives will ready",
        "Were He to hurl the"
      ),
      splitLines(
        /My soul doth sense the fragrant.*/m,
        "Of a well‑beloved",
        "The fragrance of",
        "Who’s my heart’s"
      ),
      splitLines(
        /The duty of long years of love.*/m,
        "And tell the tale",
        "That land and sky",
        "And it may gladden"
      ),
      prefix("For this is the realm of God", "\n\n"),
      splitLines(
        /None may approach that.*/m,
        "Who harboureth his",
        "None may embrace",
        "Who’s burdened"
      ),
      splitLines(/No more than this will I.*/m, "The riverbed can never"),
      splitLines(/I seek thy nearness, more.*/m, "I see thy visage"),
      ["Shams‑i‑Tabríz. Peace be", "Shams‑i‑Tabríz.\n\nPeace be"],
      splitLines(
        /Let us tell, some other day.*/m,
        "This parting hurt",
        "Let us write",
        "Love’s secrets—better",
        "Leave blood and noise",
        "And say no more"
      ),
      splitLines(/I write no more, beleaguered.*/m, "That my sweet"),
      prefix(/^An exposition of the mysteries/gm, "* "),
      prefix(/^In the Name of God, the Merciful/gm, "^ "),
      prefix(/^In the name of our Lord, the Most/gm, "^ "),
      prefix(/^In the name of the peerless and/gm, "^ "),
      prefix(/^He is the Ever‑Living/gm, "^ "),
    ],
    "days-remembrance": [
      removeAfter("Notes"),
      title("", "Days of Remembrance", {
        author: "Bahá’u’lláh",
        years: authorYears["Bahá’u’lláh"],
        collection: true,
      }),
      ["Selections from the Writings of Bahá’u’lláh for Bahá’í Holy Days", ""],
      title("#", "Preface", {
        author: "The Universal House of Justice",
        years: [2017, 2017],
      }),
      [/^— .* —$/gm, "#"],
      title("#", "Naw‑Rúz", { collection: true }),
      title("#", "Riḍván", { collection: true }),
      title("#", "Declaration of the Báb", { collection: true }),
      title("#", "Ascension of Bahá’u’lláh", { collection: true }),
      title("#", "Martyrdom of the Báb", { collection: true }),
      title("#", "Birth of the Báb", { collection: true }),
      title("#", "Birth of Bahá’u’lláh", { collection: true }),
      title("##", "Tablet of the Wondrous Maiden", {
        translated: "Ḥúr‑i‑‘Ujáb",
      }),
      title("##", "Tablet of the Lover and the Beloved", {
        translated: "Lawḥ‑i‑‘Áshiq va Ma‘shúq",
      }),
      title("##", "Tablet of the Pen", { translated: "Súriy‑i‑Qalam" }),
      title("##", "Tablet of the Bell", { translated: "Lawḥ‑i‑Náqús" }),
      title("##", "Tablet of the Immortal Youth", {
        translated: "Lawḥ‑i‑Ghulámu’l‑Khuld",
      }),
      title("##", "Tablet of the Branch", { translated: "Súriy‑i‑Ghuṣn" }),
      title("##", "Tablet to Rasúl", { translated: "Lawḥ‑i‑Rasúl" }),
      title("##", "Tablet to Maryam", { translated: "Lawḥ‑i‑Maryam" }),
      title("##", "Book of the Covenant", { translated: "Kitáb‑i‑‘Ahd" }),
      title("##", "The Tablet of Visitation"),
      title("##", "Tablet of Counsel", { translated: "Súriy‑i‑Nuṣḥ" }),
      title("##", "Tablet of the Kings", { translated: "Súriy‑i‑Múlúk" }),
      title("##", "Tablet to Salmán I", { translated: "Lawḥ‑i‑Salmán I" }),
      title("##", "Tablet of Remembrance", { translated: "Súriy‑i‑Dhikr" }),
      title("##", "Tablet of Sorrows", { translated: "Súriy‑i‑Aḥzán" }),
      title("##", "Tablet of the Birth", { translated: "Lawḥ‑i‑Mawlúd" }),
      [/^(#.*(?:\n.+)*\n\n)([A-Z].{0,100})$/gm, (_, a, b) => `${a}* ${b}`],
      prefix(/^This is the Súrih of the Pen, which hath/m, "* "),
      prefix(/^In the name of God, the Most Wondrous/m, "* "),
      prefix(/^This is a remembrance of that which was/m, "* "),
      prefix(/^In the name of the One born on this day/m, "* "),
    ],
    "epistle-son-wolf": [
      removeAfter("This document has been downloaded"),
      title("", "Epistle to the Son of the Wolf", {
        author: "Bahá’u’lláh",
        years: [1891, 1891],
      }),
      ["by Bahá’u’lláh", ""],
      ["Translated by Shoghi Effendi", ""],
      prefix(/^In the name of God, the One, the Incomparable/m, "^ "),
      ["this sublime and momentous", "this most sublime and momentous"],
      ["are rays of one Light", "are the rays of one Light"],
    ],
    "gems-divine-mysteries": [
      removeAfter("Notes"),
      ["Javáhiru’l‑Asrár", ""],
      title("", "Gems of Divine Mysteries", {
        author: "Bahá’u’lláh",
        years: [1857, 1863],
        translated: "Javáhiru’l‑Asrár",
        collection: true,
      }),
      [/^by Bahá’u’lláh$/m, ""],
      title("#", "Introduction", {
        author: "The Universal House of Justice",
        years: [2002, 2002],
      }),
      ["\nGems of Divine Mysteries", "\n# Gems of Divine Mysteries"],
      prefix(/^The essence of the divine mysteries/m, "* "),
      prefix(/^He is the Exalted, the Most High!/m, "^ "),
    ],
    "gleanings-writings-bahaullah": [
      removeAfter("This document has been downloaded"),
      ["Translated By Shoghi Effendi", ""],
      [/^— .* —$/gm, "#"],
      title("", "Gleanings from the Writings of Bahá’u’lláh", {
        author: "Bahá’u’lláh",
        years: authorYears["Bahá’u’lláh"],
        collection: true,
      }),
      prefix(
        /^The Divine Springtime is come, O Most Exalted/m,
        "* In the name of Him Who hath cast His splendour over the entire creation!\n\n"
      ),
      prefix(
        /^Release yourselves, O nightingales of God/m,
        "* He is the Exalted, the Transcendent, the All‑Highest.\n\n"
      ),
      prefix(
        /^The first duty prescribed by God for His servants/m,
        "^ In the name of Him Who is the Supreme Ruler over all that hath been and all that is to be\n\n"
      ),
      ["The other station ", ""],
      ["No, by Him Who is the Eternal", "Nay, by Him Who is the Eternal"],
      ["Did they whom you curse", "Did they whom ye curse"],
      ["could have the chance", "could have had the chance"],
      ["wretched the abode of", "wretched is the abode of"],
      ["and were what you are", "and were what ye are"],
      ["anyone. No, by Him Who", "anyone. Nay, by Him Who"],
      ["Consider Moses!", "Moses!"],
      ["meaning, were ye to ponder", "meaning, were you to ponder"],
      ["Behold how the sovereignty", "the sovereignty"],
      ["Say: Yes, by My Lord!", "Say: Yea, by My Lord!"],
      ["Say: Await ye till", "Say: Wait ye till"],
      ["to thee? No, by Him Who", "to thee? Nay, by Him Who"],
      ["Ye, and all ye possess", "By God! Ye, and all ye possess"],
      ["pledged Ourselves to secure", "pledged Ourself to secure"],
      ["learned that you are", "learned that ye are"],
      ["beneath you. Judge ye", "beneath you, and judge ye"],
      ["justly between men, and", "justly between men, O kings, and"],
      ["succoureth whom He will", "succoureth whom He willeth"],
      [
        "recognise this truth. Say:",
        "recognise this truth. Say: This is the Most Great Testimony, by which the validity of every proof throughout the ages hath been established, would that ye might be assured thereof. Say:",
      ],
      ["glory, and shall aid whosoever", "glory, and will aid whosoever"],
      ["Wash your hearts from", "Wash from your hearts"],
      ["discerning and illuminated heart", "discerning and illumined heart"],
      ["their hands.” Although the", "their hands.”\n\nAlthough the"],
      ["inmost selves. . . . That the", "inmost selves. . . .\n\nThat the"],
    ],
    "hidden-words": [
      [/^Bahá’u’lláh/m, ""],
      [/^Translated by Shoghi Effendi.+/m, ""],
      [/\*\*\*/g, ""],
      [/^\d+\.$/gm, ""],
      [/^This document has been downloaded[\s\S]+/m, ""],
      title("", "The Hidden Words", {
        author: "Bahá’u’lláh",
        years: [1857, 1858],
        collection: true,
      }),
      ["Part One\n\nFrom the Arabic", "# Part One: From the Arabic"],
      ["Part Two\n\nFrom the Persian", "# Part Two: From the Persian"],
      prefix(/^He Is the Glory of Glories/m, "^ "),
      prefix(/^This is that which hath descended/m, "* "),
      prefix(/^In the Name of the Lord of Utterance/m, "* "),
      prefix(/^In the eighth of the most holy lines/m, "* "),
      prefix(/^In the first line of the Tablet it is recorded/m, "* "),
      prefix(/^In the third of the most holy lines writ/m, "* "),
      prefix(/^The mystic and wondrous Bride, hidden/m, "* "),
      [/^O .+?!/gm, (s) => `> ${s}\n>`],
      ["Alas! Alas! O Lovers of Worldly Desire!", (s) => `> ${s}\n>`],
    ],
    "kitab-i-aqdas": [
      removeAfter("Key to Passages Translated by Shoghi Effendi"),
      ["The Most Holy Book", ""],
      ["Bahá’u’lláh", ""],
      [/\(\)/g, ""],
      [/\(Q&A.*\)/gi, ""],
      [/\(see.*\)/gi, ""],
      [/\(Tablets.*\)/g, ""],
      [/\(Prayers.*\)/g, ""],
      [/\*\*\*/g, ""],
      title("", "The Most Holy Book", {
        author: "Bahá’u’lláh",
        years: [1873, 1873],
        translated: "The Kitáb‑i‑Aqdas",
        collection: true,
      }),
      title("#", "Preface", {
        author: "The Universal House of Justice",
        years: [1992, 1992],
      }),
      title("#", "Introduction", {
        author: "The Universal House of Justice",
        years: [1992, 1992],
      }),
      title("#", "A Description of the Kitáb‑i‑Aqdas by Shoghi Effendi", {
        author: "Shoghi Effendi",
        years: [1944, 1944],
      }),
      prefix(/^Taken from God Passes By, his/m, "* "),
      ["\nThe Kitáb‑i‑Aqdas", "\n# The Most Holy Book"],
      prefix(/^In the name of Him Who is the Supreme Ruler/m, "^ "),
      title(
        "#",
        "Some Texts Revealed by Bahá’u’lláh Supplementary to the Kitáb‑i‑Aqdas",
        { years: [1873, 1892], collection: true }
      ),
      [/^A number of Tablets revealed by Bahá’u’lláh.*/m, ""],
      [
        "The Tablet of Ishráqát\n\nThe Eighth Ishráq",
        "## The Tablet of Ishráqát: The Eighth Ishráq",
      ],
      title("##", "Long Obligatory Prayer"),
      title("##", "Medium Obligatory Prayer"),
      title("##", "Short Obligatory Prayer"),
      title("##", "Prayer for the Dead"),
      ...obligatory,
      title("#", "Questions and Answers"),
      [
        /^\d+\.$\n\n^Question.*$\n\n/gm,
        (s) => `> ${s.slice(s.indexOf(".") + 3, -2)}\n> `,
      ],
      [/^\d+\.$\n\n/gm, "> "],
      [/^Synopsis and Codification of the[\s\S]*^Notes$/m, "Notes"],
      title("#", "Notes", {
        author: "The Universal House of Justice",
        years: [1992, 1992],
        collection: true,
      }),
      [
        /^\d+\..*/gm,
        (s) => `#
        reference="${s.slice(s.indexOf(".") + 2)}"`,
      ],
    ],
    "kitab-i-iqan": [
      removeAfter("Notes"),
      [/^END.*/gm, ""],
      ["The Kitáb‑i‑Íqán", ""],
      ["By Bahá’u’lláh", ""],
      ["Translated by Shoghi Effendi", ""],
      [/\*\*\*/g, ""],
      [/^—.+/gm, ""],
      title("", "The Book of Certitude", {
        author: "Bahá’u’lláh",
        years: [1862, 1862],
        translated: "The Kitáb‑i‑Íqán",
        collection: true,
      }),
      title("#", "Foreword", {
        author: "Shoghi Effendi",
        years: [1931, 1931],
      }),
      [
        "Part One",
        `# The Book of Certitude

        ## Part One`,
      ],
      ["Part Two", "## Part Two"],
      prefix("IN THE NAME OF OUR LORD", "^ "),
      prefix("No man shall attain the shores of the", "* "),
      prefix("Verily He Who is the Daystar of Truth", "* "),
      ["the Bearers of a new Message", "the Revealers of a new Message"],
      ["to them the same attribute", "to them the same attributes"],
      ["and honoured with the", "and are honoured with the"],
      ["‘Alí. Sayings such as this", "Imám ‘Alí. Sayings such as these"],
      ["Muḥammad our last", "Muḥammad is our last"],
      ["His name and His attributes", "His names and His attributes"],
      ["“Seen” and “Hidden”", "“Seen” and the “Hidden”"],
      ["deeply immersed beneath", "deep immersed beneath"],
      ["claimed their utterance", "claimed their utterances"],
      ["annulled the law of divorce", "annulled the laws of divorce"],
      ["with these circumstances", "with those circumstances"],
      ["of God an infidel", "of God as infidel"],
      ["flame of divine wisdom", "flames of divine wisdom"],
      ["evident that wretched", "evident that that wretched"],
      ["‘Abdu’lláh‑i‑Ubayy", "‘Abdu’lláh Ubayy"],
      ["light of that Sun of divine", "light of the Sun of divine"],
      ["outward behaviour conforms", "outward behaviour conformeth"],
      ["leading to the knowledge", "leading unto the knowledge"],
      ["cleanse and purify his heart", "cleanse his heart"],
      ["earth, detach himself", "earth, must detach himself"],
      ["companionship of those that", "companionship of them that"],
      ["heart should the seeker avoid", "heart he should avoid"],
      [
        "sinner, at the hour of death, attained to",
        "sinner attained, at the hour of death, to",
      ],
      ["the celestial Concourse.", "the Concourse on High!"],
      ["enjoy the blessing conferred", "enjoy the blessings conferred"],
      ["from the slumber of negligence", "from the slumber of heedlessness"],
      ["glorious and supreme station", "glorious and exalted station"],
      ["doings, words and ways", "doings, the words and ways"],
      ["the Tree—which flourisheth", "the Tree that flourisheth"],
      ["his inner and his outer ear", "his inner and outer ear"],
      ["attainment of this City", "attainment unto this City"],
      ["every leaf ineffable", "each one of its leaves ineffable"],
      ["wedded to that City", "wedded unto that City"],
      ["and receive the surest", "and will receive the surest"],
      ["the Book which standeth", "the Book that standeth"],
    ],
    "summons-lord-hosts": [
      ["Tablets of Bahá’u’lláh", ""],
      removeAfter("Endnotes"),
      title("", "The Summons of the Lord of Hosts", {
        author: "Bahá’u’lláh",
        years: [1867, 1869],
        collection: true,
      }),
      ["The Universal House of Justice", ""],
      title("#", "Introduction", {
        author: "The Universal House of Justice",
        years: [2002, 2002],
      }),
      title("#", "Tablet of the Temple", {
        translated: "Súriy‑i‑Haykal",
      }),
      title("##", "Pope Pius IX"),
      title("##", "Napoleon III"),
      title("##", "Czar Alexander II"),
      title("##", "Queen Victoria"),
      title("##", "Náṣiri’d‑Dín Sháh"),
      title("#", "Tablet of the Chief", {
        translated: "Súriy‑i‑Ra’ís",
      }),
      title("#", "Tablet of the Chief", {
        translated: "Lawḥ‑i‑Ra’ís",
      }),
      title("#", "Tablet of Fu’ád Páshá", {
        translated: "Lawḥ‑i‑Fu’ád",
      }),
      title("#", "Tablet of Kings", {
        translated: "Súriy‑i‑Múlúk",
      }),
      prefix("He is the Most Wondrous, the All‑Glorious!", "^ "),
      prefix("In His name, the All‑Glorious!", "^ "),
      prefix("He is in His own Right the Supreme Ruler!", "^ "),
      prefix("He is the Most Holy, the Most Glorious!", "^ "),
      prefix("He is the Almighty!", "^ "),
    ],
    "tabernacle-unity": [
      ["Bahá’u’lláh", ""],
      removeAfter("Notes"),
      [/^\d+$/gm, ""],
      [/^— .* —$/gm, "#"],
      title("", "The Tabernacle of Unity", {
        author: "Bahá’u’lláh",
        years: [1870, 1877],
        collection: true,
      }),
      title("#", "Introduction", {
        author: "The Universal House of Justice",
        years: [2006, 2006],
      }),
      title("#", "Tablet to Mánikchí Ṣáḥib", {
        translated: "Lawḥ‑i‑Mánikchí‑Ṣáḥib",
      }),
      prefix("Responses to questions of Mánikchí Ṣáḥib", "# "),
      title("#", "Tablet of the Seven Questions", {
        translated: "Lawḥ‑i‑Haft Pursish",
      }),
      title("#", "Two Other Tablets", { collection: true }),
      prefix("IN THE NAME OF THE ONE TRUE GOD", "^ "),
      prefix("IN THE NAME OF THE LORD OF UTTERANCE, THE ALL‑WISE", "^ "),
      prefix("THE BEGINNING OF ALL UTTERANCE IS THE PRAISE OF GOD", "^ "),
      prefix("THE BEGINNING OF EVERY ACCOUNT IS THE NAME OF GOD", "^ "),
    ],
    "tablets-bahaullah": [
      removeAfter("Passages Translated by Shoghi Effendi"),
      ["revealed after the Kitáb‑i‑Aqdas", ""],
      [/^Compiled by the Research Department.*/m, ""],
      ["References to the Qur’án", ""],
      [/^In footnotes referring to the Qur’án.*/m, ""],
      [/^\d+$/gm, ""],
      title("", "Tablets of Bahá’u’lláh", {
        author: "Bahá’u’lláh",
        years: [1877, 1891],
        collection: true,
      }),
      title("#", "Tablet of Carmel", { translated: "Lawḥ‑i‑Karmil" }),
      title("#", "The Most Holy Tablet", { translated: "Lawḥ‑i‑Aqdas" }),
      title("#", "Glad‑Tidings", { translated: "Bishárát" }),
      title("#", "Ornaments", { translated: "Ṭarázát" }),
      title("#", "Effulgences", { translated: "Tajallíyát" }),
      title("#", "Words of Paradise", { translated: "Kalimát‑i‑Firdawsíyyih" }),
      title("#", "Tablet of the World", { translated: "Lawḥ‑i‑Dunyá" }),
      title("#", "Splendours", { translated: "Ishráqát" }),
      title("#", "Tablet of Wisdom", { translated: "Lawḥ‑i‑Ḥikmat" }),
      title("#", "Words of Wisdom", { translated: "Aṣl‑i‑Kullu’l‑Khayr" }),
      title("#", "Tablet of Maqṣúd", { translated: "Lawḥ‑i‑Maqṣúd" }),
      title("#", "Tablet to Vafá", { translated: "Súriy‑i‑Vafá" }),
      title("#", "Tablet to Siyyid Mihdíy‑i‑Dahají", {
        translated: "Lawḥ‑i‑Síyyid‑i‑Mihdíy‑i‑Dahají",
      }),
      title("#", "Tablet of the Proof", { translated: "Lawḥ‑i‑Burhán" }),
      title("#", "Book of the Covenant", { translated: "Kitáb‑i‑‘Ahd" }),
      title("#", "Tablet of the Land of Bá", { translated: "Lawḥ‑i‑Arḍ‑i‑Bá" }),
      title("#", "Excerpts from Other Tablets", { collection: true }),
      prefix(/^All praise be to Thee, O my God, inasmuch/m, "\n\n#\n\n"),
      prefix(/^O Ḥusayn! God grant thou shalt ever be bright/m, "\n\n#\n\n"),
      prefix(/^This is a Tablet which the Lord of all being/m, "\n\n#\n\n"),
      prefix(/^O Friend! In the Bayán We directed everyone/m, "\n\n#\n\n"),
      prefix(/^O Javád! Such is the greatness of this/m, "\n\n#\n\n"),
      prefix(/^We make mention of him who hath been/m, "\n\n#\n\n"),
      prefix(/^O Thou who bearest My Name, Júd/m, "\n\n#\n\n"),
      prefix(/^O Ḥaydar! This Wronged One hath heard/m, "\n\n#\n\n"),
      prefix(/^By the righteousness of God! The Mother/m, "\n\n#\n\n"),
      prefix(/^O Muḥammad Ḥusayn! Be thou prepared to/m, "\n\n#\n\n"),
      prefix(/^O My handmaiden and My leaf! Rejoice/m, "\n\n#\n\n"),
      prefix(/^At one time this sublime Word was heard/m, "\n\n#\n\n"),
      prefix(/^This is a Tablet sent down by the All‑Merciful/m, "\n\n#\n\n"),
      prefix(/^O My handmaiden, O My leaf! Render/m, "\n\n#\n\n"),
      prefix(/^O handmaid of God! Hearken unto the/m, "\n\n#\n\n"),
      prefix(/^Fix your gaze upon wisdom in all things/m, "\n\n#\n\n"),
      prefix(/^This Wronged One doth mention him who/m, "\n\n#\n\n"),
      prefix(/^He Who leadeth to true victory is come/m, "\n\n#\n\n"),
      prefix(/^This is a Tablet sent down by the Lord/m, "\n\n#\n\n"),
      prefix(/^We desire to mention him who hath set his/m, "\n\n#\n\n"),
      prefix(/^Give ear unto that which the Spirit/m, "\n\n#\n\n"),
      prefix(/^This Wronged One hath perused thy letter/m, "\n\n#\n\n"),
      prefix(
        /^All praise be to Thee, O my God, inasmuch/m,
        "* He is the Eternal, the One, the Single, the All‑Possessing, the Most Exalted.\n\n"
      ),
    ],
    "additional-tablets-extracts-from-tablets-revealed-bahaullah": [
      removeAfter("This document has been downloaded"),
      title(
        "",
        "Additional Tablets and Extracts from Tablets Revealed by Bahá’u’lláh",
        {
          author: "Bahá’u’lláh",
          years: authorYears["Bahá’u’lláh"],
          collection: true,
        }
      ),
      [/^—Bahá’u’lláh$/gm, "#"],
      [/^Literally “cold”\./m, ""],
      [/^Adrianople\./m, ""],
      [/^Cf\. Qur’án 53:12\./m, ""],
      [/^The Báb\./m, ""],
      [/^Reference to the events surrounding the martyrdom.*/m, ""],
      [/^Reference to Czar Alexander III\. The original.*/m, ""],
      [/^Qur’án 30:50\./m, ""],
      [/^Cf\. Qur’án 43:51\./m, ""],
      [/^Translation of the Tablet of Bahá’u’lláh.*/m, ""],
      [/^Ṭáhirih/m, ""],
      [/^Jesus Christ/m, ""],
      [/^Muḥammad/m, ""],
      [/^the Báb/m, ""],
      [/^Mírzá Hádí Dawlat‑Ábádí/m, ""],
      [/^Mírzá Yaḥyá/m, ""],
      prefix(/^He is the Healer, the Almighty, the All‑Wise/m, "#\n\n"),
      prefix(/^In recent days the Kitáb‑i‑Aqdas hath been/m, "#\n\n"),
      prefix(/^Thou didst beg the Supreme Lord/m, "#\n\n"),
      prefix(/^The one true God, exalted be He, loveth/m, "#\n\n"),
      prefix(/^One of the names of God is the Fashioner/m, "#\n\n"),
      prefix(/^The Sun of Truth is the Word of God,/m, "#\n\n"),
      prefix(/^Moderation is indeed highly desirable/m, "#\n\n"),
      prefix(/^He is the Glory of Glories/m, "#\n\n"),
      prefix(/^The mother‑in‑law of Salmán/m, "#\n\n"),
      prefix(/^The sister of Jináb‑i‑Ḥaydar‑‘Alí/m, "#\n\n"),
      prefix(/^He is the Peerless!/m, "#\n\n"),
      prefix(/^Forsake wickedness and rebellion and hold/m, "#\n\n"),
      prefix(/^Divest not yourselves of the robe of/m, "#\n\n"),
      prefix(/^Say: That justice which causeth the pillars/m, "#\n\n"),
      prefix(/^It ill beseemeth the people of God to/m, "#\n\n"),
      prefix(/^Courtesy is among the hallmarks of the/m, "#\n\n"),
      prefix(/^Detachment is even as a sun, which/m, "#\n\n"),
      prefix(/^Alas, alas! May the souls of the Concourse/m, "#\n\n"),
      prefix(/^It ill beseemeth men to centre all their/m, "#\n\n"),
      prefix(/^Adorn thyself with My virtues, in such wise/m, "#\n\n"),
      prefix(/^The son of Naṣr Jím/m, "#\n\n"),
      prefix(/^Gracious God! The people of God suffered/m, "#\n\n"),
      prefix(/^In the name of God, the All‑Loving!/m, "#\n\n"),
      prefix(/^They that have been faithful unto the/m, "#\n\n"),
      prefix(/^On the morning of the blessed Friday/m, "#\n\n"),
      prefix(/^They tread the perilous paths of imitation/m, "#\n\n"),
    ],
    "prayers-meditations": [
      removeAfter("This document has been downloaded"),
      ["by Bahá’u’lláh", ""],
      ["Translated by Shoghi Effendi from the original Persian and Arabic", ""],
      [/^Short obligatory prayer.*/m, ""],
      [/^Medium obligatory prayer.*/m, ""],
      [/^Long obligatory prayer.*/m, ""],
      ["The Tablet of Visitation.", ""],
      ["Prayer for the Dead.", ""],
      title("", "Prayers and Meditations", {
        author: "Bahá’u’lláh",
        years: authorYears["Bahá’u’lláh"],
        type: "Prayer",
        collection: true,
      }),
      [/^— .* —$/gm, "#"],
      ...obligatory,
      [/We all, verily/g, "\n> We all, verily"],
      ["and to deny them not", "and deny them not"],
      ["what Thou hadst commanded", "what Thou hast commanded"],
      ["Lord of the worlds and the Desire", "Lord of the world and the Desire"],
    ],
    "additional-prayers-revealed-bahaullah": [
      removeAfter("This document has been downloaded"),
      [/^—Bahá’u’lláh$/gm, "#"],
      [/^Revealed for the recipient on the occasion.*/m, ""],
      [/^Revealed for the recipient on the occasion.*/m, ""],
      [/^Qur’án 21:89/m, ""],
      title("", "Additional Prayers Revealed by Bahá’u’lláh", {
        author: "Bahá’u’lláh",
        years: authorYears["Bahá’u’lláh"],
        type: "Prayer",
        collection: true,
      }),
      prefix(/^He is the Almighty, the Self‑Subsisting/m, "#\n\n"),
      prefix(/^O my Lord, my Master, and the Goal of my Desire/m, "#\n\n"),
      prefix(/^O God, my God! I yield Thee thanks for/m, "#\n\n"),
      prefix(/^In the name of God, the Forgiver!/m, "#\n\n"),
    ],
  },
  "abdul-baha": {
    "additional-tablets-extracts-talks": [
      removeAfter("This document has been downloaded"),
      title("", "Additional Tablets, Extracts and Talks", {
        author: "‘Abdu’l‑Bahá",
        years: authorYears["‘Abdu’l‑Bahá"],
        collection: true,
      }),
      [/^Sa‘dí\.$/m, ""],
      [/^Robert Turner\.$/m, ""],
      [/^Kitáb‑i‑Aqdas, paragraph 129\.$/m, ""],
      [/^Arabic proverb\.$/m, ""],
      [/^See Qur’án 52:4\.$/m, ""],
      [/^See Qur’án 24:35\.$/m, ""],
      [/^Qur’án 39:69\.$/m, ""],
      [/^A reference to the Fourteen Points.*/m, ""],
      [/^Cf\. Qur’án 28:30\.$/m, ""],
      [/^Qur’án 59:2\.$/m, ""],
      [/^Qur’án 23:14\.$/m, ""],
      [/^Reference to a verse in the Lawḥ‑i‑Ṭibb.*/m, ""],
      [/^Ḥáfiẓ\.$/m, ""],
      [/^Cf\. Qur’án 2:256\.$/m, ""],
      [/^‘Alí‑Aṣghar Khán, the Amínu’s‑Sulṭán\.$/m, ""],
      [/^Following the assassination of Náṣiri’d‑Dín Sháh.*/m, ""],
      [/^Muẓaffari’d‑Dín Sháh\.$/m, ""],
      [/^The Birthday of Bahá’u’lláh\.$/m, ""],
      [/^Isabella Grinevskaya\.$/m, ""],
      [/^Cf\. Qur’án 2:201\.$/m, ""],
      [/^In the Bahá’í Writings, “sharing”.*/m, ""],
      [/^The wife of Mírzá ‘Alí‑Akbar‑i‑Nakhjavání\.$/m, ""],
      [/^The opening Súrih of the Qur’án; in other.*/m, ""],
      [/^Dr\. Ḍíyá’u’lláh Baghdádí\.$/m, ""],
      [/^Dr\. Ḍíyá’u’lláh Baghdádí’s wife, Zínat Khánum.*/m, ""],
      [/^The wife of Mírzá ‘Alí‑Akbar‑i‑Nakhjavání, and.*/m, ""],
      [/^See Qur’án, súrih 55\.$/m, ""],
      [/^31 July 1921\.$/m, ""],
      [/^See Qur’án 50:1\.$/m, ""],
      [/^A mythical flying creature of Persian legend.*/m, ""],
      [/^Jalálu’d‑Dín Rúmí\.$/m, ""],
      [/^See Qur’án, 25:38 and 50:12\.$/m, ""],
      [/^Áqá Músá Naqíuv\.$/m, ""],
      [/^In allusion to Qur’án 54:55\.$/m, ""],
      [/^Sargis Mubagajian \(“Atrpet”\)\.$/m, ""],
      [/^Sargis Mubagajian\.$/m, ""],
      [/^Presumably Shaykh ‘Alí‑Akbar‑i‑Qúchání\.$/m, ""],
      [/^Probably Isabella Grinevskaya\.$/m, ""],
      [/^The quotation alludes to a famous ode of Ḥáfiẓ\.$/m, ""],
      [/^Olga Sergeyevna Lebedeva\.$/m, ""],
      [/^Karbilá’í Áqá Kishíy‑i‑‘Alíuv\.$/m, ""],
      [/^Ustád Áqá Bálá Karímuv\.$/m, ""],
      [/^Sargis Mubagajian\.$/m, ""],
      [/^Presumably Shaykh ‘Alí‑Akbar‑i‑Qúchání\.$/m, ""],
      [/^Olga Sergeyevna Lebedeva\.$/m, ""],
      [/^Isabella Grinevskaya\.$/m, ""],
      [/^Professor E\. G\. Browne\.$/m, ""],
      [/^The Caucasus, identified with the fabled Mount Qáf.*/m, ""],
      [/^Ganja, Ádhirbáyján’s second largest city\.$/m, ""],
      [/^The intention is perhaps the city of Shusha\.$/m, ""],
      [/^Referring perhaps to one of the Ahmadov brothers.*/m, ""],
      [/^The daughter of Bahá’u’lláh’s third wife Gawhar Khánum\.$/m, ""],
      [/^The daughter of Bahá’u’lláh’s second wife Mahd‑i‑‘Ulyá\.$/m, ""],
      [/^Navváb\.$/m, ""],
      [/^A Traveller’s Narrative Written to Illustrate the.*/m, ""],
      [/^Epistle to the Son of the Wolf\.$/m, ""],
      [/^Presumably, Shaykh ‘Alí‑Akbar‑i‑Qúchání\.$/m, ""],
      [/^Probably Hujaj’ul Beheyyeh \(The Behai Proofs\).*/m, ""],
      [/^Hippolyte Dreyfus‑Barney\.$/m, ""],
      [/^Probably Isabella Grinevskaya\.$/m, ""],
      [/^A Tablet of ‘Abdu’l‑Bahá known as the Lawḥ‑i‑Sharq.*/m, ""],
      [/^Áqá Mírzá Muḥsin Afnán\.$/m, ""],
      [/^A piece of land in Haifa which was bought in the.*/m, ""],
      [/^The one intended may be the martyr Shaykh.*/m, ""],
      [/^Probably Sargis Mubagajian\.$/m, ""],
      [/^Projected for Bákú\. Áqá Músá Naqíuv had.*/m, ""],
      [/^“Mahallu’l‑Barakih” \(literally “The.*/m, ""],
      [/^The term “service council” \(majlis‑i‑khidmat\).*/m, ""],
      [/^Presumably Mírzá ‘Abdu’l‑Kháliq‑i‑Ya‘qúbzádih\.$/m, ""],
      [/^Arabic maxim\.$/m, ""],
      [/^The English equivalent of this name written in Persian.*/m, ""],
      [/^Probably the Eleventh Annual Convention of the Bahá’í.*/m, ""],
      [/^The English equivalent of this name written in Persian.*/m, ""],
      [/^The Book of Deuteronomy, the last chapter of which.*/m, ""],
      [/^Qur’án 17:15$/m, ""],
      [/^Bahá’u’lláh\.$/m, ""],
      [/^The Báb\.$/m, ""],
      [/^A Tablet of ‘Abdu’l‑Bahá chanted by Him, the recording.*/m, ""],
      [/^Marzieh Gail’s translation, published in Memorials.*/m, ""],
      [/^.*of ‘Abdu’l‑Bahá$/gm, (a) => `# ${a}`],
      [
        /^Phoenix of Truth! For thee[\s\S]*Mount Qáf thou’rt returned!$/gm,
        (s) =>
          s
            .split("\n\n")
            .map((a) => `> ${a}`)
            .join("\n"),
      ],
      [
        /^O zephyr, shouldst thou pass[\s\S]*valley and make fragrant thy breath\.$/gm,
        (s) =>
          s
            .split("\n\n")
            .map((a) => `> ${a}`)
            .join("\n"),
      ],
      [
        /^General running expenses of the[\s\S]*provide needed support of the poor\.$/gm,
        (s) =>
          s
            .split("\n\n")
            .map((a) => `> ${a}`)
            .join("\n"),
      ],
      [
        /^Praise be to God! His signs[\s\S]*God is filled with exultation and joy\.$/gm,
        (s) =>
          s
            .split("\n\n")
            .map((a) => `> ${a}`)
            .join("\n"),
      ],
      [
        /^I am lost, O Love, possessed[\s\S]*fool am I, in all the earth\.$/gm,
        (s) =>
          s
            .split("\n\n")
            .map((a) => `> ${a}`)
            .join("\n"),
      ],
    ],
    "light-of-the-world": [
      [
        "Light of the World: Selected Tablets of ‘Abdu’l‑Bahá",
        "Light of the World",
      ],
      removeAfter("Notes"),
      title("", "Light of the World", {
        author: "‘Abdu’l‑Bahá",
        years: authorYears["‘Abdu’l‑Bahá"],
        collection: true,
      }),
      title("#", "Preface", {
        author: "The Universal House of Justice",
        years: [2021, 2021],
      }),
      [/^1$/m, "# Light of the World\ncollection\n\n#"],
      [/^\d+$/gm, "#"],
      prefix("And yet these deniers, even as the bats", "\n\n"),
      splitLines(
        /Shed splendours on the Orient.*/m,
        "And perfumes scatter",
        "Carry light unto",
        "And the Turk with"
      ),
      splitLines(/Granted that this morn be.*/m, "Are seeing eyes also"),
      splitLines(
        /That beam of bliss and ecstasy.*/m,
        "Did stay with him",
        "Even as Aḥmad, the",
        "Who is always with"
      ),
      prefix("At that instant, ‘Abdu’l‑Bahá understood what", "\n\n"),
      splitLines(/Either speak no more of love.*/m, "Thus hath it been"),
      ["His grace? The Glory", "His grace?\n\nThe Glory"],
      splitLines(/Before the Friend how can I.*/m, "Abashed that I did"),
      splitLines(/The duty of long years of love.*/m, "And tell the tale"),
      splitLines(
        /O lifeless one, bereft of heart and soul.*/m,
        "Come to life, come",
        "O slumbering one",
        "Awake, do thou",
        "O drunken one, so",
        "Clear thy mind",
        "The world is filled",
        "From life and self",
        "Now is the time",
        "Lead thou the lovers",
        "The sweetly singing",
        "Commit His secrets",
        true
      ),
      splitLines(/To speak of the subtleties of.*/m, "Is like plucking the"),
      ["early dawn! The Glory", "early dawn!\n\nThe Glory"],
      splitLines(/Await the break of His sovereign.*/m, "These are but"),
    ],
    "memorials-faithful": [
      ["by ‘Abdu’l‑Bahá", ""],
      [/^Translated from the original Persian.*/m, ""],
      removeAfter("Notes"),
      title("", "Memorials of the Faithful", {
        author: "‘Abdu’l‑Bahá",
        years: [1914, 1915],
        collection: true,
      }),
      [/^— .* —$\n\n/gm, "# "],
    ],
    "paris-talks": [
      removeAfter("Notes"),
      ["Addresses Given by ‘Abdu’l‑Bahá in 1911", ""],
      title("", "Paris Talks", {
        author: "‘Abdu’l‑Bahá",
        years: [1911, 1913],
        collection: true,
      }),
      title("#", "Part One", { collection: true }),
      title("#", "Part Two", { collection: true }),
      title("#", "Part Three", { collection: true }),
      [/^— .* —$\n\n/gm, "## "],
    ],
    "promulgation-universal-peace": [
      [/^Talks Delivered by ‘Abdu’l‑Bahá during.*/m, ""],
      ["Compiled by Howard MacNutt", ""],
      [/^Notes$[\s\S]+/m, ""],
      title("", "The Promulgation of Universal Peace", {
        author: "‘Abdu’l‑Bahá",
        years: [1912, 1912],
        collection: true,
      }),
      [/^— .* —$\n\n(.*)\n\n(.*)/gm, (_, a, b) => `## ${b}\n\n${a}`],
      [/^(Talk.*)$\n\n(.*)/gm, (_, a, b) => `# ${a} (${b})\ncollection`],
    ],
    "secret-divine-civilization": [
      ["‘Abdu’l‑Bahá", ""],
      [/^Translated from the Persian by Marzieh Gail.*/m, ""],
      removeAfter("Notes"),
      title("", "The Secret of Divine Civilisation", {
        author: "‘Abdu’l‑Bahá",
        years: [1875, 1875],
      }),
      prefix("“The hand is veiled", "\n> "),
      prefix("The horse leaps forward,", "\n> "),
      prefix("“The flower‑faced may", "\n> "),
      prefix("The cruel fair may bridle", "\n> "),
      prefix("But coyness in the ugly", "\n> "),
      prefix("And pain in a blind eye’s", "\n> "),
      prefix("But these ill‑omened owls", "\n> "),
      prefix("And learned to sing as the", "\n> "),
      prefix("And what of Sheba’s message", "\n> "),
      prefix("If the bittern learn to sing", "\n> "),
      prefix("One sluggish, blind and surly’s", "\n> "),
      prefix("“A lump of flesh, without a", "\n> "),
      prefix("How far is he who apes and", "\n> "),
      prefix("From the illumined, who doth", "\n> "),
      prefix("One but an echo, though", "\n> "),
      prefix("And one, the Psalmist", "\n> "),
      prefix("Desire and self come", "\n> "),
      prefix("And blot out virtue,", "\n> "),
      prefix("And a hundred veils", "\n> "),
      prefix("From the heart, to", "\n> "),
      prefix("It is all one, if it", "\n> "),
      prefix("Or the bare ground", "\n> "),
      prefix("Where the pure soul", "\n> "),
      prefix("Down to die.", "\n> "),
      prefix("The Sage of Ghazna told", "\n> "),
      prefix("To his veiled hearers,", "\n> "),
      prefix("If those who err see", "\n> "),
      prefix("But only words, it’s", "\n> "),
      prefix("Of all the sun’s fire,", "\n> "),
      prefix("Only the warmth can", "\n> "),
      prefix("Once they were as the", "\n> "),
      prefix("That the wind made", "\n> "),
      prefix("Then God shed down", "\n> "),
      prefix("And His sun but one", "\n> "),
      prefix("Souls of dogs and", "\n> "),
      prefix("But the soul of the", "\n> "),
      prefix("Thou, Brother, art thy", "\n> "),
      prefix("The rest is only thew", "\n> "),
      prefix("In the Name of God the Clement, the Merciful", "^ "),
      prefix(/^How long shall we drift on the wings/m, "\n\n***\n\n"),
      prefix(/^His Majesty the Sháh has, at the present/m, "\n\n***\n\n"),
      prefix(/^It is unquestionable that the object in/m, "\n\n***\n\n"),
      prefix(/^As to those who maintain that the inauguration/m, "\n\n***\n\n"),
      prefix(/^It has now been clearly and irrefutably/m, "\n\n***\n\n"),
      prefix(/^The state is, moreover, based upon two/m, "\n\n***\n\n"),
      prefix(/^The second of these spiritual standards/m, "\n\n***\n\n"),
      prefix(/^We shall here relate a story that will/m, "\n\n***\n\n"),
      prefix(/^Observe how one individual, and he/m, "\n\n***\n\n"),
      prefix(/^My heart aches, for I note with intense/m, "\n\n***\n\n"),
      prefix(/^The third element of the utterance/m, "\n\n***\n\n"),
      prefix(/^The apparatus of conflict will, as/m, "\n\n***\n\n"),
      prefix(/^No power on earth can prevail against/m, "\n\n***\n\n"),
      prefix(/^The fourth phrase of the aforementioned/m, "\n\n***\n\n"),
      prefix(/^O people of Persia! How long will your/m, "\n\n***\n\n"),
      prefix(/^Those European intellectuals who are/m, "\n\n***\n\n"),
      prefix(/^Among those matters which require thorough/m, "\n\n***\n\n"),
      prefix(/^As to that element who believe that/m, "\n\n***\n\n"),
    ],
    "selections-writings-abdul-baha": [
      [/^Compiled by the Research Department.*/m, ""],
      [/^Translated by a Committee at the.*/m, ""],
      ["References to the Qur’án", ""],
      [/^In footnotes referring to the Qur’án.*/m, ""],
      removeAfter("Notes on Translations"),
      title("", "Selections from the Writings of ‘Abdu’l‑Bahá", {
        author: "‘Abdu’l‑Bahá",
        years: authorYears["‘Abdu’l‑Bahá"],
        collection: true,
      }),
      title("#", "Preface", {
        author: "The Universal House of Justice",
        years: [1978, 1978],
      }),
      [
        "\nSelections from the Writings of ‘Abdu’l‑Bahá",
        "\n# Selections from the Writings of ‘Abdu’l‑Bahá\ncollection",
      ],
      [/^— .* —$/gm, "#"],
      [
        /The first is investigation[\s\S]*tenth, economic questions,/gm,
        (s) => "\n\n" + s.split("The").join("\n> The") + "\n\n",
      ],
      [/\nO Breakwell, O my dear one!/g, (a) => `> ${a.slice(1)}\n>`],
      prefix("> O Breakwell, O my dear one!", "\n"),
      splitLines(
        /If I, like Abraham, through flames.*/m,
        "Or yet like John",
        "If, Joseph‑like",
        "Or shut me up within",
        "Or make me e’en",
        "I will not go",
        "But ever stand",
        "My soul and body"
      ),
      splitLines(
        /Unless ye must, Bruise not the.*/m,
        "Bruise not the serpent",
        "How much less wound",
        "And if ye can",
        "No ant should ye",
        "Much less a brother"
      ),
      splitLines(
        /In the Orient scatter perfumes.*/m,
        "And shed splendours",
        "Carry light unto",
        "And the Slav with"
      ),
      splitLines(/That soul which hath itself not.*/m, "Can it then hope"),
      prefix("Whoso reciteth this prayer with lowliness", "* "),
    ],
    "some-answered-questions": [
      removeAfter("Notes"),
      ["‘Abdu’l‑Bahá", ""],
      [/^Collected and translated from the.*/m, ""],
      [/^Newly Revised by a Committee at.*/m, ""],
      [/^Laura Clifford Barney$/m, ""],
      title("", "Some Answered Questions", {
        author: "‘Abdu’l‑Bahá",
        years: [1904, 1906],
        collection: true,
      }),
      title("#", "Foreword", {
        author: "The Universal House of Justice",
        years: [2014, 2014],
      }),
      title("#", "Author’s Preface to the First Edition", {
        author: "Laura Clifford Barney",
        years: [1908, 1908],
      }),
      [/^(Part \d)\n\n(.*)/gm, (_, a, b) => `# ${a}: ${b}\ncollection`],
      [/^— .* —$\n\n/gm, "## "],
    ],
    "tablet-august-forel": [
      [/^Original Persian text first published.*/m, ""],
      removeAfter("Notes"),
      ["***", ""],
      ["Haifa, 21 September 1921.", ""],
      title("", "‘Abdu’l‑Bahá’s Tablet to Dr. Forel", {
        author: "‘Abdu’l‑Bahá",
        years: [1921, 1921],
      }),
    ],
    "tablets-divine-plan": [
      ["‘Abdu’l‑Bahá", ""],
      removeAfter("Notes"),
      title("", "Tablets of the Divine Plan", {
        author: "‘Abdu’l‑Bahá",
        years: [1916, 1917],
        collection: true,
      }),
      [/^\d+$\n\n(.*)\n\n\*\*\*\n\n/gm, (_, a) => `# ${a}\n\n * `],
      [/^\*\*\*$/gm, ""],
    ],
    "tablets-hague-abdul-baha": [
      removeAfter("Notes"),
      [/^17 December 1919$/m, ""],
      [/^1 July 1920$/m, ""],
      title("", "‘Abdu’l‑Bahá’s Tablets to The Hague", {
        author: "‘Abdu’l‑Bahá",
        years: [1919, 1920],
        collection: true,
      }),
      title("#", "First Tablet to The Hague"),
      title("#", "Second Tablet to The Hague"),
    ],
    "travelers-narrative": [
      ["Written to Illustrate the Episode of the Báb", ""],
      ["by ‘Abdu’l‑Bahá", ""],
      ["Translated by Edward G. Browne", ""],
      removeAfter("Notes"),
      title("", "A Traveller’s Narrative", {
        author: "‘Abdu’l‑Bahá",
        years: [1886, 1886],
      }),
    ],
    "twelve-table-talks-abdul-baha": [
      removeAfter("Notes"),
      title("", "Twelve Table Talks given by ‘Abdu’l‑Bahá in ‘Akká", {
        author: "‘Abdu’l‑Bahá",
        years: [1904, 1907],
        collection: true,
      }),
      [/^— .* —$\n\n/gm, "# "],
    ],
    "will-testament-abdul-baha": [
      removeAfter("This document has been downloaded"),
      title("", "Will and Testament of ‘Abdu’l‑Bahá", {
        author: "‘Abdu’l‑Bahá",
        years: [1901, 1908],
      }),
      title("#", "Part One"),
      title("#", "Part Two"),
      title("#", "Part Three"),
    ],
    "prayers-abdul-baha": [
      ["March 2021", ""],
      removeAfter("Notes"),
      title("", "Prayers of ‘Abdu’l‑Bahá", {
        author: "‘Abdu’l‑Bahá",
        years: authorYears["‘Abdu’l‑Bahá"],
        type: "Prayer",
        collection: true,
      }),
      [/^\[\d+\]$/gm, "#"],
      prefix("O Lord so rich in bounty", "\n> "),
      prefix("Whose knowledge doth mine", "> "),
      prefix("At morn, the solace of", "\n> "),
      prefix("The knower of my loss", "> "),
      prefix("The heart that for a", "\n> "),
      prefix("Will seek no friend save", "> "),
      prefix("Withered be the heart", "\n> "),
      prefix("And better blind the", "> "),
      prefix("In all mine hours of deepest", "\n> "),
      prefix("My heart hath Thy remembrance", "> "),
      prefix("Do, through Thy favour,", "\n> "),
      prefix("That what hath never", "> "),
      prefix("Consider not our merit", "\n> "),
      prefix("O Lord of bounty, but", "> "),
      prefix("Upon these broken‑winged", "\n> "),
      prefix("Out of Thy tender mercy", "> "),
      [/\n>/gm, ">"],
    ],
    "additional-prayers-revealed-abdul-baha": [
      removeAfter("This document has been downloaded"),
      [/^‘Alí‑Aṣghar\.$/m, ""],
      [/^‘Alí‑Akbar$/m, ""],
      [/^Revealed for the recipient on the occasion.*/m, ""],
      title("", "Additional Prayers Revealed by ‘Abdu’l‑Bahá", {
        author: "‘Abdu’l‑Bahá",
        years: authorYears["‘Abdu’l‑Bahá"],
        type: "Prayer",
        collection: true,
      }),
      [/^—‘Abdu’l‑Bahá$/gm, "#"],
      prefix(/^He is the All‑Glorious./m, "\n\n#\n\n"),
    ],
  },
  "shoghi-effendi": {
    "advent-divine-justice": [
      removeAfter("Shoghi"),
      ["by Shoghi Effendi", ""],
      title("", "The Advent of Divine Justice", {
        author: "Shoghi Effendi",
        years: [1938, 1938],
      }),
      prefix(/^Dearly beloved friends! Great as is my love/m, "\n\n***\n\n"),
      prefix(/^Dearly beloved friends! I have attempted/m, "\n\n***\n\n"),
      prefix(/^Such, dearly beloved friends, is the vista/m, "\n\n***\n\n"),
      prefix(/^One more word in conclusion\. Among some/m, "\n\n***\n\n"),
      ["he may be. The purpose of the", "he may be. . . . The purpose of the"],
      [
        "good of the world and the happiness",
        "good of the world and happiness",
      ],
    ],
    "bahai-administration": [
      ["Shoghi Effendi", ""],
      ["Selected Messages 1922—1932", ""],
      ["Guardian of the Bahá’í Cause", ""],
      ["January 21, 1922—July 17, 1932", ""],
      removeAfter("Part Two: Letters from Shoghi Effendi"),
      title("", "Bahá’í Administration", {
        author: "Shoghi Effendi",
        years: [1922, 1932],
        collection: true,
      }),
      ["Part One\n\n", "Part One: "],
      ["Part Two\n\n", "Part Two: "],
      title(
        "#",
        "Part One: Excerpts from the Will and Testament of ‘Abdu’l‑Bahá",
        {
          author: "‘Abdu’l‑Bahá",
          years: [1901, 1908],
          collection: true,
        }
      ),
      title("#", "Part Two: Letters from Shoghi Effendi", { collection: true }),
      prefix(/^O ye beloved of the Lord! The greatest/m, "\n\n#\n\n"),
      prefix(/^According to the direct and sacred command/m, "\n\n#\n\n"),
      prefix(/^O God, my God! Thou seest this wronged/m, "\n\n#\n\n"),
      prefix(/^O God, my God! Shield Thy trusted servants/m, "\n\n#\n\n"),
      prefix(
        /^O ye beloved of the Lord! It is incumbent upon you/m,
        "\n\n#\n\n"
      ),
      prefix(/^By the Ancient Beauty! This wronged one/m, "\n\n#\n\n"),
      prefix(/^O ye beloved of the Lord! Strive with/m, "\n\n#\n\n"),
      prefix(/^Whosoever and whatsoever meeting/m, "\n\n#\n\n"),
      [/^Letter/gm, "## Letter"],
      ["and fidelity to His Cause", "and fidelity to His Cause."],
      [/^[A-Z].{1,80}[a-z?]$/gm, (a) => `### ${a}`],
      ["### Bahá’í Administration", "Bahá’í Administration"],
    ],
    "citadel-faith": [
      ["Messages to America 1947—1957", ""],
      ["Shoghi Effendi", ""],
      removeAfter("Notes"),
      title("", "Citadel of Faith", {
        author: "Shoghi Effendi",
        years: [1947, 1957],
        collection: true,
      }),
      ["#", "# Citadel of Faith\ncollection\n\n#"],
      title("#", "In Memoriam", { collection: true }),
      prefix("Frank Ashton", "## "),
      [/^\[.*\]$\n\n/gm, (a) => `${a}## `],
      [
        /^((?:January|February|March|April|May|June|July|August|September|October|November|December).*)\n\n(.*)/gm,
        (_, a, b) => `## ${b}\n\n${a}`,
      ],
      [/^[A-Z].{1,80}[a-z?]$/gm, (a) => `### ${a}`],
      ["### Citadel of Faith", "Citadel of Faith"],
    ],
    "god-passes-by": [
      [/^Shoghi Effendi[\s\S]*Foreword$/m, "Foreword"],
      removeAfter("[END]"),
      title("", "God Passes By", {
        author: "Shoghi Effendi",
        years: [1944, 1944],
        collection: true,
      }),
      title("#", "Foreword"),
      title("##", "Retrospect and Prospect"),
      prefix("First Period", "# God Passes By\n\n"),
      [
        /^((?:First|Second|Third|Fourth) Period) (.*)\n\n(.*)/gm,
        (_, a, b, c) => `## ${a}: ${b} (${c})`,
      ],
      [/^‑ .* ‑$\n\n/gm, "### "],
    ],
    "promised-day-come": [
      ["By Shoghi Effendi", ""],
      ["Shoghi", ""],
      ["The Promised Day is Come", ""],
      removeAfter("Haifa, Palestine March 28, 1941"),
      title("", "The Promised Day Is Come", {
        author: "Shoghi Effendi",
        years: [1941, 1941],
      }),
      [/^[A-Z].{1,80}[a-z?]$/gm, (a) => `# ${a}`],
      ["# The Promised Day Is Come", "The Promised Day Is Come"],
    ],
    "decisive-hour": [
      [/^Messages from Shoghi Effendi to.*/m, ""],
      ["Shoghi Effendi", ""],
      removeAfter("Notes"),
      title("", "This Decisive Hour", {
        author: "Shoghi Effendi",
        years: [1932, 1946],
        collection: true,
      }),
      [/^— .* —$\n\n/gm, "# "],
    ],
    "world-order-bahaullah": [
      ["Selected Letters", ""],
      ["by Shoghi Effendi", ""],
      ["— Bahá’u’lláh", ""],
      ["The World Order of Bahá’u’lláh Further Considerations", ""],
      ["The Goal of a New World Order", ""],
      ["The Golden Age of the Cause of Bahá’u’lláh", ""],
      ["America and the Most Great Peace", ""],
      ["The Unfoldment of World Civilisation", ""],
      [/\*\*\*/g, ""],
      removeAfter("Notes"),
      title("", "The World Order of Bahá’u’lláh", {
        author: "Shoghi Effendi",
        years: [1938, 1938],
        collection: true,
      }),
      title("", "#", { author: "Bahá’u’lláh", years: [1873, 1873] }),
      [
        "\nThe World Order of Bahá’u’lláh",
        "\n# The World Order of Bahá’u’lláh",
      ],
      title("#", "The World Order of Bahá’u’lláh: Further Considerations"),
      title("#", "The Goal of a New World Order"),
      title("#", "The Golden Age of the Cause of Bahá’u’lláh"),
      title("#", "America and the Most Great Peace"),
      title("#", "The Dispensation of Bahá’u’lláh", { collection: true }),
      title("##", "Bahá’u’lláh"),
      title("##", "The Báb"),
      title("##", "‘Abdu’l‑Bahá"),
      title("##", "The Administrative Order"),
      title("#", "The Unfoldment of World Civilisation"),
    ],
  },
  "the-universal-house-of-justice": {
    "the-institution-of-the-counsellors": [
      ["THE UNIVERSAL HOUSE OF JUSTICE", ""],
      ["1 January 2001", ""],
      ["A Document Prepared by the Universal House of Justice", ""],
      removeAfter("This document has been downloaded"),
      ["and with their full support", "and with their full support."],
      [
        "THE INSTITUTION OF THE COUNSELLORS",
        "The Institution of the Counsellors",
      ],
      ["INTRODUCTION", "# Introduction"],
      [
        "INTERNATIONAL AND CONTINENTAL COUNSELLORS AND THE AUXILIARY BOARDS",
        "# International and Continental Counsellors and the Auxiliary Boards",
      ],
      [
        "SOME SPECIFIC ASPECTS OF THE FUNCTIONING OF THE INSTITUTION",
        "# Some Specific Aspects of the Functioning of the Institution",
      ],
      title("", "The Institution of the Counsellors", {
        author: "The Universal House of Justice",
        years: [2001, 2001],
      }),
      [/^[A-Z].*[a-z]$/gm, (a) => `## ${a}`],
      ["## The Institution", "The Institution"],
    ],
    messages: [
      [/^This document has been downloaded.*/gm, ""],
      [/^Transmitted by email.*/gm, ""],
      [/^\*$/gm, "***"],
      [
        "",
        `Selected Messages of the Universal House of Justice
        author="The Universal House of Justice"
        collection\n\n`,
      ],
      [
        /^#\n(.*)\n(.*)\n(.*)\n(.*)/gm,
        (_, id, title, addressee, summary) => {
          const fixedTitle =
            {
              "Riḍván 150": "Riḍván 1993",
              "Riḍván 151": "Riḍván 1994",
              "Riḍván 152": "Riḍván 1995",
              "Riḍván 153": "Riḍván 1996",
              "Riḍván 154": "Riḍván 1997",
              "Riḍván 155": "Riḍván 1998",
              "Riḍván 156": "Riḍván 1999",
              "Bahá 154 B.E.": "1 March 1997",
            }[title] || title;
          const config = {
            author: "The Universal House of Justice",
            years: getYearsFromId(id),
            summary,
          };
          return [
            `# ${
              fixedTitle.startsWith("Riḍván")
                ? `${summary} ${getMessageTo(addressee)}`
                : `Letter dated ${fixedTitle} ${getMessageTo(addressee)}`
            }`,
            ...Object.keys(config).map(
              (k) => `${k}=${JSON.stringify(config[k])}`
            ),
          ].join("\n");
        },
      ],
      [
        "ON THE OCCASION OF THE CENTENARY COMMEMORATION OF THE ASCENSION OF ‘ABDU’L‑BAHÁ",
        "On the Occasion of the Centenary Commemoration of the Ascension of ‘Abdu’l‑Bahá",
      ],
      [
        "TO THE FOLLOWERS OF BAHÁ’U’LLÁH IN EVERY LAND",
        "To the Followers of Bahá’u’lláh in Every Land",
      ],
      [/^Dearly loved friends$/gm, "Dearly loved friends,"],
      [/^TO: All National.*$/gm, "To all National Spiritual Assemblies"],
      [/^\[(To.*)\]$/gm, (_, a) => a],
      [
        /^summary.*(\n\n.*){7}$/gm,
        (a) => {
          const parts = a.split("\n\n");
          const index = [...parts]
            .reverse()
            .findIndex((s) =>
              /^((Dear|Beloved|Fellow).*,|(To |A Tribute|MESSAGE:|From:|Warmest).*)$/.test(
                s
              )
            );
          if (index !== -1) {
            return parts
              .map((s, i) =>
                i === 0 || !s.trim() || i >= parts.length - index ? s : `* ${s}`
              )
              .join("\n\n");
          }
          return a;
        },
      ],
      [
        /^[A-Z].{1,80}[a-z]$/gm,
        (a) => {
          if (
            [
              "Department of the Secretariat",
              "From letters written on behalf of the Guardian to individual believers",
              "From the Research Department",
              "Prepared by the Research Department of the Universal House of Justice",
              "The Bahá’í International Community",
              "The Universal House of Justice",
              "To the Universal House of Justice",
              "A large number of Senators and Congressmen of the United States",
              "A meeting held in a committee room of the House of Commons, United Kingdom",
              "Africa",
              "Aghṣán",
              "All three parliamentary parties in Luxembourg",
              "Americas",
              "Amnesty International",
              "Anneliese Bopp",
              "Artemus Lamb",
              "Asia",
              "Athos Costas",
              "Australasia",
              "Auxiliary Boardmembers forPropagation",
              "Auxiliary Boardmembers forProtection",
              "AuxiliaryBoard forPropagation",
              "AuxiliaryBoard forProtection",
              "Bahíyyih Winckler",
              "Betty Reed",
              "Branch",
              "Carmen de Burafato",
              "Carmen de Burafato, Rowland Estall, Artemus Lamb, Paul Lucas, Alfred Osborne",
              "Carrying the healing Message of Bahá’u’lláh to the generality of mankind",
              "Central & East Africa",
              "Central America",
              "Central and East",
              "Central and East Africa",
              "Chellie Sundram",
              "Commission on Social Action of Reform Judaism",
              "Donald Witzel",
              "Dorothy Ferraby",
              "Dual",
              "Erik Blumenthal",
              "Europe",
              "Foreign Minister Hans‑Dietrich Genscher of Germany",
              "Former Chief Justice, India",
              "FormerNumber",
              "German Federal Parliament",
              "Ghuṣn",
              "Ghuṣnán",
              "Governor of the Commonwealth of the Northern Mariana Islands",
              "Greater involvement of the Faith in the life of human society",
              "House of Representatives, Australia",
              "Howard Harwood",
              "Human Rights Commission of the Federation of Protestant Churches in Switzerland",
              "International Association for Religious Freedom",
              "Isobel Sabri",
              "Kolonario Oule",
              "Lloyd Gardner",
              "Lloyd Gardner, Sarah Pereira, Velma Sherrill, Edna True",
              "Manúchihr Salmánpúr",
              "Minister of Foreign Affairs, Australia",
              "Muḥammad Kebdani",
              "Muḥammad Kebdani, Muḥammad Muṣṭafá, ‘Imád Ṣábirán",
              "NewNumber",
              "NewTotal",
              "North America",
              "Northeastern",
              "Northeastern Asia",
              "Northern",
              "Northern Africa",
              "Northwestern",
              "Northwestern Africa",
              "NumberAdded",
              "Offices of the King and Minister for Foreign Affairs of Belgium",
              "Oloro Epyeru",
              "Pacific Conference of Churches",
              "Plural",
              "PresentIncrease",
              "PresentNumber",
              "President Mitterrand of France",
              "President and Minister of Cultural Affairs of Luxembourg",
              "Prime Minister Indira Gandhi of India",
              "Prime Minister’s Office of the United Kingdom",
              "Propagation",
              "Protection",
              "Resolutions Adopted on Behalf of the Bahá’ís in Írán",
              "Richard Benson, Elena Marsella, Rúḥu’lláh Mumtází, Hideya Suzuki",
              "Sankaran‑Nair Vasudevan",
              "Seewoosumbur‑Jeehoba Appa",
              "Seewoosumbur‑Jeehoba Appa, Shidan Fat’he‑Aazam, William Masehla, Bahíyyih Winckler",
              "Senate, Australia",
              "Shírín Boman",
              "Singular",
              "South America",
              "South Central",
              "South Central Asia",
              "Southeastern",
              "Southeastern Asia",
              "Southern",
              "Southern Africa",
              "Statements and Letters from Governments, World Leaders and Others",
              "Suhayl ‘Alá’í, Owen Battrick, Howard Harwood, Violet Hoehnke, Thelma Perks",
              "Swiss Parliamentarians",
              "The Master, Balliol College, Oxford, England",
              "To name just a few",
              "Total",
              "Total Propagation",
              "Total Protection",
              "Trinidad and Tobago Bureau on Human Rights",
              "Vicente Samaniego",
              "Western",
              "Western Africa",
              "Western Asia",
              "Western Hemisphere",
              "Western Samoan Government",
              "Yan Kee Leong",
            ].includes(a) ||
            a.startsWith("Mr") ||
            a.startsWith("Dr")
          ) {
            return a;
          }
          return `## ${a}`;
        },
      ],
      ["## Selected Messages", "Selected Messages"],
    ],
    "turning-point": [
      removeAfter("Notes"),
      [
        /^Turning Point[\s\S]*Global Plans: Fundamental Concepts/,
        "Turning Point\n\nGlobal Plans: Fundamental Concepts",
      ],
      ["Part III", ""],
      title("", "Turning Point", {
        author: "The Universal House of Justice",
        years: [1996, 2006],
        collection: true,
      }),
      title("#", "Global Plans: Fundamental Concepts", { years: [2005, 2005] }),
      title("#", "Additional Documents", { collection: true }),
      [/^— .* —$\n\n/gm, "## "],
      ["## Training Institutes", "## Training Institutes\nyears=[1998,1998]"],
      [
        "## Training Institutes and Systematic Growth",
        "## Training Institutes and Systematic Growth\nyears=[2000,2000]",
      ],
      [
        "## Building Momentum A Coherent Approach to Growth",
        "## Building Momentum: A Coherent Approach to Growth\nyears=[2003,2003]",
      ],
      [
        "## Impact of Growth on Administration Processes",
        "## Impact of Growth on Administration Processes\nyears=[2005,2005]",
      ],
      [/^a document.*\n\n.*/gm, ""],
      [
        /The document is divided into three sections:[\s\S]*1\. Awareness/,
        "\n\n1. Awareness",
      ],
      [
        /It is divided into four sections:[\s\S]*1\. Experience/,
        "\n\n1. Experience",
      ],
      [
        /The document is divided into five sections:[\s\S]*1\. A Vision/,
        "\n\n1. A Vision",
      ],
      ["1.1Administrative structure", "1.1 Administrative structure"],
      [/^[A-Z].{1,80}[A-Z]$/gm, (a) => `##### ${a}`],
      [/^[A-Z].{1,60}[a-z]$/gm, (a) => `### ${a}`],
      [/^\d\. /gm, "### "],
      [/^\d\.\d /gm, "#### "],
      [/^\d\.\d\.\d /gm, "##### "],
      ["TEACHER TRAINING PROGRAMMES", "Teacher training programmes"],
      ["INSTRUMENTS OF TEACHING", "Instruments of teaching"],
      ["SEQUENCE OF COURSES", "Sequence of courses"],
      ["STUDY CIRCLES", "Study circles"],
      ["TUTORS", "Tutors"],
      ["COORDINATION", "Coordination"],
      ["INTEGRATING THE SYSTEM", "Integrating the system"],
      ["A SYSTEMATIC APPROACH", "A systematic approach"],
      ["SEQUENCE OF COURSES", "Sequence of courses"],
      ["DISTANCE EDUCATION", "Distance education"],
      ["STUDY CIRCLES", "Study circles"],
      ["TUTORS AND TUTOR TRAINING", "Tutors and tutor training"],
      ["INSTITUTE CAMPAIGNS", "Institute campaigns"],
      [
        "MULTIPLICATION OF CORE ACTIVITIES",
        "Multiplication of core activities",
      ],
      ["REFLECTION MEETINGS", "Reflection meetings"],
      ["REACHING OUT TO ALL INHABITANTS", "Reaching out to all inhabitants"],
      [
        "PREREQUISITES FOR INTENSIVE GROWTH",
        "Prerequisites for intensive growth",
      ],
      [
        "INTENSIFICATION OF TEACHING EFFORTS",
        "Intensification of teaching efforts",
      ],
      ["THE DYNAMICS OF INTENSIVE GROWTH", "The dynamics of intensive growth"],
      [
        "FOSTERING AN ENCOURAGING ENVIRONMENT",
        "Fostering an encouraging environment",
      ],
      [
        "COORDINATION AT THE CLUSTER LEVEL",
        "Coordination at the cluster level",
      ],
      [
        "THE ONGOING COLLECTION OF STATISTICS",
        "The ongoing collection of statistics",
      ],
      ["### Turning Point", "Turning Point"],
    ],
  },
  "official-statements-commentaries": {
    bahaullah: [
      [/^A statement prepared by the Bahá’í.*/m, ""],
      removeAfter("Notes"),
      title("", "Bahá’u’lláh", {
        author: "The World Centre",
        years: [1992, 1992],
      }),
      [/^[A-Z].{1,80}[a-z?]$/gm, (a) => `# ${a}`],
      [/^“.{0,80}”$/gm, (a) => `# ${a}`],
      ["# Bahá’u’lláh", "Bahá’u’lláh"],
      [
        "every man may testify, in himself, by himself, in the station of the Manifestation of his Lord, that verily there is no God save Him, and that every man may thereby win his way to the summit of realities, until none shall contemplate anything whatsoever but that he shall see God therein.",
        "every man may testify, in himself and by himself, before the Seat of the revelation of his Lord, that there is none other God but Him; and that all may reach that summit of realities where none shall contemplate anything but that he shall perceive God therein.",
      ],
      ["continued:—“Praise be", "continued:—\n\n“Praise be"],
      [
        "good of the world and the happiness",
        "good of the world and happiness",
      ],
    ],
    "century-light": [
      ["The Universal House of Justice", ""],
      ["Naw‑Rúz, 158 B.E.", ""],
      removeAfter("Notes"),
      title("", "Century of Light", {
        author: "The World Centre",
        years: [2001, 2001],
        collection: true,
      }),
      [/\n^Century of Light$/m, "\n# Century of Light"],
      title("#", "Foreword", { author: "The Universal House of Justice" }),
      [/^[A-Z]{1,5}$/gm, "***"],
    ],
    "one-common-faith": [
      ["The Universal House of Justice", ""],
      ["Naw‑Rúz, 2005", ""],
      removeAfter("References"),
      title("", "One Common Faith", {
        author: "The World Centre",
        years: [2005, 2005],
        collection: true,
      }),
      title("#", "Foreword", { author: "The Universal House of Justice" }),
      ["\nOne Common Faith", "\n# One Common Faith"],
    ],
    "prosperity-humankind": [
      [/^A statement prepared by the Bahá’í.*/m, ""],
      removeAfter("This document has been downloaded"),
      title("", "The Prosperity of Humankind", {
        author: "The World Centre",
        years: [1995, 1995],
      }),
      [/^[A-Z]{1,5}$/gm, "***"],
    ],
    "turning-point-all-nations": [
      [/^A statement prepared by the Bahá’í.*/m, ""],
      [/^A Statement of the Bahá’í International.*/m, ""],
      ["Turning Point for All Nations", ""],
      ["Shoghi Effendi, 1936", ""],
      removeAfter("Notes"),
      [
        "Recognising the Historical Context:\n\nA Call to World Leaders",
        "Recognising the Historical Context: A Call to World Leaders",
      ],
      title("", "Turning Point for All Nations", {
        author: "The World Centre",
        years: [1995, 1995],
      }),
      [/^[IV]{1,5}\. (.*)$/gm, (_, a) => `# ${a}`],
      [/^[A-D]{1,5}\. (.*)$/gm, (_, a) => `## ${a}`],
      [/^\d+\. (.*)$/gm, (_, a) => `### ${a}`],
    ],
  },
  prayers: {
    "bahai-prayers": [
      [/^A Selection of Prayers Revealed by.*/m, ""],
      removeAfter("Notes"),
      title("", "Bahá’í Prayers", {
        years: authorYears["‘Abdu’l‑Bahá"],
        type: "Prayer",
        collection: true,
      }),
      ...obligatory,
      [/^\nWe all, verily,/gm, (a) => `> ${a.slice(1)}`],
      ["of the following verses:", "of the following verses:\n"],
      [
        /^[A-ZḤ].{1,80}[a-z]$/gm,
        (a) => {
          if (a === "Bahá’í Prayers") return a;
          if (a.startsWith("Revealed") || a === "For Women") return `#### ${a}`;
          if (
            a.includes(" for ") ||
            [
              "Infants",
              "Midnight",
              "Parents",
              "Husbands",
              "The Nineteen Day Feast",
              "For Women",
              "For Infants",
              "The Long Healing Prayer",
              "Expectant Mothers",
            ].includes(a)
          ) {
            return `### ${a}`;
          }
          if (a.includes(" Prayers") || a.includes(" Tablets")) return `# ${a}`;
          return `## ${a}`;
        },
      ],
      [
        /^#+ .*/gm,
        (a) =>
          [
            "## Short Obligatory Prayer",
            "## Medium Obligatory Prayer",
            "## Long Obligatory Prayer",
            "### Prayer for the Dead",
            "### The Long Healing Prayer",
            "## Tablet of Aḥmad",
            "## Fire Tablet",
            "## Tablet of the Holy Mariner",
          ].includes(a) || a.startsWith("#### Revealed")
            ? a
            : `${a}\ncollection\n\n#`,
      ],
      ["—Bahá’u’lláh\n\n#### For Women", "—Bahá’u’lláh\n\n### For Women"],
      [/^—.*/gm, (a) => `${a}\n\n#`],
      [
        /^#+[^#]*/gm,
        (a) => {
          const [title, ...parts] = a.split("\n\n").slice(0, -1);
          const author = parts.pop();
          if (author?.[0] !== "—") return a;
          const authorFixed =
            author.includes("Shoghi") || author.startsWith("—Synopsis")
              ? "Shoghi Effendi"
              : author.slice(1);
          return [
            `${title}\nauthor=${JSON.stringify(authorFixed)}`,
            ...parts,
            "",
          ].join("\n\n");
        },
      ],
      prefix(/^\(The Prayer for the Dead is the only/m, "* "),
      prefix(/^O seeker of Truth! If thou desirest/m, "* "),
      prefix(/^Come ye together in gladness unalloyed/m, "* "),
      prefix(/^The following commune is to be read/m, "* "),
      prefix(/^The spreaders of the fragrances of God/m, "* "),
      prefix(/^Every soul who travels through the cities/m, "* "),
      prefix(/^Let the spreaders of the fragrances of/m, "* "),
      prefix(/^Whoever sets out on a teaching journey/m, "* "),
      prefix(/^Prayer to be said at the close of the/m, "* "),
      prefix(/^All the friends of God \. \. \. should/m, "* "),
      prefix(/^Whenever ye enter the council‑chamber/m, "* "),
      prefix(/^The following supplication is to be read/m, "* "),
      prefix(/^Let whosoever travels to different/m, "* "),
      prefix(/^\(Naw‑Rúz, March 21, is the first/m, "* "),
      prefix(/^\(The Intercalary Days, February 26/m, "* "),
      prefix(/^“Study the Tablet of the Holy Mariner/m, "* "),
      prefix(/^\(This Tablet is read at the Shrines/m, "* "),
      prefix(/^\(This prayer, revealed by ‘Abdu’l‑Bahá/m, "* "),
      prefix(/^Whoso reciteth this prayer with lowliness/m, "* "),
      ["## Tablet of Aḥmad", "#"],
      prefix('\nauthor="Bahá’u’lláh"\n\nHe is the King', "# Tablet of Aḥmad"),
      ['Mariner\nauthor="‘Abdu’l‑Bahá"', 'Mariner\nauthor="Bahá’u’lláh"'],
      [
        '#\nauthor="Bahá’u’lláh"\n\nHe is the Gracious, the Well‑Beloved!',
        "He is the Gracious, the Well‑Beloved!",
      ],
      ["take warning!”", "take warning!” (‘Abdu’l‑Bahá)"],
      [
        "The period of the Fast is March 2 through March 20.",
        '* The period of the Fast is March 2 through March 20.\n\n#\nauthor="Bahá’u’lláh"',
      ],
      prefix("\n\nIntone, O My servant, the verses of God", '\ntype=""'),
      prefix("\n\n“The daily obligatory prayers are three", '\ntype=""'),
      prefix("\n\n“By ‘morning,’ ‘noon’ and ‘evening,’", '\ntype=""'),
      prefix("\n\n“Bahá’í marriage is union and cordial", '\ntype=""'),
      prefix("\n\nThe pledge of marriage, the verse to be", '\ntype=""'),
      prefix("\n\nThe Kitáb‑i‑Aqdas states: “We have", '\ntype=""'),
      prefix("\n\nḤuqúqu’lláh is indeed a great law", '\ntype=""'),
      prefix("\n\n“These daily obligatory prayers, together", '\ntype=""'),
      prefix("\n\nHe is the King, the All‑Knowing, the", '\ntype=""'),
      prefix("\n\nIn the Name of God, the Most Ancient", '\ntype=""'),
      prefix("\n\n* “Study the Tablet of the Holy", '\ntype=""'),
      ["in the most wondrous tones", "in most wondrous tones"],
      [
        "outpourings from the clouds of the all‑glorious Kingdom",
        "outpourings of the clouds of the Abhá Kingdom",
      ],
      [
        "My Lord! My Lord! I praise Thee and I thank Thee for that whereby Thou hast favoured Thine humble maidservant, Thy slave beseeching and supplicating Thee, because Thou hast verily guided her unto Thine obvious Kingdom and caused her to hear Thine exalted Call in the contingent world and to behold Thy Signs which prove the appearance of Thy victorious reign over all things.",
        "O Lord, my Lord! I praise Thee and thank Thee for the favour Thou hast bestowed upon this feeble handmaiden of Thine, Thy maidservant who is supplicating and praying fervently to Thee, inasmuch as Thou hast guided her unto Thy Straight Path, led her to Thy luminous Kingdom, inclined her ears to Thy most sublime Call in the midmost heart of the world, and unveiled to her eyes Thy signs which testify to the revelation of Thy supreme dominion over all things.",
      ],
      [
        "O my Lord, I dedicate that which is in my womb unto Thee. Then cause it to be a praiseworthy child in Thy Kingdom and a fortunate one by Thy favour and Thy generosity; to develop and to grow up under the charge of Thine education. Verily, Thou art the Gracious! Verily, Thou art the Lord of Great Favour!",
        "O my Lord! I dedicate that which is in my womb to Thee. Grant that this child may be praised in Thy Kingdom, may be blessed by Thy grace and bounty, and may grow and develop within the stronghold of Thine education. Verily, Thou art the Most Generous, the Lord of grace abounding.",
      ],
      [
        "irrevocable decree in the Books",
        "irrevocable decree and in the Books",
      ],
      ["child may become a more mature", "child may become a mature"],
    ],
    "bahai-prayers-tablets-children": [
      [/^A Compilation Prepared by the Research.*/m, ""],
      removeAfter("This document has been downloaded"),
      title("", "Bahá’í Prayers and Tablets for Children", {
        years: authorYears["‘Abdu’l‑Bahá"],
        type: "Prayer",
        collection: true,
      }),
      [/^—.*/gm, (a) => `${a}\n\n#`],
      [
        /^#+[^#]*/gm,
        (a) => {
          const [title, ...parts] = a.split("\n\n").slice(0, -1);
          const author = parts.pop();
          if (author?.[0] !== "—") return a;
          return [
            `${title}\nauthor=${JSON.stringify(
              author.slice(1, author.indexOf("[") - 1)
            )}`,
            ...parts,
            "",
          ].join("\n\n");
        },
      ],
      prefix("\n\nO loved ones of ‘Abdu’l‑Bahá!", '\ntype=""'),
      ["from whatever is obnoxious", "from whatsoever is obnoxious"],
    ],
  },
  "publications-individual-authors": {
    "bahaullah-new-era": [
      ["An Introduction to the Bahá’í Faith", ""],
      ["by John E. Esslemont", ""],
      [
        "The National Spiritual Assembly of the Bahá’ís of the United States",
        "",
      ],
      [/^Bahá’í Publishing Committee$/gm, ""],
      [/^Bahá’í Publishing Trust$/gm, ""],
      [/^Bahá’í Publishing$/gm, ""],
      ["J. E. ESSLEMONT", ""],
      ["Fairford, Cults,", ""],
      ["By Aberdeen", ""],
      removeAfter("A Selected Bibliography"),
      title("", "Bahá’u’lláh and the New Era", {
        author: "John E. Esslemont",
        years: [2006, 2006],
        collection: true,
      }),
      title("#", "Foreword", {
        author:
          "The National Spiritual Assembly of the Bahá’ís of the United States",
        years: [2006, 2006],
      }),
      title("#", "Preface to 1937 Edition", {
        author: "Bahá’í Publishing Committee",
        years: [1937, 1937],
      }),
      title("#", "Preface to 1950 Edition", {
        author: "Bahá’í Publishing Committee",
        years: [1950, 1950],
      }),
      title("#", "Preface to 1970 Edition", {
        author: "Bahá’í Publishing Trust",
        years: [1970, 1970],
      }),
      title("#", "Preface to 2006 Edition", {
        author: "Bahá’í Publishing",
        years: [2006, 2006],
      }),
      title("#", "Introduction"),
      title("#", "Epilogue"),
      [
        "\nBahá’u’lláh and the New Era",
        "\n# Bahá’u’lláh and the New Era\ncollection",
      ],
      [/^— .* —$\n\n/gm, "## "],
      [/^[A-Z].{1,80}[a-z?]$/gm, (a) => `### ${a}`],
      ["### Bahá’u’lláh and the New Era", "Bahá’u’lláh and the New Era"],
      [
        /^The months in the Bahá’í[\s\S]*### Spiritual Assemblies$/m,
        "### Spiritual Assemblies",
      ],
    ],
  },
  compilations: {
    "chaste-holy-life": [
      removeAfter("Notes"),
      [/^A Compilation Prepared by.*/m, ""],
      ["of the Universal House of Justice", ""],
      ["September 1988", ""],
      [/^\(.*/gm, ""],
      title("", "A Chaste and Holy Life", {
        author: "Compilation",
        years: [1988, 1988],
      }),
      title("#", "The Bahá’í Standard"),
      ["\nA Chaste and Holy Life", "\n# A Chaste and Holy Life"],
      title("#", "The Power of Example"),
      [/^[A-Z].{0,80}[a-z]$/gm, (a) => `## ${a}`],
      ["## A Chaste and Holy Life", "A Chaste and Holy Life"],
    ],
    "codification-law-huququllah": [
      removeAfter("Notes"),
      [/^Prepared by the Research Department.*/m, ""],
      title("", "A Codification of the Law of Ḥuqúqu’lláh", {
        author: "Compilation",
        years: [2007, 2007],
      }),
      [/^[IV]+\./gm, "#"],
    ],
    "bahai-funds-contributions": [
      removeAfter("Notes"),
      [/^A Compilation Prepared by.*/m, ""],
      ["January 1970", ""],
      ["Revised January 1989", ""],
      [/^\(.*/gm, ""],
      title("", "Bahá’í Funds and Contributions", {
        author: "Compilation",
        years: [1989, 1989],
      }),
      [/^I+\./gm, "#"],
    ],
    "bahai-meetings": [
      removeAfter("Notes"),
      [/^A Compilation Prepared by.*/m, ""],
      ["of the Universal House of Justice", ""],
      ["November 1975", ""],
      ["Revised January 1989", ""],
      [/^\(.*/gm, ""],
      [/^\[.*/gm, ""],
      title("", "Bahá’í Meetings", {
        author: "Compilation",
        years: [1989, 1989],
      }),
      [/^From/gm, "# From"],
    ],
    consultation: [
      removeAfter("Notes"),
      ["Prepared by the Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["February 1978", ""],
      ["Revised November 1990", ""],
      [/^\(.*/gm, ""],
      ["Consultation: A Compilation", "Consultation"],
      title("", "Consultation", {
        author: "Compilation",
        years: [1990, 1990],
      }),
      [/^From/gm, "# From"],
    ],
    // covenant: [],
    // "crisis-victory": [],
    "excellence-all-things": [
      removeAfter("Notes"),
      ["A Compilation Prepared by the Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["November 1981", ""],
      ["Revised November 1990", ""],
      [/^\(.*/gm, ""],
      [/^\[.*/gm, ""],
      title("", "Excellence in All Things", {
        author: "Compilation",
        years: [1990, 1990],
      }),
      [/^From/gm, "# From"],
      ["# From amongst all mankind", "From amongst all mankind"],
    ],
    "family-life": [
      removeAfter("Notes"),
      [/^A Compilation of Extracts from.*/m, ""],
      [/^Prepared by the Research Department.*/m, ""],
      ["March 2008", ""],
      ["‘Abdu’l‑Bahá", ""],
      [/^\(.*/gm, ""],
      title("", "Family Life", {
        author: "Compilation",
        years: [2008, 2008],
      }),
      [/^I+\./gm, "#"],
      [/^Extract/gm, "## Extract"],
    ],
    "fire-and-light": [
      removeAfter("Notes"),
      [/^Selections from the Writings of.*/m, ""],
      ["Prepared by the Universal House of Justice", ""],
      ["1986", ""],
      [/^[IVX]+$/gm, ""],
      [/^\*\*\*$/gm, ""],
      title("", "Fire and Light", {
        author: "Compilation",
        years: [1986, 1986],
      }),
      [
        "I. FROM THE WRITINGS OF BAHÁ’U’LLÁH",
        "# From the Writings of Bahá’u’lláh",
      ],
      [
        "II. FROM THE WRITINGS OF ‘ABDU’L‑BAHÁ",
        "# From the Writings of ‘Abdu’l‑Bahá",
      ],
      [
        "III. FROM THE LETTERS OF SHOGHI EFFENDI",
        "# From the Letters of Shoghi Effendi",
      ],
    ],
    "give-me-thy-grace-serve-thy-loved-ones": [
      removeAfter("This document has been downloaded"),
      ["Compilation for the 2018 Counsellors’ Conference", ""],
      [/^\(.*/gm, ""],
      ["", "Give Me Thy Grace to Serve Thy Loved Ones\n\n"],
      title("", "Give Me Thy Grace to Serve Thy Loved Ones", {
        author: "Compilation",
        years: [2018, 2018],
      }),
    ],
    "huququllah-right-god": [
      removeAfter("Notes"),
      ["A Compilation of Extracts from the Writings", ""],
      [/^of Bahá’u’lláh and ‘Abdu’l‑Bahá and from.*/m, ""],
      ["April 2007", ""],
      ["Amended August 2009", ""],
      [/^\(.*/gm, ""],
      [/^\[.*/gm, ""],
      title("", "Ḥuqúqu’lláh—The Right of God", {
        author: "Compilation",
        years: [2009, 2009],
      }),
      [/^\d+\./gm, "#"],
      [/^Extract/gm, "## Extract"],
    ],
    // "importance-art": [],
    "importance-obligatory-prayer-fasting": [
      removeAfter("Notes"),
      ["A Compilation Prepared by the Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["May 2000", ""],
      [/^[IVX]+\. /gm, ""],
      title("", "The Importance of Obligatory Prayer and Fasting", {
        author: "Compilation",
        years: [2000, 2000],
      }),
      [/^\d+\./gm, "#"],
    ],
    "importance-prayer-meditation-devotional-attitude": [
      removeAfter("Notes"),
      [/^Prepared by the Research Department of.*/m, ""],
      ["March 1980", ""],
      ["Revised July 1990", ""],
      [/^\(.*/gm, ""],
      [
        "\n\nand the Devotional Attitude: A Compilation",
        " and the Devotional Attitude",
      ],
      title(
        "",
        "The Importance of Prayer, Meditation and the Devotional Attitude",
        {
          author: "Compilation",
          years: [1990, 1990],
        }
      ),
      [/^Extract/gm, "# Extract"],
    ],
    "institution-mashriqul-adhkar": [
      removeAfter("Notes"),
      [/^A Statement Prepared by the Research.*/m, ""],
      [/^\nThe Institution of the Mashriqu’l‑Adhkár.*/gm, "\n"],
      [/^Prepared by the Research Department of.*/m, ""],
      [/^September 2017.*/gm, ""],
      [/^\(.*/gm, ""],
      title("", "The Institution of the Mashriqu’l‑Adhkár", {
        author: "Compilation",
        years: [2017, 2017],
      }),
      [/^A Statement and Compilation Prepared.*/m, "# A Statement"],
      [/^A Compilation of Extracts from the.*/m, "# A Compilation of Extracts"],
      [/^\d+\./gm, "##"],
      [/^From.{0,80}$/gm, (a) => `## ${a}`],
      [/^Selected Prayers for the/m, "## Selected Prayers for the"],
    ],
    "issues-related-study-bahai-faith": [
      removeAfter("Notes"),
      [/^The Universal House of Justice$[\s\S]*the United States, 1999$/gm, ""],
      [/^\d+$\n\n.*/gm, "***"],
      ["", "Issues Related to the Study of the Bahá’í Faith\n\n"],
      title("", "Issues Related to the Study of the Bahá’í Faith", {
        author: "Compilation",
        years: [1999, 1999],
      }),
      title("#", "Introduction"),
    ],
    "local-spiritual-assembly": [
      removeAfter("Notes"),
      ["A Compilation", ""],
      ["Prepared by the Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["August 1970", ""],
      ["Revised September 2017", ""],
      [/^\(.*/gm, ""],
      title("", "The Local Spiritual Assembly", {
        author: "Compilation",
        years: [2017, 2017],
      }),
      [/^[IV]+\./gm, "#"],
    ],
    music: [
      removeAfter("Notes"),
      ["Prepared by the Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["March 1972", ""],
      ["Revised June 1996", ""],
      [/^\(.*/gm, ""],
      ["Compilation of Extracts from the Bahá’í Writings on Music", "Music"],
      title("", "Music", {
        author: "Compilation",
        years: [1996, 1996],
      }),
      [/^From/gm, "# From"],
      [/^Extract/gm, "# Extract"],
    ],
    peace: [
      removeAfter("Notes"),
      ["August 1985", ""],
      ["Compiled by: The Research Department", ""],
      ["of the Universal House of Justice", ""],
      [/^\(.*/gm, ""],
      title("", "Peace", {
        author: "Compilation",
        years: [1985, 1985],
      }),
      [
        "EXTRACTS FROM THE WRITINGS OF BAHÁ’U’LLÁH:",
        "# Extracts from the Writings of Bahá’u’lláh",
      ],
      [
        "EXTRACTS FROM THE UTTERANCES OF BAHÁ’U’LLÁH:",
        "# Extracts from the Utterances of Bahá’u’lláh",
      ],
      [
        "EXTRACTS FROM THE WRITINGS OF ‘ABDU’L‑BAHÁ:",
        "# Extracts from the Writings of ‘Abdu’l‑Bahá",
      ],
      [
        "EXTRACTS FROM THE UTTERANCES OF ‘ABDU’L‑BAHÁ:",
        "# Extracts from the Utterances of ‘Abdu’l‑Bahá",
      ],
      [
        "EXTRACTS FROM THE WRITINGS OF SHOGHI EFFENDI:",
        "# Extracts from the Writings of Shoghi Effendi",
      ],
      [
        "EXTRACTS FROM LETTERS WRITTEN ON BEHALF OF SHOGHI EFFENDI:",
        "# Extracts from Letters written on behalf of Shoghi Effendi",
      ],
      [
        "EXTRACTS FROM LETTERS OF THE UNIVERSAL HOUSE OF JUSTICE:",
        "# Extracts from Letters of the Universal House of Justice",
      ],
      [
        "EXTRACTS FROM LETTERS WRITTEN ON BEHALF OF THE UNIVERSAL HOUSE OF JUSTICE:",
        "# Extracts from Letters written on behalf of the Universal House of Justice",
      ],
    ],
    "power-divine-assistance": [
      removeAfter("Notes"),
      ["Compiled by: The Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["August 1981", ""],
      ["Revised July 1990", ""],
      [/^\(.*/gm, ""],
      title("", "The Power of Divine Assistance", {
        author: "Compilation",
        years: [1990, 1990],
      }),
      [/^From/gm, "# From"],
    ],
    "prayer-devotional-life": [
      removeAfter("Notes"),
      [/^A Compilation of Extracts from the.*/m, ""],
      ["Prepared by the Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["February 2019", ""],
      [/^\(.*/gm, ""],
      title("", "Prayer and Devotional Life", {
        author: "Compilation",
        years: [2019, 2019],
      }),
      prefix("Prayers and Healing", "## "),
      prefix("The Importance of Memorisation", "## "),
      prefix("The Object of Our Devotion", "## "),
      [/^[A-Z].{0,80}[a-z]$/gm, (a) => `# ${a}`],
      ["# Prayer and Devotional Life", "Prayer and Devotional Life"],
    ],
    "sanctity-nature-bahai-elections": [
      removeAfter("This document has been downloaded"),
      ["A Compilation Prepared by the Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["December 1989", ""],
      [/^\(.*/gm, ""],
      title("", "The Sanctity and Nature of Bahá’í Elections", {
        author: "Compilation",
        years: [1989, 1989],
      }),
      [/^\d+\./gm, "#"],
      [/^From/gm, "## From"],
    ],
    scholarship: [
      removeAfter("Notes"),
      [/^Extracts from the Writings of Bahá’u’lláh.*/m, ""],
      [/^Prepared by the Research Department.*/m, ""],
      ["February 1995", ""],
      [/^\(.*/gm, ""],
      title("", "Scholarship", {
        author: "Compilation",
        years: [1995, 1995],
      }),
      [/^\d+\. /gm, "# "],
      [/^\d+\.\d+ /gm, "## "],
      prefix(/^[A-Z].{0,80}[a-z]$/gm, "### "),
      ["### Scholarship", "Scholarship"],
    ],
    "significance-formative-age-our-faith": [
      removeAfter("Notes"),
      [
        /^Extracts from the Writings.*/m,
        "The Significance of the Formative Age of Our Faith",
      ],
      ["Prepared by the Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["April 1971", ""],
      ["Revised August 1990", ""],
      [/^\(.*/gm, ""],
      title("", "The Significance of the Formative Age of Our Faith", {
        author: "Compilation",
        years: [1990, 1990],
      }),
    ],
    "social-action": [
      removeAfter("Notes"),
      [/^A Compilation Prepared by the Research.*/m, ""],
      ["August 2020", ""],
      [/^\(.*/gm, ""],
      title("", "Social Action", {
        author: "Compilation",
        years: [2020, 2020],
      }),
      prefix("Underlying Concepts and Principles", "# "),
      prefix("The Nature of Bahá’í Social and Economic Development", "# "),
      prefix("Methods and Approaches", "# "),
      prefix(
        "Selected Themes Pertaining to Social and Economic Development",
        "# "
      ),
      prefix(/^[A-Z].*[a-z]$/gm, "## "),
      ["## Social Action", "Social Action"],
    ],
    trustworthiness: [
      removeAfter("Notes"),
      ["Compiled by the Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["January 1987", ""],
      ["Revised August 1990", ""],
      ["Trustworthiness: A Cardinal Bahá’í Virtue", "Trustworthiness"],
      [/^\(.*/gm, ""],
      title("", "Trustworthiness", {
        author: "Compilation",
        years: [1990, 1990],
      }),
      [/^Extract/gm, "# Extract"],
    ],
    "universal-house-of-justice-compilation": [
      removeAfter("Index"),
      [/^A Compilation Prepared by the Research.*/m, ""],
      ["February 2021", ""],
      [/^\(.*/gm, ""],
      [/^\d+\.\d+$/gm, ""],
      title("", "The Universal House of Justice", {
        author: "Compilation",
        years: [2021, 2021],
      }),
      prefix(/^[A-Z].{0,80}[a-zá]$/gm, "# "),
      ["# The Universal House of Justice", "The Universal House of Justice"],
    ],
    women: [
      removeAfter("VI.Bibliography"),
      ["Compiled by the Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["January 1986", ""],
      ["Revised July 1990", ""],
      [/^\(.*/gm, ""],
      title("", "Women", {
        author: "Compilation",
        years: [1990, 1990],
      }),
      [/^[IV]+\./gm, "#"],
      [/^Extract/gm, "## Extract"],
    ],
  },
};
