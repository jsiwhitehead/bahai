(
  size: 17,
  doc: url[0] === "doc" && documents[url[1]],
  group: doc && toUrl(
    doc.type === 'Prayer' ?
      'prayers'
    : doc.id.startsWith('quran') ?
      'the-quran'
    : doc.id.startsWith('bible') ?
      toInt(doc.id.slice(-3)) < 39 ? 'the-old-testament' : 'the-new-testament'
    : doc.id.startsWith('ruhi') || doc.id.startsWith('compilations') ?
      'compilations'
    : ["‘Abdu’l‑Bahá", "Bahá’u’lláh", "The Báb"].includes(doc.author) ?
      doc.author
    :
      'the-administrative-order'
  ),
  button: (label)=>
    (
      active: (url[0] === toUrl(label)) || (group === toUrl(label)),
      <\
        pad={10}
        fill={(active || hover) ? "white" : "#ddd"}
        round={{ left: 10 }}
        bold
        underline={active}
        link={`/${toUrl(label)}`}
      >
        {label}
      </>
    ),
  map(
    <\
      size={size}
      font="Atkinson Hyperlegible"
      color="#333"
      style={{ height: "100%" }}
    >
      <\
        width={235}
        fill="#eee"
        pad={[20, 20, 20, 0]}
        stack={25}
        style={{ position: "fixed", height: "100%" }}
      >
        <\ size={24} bold underline link="/">Bahá’í Library</>
        {button("Prayers")}
        {button("Compilations")}
        {button("Quotes")}
        <\ stack={5}>
          {...[
            "The Administrative Order",
            "‘Abdu’l‑Bahá",
            "Bahá’u’lláh",
            "The Báb",
          ].map(label=> button(label))}
        </>
        {button("The Qur’án")}
        {button("The New Testament")}
        {button("The Old Testament")}
      </>
      <\ pad={{ left: 235 }}>
        <\ pad={[50]}>
          {
            url.length === 0 ?
              "Hello"
            : url[0]=== "prayers" ?
              prayers
            : url[0]=== "compilations" ?
              compilations
            : url[0]=== "quotes" ?
              quotes
            : url[0]=== "the-administrative-order" ?
              administrative
            : url[0]=== "abdul-baha" ?
              abdulbaha
            : url[0]=== "bahaullah" ?
              bahaullah
            : url[0]=== "the-bab" ?
              thebab
            : url[0]=== "the-new-testament" ?
              newtestament
            : url[0]=== "the-old-testament" ?
              oldtestament
            : url[0]=== "the-quran" ?
              quran
            : url[0]=== "doc" ?
              (
                doc: documents[url[1]],
                <\ stack={20}>
                  <\ color="blue" underline={hover} link={`/${group}`}>« Back</>
                  {render(doc)}
                </>
              )
            :
              "Hi"
          }
        </>
      </>
    </>
  )
)