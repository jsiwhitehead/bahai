(
  items: sortIds([
    "abdul-baha-secret-divine-civilization-000",
    "abdul-baha-tablet-august-forel-000",
    "abdul-baha-tablets-hague-abdul-baha-000",
    "abdul-baha-tablets-hague-abdul-baha-001",
    "abdul-baha-travelers-narrative-000",
    "abdul-baha-will-testament-abdul-baha-000"
  ]),
  <a stack={60}>
    <a size={40} bold underline align="center" "‘Abdu’l‑Bahá" />
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