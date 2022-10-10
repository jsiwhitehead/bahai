(
  group: (title, collections)=>
    <a stack={15}
      <a size={20} bold {title} />
      {...collections.map(k=>
        <a color="blue" underline={hover} link={"/prayers/" + toUrl(k)} {k} />
      )}
    />,
  !url[1] ? 
    <a stack={60}>
      <a size={34} bold underline align="center" "Prayers" />
      <a
        bar
        <a width={1 / 3} stack={40}>
          {group("Praise", ["Praise and Glorification", "Draw Hearts to Thee"])}
          {group("Assistance", ["Healing", "Forgiveness", "Tests and Difficulties"])}
        </a>
        <a width={1 / 3} stack={40}>
          {group("Individual", ["Individual Growth", "Service and Teaching"])}
          {group("Community", ["Collective Growth", "Advancing the Cause"])}
          {group("People", ["Children and Youth", "Babies and Infants", "Marriage", "Departed"])}
        </a>
        <a width={1 / 3} stack={40}>
          {group("Occasion", ["Gathering", "Morning", "Evening", "Calendar", "The Fast"])}
          {group("Special", ["Obligatory Prayers", "Special", "Nations", "Narrative"])}
        </a>
      />
    </a>
  :
    (
      collection: collections[url[1]],
      <a
        stack={60}
        <a stack={20}>
          <a color="blue" underline={hover} link="/prayers" "« Back" />
          <a size={34} bold underline align="center" {collection?.name} />
        </a>
        {...collection.items.map(render)}
      />
    )
)