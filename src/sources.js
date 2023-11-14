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
    return "to Bahá’í youth";
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
      ["We cause whomsover We desire", "We cause whomsoever We desire"],
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
      splitLines(/Love shunneth this world.*/m, "In him are lunacies"),
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
        /(?<!> )How can feeble reason embrace.*/m,
        "Or the spider snare",
        "Wouldst thou that",
        "Seize it and enrol"
      ),
      splitLines(
        /(?<!> )Love shunneth this world.*/m,
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
      ["Bahá proferreth in", "Bahá proffereth in"],
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
      ["guise of the shepherd", "guise of shepherds"],
      [
        "wouldst for longing after His glorious and sublime Kingdom, lay down thy life in the path of God.",
        "wouldst, in thy love for My name, and in thy longing for My glorious and sublime Kingdom, lay down thy life in My path.",
      ],
      ["love for Him. Verily", "My love for Him. . . . Verily"],
      ["a helper. In this", "a helper. . . . In this"],
      ["its exaltation. Knowledge", "its exaltation. . . . Knowledge"],
      ["Mother Book in this", "Mother Book . . . in this"],
      ["possess, it. It is", "possess, it. . . . It is"],
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
      ["Gleanings from the Writings of Bahá’u’lláh", "Gleanings"],
      title("", "Gleanings", {
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
      [
        "establishes the Nineteen Day Feast",
        "establishes the Nineteen Day Feasts",
      ],
      ["and the “keys” of His", "as the “keys” of His"],
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
      ["guise of the shepherd", "guise of shepherds"],
      [/He saith: O.*$/gm, (s) => `He saith: “${s.slice(10)}”`],
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
      [/^(This is the [CEM].*)\n+(.*)/gm, (_, a, b) => `* ${a}\n\n^ ${b}`],
      [/"\n+([A-Z].{0,120})$/gm, (_, s) => `"\n\n^ ${s}`],
      [/\*\*\*\n+(.*)\n+\*\*\*/g, (_, s) => `* ${s}`],
      prefix(/^He is God, exalted is He/m, "^ "),
      ["that wherefor thou hast", "that wherefore thou hast"],
    ],
    "additional-tablets-extracts-from-tablets-revealed-bahaullah": [
      removeAfter("This document has been downloaded"),
      [
        "Additional Tablets and Extracts from Tablets Revealed by Bahá’u’lláh",
        "Additional Tablets and Extracts",
      ],
      title("", "Additional Tablets and Extracts", {
        author: "Bahá’u’lláh",
        years: authorYears["Bahá’u’lláh"],
        collection: true,
      }),
      [/^—Bahá’u’lláh$/gm, ""],
      [/^Mírzá Muḥammad‑‘Alí Zunúzí.*/m, ""],
      [/^Bahá’u’lláh states in another Tablet.*/m, ""],
      [/^In a Tablet Bahá’u’lláh states.*/m, ""],
      [/^Zaynu’l‑Muqarrabín./m, ""],
      [/^Cf. Qur’án 17:23..*/m, ""],
      [/^Inscription on the tombstone of Ḥusayn.*/m, ""],
      [/^Cf. Qur’án 18:46..*/m, ""],
      [/^In the original Persian Bahá’u’lláh.*/m, ""],
      [/^Jesus..*/m, ""],
      [/^Siyyid ‘Abdu’l‑Karím‑i‑Urdúbádí..*/m, ""],
      [/^Khadíjih Bagum\./m, ""],
      [/^Qur’án 3:97/m, ""],
      [/^A punning reference to the fact that.*/m, ""],
      [/^i\.e, who bear the name “Maḥbúb”.*/m, ""],
      [/^This Tablet was revealed in the voice.*/m, ""],
      [/^Known as Jináb‑i‑Amín, Trustee of.*/m, ""],
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
      [/\*\*\*/g, "#"],
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
      [
        "* Whoso wisheth to recite this prayer",
        (a) => `* To be recited once in twenty‑four hours\n\n${a}`,
      ],
      [/We all, verily/g, "\n> We all, verily"],
      ["and to deny them not", "and deny them not"],
      ["what Thou hadst commanded", "what Thou hast commanded"],
      ["Lord of the worlds and the Desire", "Lord of the world and the Desire"],
      ["sublime knowledge I, therefore", "sublime knowledge. I, therefore"],
    ],
    "additional-prayers-revealed-bahaullah": [
      removeAfter("This document has been downloaded"),
      [/^—Bahá’u’lláh$/gm, ""],
      [/^Revealed for the recipient on the occasion.*/m, ""],
      [/^Revealed for the recipient on the occasion.*/m, ""],
      [/^Qur’án 21:89/m, ""],
      title("", "Additional Prayers Revealed by Bahá’u’lláh", {
        author: "Bahá’u’lláh",
        years: authorYears["Bahá’u’lláh"],
        type: "Prayer",
        collection: true,
      }),
      [/\*\*\*/g, "#"],
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
      [/^—‘Abdu’l‑Bahá$/gm, ""],
      [/\*\*\*/g, ""],
      ["Ibn‑i‑Abhar,\n\nupon", "Ibn‑i‑Abhar, upon"],
      [/^Cf. Qur’án, 56:62; also 29:20 and 53:47..*/m, ""],
      [/^Mark 9:35..*/m, ""],
      [/^Matthew 20:27..*/m, ""],
      [/^Kitáb‑i‑Aqdas..*/m, ""],
      [/^Legendary king of Persia..*/m, ""],
      [/^Kings of Persia from ancient mythology..*/m, ""],
      [/^Qur’án 28:30..*/m, ""],
      [/^Moses..*/m, ""],
      [/^Abraham..*/m, ""],
      [/^Qur’án 11:80..*/m, ""],
      [/^Qur’án 38:35..*/m, ""],
      [/^Jesus..*/m, ""],
      [/^Muḥammad..*/m, ""],
      [/^Qur’án 17:1..*/m, ""],
      [/^Qur’án 24:35..*/m, ""],
      [/^An invocation\/prayer of Prophet Muḥammad.*/m, ""],
      [/^Reference to the land for the Mashriqu’l‑Adhkár.*/m, ""],
      [/^Albert Schwarz..*/m, ""],
      [/^Wilhelm Herrigel..*/m, ""],
      [/^Alice Schwarz..*/m, ""],
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
      [/^Matthew Henry and Thomas Scott, authors of The Comprehensive.*/m, ""],
      [/^.*of ‘Abdu’l‑Bahá$/gm, () => "#"],
      [/^O physician of the body and the spirit!/m, (a) => `#\n\n${a}`],
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
      [
        /#\n+[A-ZṬ].{0,120}[^:\n](\n+[A-Z].{0,120})*$/gm,
        (s) =>
          s
            .split(/\n+/g)
            .map((t, i) => (i === 0 ? t : `^ ${t}`))
            .join("\n\n"),
      ],
      prefix(/^The Lamp of the assemblage/m, "^ "),
      prefix(/^A prayer beseeching forgiveness/m, "^ "),
      prefix(/^He is God/gm, "^ "),
      ["^ Seize thy chance", "Seize thy chance"],
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
      [/#\n+([A-Z].{0,120})$/gm, (_, s) => `#\n\n^ ${s}`],
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
      [/^The Eleven Principles out of the Teaching.*/m, ""],
      [/^The Search after Truth\. The Unity of Mankind.*/m, ""],
      title("#", "Part One", { collection: true }),
      title("#", "Part Two", { collection: true }),
      title("#", "Part Three", { collection: true }),
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
      [
        /^— .* —$\n\n(.*)\n\n(.*)\n\n(.*[^\.\n]$)?/gm,
        (_1, a, b, _2) => `## ${a}\nsummary="${b}"\n\n`,
      ],
      [
        /^(Talk.*)$\n\n(.*)/gm,
        (_, a, b) =>
          `# ${a.slice(31).trim()}, ${b.replace(" ‑ ", "‑")}\ncollection`,
      ],
      [
        `In the beginning of his human life man was embryonic in the world of the matrix. There he received capacity and endowment for the reality of human existence. The forces and powers necessary for this world were bestowed upon him in that limited condition. In this world he needed eyes; he received them potentially in the other. He needed ears; he obtained them there in readiness and preparation for his new existence. The powers requisite in this world were conferred upon him in the world of the matrix so that when he entered this realm of real existence he not only possessed all necessary functions and powers but found provision for his material sustenance awaiting him.

Therefore, in this world he must prepare himself for the life beyond. That which he needs in the world of the Kingdom must be obtained here. Just as he prepared himself in the world of the matrix by acquiring forces necessary in this sphere of existence, so, likewise, the indispensable forces of the divine existence must be potentially attained in this world.`,
        `In the beginning of his life man was in the world of the womb, wherein he developed the capacity and worthiness to advance to this world. The powers necessary for this world he acquired in that world. He needed eyes in this world; he obtained them in the world of the womb. He needed ears in this world; he obtained them there. All the powers that were needed in this world he acquired in the world of the womb. In that world he became prepared for this world, and when he entered this world he saw that he possessed all the requisite powers and had acquired all the limbs and organs necessary for this life, in that world.

It followeth that in this world too he must prepare for the world beyond. That which he needeth in the world of the Kingdom he must obtain and prepare here. Just as he acquired the powers necessary for this world in the world of the womb, so, likewise, he must obtain that which he will need in the world of the Kingdom—that is to say, all the heavenly powers—in this world.`,
      ],
      [
        "blest in the East and the West for the triumph of its democracy",
        "blest in both the East and the West for the triumph of its people",
      ],
      ["written presupposses and", "written presupposes and"],
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
      ["Selections from the Writings of ‘Abdu’l‑Bahá", "Selections"],
      title("", "Selections", {
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
        "\n# Selections\ncollection",
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
      ["bestow on them heavenly", "bestow upon them heavenly"],
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
    "tablet-auguste-forel": [
      [/^Original Persian text first published.*/m, ""],
      removeAfter("Notes"),
      ["***", ""],
      ["Haifa, 21 September 1921.", ""],
      title("", "‘Abdu’l‑Bahá’s Tablet to Dr. Forel", {
        author: "‘Abdu’l‑Bahá",
        years: [1921, 1921],
      }),
      ["and transfereth them from", "and transferreth them from"],
      ["and transfereth these", "and transferreth these"],
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
      ["Liechtenstein, Luxemburg, Monaco", "Liechtenstein, Luxembourg, Monaco"],
    ],
    "tablets-hague-abdul-baha": [
      removeAfter("Notes"),
      [/^17 December 1919$/m, ""],
      [/^1 July 1920$/m, ""],
      ["‘Abdu’l‑Bahá’s Tablets to The Hague", "Tablets to The Hague"],
      title("", "Tablets to The Hague", {
        author: "‘Abdu’l‑Bahá",
        years: [1919, 1920],
        collection: true,
      }),
      title("#", "First Tablet to The Hague"),
      title("#", "Second Tablet to The Hague"),
      prefix(/^O ye esteemed /m, "* "),
      prefix(/^To the /m, "* "),
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
      [
        /“O God, this is a letter[\s\S]*Protecting, the Self‑Subsistent\.”/,
        `This is an Epistle, O My God, which I have purposed to send unto the King. Thou knowest that I have wished of him naught but that he should show forth justice to Thy servants and extend his favours unto the people of Thy kingdom. For Myself I have desired only what Thou didst desire, and through Thy succour I wish for naught save that which Thou wishest. Perish the soul that seeketh from Thee aught save Thyself! I swear by Thy glory! Thy good pleasure is my dearest wish, and Thy purpose My highest hope. Have mercy, O My God, upon this poor creature Who hath clung unto the hem of Thy riches, and this suppliant soul Who calleth upon Thee, saying, “Thou art, verily, the Lord of might and glory!” Assist Thou, O My God, His Majesty the Sháh to keep Thy statutes amidst Thy servants and to manifest Thy justice amongst Thy creatures, that he may treat this people as he treateth others. Thou art, in truth, the God of power, of glory and wisdom.

By the leave and permission of the King of the Age, this Servant journeyed from the Seat of Sovereignty to ‘Iráq, and dwelt for twelve years in that land. Throughout the entire course of this period no account of Our condition was submitted to the court of thy presence, and no representation ever made to foreign powers. Placing Our whole trust in God, We resided in that land until there came to ‘Iráq a certain official who, upon his arrival, undertook to harass this poor company of exiles. Day after day, at the instigation of some of the outwardly learned and of other individuals, he would stir up trouble for these servants, although they had at no time committed any act detrimental to the state and its people or contrary to the rules and customs of the citizens of the realm.

Fearing lest the actions of these transgressors should produce some outcome at variance with thy world‑adorning judgement, this Servant despatched a brief account of the matter to Mírzá Sa‘íd Khán at the Foreign Ministry, so that he might submit it to the royal presence and that whatever thou shouldst please to decree in this respect might be obeyed. A long while elapsed, and no decree was issued. Finally matters came to such a pass that there loomed the threat of imminent strife and bloodshed. Of necessity, therefore, and for the protection of the servants of God, a few of them appealed to the Governor of ‘Iráq.

Wert thou to observe these events with the eye of fairness, it would become clear and evident in the luminous mirror of thine heart that what occurred was called for by the circumstances, and that no other alternative could be seen. His Majesty himself is witness that in whatever city a number of this people have resided, the hostility of certain functionaries hath enkindled the flame of conflict and contention. This evanescent Soul, however, hath, since His arrival in ‘Iráq, forbidden all to engage in dissension and strife. The witness of this Servant is His very deeds, for all are well aware and will testify that, although a greater number of this people resided in ‘Iráq than in any other land, no one overstepped his limits or transgressed against his neighbour. Fixing their gaze upon God, and reposing their trust in Him, all have now been abiding in peace for well‑nigh fifteen years, and, in whatever hath befallen them, they have shown forth patience and resigned themselves to God.

After the arrival of this Servant in this, the city of Adrianople, some of the people of ‘Iráq and elsewhere inquired about the meaning of the term “rendering assistance unto God” which hath been mentioned in the Holy Scriptures. Several answers were sent out in reply, one of which is set forth in these pages, that it may be clearly demonstrated in the court of thy presence that this Servant hath had no end in view but to promote the betterment and well‑being of the world. And if certain of the divine favours which, undeserving as I may be, God hath pleased to bestow upon Me be not plain and manifest, this much at least will be clear and apparent, that He, in His surpassing mercy and infinite grace, hath not deprived Mine heart of the ornament of reason. The passage that was referred to concerning the meaning of “rendering assistance unto God” is as follows:

He is God, exalted be His glory!

It is clear and evident that the one true God—glorified be His mention!—is sanctified above the world and all that is therein. By “rendering assistance unto God”, then, it is not meant that any soul should fight or contend with another. That Sovereign Lord Who doeth whatsoever He pleaseth hath entrusted the kingdom of creation, its lands and its seas, into the hands of the kings, for they are, each according to his degree, the manifestations of His divine power. Should they enter beneath the shadow of the True One, they will be accounted of God, and if not, thy Lord, verily, knoweth and observeth all things.

That which God—glorified be His Name!—hath desired for Himself is the hearts of His servants, which are the treasuries of His love and remembrance and the repositories of His knowledge and wisdom. It hath ever been the wish of the Eternal King to cleanse the hearts of His servants from the things of the world and all that pertaineth thereunto, that they may be made worthy recipients of the effulgent splendours of Him Who is the King of all names and attributes. Wherefore must no stranger be allowed in the city of the heart, that the incomparable Friend may enter His abode. By this is meant the effulgence of His names and attributes, and not His exalted Essence, inasmuch as that peerless King hath ever been, and shall eternally remain, sanctified above ascent and descent.

It followeth, therefore, that rendering assistance unto God, in this day, doth not and shall never consist in contending or disputing with any soul; nay rather, what is preferable in the sight of God is that the cities of men’s hearts, which are ruled by the hosts of self and passion, should be subdued by the sword of utterance, of wisdom and of understanding. Thus, whoso seeketh to assist God must, before all else, conquer, with the sword of inner meaning and explanation, the city of his own heart and guard it from the remembrance of all save God, and only then set out to subdue the cities of the hearts of others.

Such is the true meaning of rendering assistance unto God. Sedition hath never been pleasing unto God, nor were the acts committed in the past by certain foolish ones acceptable in His sight. Know ye that to be killed in the path of His good pleasure is better for you than to kill. The beloved of the Lord must, in this day, behave in such wise amidst His servants that they may by their very deeds and actions guide all men unto the paradise of the All‑Glorious.

By Him Who shineth above the Dayspring of Sanctity! The friends of God have not, nor will they ever, set their hopes upon the world and its ephemeral possessions. The one true God hath ever regarded the hearts of men as His own, His exclusive possession—and this too but as an expression of His all‑surpassing mercy, that haply mortal souls may be purged and sanctified from all that pertaineth to the world of dust and gain admittance into the realms of eternity. For otherwise that ideal King is, in Himself and by Himself, sufficient unto Himself and independent of all things. Neither doth the love of His creatures profit Him, nor can their malice harm Him. All have issued forth from abodes of dust, and unto dust shall they return, while the one true God, alone and single, is established upon His Throne, a Throne which is beyond the reaches of time and space, is sanctified above all utterance or expression, intimation, description and definition, and is exalted beyond all notion of abasement and glory. And none knoweth this save Him and those with whom is the knowledge of the Book. No God is there but Him, the Almighty, the All‑Bountiful.

It behoveth the benevolence of the Sovereign, however, to examine all matters with the eye of justice and mercy, and not to content himself with the baseless claims of certain individuals. We beseech God to graciously assist the King to fulfil that which He pleaseth, and, verily, that which He desireth should be the desire of all the worlds.

Later this Servant was summoned to Constantinople, whither We arrived accompanied by a poor band of exiles. At no time thereafter did We seek to meet with anyone, as We had no request to make and no aim in view but to demonstrate unto all that this Servant had no mischief in mind and had never associated with the sowers of sedition. By Him Who hath caused the tongues of all beings to speak forth His praise! While certain considerations rendered it difficult to make application to any quarter, such steps were perforce taken to protect certain souls. My Lord, verily, knoweth what is in Me, and He beareth witness unto the truth of what I say.

A just king is the shadow of God on earth. All should seek shelter under the shadow of his justice, and rest in the shade of his favour. This is not a matter which is either specific or limited in its scope, that it might be restricted to one or another person, inasmuch as the shadow telleth of the One Who casteth it. God, glorified be His remembrance, hath called Himself the Lord of the worlds, for He hath nurtured and still nurtureth everyone. Glorified be, then, His grace that hath preceded all created things, and His mercy that hath surpassed the worlds.

It is clear and evident that, whether this Cause be seen as right or wrong by the people, those who are associated with its name have accepted and embraced it as true, and have forsaken their all in their eagerness to partake of the things of God. That they should evince such renunciation in the path of the love of the All‑Merciful is in itself a faithful witness and an eloquent testimony to the truth of their convictions. Hath it ever been witnessed that a man of sound judgement should sacrifice his life without cause or reason? And if it be suggested that this people have taken leave of their senses, this too is highly improbable, inasmuch as such behaviour hath not been confined to merely a soul or two—nay, a vast multitude of every class have drunk their fill of the living waters of divine knowledge, and, intoxicated, have hastened with heart and soul to the field of sacrifice in the way of the Beloved.

If these souls, who have renounced all else but God for His sake and offered up their life and substance in His path, are to be accounted as false, then by what proof and testimony can the truth of what others assert be established in thy presence? The late Ḥájí Siyyid Muḥammad—may God exalt his station and immerse him in the ocean of His forgiveness and mercy!—was one of the most learned divines of his age, and one of the most devout and pious men of his time. So highly was he regarded that his praise was on every tongue, and his righteousness and piety were universally acknowledged. Yet, when hostilities broke out with Russia, he who himself had pronounced the decree of holy war, and who with blazoned standard had left his native land to rally to the support of his faith, abandoned, after the inconvenience of a brief encounter, all the good that he had purposed, and returned whence he had come. Would that the veil might be lifted, and that which hath ere now remained hidden from the eyes of men be made manifest!

For more than twenty years this people have, day and night, been subjected to the fury of the Sovereign’s wrath, and have been scattered by the tempestuous gales of his displeasure, each to a different land. How many the children who have been left fatherless, and how many the fathers who have lost their sons! How many the mothers who have dared not, out of fear and dread, to mourn their slaughtered offspring! How numerous those who, at eventide, were possessed of utmost wealth and affluence, and who, when morning came, had fallen into utter abasement and destitution! No land is there whose soil hath not been tinged with their blood, nor reach of heaven unto which their sighs have not ascended. Throughout the years the darts of affliction have unceasingly rained down from the clouds of God’s decree, yet despite all these calamities and tribulations, the flame of divine love hath so blazed in their hearts that even should their bodies be torn asunder they would not forsake their love of Him Who is the Best‑Beloved of the worlds, but would welcome with heart and soul whatever might befall them in the path of God.

O King! The breezes of the grace of the All‑Merciful have transformed these servants and attracted them unto His Holy Court. “The witness of a true lover is upon his sleeve.” Nevertheless, some of the outwardly learned have troubled the luminous heart of the King of the Age concerning these souls who revolve round the Tabernacle of the All‑Merciful and who seek to attain the Sanctuary of true knowledge. Would that the world‑adorning wish of His Majesty might decree that this Servant be brought face to face with the divines of the age, and produce proofs and testimonies in the presence of His Majesty the Sháh! This Servant is ready, and taketh hope in God, that such a gathering may be convened in order that the truth of the matter may be made clear and manifest before His Majesty the Sháh. It is then for thee to command, and I stand ready before the throne of thy sovereignty. Decide, then, for Me or against Me.

The All‑Merciful saith in the Qur’án, His abiding testimony unto all the peoples of the world: “Wish ye then for death, if ye be men of truth.” Behold how He hath declared the yearning for death to be the touchstone of sincerity! And, in the luminous mirror of thy judgement, it is doubtless clear and evident which people have chosen, in this day, to lay down their lives in the path of the Beloved of the worlds. Indeed, were the books supporting the beliefs of this people to be written with the blood spilled in the path of God—exalted be His glory!—then countless volumes would have already appeared amongst men for all to see.

How, We fain would ask, is it possible to impugn this people whose deeds are in conformity with their words, and to give credence instead to those who have refused to relinquish one jot of their worldly authority in the path of Him Who is the Unconstrained? Some of the divines who have declared this Servant an infidel have at no time met with Me. Never having seen Me, or become acquainted with My purpose, they have nevertheless spoken as they pleased and acted as they desired. Yet every claim requireth a proof, not mere words and displays of outward piety.

In this connection the text of several passages from the Hidden Book of Fáṭimih—the blessings of God be upon her!—which are relevant to the present theme will be cited in the Persian tongue, that certain matters which have ere now been hidden may be revealed before thy presence. The people addressed in the aforementioned Book, which is today known as the Hidden Words, are those who, though outwardly known for learning and piety, are inwardly the slaves of self and passion.

He saith: “O ye that are foolish, yet have a name to be wise! Wherefore do ye wear the guise of shepherds, when inwardly ye have become wolves, intent upon My flock? Ye are even as the star, which riseth ere the dawn, and which, though it seem radiant and luminous, leadeth the wayfarers of My city astray into the paths of perdition.”

And likewise He saith: “O ye seeming fair yet inwardly foul! Ye are like clear but bitter water, which to outward seeming is crystal pure but of which, when tested by the Divine Assayer, not a drop is accepted. Yea, the sunbeam falls alike upon the dust and the mirror, yet differ they in reflection even as doth the star from the earth: nay, immeasurable is the difference!”

And also He saith: “O essence of desire! At many a dawn have I turned from the realms of the Placeless unto thine abode, and found thee on the bed of ease busied with others than Myself. Thereupon, even as the flash of the spirit, I returned to the realms of celestial glory, and breathed it not in My retreats above unto the hosts of holiness.”

And again He saith: “O bondslave of the world! Many a dawn hath the breeze of My loving‑kindness wafted over thee and found thee upon the bed of heedlessness fast asleep. Bewailing then thy plight it returned whence it came.”

Therefore, in the exercise of the royal justice, it is not sufficient to give ear to the claimant alone. God saith in the Qur’án, the unerring Balance that distinguisheth truth from falsehood: “O ye who believe! If a wicked man come to you with news, clear it up at once, lest through ignorance ye harm others, and afterward repent of what ye have done.” The holy Traditions, moreover, contain the admonition: “Believe not the tale‑bearer.” Certain of the divines, who have never seen Us, have misconceived the nature of Our Cause. Those, however, who have met Us will testify that this Servant hath not spoken save in accordance with that which God hath commanded in the Book, and that He hath called attention to the following blessed verse—exalted be His Word: “Do ye not disavow us only because we believe in God and in what He hath sent down unto us, and in what He had sent down aforetime?”

O King of the age! The eyes of these refugees are turned towards and fixed upon the mercy of the Most Merciful. No doubt is there whatever that these tribulations will be followed by the outpourings of a supreme mercy, and these dire adversities will be succeeded by an overflowing prosperity. We fain would hope, however, that His Majesty the Sháh will himself examine these matters and bring hope to the hearts. That which We have submitted to thy Majesty is indeed for thine highest good. And God, verily, is a sufficient witness unto Me.

Glorified art Thou, O Lord My God! I bear witness that the heart of the King is in truth between the fingers of Thy might. If it be Thy wish, do Thou incline it, O My God, in the direction of charity and mercy. Thou, verily, art the Almighty, the Most Exalted, the Most Bountiful. No God is there besides Thee, the All‑Glorious, the One Whose help is sought by all.

Concerning the prerequisites of the learned, He saith: “Whoso among the learned guardeth his self, defendeth his faith, opposeth his desires, and obeyeth his Lord’s command, it is incumbent upon the generality of the people to pattern themselves after him. . . .” Should the King of the Age reflect upon this utterance which hath streamed from the tongue of Him Who is the Dayspring of the Revelation of the All‑Merciful, he would perceive that those who have been adorned with the attributes enumerated in this holy Tradition are scarcer than the philosopher’s stone; wherefore not every man that layeth claim to knowledge deserveth to be believed.

Again concerning the divines of the Latter Days, He saith: “The religious doctors of that age shall be the most wicked of the divines beneath the shadow of heaven. Out of them hath mischief proceeded, and unto them it shall return.” And again He saith: “When the Standard of Truth is made manifest, the people of both the East and the West curse it.” Should anyone dispute these Traditions, this Servant will undertake to establish their validity, since the details of their transmission have been omitted here for the sake of brevity.

Those doctors who have indeed drunk of the cup of renunciation have never interfered with this Servant. Thus, for example, Shaykh Murtaḍá—may God exalt his station and cause him to repose beneath the canopy of His grace!—showed forth kindness during Our sojourn in ‘Iráq, and never spoke of this Cause otherwise than as God hath given leave. We beseech God to graciously assist all to do His will and pleasure.

Now, however, all have lost sight of every other consideration, and are bent upon the persecution of this people. Thus, if it be inquired of certain persons who, by the grace of their Lord, repose beneath the shadow of thy royal mercy and enjoy countless favours, “What service have ye rendered in return for these royal favours? Have ye through wise policy annexed a further territory to the realm? Have ye applied yourselves to aught that would secure the welfare of the people, the prosperity of the kingdom, and the lasting glory of the state?”, they will have no other reply than to designate, justly or falsely, a group of people before thy royal presence as Bábís, and forthwith to engage in massacre and pillage. In Tabríz, for instance, and in the Egyptian town of Manṣúríyyih, a number of this people were ransomed and large sums were seized, yet no account of these matters was ever made in the court of thy presence.

The reason for which all these things have come to pass is that their persecutors, finding these unfortunate ones without protection, have forgone more weighty matters and occupied themselves instead with harassing this afflicted people. Numerous confessions and divers creeds abide peacefully beneath the shadow of thy sovereignty. Let this people be also numbered with them. Nay, those who serve the King should be animated by such lofty aims and sublime intentions as to continually strive to bring all religions beneath the shelter of his shadow, and to rule over them with perfect justice.

To enforce the laws of God is naught but justice, and is the source of universal content. Nay more, the divine statutes have always been, and will ever remain, the cause and instrument of the preservation of mankind, as witnessed by His exalted words: “In punishment will ye find life, O men of insight!” It would, however, ill beseem the justice of thy Majesty that for the trespass of a single soul a whole group of people should be subjected to the scourge of thy wrath. The one true God—glorified be His Name!—hath said: “None shall bear the burden of another.” It is clear and evident that in every community there have been, and will ever be, the learned and the ignorant, the wise and the heedless, the profligate and the pious. That a wise and reflecting soul should commit a heinous deed is most improbable, inasmuch as such a person either seeketh after this world or hath forsaken it: If he be of the latter, he would assuredly have no regard for aught else besides God, and moreover the fear of God would deter him from unlawful and reprehensible actions; and if he be of the former, he would just as assuredly avoid such deeds as would alienate and alarm the people, and act in such a manner as to earn their confidence and trust. It is therefore evident that reprehensible actions have always emanated, and will ever emanate, from ignorant and foolish souls. We implore God to guard His servants from turning to anyone save Him, and to draw them nigh unto His presence. His might, in truth, is equal to all things.

Praise be unto Thee, O Lord My God! Thou hearest the voice of My lamentation, and beholdest My condition, My distress and affliction! Thou knowest all that is in Me. If the call I have raised be wholly for Thy sake, then draw thereby the hearts of Thy creatures towards the heaven of Thy knowledge, and the heart of the Sovereign towards the right hand of the throne of Thy name, the All‑Merciful. Supply him then, O My God, with a portion of that goodly sustenance which hath descended from the heaven of Thy generosity and the clouds of Thy mercy, that he may forsake his all and turn unto the court of Thy favour. Aid him, O My God, to assist Thy Cause and to exalt Thy Word amidst Thy creatures. Strengthen him, then, with the hosts of the seen and the unseen, that he may subdue every city in Thy Name, and hold sway, through Thy sovereignty and might, over all that dwell on earth, O Thou in Whose hand is the kingdom of creation! Thou, verily, art the Supreme Ordainer in both the beginning and the end. No God is there but Thee, the Most Powerful, the All‑Glorious, the All‑Wise.

So grossly hath Our Cause been misrepresented before thy royal presence that, if some unseemly act be committed by but one of this people, it is portrayed as being prompted by their beliefs. By Him besides Whom there is none other God! This Servant hath refused even to sanction the commission of reproved actions, how much less those which have been explicitly prohibited in the Book of God.

God hath forbidden unto men the drinking of wine, and this prohibition hath been revealed and recorded in His Book. In spite of this, and of the fact that the learned doctors of the age—may God increase their numbers!—have all prohibited the people from such a wretched act, there still remain some who commit it. The punishment which this act entaileth, however, applieth only to its heedless perpetrators, whilst those noble manifestations of supreme sanctity remain exalted above and exempt from all blame. Yea, the whole creation, both seen and unseen, beareth witness unto their holiness.

Yea, these servants regard the one true God as He Who “doeth as He willeth” and “ordaineth as He pleaseth”. Thus they view not as impossible the continued appearance in the contingent world of the Manifestations of His Unity. Should anyone hold otherwise, how would he be different from those who believe the hand of God to be “chained up”? And if the one true God—glorified be His mention!—be indeed regarded as unconstrained, then whatever Cause that Ancient King may please to manifest from the wellspring of His Command must be embraced by all. No refuge is there for anyone and no haven to hasten unto save God; no protection is there for any soul and no shelter to seek except in Him.

The essential requirement for whoso advanceth a claim is to support his assertions with clear proofs and testimonies. Beyond this, the rejection of the people, whether learned or ignorant, hath never been, nor shall it ever be, of any consequence. The Prophets of God, those Pearls of the ocean of Divine Unity and the Repositories of Divine Revelation, have ever been the object of men’s repudiation and denial. Even as He saith: “Each nation hath plotted darkly against their Messenger to lay violent hold on Him, and disputed with vain words to invalidate the truth.” And again: “No Messenger cometh unto them but they laugh Him to scorn.”

Consider the dispensation of Him Who is the Seal of the Prophets and the King of the Chosen Ones—may the souls of all mankind be offered up for His sake! After the Daystar of Truth dawned above the horizon of Ḥijáz, how great were the cruelties which the exponents of error inflicted upon that incomparable Manifestation of the All‑Glorious! Such was their heedlessness that they regarded every injury inflicted upon that sacred Being as ranking among the greatest of all acts, and constituting a means of attainment unto God, the Most High. For in the early years of His mission the divines of that age, both Christian and Jewish, turned away from that Daystar of the heaven of glory, whereupon all people, high and low alike, bestirred themselves to extinguish the light of that Luminary of the horizon of inner meanings. The names of all these divines have been mentioned in the books of old; among them are Wahb ibn‑i‑Ráhib, Ka‘b ibn‑i‑Ashraf, ‘Abdu’lláh‑i‑Ubayy, and others of their like.

Finally, matters came to such a pass that these men took counsel together and conspired to shed His pure blood, even as God—glorified be His mention!—saith: “And remember when the disbelievers schemed against Thee, that they might lay hold upon Thee, or slay Thee, or cast Thee out; and so they schemed, and God schemed, and God, verily, is the best of schemers.” Again He saith: “But if their opposition be grievous to Thee—if Thou canst, seek out an opening into the earth or a ladder into heaven and bring to them a sign; yet if God wished, He could gather them unto true guidance; be Thou not, then, of the ignorant.” By God! The hearts of His favoured ones are consumed at the purport of these two blessed verses. Such established and undisputed facts have been forgotten, and no one hath paused to reflect, in days past or in this day, upon the things that have prompted men to turn away from the Revealers of the light of God at the time of their manifestation.

Likewise, before the appearance of the Seal of the Prophets, consider Jesus, the Son of Mary. When that Manifestation of the All‑Merciful revealed Himself, all the divines charged that Quintessence of faith with impiety and rebellion. Eventually, with the sanction of Annas, the most learned of the divines of His day, and Caiaphas, the high priest, His blessed person was made to suffer that which the pen is ashamed to mention and powerless to describe. The wide world in all its vastness could no longer contain Him, until at last God raised Him up unto heaven.

Were a detailed account of all the Prophets to be given here, We fear that it might lead to weariness. The doctors of the Torah in particular assert that no independent Prophet will come after Moses with a new Law. They maintain that a Scion of the House of David shall be made manifest Who will promulgate the Law of the Torah, and help establish and enforce its commandments throughout the East and the West.

The followers of the Gospel, likewise, hold as impossible that the Bearer of a new Revelation should again shine forth from the dayspring of the Will of God after Jesus, Son of Mary—peace be upon Him! In support of this contention, they adduce the following verse from the Gospel: “Heaven and earth shall pass away, but the words of the Son of Man shall never pass away.” They maintain that neither the teachings nor the commandments of Jesus—peace be upon Him!—may ever be altered.

At one point in the Gospel, He saith: “I go away, and come again.” Again in the Gospel of John, He hath foretold the advent of a Comforter who shall come after Him. In the Gospel of Luke, moreover, a number of signs and portents have been mentioned. Certain divines of that Faith, however, have interpreted these utterances after their own fancy, and have thus failed to grasp their true significance.

O would that thou wouldst permit Me, O Sháh, to send unto thee that which would cheer the eyes, and tranquillise the souls, and persuade every fair‑minded person that with Him is the knowledge of the Book. Certain persons, incapable of answering the objections raised by their opponents, claim that the Torah and the Gospel have been corrupted, whereas in reality the references to such corruption pertain only to specific cases. But for the repudiation of the foolish and the connivance of the divines, I would have uttered a discourse that would have thrilled and carried away the hearts unto a realm from the murmur of whose winds can be heard: “No God is there but He!” For the present, however, since the season is not ripe, the tongue of My utterance hath been stilled and the wine of exposition sealed up until such time as God, through the power of His might, shall please to unseal it. He, verily, is the Almighty, the Most Powerful.

Praise be unto Thee, O Lord My God! I ask Thee by Thy Name, through which Thou hast subdued all who are in the heavens and all who are on the earth, to protect the lamp of Thy Cause within the globe of Thine omnipotence and Thy bountiful favour, lest it be exposed to the blasts of denial from those who remain heedless of the mysteries of Thy name, the Unconstrained. Increase, then, by the oil of Thy wisdom, the radiance of its light. Thou, verily, hast power over all the dwellers of Thine earth and of Thy heaven.

I implore Thee, O My Lord, by that most exalted Word which hath struck terror into the hearts of all who are in the heavens and on the earth, save only those who have taken fast hold of Thy Sure Handle, not to abandon Me amidst Thy creatures. Lift Me up, then, unto Thyself, cause Me to enter beneath the shadow of Thy mercy, and give Me to drink of the pure wine of Thy providence, that I may dwell within the tabernacle of Thy majesty and beneath the canopy of Thy favour. Potent art Thou to do what pleaseth Thee. Thou, verily, art the Help in Peril, the Self‑Subsisting.

O King! The lamps of equity have been extinguished, and the fire of tyranny hath so blazed on every side that My people have been led as captives from Zawrá’ to Mosul, known as Ḥadbá’. This is not the first outrage that hath been suffered in the path of God. It behoveth every soul to consider and call to mind that which befell the kindred of the Prophet when the people took them captive and brought them unto Damascus, known as Fayḥá’. Amongst them was the prince of them that worship God, the mainstay of such as have drawn nigh unto Him, and the sanctuary of those who long for His presence—may the life of all else be a sacrifice unto him!

They were asked: “Are ye of the party of the Seceders?” He replied: “Nay, by the Lord Almighty. We are but servants who have believed in God and in His verses. Through us the countenance of faith hath beamed with joy. Through us the sign of the All‑Merciful hath shone forth. At the mention of our names the desert of Baṭḥá hath overflowed with water and the darkness separating earth and heaven hath been dispelled.”

“Have ye forbidden”, they were asked, “that which God hath made lawful, or allowed that which He hath forbidden?” “We were the first to follow the divine commandments”, he answered. “We are the root and origin of His Cause, the beginning of all good and its end. We are the sign of the Ancient of Days and the source of His remembrance amongst the nations.”

They were asked: “Have ye forsaken the Qur’án?” “In our House”, he replied, “did the All‑Merciful reveal it. We are the breezes of the All‑Glorious amidst His creation. We are the streams that have branched out from the Most Great Ocean, through which God hath revived the earth, and through which He shall revive it again after it hath died. Through us His signs have been diffused, His proofs revealed, and His tokens disclosed. With us is the knowledge of His hidden meanings and His untold mysteries.”

“For what crime have ye been punished?” they were asked. “For our love of God”, he made reply, “and for our detachment from aught else save Him.”

We have not related his exact words—peace be upon him!—but rather have We imparted a sprinkling from that ocean of life eternal that lieth enshrined within them, that those who hearken thereunto may be quickened and made aware of what hath befallen the trusted ones of God at the hands of a lost and wayward generation. We see the people in this day censuring the oppressors of bygone ages, whilst they themselves commit yet greater wrongs and know it not!

God beareth Me witness that My purpose hath not been to foment sedition, but to purify His servants from whatsoever hath prevented them from drawing nigh unto Him, the Lord of the Day of Reckoning. I was asleep upon My couch, when lo, the breezes of My Lord, the All‑Merciful, passed over Me, awoke Me from My slumber, and bade Me lift up My voice betwixt earth and heaven. This thing is not from Me, but from God. Unto this testify the dwellers of His Dominion and of His Kingdom, and the inhabitants of the cities of His unfading glory. By Him Who is the Truth! I fear no tribulation in His path, nor any affliction in My love for Him and in the way of His good pleasure. Verily God hath made adversity as a morning dew upon His green pasture, and a wick for His lamp which lighteth earth and heaven.

Shall a man’s wealth endure forever, or protect him from the One Who shall, erelong, seize him by his forelock? Gazing upon those who sleep beneath the gravestones, embosomed in the dust, could one ever distinguish the sovereign’s crumbling skull from the subject’s mouldering bones? Nay, by Him Who is the King of kings! Could one discern the lord from the vassal, or those that enjoyed wealth and riches from those who possessed neither shoes nor mat? By God! Every distinction hath been erased, save only for those who upheld the right and who ruled with justice.

Whither are gone the learned men, the divines and potentates of old? What hath become of their discriminating views, their shrewd perceptions, their subtle insights and sage pronouncements? Where are their hidden coffers, their flaunted ornaments, their gilded couches, their rugs and cushions strewn about? Gone forever is their generation! All have perished, and, by God’s decree, naught remaineth of them but scattered dust. Exhausted is the wealth they gathered, dispersed the stores they hoarded, dissipated the treasures they concealed. Naught can now be seen but their deserted haunts, their roofless dwellings, their uprooted tree‑trunks, and their faded splendour. No man of insight will let wealth distract his gaze from his ultimate objective, and no man of understanding will allow riches to withhold him from turning unto Him Who is the All‑Possessing, the Most High.

Where is he who held dominion over all whereon the sun shineth, who lived extravagantly on earth, seeking out the luxuries of the world and of all that hath been created upon it? Where is the commander of the swarthy legion and the upraiser of the golden standard? Where is the ruler of Zawrá’, and where the tyrant of Fayḥá’? Where are those before whose munificence the treasure‑houses of the earth shrank in shame, and at whose largesse and swelling spirit the very ocean was abashed? Where is he who stretched forth his arm in rebellion, and who turned his hand against the All‑Merciful?

Where are they who went in quest of earthly pleasures and the fruits of carnal desires? Whither are fled their fair and comely women? Where are their swaying branches, their spreading boughs, their lofty mansions, their trellised gardens? And what of the delights of these gardens—their exquisite grounds and gentle breezes, their purling streams, their soughing winds, their cooing doves and rustling leaves? Where now are their resplendent morns and their brightsome countenances wreathed in smiles? Alas for them! All have perished and are gone to rest beneath a canopy of dust. Of them one heareth neither name nor mention; none knoweth of their affairs, and naught remaineth of their signs.

What! Will the people dispute then that whereof they themselves stand witness? Will they deny that which they know to be true? I know not in what wilderness they roam! Do they not see that they are embarked upon a journey from which there is no return? How long will they wander from mountain to valley, from hollow to hill? “Hath not the time come for those who believe to humble their hearts at the mention of God?” Blessed is he who hath said, or now shall say, “Yea, by my Lord! The time is come and the hour hath struck!”, and who, thereafter, shall detach himself from all that hath been, and deliver himself up entirely unto Him Who is the Possessor of the universe and the Lord of all creation.

And yet, what hope! For naught is reaped save that which hath been sown, and naught is taken up save that which hath been laid down, unless it be through the grace and bestowal of the Lord. Hath the womb of the world yet conceived one whom the veils of glory shall not hinder from ascending unto the Kingdom of his Lord, the All‑Glorious, the Most High? Is it yet within us to perform such deeds as will dispel our afflictions and draw us nigh unto Him Who is the Causer of causes? We beseech God to deal with us according to His bounty, and not His justice, and to grant that we may be of those who have turned their faces unto their Lord and severed themselves from all else.

I have seen, O Sháh, in the path of God what eye hath not seen nor ear heard. Mine acquaintances have repudiated Me, and My pathways have been straitened. The fount of well‑being hath run dry, and the bower of ease hath withered. How numerous the tribulations which have rained, and will soon rain, upon Me! I advance with My face set towards Him Who is the Almighty, the All‑Bounteous, whilst behind Me glideth the serpent. Mine eyes have rained down tears until My bed is drenched.

I sorrow not for Myself, however. By God! Mine head yearneth for the spear out of love for its Lord. I never passed a tree, but Mine heart addressed it saying: “O would that thou wert cut down in My name, and My body crucified upon thee, in the path of My Lord!”, for I see the people wandering distraught and unconscious in their drunken stupor. They have raised on high their passions and set down their God. Methinks they have taken His Cause for a mockery and regard it as a play and pastime, believing all the while that they do well, and that they dwell securely in the citadel of safety. Howbeit the matter is not as they fondly imagine: Tomorrow shall they behold that which today they are wont to deny!

Erelong shall the exponents of wealth and power banish Us from the land of Adrianople to the city of ‘Akká. According to what they say, it is the most desolate of the cities of the world, the most unsightly of them in appearance, the most detestable in climate, and the foulest in water. It is as though it were the metropolis of the owl, within whose precincts naught can be heard save the echo of its cry. Therein have they resolved to imprison this Youth, to shut against our faces the doors of ease and comfort, and to deprive us of every worldly benefit throughout the remainder of our days.

By God! Though weariness lay Me low, and hunger consume Me, and the bare rock be My bed, and My fellows the beasts of the field, I will not complain, but will endure patiently as those endued with constancy and firmness have endured patiently, through the power of God, the Eternal King and Creator of the nations, and will render thanks unto God under all conditions. We pray that, out of His bounty—exalted be He—He may release, through this imprisonment, the necks of men from chains and fetters, and cause them to turn, with sincere faces, towards His face, Who is the Mighty, the Bounteous. Ready is He to answer whosoever calleth upon Him, and nigh is He unto such as commune with Him. We further beseech Him to make of this darksome tribulation a shield for the Temple of His Cause, and to protect it from the assault of sharpened swords and pointed daggers. Adversity hath ever given rise to the exaltation of His Cause and the glorification of His Name. Such hath been God’s method carried into effect in centuries and ages past. That which the people now fail to apprehend they shall erelong discover, on that day when their steeds shall stumble and their finery be folded up, their blades blunted and their feet made to falter.

I know not how long they shall spur on the charger of self and passion and rove in the wilderness of error and negligence! Shall either the pomp of the mighty or the wretchedness of the abased endure? Shall he who reposeth upon the loftiest seat of honour, who hath attained the pinnacle of might and glory, abide forever? Nay, by My Lord, the All‑Merciful! All on earth shall pass away, and there remaineth alone the face of My Lord, the All‑Glorious, the Most Bountiful.

What armour hath not been pierced by the arrow of destruction, and what regal brow not divested by the hand of Fate? What fortress hath withstood the approach of the Messenger of Death? What throne hath not been shattered to pieces, what palace not reduced to rubble? Could the people but taste that choice Wine of the mercy of their Lord, the Almighty, the All‑Knowing, which lieth in store for them in the world beyond, they would assuredly cease their censure, and seek only to win the good pleasure of this Youth. For now, however, they have hidden Me behind a veil of darkness, whose fabric they have woven with the hands of idle fancy and vain imagination. Erelong shall the snow‑white hand of God rend an opening through the darkness of this night and unlock a mighty portal unto His City. On that Day shall the people enter therein by troops, uttering what the blamers aforetime exclaimed, that there shall be made manifest in the end that which appeared in the beginning.

Is it their wish to tarry here when already they have one foot in the stirrup? Look they to return, once they are gone? Nay, by Him Who is the Lord of Lords! save on the Day of Judgement, the Day whereon the people shall arise from their graves and be asked of their legacy. Well is it with him who shall not be weighted down with his burdens on that Day, the Day whereon the mountains shall pass away and all shall gather to be questioned in the presence of God, the Most Exalted. Stern, indeed, is He in punishing!

We beseech God to purge the hearts of certain divines from rancour and enmity, that they may look upon matters with an eye unbeclouded by contempt. May He raise them up unto so lofty a station that neither the attractions of the world, nor the allurements of authority, may deflect them from gazing upon the Supreme Horizon, and that neither worldly benefits nor carnal desires shall prevent them from attaining that Day whereon the mountains shall be reduced to dust. Though they now rejoice in the adversity that hath befallen Us, soon shall come a day whereon they shall lament and weep. By My Lord! Were I given the choice between, on the one hand, the wealth and opulence, the ease and comfort, the honour and glory which they enjoy, and, on the other, the adversities and trials which are Mine, I would unhesitatingly choose My present condition and would refuse to barter a single atom of these hardships for all that hath been created in the world of being.

But for the tribulations that have touched Me in the path of God, life would have held no sweetness for Me, and Mine existence would have profited Me nothing. For them who are endued with discernment, and whose eyes are fixed upon the Sublime Vision, it is no secret that I have been, most of the days of My life, even as a slave, sitting under a sword hanging on a thread, knowing not whether it would fall soon or late upon him. And yet, notwithstanding all this We render thanks unto God, the Lord of the worlds, and yield Him praise at all times and under all conditions. He, verily, standeth witness over all things.

We beseech God to extend wide His shadow, that the true believers may hasten thereunto and that His sincere lovers may seek shelter therein. May He bestow upon men blossoms from the bowers of His grace and stars from the horizon of His providence. We pray God, moreover, to graciously aid the King to do His will and pleasure, and to confirm him in that which shall draw him nigh unto the Dayspring of God’s most excellent names, so that he may not give countenance to the injustice he witnesseth, may look upon his subjects with the eye of loving‑kindness, and shield them from oppression. We further beseech God, exalted be He, to gather all mankind around the Gulf of the Most Great Ocean, an ocean every drop of which proclaimeth that He is the Harbinger of joy unto the world and the Quickener of all its peoples. Praise be to God, the Lord of the Day of Reckoning!

And finally We beseech God, exalted be His glory, to enable thee to aid His Faith and turn towards His justice, that thou mayest judge between the people even as thou wouldst judge between thine own kindred, and mayest choose for them that which thou choosest for thine own self. He, verily, is the All‑Powerful, the Most Exalted, the Help in Peril, the Self‑Subsisting.`,
      ],
    ],
    "twelve-table-talks-abdul-baha": [
      removeAfter("Notes"),
      [
        "Twelve Table Talks given by ‘Abdu’l‑Bahá in ‘Akká",
        "Twelve Table Talks in ‘Akká",
      ],
      title("", "Twelve Table Talks in ‘Akká", {
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
      prefix(/^Herein Follow the Tablets/m, "^ "),
      prefix(/^He Is God/m, "^ "),
      prefix(/^He Is the Witness/m, "^ "),
      ["of the slanderer affect not", "of the slanderer affects not"],
      ["flight into the Celestial", "flight unto the Celestial"],
      ["guidance of the Exalted", "guidance of His Holiness, the Exalted"],
      ["seest all things weeping me", "seest all things weeping over me"],
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
      [/^‘Alí‑Akbar\.$/m, ""],
      [/^Revealed for the recipient on the occasion.*/m, ""],
      title("", "Additional Prayers Revealed by ‘Abdu’l‑Bahá", {
        author: "‘Abdu’l‑Bahá",
        years: authorYears["‘Abdu’l‑Bahá"],
        type: "Prayer",
        collection: true,
      }),
      [/^—‘Abdu’l‑Bahá$/gm, ""],
      [/\*\*\*/gm, "#"],
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
        date: "25 December 1938",
      }),
      prefix(/^To the beloved of God and/m, "* "),
      prefix(/^Best‑beloved brothers and/m, "* "),
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
      ["and on earth, suffice", "and on the earth, suffice"],
      ["resplendent Spot. Be not", "resplendent Spot. . . . Be not"],
      [
        "The eye of God’s loving‑kindness will be turned towards it, and it shall become the manifestation of the favours of the All‑Glorious.",
        "It shall become the object of the glance of Providence, and shall show forth the bounties of the All‑Glorious.",
      ],
      [
        "upon thee, and be thou of them that truly believe. And should anyone reject thy offer, turn thou away from him, and put thy trust and confidence in the Lord of all worlds.",
        "unto thee, and be thou of them that truly believe. And should anyone reject thine offer, turn thou away from him, and put thy trust and confidence in the Lord, thy God, the Lord of all worlds. . . .",
      ],
      ["how my soul gloweth", "how my soul glows"],
      ["is propagated throughout", "is propagated through"],
      ["fail to “propagate through", "fail to propagate “through"],
      [
        "If the veil be lifted, and the full glory of the station of those who have turned wholly towards God, and in their love for Him renounced the world, be made manifest, the entire creation would be dumbfounded.",
        "If the veil were lifted, and the full glory of the station of those that have turned wholly towards God, and have, in their love for Him, renounced the world, were made manifest, the entire creation would be dumbfounded.",
      ],
      ["on earth, and the glory of the", "on the earth, and the glory of the"],
      [
        "unity of mankind. May it be the first to unfurl",
        "universality of mankind. May it be the first to upraise",
      ],
      ["For America hath developed", "For America has developed"],
      [
        "The American nation is equipped and empowered to accomplish that which will adorn the pages of history, to become the envy of the world, and be blest in both the East and the West for the triumph of its people.",
        "This American nation is equipped and empowered to accomplish that which will adorn the pages of history, to become the envy of the world and be blest in the East and the West for the triumph of its democracy.",
      ],
      [
        "blest in the East and the West for the triumph of its democracy",
        "blest in both the East and the West for the triumph of its people",
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
            return `## May 1922 (Undated)\nyears=[1922.0501,1922.0501]`;
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
          return `## ${dd} ${mm} ${yy}\nyears=[${date},${date}]`;
        },
      ],
      [/Circa May, 1922 \(undated\)\./g, ""],
      [/^.*19\d\d\.?\n+#/gm, "#"],
      [/^.*19\d\d\.?\n+P\.S\./gm, "P.S."],
      ["April 11, 1933.", ""],
      [/\]\n+(T.*)\n+(.*)/g, (_, a, b) => `]\n\n* ${a}\n\n* ${b}`],
      [/\]\n+([A-Z].*)/g, (_, a) => `]\n\n* ${a}`],
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
      ["standard of His domination", "standard of His Dominion"],
      [
        "Gradually whatsoever is latent in the innermost of this Holy Cycle shall",
        "Whatsoever is latent in the innermost of this Holy Cycle shall gradually",
      ],
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
          return `## ${dd} ${mm} ${yy}\nyears=[${date},${date}]\nsummary="${b}"`;
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
      ["in diverse theatres and in", "in divers theatres and in"],
      ["how my soul gloweth", "how my soul glows"],
      ["Kazakhstan, Macao Island", "Kazakhstan, Macau Island"],
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
      ["revealed in the Bayán is but", "exalted in the Bayán is but as"],
      [
        "unity of mankind. May it be the first to unfurl",
        "universality of mankind. May it be the first to upraise",
      ],
      ["even as a loadstone", "even as a lodestone"],
    ],
    "promised-day-come": [
      ["By Shoghi Effendi", ""],
      ["Shoghi", ""],
      ["The Promised Day is Come", ""],
      removeAfter("Haifa, Palestine March 28, 1941"),
      title("", "The Promised Day Is Come", {
        author: "Shoghi Effendi",
        years: [1941, 1941],
        date: "28 March 1941",
      }),
      [/^[A-Z].{1,80}[a-z?]$/gm, (a) => `# ${a}`],
      ["# The Promised Day Is Come", "The Promised Day Is Come"],
      prefix(/^Friends and fellow‑heirs/m, "* "),
      [
        "“Movements,” is the warning sounded by ‘Abdu’l‑Bahá, “newly born and worldwide in their range, will exert their utmost effort for the advancement of their designs. The Movement of the Left will acquire great importance. Its influence will spread.”",
        "“Modern universal movements,” is the warning sounded by ‘Abdu’l‑Bahá, “will do their utmost to carry out their purpose and intentions. The Movement of the Left will acquire great importance, and its influence will spread.”",
      ],
      ["century of light—has been", "century of light—hath been"],
      ["guise of the shepherd", "guise of shepherds"],
      ["fixed a time for you, O people!", "a fixed time for you, O people."],
      [
        "Let not a man glory in that he loves his country; let him rather glory in this, that he loves his kind.",
        "Let not man glory in this that he loveth his country, let him rather glory in this that he loveth his kind.",
      ],
      [/and you shall have another/g, "and ye shall have another"],
      [
        "may become the upholders of one order",
        "become the upholders of one Order",
      ],
      ["He to answer whosover calleth", "He to answer whosoever calleth"],
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
          return `# ${dd} ${mm} ${yy}\nyears=[${date},${date}]\nsummary="${a.slice(
            2
          )}"${b || ""}`;
        },
      ],
      prefix(/^Message to/gm, "* "),
      ["hope which ‘Abdu’l‑Bahá", "hope, therefore, which ‘Abdu’l‑Bahá"],
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
      [
        "\nThe World Order of Bahá’u’lláh",
        '\n# The World Order of Bahá’u’lláh\ndate="27 February 1929"',
      ],
      [
        "\nThe World Order of Bahá’u’lláh: Further Considerations",
        '\n# The World Order of Bahá’u’lláh: Further Considerations\ndate="21 March 1930"',
      ],
      [
        "\nThe Goal of a New World Order",
        '\n# The Goal of a New World Order\ndate="28 November 1931"',
      ],
      [
        "\nThe Golden Age of the Cause of Bahá’u’lláh",
        '\n# The Golden Age of the Cause of Bahá’u’lláh\ndate="21 March 1932"',
      ],
      [
        "\nAmerica and the Most Great Peace",
        '\n# America and the Most Great Peace\ndate="21 April 1933"',
      ],
      [
        "\nThe Dispensation of Bahá’u’lláh",
        '\n# The Dispensation of Bahá’u’lláh\ndate="8 February 1934"',
      ],
      title("##", "Bahá’u’lláh"),
      title("##", "The Báb"),
      title("##", "‘Abdu’l‑Bahá"),
      title("##", "The Administrative Order"),
      [
        "\nThe Unfoldment of World Civilisation",
        '\n# The Unfoldment of World Civilisation\ndate="11 March 1936"',
      ],
      [/^[A-Z].{1,80}[a-z]$/gm, (a) => `## ${a}`],
      ["## The World Order of Bahá’u’lláh", "The World Order of Bahá’u’lláh"],
      [/^.*19\d\d\.?\n+#/gm, "#"],
      ["March 11, 1936.", ""],
      [/"\n+(T.*)\n+(.*)/g, (_, a, b) => `"\n\n* ${a}\n\n* ${b}`],
      [/^(To the beloved.*)\n+(.*)/m, (_, a, b) => `* ${a}\n\n* ${b}`],
      prefix(/^Fellow‑believers in/m, "* "),
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
      [/nasmuch as the House of Justice/g, "nasmuch as this House of Justice"],
      [/in the world of being/g, "in this world of being"],
      [/clear and evident how wondrous/g, "clear and manifest how wondrous"],
      ["If the veil be lifted", "If the veil were lifted"],
      [
        "and the full glory of the station of those who have turned wholly towards God, and in their love for Him renounced the world, be made manifest, the entire creation would be dumbfounded.",
        "and the full glory of the station of those that have turned wholly towards God, and have, in their love for Him, renounced the world, were made manifest, the entire creation would be dumbfounded.",
      ],
      [
        "unity of mankind. May it be the first to unfurl",
        "universality of mankind. May it be the first to upraise",
      ],
      [
        "Let not a man glory in that he loves his country; let him rather glory in this, that he loves his kind.",
        "Let not man glory in this that he loveth his country, let him rather glory in this that he loveth his kind.",
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
        years: [2001.0101, 2001.0101],
        date: "1 January 2001",
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
            `# ${fixedTitle}, ${getMessageTo(addressee)}`,
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
        '# Social Action\nauthor="The Office of Social and Economic Development"\nyears=[2012.1126,2012.1126]\ndate="26 November 2012"',
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
      ["has been laid waste. It has", "hath been laid waste. It hath"],
      [
        "preeminent importance. . . .",
        `preeminent importance.

An understanding of the principles by which we explore the Revelation of Bahá’u’lláh depends, too, on an appreciation of the broad nature of the authority conferred on the Universal House of Justice. Speaking of the relevant responsibilities of its elected membership, the Will and Testament states:

It is incumbent upon these members (of the Universal House of Justice) to gather in a certain place and deliberate upon all problems which have caused difference, questions that are obscure and matters that are not expressly recorded in the Book. Whatsoever they decide has the same effect as the Text itself.

Emphasising, in this same Charter of the Administrative Order, the importance of believers’ wholehearted adherence to the guidance given by both the Guardian and the Universal House of Justice, ‘Abdu’l‑Bahá says:

Whatsoever they decide is of God. Whoso obeyeth him not, neither obeyeth them, hath not obeyed God; whoso rebelleth against him and against them hath rebelled against God; whoso opposeth him hath opposed God; whoso contendeth with them hath contended with God. . . .`,
      ],
      ["beauty. Such an one, indeed", "beauty. Such a one, indeed"],
      ["no doubt. You should, therefore", "no doubt. Ye should, therefore"],
      ["grasp and practice it properly", "grasp and practise it properly"],
      ["activities, and ability to", "activities, and the ability to"],
      ["increased as ‑consciousness", "increased as consciousness"],
      ["institutional ‑developments", "institutional developments"],
      ["and ‑development of the", "and development of the"],
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
        author: "The World Centre",
        years: [2005.1029, 2005.1029],
        date: "29 October 2005",
      }),
      title("#", "Additional Documents", { collection: true }),
      [/^— .* —$\n\n/gm, "## "],
      [
        "## Training Institutes",
        `## Training Institutes\nauthor="Commissioned by the Universal House of Justice"\nyears=[1998.0401,1998.0401]\ndate="April 1998"`,
      ],
      [
        "## Training Institutes and Systematic Growth",
        `## Training Institutes and Systematic Growth\nauthor="The International Teaching Centre"\nyears=[2000.0201,2000.0201]\ndate="February 2000"`,
      ],
      [
        "## Building Momentum A Coherent Approach to Growth",
        `## Building Momentum: A Coherent Approach to Growth\nauthor="The International Teaching Centre"\nyears=[2003.0401,2003.0401]\ndate="April 2003"`,
      ],
      [
        "## Impact of Growth on Administration Processes",
        `## Impact of Growth on Administration Processes\nauthor="The International Teaching Centre"\nyears=[2005.0701,2005.0701]\ndate="July 2005"`,
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
      ["benefits: It enables", "benefits:\n\nIt enables"],
    ],
  },
  "official-statements-commentaries": {
    bahaullah: [
      [/^A statement prepared by the Bahá’í.*/m, ""],
      removeAfter("Notes"),
      title("", "Bahá’u’lláh", {
        author: "Commissioned by the Universal House of Justice",
        years: [1992.0529, 1992.0529],
        date: "29 May 1992",
      }),
      [/^[A-Z].{1,80}[a-z?]$/gm, (a) => `# ${a}`],
      [/^“.{0,80}”$/gm, (a) => `# ${a}`],
      ["# Bahá’u’lláh", "Bahá’u’lláh"],
      [
        "every man may testify, in himself, by himself, in the station of the Manifestation of his Lord, that verily there is no God save Him, and that every man may thereby win his way to the summit of realities, until none shall contemplate anything whatsoever but that he shall see God therein.",
        "every man may testify, in himself and by himself, before the Seat of the revelation of his Lord, that there is none other God but Him; and that all may reach that summit of realities where none shall contemplate anything but that he shall perceive God therein.",
      ],
      [
        "good of the world and the happiness",
        "good of the world and happiness",
      ],
      ["and you shall have another", "and ye shall have another"],
      ["other station is the station", "other is the station"],
    ],
    "century-light": [
      ["The Universal House of Justice", ""],
      ["Naw‑Rúz, 158 B.E.", ""],
      removeAfter("Notes"),
      title("", "Century of Light", {
        author: "Commissioned by the Universal House of Justice",
        years: [2001.0321, 2001.0321],
        date: "Naw‑Rúz 2001",
        collection: true,
      }),
      [/\n^Century of Light$/m, "\n# Century of Light"],
      title("#", "Foreword", { author: "The Universal House of Justice" }),
      [/^[A-Z]{1,5}$/gm, "***"],
      [
        "Today nothing but the power of the Word of God which encompasses the realities of things can bring the thoughts, the minds, the hearts and the spirits under the shade of one Tree. He is the potent in all things, the vivifier of souls, the preserver and the controller of the world of mankind.",
        "Naught but the celestial potency of the Word of God, which rules and transcends the realities of all things, is capable of harmonising the divergent thoughts, sentiments, ideas, and convictions of the children of men. Verily, it is the penetrating power in all things, the mover of souls and the binder and regulator in the world of humanity.",
      ],
      [
        "All of us know that international peace is good, that it is the cause of life, but volition and action are necessary. Inasmuch as this century is the century of light, capacity for achieving peace has been assured. It is certain that these ideas will be spread among men to such a degree that they will result in action.",
        "All of us know that international peace is good, that it is conducive to human welfare and the glory of man, but volition and action are necessary before it can be established. Action is essential. Inasmuch as this century is a century of light, capacity for action is assured to mankind. Necessarily the divine principles will be spread among men until the time of action arrives.",
      ],
      ["world has not experienced", "world has not yet experienced"],
      ["humanity! . . . At present", "humanity! . . .\n\nAt present"],
      ["edifice strong. . . . Naught", "edifice strong. . . .\n\nNaught"],
    ],
    "one-common-faith": [
      ["The Universal House of Justice", ""],
      ["Naw‑Rúz, 2005", ""],
      removeAfter("References"),
      title("", "One Common Faith", {
        author: "Commissioned by the Universal House of Justice",
        years: [2005.0321, 2005.0321],
        date: "Naw‑Rúz 2005",
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
        years: [1995.0303, 1995.0303],
        date: "3 March 1995",
      }),
      [/^[A-Z]{1,5}$/gm, "***"],
      ["collective coming‑ of‑age", "collective coming‑of‑age"],
      ["thought. May each morn", "thought. Let each morn"],
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
        years: [1995.1001, 1995.1001],
        date: "1 October 1995",
      }),
      [/^[IV]{1,5}\. (.*)$/gm, (_, a) => `# ${a}`],
      [/^[A-D]{1,5}\. (.*)$/gm, (_, a) => `## ${a}`],
      [/^\d+\. (.*)$/gm, (_, a) => `### ${a}`],
      ["on the commonalties inherent", "on the commonalities inherent"],
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
      [/—Bahá’u’lláh.*$/gm, ""],
      [/—‘Abdu’l‑Bahá.*$/gm, ""],
      [/—Gleaning.*/gm, ""],
      [/—Tablets.*/gm, ""],
      [/—Tablet to.*/gm, ""],
      [/—Epistle.*/gm, ""],
      [/—A Traveller.*/gm, ""],
      [/—Kitáb‑i‑Aqdas.*/gm, ""],
      [/—Introduction.*/gm, ""],
      [/—The Summons.*/gm, ""],
      [/—The Hidden.*/gm, ""],
      [/—Some Answered.*/gm, ""],
      [/—Selections.*/gm, ""],
      [/—The Secret.*/gm, ""],
      [/—Star.*/gm, ""],
      [/—March.*/gm, ""],
      [/—November.*/gm, ""],
      [/—Bahá’í.*/gm, ""],
      [/—Diary.*/gm, ""],
      [/—A Heavenly.*/gm, ""],
      [/—Kitáb‑i‑Íqán\./g, ""],
      ["—Tablet of the World.", ""],
      [/^\[The above letters.*$/m, ""],
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
      ["\nBahá’u’lláh and the New Era", "\n# Bahá’u’lláh and the New Era"],
      [/^— .* —$\n\n/gm, "## "],
      [/^[A-Z‘].{1,80}[A-Za-záí\?]$/gm, (a) => `### ${a}`],
      prefix("Sir ‘Abdu’l‑Bahá ‘Abbás, K.B.E.", "### "),
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
      ["vouchsafed to them. In this", "vouchsafed to them. . . . In this"],
      ["for you, O peoples. If", "for you, O people. If"],
      ["sabbath day, he must be", "sabbath day, must be"],
      ["share one hole, the eagle", "share one hole, and the eagle"],
      ["overlookest the shortcomings", "overlooketh the shortcomings"],
      [
        "If one should hear a single verse from Him and recite it, it is better than that he should recite the Bayán [i.e., the Revelation of the Báb] a thousand times.",
        "A thousand perusals of the Bayán cannot equal the perusal of a single verse to be revealed by Him Whom God shall make manifest.",
      ],
      [
        /^So worship God that if.*$/m,
        "Worship thou God in such wise that if thy worship lead thee to the fire, no alteration in thine adoration would be produced, and so likewise if thy recompense should be paradise. Thus and thus alone should be the worship which befitteth the one True God. Shouldst thou worship Him because of fear, this would be unseemly in the sanctified Court of His presence, and could not be regarded as an act by thee dedicated to the Oneness of His Being. Or if thy gaze should be on paradise, and thou shouldst worship Him while cherishing such a hope, thou wouldst make God’s creation a partner with Him, notwithstanding the fact that paradise is desired by men.",
      ],
      [
        /^O King, I have seen in[\s\S]*sharp swords and piercing blades.*$/m,
        `I have seen, O Sháh, in the path of God what eye hath not seen nor ear heard. Mine acquaintances have repudiated Me, and My pathways have been straitened. The fount of well‑being hath run dry, and the bower of ease hath withered. How numerous the tribulations which have rained, and will soon rain, upon Me! I advance with My face set towards Him Who is the Almighty, the All‑Bounteous, whilst behind Me glideth the serpent. Mine eyes have rained down tears until My bed is drenched.

I sorrow not for Myself, however. By God! Mine head yearneth for the spear out of love for its Lord. I never passed a tree, but Mine heart addressed it saying: “O would that thou wert cut down in My name, and My body crucified upon thee, in the path of My Lord!”, for I see the people wandering distraught and unconscious in their drunken stupor. They have raised on high their passions and set down their God. Methinks they have taken His Cause for a mockery and regard it as a play and pastime, believing all the while that they do well, and that they dwell securely in the citadel of safety. Howbeit the matter is not as they fondly imagine: Tomorrow shall they behold that which today they are wont to deny!

Erelong shall the exponents of wealth and power banish Us from the land of Adrianople to the city of ‘Akká. According to what they say, it is the most desolate of the cities of the world, the most unsightly of them in appearance, the most detestable in climate, and the foulest in water. It is as though it were the metropolis of the owl, within whose precincts naught can be heard save the echo of its cry. Therein have they resolved to imprison this Youth, to shut against our faces the doors of ease and comfort, and to deprive us of every worldly benefit throughout the remainder of our days.

By God! Though weariness lay Me low, and hunger consume Me, and the bare rock be My bed, and My fellows the beasts of the field, I will not complain, but will endure patiently as those endued with constancy and firmness have endured patiently, through the power of God, the Eternal King and Creator of the nations, and will render thanks unto God under all conditions. We pray that, out of His bounty—exalted be He—He may release, through this imprisonment, the necks of men from chains and fetters, and cause them to turn, with sincere faces, towards His face, Who is the Mighty, the Bounteous. Ready is He to answer whosoever calleth upon Him, and nigh is He unto such as commune with Him. We further beseech Him to make of this darksome tribulation a shield for the Temple of His Cause, and to protect it from the assault of sharpened swords and pointed daggers. Adversity hath ever given rise to the exaltation of His Cause and the glorification of His Name. Such hath been God’s method carried into effect in centuries and ages past.`,
      ],
      ["has attained! . . . Thou has", "hast attained! . . . Thou hast"],
      ["and to be the limitations", "and to the limitations"],
      ["raise and exalted. And", "raised and exalted. And"],
      ["signs, and We strengthen", "signs, and We strengthened"],
      ["the Seal of Prophets", "the Seal of the Prophets"],
      ["face of Him Whom is the", "face of Him Who is the"],
      ["the slightest whisperings of", "the slightest whispering of"],
      ["ranging from the divine", "ranging from the realm of divine"],
      [
        "Of the Tree of Knowledge the All‑glorious fruit is this exalted word: Of one Tree are all ye the fruits and of one Bough the leaves. Let not man glory in this that he loves his country, but let him rather glory in this that he loves his kind.",
        "The most glorious fruit of the tree of knowledge is this exalted word: Of one tree are all ye the fruit, and of one bough the leaves. Let not man glory in this that he loveth his country, let him rather glory in this that he loveth his kind.",
      ],
      [
        "Man must show forth fruits. A fruitless man, in the words of His Holiness the Spirit [Jesus], is like a fruitless tree, and a fruitless tree is fit for fire.",
        "Man must bring forth fruit. One who yieldeth no fruit is, in the words of the Spirit, like unto a fruitless tree, and a fruitless tree is fit but for the fire.",
      ],
      [
        "Man should know his own self, and know those things that lead to loftiness or to baseness, to shame or to honour, to wealth or to poverty.",
        "man should know his own self and recognise that which leadeth unto loftiness or lowliness, glory or abasement, wealth or poverty.",
      ],
      [
        "“Blessed is he who prefers his brother before himself; such an one is of the people of Bahá.”",
        "“Blessed is he who preferreth his brother before himself. Verily, such a man is reckoned . . . with the people of Bahá”.",
      ],
      ["rose no matter what soil", "rose no matter in what soil"],
      ["human race, is giving praise.", "human race, he is giving praise."],
      [
        "Truthfulness is the foundation of all the virtues of mankind. Without truthfulness, progress and success in all of the worlds are impossible for a soul. When this holy attribute is established in man, all the other divine qualities will also become realised.",
        "Truthfulness is the foundation of all human virtues. Without truthfulness progress and success, in all the worlds of God, are impossible for any soul. When this holy attribute is established in man, all the divine qualities will also be acquired.",
      ],
      ["nor have doubt thereof.", "nor have a doubt thereof."],
      [
        "The tongue is unable to give an account of these, and utterance falls exceedingly short. The pen is useless in this court, and the ink gives no result but blackness. . . . Heart alone can communicate to heart the state of the knower; this is not the work of a messenger, nor can it be contained in letters.",
        "The tongue faileth in describing these three valleys, and speech falleth short. The pen steppeth not into this arena, the ink leaveth only a blot. . . . this mystery of inner meaning may be whispered only from heart to heart, and confided only from breast to breast.",
      ],
      ["wayward thought from the flame", "wayward thought with the flame"],
      ["he knows that the friend", "he knows that that friend"],
      ["Thou has created all humanity", "Thou hast created all humanity"],
      [
        "Hearing! O Thou the Compassionate God! Bestow upon me a heart which, like unto glass",
        "Hearing!\n\nO Thou the Compassionate God! Bestow upon me a heart which, like unto a glass",
      ],
      ["confer upon me a thought", "confer upon me thoughts"],
      [
        "the spiritual bounty. Thou",
        "the outpourings of heavenly grace.\n\nThou",
      ],
      ["Be ye the very essence", "“Be ye the very essence"],
      ["permissible to bathe in", "permissible to bathe yourselves in"],
      ["hearts of the favoured of God.", "hearts of the favoured of God.”"],
      [
        "External cleanliness, although it is but a physical thing, has great influence upon spirituality.",
        "although bodily cleanliness is a physical thing, it hath, nevertheless, a powerful influence on the life of the spirit.",
      ],
      [
        "It is therefore evident that it is possible to cure by foods, aliments, and fruits; but as today the science of medicine is imperfect, this fact is not yet fully grasped. When the science of medicine reaches perfection, treatment will be given by foods, aliments, fragrant fruits, and vegetables, and by various waters, hot and cold in temperature.",
        "It is therefore evident that it is possible to cure illnesses by means of fruits and other foods. But as the science of medicine has not yet been perfected, this fact has not been fully understood. When this science reaches perfection, treatments will be administered with fragrant fruits and plants as well as with other foods, and with hot and cold waters of various temperatures.",
      ],
      [
        "from the entire concentration of the mind of a strong person upon a sick person, when the latter expects with all his concentrated faith that a cure will be effected from the spiritual power of the strong person, to such an extent that there will be a cordial connection between the strong person and the invalid. The strong person makes every effort to cure the sick patient, and the sick patient is then sure of receiving a cure. From the effect of these mental impressions an excitement of the nerves is produced, and this impression and this excitement of the nerves will become the cause of the recovery of the sick person.",
        "when a healthy person focuses his whole attention upon a sick person, and the latter in turn fully expects to be healed through the spiritual power of the former and is wholly convinced thereof, to such an extent that a strong connection is created between their hearts. Should the healthy individual then bend every effort to heal the sick one, and should the latter have full faith that health will be attained, an excitement may be produced in his nerves from these soul‑to‑soul influences and bring about the cure.",
      ],
      [
        ". . . This does not depend on contact, nor on sight, nor upon presence. . . . Whether the disease be light or severe, whether there be a contact of bodies or not, whether a personal connection be established between the sick person and the healer or not, this healing takes place through the power of the Holy Spirit.",
        ". . . This depends neither upon physical contact, nor upon sight, nor even upon presence . . . Whether the disease be mild or severe, whether there be contact between the bodies or not, whether a connection be established between patient and physician or not, whether the patient be present or not, this healing takes place through the power of the Holy Spirit.",
      ],
      [
        "God hath bestowed upon man such wonderful powers,",
        "God has bestowed such wonderful power upon him",
      ],
      ["from His divine Bounty. But", "from His divine Bounty.\n\nBut"],
      ["pages of God’s book", "pages of God’s holy Book"],
      ["universal Manifestations would", "universal Manifestation would"],
      ["that which We revealed", "that which We have revealed"],
      ["turn your faces toward Him", "turn your faces towards Him"],
      [
        "none other except the Most Mighty Branch (‘Abdu’l‑Bahá).",
        "none except the Most Mighty Branch [‘Abdu’l‑Bahá].",
      ],
      ["pledged Ourselves to secure", "pledged Ourself to secure"],
      ["Should any kind take up arms", "Should any king take up arms"],
      ["O Oppressors of Earth! Withdraw", "O Oppressors on Earth! Withdraw"],
      ["sealed it with My seal", "sealed with My seal"],
      ["being. We see among us men", "being.\n\nWe see amongst us men"],
      ["lay their head. . . . ", "lay their head. . . .\n\n"],
      ["equality between men. Equality", "equality between men.\n\nEquality"],
      ["the creation of man. . . . ", "the creation of man. . . .\n\n"],
      ["each with their appointed", "each with their own appointed"],
      ["without anyone in authority.", "without one in authority. . . ."],
      ["extreme is not good. . . . ", "extreme is not good. . . .\n\n"],
      ["rich and other lamentably", "rich and others lamentably"],
      ["number of people.\n\nThe rich", "number of people. The rich"],
      ["very large number of people", "very large number of the people"],
      ["very necessaries of life.", "very necessities of life."],
      ["of rich and want. . . . ", "of riches and of want. . . .\n\n"],
      [
        "Among the teachings of Bahá’u’lláh is voluntary sharing of one’s property with others among mankind. This voluntary sharing is greater than (legally imposed) equality, and consists in this, that one should not prefer oneself to others, but rather should sacrifice one’s life and property for others. But this should not be introduced by coercion so that it becomes a law which man is compelled to follow.",
        "And among the teachings of Bahá’u’lláh is voluntary sharing of one’s property with others among mankind. This voluntary sharing is greater than equality, and consists in this, that man should not prefer himself to others, but rather should sacrifice his life and property for others. But this should not be introduced by coercion so that it becomes a law and man is compelled to follow it.",
      ],
      ["Bahá should not deny to any", "Bahá should not deny any"],
      [
        /^\. \. \. the most essential[\s\S]*that crimes may not occur\.$/m,
        `. . . that which is essential is to so educate the masses . . . as to shrink entirely from any crime, and indeed regard the crime itself as the greatest chastisement and the most grievous torment and punishment. Thus no crimes would occur in the first place such that punishments would be required. . . .

. . . if someone wrongs, injures, and assaults another, and the latter retaliates in kind, this constitutes revenge and is blameworthy. If Peter kills the son of Paul, Paul has no right to kill the son of Peter. Were he to do so, it would be an act of vengeance and blameworthy in the extreme. Rather, he must act in the opposite manner and show forgiveness, and, if possible, even be of some assistance to his aggressor. This indeed is that which is worthy of man; for what advantage does one gain from revenge? The two actions are indeed one and the same: If one is reprehensible, so too is the other. The only difference is that one preceded the other.

But the body politic has the right to preserve and to protect. It holds no grudge and harbours no enmity towards the murderer, but chooses to imprison or punish him solely to ensure the protection of others. . . .

Thus when Christ said, “Whosoever shall smite thee on thy right cheek, turn to him the left one also”, the purpose was to educate the people, not to imply that one should assist a wolf that has fallen upon a flock of sheep and is intent upon devouring them all. No, if Christ had known that a wolf had entered the fold and was about to destroy the sheep, He most certainly would have prevented it. . . .

. . . the proper functioning of the body politic depends upon justice . . . So what Christ meant by forgiveness and magnanimity is not that if another nation were to assail you; burn your homes; plunder your possessions; assault your wives, children, and kin; and violate your honour, you must submit to that tyrannical host and permit them to carry out every manner of iniquity and oppression. Rather, the words of Christ refer to private transactions between two individuals, stating that if one person assaults another, the injured party should forgive. But the body politic must safeguard the rights of man. . . .

One final point: The body politic is engaged day and night in devising penal laws and in providing for ways and means of punishment. It builds prisons, acquires chains and fetters, and ordains places of exile and banishment, of torment and hardship, seeking thereby to reform the criminal, whereas in reality this only brings about the degradation of morals and the subversion of character. The body politic should instead strive night and day, bending every effort to ensure that souls are properly educated, that they progress day by day, that they advance in science and learning, that they acquire praiseworthy virtues and laudable manners, and that they forsake violent behaviour, so that crimes might never occur.`,
      ],
      [
        ". . . in this marvellous cycle, the earth will be transformed, and the world of humanity arrayed in tranquillity and beauty. Disputes, quarrels, and murders will be replaced by peace, truth, and concord; among the nations, peoples, races, and countries, love and amity will appear. Cooperation and union will be established, and finally war will be entirely suppressed. . . . Universal peace will raise its tent in the centre of the earth, and the Blessed Tree of Life will grow and spread to such an extent that it will overshadow the East and the West. Strong and weak, rich and poor, antagonistic sects and hostile nations—which are like the wolf and the lamb, the leopard and kid, the lion and calf—will act towards each other with the most complete love, friendship, justice, and equity. The world will be filled with science, with the knowledge of the reality of the mysteries of beings, and with the knowledge of God.",
        ". . . in this wondrous Dispensation the earth will become another earth and the world of humanity will be arrayed with perfect composure and adornment. Strife, contention, and bloodshed will give way to peace, sincerity, and harmony. Among the nations, peoples, kindreds, and governments, love and amity will prevail and cooperation and close connection will be firmly established. Ultimately, war will be entirely banned . . . Universal peace will raise its pavilion in the midmost heart of creation and the blessed Tree of Life will so grow and flourish as to stretch its sheltering shade over the East and the West. Strong and weak, rich and poor, contending kindreds and hostile nations—which are like the wolf and the lamb, the leopard and kid, the lion and the calf—will treat one another with the utmost love, unity, justice, and equity. The earth will be filled with knowledge and learning, with the realities and mysteries of creation, and with the knowledge of God.",
      ],
      [
        "earth; it should give birth to spirituality, and bring light and life to every soul. If religion becomes a cause of dislike, hatred and division it would be better",
        "earth, give birth to spirituality, and bring life and light to each heart. If religion becomes a cause of dislike, hatred and division, it were better",
      ],
      ["remedy only aggravates", "remedy should only aggravate"],
      ["caused by such an illusion? God", "caused by an illusion?\n\nGod"],
      ["sky of humanity.\n\nThe", "sky of humanity. The"],
      ["The only real difference lies", "The only difference lies"],
      ["from morning till night", "from morning until evening"],
      ["How terrible is it that", "How terrible it is that"],
      ["tract of land—the highest", "tract of land!\n\nThe highest"],
      ["form of matter, earth.\n\nLand", "form of matter, earth. Land"],
      ["all people. The earth is", "all people. This earth is"],
      ["his tomb.\n\nIf more land is", "his tomb! If more land is"],
      ["extension of territory. But", "extension of territory.\n\nBut"],
      ["hearts of hundred of men", "hearts of hundreds of men"],
      ["of his heart on love", "of your heart on love"],
      ["thought of love. When", "thought of love. . . .\n\nWhen"],
      ["the savagery of men disappear", "the savagery of man disappear"],
      ["attain. Nothing is impossible", "attain!\n\nNothing is impossible"],
      ["benevolence of God. If", "benevolence of God.\n\nIf"],
      ["growing stronger until", "growing stronger and stronger, until"],
      ["your people find rest", "your peoples find rest"],
      ["edifice strong. . . . Although", "edifice strong. . . .\n\nAlthough"],
      ["Supreme Tribunal which His Holiness", "Supreme Tribunal which"],
      ["cause of war. This mission", "cause of war. The mission"],
      ["found in the band which", "found in the ban which"],
      [
        "East. In the East",
        "East.\n\nAbraham appeared in the East. In the East",
      ],
      ["Eastern horizon rose the Lord", "Eastern horizon arose the Lord"],
      ["Eastern world.\n\nBut although", "Eastern world. But although"],
      ["it has made more rapid", "it has made a more rapid"],
      ["need of a spiritual ideal", "want of a spiritual idea"],
      ["gifts. The East", "gifts.\n\nThe East"],
      ["material. Receiving thus", "material.\n\nReceiving thus"],
      ["bring about true civilisation", "bring about a true civilisation"],
      ["Eastern and the Western nations", "Eastern with the Western nations"],
      ["be assured. . . . This", "be assured. . . .\n\nThis"],
      [
        "sole purpose underlying",
        "sole purpose of guiding mankind to the straight Path of Truth. The purpose underlying",
      ],
      [
        "When they [men] are delivered through the light of faith from the darkness of these vices, and become illuminated with the radiance of the sun of reality, and ennobled with all the virtues, they esteem this the greatest reward, and they know it to be the true paradise. In the same way they consider that the spiritual punishment . . . is to be subjected to the world of nature, to be veiled from God, to be brutal and ignorant, to fall into carnal lusts, to be absorbed in animal frailties, to be characterised with dark qualities . . . these are the greatest punishments and tortures. . . .",
        "When these souls are delivered from the darkness of these vices through the light of faith, when they are illumined by the rays of the Sun of Truth and endowed with every human virtue, they reckon this as the greatest reward and regard it as the true paradise. In like manner, they consider spiritual punishment . . . to consist in subjection to the world of nature; in being veiled from God; in ignorance and unawareness; in engrossment with covetous desires; in absorption in animal vices; in being marked by evil attributes . . . all of which they reckon to be the greatest of torments and punishments. . . .",
      ],
      [
        ". . . The rewards of the other world are the perfections and the peace obtained in the spiritual worlds after leaving this world . . . the spiritual graces, the various spiritual gifts in the Kingdom of God, the gaining of the desires of the heart and the soul, and the meeting of God in the world of eternity. In the same way the punishments of the other world . . . consist in being deprived of the special divine blessings and the absolute bounties, and falling into the lowest degrees of existence. He who is deprived of these divine favours, although he continues after death, is considered as dead by the people of truth.",
        ". . . The ultimate rewards consist in spiritual bounties and bestowals, such as the manifold gifts of God that are vouchsafed after the ascension of the soul, the attainment of the heart’s desire, and reunion with Him in the everlasting realm. Similarly, ultimate retributions and punishments consist in being deprived of the special bounties and unfailing bestowals of God and sinking to the lowest degrees of existence. And whoso is deprived of these favours, though he continue to exist after death, is accounted as dead in the eyes of the people of truth.",
      ],
      [
        "The wealth of the other world is nearness to God. Consequently it is certain that those who are near the Divine Court are allowed to intercede, and this intercession is approved by God.",
        "The wealth of the next world consists in nearness to God. It is certain therefore that those who enjoy near access to the divine threshold are permitted to intercede, and that this intercession is approved in the sight of God.",
      ],
      [
        "It is even possible that the condition of those who have died in sin and unbelief may become changed; that is to say, they may become the object of pardon through the bounty of God, not through His justice; for bounty is giving without desert, and justice is giving what is deserved. As we have the power to pray for these souls here, so likewise we shall possess the same power in the other world, which is the Kingdom of God. . . . Therefore in that world also they can make progress. As here they can receive light by their supplications, there also they can plead for forgiveness, and receive light through entreaties and supplications.",
        "It is even possible for those who have died in sin and unbelief to be transformed, that is, to become the object of divine forgiveness. This is through the grace of God and not through His justice, for grace is to bestow without desert, and justice is to give that which is deserved. As we have the power to pray for those souls here, so too will we have the same power in the next world, the world of the Kingdom. . . . They must therefore be able to progress in that world as well. And just as they can seek illumination here through supplication, so too can they plead there for forgiveness and seek illumination through prayer and supplication.",
      ],
      [
        "Both before and after putting off this material form, there is progress in perfection, but not in state. . . . There is no other being higher than a perfect man. But man when he has reached this state can still make progress in perfections but not in state, because there is no state higher than that of a perfect man to which he can transfer himself. He only progresses in the state of humanity, for the human perfections are infinite. Thus however learned a man may be, we can imagine one more learned.",
        "Both before and after casting off this elemental frame, the human soul progresses in perfections but not in station. The progression of all created things culminates in perfect man, and no greater being than him exists: Man, having reached the human station, can progress only in perfections and not in station, for there is no higher station to which he can find passage than that of a perfect man. He can progress solely within the human station, as human perfections are infinite. Thus, however learned a man may be, it is always possible to imagine one even more learned.",
      ],
      [
        "Hence, as the perfections of humanity are endless, man can also make progress in perfections after leaving this world.",
        "And as the perfections of man are infinite, he can also advance in these perfections after his ascension from this world.",
      ],
      [
        "By a general agreement all the governments of the world must disarm simultaneously. It will not do if one lays down its arms and the others refuse to do so. The nations of the world must concur with each other concerning this supremely important subject, so that they may abandon together the deadly weapons of human slaughter. As long as one nation increases her military and naval budget other nations will be forced into this crazed competition through their natural and supposed interests.",
        "By a general agreement all the governments of the world must disarm simultaneously. . . . It will not do if one lays down the arms and the other refuses to do so. The nations of the world must concur with each other concerning this supremely important subject, thus they may abandon together the deadly weapons of human slaughter. As long as one nation increases her military and naval budget, another nation will be forced into this crazed competition through her natural and supposed interests.",
      ],
      [
        /^The visions of the Prophets[\s\S]*hearts to be attracted.$/m,
        `The visions of the Prophets are not dreams but true spiritual disclosures. Thus when they say, “I saw someone in such a form, and I spoke such words, and he gave such a reply”, this vision takes place in a state of wakefulness and not in the realm of sleep. It is a spiritual discovery . . .

. . . there exists among spiritual souls a unity that surpasses all imagination and comparison and a communion that transcends time and place. So, for example, when it is written in the Gospel that Moses and Elijah came to Christ on Mount Tabor, it is clear that this was not a material communion but a spiritual condition . . .

. . . [Communications such as] exert a marvellous effect upon minds and thoughts and produce powerful attractions in the hearts.`,
      ],
      [
        /^In creation there is no[\s\S]*creation is purely good.$/m,
        `In the innate nature of things there is no evil—all is good. This applies even to certain apparently blameworthy attributes and dispositions which seem inherent in some people, but which are not in reality reprehensible. For example, you can see in a nursing child, from the beginning of its life, the signs of greed, of anger, and of ill temper; and so it might be argued that good and evil are innate in the reality of man, and that this is contrary to the pure goodness of the innate nature and of creation. The answer is that greed, which is to demand ever more, is a praiseworthy quality provided that it is displayed under the right circumstances. Thus, should a person show greed in acquiring science and knowledge, or in the exercise of compassion, high‑mindedness, and justice, this would be most praiseworthy. And should he direct his anger and wrath against the bloodthirsty tyrants who are like ferocious beasts, this too would be most praiseworthy. But should he display these qualities under other conditions, this would be deserving of blame.

. . . The same holds true of all the innate qualities of man which constitute the capital of human life: If they are displayed and employed in an improper way, they become blameworthy. It is clear then that the innate nature is purely good.`,
      ],
      ["unity is essential if we", "unity is necessary if we"],
      ["Truth from whatever point", "Truth from whatsoever point"],
      ["Moses and Buddha. This", "Moses and in Buddha. . . . This"],
      ["It also means that we", "It means, also, that we"],
      ["personality so to blind our", "personality to so blind our"],
      [
        /^Know that it is one of[\s\S]*not eventually be decomposed.$/m,
        `Know that it is one of the most abstruse questions of divinity that the world of existence—that is, this endless universe—has no beginning. . . .

. . . Know that . . . a creator without a creation is impossible; a provider without those provided for is inconceivable—since all the divine names and attributes call for the existence of created things. If we were to imagine a time when created things did not exist, it would be tantamount to denying the divinity of God.

Apart from this, absolute non‑existence lacks the capacity to attain existence. If the universe were pure nothingness, existence could not have been realised. Thus, as that Essence of Oneness, or divine Being, is eternal and everlasting—that is, as it has neither beginning nor end—it follows that the world of existence, this endless universe, likewise has no beginning. . . . it is possible for some part of creation—one of the celestial globes—to be newly formed or to disintegrate, but the other countless globes would continue to exist . . . as each globe has a beginning, it must inevitably have an end as well, since every composition, whether universal or particular, must of necessity be decomposed. At most, some disintegrate quickly and others slowly, but it is impossible for something that is composed not to ultimately decompose.`,
      ],
      [
        /^\. \. \. it is clear that this[\s\S]*a man, not an animal\.$/m,
        `. . . it is clear that this terrestrial globe in its present form did not come into existence all at once, but . . . gradually traversed different stages until it appeared in its present completeness. . . .

. . . From the beginning of existence in the womb of the terrestrial globe, man gradually grew and developed like the embryo in the womb of its mother, and passed from one shape and form to another until he appeared with this beauty and perfection, this power and constitution. It is certain that initially he did not possess such loveliness, grace, and refinement, and that he has only gradually attained such form, disposition, comeliness, and grace. . . .

. . . from the beginning of man’s existence on this planet until he assumed his present shape, form, and condition, a long time must have elapsed . . . But from the beginning of his existence man has been a distinct species. . . .

. . . were one to establish the existence of vestigial organs, this would not disprove the independence and originality of the species. At most it would prove that the form, appearance, and organs of man have evolved over time. But man has always been a distinct species; he has been man, not an animal.`,
      ],
      [
        /^If we take this story[\s\S]*of marvellous explanations\.$/m,
        `If we were to take this account according to the literal meaning of the words as indicated by their common usage, it would indeed be exceedingly strange, and human minds would be excused from accepting, affirming, or imagining it. For such elaborate arrangements and details, such statements and reproaches would be implausible even coming from an intelligent person, let alone from the Divinity Himself, Who has arranged this infinite universe in the most perfect form and arrayed its countless beings in the utmost order, soundness, and perfection. . . .

The account of Adam and Eve, their eating from the tree, and their expulsion from Paradise are therefore symbols and divine mysteries. They have all‑embracing meanings and marvellous interpretations . . .`,
      ],
      ["science, then there will be", "science, then will there be"],
      ["advent. When Jesus came", "advent.\n\nWhen Christ came"],
      ["the Christ. The Messiah", "the Christ. . . . The Messiah"],
      ["Although Christ came from", "Although He came from"],
      ["He came also from heaven", "He also came from heaven"],
      ["completed the Laws of Moses", "completed the Law of Moses"],
      [
        /^One of the great events[\s\S]*Palestine will become their home.$/m,
        `One of the great events which is to occur in the Day of the manifestation of that Incomparable Branch is the hoisting of the Standard of God among all nations. By this is meant that all nations and kindreds will be gathered together under the shadow of this Divine Banner, which is no other than the Lordly Branch itself, and will become a single nation. Religious and sectarian antagonism, the hostility of races and peoples, and differences among nations will be eliminated. All men will adhere to one religion, will have one common faith, will be blended into one race and become a single people. All will dwell in one common fatherland, which is the planet itself. Universal peace and concord will be established among all nations. That Incomparable Branch will gather together all Israel; that is, in His Dispensation Israel will be gathered in the Holy Land, and the Jewish people who are now scattered in the East and the West, the North and the South, will be assembled together.

Now, observe that these events did not take place in the Christian Dispensation, for the nations did not enlist under that single banner—that divine Branch—but in this Dispensation of the Lord of Hosts all nations and peoples will enter beneath His shadow. Likewise Israel, which had been scattered throughout the world, was not gathered together in the Holy Land in the course of the Christian Dispensation, but in the beginning of the Dispensation of Bahá’u’lláh this divine promise, which has been clearly stated in all the Books of the Prophets, has begun to materialise. Observe how from all corners of the world Jewish peoples are coming to the Holy Land, acquiring villages and lands to inhabit, and increasing day by day to such an extent that all Palestine is becoming their home.`,
      ],
      ["The purpose of these words", "The purport of these words"],
      ["I would have not created", "I would not have created"],
      ["they and leaders of their", "they and the leaders of their"],
      ["not would the blessed be", "nor would the blessed be"],
      ["and you shall have another", "and ye shall have another"],
      ["grievous loss. Even if this", "grievous loss.\n\nEven if this"],
      ["anger and wrath? Ye have", "anger and wrath? . . .\n\nYe have"],
      ["of God. . . . A handful", "of God. . . .\n\nA handful"],
      ["will ye wail and lament", "will ye bewail and lament"],
      ["succour you. . . . Be expectant", "succour you. . . .\n\nBe expectant"],
      ["the True One come and", "the law gone forth and"],
      [
        "age, this glorious century—the century of light—has",
        "age, this glorious . . . century—the century of light—hath",
      ],
      ["endowed with the unique", "endowed with unique"],
      ["should they keep aloof from", "should they . . . keep aloof from"],
      ["attract them to yourself", "attract them to yourselves"],
      ["compassion—“The Lord", "compassion . . . “The Lord"],
      ["not to require them", "not to requite them"],
      ["and all earthy things", "and all earthly things"],
      ["important services of the work", "important services in the work"],
      ["fear of God in their conduct", "fear of God by their conduct"],
      ["it is bounden duty", "it is the bounden duty"],
      ["regarded as a true believer", "regarded a true believer"],
      ["referred. It enacted all", "referred. It enacteth all"],
      ["discard, one for all", "discard, once for all"],
      ["the principles of federalism", "the principle of federalism"],
      ["else if not the power", "else if not to the power"],
      ["rivalries, hatred, and", "rivalries, hatreds, and"],
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
      ["done the moneys you have", "done the monies you have"],
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
    covenant: [
      removeAfter("Notes"),
      ["December 1987", ""],
      ["Materials assembled by the", ""],
      ["Research Department", ""],
      ["of the Universal House of Justice", ""],
      title("", "The Covenant", {
        author: "Compilation",
        years: [1987.1201, 1987.1201],
      }),
      [/^[IV]+\./gm, "# "],
      [/^[A-Z].{0,60}[a-z]$/gm, (a) => `## ${a}`],
      ["## The Covenant", "The Covenant"],
      [/^.*\n\n#/gm, "#"],
      [/^[^#\n].*\n\n^\d+\. ?/gm, ""],
      [/^\d+\. ?/gm, ""],
      [/^3 January 1982, from a letter written.*/gm, ""],
    ],
    "crisis-victory": [
      removeAfter("Index"),
      ["October 1987", ""],
      [/^Compiled by the Research Department.*/m, ""],
      [/^\(.*/gm, ""],
      [/\(‘Abdu’l‑Bahá, cited in.*/, ""],
      [/^Shoghi Effendi,.*/gm, ""],
      title("", "Crisis and Victory", {
        author: "Compilation",
        years: [1987.1001, 1987.1001],
      }),
      [/^“The/gm, "# “The"],
      [/^Extracts from/gm, "## Extracts from"],
      [
        "And if a nightingale soar upward from the clay of self and dwell in the rose bower of the heart, and in Arabian melodies and sweet Íránian songs recount the mysteries of God—a single word of which quickeneth to fresh, new life the bodies of the dead, and bestoweth the Holy Spirit upon the mouldering bones of this existence—thou wilt behold a thousand claws of envy, a myriad beaks of rancour hunting after Him and with all their power intent upon His death.",
        "And if a nightingale soar beyond the clay of self and dwell in the rose bower of the heart, and in Arabian melodies and sweet Persian tones recount the mysteries of God—a single word whereof quickeneth anew every lifeless form and bestoweth the spirit of holiness upon every mouldering bone—thou wilt behold a thousand claws of envy and a myriad talons of hatred hunting after Him and striving with all their power to encompass His death.",
      ],
      [
        "O My friend! Many a hound pursueth this gazelle of the desert of oneness; many a talon claweth at this thrush of the eternal garden. Pitiless ravens do lie in wait for this bird of the heavens of God, and the huntsman of envy stalketh this deer of the meadow of love.",
        "O My friend! Many a hound hunteth this gazelle of the desert of oneness; many an eagle pursueth this nightingale of the garden of eternity. Ravens of hatred lie in wait for this bird of the heavens of God, and the huntsman of envy stalketh this deer of the meadow of love.",
      ],
      ["have wellnigh overwhelmed the", "has well‑nigh overwhelmed the"],
      ["attacks which organised", "attacks which the organised"],
      ["and international level to", "and international levels to"],
      ["“Say: O people of God!", "Say: O people of God!"],
      ["Unconstrained.” “Say: Beware", "Unconstrained.\n\nSay: Beware"],
      ["reins of omnipotent might.”", "reins of omnipotent might."],
      ["You should exhort all the", "Ye should exhort all the"],
      ["no doubt. You should, therefore", "no doubt. Ye should, therefore"],
      ["SUBMITTED TO THEIR RESPECTIVE", "SUBMITTED THEIR RESPECTIVE"],
    ],
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
      ["beauty. Such an one, indeed", "beauty. Such a one, indeed"],
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
      ["His good‑ pleasure", "His good‑pleasure"],
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
    "importance-art": [
      removeAfter("Notes"),
      [/^A Compilation Prepared by the.*/m, ""],
      [/^of the Universal House.*/m, ""],
      ["August 1998", ""],
      [/^\(.*/gm, ""],
      title("", "The Importance of the Arts in Promoting the Faith", {
        author: "Compilation",
        years: [1998.0801, 1998.0801],
      }),
      [/^From/gm, "# From"],
      [
        "The first condition of perception in the world of nature is the perception of the rational soul. In this perception and in this power all men are sharers, whether they be neglectful or vigilant, believers or deniers.\n\nThis human rational soul is God’s creation; it encompasses and excels other creatures; as it is more noble and distinguished, it encompasses things. The power of the rational soul can discover the realities of things, comprehend the peculiarities of beings, and penetrate the mysteries of existence. All sciences, knowledge, arts, wonders, institutions, discoveries and enterprises come from the exercised intelligence of the rational soul.",
        "The foremost degree of comprehension in the world of nature is that of the rational soul. This power and comprehension is shared in common by all men, whether they be heedless or aware, wayward or faithful. In the creation of God, the rational soul of man encompasses and is distinguished above all other created things: It is by virtue of its nobility and distinction that it encompasses them all. Through the power of the rational soul, man can discover the realities of things, comprehend their properties, and penetrate the mysteries of existence. All the sciences, branches of learning, arts, inventions, institutions, undertakings, and discoveries have resulted from the comprehension of the rational soul.",
      ],
    ],
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
      ["special ruling in matters", "special rulings in matters"],
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
      ["influencing the opinion of", "influencing the opinions of"],
      ["field of work and where they", "field of work where they"],
      ["activities that every single", "activities and that every single"],
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
      [
        "And now you, if you act in accordance with the teachings of Bahá’u’lláh, may rest assured that you will be aided and confirmed. In all affairs which you undertake, you shall be rendered victorious, and all the inhabitants of the earth cannot withstand you. You are the conquerors, because the power of the Holy Spirit is your assistant. Above and over physical forces, phenomenal forces, the Holy Spirit itself shall aid you.",
        "And now, if you act in accordance with the teachings of Bahá’u’lláh, you may rest assured that you will be aided and confirmed. You will be rendered victorious in all that you undertake, and all the inhabitants of the earth will be unable to withstand you. You are conquerors, because the power of the Holy Spirit assisteth you. Above and beyond all physical and phenomenal forces, the Holy Spirit itself shall aid you.",
      ],
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
      ["influencing the opinion of", "influencing the opinions of"],
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
    "set-world-order": [
      removeAfter("Notes"),
      ["A Compilation Prepared by the Research Department", ""],
      ["of the Universal House of Justice", ""],
      ["August 2023", ""],
      [/^\(.*/gm, ""],
      title(
        "",
        "To Set the World in Order: Building and Preserving Strong Marriages",
        {
          author: "Compilation",
          years: [2023.0801, 2023.0801],
        }
      ),
      prefix("The Cause of Unity", "# "),
      prefix("Creating Families that Illuminate the World", "# "),
      prefix(
        "The Ideal Milieu for Learning the Principles of Consultation",
        "# "
      ),
      prefix("Addressing Challenges", "# "),
      title("#", "Prayers", {
        type: "Prayer",
        collection: true,
      }),
      prefix(/^Praised be God, Who hath/gm, '\n\n#\nauthor="Bahá’u’lláh"\n\n'),
      prefix(/^He is God!/gm, '\n\n#\nauthor="‘Abdu’l‑Bahá"\n\n'),
      prefix(
        /^O my Lord, O my Lord! These two bright/gm,
        '\n\n#\nauthor="‘Abdu’l‑Bahá"\n\n'
      ),
      prefix(
        /^O God, my God! Join in accord/gm,
        '\n\n#\nauthor="‘Abdu’l‑Bahá"\n\n'
      ),
      prefix(
        /^Praise be unto God Who hath adorned/gm,
        '\n\n#\nauthor="‘Abdu’l‑Bahá"\n\n'
      ),
      prefix(/^O my Lord and my Hope!/gm, '\n\n#\nauthor="‘Abdu’l‑Bahá"\n\n'),
      prefix(
        /^Grant, O my Lord, that this marriage/gm,
        '\n\n#\nauthor="‘Abdu’l‑Bahá"\n\n'
      ),
      prefix(/^He is the All‑Glorious\./gm, '\n\n#\nauthor="‘Abdu’l‑Bahá"\n\n'),
      prefix(
        /^O Lord, make Thou this marriage/gm,
        '\n\n#\nauthor="‘Abdu’l‑Bahá"\n\n'
      ),
      prefix(
        /^O Lord! Grant that this marriage/gm,
        '\n\n#\nauthor="‘Abdu’l‑Bahá"\n\n'
      ),
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
