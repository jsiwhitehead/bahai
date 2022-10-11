(
  items: sortIds([
    "compilations-bahai-funds-contributions-000",
    "compilations-bahai-meetings-000",
    "compilations-chaste-holy-life-000",
    "compilations-codification-law-huququllah-000",
    "compilations-consultation-000",
    "compilations-excellence-all-things-000",
    "compilations-family-life-000",
    "compilations-fire-and-light-000",
    "compilations-give-me-thy-grace-serve-thy-loved-ones-000",
    "compilations-huququllah-right-god-000",
    "compilations-importance-obligatory-prayer-fasting-000",
    "compilations-importance-prayer-meditation-devotional-attitude-000",
    "compilations-institution-mashriqul-adhkar-000",
    "compilations-issues-related-study-bahai-faith-000",
    "compilations-local-spiritual-assembly-000",
    "compilations-music-000",
    "compilations-peace-000",
    "compilations-power-divine-assistance-000",
    "compilations-prayer-devotional-life-000",
    "compilations-sanctity-nature-bahai-elections-000",
    "compilations-scholarship-000",
    "compilations-significance-formative-age-our-faith-000",
    "compilations-social-action-000",
    "compilations-trustworthiness-000",
    "compilations-universal-house-of-justice-compilation-000",
    "compilations-women-000",
  ]),
  <a stack={60}>
    <a size={40} bold underline align="center" "Compilations" />
    <a
      bar
      <a width={1 / 2}>
        <a stack={15} pad={{ right: 20 }}>
          <a size={20} bold "Ruhi" />
          {...Array.from({ length: 10 }).map((_, i)=>
            <a bar
              <a width={1 / 4}>Book {i + 1}:</a>
              <a color="blue" underline={hover} link={"/doc/ruhi" + (i + 1) + "-000"} width={1 / 4}>Unit 1</a>
              <a color="blue" underline={hover} link={"/doc/ruhi" + (i + 1) + "-001"} width={1 / 4}>Unit 2</a>
              <a color="blue" underline={hover} link={"/doc/ruhi" + (i + 1) + "-002"} width={1 / 4}>Unit 3</a>
            />
          )}
        </a>
      </a>
      <a width={1 / 2}>
        <a stack={15} pad={{ left: 20 }}>
          <a size={20} bold "Compilations" />
          {...items.map(key=>
            (
              k: type(key) === "string" ? key : key[0],
              <a color="blue" underline={hover} link={"/doc/" + k}>
                {type(key) === "string" ?
                  documents[k].title
                :
                  [
                    documents[k].path[documents[k].path.length - 1],
                    documents[k].title
                  ].join(", ")
                }{
                  documents[k].translated && (" (" + documents[k].translated + ")")
                } »
              </a>
            )
          )}
        </a>
      </a>
    />
  </a>
)