(
  item: (index)=>
    (
      id: "quran-" + (index + "").padStart(3, '0'),
      <a color="blue" underline={hover} link={"/the-quran/" + (index + "").padStart(2, '0')}>
        {index + 1}. {documents[id].title} »
      </a>
    ),
  !url[1] ?
    <a stack={60}>
      <a size={40} bold underline align="center" "The Qur’án" />
      <a
        bar
        <a width={1 / 3} stack={15}>
          {...Array.from({ length: 38 }).map((_, i)=> item(i))}
        </a>
        <a width={1 / 3} stack={15}>
          {...Array.from({ length: 38 }).map((_, i)=> item(i + 38))}
        </a>
        <a width={1 / 3} stack={15}>
          {...Array.from({ length: 38 }).map((_, i)=> item(i + 76))}
        </a>
      />
    </a>
  :
    (
      doc: documents["quran-0" + url[1]],
      <a
        stack={60}
        <a stack={20}>
          <a color="blue" underline={hover} link="/the-quran" "« Back" />
          <a size={34} bold underline align="center">{doc.title}</a>
        </a>
        {render(doc)}
      />
    )
)