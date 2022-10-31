// "Words of Wisdom": [1857, 1863]
// "The Dawn‑Breakers": [1887, 1888]
// "The Constitution of the Universal House of Justice": [1972, 1972]

const authorYears = {
  "The Báb": [1844, 1853],
  "Bahá’u’lláh": [1853, 1892],
  "‘Abdu’l‑Bahá": [1892, 1921],
  "Shoghi Effendi": [1921, 1957],
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
      ["of glory, and will aid", "of glory, and shall aid"],
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
      title("##", "Long Obligatory Prayer", { type: "Prayer" }),
      title("##", "Medium Obligatory Prayer", { type: "Prayer" }),
      title("##", "Short Obligatory Prayer", { type: "Prayer" }),
      title("##", "Prayer for the Dead", { type: "Prayer" }),
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
      ["of glory, and will aid", "of glory, and shall aid"],
      ["Revelation of God, His name and", "Revelation of God, His names and"],
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
      ["Ibn‑i‑Abhar,\n\nupon", "Ibn‑i‑Abhar, upon"],
      [/^Mullá Muḥammad‑Káẓim, known.*/m, ""],
      [/^The power of Shí‘ih divines to issue.*/m, ""],
      [/^One of the distinguished believers.*/m, ""],
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
      [
        /^Glad tidings! The light of[\s\S]*Truth hath shone forth!$/gm,
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
      title("#", "Part One"),
      title("#", "Part Two"),
      title("#", "Part Three"),
      [/^— .* —$\n\n/gm, "## "],
      [
        "In this Revelation of Bahá’u’lláh, the women go neck and neck with the men. In no movement will they be left behind. Their rights with men are equal in degree. They will enter all the administrative branches of politics. They will attain in all such a degree as will be considered the very highest station of the world of humanity and will take part in all affairs. Rest ye assured. Do ye not look upon the present conditions; in the not far distant future the world of women will become all‑refulgent and all‑glorious, For His Holiness Bahá’u’lláh Hath Willed It so!",
        "In the Dispensation of Bahá’u’lláh, women are advancing side by side with men. There is no area or instance where they will lag behind: they have equal rights with men, and will enter, in the future, into all branches of the administration of society. Such will be their elevation that, in every area of endeavour, they will occupy the highest levels in the human world. Rest thou assured. Look not upon their present state. In future, the world of womankind will shine with lustrous brilliance, for such is the will and purpose of Bahá’u’lláh.",
      ],
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
      [/^(Talk.*)$\n\n(.*)/gm, (_, a, b) => `# ${a} (${b})`],
      [
        `In the beginning of his human life man was embryonic in the world of the matrix. There he received capacity and endowment for the reality of human existence. The forces and powers necessary for this world were bestowed upon him in that limited condition. In this world he needed eyes; he received them potentially in the other. He needed ears; he obtained them there in readiness and preparation for his new existence. The powers requisite in this world were conferred upon him in the world of the matrix so that when he entered this realm of real existence he not only possessed all necessary functions and powers but found provision for his material sustenance awaiting him.

Therefore, in this world he must prepare himself for the life beyond. That which he needs in the world of the Kingdom must be obtained here. Just as he prepared himself in the world of the matrix by acquiring forces necessary in this sphere of existence, so, likewise, the indispensable forces of the divine existence must be potentially attained in this world.`,
        `In the beginning of his life man was in the world of the womb, wherein he developed the capacity and worthiness to advance to this world. The powers necessary for this world he acquired in that world. He needed eyes in this world; he obtained them in the world of the womb. He needed ears in this world; he obtained them there. All the powers that were needed in this world he acquired in the world of the womb. In that world he became prepared for this world, and when he entered this world he saw that he possessed all the requisite powers and had acquired all the limbs and organs necessary for this life, in that world.

It followeth that in this world too he must prepare for the world beyond. That which he needeth in the world of the Kingdom he must obtain and prepare here. Just as he acquired the powers necessary for this world in the world of the womb, so, likewise, he must obtain that which he will need in the world of the Kingdom—that is to say, all the heavenly powers—in this world.`,
      ],
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
      [
        "Evil One. . . . Should",
        "Evil One. Discussions must all be confined to spiritual matters that pertain to the training of souls, the instruction of children, the relief of the poor, the help of the feeble throughout all classes in the world, kindness to all peoples, the diffusion of the fragrances of God and the exaltation of His Holy Word. Should",
      ],
      [
        `O ye lovers of truth, ye servants of humankind! Out of the flowering of your thoughts and hopes, fragrant emanations have come my way, wherefore an inner sense of obligation compelleth me to pen these words.

Ye observe how the world is divided against itself, how many a land is red with blood and its very dust is caked with human gore. The fires of conflict have blazed so high that never in early times, not in the Middle Ages, not in recent centuries hath there ever been such a hideous war, a war that is even as millstones, taking for grain the skulls of men. Nay, even worse, for flourishing countries have been reduced to rubble, cities have been levelled with the ground, and many a once prosperous village hath been turned into ruin. Fathers have lost their sons, and sons their fathers. Mothers have wept away their hearts over dead children. Children have been orphaned, women left to wander, vagrants without a home. From every aspect, humankind hath sunken low. Loud are the piercing cries of fatherless children; loud the mothers’ anguished voices, reaching to the skies.

And the breeding ground of all these tragedies is prejudice: prejudice of race and nation, of religion, of political opinion; and the root cause of prejudice is blind imitation of the past—imitation in religion, in racial attitudes, in national bias, in politics. So long as this aping of the past persisteth, just so long will the foundations of the social order be blown to the four winds, just so long will humanity be continually exposed to direst peril.

Now, in such an illumined age as ours, when realities previously unknown to man have been laid bare, and the secrets of created things have been disclosed, and the Morn of Truth hath broken and lit up the world—is it admissible that men should be waging a frightful war that is bringing humanity down to ruin? No, by the Lord God!

Christ Jesus summoned all mankind to amity and peace. Unto Peter He said: “Put up thy sword into the sheath.” Such was the bidding and counsel of the Lord Christ; and yet today the Christians one and all have drawn their swords from out the scabbard. How wide is the discrepancy between such acts and the clear Gospel text!

Sixty years ago Bahá’u’lláh rose up, even as the Daystar, over Persia. He declared that the skies of the world were dark, that this darkness boded evil, and that terrible wars would come. From the prison at ‘Akká, He addressed the German Emperor in the clearest of terms, telling him that a great war was on the way and that his city of Berlin would break forth in lamentation and wailing. Likewise did He write to the Turkish sovereign, although He was that Sulṭán’s victim and a captive in his prison—that is, He was being held prisoner in the Fortress at ‘Akká—and clearly stated that Constantinople would be overtaken by a sudden and radical change, so great that the women and children of that city would mourn and cry aloud. In brief, He addressed such words to all the monarchs and the presidents, and everything came to pass, exactly as He had foretold.

There have issued, from His mighty Pen, various teachings for the prevention of war, and these have been scattered far and wide.

The first is the independent investigation of truth; for blind imitation of the past will stunt the mind. But once every soul inquireth into truth, society will be freed from the darkness of continually repeating the past.

His second principle is the oneness of mankind: that all men are the sheep of God, and God is their loving Shepherd, caring most tenderly for all without favouring one or another. “No difference canst thou see in the creation of the God of mercy;” all are His servants, all implore His grace.

His third teaching is that religion is a mighty stronghold, but that it must engender love, not malevolence and hate. Should it lead to malice, spite, and hate, it is of no value at all. For religion is a remedy, and if the remedy bring on disease, then put it aside. Again, as to religious, racial, national and political bias: all these prejudices strike at the very root of human life; one and all they beget bloodshed, and the ruination of the world. So long as these prejudices survive, there will be continuous and fearsome wars.

To remedy this condition there must be universal peace. To bring this about, a Supreme Tribunal must be established, representative of all governments and peoples; questions both national and international must be referred thereto, and all must carry out the decrees of this Tribunal. Should any government or people disobey, let the whole world arise against that government or people.

Yet another of the teachings of Bahá’u’lláh is the equality of men and women and their equal sharing in all rights. And there are many similar principles. It hath now become evident that these teachings are the very life and soul of the world.

Ye who are servants of the human race, strive ye with all your heart to deliver mankind out of this darkness and these prejudices that belong to the human condition and the world of nature, so that humanity may find its way into the light of the world of God.

Praise be to Him, ye are acquainted with the various laws, institutions and principles of the world; today nothing short of these divine teachings can assure peace and tranquillity to mankind. But for these teachings, this darkness shall never vanish, these chronic diseases shall never be healed; nay, they shall grow fiercer from day to day. The Balkans will remain discontented. Its restlessness will increase. The vanquished Powers will continue to agitate. They will resort to every measure that may rekindle the flame of war. Movements, newly born and worldwide in their range, will exert their utmost effort for the advancement of their designs. The Movement of the Left will acquire great importance. Its influence will spread.

Strive ye, therefore, with the help of God, with illumined minds and hearts and a strength born of heaven, to become a bestowal from God to man, and to call into being for all humankind, comfort and peace.`,
        `O ye lovers of truth! O ye servants of mankind! As the sweet fragrance of your thoughts and high intentions has breathed upon me, I feel that my soul is irresistibly prompted to communicate with you.

Ponder in your hearts how grievous is the turmoil in which the world is plunged; how the nations of the earth are besmeared with human blood, nay their very soil is turned into clotted gore. The flame of war has caused so wild a conflagration that the world in its early days, in its middle ages, or in modern times has never witnessed its like. The millstones of war have ground and crushed many a human head, nay, even more severe has been the lot of these victims. Flourishing countries have been made desolate, cities have been laid level with the ground, and smiling villages have been turned into ruin. Fathers have lost their sons, and sons turned fatherless. Mothers have shed tears of blood in mourning for their youths, little children have been made orphans, and women left wanderers and homeless. In a word, humanity, in all its phases, has been debased. Loud is the cry and wailing of orphans, and bitter the lamentations of mothers which are echoed by the skies.

The prime cause for all these happenings is racial, national, religious, and political prejudice, and the root of all this prejudice lies in outworn and deepseated traditions, be they religious, racial, national, or political. So long as these traditions remain, the foundation of human edifice is insecure, and mankind itself is exposed to continuous peril.

Now in this radiant age, when the essence of all beings has been made manifest, and the hidden secret of all created things has been revealed, when the morning light of truth has broken and turned the darkness of the world into light, is it meet and seemly that such a frightful carnage which brings irretrievable ruin upon the world should be made possible? By God! that cannot be.

Christ summoned all the people of the world to reconciliation and peace. He commanded Peter to return his sword unto its scabbard. Such was His wish and counsel, and yet they that bear His name have unsheathed the sword! How great the difference between their deeds and the explicit text of the Gospel!

Sixty years ago Bahá’u’lláh, even as the shining sun, shone in the firmament of Persia, and proclaimed that the world is wrapt in darkness and this darkness is fraught with disastrous results, and will lead to fearful strife. In His prison city of ‘Akká, He apostrophised in unmistakable terms the Emperor of Germany, declaring that a terrible war shall take place, and Berlin will break forth in lamentation and wailing. In like manner, whilst the wronged prisoner of the Sulṭán of Turkey in the citadel of ‘Akká, He clearly and emphatically wrote him that Constantinople will fall a prey to grave disorder, in such wise that the women and children will raise their moaning cry. In brief, He addressed epistles to all the chief rulers and sovereigns of the world, and all that He foretold has been fulfilled. From His pen of glory flowed teachings for the prevention of war, and these have been scattered far and wide.

His first teaching is the search after truth. Blind imitation, He declared, killeth the spirit of man, whereas the investigation of truth frees the world from the darkness of prejudice.

His second teaching is the oneness of mankind. All men are but one fold, and God the loving Shepherd. He bestoweth upon them His most great mercy, and considers them all as one. “Thou shalt find no difference amongst the creatures of God.” They are all His servants, and all seek His bounty.

His third teaching is that religion is the most mighty stronghold. It should be conducive to unity, rather than be the cause of enmity and hate. Should it lead to enmity and hate better not have it at all. For religion is even as medicine, which if it should aggravate the disease, its abandonment would be preferred.

Likewise, religious, racial, national, and political prejudice, all are subversive of the foundation of human society, all lead to bloodshed, all heap ruin upon mankind. So long as these remain, the dread of war will continue. The sole remedy is universal peace. And this is achieved only by the establishment of a supreme Tribunal, representative of all governments and peoples. All national and international problems should be referred to this tribunal, and whatsoever be its decision that should be enforced. Were a government or people to dissent, the world as a whole should rise against it.

And among His teachings is the equality in right of men and women, and so on with many other similar teachings that have been revealed by His pen.

At present it has been made evident and manifest that these principles are the very life of the world, and the embodiment of its true spirit. And now, ye, who are the servants of mankind, should exert yourselves, heart and soul, to free the world from the darkness of materialism and human prejudice, that it may be illumined with the light of the City of God.

Praise be to Him, ye are acquainted with the various schools, institutions and principles of the world; today nothing short of these divine teachings can assure peace and tranquillity to mankind. But for these teachings, this darkness shall never vanish, these chronic diseases shall never be healed; nay, they shall grow fiercer from day to day. The Balkans will remain restless, and its condition will aggravate. The vanquished will not keep still, but will seize every means to kindle anew the flame of war. Modern universal movements will do their utmost to carry out their purpose and intentions. The Movement of the Left will acquire great importance, and its influence will spread.

Wherefore, endeavour that with an illumined heart, a heavenly spirit, and a divine strength, and aided by His grace, ye may bestow God’s bountiful gift upon the world . . . the gift of comfort and tranquillity for all mankind.`,
      ],
      ["thought were wellnigh impossible", "thought were well nigh impossible"],
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
      [/^(Part \d)\n\n(.*)/gm, (_, a, b) => `# ${a}: ${b}`],
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
      ["of the slanderer affect not", "of the slanderer affects not"],
      ["flight into the Celestial", "flight unto the Celestial"],
      ["guidance of the Exalted", "guidance of His Holiness, the Exalted"],
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
      prefix("He is God.\n\nO ye children of", "\n\n#\n\n"),
      prefix(/^He is the All‑Glorious./m, "\n\n#\n\n"),
      ["O Lord!\n\nPlant this tender", "O Lord! Plant this tender"],
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
      ["the influence from such an", "the influence flowing from such an"],
      ["erring.” “The day is", "erring.” “The day, however, is"],
      ["The world, its vanities and", "The world and its vanities and"],
      ["could comprehend it. Wash", "could comprehend it. Cleanse"],
      ["Such an one indeed is", "Such a one, indeed, is"],
      ["bloweth upon all regions", "bloweth upon all the regions"],
      ["colours are acceptable unto Him", "colours are acceptable to Him"],
      [
        "preference for any soul, in the realm",
        "preferment for any soul in the dominion",
      ],
      ["variety in forms and colouring", "variety in forms and colourings"],
      ["creative Wisdom and hath a", "creative wisdom and has a"],
      ["of a different race and colour", "of different race and colour"],
      ["the coloured and white will", "the coloured and whites will"],
      ["You must attach great importance", "Attach great importance"],
      ["Indians, the original inhabitants of", "indigenous population of"],
      [
        "Revelation of Muḥammad, were like savages",
        "Mission of Muḥammad, were like unto savages",
      ],
      [
        "When the Muḥammadan Light shone forth in their midst, they became so enkindled that they shed illumination upon the world. Likewise, should these Indians be educated and properly guided, there can be no doubt that through the Divine teachings they will become so enlightened that the whole earth will be illumined.",
        "When the light of Muḥammad shone forth in their midst, however, they became so radiant as to illumine the world. Likewise, these Indians, should they be educated and guided, there can be no doubt that they will become so illumined as to enlighten the whole world.",
      ],
      [
        "“The ills,” ‘Abdu’l‑Bahá, writing as far back as two decades ago, has prophesied, “from which the world now suffers will multiply; the gloom which envelops it will deepen. The Balkans will remain discontented. Its restlessness will increase. The vanquished Powers will continue to agitate. They will resort to every measure that may rekindle the flame of war. Movements, newly born and worldwide in their range, will exert their utmost for the advancement of their designs. The Movement of the Left will acquire great importance. Its influence will spread.”",
        "“This darkness,” ‘Abdu’l‑Bahá, writing as far back as two decades ago, has prophesied, “shall never vanish, these chronic diseases shall never be healed; nay, they shall grow fiercer from day to day. The Balkans will remain restless, and its condition will aggravate. The vanquished will not keep still, but will seize every means to kindle anew the flame of war. Modern universal movements will do their utmost to carry out their purpose and intentions. The Movement of the Left will acquire great importance, and its influence will spread.”",
      ],
      [
        "He will, erelong, out of the Bosom of Power, draw forth the",
        "Erelong shall God draw forth, out of the bosom of power, the",
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
      ["House of Justice (i.e.,", "Houses of Justice (i.e.,"],
      [
        /^## Letter.+$/gm,
        (a) => {
          if (a === "## Letter of Circa May, 1922 (undated).") {
            return `${a}\nyears=[1922.0501,1922.0501]`;
          }
          const [mm, dd, yy] = a
            .replace(/\.$/, "")
            .slice(13)
            .replace(/(\d)(st|nd|rd|th)/g, (_, a) => a)
            .split(/,? /g);
          const date = `${yy}.${`${months.indexOf(mm) + 1}`.padStart(
            2,
            "0"
          )}${dd.padStart(2, "0")}`;
          return `${a.replace(/\.$/, "")}\nyears=[${date},${date}]`;
        },
      ],
      ["be offered for His loved ones", "be offered up for His loved ones"],
      ["stronghold of Thy Cause", "stronghold of Thy care"],
      ["days and night in promoting", "days and nights in promoting"],
      ["gold, would he seize", "gold, will he seize"],
      ["you attract them to yourself", "you attract them to yourselves"],
      ["just and show your fidelity", "just and to show your fidelity"],
      ["his particular convictions", "his particular conviction"],
      ["second condition:—They must", "second condition . . . They must"],
      ["number it does not matter", "number it doth not matter"],
      ["favour of those who he is", "favour of those whom he is"],
      ["doth not matter. It behoveth", "doth not matter. . . . It behoveth"],
      ["supreme victory:—‘O God", "supreme victory: . . . ‘O God"],
      ["ourselves from all beside Thee", "ourselves from all besides Thee"],
      ["the Standards of Thy exalted", "the Standards of Thine exalted"],
      ["flowing from Thy all‑glorious", "flowing from Thine all‑glorious"],
      ["assisted by grace from on", "assisted by His grace from on"],
      ["integrity of our characters, can", "integrity of our character, can"],
      ["and execution of spiritual", "and extension of spiritual"],
      ["early state of our work", "early stage of our work"],
      ["spurred by those reflections", "spurred by these reflections"],
      ["considerations of numbers, or", "considerations of number, or"],
      ["the limitations of our", "the limitation of our"],
      ["friends and kindreds. No", "friends and kindred. No"],
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
        new RegExp(`^((?:${months.join("|")}) \\d.*)\\n\\n(.*)`, "gm"),
        (_, a, b) => {
          const [mm, dd, yy] = a.split(/,? /g);
          const date = `${yy}.${`${months.indexOf(mm) + 1}`.padStart(
            2,
            "0"
          )}${dd.padStart(2, "0")}`;
          return `## ${b}\nyears=[${date},${date}]\n\n${a}`;
        },
      ],
      [/^[A-Z].{1,80}[a-z?]$/gm, (a) => `### ${a}`],
      ["### Citadel of Faith", "Citadel of Faith"],
      [/##\s*$/, ""],
      [
        "“The ills from which the world now suffers,” He wrote, “will multiply; the gloom which envelops it will deepen. The Balkans will remain discontented. Its restlessness will increase. The vanquished powers will continue to agitate. They will resort to every measure that may rekindle the flame of war. Movements, newly born and world‑wide in their range, will exert their utmost effort for the advancement of their designs. The Movement of the Left will acquire great importance. Its influence will spread.”",
        "“This darkness,” He wrote, “shall never vanish, these chronic diseases shall never be healed; nay, they shall grow fiercer from day to day. The Balkans will remain restless, and its condition will aggravate. The vanquished will not keep still, but will seize every means to kindle anew the flame of war. Modern universal movements will do their utmost to carry out their purpose and intentions. The Movement of the Left will acquire great importance, and its influence will spread.”",
      ],
      ["resist His Faith? No, by Him", "resist His Faith? Nay, by Him"],
      ["racialism, ecclesiasticism", "racialism and ecclesiasticism"],
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
      ["doth not matter. It behoveth", "doth not matter. . . . It behoveth"],
      ["so brief an interval", "so brief a span"],
      ["honoured servants. Pointing", "honoured servants. . . . Pointing"],
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
      [
        "“Movements,” is the warning sounded by ‘Abdu’l‑Bahá, “newly born and worldwide in their range, will exert their utmost effort for the advancement of their designs. The Movement of the Left will acquire great importance. Its influence will spread.”",
        "“Modern universal movements,” is the warning sounded by ‘Abdu’l‑Bahá, “will do their utmost to carry out their purpose and intentions. The Movement of the Left will acquire great importance, and its influence will spread.”",
      ],
      ["century of light—has been", "century of light—hath been"],
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
      [
        /^(#.+)(\n\n[^#].+)*?\n\n([\[\d].+)/gm,
        (_, a, b, c) => {
          const [dd, mm, yy] = c.replace(/\[|\]|circa /g, "").split(/ /g);
          const date = `${yy}.${`${months.indexOf(mm) + 1}`.padStart(
            2,
            "0"
          )}${dd.padStart(2, "0")}`;
          return `${a}\nyears=[${date},${date}]${b || ""}\n\n${c}`;
        },
      ],
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
      title("#", "The Dispensation of Bahá’u’lláh"),
      title("##", "Bahá’u’lláh"),
      title("##", "The Báb"),
      title("##", "‘Abdu’l‑Bahá"),
      title("##", "The Administrative Order"),
      title("#", "The Unfoldment of World Civilisation"),
      [/^[A-Z].{1,80}[a-z]$/gm, (a) => `## ${a}`],
      ["## The World Order of Bahá’u’lláh", "The World Order of Bahá’u’lláh"],
      [
        "“The ills from which the world now suffers,” wrote ‘Abdu’l‑Bahá in January, 1920, “will multiply; the gloom which envelops it will deepen. The Balkans will remain discontented. Its restlessness will increase. The vanquished Powers will continue to agitate. They will resort to every measure that may rekindle the flame of war. Movements, newly‑born and world‑wide in their range, will exert their utmost effort for the advancement of their designs. The Movement of the Left will acquire great importance. Its influence will spread.”",
        "“This darkness,” wrote ‘Abdu’l‑Bahá in January, 1920, “shall never vanish, these chronic diseases shall never be healed; nay, they shall grow fiercer from day to day. The Balkans will remain restless, and its condition will aggravate. The vanquished will not keep still, but will seize every means to kindle anew the flame of war. Modern universal movements will do their utmost to carry out their purpose and intentions. The Movement of the Left will acquire great importance, and its influence will spread.”",
      ],
      [
        "though created whole and perfect, has been afflicted, through divers causes, with grave ills and maladies. Not for one day did it rest, nay its sicknesses waxed more severe, as it fell under the treatment of unskilled physicians who have spurred on the steed of their worldly desires and have erred grievously.",
        "though at its creation whole and perfect, hath been afflicted, through various causes, with grave disorders and maladies. Not for one day did it gain ease, nay its sickness waxed more severe, as it fell under the treatment of ignorant physicians, who gave full rein to their personal desires and have erred grievously.",
      ],
      [
        "Consider these days in which the Ancient Beauty, He Who is the Most Great Name, hath been sent down to regenerate and unify mankind. Behold how with drawn swords they rose against Him, and committed that which caused the Faithful Spirit to tremble. And whenever We said unto them: ‘Lo, the World Reformer is come,’ they made reply: ‘He, in truth, is one of the stirrers of mischief.’",
        "Consider these days in which He Who is the Ancient Beauty hath come in the Most Great Name, that He may quicken the world and unite its peoples. They, however, rose up against Him with sharpened swords, and committed that which caused the Faithful Spirit to lament, until in the end they imprisoned Him in the most desolate of cities, and broke the grasp of the faithful upon the hem of His robe. Were anyone to tell them: ‘The World Reformer is come’, they would answer and say: ‘Indeed it is proven that He is a fomenter of discord!’",
      ],
      ["century of light—has been", "century of light—hath been"],
      ["guidance of the Exalted", "guidance of His Holiness, the Exalted"],
      [
        "He will, ere long, out of the Bosom of Power draw forth the",
        "Erelong shall God draw forth, out of the bosom of power, the",
      ],
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
              "Naw‑Rúz 177": "Naw‑Rúz 2020",
              "Bahá 154 B.E.": "1 March 1997",
            }[title] || title;
          const config = {
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
      prefix(/^\([iv]/gm, "### "),
      [/summary="Riḍván.*/gm, ""],
      [
        /^SOCIAL ACTION\n\n.*\n\n.*/m,
        '# Social Action\nauthor="The Office of Social and Economic Development"\nyears=[2012.1126,2012.1126]',
      ],
      [/^A CODIFICATION OF THE[\s\S]*?(# Letter dated 24)/m, (_, a) => a],
      [/^## A Codification of[\s\S]*?(## The Development of)/m, (_, a) => a],
      [
        /^\([A-Z].*/gm,
        (a) => {
          if (
            ["Súrih", "Qur’án"].some((s) => a.includes(s)) ||
            [
              "(New appointments are indicated with an asterisk.)",
              "(Summarised from a report received concerning the functioning of such schools in a particular country)",
            ].includes(a)
          ) {
            return a;
          }
          return "";
        },
      ],
      [
        /^\([a-z].*/gm,
        (a) => {
          if (["(p. 14)", "(from a newly translated Tablet)"].includes(a)) {
            return "";
          }
          return a;
        },
      ],
      [/^\[Principles of Bahá’í.*/m, ""],
      [/those whom they should serve/g, "those whom they serve"],
      ["of glory, and will aid", "of glory, and shall aid"],
      [
        "though created whole and perfect, has been afflicted, through divers causes, with grave ills and maladies",
        "though at its creation whole and perfect, hath been afflicted, through various causes, with grave disorders and maladies",
      ],
      [
        "unskilled physicians who have spurred on the steed of their worldly",
        "ignorant physicians, who gave full rein to their personal",
      ],
      ["has written: “Wherefore", "has written: . . . “Wherefore"],
      ["such belief.” See how firm", "such belief.” . . . See how firm"],
      ["lead in practicing this", "lead in practising this"],
      [
        `So long as these prejudices survive, there will be continuous and fearsome wars.

To remedy this condition there must be universal peace. To bring this about, a Supreme Tribunal must be established, representative of all governments and peoples; questions both national and international must be referred thereto, and all must carry out the decrees of this Tribunal. Should any government or people disobey, let the whole world arise against that government or people.`,
        `So long as these [prejudices] remain, the dread of war will continue.

The sole remedy is universal peace. And this is achieved only by the establishment of a supreme Tribunal, representative of all governments and peoples. All national and international problems should be referred to this tribunal, and whatsoever be its decision that should be enforced. Were a government or people to dissent, the world as a whole should rise against it.`,
      ],
    ],
    "turning-point": [
      removeAfter("Notes"),
      [
        /^Turning Point[\s\S]*Global Plans: Fundamental Concepts/,
        "Turning Point\n\nGlobal Plans: Fundamental Concepts",
      ],
      ["Part III", ""],
      title("", "Turning Point", {
        author: "Palabra Publications",
        years: [1996, 2006],
        collection: true,
      }),
      title("#", "Global Plans: Fundamental Concepts", {
        author: "Ad Hoc Committee at the Bahá’í World Centre",
        years: [2005.1029, 2005.1029],
      }),
      title("#", "Additional Documents", { collection: true }),
      [/^— .* —$\n\n/gm, "## "],
      [
        "## Training Institutes",
        `## Training Institutes\nauthor="Commissioned by the Universal House of Justice"\nyears=[1998.0401,1998.0401]`,
      ],
      [
        "## Training Institutes and Systematic Growth",
        `## Training Institutes and Systematic Growth\nauthor="The International Teaching Centre"\nyears=[2000.0201,2000.0201]`,
      ],
      [
        "## Building Momentum A Coherent Approach to Growth",
        `## Building Momentum: A Coherent Approach to Growth\nauthor="The International Teaching Centre"\nyears=[2003.0401,2003.0401]`,
      ],
      [
        "## Impact of Growth on Administration Processes",
        `## Impact of Growth on Administration Processes\nauthor="The International Teaching Centre"\nyears=[2005.0701,2005.0701]`,
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
      ["has endowed each and all", "hast endowed each and all"],
    ],
  },
  "official-statements-commentaries": {
    bahaullah: [
      [/^A statement prepared by the Bahá’í.*/m, ""],
      removeAfter("Notes"),
      title("", "Bahá’u’lláh", {
        author: "Commissioned by the Universal House of Justice",
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
        author: "Commissioned by the Universal House of Justice",
        years: [2001, 2001],
        collection: true,
      }),
      [/\n^Century of Light$/m, "\n# Century of Light"],
      title("#", "Foreword", { author: "The Universal House of Justice" }),
      [/^[A-Z]{1,5}$/gm, "***"],
      [
        "Today nothing but the power of the Word of God which encompasses the realities of things can bring the thoughts, the minds, the hearts and the spirits under the shade of one Tree. He is the potent in all things, the vivifier of souls, the preserver and the controller of the world of mankind.",
        "Naught but the celestial potency of the Word of God, which rules and transcends the realities of all things, is capable of harmonizing the divergent thoughts, sentiments, ideas, and convictions of the children of men. Verily, it is the penetrating power in all things, the mover of souls and the binder and regulator in the world of humanity.",
      ],
    ],
    "one-common-faith": [
      ["The Universal House of Justice", ""],
      ["Naw‑Rúz, 2005", ""],
      removeAfter("References"),
      title("", "One Common Faith", {
        author: "Commissioned by the Universal House of Justice",
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
        author: "Bahá’í International Community",
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
        author: "Bahá’í International Community",
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
      prefix("\n\nO ye tender seedlings in the garden", '\ntype=""'),
      prefix("\n\nO loved ones of ‘Abdu’l‑Bahá!", '\ntype=""'),
      ["from whatever is obnoxious", "from whatsoever is obnoxious"],
      ["‘Abdu’l‑Bahá!\n\nMan’s life", "‘Abdu’l‑Bahá! Man’s life"],
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
      ["created thing has been revealed", "created things has been revealed"],
      ["restless, and it condition", "restless, and its condition"],
      ["second condition:—They must", "second condition . . . They must"],
      ["own opinion and must", "own opinion and . . . must"],
      ["Revelation of God, His name and", "Revelation of God, His names and"],
      ["the “Seen” and “Hidden”—all", "the “Seen” and the “Hidden”—all"],
      ["being were deeply immersed", "being were deep immersed"],
      ["their utterance to be the Voice", "their utterances to be the Voice"],
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
        years: [1988.0901, 1988.0901],
      }),
      title("#", "The Bahá’í Standard"),
      ["\nA Chaste and Holy Life", "\n# A Chaste and Holy Life"],
      title("#", "The Power of Example"),
      [/^[A-Z].{0,80}[a-z]$/gm, (a) => `## ${a}`],
      ["## A Chaste and Holy Life", "A Chaste and Holy Life"],
      [
        "We have permitted you to listen to music and singing. Beware lest such listening cause you to transgress the bounds of decency and dignity. Rejoice in the joy of My Most Great Name through which the hearts are enchanted and the minds of the well‑favoured are attracted.",
        "We have made it lawful for you to listen to music and singing. Take heed, however, lest listening thereto should cause you to overstep the bounds of propriety and dignity. Let your joy be the joy born of My Most Great Name, a Name that bringeth rapture to the heart, and filleth with ecstasy the minds of all who have drawn nigh unto God.",
      ],
      ["Such an one, indeed, is the", "Such a one, indeed, is the"],
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
        years: [1989.0101, 1989.0101],
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
        years: [1989.0101, 1989.0101],
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
        years: [1990.1101, 1990.1101],
      }),
      [/^From/gm, "# From"],
      ["wholly freed from estrangement", "wholly free from estrangement"],
      ["second condition: they must", "second condition . . . they must"],
      ["those whom they should serve", "those whom they serve"],
      ["told by the Master to be", "told by our Master to be"],
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
        years: [1990.1101, 1990.1101],
      }),
      [/^From/gm, "# From"],
      ["# From amongst all mankind", "From amongst all mankind"],
      ["this advancement in all these", "this advancement and all these"],
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
        years: [2008.0301, 2008.0301],
      }),
      [/^I+\./gm, "#"],
      [/^Extract/gm, "## Extract"],
      ["beneficence to men, and set", "beneficence to men, and to set"],
      [
        "Also a father and mother endure the greatest troubles and hardships for their children; and often when the children have reached the age of maturity, the parents pass on to the other world. Rarely does it happen that a father and mother in this world see the reward of the care and trouble they have undergone for their children. Therefore, children, in return for this care and trouble, must show forth charity and beneficence, and must implore pardon and forgiveness for their parents. So you ought, in return for the love and kindness shown you by your father, to give to the poor for his sake, with greatest submission and humility implore pardon and remission of sins, and ask for the supreme mercy.",
        "Likewise, parents endure the greatest toil and trouble for their children, and often, by the time the latter have reached the age of maturity, the former have hastened to the world beyond. Rarely do the mother and father enjoy in this world the rewards of all the pain and trouble they have endured for their children. The children must therefore, in return for this pain and trouble, make charitable contributions and perform good works in their name, and implore pardon and forgiveness for their souls. You should therefore, in return for the love and kindness of your father, give to the poor in his name and, with the utmost lowliness and fervour, pray for God’s pardon and forgiveness and seek His infinite mercy.",
      ],
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
      ["good‑pleasure, and speak", "good‑pleasure, and will speak"],
      ["bestowals, and may become", "bestowals, may become"],
      [
        "He will, erelong, out of the Bosom of Power, draw forth the",
        "Erelong shall God draw forth, out of the bosom of power, the",
      ],
      splitLines(/High‑spirited souls by the.*/m, "To lay down a hundred"),
      splitLines(/From the outset love was.*/m, "So as to put every"),
      splitLines(/The worldly wise who garner.*/m, "For unto none was"),
    ],
    "give-me-thy-grace-serve-thy-loved-ones": [
      removeAfter("This document has been downloaded"),
      ["Compilation for the 2018 Counsellors’ Conference", ""],
      [/^\(.*/gm, ""],
      ["", "Give Me Thy Grace to Serve Thy Loved Ones\n\n"],
      title("", "Give Me Thy Grace to Serve Thy Loved Ones", {
        author: "Compilation",
        years: [2018.0501, 2018.0501],
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
        years: [2009.0801, 2009.0801],
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
        years: [2000.0501, 2000.0501],
      }),
      [/^\d+\./gm, "#"],
    ],
    "importance-prayer-meditation-devotional-attitude": [
      removeAfter("Notes"),
      [/^Prepared by the Research Department of.*/m, ""],
      ["March 1980", ""],
      ["Revised July 1990", ""],
      [/^\(.*/gm, ""],
      [/^\. \. \.$/gm, ""],
      [
        "\n\nand the Devotional Attitude: A Compilation",
        " and the Devotional Attitude",
      ],
      title(
        "",
        "The Importance of Prayer, Meditation and the Devotional Attitude",
        {
          author: "Compilation",
          years: [1990.0701, 1990.0701],
        }
      ),
      [/^Extract/gm, "# Extract"],
      [
        "Recite ye the verses of God every morning and evening. Whoso reciteth them not hath truly failed to fulfil his pledge to the Covenant of God and His Testament, and whoso in this day turneth away therefrom hath indeed turned away from God since time immemorial. Fear ye God, O concourse of My servants!\n\nTake heed lest excessive reading and too many acts of piety in the daytime and in the night season make you vainglorious. Should a person recite but a single verse from the Holy Writings in a spirit of joy and radiance, this would be better for him than reciting wearily all the Scriptures of God, the Help in Peril, the Self‑Subsisting. Recite ye the verses of God in such measure that ye be not overtaken with fatigue or boredom. Burden not your souls so as to cause exhaustion and weigh them down, but rather endeavour to lighten them, that they may soar on the wings of revealed Verses unto the dawning‑place of His signs. This is conducive to nearer access unto God, were ye to comprehend.",
        "Recite ye the verses of God every morn and eventide. Whoso faileth to recite them hath not been faithful to the Covenant of God and His Testament, and whoso turneth away from these holy verses in this Day is of those who throughout eternity have turned away from God. Fear ye God, O My servants, one and all. Pride not yourselves on much reading of the verses or on a multitude of pious acts by night and day; for were a man to read a single verse with joy and radiance it would be better for him than to read with lassitude all the Holy Books of God, the Help in Peril, the Self‑Subsisting. Read ye the sacred verses in such measure that ye be not overcome by languor and despondency. Lay not upon your souls that which will weary them and weigh them down, but rather what will lighten and uplift them, so that they may soar on the wings of the Divine verses towards the Dawning‑place of His manifest signs; this will draw you nearer to God, did ye but comprehend.",
      ],
      [
        "If one friend feels love for another, he will wish to say so. Though he knows that the friend is aware that he loves him, he will still wish to say so. . . . God knows the wishes of all hearts. But the impulse to prayer is a natural one, springing from man’s love to God.",
        "If one friend loves another, is it not natural that he should wish to say so? Though he knows that that friend is aware of his love, does he still not wish to tell him of it? . . . It is true that God knows the wishes of all hearts; but the impulse to pray is a natural one, springing from man’s love to God.",
      ],
      ["in thought and attitude. But", "in thought and action. But"],
      [
        "If a person talks to you as an unpleasant duty, with no love or pleasure in his meeting with you, do you wish to converse with him?",
        "If a person talks to you as an unpleasant duty, finding neither love nor enjoyment in the meeting, do you wish to converse with him?",
      ],
      ["therefore fully realise the", "therefore realise fully the"],
    ],
    "institution-mashriqul-adhkar": [
      removeAfter("Notes"),
      [/^A Statement Prepared by the Research.*/m, ""],
      [/^\nThe Institution of the Mashriqu’l‑Adhkár.*/gm, "\n"],
      [/^Prepared by the Research Department of.*/m, ""],
      [/^September 2017.*/gm, ""],
      [/^\(.*/gm, ""],
      [/^\. \. \.$/gm, ""],
      title("", "The Institution of the Mashriqu’l‑Adhkár", {
        author: "Compilation",
        years: [2017.0901, 2017.0901],
      }),
      [/^A Statement and Compilation Prepared.*/m, "# A Statement"],
      [/^A Compilation of Extracts from the.*/m, "# A Compilation of Extracts"],
      [/^\d+\./gm, "##"],
      [/^From.{0,80}$/gm, (a) => `## ${a}`],
      [/^Selected Prayers for the/m, "## Selected Prayers for the"],
      ["Upon its quality depend the", "Upon its quality depends the"],
      ["can succeed to dissipate. And", "can succeed in dissipating. And"],
    ],
    "issues-related-study-bahai-faith": [
      removeAfter("Notes"),
      [/^The Universal House of Justice$[\s\S]*the United States, 1999$/gm, ""],
      [/^\d+$\n\n.*/gm, "***"],
      ["", "Issues Related to the Study of the Bahá’í Faith\n\n"],
      title("", "Issues Related to the Study of the Bahá’í Faith", {
        author: "Compilation",
        years: [1999.0407, 1999.0407],
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
      [/^\. \. \.$/gm, ""],
      title("", "The Local Spiritual Assembly", {
        author: "Compilation",
        years: [2017.0901, 2017.0901],
      }),
      [/^[IV]+\./gm, "#"],
      ["wholly freed from estrangement", "wholly free from estrangement"],
      ["second condition: They must", "second condition . . . They must"],
      ["those whom they should serve", "those whom they serve"],
      ["number it does not matter", "number it doth not matter"],
      ["vouchsafed to them. In this", "vouchsafed to them. . . . In this"],
      ["doth not matter. It behoveth", "doth not matter. . . . It behoveth"],
      ["supreme victory: “O God", "supreme victory: . . . “O God"],
      ["ourselves from all beside Thee", "ourselves from all besides Thee"],
      ["the Standards of Thy exalted", "the Standards of Thine exalted"],
      ["flowing from Thy all‑glorious", "flowing from Thine all‑glorious"],
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
        years: [1996.0601, 1996.0601],
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
      [/^\. \. \.$/gm, ""],
      title("", "Peace", {
        author: "Compilation",
        years: [1985.0801, 1985.0801],
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
      ["broadest outline, to what appear", "broadest outlines, what appear"],
      ["adjust their systems of economic", "adjust their system of economic"],
      ["needs of a fast evolving", "needs of a rapidly evolving"],
      ["more intense that any it has yet", "more intense than any it has yet"],
      ["cannot but appear, when viewed", "cannot appear, when viewed"],
      ["all the Revelation, of the past", "all the Revelations of the past"],
      ["for you, O peoples. If ye fail", "for you, O people. If ye fail"],
      ["in the course of the present", "in the course of present"],
      ["the divers communities in", "the diverse communities in"],
      [
        `So long as these prejudices [religious, racial, national, political] survive, there will be continuous and fearsome wars.

To remedy this condition there must be universal peace. To bring this about, a Supreme Tribunal must be established, representative of all governments and peoples; questions both national and international must be referred thereto, and all must carry out the decrees of this Tribunal. Should any government or people disobey, let the whole world arise against that government or people.`,
        `So long as these [prejudices] remain, the dread of war will continue.

The sole remedy is universal peace. And this is achieved only by the establishment of a supreme Tribunal, representative of all governments and peoples. All national and international problems should be referred to this tribunal, and whatsoever be its decision that should be enforced. Were a government or people to dissent, the world as a whole should rise against it.`,
      ],
      [
        "though created whole and perfect, has been afflicted, through divers causes, with grave ills and maladies. Not for one day did it rest, nay its sicknesses waxed more severe, as it fell under the treatment of unskilled physicians who have spurred on the steed of their worldly desires and have erred grievously.",
        "though at its creation whole and perfect, hath been afflicted, through various causes, with grave disorders and maladies. Not for one day did it gain ease, nay its sickness waxed more severe, as it fell under the treatment of ignorant physicians, who gave full rein to their personal desires and have erred grievously.",
      ],
      [
        "Consider these days in which the Ancient Beauty, He Who is the Most Great Name, hath been sent down to regenerate and unify mankind. Behold how with drawn swords they rose against Him, and committed that which caused the Faithful Spirit to tremble. And whenever We said unto them: ‘Lo, the World Reformer is come,’ they made reply: ‘He, in truth, is one of the stirrers of mischief’",
        "Consider these days in which He Who is the Ancient Beauty hath come in the Most Great Name, that He may quicken the world and unite its peoples. They, however, rose up against Him with sharpened swords, and committed that which caused the Faithful Spirit to lament, until in the end they imprisoned Him in the most desolate of cities, and broke the grasp of the faithful upon the hem of His robe. Were anyone to tell them: ‘The World Reformer is come’, they would answer and say: ‘Indeed it is proven that He is a fomenter of discord!’",
      ],
      ["century of light—has been", "century of light—hath been"],
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
        years: [1990.0701, 1990.0701],
      }),
      [/^From/gm, "# From"],
      ["resist His Faith? No, by Him", "resist His Faith? Nay, by Him"],
      ["assisted by grace from on", "assisted by His grace from on"],
      ["some for yet another century", "some for another century"],
    ],
    "prayer-devotional-life": [
      removeAfter("Notes"),
      [/^A Compilation of Extracts from the.*/m, ""],
      ["Prepared by the Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["February 2019", ""],
      [/^\(.*/gm, ""],
      [/^\. \. \.$/gm, ""],
      title("", "Prayer and Devotional Life", {
        author: "Compilation",
        years: [2019.0201, 2019.0201],
      }),
      prefix("Prayers and Healing", "## "),
      prefix("The Importance of Memorisation", "## "),
      prefix("The Object of Our Devotion", "## "),
      [/^[A-Z].{0,80}[a-z]$/gm, (a) => `# ${a}`],
      ["# Prayer and Devotional Life", "Prayer and Devotional Life"],
      ["the doors to true knowledge", "the doors of true knowledge"],
      ["therefore fully realise the", "therefore realise fully the"],
      ["twenty‑four hours and at midday", "twenty‑four hours at midday"],
    ],
    "sanctity-nature-bahai-elections": [
      removeAfter("This document has been downloaded"),
      ["A Compilation Prepared by the Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["December 1989", ""],
      [/^\(.*/gm, ""],
      title("", "The Sanctity and Nature of Bahá’í Elections", {
        author: "Compilation",
        years: [1989.1201, 1989.1201],
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
        years: [1995.0201, 1995.0201],
      }),
      [/^\d+\. /gm, "# "],
      [/^\d+\.\d+ /gm, "## "],
      prefix(/^From (a|the|Letters|Communications)/gm, "### "),
      ["### Scholarship", "Scholarship"],
      [
        "the founder of science and knowledge, it is full of goodwill for learned men; it is the civiliser of mankind, the discoverer of the secrets of nature, and the enlightener of the horizons of the world. Consequently, how can it be said to oppose knowledge? God forbid! Nay, for God, knowledge is the most glorious gift of man and the most noble of human perfections. To oppose knowledge is ignorant, and he who detests knowledge and science is not a man, but rather an animal without intelligence. For knowledge is light, life, felicity, perfection, beauty and the means of approaching the Threshold of Unity. It is the honour and glory of the world of humanity, and the greatest bounty of God. Knowledge is identical with guidance, and ignorance is real error.",
        "the establisher of science and learning, the supporter of knowledge, the civiliser of the human race, the discoverer of the secrets of existence, and the enlightener of the horizons of the world. How then could it oppose knowledge? God forbid! On the contrary, in the sight of God knowledge is the greatest human virtue and the noblest human perfection. To oppose knowledge is pure ignorance, and one who abhors the arts and sciences is not a human being but is even as a mindless animal. For knowledge is light, life, felicity, perfection, and beauty, and causes the soul to draw nigh to the divine threshold. It is the honour and glory of the human realm and the greatest of God’s bounties. Knowledge is identical to guidance, and ignorance is the essence of error.",
      ],
      ["Thoughts are boundless sea", "Thoughts are a boundless sea"],
      [
        "floweth into the mighty Sea, and draweth",
        "flow into the mighty sea, and draw",
      ],
      ["pursuit of knowledge leadeth to", "pursuit of knowledge lead to"],
      [
        `There are only four accepted methods of comprehension—that is to say, the realities of things are understood by these four methods.

The first method is by the senses—that is to say, all that the eye, the ear, the taste, the smell, the touch perceive is understood by this method. Today this method is considered the most perfect by all the European philosophers: they say that the principal method of gaining knowledge is through the senses; they consider it supreme, although it is imperfect, for it commits errors. For example, the greatest of the senses is the power of sight. . . . The sight believes the earth to be motionless and sees the sun in motion, and in many similar cases it makes mistakes. Therefore, we cannot trust it.

The second is the method of reason, which was that of the ancient philosophers, the pillars of wisdom; this is the method of the understanding. They proved things by reason and hold firmly to logical proofs; all their arguments are arguments of reason. Notwithstanding this, they differed greatly, and their opinions were contradictory. They even changed their views—that is to say, during twenty years they would prove the existence of a thing by logical arguments, and afterward they would deny it by logical arguments—so much so that Plato at first logically proved the immobility of the earth and the movement of the sun; later by logical arguments he proved that the sun was the stationary centre, and that the earth was moving. . . . Therefore, it is evident that the method of reason is not perfect, for the differences of the ancient philosophers, the want of stability and the variations of their opinions, prove this. For if it were perfect, all ought to be united in their ideas and agreed in their opinions.

The third method of understanding is by tradition—that is, through the text of the Holy Scriptures—for people say, “In the Old and New Testaments, God spoke thus.” This method equally is not perfect, because the traditions are understood by the reason. As the reason itself is liable to err, how can it be said that in interpreting the meaning of the traditions it will not err, for it is possible for it to make mistakes, and certainty cannot be attained. This is the method of the religious leaders; whatever they understand and comprehend from the text of the books is that which their reason understands from the text, and not necessarily the real truth; for the reason is like a balance, and the meanings contained in the text of the Holy Books are like the thing which is weighed. If the balance is untrue, how can the weight be ascertained?

Know then: that which is in the hands of people, that which they believe, is liable to error. For, in proving or disproving a thing, if a proof is brought forward which is taken from the evidence of our senses, this method, as has become evident, is not perfect; if the proofs are intellectual, the same is true; or if they are traditional, such proofs also are not perfect. Therefore, there is no standard in the hands of people upon which we can rely.

But the bounty of the Holy Spirit gives the true method of comprehension which is infallible and indubitable. This is through the help of the Holy Spirit which comes to man, and this is the condition in which certainty can alone be attained.`,
        `There are only four accepted criteria of comprehension, that is, four criteria whereby the realities of things are understood.

The first criterion is that of the senses; that is, all that the eye, the ear, the taste, the smell, and the touch perceive is called “sensible”. At present all the European philosophers hold this to be the most perfect criterion. They claim that the greatest of all criteria is that of the senses, and they regard it as sacrosanct. And yet the criterion of the senses is defective, as it can err. For example, the greatest of the senses is the power of vision. The vision, however, sees a mirage as water and reckons images reflected in mirrors as real and existing; it sees large bodies as small, perceives a whirling point as a circle, imagines the earth to be stationary and the sun to be in motion, and is subject to many other errors of a similar nature. One cannot therefore rely implicitly upon it.

The second criterion is that of the intellect, which was the principal criterion of comprehension for those pillars of wisdom, the ancient philosophers. They deduced things through the power of the mind and relied on rational arguments: All their arguments are based upon reason. But despite this, they diverged greatly in their opinions. They would even change their own views: For twenty years they would deduce the existence of something through rational arguments, and then afterwards they would disprove the same, again through rational arguments. Even Plato at first proved through rational arguments the immobility of the earth and the movement of the sun, and then subsequently established, again through rational arguments, the centrality of the sun and the movement of the earth. . . . It is therefore evident that the criterion of reason is imperfect, as proven by the disagreements existing between the ancient philosophers as well as by their want of consistency and their propensity to change their own views. For if the criterion of intellect were perfect, all should have been united in their thoughts and agreed in their opinions.

The third criterion is that of tradition, that is, the text of the Sacred Scriptures, when it is said, “God said thus in the Torah”, or “God said thus in the Gospel.” This criterion is not perfect either, because the traditions must be understood by the mind. As the mind itself is liable to error, how can it be said that it will attain to perfect truth and not err in comprehending and inferring the meaning of the traditions? For it is subject to error and cannot lead to certitude. This is the criterion of the leaders of religion. What they comprehend from the text of the Book, however, is that which their minds can understand and not necessarily the truth of the matter; for the mind is like a balance, and the meanings contained in the texts are like the objects to be weighed. If the balance is untrue, how can the weight be ascertained?

Know, therefore, that what the people possess and believe to be true is liable to error. For if in proving or disproving a thing a proof drawn from the evidence of the senses is advanced, this criterion is clearly imperfect; if a rational proof is adduced, the same holds true; and likewise if a traditional proof is given. Thus it is clear that man does not possess any criterion of knowledge that can be relied upon.

But the grace of the Holy Spirit is the true criterion regarding which there is no doubt or uncertainty. That grace consists in the confirmations of the Holy Spirit which are vouchsafed to man and through which certitude is attained.`,
      ],
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
        years: [1990.0801, 1990.0801],
      }),
    ],
    "social-action": [
      removeAfter("Notes"),
      [/^A Compilation Prepared by the Research.*/m, ""],
      ["August 2020", ""],
      [/^\(.*/gm, ""],
      title("", "Social Action", {
        author: "Compilation",
        years: [2020.0801, 2020.0801],
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
      [
        "he who abhors knowledge and learning",
        "one who abhors the arts and sciences",
      ],
      ["being but a mindless animal", "being but is even as a mindless animal"],
      ["which God has “endowed each", "which God “hast endowed each"],
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
        years: [1990.0801, 1990.0801],
      }),
      [/^Extract/gm, "# Extract"],
      ["the One Who hath power", "the One that hath power"],
      ["he may be. The purpose", "he may be. . . . The purpose"],
    ],
    "universal-house-of-justice-compilation": [
      removeAfter("Index"),
      [/^A Compilation Prepared by the Research.*/m, ""],
      ["February 2021", ""],
      [/^\(.*/gm, ""],
      [/^\d+\.\d+$/gm, ""],
      title("", "The Universal House of Justice", {
        author: "Compilation",
        years: [2021.0201, 2021.0201],
      }),
      prefix(/^[A-Z].{0,80}[a-zá]$/gm, "# "),
      ["# The Universal House of Justice", "The Universal House of Justice"],
      ["the divers communities in", "the diverse communities in"],
      ["no one hath the right to", "no one has the right to"],
      ["He who opposeth it is cast", "He who opposes it is cast"],
      ["our love for our beloved Master", "our love of our beloved Master"],
      ["by unwarranted inferences", "by unwarrantable inferences"],
      ["the members the Universal One", "the members of the Universal One"],
      [/guidance of the Exalted/g, "guidance of His Holiness, the Exalted"],
      [
        "prolonged consultation which included consideration",
        "prolonged consideration",
      ],
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
        years: [1990.0701, 1990.0701],
      }),
      [/^[IV]+\./gm, "#"],
      [/^Extract/gm, "## Extract"],
      ["Therefore it is incumbent upon", "Therefore is it incumbent upon"],
    ],
  },
};
