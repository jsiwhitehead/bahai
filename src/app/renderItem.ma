(p, index, author)=>
  (
    firstLine: p.paragraphs.findIndex((_, i)=> ! p.lines?.[i]),
    color: colors.link[p.author || author],
    <a
      stack={25}
      align="justify"
      {
        ((index !== null) || readers[p.id]) &&
        <a stack={15}>
          {index !== null && <a
            size={18}
            pad={[7, 0]}
            bold
            align="center"
            fill={colors.light[p.author || author]}
            color={color}
            style={{
              border: "2px solid " + color,
              border-radius: "50px",
              width: "36px",
              margin: "0 auto"
            }}
          >
              {index + 1}
          </a>}
          {readers[p.id] && <a align="center" size={16} italic color="#999">({readers[p.id]})</a>}
        </a>
      }
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
  )