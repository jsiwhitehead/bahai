(p, index, author)=>
  (
    firstLine: p.paragraphs.findIndex((_, i)=> ! p.lines?.[i]),
    color: colors.link[p.author || author],
    <a
      style={{ position: "relative" }}
      <a
        stack={25}
        align="justify"
        {p.reader && <a align="center" size={16} italic color="#999">({p.reader})</a>}
        {...p.paragraphs.map((s, i)=>
          <a>
            <a
              color="#999"
              align="center"
              style={{ position: "absolute", top: 0, left: "-80px", width: "50px" }}
            >
              {index + 1}.{i + 1}
            </a>
            {(
              i === firstLine ?
                <a>
                  <a
                    size={17 * 3}
                    line={1}
                    color={color}
                    pad={{ right: 8 }}
                    style={{ float: "left", width: "auto" }}
                  >
                    {s.slice(0,1)}
                  </a>
                  {s.slice(1)}
                </a>
              : p.lines?.[i] === "info" ?
                <a
                  size={16}
                  italic
                  pad={[0, 20]}
                  color="#999"
                  style={{ clear: "both" }}
                  {s}
                />
              : p.lines?.[i] === "call" ?
                <a
                  size={17}
                  uppercase
                  style={{ clear: "both" }}
                  {s}
                />
              :
                <a size={17} indent={20} style={{ clear: "both" }} {s.replace(/\. \. \./g, '. . .')} />
            )}
          </a>
        )}
        {p.author && <a align="right" italic color={color} style={{ clear: "both" }} {"— " + p.author}/>}
      />
    />
  )