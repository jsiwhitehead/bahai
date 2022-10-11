(
  item: (index)=>
    (
      id: "bible-" + (index + "").padStart(3, '0'),
      <a color="blue" underline={hover} link={"/doc/" + id}>
        {index + 1}. {documents[id].title}
      </a>
    ),
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
)