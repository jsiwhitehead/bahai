(p, index, author)=>
  (
    firstLine: p.paragraphs.findIndex((_, i)=> ! p.lines?.[i]),
    color: colors.link[p.author || author],
    <a
      style={{ position: "relative" }}
      {index !== null &&
        <a
          color="#999"
          align="center"
          style={{ position: "absolute", top: 0, left: "-60px", width: "40px" }}
          {index + 1}
        />
      }
      <a
        stack={25}
        align="justify"
        {readers[p.id] && <a align="center" size={16} italic color="#999">({readers[p.id]})</a>}
        {...p.paragraphs.map((s, i)=>
          (
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
              <a size={17} indent={20} style={{ clear: "both" }} {s} />
          )
        )}
        {p.author && <a align="right" italic color={color} style={{ clear: "both" }} {"— " + p.author}/>}
      />
    />
  )