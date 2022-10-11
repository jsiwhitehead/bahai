(
  item: (index)=>
    (
      id: "bible-" + (index + 39 + "").padStart(3, '0'),
      <a color="blue" underline={hover} link={"/doc/" + id}>
        {index + 1}. {documents[id].title}
      </a>
    ),
  <a stack={60}>
    <a size={40} bold underline align="center" "The New Testament" />
    <a
      bar
      <a width={1 / 3} stack={15}>
        {...Array.from({ length: 9 }).map((_, i)=> item(i))}
      </a>
      <a width={1 / 3} stack={15}>
        {...Array.from({ length: 9 }).map((_, i)=> item(i + 9))}
      </a>
      <a width={1 / 3} stack={15}>
        {...Array.from({ length: 9 }).map((_, i)=> item(i + 18))}
      </a>
    />
  </a>
)