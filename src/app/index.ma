(
  size: 17,
  map(
    <a
      size={size}
      font="Atkinson Hyperlegible"
      color="#333"
      pad={50}
      style={{ max-width: "720px", margin: "0 auto" }}
      {
        url.length === 0 ?
          <a stack={60}>
            <a size={40} bold underline "Bahá’í Library" />
            <a color="blue" underline={hover} link="/prayers" "Prayers »" />
            <a color="blue" underline={hover} link="/quotes" "Quotes »" />
            {...library.map(group=>
              <a stack={15}>
                <a size={20} bold {group.title} />
                {...group.items.map(key=>
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
            )}
          </a>
        : url[0]=== "quotes" ?
          <a
            stack={60}
            <a stack={20}>
              <a color="blue" underline={hover} link="/" "« Back" />
              <a size={40} bold underline align="center" "Quotes" />
            </a>
            {...topQuotes.map(quote=> (
              doc: documents[quote.id],
              para: doc.paragraphs[quote.paragraph],
              parts: quote.parts,
              <a stack={15}>
                <a inline size={17} align="justify">{parts[0].start > 0 ? ". . . " : ""}{...parts.flatMap((part, i)=>
                    [
                      i && (parts[i - 1]?.end !== part.start) ? " . . . " : "",
                      type(part) === "string" ? part :
                        <a fill={"rgb(" + [255, 240 - part.count * 10, 240 - part.count * 10].join(", ") + ")"} pad={[2.5, 0]}>{para.text.slice(part.start, part.end)}</a>,
                    ]
                  )}{parts[parts.length - 1].end < para.text.length ? " . . ." : ""}</a>
                <a
                  size={16}
                  italic
                  align="right"
                  color={colors.link[doc.author]}
                  underline={hover}
                  link={"/doc/" + quote.id + "#" + quote.paragraph}
                  style={{ width: '75%', margin: '0 0 0 auto' }}
                >
                  ({unique(
                    [
                      doc.author,
                      ...doc.path,
                      doc.title ||
                        (doc.item && ("#" + doc.item)),
                      para.index && ("para " + para.index),
                    ].filter(x => x)
                  ).join(", ")})
                </a>
              </a>
            ))}
          />
        : url[0]=== "prayers" && !url[1] ?
          <a stack={60}>
            <a stack={20}>
              <a color="blue" underline={hover} link="/" "« Back" />
              <a size={40} bold underline align="center" "Bahá’í Prayers" />
            </a>
            <a
              stack={40}
              <a stack={15}
                <a size={20} bold "Praise" />
                {...["Praise and Glorification", "Draw Hearts to Thee"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Individual" />
                {...["Individual Growth", "Service and Teaching"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Community" />
                {...["Collective Growth", "Advancing the Cause"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Assistance" />
                {...["Forgiveness and Healing", "Tests and Difficulties"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "People" />
                {...["Children and Youth", "Babies and Infants", "Marriage", "Departed"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Occasion" />
                {...["Gathering", "Morning", "Evening", "Calendar", "The Fast"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Special" />
                {...["Obligatory Prayers", "Special", "Government", "Narrative"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
            />
          </a>
        : url[0]=== "prayers" && url[1] ?
          (
            name: decodeURIComponent(url[1]),
            collection: collections[name],
            <a
              stack={60}
              <a stack={20}>
                <a color="blue" underline={hover} link="/prayers" "« Back" />
                <a size={40} bold underline align="center" {name} />
              </a>
              {...collection.map(render)}
            />
          )
        :
          <a
            stack={60}
            <a stack={20}>
              <a color="blue" underline={hover} link="/" "« Back" />
              <a size={34} bold underline align="center">
                {documents[url[1]].title ||
                  ([...documents[url[1]].path.slice(-1), "#" + documents[url[1]].item].join(" "))
                }
              </a>
              {documents[url[1]].translated &&
                <a size={24} bold align="center" {"(" + documents[url[1]].translated + ")"} />
              }
            </a>
            {render(documents[url[1]])}
          />
      }
    />
  )
)