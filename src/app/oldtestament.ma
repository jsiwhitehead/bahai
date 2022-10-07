(
  item: (index)=>
    (
      id: "bible-" + (index + "").padStart(3, '0'),
      <a color="blue" underline={hover} link={"/the-old-testament/" + (index + "").padStart(2, '0')}>
        {documents[id].title} »
      </a>
    ),
  !url[1] ?
    <a stack={60}>
      <a size={40} bold underline align="center" "The Old Testament" />
      <a
        bar
        <a width={1 / 3} stack={15}>
          {...Array.from({ length: 13 }).map((_, i)=> item(i))}
        </a>
        <a width={1 / 3} stack={15}>
          {...Array.from({ length: 13 }).map((_, i)=> item(i + 13))}
        </a>
        <a width={1 / 3} stack={15}>
          {...Array.from({ length: 13 }).map((_, i)=> item(i + 26))}
        </a>
      />
    </a>
  :
    (
      doc: documents["bible-" + url[1].padStart(3, "0")],
      <a
        stack={60}
        <a stack={20}>
          <a color="blue" underline={hover} link="/the-old-testament" "« Back" />
          <a size={34} bold underline align="center">{doc.title}</a>
        </a>
        {render(doc)}
      />
    )
)