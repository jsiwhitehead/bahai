(
  item: (index)=>
    (
      id: `bible-${`${index + 39}`.padStart(3, '0')}`,
      <\ color="blue" underline={hover} link={`/doc/${id}`}>
        {index + 1}. {documents[id].title}
      </>
    ),
  <\ stack={60}>
    <\ size={40} bold underline align="center">The New Testament</>
    <\ bar>
      <\ width={1 / 3} stack={15}>
        {...Array.from({ length: 9 }).map((_, i)=> item(i))}
      </>
      <\ width={1 / 3} stack={15}>
        {...Array.from({ length: 9 }).map((_, i)=> item(i + 9))}
      </>
      <\ width={1 / 3} stack={15}>
        {...Array.from({ length: 9 }).map((_, i)=> item(i + 18))}
      </>
    </>
  </>
)