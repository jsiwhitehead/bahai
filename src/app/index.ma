(
  size: 17,
  doc: url[0]=== "doc" && documents[url[1]],
  button: (label)=>
    (
      active: (url[0] === toUrl(label)) || (toUrl(doc?.author) === toUrl(label)),
      <a
        pad={10}
        fill={active ? "white" : hover ? "white" : "#ddd"}
        round={[10, 10, 0, 0]}
        bold
        underline={active}
        link={"/" + toUrl(label)}
        {label}
      />
    ),
  map(
    <a
      size={size}
      font="Atkinson Hyperlegible"
      color="#333"
      style={{ height: "100%" }}
      <a
        width={235}
        fill="#eee"
        pad={[20, 20, 20, 0]}
        stack={40}
        style={{ position: "fixed", height: "100%" }}
        <a size={24} bold underline link="/" "Bahá’í Library" />
        {button("Prayers")}
        <a
          stack={10}
          {...[
            "The Administrative Order",
            "‘Abdu’l‑Bahá",
            "Bahá’u’lláh",
            "The Báb",
          ].map(label=> button(label))}
        />
        {button("The Qur’án")}
        {button("The New Testament")}
        {button("The Old Testament")}
      />
      <a
        pad={{ left: 235 }}
        <a
          pad={[50]}
          {
            url.length === 0 ?
              "Hello"
            : url[0]=== "prayers" ?
              prayers
            : url[0]=== "the-new-testament" ?
              newtestament
            : url[0]=== "the-old-testament" ?
              oldtestament
            : url[0]=== "the-quran" ?
              quran
            : url[0]=== "doc" ?
              (
                doc: documents[url[1]],
                <a
                  stack={20}
                  <a color="blue" underline={hover} link={"/" + toUrl(doc.author)} "« Back" />
                  {render(doc)}
                />
              )
            :
              "Hi"
          }
        />
      />
    />
  )
)