(
  items: sortIds([
    "bahaullah-call-divine-beloved-001",
    "bahaullah-call-divine-beloved-002",
    "bahaullah-call-divine-beloved-003",
    "bahaullah-call-divine-beloved-007",
    ["bahaullah-hidden-words-000"],
    ["bahaullah-hidden-words-001"],
    "bahaullah-gems-divine-mysteries-001",
    "bahaullah-kitab-i-iqan-002",
    "bahaullah-summons-lord-hosts-001",
    "bahaullah-summons-lord-hosts-002",
    "bahaullah-summons-lord-hosts-003",
    "bahaullah-summons-lord-hosts-004",
    "bahaullah-summons-lord-hosts-005",
    "bahaullah-tabernacle-unity-001",
    "bahaullah-tabernacle-unity-002",
    "bahaullah-tabernacle-unity-003",
    "bahaullah-kitab-i-aqdas-003",
    "bahaullah-epistle-son-wolf-000"
  ]),
  <\ stack={60}>
    <\ size={40} bold underline align="center">Bahá’u’lláh</>
    <\ stack={15}>
      {...items.map(key=>
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
    </>
  </>
)