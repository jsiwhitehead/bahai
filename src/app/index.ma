(
  size: 17,
  button: (label)=>
    <a
      pad={10}
      fill={url[0] === toUrl(label) ? "white" : hover ? "white" : "#ddd"}
      round={[10, 10, 0, 0]}
      bold
      underline={url[0] === toUrl(label)}
      link={"/" + toUrl(label)}
      {label}
    />,
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
        <a size={24} bold underline "Bahá’í Library" />
        {button("Prayers")}
        <a
          stack={15}
          {...[
            "The Administrative Order",
            "‘Abdu’l‑Bahá",
            "Bahá’u’lláh",
            "The Báb",
          ].map(label=> button(label))}
        />
        {button("The Qur’án")}
        {button("The Bible")}
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
            : url[0]=== "the-bible" ?
              bible
            : url[0]=== "the-quran" ?
              quran
            :
              "Hi"
          }
        />
      />
    />
  )
)