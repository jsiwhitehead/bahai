(doc, index)=>
  (
    baseLevel: 1,
    levelNumbers: false,
    paraNumbers: true,
    color: colors.link[doc.author] || colors.link["The World Centre"],
    allLines: doc.paragraphs.every(p => p.type || p.lines),
    <a
      stack={index === null ? 60 : 35}
      style={{ max-width: "620px", margin: "0 auto" }}
      <a size={index === null ? 34 : 26} bold underline={index === null} align="center">{doc.title}</a>
      <a stack={25} align="justify"
        {doc.reader &&
          <a size={16} italic pad={[0, 60]} color="#999" style={{ text-align-last: "center" }}>({doc.reader})</a>
        }
        {...doc.paragraphs.map((p, i)=>
          <a id={i} style={{ position: "relative" }}>
            {paraNumbers && (index === null || p.index === 1) &&
              <a
                size={13}
                color="#999"
                align="right"
                style={{ position: "absolute", top: "2px", left: "-60px", width: "50px" }}
                {index === null ? p.index : index + 1}
              />
            }
            <a stack={15}>
              {(
                level: p.section.length + baseLevel,
                p.section && !p.title ?
                  <a align="center">{"* * *"}</a>
                : p.section ?
                  <a
                    size={25 - (level * 2)}
                    uppercase={level === 1}
                    bold={level <= 2}
                    color="black"
                    italic={level > 2}
                    align="left"
                    pad={
                      level === 1 ? { top: 20 }
                      : level <= 2 ? 0
                      : [0, (level - 2) * 20]
                    }
                  >
                    {level === 4 || !levelNumbers ? "" :
                      p.section.join(".") + (level === 1 ? "." : "")
                    } {p.title}
                  </a>
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
                    <a size={17} color="black" pad={[0, 20]} bold>
                      {p.parts ? p.parts.map((part, i)=>
                        type(part) === "string" ? part :
                          documents[p.id].paragraphs[part.paragraph].text.slice(part.start, part.end)
                      ).join(" ") : documents[p.id].paragraphs[p.paragraphs[0]].text}
                    </a>
                    {(
                      refText: getRef(doc.paragraphs, i),
                      refText &&
                        <a
                          size={16}
                          italic
                          align="right"
                          color={colors.link[documents[p.id].author] || colors.link["The World Centre"]}
                          underline={hover}
                          link={"/doc/" + p.id + "#" + p.paragraphs[0]}
                          style={{ width: '75%', margin: '0 20px 0 auto' }}
                        >
                          ({getRef(doc.paragraphs, i)})
                        </a>
                    )}
                  </a>
                : (
                    parts: fillParts(quotes[doc.id]?.[i]?.parts, p.text),
                    <a
                      inline
                      size={p.type === "info" ? 16 : 17}
                      italic={p.type === "info"}
                      uppercase={p.type === "call"}
                      indent={p.index === 1 || p.type ? 0 : 20}
                      pad={p.type ? [0, 60] : 0}
                      color={doc.type === 'Prayer' && p.type && "#999"}
                      style={{ clear: "both", text-align-last: p.type && "center" }}
                    >{...parts.map((part, i)=>
                        (
                          fill: part.count && "rgb(" + [255, 240 - part.count * 10, 240 - part.count * 10].join(", ") + ")",
                          text: p.text.slice(part.start, part.end),
                          p.index === 1 && i === 0 ?
                            <a
                              fill={fill}
                              size={17 * 3}
                              line={1}
                              color={color}
                              pad={{ right: 8 }}
                              style={{ float: "left", width: "auto" }}
                            >{text}</a>
                          :
                            <a fill={fill} pad={[2.5, 0]}>{text}</a>
                        )
                      )}</a>
                  )
              )}
              {...(quotes[doc.id]?.[i]?.refs || []).map(r =>
                <a
                  size={16}
                  italic
                  align="left"
                  color={colors.link[documents[r.id].author] || colors.link["The World Centre"]}
                  underline={hover}
                  link={"/doc/" + r.id + "#" + r.paragraph}
                  style={{ width: '75%', margin: '0 auto 0 0' }}
                >
                  ({unique(
                    [
                      documents[r.id].author,
                      ...documents[r.id].path,
                      documents[r.id].title ||
                        (documents[r.id].item && ("#" + documents[r.id].item)),
                    ].filter(x => x)
                  ).join(", ")})
                </a>
              )}
            </a>
          </a>
        )}
        {doc.type === "Prayer" && doc.author &&
          <a align="right" italic color={color} style={{ clear: "both" }} {"— " + doc.author}/>
        }
      />
    />
  )