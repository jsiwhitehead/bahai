(doc, index)=>
  (
    color: colors.link[doc.author],
    <a
      stack={25}
      align="justify"
      {doc.reader &&
        <a size={16} italic color="#999">{doc.reader}</a>
      }
      {...doc.paragraphs.map((text, i)=>
        <a>
          {doc.sections?.[i] &&
            <a stack={25} size={30} bold pad={{ top: i && 35, bottom: 45 }} align="center">
              {...doc.sections[i].map(s=><a>{s.title}</a>)}
            </a>
          }
          <a id={i} style={{ position: "relative" }}>
            {(index === undefined || doc.lines?.[i] === "first") &&
              <a
                color="#999"
                align="center"
                style={{ position: "absolute", top: 0, left: "-80px", width: "50px" }}
                {(index ?? i) + 1}
              />
            }
            <a stack={15}>
              {(
                doc.lines?.[i] === "first" ?
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
                : doc.lines?.[i] === "info" ?
                  <a
                    size={16}
                    italic
                    pad={doc.lines?.[i + 1] ? 0 : [0, 20]}
                    color="#999"
                    style={{ clear: "both" }}
                    {text}
                  />
                : doc.lines?.[i] === "call" ?
                  <a
                    size={17}
                    uppercase
                    style={{ clear: "both" }}
                    {text}
                  />
                : doc.sources?.[i] ?
                  <a size={17} pad={{ left: 20 }} style={{ clear: "both" }} {text} />
                :
                  <a size={17} indent={20} style={{ clear: "both" }} {text} />
              )}
              {doc.sources?.[i] &&
                <a
                  italic
                  align="right"
                  color="blue"
                  underline={hover}
                  link={"/" + doc.sources[i].join('#')}
                >
                  ({doc.sources[i].join(', ')})
                </a>
              }
            </a>
          </a>
        </a>
      )}
      {doc.type === "Prayer" && doc.author &&
        <a align="right" italic color={color} style={{ clear: "both" }} {"— " + doc.author}/>
      }
    />
  )