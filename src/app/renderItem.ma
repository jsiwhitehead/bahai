(p, index, author)=>
  (
    firstLine: p.paragraphs.findIndex((_, i)=> ! (infos[p.id] || []).includes(i)),
    color: colors.link[p.author || author],
    <a
      stack={25}
      align="justify"
      <a stack={15}>
        <a size={20} pad={[7, 0]} bold align="center" fill={colors.light[p.author || author]} color={color} style={{ border: "2px solid " + color, border-radius: "50px", width: "38px", margin: "0 auto" }}>{index + 1}</a>
        {readers[p.id] && <a align="center" size={16} italic color="#999">({readers[p.id]})</a>}
      </a>
      {...p.paragraphs.map((s, i)=>
        (
          isInfo: (infos[p.id] || []).includes(i),
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
          :
            <a
              size={isInfo ? 16 : 17}
              italic={isInfo}
              pad={[0, isInfo && 20]}
              indent={!isInfo && 20}
              color={isInfo && "#999"}
              style={{ clear: "both" }}
              {s}
            />
        )
      )}
      {p.author && <a align="right" italic color={color} style={{ clear: "both" }} {"— " + p.author}/>}
    />
  )