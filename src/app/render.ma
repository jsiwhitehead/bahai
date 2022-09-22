(doc, index)=>
  (
    color: colors.link[doc.author],
    allLines: doc.paragraphs.every(p => p.type || p.lines),
    <a
      stack={25}
      align="justify"
      {doc.reader &&
        <a size={16} italic color="#999">{doc.reader}</a>
      }
      {...doc.paragraphs.map((p, i)=>
        <a id={i} style={{ position: "relative" }}>
          {(index === null || p.index === 1) &&
            <a
              size={13}
              color="#999"
              align="right"
              style={{ position: "absolute", top: "2px", left: "-60px", width: "50px" }}
              {index === null ? p.index : index + 1}
            />
          }
          <a stack={15}>
            {
              p.section && !p.title ?
                <a align="center">{"* * *"}</a>
              : p.section ?
                <a
                  size={25 - (p.section.length * 2)}
                  uppercase={p.section.length === 1}
                  bold={p.section.length <= 2}
                  color="black"
                  italic={p.section.length > 2}
                  pad={
                    p.section.length === 1 ?
                      { top: 20 }
                    : p.section.length <= 2 ?
                      0
                    :
                      [0, (p.section.length - 2) * 20]
                  }
                >
                  {p.section.length === 4 ? "" :
                    p.section.join(".") + (p.section.length === 1 ? "." : "")
                  } {p.title}
                </a>
              : p.type === "info" ?
                <a
                  size={16}
                  italic
                  style={{ clear: "both" }}
                  {p.text}
                />
              : p.type === "call" ?
                <a
                  size={17}
                  uppercase
                  style={{ clear: "both" }}
                  {p.text}
                />
              : p.lines ?
                <a stack={17 / 2}>
                  {...p.lines.slice(0, -1).map((start, i)=>
                    <a
                      pad={allLines ? 0 : [0, 40]}
                      uppercase={i === 0 && doc.path.includes("The Hidden Words")}
                      size={17}
                      {p.text.slice(start, p.lines[i + 1] - 1)}
                    />
                  )}
                </a>
              : p.id ?
                <a stack={15}>
                  <a size={17} color="black" pad={{ left: 20 }} bold>
                    {p.parts.map((part, i)=>
                      type(part) === "string" ? part :
                        documents[p.id].paragraphs[part.paragraph].text.slice(part.start, part.end)
                    ).join(" ")}
                  </a>
                  <a
                    size={16}
                    italic
                    align="right"
                    color={colors.link[documents[p.id].author]}
                    underline={hover}
                    link={"/doc/" + p.id + "#" + p.paragraphs[0]}
                    style={{ width: '75%', margin: '0 0 0 auto' }}
                  >
                    ({[
                      documents[p.id].author,
                      ...documents[p.id].path,
                      documents[p.id].title ||
                        (documents[p.id].item && ("#" + documents[p.id].item)),
                      (p.paragraphs.length === 1 ? "para " : "paras ") +
                        p.paragraphs
                          .map(i=> documents[p.id].paragraphs[i].index)
                          .filter(i=> i !== undefined)
                          .join(", "),
                    ].filter(x => x).join(", ")})
                  </a>
                </a>
              : p.index === 1 ?
                (
                  first: firstChar(p.text) + 1,
                  <a>
                    <a
                      size={17 * 3}
                      line={1}
                      color={color}
                      pad={{ right: 8 }}
                      style={{ float: "left", width: "auto" }}
                    >
                      {p.text.slice(0, first)}
                    </a>
                    {p.text.slice(first)}
                  </a>
                )
              :
                <a size={17} indent={20} style={{ clear: "both" }}>{p.text}</a>
            }
            {...(quotes[doc.id]?.[i]?.refs || []).map(r =>
              <a
                size={16}
                italic
                align="left"
                color={colors.link[documents[r.id].author]}
                underline={hover}
                link={"/doc/" + r.id + "#" + r.paragraph}
                style={{ width: '75%', margin: '0 auto 0 0' }}
              >
                ({[
                  documents[r.id].author,
                  ...documents[r.id].path,
                  documents[r.id].title ||
                    (documents[r.id].item && ("#" + documents[r.id].item)),
                ].filter(x => x).join(", ")})
              </a>
            )}
          </a>
        </a>
      )}
      {doc.type === "Prayer" && doc.author &&
        <a align="right" italic color={color} style={{ clear: "both" }} {"— " + doc.author}/>
      }
    />
  )