(doc, index)=>
  (
    color: colors.link[doc.author],
    renderLine: (line, wide)=>
      line.type === "info" ?
        <a
          size={16}
          italic
          pad={wide ? 0 : [0, 20]}
          color="#888"
          style={{ clear: "both" }}
          {line.text}
        />
      : line.type === "call" ?
        <a
          size={17}
          uppercase
          style={{ clear: "both" }}
          {line.text}
        />
      :
        null,
    <a
      stack={25}
      align="justify"
      {doc.reader &&
        <a size={16} italic color="#888">{doc.reader}</a>
      }
      {...doc.paragraphs.map((text, i)=>
        <a stack={25}>
          {doc.sections?.[i] &&
            <a stack={25} bold pad={{ top: i && 35, bottom: 20 }} align="center">
              {...doc.sections[i].map(s=><a size={s.title ? 30 : 20}>{s.title || "* * *"}</a>)}
            </a>
          }
          {...(doc.lines?.[i] || []).map((line, j)=>
            renderLine(line, i === 0 || doc.sections?.[i])
          )}
          <a id={i + 1} style={{ position: "relative" }}>
            {(index === null || i === 0) &&
              <a
                color="#888"
                align="center"
                style={{ position: "absolute", top: 0, left: "-80px", width: "50px" }}
                {(index ?? i) + 1}
              />
            }
            <a stack={15}>
              {(
                doc.path?.[0] === "The Hidden Words" ?
                  (
                    parts: text.split('\n'),
                    <a stack={17 / 2}>
                      <a size={17} uppercase {parts[0]} />
                      <a size={17} {parts[1]} />
                    </a>
                  )
                : i === 0 || doc.sections?.[i] ?
                  <a>
                    <a
                      size={17 * 3}
                      line={1}
                      color={color}
                      pad={{ right: 8 }}
                      style={{ float: "left", width: "auto" }}
                    >
                      {text.slice(0,1)}
                    </a>
                    {text.slice(1)}
                  </a>
                : doc.sources?.[i] ?
                  <a size={17} pad={{ left: 20 }} style={{ clear: "both" }} {text} />
                :
                  <a size={17} indent={20} style={{ clear: "both" }} {text} />
              )}
              {doc.sources?.[i] &&
                <a
                  size={16}
                  italic
                  align="right"
                  color="blue"
                  underline={hover}
                  link={"/doc/" + doc.sources[i].join('#')}
                >
                  ({join([
                    documents[doc.sources[i][0]].author,
                    ...documents[doc.sources[i][0]].path,
                    documents[doc.sources[i][0]].title,
                    doc.sources[i][1] && "para. " + doc.sources[i][1],
                  ], ", ")})
                </a>
              }
            </a>
          </a>
          {...(i === doc.paragraphs.length - 1 ? doc.lines?.[i + 1] || [] : []).map((line, j)=>
            renderLine(line, true)
          )}
        </a>
      )}
      {doc.type === "Prayer" && doc.author &&
        <a align="right" italic color={color} style={{ clear: "both" }} {"— " + doc.author}/>
      }
    />
  )