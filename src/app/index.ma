(
  size: 17,
  renderPrayer: (p, index)=>
    (
      firstLine: p.paragraphs.findIndex((_, i)=> ! (infos[p.id] || []).includes(i)),
      color: colors.link[p.author],
      <a
        stack={25}
        align="justify"
        <a stack={15}>
          <a size={20} pad={[7, 0]} bold align="center" fill={colors.light[p.author]} color={color} style={{ border: "2px solid " + color, border-radius: "50px", width: "38px", margin: "0 auto" }}>{index + 1}</a>
          {readers[p.id] && <a align="center" size={16} italic color="#999">({readers[p.id]})</a>}
        </a>
        {...p.paragraphs.map((s, i)=>
          (
            isInfo: (infos[p.id] || []).includes(i),
            i === firstLine ?
              <a>
                <a
                  size={size * 3}
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
        <a align="right" italic color={color} style={{ clear: "both" }} {"— " + p.author}/>
      />
    ),
  map(
    <a
      size={size}
      font="PT Serif"
      color="#333"
      pad={50}
      stack={50}
      style={{ max-width: "700px", margin: "0 auto" }}
      <a size={40} bold underline "Bahá’í Library" />
      {
        url.length === 0 ?
          <a
            stack={40}
            <a color="blue" underline={hover} link={"/collection/" + "Learning"} {"Learning" + " »"} />
            <a stack={15}
              <a size={20} bold "Praise" />
              {...["Praise and Glorification", "Draw Hearts to Thee"].map(k=>
                <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
              )}
            />
            <a stack={15}
              <a size={20} bold "Individual" />
              {...["Individual Growth", "Service and Teaching"].map(k=>
                <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
              )}
            />
            <a stack={15}
              <a size={20} bold "Community" />
              {...["Collective Growth", "Advancing the Cause"].map(k=>
                <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
              )}
            />
            <a stack={15}
              <a size={20} bold "Assistance" />
              {...["Forgiveness and Healing", "Tests and Difficulties"].map(k=>
                <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
              )}
            />
            <a stack={15}
              <a size={20} bold "People" />
              {...["Children and Youth", "Babies and Infants", "Marriage", "Departed"].map(k=>
                <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
              )}
            />
            <a stack={15}
              <a size={20} bold "Occasion" />
              {...["Gathering", "Morning", "Evening", "Calendar", "The Fast"].map(k=>
                <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
              )}
            />
            <a stack={15}
              <a size={20} bold "Special" />
              {...["Obligatory Prayers", "Special", "Government", "Narrative"].map(k=>
                <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
              )}
            />
            <a stack={15}
              <a size={20} bold "Ruhi" />
              {...["Children’s Classes: Prayers for Children", "Children’s Classes: Prayers for Teachers", "Glimmerings of Hope"].map(k=>
                <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
              )}
            />
          />
        : url[0]=== "collection" ?
          (
            name: decodeURIComponent(url[1]),
            collection: collections[name],
            <a
              stack={60}
              <a color="blue" underline={hover} link="/" "« Back" />
              <a size={24} bold underline "Collection: " {name} />
              {...collection.map(renderPrayer)}
            />
          )
        :
          (
            filteredPrayers:
              prayers.filter(p=> p.length >= range[url[0]][0] && p.length < range[url[0]][1]),
            <a
              stack={60}
              <a color="blue" underline={hover} link="/" "« Back" />
              {...filteredPrayers.map(renderPrayer)}
            />
          )
      }
    />
  )
)