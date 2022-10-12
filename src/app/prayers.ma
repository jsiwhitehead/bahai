(
  group: (title, collections)=>
    <\ stack={15}>
      <\ size={20} bold>{title}</>
      {...collections.map(k=>
        <\ color="blue" underline={hover} link={`/prayers/${toUrl(k)}`}>{k}</>
      )}
    </>,
  !url[1] ? 
    <\ stack={60}>
      <\ size={34} bold underline align="center">Prayers</>
      <\ bar>
        <\ width={1 / 3} stack={40}>
          {group("Praise", ["Praise and Glorification", "Draw Hearts to Thee"])}
          {group("Assistance", ["Healing", "Forgiveness", "Tests and Difficulties"])}
        </>
        <\ width={1 / 3} stack={40}>
          {group("Individual", ["Individual Growth", "Service and Teaching"])}
          {group("Community", ["Collective Growth", "Advancing the Cause"])}
          {group("People", ["Children and Youth", "Babies and Infants", "Marriage", "Departed"])}
        </>
        <\ width={1 / 3} stack={40}>
          {group("Occasion", ["Gathering", "Morning", "Evening", "Calendar", "The Fast"])}
          {group("Special", ["Obligatory Prayers", "Special", "Nations", "Narrative"])}
        </>
      </>
    </>
  :
    (
      collection: collections[url[1]],
      <\ stack={60}>
        <\ stack={20}>
          <\ color="blue" underline={hover} link="/prayers">« Back</>
          <\ size={34} bold underline align="center">{collection?.name}</>
        </>
        {...collection.items.map(render)}
      </>
    )
)