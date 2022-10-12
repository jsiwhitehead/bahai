(
  item: (index)=>
    (
      id: `bible-${`${index}`.padStart(3, '0')}`,
      <\ color="blue" underline={hover} link={`/doc/${id}`}>
        {index + 1}. {documents[id].title}
      </>
    ),
  <\ stack={60}>
    <\ size={40} bold underline align="center">The Old Testament</>
    <\ bar>
      <\ width={1 / 3} stack={15}>
        {...Array.from({ length: 13 }).map((_, i)=> item(i))}
      </>
      <\ width={1 / 3} stack={15}>
        {...Array.from({ length: 13 }).map((_, i)=> item(i + 13))}
      </>
      <\ width={1 / 3} stack={15}>
        {...Array.from({ length: 13 }).map((_, i)=> item(i + 26))}
      </>
    </>
  </>
)