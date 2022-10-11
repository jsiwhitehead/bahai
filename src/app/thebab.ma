(
  items: sortIds([
    "the-bab-selections-writings-bab-000",
    "the-bab-selections-writings-bab-001",
    "the-bab-selections-writings-bab-002",
    "the-bab-selections-writings-bab-003",
    "the-bab-selections-writings-bab-004",
    "the-bab-selections-writings-bab-005",
    "the-bab-selections-writings-bab-006",
    "the-bab-selections-writings-bab-007",
  ]),
  <a stack={60}>
    <a size={40} bold underline align="center" "The Báb" />
    <a stack={15}>
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
)