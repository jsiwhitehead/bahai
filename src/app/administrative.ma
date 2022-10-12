(
  groups: [
    {
      "title": "Shoghi Effendi",
      "items": sortIds([
        "shoghi-effendi-advent-divine-justice-000",
        "shoghi-effendi-god-passes-by-001",
        "shoghi-effendi-promised-day-come-000",
        "shoghi-effendi-world-order-bahaullah-001",
        "shoghi-effendi-world-order-bahaullah-002",
        "shoghi-effendi-world-order-bahaullah-003",
        "shoghi-effendi-world-order-bahaullah-004",
        "shoghi-effendi-world-order-bahaullah-005",
        ["shoghi-effendi-world-order-bahaullah-006"],
        ["shoghi-effendi-world-order-bahaullah-007"],
        ["shoghi-effendi-world-order-bahaullah-008"],
        ["shoghi-effendi-world-order-bahaullah-009"],
        "shoghi-effendi-world-order-bahaullah-010"
      ])
    },
    {
      "title": "The Universal House of Justice",
      "items": sortIds([
        "the-universal-house-of-justice-the-institution-of-the-counsellors-000",
        "the-universal-house-of-justice-messages-007",
        "the-universal-house-of-justice-messages-016",
        "the-universal-house-of-justice-messages-045",
        "the-universal-house-of-justice-messages-077",
        "the-universal-house-of-justice-messages-116",
        "the-universal-house-of-justice-messages-133",
        "the-universal-house-of-justice-messages-014",
        "the-universal-house-of-justice-messages-079"
      ])
    },
    {
      "title": "World Centre",
      "items": sortIds([
        "official-statements-commentaries-bahaullah-000",
        "official-statements-commentaries-prosperity-humankind-000",
        "official-statements-commentaries-turning-point-all-nations-000",
        "official-statements-commentaries-century-light-001",
        "official-statements-commentaries-one-common-faith-001",
        "world-centre-higher-functioning-000",
        "world-centre-entry-by-troops-000",
        "world-centre-frontiers-learning-000",
        "the-universal-house-of-justice-turning-point-000",
        "the-universal-house-of-justice-turning-point-002",
        "the-universal-house-of-justice-turning-point-003",
        "the-universal-house-of-justice-turning-point-004",
        "the-universal-house-of-justice-turning-point-005"
      ])
    },
  ],
  renderGroup: (group) => <\ stack={15}>
    <\ size={20} bold>{group.title}</>
    {...group.items.map(key=>
      (
        k: type(key) === "string" ? key : key[0],
        <\ color="blue" underline={hover} link={`/doc/${k}`}>
          {type(key) === "string" ?
            documents[k].title
          :
            [
              documents[k].path[documents[k].path.length - 1],
              documents[k].title
            ].join(", ")
          }{
            documents[k].translated && ` (${documents[k].translated})`
          } »
        </>
      )
    )}
  </>,
  <\ stack={60}>
    <\ size={40} bold underline align="center">The Administrative Order</>
    <\ bar>
      <\ width={1 / 2}>
        <\ pad={{ right: 20 }}>
          {renderGroup(groups[0])}
        </>
      </>
      <\ width={1 / 2}>
        <\ pad={{ left: 20 }}>
          {renderGroup(groups[1])}
        </>
      </>
    </>
    <\ bar>
      <\ width={1 / 2}>
        <\ pad={{ right: 20 }}>
          {renderGroup(groups[2])}
        </>
      </>
      <\ width={1 / 2}>
      </>
    </>
  </>
)