(
  item: (index)=>
    (
      id: "bible-" + (index + "").padStart(3, '0'),
      <a color="blue" underline={hover} link={"/the-bible/" + (index + "").padStart(2, '0')}>
        {documents[id].title} »
      </a>
    ),
  !url[1] ?
    <a stack={60}>
      <a size={40} bold underline align="center" "The Bible" />
      <a
        bar
        <a width={1 / 3} stack={15}>
          <a size={20} bold "Old Testament" />
          {...Array.from({ length: 39 }).map((_, i)=> item(i))}
        </a>
        <a width={1 / 3} stack={15}>
          <a size={20} bold "New Testament" />
          {...Array.from({ length: 27 }).map((_, i)=> item(i + 39))}
        </a>
        <a width={1 / 3} stack={15}>
          <a size={20} bold "Apocrypha" />
          {...Array.from({ length: 18 }).map((_, i)=> item(i + 66))}
        </a>
      />
    </a>
  :
    (
      doc: documents["bible-0" + url[1]],
      <a
        stack={60}
        <a stack={20}>
          <a color="blue" underline={hover} link="/the-bible" "« Back" />
          <a size={34} bold underline align="center">{doc.title}</a>
        </a>
        {render(doc)}
      />
    )
)